/**
 * Sync Queue Manager for ErgoSphere Admin Dashboard
 * 
 * This module manages the queue of changes made when PostgreSQL is unavailable,
 * and ensures they are synchronized back to the database when connection is restored.
 * 
 * Features:
 * - Persistent storage of changes in localStorage
 * - Automatic background synchronization when connection is restored
 * - Conflict resolution between local and remote changes
 * - Visual indicators for pending sync operations
 * - Detailed sync status reporting
 */

class SyncQueueManager {
    constructor() {
        this.config = {
            storagePrefix: 'ergoSphere_syncQueue_',
            queueStorageKey: 'pendingSync',
            maxRetries: 3,
            retryDelay: 2000,
            checkInterval: 60000, // Check connection every minute
            bulkSyncThreshold: 5, // Number of changes before using bulk sync
            conflictStrategy: 'lastModified', // Options: lastModified, remoteWins, localWins, merge
            debug: false
        };
        
        this.syncQueue = new Map(); // category -> changes array
        this.connectionMonitor = null;
        this.syncing = false;
        this.syncStats = {
            lastSyncAttempt: null,
            lastSuccessfulSync: null,
            failedSyncAttempts: 0,
            successfulSyncs: 0,
            pendingItems: 0
        };
        
        this._init();
    }
    
    async _init() {
        try {
            // Load stored queue from localStorage
            await this._loadQueueFromStorage();
            
            // Set up connection monitoring
            this._startConnectionMonitoring();
            
            // Set up events for page visibility changes to trigger sync when tab becomes active
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible' && this.hasPendingChanges()) {
                    this._scheduleBackgroundSync(5000); // Small delay after tab becomes active
                }
            });
            
            // Add visual indicators for pending changes
            this._createSyncStatusIndicator();
            
            this._log('Sync Queue Manager initialized');
            this._updateSyncStats();
        } catch (error) {
            console.error('Failed to initialize Sync Queue Manager:', error);
        }
    }
    
    /**
     * Public API: Add changes to the sync queue
     * @param {string} category - Data category (e.g., 'coop', 'loot')
     * @param {Array} changes - The data to be synced
     * @param {Object} metadata - Additional information about the changes
     * @returns {Promise<boolean>} - Success indicator
     */
    async queueChanges(category, changes, metadata = {}) {
        if (!category || !Array.isArray(changes)) {
            console.error('Invalid parameters for queueChanges');
            return false;
        }
        
        try {
            // Validate movie data if it's the movies category
            if (category === 'movies' && window.DataValidators) {
                console.log('Validating movie WATCHED fields before queuing...');
                changes = window.DataValidators.validateMoviesData(changes);
            }
            
            // Add timestamp and device identifier
            const queueItem = {
                data: changes,
                category,
                timestamp: new Date().toISOString(),
                deviceId: this._getDeviceIdentifier(),
                metadata: {
                    ...metadata,
                    source: 'fallback',
                    syncStatus: 'pending'
                }
            };
            
            // Add to memory queue
            if (!this.syncQueue.has(category)) {
                this.syncQueue.set(category, []);
            }
            this.syncQueue.get(category).push(queueItem);
            
            // Update stats
            this.syncStats.pendingItems++;
            
            // Save to localStorage
            await this._saveQueueToStorage();
            
            // Update UI indicators
            this._updateSyncIndicator();
            
            // Try to sync now if possible
            this._scheduleBackgroundSync();
            
            this._log(`Changes queued for category: ${category}`);
            return true;
        } catch (error) {
            console.error('Failed to queue changes:', error);
            return false;
        }
    }
    
    /**
     * Public API: Force synchronization of all pending changes
     * @returns {Promise<Object>} - Sync results
     */
    async forceSyncAllChanges() {
        if (this.syncing) {
            return { success: false, message: 'Sync already in progress' };
        }
        
        return this._performSync(true);
    }
    
    /**
     * Public API: Check if there are any pending changes
     * @param {string} [category] - Optional category to check
     * @returns {boolean} - True if there are pending changes
     */
    hasPendingChanges(category = null) {
        if (category) {
            return this.syncQueue.has(category) && this.syncQueue.get(category).length > 0;
        }
        
        return this.syncStats.pendingItems > 0;
    }
    
    /**
     * Public API: Get sync status information
     * @returns {Object} - Sync status details
     */
    getSyncStatus() {
        return {
            ...this.syncStats,
            pendingCategories: [...this.syncQueue.keys()],
            isSyncing: this.syncing
        };
    }
    
    /**
     * Public API: Clear all pending changes without syncing
     * @param {string} [category] - Optional category to clear
     * @returns {Promise<boolean>} - Success indicator
     */
    async clearPendingChanges(category = null) {
        if (category) {
            this.syncQueue.delete(category);
        } else {
            this.syncQueue.clear();
        }
        
        // Update stats
        this._updateSyncStats();
        
        // Update storage
        await this._saveQueueToStorage();
        
        // Update UI
        this._updateSyncIndicator();
        
        return true;
    }
    
    /**
     * Private: Load queued changes from localStorage
     * @private
     */
    async _loadQueueFromStorage() {
        try {
            const storedQueue = localStorage.getItem(this.config.storagePrefix + this.config.queueStorageKey);
            if (storedQueue) {
                const queueData = JSON.parse(storedQueue);
                
                // Convert the plain object back to a Map
                this.syncQueue = new Map(Object.entries(queueData));
                
                // Update stats
                this._updateSyncStats();
                this._log(`Loaded ${this.syncStats.pendingItems} pending items from storage`);
            }
        } catch (error) {
            console.error('Failed to load sync queue from storage:', error);
        }
    }
    
    /**
     * Private: Save queue to localStorage
     * @private
     */
    async _saveQueueToStorage() {
        try {
            // Convert Map to plain object for localStorage
            const queueObject = Object.fromEntries(this.syncQueue);
            localStorage.setItem(
                this.config.storagePrefix + this.config.queueStorageKey, 
                JSON.stringify(queueObject)
            );
        } catch (error) {
            console.error('Failed to save sync queue to storage:', error);
        }
    }
    
    /**
     * Private: Perform actual synchronization
     * @param {boolean} userInitiated - Whether the sync was manually triggered by user
     * @private
     */
    async _performSync(userInitiated = false) {
        if (this.syncing) {
            return { success: false, message: 'Sync already in progress' };
        }
        
        this.syncing = true;
        this._updateSyncIndicator();
        
        try {
            // Check if PostgreSQL is available
            const healthCheck = await this._checkConnection();
            if (!healthCheck.postgresql) {
                this._log('PostgreSQL unavailable, sync postponed');
                this.syncing = false;
                this._updateSyncIndicator();
                return { 
                    success: false, 
                    message: 'Database unavailable',
                    canRetry: true
                };
            }
            
            // Start syncing categories
            const results = {
                success: true,
                itemsSynced: 0,
                failedItems: 0,
                categoryResults: {}
            };
            
            this.syncStats.lastSyncAttempt = new Date();
            
            // Process each category
            for (const [category, queueItems] of this.syncQueue.entries()) {
                this._log(`Syncing ${queueItems.length} items for category: ${category}`);
                const categoryResult = await this._syncCategory(category, queueItems);
                results.categoryResults[category] = categoryResult;
                
                if (categoryResult.success) {
                    results.itemsSynced += categoryResult.itemsSynced;
                    // Remove synced items from queue
                    this.syncQueue.delete(category);
                } else {
                    results.failedItems += queueItems.length;
                    results.success = false;
                }
            }
            
            // Update stats based on results
            if (results.success) {
                this.syncStats.lastSuccessfulSync = new Date();
                this.syncStats.successfulSyncs++;
                this.syncStats.failedSyncAttempts = 0;
            } else {
                this.syncStats.failedSyncAttempts++;
            }
            
            // Update storage and stats
            await this._saveQueueToStorage();
            this._updateSyncStats();
            
            // Generate user-friendly message
            if (results.success) {
                results.message = `Successfully synced ${results.itemsSynced} items`;
            } else if (results.itemsSynced > 0) {
                results.message = `Partially synced ${results.itemsSynced} items, ${results.failedItems} items failed`;
                results.canRetry = true;
            } else {
                results.message = `Failed to sync ${results.failedItems} items`;
                results.canRetry = true;
            }
            
            return results;
            
        } catch (error) {
            console.error('Sync operation failed:', error);
            this.syncStats.failedSyncAttempts++;
            return { 
                success: false, 
                message: `Sync error: ${error.message}`,
                canRetry: true 
            };
        } finally {
            this.syncing = false;
            this._updateSyncIndicator();
        }
    }
    
    /**
     * Private: Sync a specific category
     * @param {string} category - The category to sync
     * @param {Array} queueItems - The queued items to sync
     * @private
     */
    async _syncCategory(category, queueItems) {
        if (!queueItems.length) {
            return { success: true, itemsSynced: 0 };
        }
        
        try {
            // For bulk sync, we merge all changes into one operation
            if (queueItems.length >= this.config.bulkSyncThreshold) {
                // Get the latest data for conflict resolution
                const latestData = await this._fetchLatestData(category);
                
                // Resolve conflicts and merge changes
                const mergedData = this._resolveConflicts(queueItems, latestData);
                
                // Save merged data
                const success = await this._saveToPostgreSQL(category, mergedData);
                
                return {
                    success,
                    itemsSynced: success ? queueItems.length : 0,
                    bulkSync: true
                };
            }
            // For smaller batches, process individually
            else {
                let successCount = 0;
                
                for (const item of queueItems) {
                    // Get latest data for this specific operation
                    const latestData = await this._fetchLatestData(category);
                    
                    // Merge this specific change with latest data
                    const mergedData = this._resolveConflicts([item], latestData);
                    
                    // Save merged data
                    const success = await this._saveToPostgreSQL(category, mergedData);
                    
                    if (success) {
                        successCount++;
                    }
                }
                
                return {
                    success: successCount === queueItems.length,
                    itemsSynced: successCount,
                    bulkSync: false
                };
            }
        } catch (error) {
            console.error(`Failed to sync category ${category}:`, error);
            return { 
                success: false, 
                itemsSynced: 0,
                error: error.message 
            };
        }
    }
    
    /**
     * Private: Handle conflict resolution between local and remote data
     * @param {Array} queueItems - Local changes to apply
     * @param {Array} remoteData - Current data from PostgreSQL
     * @returns {Array} - Merged data
     * @private
     */
    _resolveConflicts(queueItems, remoteData) {
        // Start with the remote data as the base
        let resultData = [...remoteData];
        
        // Sort queue items by timestamp (oldest first)
        const sortedItems = queueItems.sort((a, b) => {
            return new Date(a.timestamp) - new Date(b.timestamp);
        });
        
        // For each queued change, apply according to conflict strategy
        for (const item of sortedItems) {
            switch (this.config.conflictStrategy) {
                case 'remoteWins':
                    // Remote data is already the base, only apply non-conflicting changes
                    this._applyNonConflictingChanges(item.data, resultData);
                    break;
                    
                case 'localWins':
                    // Override remote with local data
                    resultData = this._mergeWithLocalPriority(item.data, resultData);
                    break;
                    
                case 'merge':
                    // Deep merge objects by identifier
                    resultData = this._deepMergeById(item.data, resultData);
                    break;
                    
                case 'lastModified':
                default:
                    // Apply changes based on most recent modification timestamp
                    resultData = this._mergeByTimestamp(item.data, resultData);
                    break;
            }
        }
        
        return resultData;
    }
    
    /**
     * Private: Apply only changes that don't conflict with remote data
     * @private
     */
    _applyNonConflictingChanges(localData, remoteData) {
        // Implementation depends on data structure
        // This is a simplified version assuming items have unique IDs
        const remoteIds = new Set(remoteData.map(item => item.id));
        
        // Add only items that don't exist in remote
        localData.forEach(localItem => {
            if (!remoteIds.has(localItem.id)) {
                remoteData.push(localItem);
            }
        });
        
        return remoteData;
    }
    
    /**
     * Private: Give local changes priority over remote data
     * @private
     */
    _mergeWithLocalPriority(localData, remoteData) {
        // Local completely replaces remote with same ID
        const remoteById = new Map();
        remoteData.forEach(item => remoteById.set(item.id, item));
        
        localData.forEach(localItem => {
            remoteById.set(localItem.id, localItem);
        });
        
        return Array.from(remoteById.values());
    }
    
    /**
     * Private: Deep merge objects by ID
     * @private
     */
    _deepMergeById(localData, remoteData) {
        const remoteById = new Map();
        remoteData.forEach(item => remoteById.set(item.id, item));
        
        localData.forEach(localItem => {
            if (remoteById.has(localItem.id)) {
                // Merge properties
                const remoteItem = remoteById.get(localItem.id);
                remoteById.set(localItem.id, {...remoteItem, ...localItem});
            } else {
                // New item
                remoteById.set(localItem.id, localItem);
            }
        });
        
        return Array.from(remoteById.values());
    }
    
    /**
     * Private: Merge based on timestamp (most recent wins)
     * @private
     */
    _mergeByTimestamp(localData, remoteData) {
        // This assumes items have modifiedAt or timestamp property
        const resultById = new Map();
        
        // First add all remote items
        remoteData.forEach(item => {
            resultById.set(item.id, item);
        });
        
        // Then override with local items if they're more recent
        localData.forEach(localItem => {
            if (!resultById.has(localItem.id)) {
                // New item, always add
                resultById.set(localItem.id, localItem);
            } else {
                // Compare timestamps
                const remoteItem = resultById.get(localItem.id);
                const localTimestamp = new Date(localItem.modifiedAt || localItem.timestamp || 0);
                const remoteTimestamp = new Date(remoteItem.modifiedAt || remoteItem.timestamp || 0);
                
                if (localTimestamp > remoteTimestamp) {
                    resultById.set(localItem.id, localItem);
                }
            }
        });
        
        return Array.from(resultById.values());
    }
      /**
     * Private: Fetch latest data from PostgreSQL for a category
     * @param {string} category - The category to fetch
     * @returns {Promise<Array>} - The latest data
     * @private
     */
    async _fetchLatestData(category) {
        try {
            if (window.AdminDashboardDataLoader && typeof window.AdminDashboardDataLoader.loadFromPostgreSQL === 'function') {
                return await window.AdminDashboardDataLoader.loadFromPostgreSQL(category);
            }
            
            // Fallback to fetch method with environment detection
            const isHeroku = window.location.hostname.includes('herokuapp.com');
            const baseUrl = isHeroku ? 'https://ergosphere-02b692b18f50.herokuapp.com' : '';
            const endpoints = [`${baseUrl}/api/data`];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(`${endpoint}/${category}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    
                    const data = await response.json();
                    return Array.isArray(data) ? data : [];
                    
                } catch (error) {
                    console.warn(`Fetch latest data failed for endpoint ${endpoint}:`, error.message);
                }
            }
            
            throw new Error('All endpoints failed');
            
        } catch (error) {
            console.error(`Failed to fetch latest data for ${category}:`, error);
            return []; // Return empty array as fallback
        }
    }
    
    /**
     * Private: Save data to PostgreSQL
     * @param {string} category - The category to save
     * @param {Array} data - The data to save
     * @returns {Promise<boolean>} - Success indicator
     * @private
     */
    async _saveToPostgreSQL(category, data) {
        try {
            if (window.AdminDashboardDataLoader && typeof window.AdminDashboardDataLoader.saveToPostgreSQL === 'function') {
                await window.AdminDashboardDataLoader.saveToPostgreSQL(category, data);
                return true;
            }
              // Fallback to fetch method with environment detection
            const isHeroku = window.location.hostname.includes('herokuapp.com');
            const baseUrl = isHeroku ? 'https://ergosphere-02b692b18f50.herokuapp.com' : '';
            const endpoints = [`${baseUrl}/api/data`];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(`${endpoint}/${category}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    
                    return true;
                    
                } catch (error) {
                    console.warn(`Save to PostgreSQL failed for endpoint ${endpoint}:`, error.message);
                }
            }
            
            throw new Error('All endpoints failed');
            
        } catch (error) {
            console.error(`Failed to save data for ${category} to PostgreSQL:`, error);
            return false;
        }
    }
    /**
     * Private: Check if PostgreSQL is available
     * @returns {Promise<Object>} - Health check results
     * @private
     */
    async _checkConnection() {
        try {
            // Direct health check implementation without calling AdminDashboardDataLoader to avoid circular dependency
            const result = { postgresql: false, jsonFiles: false, cached: false };
            
            try {
                // Auto-detect environment
                const isHeroku = window.location.hostname.includes('herokuapp.com');
                const baseUrl = isHeroku ? 'https://ergosphere-02b692b18f50.herokuapp.com' : '';
                const healthEndpoint = isHeroku ? '/api/health' : '/api/status';
                
                const response = await fetch(`${baseUrl}${healthEndpoint}`, { 
                    signal: AbortSignal.timeout(3000) // 3 second timeout
                });
                
                result.postgresql = response.ok;
                
                // Check if there's cached data available
                result.cached = window.AdminDashboardDataLoader && 
                               window.AdminDashboardDataLoader.cachedData &&
                               window.AdminDashboardDataLoader.cachedData.size > 0;
            } catch (error) {
                result.postgresql = false;
            }
            
            return result;
            
        } catch (error) {
            console.error('Connection check failed:', error);
            return { postgresql: false, jsonFiles: false, cached: false };
        }
    }
    
    /**
     * Private: Start monitoring connection status
     * @private
     */
    _startConnectionMonitoring() {
        // Clear existing interval if any
        if (this.connectionMonitor) {
            clearInterval(this.connectionMonitor);
        }
        
        // Set up new monitoring interval
        this.connectionMonitor = setInterval(async () => {
            // Only check if we have pending changes
            if (this.hasPendingChanges()) {
                const health = await this._checkConnection();
                
                // If PostgreSQL is available and we have pending changes, try to sync
                if (health.postgresql && !this.syncing) {
                    this._scheduleBackgroundSync();
                }
            }
        }, this.config.checkInterval);
    }
    
    /**
     * Private: Schedule a background sync
     * @param {number} [delay=0] - Optional delay in ms
     * @private
     */
    _scheduleBackgroundSync(delay = 0) {
        if (this.syncing) return;
        
        setTimeout(async () => {
            // Only perform sync if we have pending changes and not already syncing
            if (this.hasPendingChanges() && !this.syncing) {
                await this._performSync(false);
            }
        }, delay);
    }
    
    /**
     * Private: Create or update sync status indicator in the UI
     * @private
     */
    _createSyncStatusIndicator() {
        // Create indicator if it doesn't exist
        let indicator = document.getElementById('sync-queue-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'sync-queue-indicator';
            indicator.className = 'sync-queue-indicator';
            
            // Add click handler to show details
            indicator.addEventListener('click', () => {
                this._showSyncQueueDetails();
            });
            
            // Append to body (will be positioned with CSS)
            document.body.appendChild(indicator);
        }
        
        // Update indicator based on current state
        this._updateSyncIndicator();
    }
    
    /**
     * Private: Update the sync indicator appearance
     * @private
     */
    _updateSyncIndicator() {
        const indicator = document.getElementById('sync-queue-indicator');
        if (!indicator) return;
        
        if (this.syncing) {
            indicator.className = 'sync-queue-indicator syncing';
            indicator.innerHTML = `
                <div class="sync-spinner"></div>
                <span class="sync-count">Syncing...</span>
            `;
        } else if (this.hasPendingChanges()) {
            indicator.className = 'sync-queue-indicator pending';
            indicator.innerHTML = `
                <span class="sync-count">${this.syncStats.pendingItems}</span>
            `;
        } else {
            indicator.className = 'sync-queue-indicator hidden';
            
            // Hide after a delay
            setTimeout(() => {
                if (!this.hasPendingChanges() && !this.syncing) {
                    indicator.className = 'sync-queue-indicator hidden';
                }
            }, 2000);
        }
    }
    
    /**
     * Private: Show detailed information about pending sync items
     * @private
     */
    _showSyncQueueDetails() {
        // Remove existing dialog if any
        let existingDialog = document.getElementById('sync-queue-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }
        
        // Create new dialog
        const dialog = document.createElement('div');
        dialog.id = 'sync-queue-dialog';
        dialog.className = 'sync-queue-dialog';
        
        // Generate content
        let content = `
            <div class="sync-dialog-header">
                <h3>Sync Queue Status</h3>
                <button class="sync-dialog-close">×</button>
            </div>
            <div class="sync-dialog-content">
                <div class="sync-status-summary">
                    <div class="sync-stat">
                        <span class="sync-stat-label">Pending Items:</span>
                        <span class="sync-stat-value">${this.syncStats.pendingItems}</span>
                    </div>
                    <div class="sync-stat">
                        <span class="sync-stat-label">Last Sync Attempt:</span>
                        <span class="sync-stat-value">${this.syncStats.lastSyncAttempt ? this._formatDate(this.syncStats.lastSyncAttempt) : 'Never'}</span>
                    </div>
                    <div class="sync-stat">
                        <span class="sync-stat-label">Last Successful Sync:</span>
                        <span class="sync-stat-value">${this.syncStats.lastSuccessfulSync ? this._formatDate(this.syncStats.lastSuccessfulSync) : 'Never'}</span>
                    </div>
                </div>
        `;
        
        // Add pending items details
        if (this.syncQueue.size > 0) {
            content += `<div class="sync-pending-categories">`;
            for (const [category, items] of this.syncQueue.entries()) {
                content += `
                    <div class="sync-category">
                        <div class="sync-category-header">
                            <span class="sync-category-name">${category}</span>
                            <span class="sync-category-count">${items.length} items</span>
                        </div>
                        <div class="sync-category-timestamp">
                            Last change: ${this._formatDate(items[items.length - 1].timestamp)}
                        </div>
                    </div>
                `;
            }
            content += `</div>`;
            
            content += `
                <div class="sync-actions">
                    <button id="force-sync-btn" class="sync-action-btn">Sync Now</button>
                    <button id="clear-sync-queue-btn" class="sync-action-btn danger">Clear Queue</button>
                </div>
            `;
        } else {
            content += `<p class="sync-no-items">No pending sync items</p>`;
        }
        
        content += `</div>`;
        dialog.innerHTML = content;
        
        // Add to DOM
        document.body.appendChild(dialog);
        
        // Add event listeners
        dialog.querySelector('.sync-dialog-close').addEventListener('click', () => {
            dialog.classList.add('closing');
            setTimeout(() => dialog.remove(), 300);
        });
        
        // Force sync button
        const forceSyncBtn = dialog.querySelector('#force-sync-btn');
        if (forceSyncBtn) {
            forceSyncBtn.addEventListener('click', async () => {
                forceSyncBtn.disabled = true;
                forceSyncBtn.textContent = 'Syncing...';
                
                const result = await this.forceSyncAllChanges();
                
                if (result.success) {
                    this._showToast('Sync completed successfully!', 'success');
                    dialog.remove();
                } else {
                    this._showToast(`Sync failed: ${result.message}`, 'error');
                    forceSyncBtn.disabled = false;
                    forceSyncBtn.textContent = 'Try Again';
                }
            });
        }
        
        // Clear queue button
        const clearQueueBtn = dialog.querySelector('#clear-sync-queue-btn');
        if (clearQueueBtn) {
            clearQueueBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to clear all pending changes? This cannot be undone.')) {
                    await this.clearPendingChanges();
                    this._showToast('Sync queue cleared', 'info');
                    dialog.remove();
                }
            });
        }
        
        // Show dialog with animation
        setTimeout(() => dialog.classList.add('visible'), 10);
    }
    
    /**
     * Private: Show toast notification
     * @param {string} message - Message to display
     * @param {string} [type='info'] - Type of toast
     * @private
     */
    _showToast(message, type = 'info') {
        // Use dashboard's showMessage if available
        if (window.dashboard && typeof window.dashboard.showMessage === 'function') {
            window.dashboard.showMessage(message);
            return;
        }
        
        // Create our own toast otherwise
        const toast = document.createElement('div');
        toast.className = `sync-toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    /**
     * Private: Update sync statistics
     * @private
     */
    _updateSyncStats() {
        let pendingCount = 0;
        
        for (const [category, items] of this.syncQueue.entries()) {
            pendingCount += items.length;
        }
        
        this.syncStats.pendingItems = pendingCount;
    }
    
    /**
     * Private: Format date for display
     * @param {Date|string} date - Date to format
     * @returns {string} - Formatted date
     * @private
     */
    _formatDate(date) {
        if (!date) return 'Never';
        
        const d = typeof date === 'string' ? new Date(date) : date;
        
        return d.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    /**
     * Private: Generate a pseudo-unique device identifier
     * @returns {string} - Device identifier
     * @private
     */
    _getDeviceIdentifier() {
        let deviceId = localStorage.getItem('ergoSphere_deviceId');
        
        if (!deviceId) {
            // Generate simple ID (uuid would be better but avoiding dependencies)
            deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + 
                '_' + Date.now().toString(36);
            localStorage.setItem('ergoSphere_deviceId', deviceId);
        }
        
        return deviceId;
    }
    
    /**
     * Private: Log debug messages
     * @private
     */
    _log(message) {
        if (this.config.debug) {
            console.log(`[SyncQueue] ${message}`);
        }
    }
}

// Create CSS styles for sync queue indicators
function createSyncQueueStyles() {
    // Check if styles already exist
    if (document.getElementById('sync-queue-styles')) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'sync-queue-styles';
    styleSheet.innerHTML = `
        .sync-queue-indicator {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: #3498db;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 1000;
            font-weight: bold;
            font-size: 16px;
            opacity: 1;
        }
        
        .sync-queue-indicator.hidden {
            transform: scale(0);
            opacity: 0;
        }
        
        .sync-queue-indicator.pending {
            background: #f39c12;
        }
        
        .sync-queue-indicator.syncing {
            background: #3498db;
        }
        
        .sync-queue-indicator.error {
            background: #e74c3c;
        }
        
        .sync-queue-indicator:hover {
            transform: scale(1.1);
        }
        
        .sync-spinner {
            width: 24px;
            height: 24px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .sync-queue-dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            width: 95%;
            max-width: 450px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 5px 30px rgba(0,0,0,0.3);
            z-index: 1001;
            opacity: 0;
            transition: all 0.3s ease;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
        }
        
        .sync-queue-dialog.visible {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        
        .sync-dialog-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
        }
        
        .sync-dialog-header h3 {
            margin: 0;
            color: #333;
        }
        
        .sync-dialog-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
        }
        
        .sync-dialog-content {
            padding: 20px;
            overflow-y: auto;
            max-height: 70vh;
        }
        
        .sync-status-summary {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 6px;
        }
        
        .sync-stat {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .sync-stat-label {
            color: #666;
        }
        
        .sync-stat-value {
            font-weight: 600;
        }
        
        .sync-pending-categories {
            margin: 20px 0;
        }
        
        .sync-category {
            padding: 12px 15px;
            background: #f2f6fa;
            border-left: 4px solid #3498db;
            margin-bottom: 10px;
            border-radius: 4px;
        }
        
        .sync-category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .sync-category-name {
            font-weight: 600;
            color: #333;
        }
        
        .sync-category-count {
            background: #3498db;
            color: white;
            padding: 2px 8px;
            border-radius: 20px;
            font-size: 12px;
        }
        
        .sync-category-timestamp {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        
        .sync-actions {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }
        
        .sync-action-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .sync-action-btn:not(.danger) {
            background: #3498db;
            color: white;
        }
        
        .sync-action-btn:not(.danger):hover {
            background: #2980b9;
        }
        
        .sync-action-btn.danger {
            background: #fff;
            color: #e74c3c;
            border: 1px solid #e74c3c;
        }
        
        .sync-action-btn.danger:hover {
            background: #fef5f5;
        }
        
        .sync-action-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .sync-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            box-shadow: 0 2px 10px rgba(0,0,0,0.15);
            z-index: 2000;
            transform: translateY(-10px);
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .sync-toast.visible {
            transform: translateY(0);
            opacity: 1;
        }
        
        .sync-toast.info {
            background: #3498db;
        }
        
        .sync-toast.success {
            background: #2ecc71;
        }
        
        .sync-toast.error {
            background: #e74c3c;
        }
        
        .sync-no-items {
            text-align: center;
            color: #666;
            font-style: italic;
            margin: 20px 0;
        }
    `;
    document.head.appendChild(styleSheet);
}

// Initialize the class
document.addEventListener('DOMContentLoaded', () => {
    // Wait for dashboard and enhanced loader to initialize
    setTimeout(() => {
        createSyncQueueStyles();
        
        // Initialize the sync queue manager
        window.SyncQueueManager = new SyncQueueManager();
        
        console.log('Sync Queue Manager initialized');
        
        // Integrate with EnhancedPostgreSQLLoader if available
        if (window.AdminDashboardDataLoader) {
            const originalSaveData = window.AdminDashboardDataLoader.saveData;
            
            // Override saveData to automatically queue changes when PostgreSQL is unavailable
            window.AdminDashboardDataLoader.saveData = async function(category, data) {
                try {
                    // Try direct save first
                    const success = await originalSaveData.call(this, category, data);
                    
                    if (!success && window.SyncQueueManager) {
                        // If direct save failed, queue the changes
                        console.log(`PostgreSQL save failed for ${category}, queueing changes`);
                        await window.SyncQueueManager.queueChanges(category, data);
                        
                        // Return true since we've queued the changes
                        return true;
                    }
                    
                    return success;
                    
                } catch (error) {
                    console.error('Save failed:', error);
                    
                    // Queue changes on error
                    if (window.SyncQueueManager) {
                        console.log(`PostgreSQL save error, queueing changes`);
                        await window.SyncQueueManager.queueChanges(category, data);
                        return true;
                    }
                    
                    return false;
                }
            };
        }
    }, 2000);
});
