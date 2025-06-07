/**
 * ErgoSphere Admin Dashboard JavaScript
 * Modern admin interface for managing STATUS, copies, WATCHED, and TIMES SEEN data
 */

class AdminDashboard {
    constructor() {
        this.currentCategory = 'coop';
        this.currentData = [];
        this.modifiedItems = new Set();
        this.selectedItems = new Set();
        this.isConnected = false;
        this.websocket = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.establishConnection();
        this.loadCategoryData('coop');
        this.updateConnectionStatus();
    }

    setupEventListeners() {
        // Category selection
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.switchCategory(category);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            this.filterData(e.target.value);
        });

        document.getElementById('clear-search').addEventListener('click', () => {
            searchInput.value = '';
            this.filterData('');
        });

        // Filter and sort
        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.applyFilters();
        });

        document.getElementById('sort-options').addEventListener('change', (e) => {
            this.sortData(e.target.value);
        });

        // Action buttons
        document.getElementById('refresh-data').addEventListener('click', () => {
            this.refreshCurrentCategory();
        });

        document.getElementById('manual-sync').addEventListener('click', () => {
            this.performManualSync();
        });

        document.getElementById('save-all').addEventListener('click', () => {
            this.saveAllChanges();
        });

        document.getElementById('bulk-actions').addEventListener('click', () => {
            this.showBulkModal();
        });

        // Select all checkbox
        document.getElementById('select-all').addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });

        // Bulk modal events
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.hideBulkModal();
        });

        document.querySelectorAll('.bulk-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.executeBulkAction(e.target.dataset.action);
            });
        });

        // Sidebar toggle for mobile
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });

        // Close modal on backdrop click
        document.getElementById('bulk-modal').addEventListener('click', (e) => {
            if (e.target.id === 'bulk-modal') {
                this.hideBulkModal();
            }
        });
    }

    async establishConnection() {
        try {
            // Test database connection
            const response = await fetch('/api/options');
            this.isConnected = response.ok;
            
            // Setup WebSocket for real-time updates
            this.setupWebSocket();
            
            this.updateConnectionStatus();
        } catch (error) {
            console.error('Connection failed:', error);
            this.isConnected = false;
            this.updateConnectionStatus();
        }
    }

    setupWebSocket() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
            this.websocket = new WebSocket(`${protocol}//${window.location.hostname}:${port}`);
            
            this.websocket.onopen = () => {
                console.log('WebSocket connected');
            };
            
            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleRealTimeUpdate(data);
            };
            
            this.websocket.onclose = () => {
                console.log('WebSocket disconnected, attempting reconnect...');
                setTimeout(() => this.setupWebSocket(), 5000);
            };
        } catch (error) {
            console.error('WebSocket setup failed:', error);
        }
    }

    updateConnectionStatus() {
        const indicator = document.getElementById('connection-indicator');
        const text = document.getElementById('connection-text');
        
        if (this.isConnected) {
            indicator.textContent = '🟢';
            text.textContent = 'Connected';
        } else {
            indicator.textContent = '🔴';
            text.textContent = 'Disconnected';
        }
    }

    async switchCategory(category) {
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        this.currentCategory = category;
        await this.loadCategoryData(category);
        
        // Update title
        const titles = {
            coop: '🎮 CO-OP Games',
            loot: '📦 LOOT Boxes',
            pvp: '⚔️ PVP Games',
            movies: '🎬 Movies',
            anime: '🎌 Anime',
            youtube: '📺 YouTube',
            sundaymorning: '🌅 Sunday Morning',
            sundaynight: '🌙 Sunday Night',
            singleplayer: '🎯 Single Player'
        };
        document.getElementById('category-title').textContent = titles[category];
    }

    async loadCategoryData(category) {
        this.showLoading();
        
        try {
            let data;
            const categoryBtn = document.querySelector(`[data-category="${category}"]`);
            const table = categoryBtn.dataset.table;
            
            if (table === 'loot_items') {
                // Load from loot_items table
                const response = await fetch('/api/loot');
                data = await response.json();
            } else {
                // Load from json_data table or fallback to JSON files
                try {
                    const response = await fetch(`/api/data/${category}`);
                    if (response.ok) {
                        data = await response.json();
                    } else {
                        // Fallback to JSON file
                        const jsonResponse = await fetch(`../../data/${category}.json`);
                        data = await jsonResponse.json();
                    }
                } catch (error) {
                    // Fallback to JSON file
                    const jsonResponse = await fetch(`../../data/${category}.json`);
                    data = await jsonResponse.json();
                }
            }
            
            this.currentData = data;
            this.renderTable();
            this.updateStats();
            
        } catch (error) {
            console.error('Failed to load category data:', error);
            this.showError('Failed to load data. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    renderTable() {
        const tbody = document.getElementById('table-body');
        const categoryBtn = document.querySelector(`[data-category="${this.currentCategory}"]`);
        const dataType = categoryBtn.dataset.type;
        
        tbody.innerHTML = '';
        
        if (this.currentData.length === 0) {
            this.showEmpty();
            return;
        }
        
        this.hideEmpty();
        
        this.currentData.forEach((item, index) => {
            const row = this.createTableRow(item, index, dataType);
            tbody.appendChild(row);
        });
    }

    createTableRow(item, index, dataType) {
        const row = document.createElement('tr');
        row.dataset.index = index;
        
        // Determine item properties based on data structure
        const isLoot = this.currentCategory === 'loot';
        const name = isLoot ? item.text : (item.TITLE || item.Title || item.text);
        const status = isLoot ? (item.copies > 0 ? '🟢' : '🔴') : (item.STATUS || '');
        const copies = isLoot ? item.copies : (item.copies || 0);
        const watched = item.WATCHED || item.watched || item.times_seen || 0;
        
        row.innerHTML = `
            <td class="col-checkbox">
                <input type="checkbox" class="row-checkbox" data-index="${index}">
            </td>
            <td class="col-name">
                <div class="item-name" title="${name}">${name}</div>
            </td>
            <td class="col-status">
                ${dataType === 'status' ? 
                    `<button class="table-action-btn toggle-btn" data-index="${index}">
                        ${status === '🟢' ? '🟢 Active' : '🔴 Inactive'}
                    </button>` :
                    `<span class="${status === '🟢' ? 'status-active' : 'status-inactive'}">${status || 'N/A'}</span>`
                }
            </td>
            <td class="col-copies">
                ${dataType === 'copies' ? 
                    `<div class="number-controls">
                        <button class="number-btn" data-action="decrease" data-index="${index}">-</button>
                        <input type="number" class="editable-field copies-field" 
                               value="${copies}" min="0" data-index="${index}" data-field="copies">
                        <button class="number-btn" data-action="increase" data-index="${index}">+</button>
                    </div>` :
                    `<span class="${this.getCopiesClass(copies)}">${copies}</span>`
                }
            </td>
            <td class="col-watched">
                <div class="number-controls">
                    <button class="number-btn" data-action="decrease-watched" data-index="${index}">-</button>
                    <input type="number" class="editable-field watched-field" 
                           value="${watched}" min="0" data-index="${index}" data-field="watched">
                    <button class="number-btn" data-action="increase-watched" data-index="${index}">+</button>
                </div>
            </td>
            <td class="col-actions">
                <button class="table-action-btn edit-btn" data-index="${index}">✏️ Edit</button>
            </td>
        `;
        
        this.attachRowEventListeners(row, index);
        return row;
    }

    attachRowEventListeners(row, index) {
        // Checkbox selection
        const checkbox = row.querySelector('.row-checkbox');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.selectedItems.add(index);
            } else {
                this.selectedItems.delete(index);
            }
            this.updateSelectAllState();
        });

        // Status toggle
        const toggleBtn = row.querySelector('.toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleItemStatus(index);
            });
        }

        // Number controls
        row.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleNumberControl(action, index);
            });
        });

        // Editable fields
        row.querySelectorAll('.editable-field').forEach(field => {
            field.addEventListener('change', (e) => {
                this.updateItemField(index, e.target.dataset.field, e.target.value);
            });
        });

        // Edit button
        const editBtn = row.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            this.editItem(index);
        });
    }

    getCopiesClass(copies) {
        if (copies === 0) return 'copies-zero';
        if (copies < 3) return 'copies-low';
        return 'copies-high';
    }

    toggleItemStatus(index) {
        const item = this.currentData[index];
        const isLoot = this.currentCategory === 'loot';
        
        if (isLoot) {
            // For loot items, toggle copies between 0 and 1
            item.copies = item.copies > 0 ? 0 : 1;
        } else {
            // For media items, toggle STATUS
            item.STATUS = item.STATUS === '🟢' ? '' : '🟢';
        }
        
        this.markAsModified(index);
        this.renderTable();
    }

    handleNumberControl(action, index) {
        const item = this.currentData[index];
        
        switch (action) {
            case 'decrease':
                if (item.copies > 0) {
                    item.copies--;
                    this.markAsModified(index);
                }
                break;
            case 'increase':
                item.copies++;
                this.markAsModified(index);
                break;
            case 'decrease-watched':
                const currentWatched = item.WATCHED || item.watched || item.times_seen || 0;
                if (currentWatched > 0) {
                    this.updateItemField(index, 'watched', currentWatched - 1);
                }
                break;
            case 'increase-watched':
                const watched = item.WATCHED || item.watched || item.times_seen || 0;
                this.updateItemField(index, 'watched', watched + 1);
                break;
        }
        
        this.renderTable();
    }

    updateItemField(index, field, value) {
        const item = this.currentData[index];
        const numValue = parseInt(value, 10) || 0;
        
        switch (field) {
            case 'copies':
                item.copies = Math.max(0, numValue);
                break;
            case 'watched':
                // Handle different field names for times seen
                if (item.WATCHED !== undefined) {
                    item.WATCHED = Math.max(0, numValue);
                } else if (item.watched !== undefined) {
                    item.watched = Math.max(0, numValue);
                } else {
                    item.times_seen = Math.max(0, numValue);
                }
                break;
        }
        
        this.markAsModified(index);
        this.updateStats();
    }

    markAsModified(index) {
        this.modifiedItems.add(index);
        this.updateStats();
        
        // Add visual indication
        const row = document.querySelector(`tr[data-index="${index}"]`);
        if (row) {
            row.style.background = 'rgba(251, 191, 36, 0.1)';
            row.style.borderLeft = '3px solid #fbbf24';
        }
    }

    updateStats() {
        const total = this.currentData.length;
        const active = this.currentData.filter(item => {
            if (this.currentCategory === 'loot') {
                return item.copies > 0;
            }
            return item.STATUS === '🟢';
        }).length;
        const modified = this.modifiedItems.size;
        
        document.getElementById('total-items').textContent = `${total} items`;
        document.getElementById('active-items').textContent = `${active} active`;
        document.getElementById('modified-items').textContent = `${modified} modified`;
    }

    filterData(searchTerm) {
        const rows = document.querySelectorAll('#table-body tr');
        const term = searchTerm.toLowerCase();
        
        rows.forEach(row => {
            const name = row.querySelector('.item-name').textContent.toLowerCase();
            const visible = name.includes(term);
            row.style.display = visible ? '' : 'none';
        });
    }

    applyFilters() {
        const statusFilter = document.getElementById('status-filter').value;
        const rows = document.querySelectorAll('#table-body tr');
        
        rows.forEach(row => {
            const index = row.dataset.index;
            const item = this.currentData[index];
            let visible = true;
            
            switch (statusFilter) {
                case 'active':
                    if (this.currentCategory === 'loot') {
                        visible = item.copies > 0;
                    } else {
                        visible = item.STATUS === '🟢';
                    }
                    break;
                case 'inactive':
                    if (this.currentCategory === 'loot') {
                        visible = item.copies === 0;
                    } else {
                        visible = item.STATUS !== '🟢';
                    }
                    break;
                default:
                    visible = true;
            }
            
            row.style.display = visible ? '' : 'none';
        });
    }

    sortData(sortBy) {
        switch (sortBy) {
            case 'name':
                this.currentData.sort((a, b) => {
                    const nameA = (a.text || a.TITLE || a.Title || '').toLowerCase();
                    const nameB = (b.text || b.TITLE || b.Title || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                break;
            case 'status':
                this.currentData.sort((a, b) => {
                    const statusA = this.currentCategory === 'loot' ? (a.copies > 0 ? 1 : 0) : (a.STATUS === '🟢' ? 1 : 0);
                    const statusB = this.currentCategory === 'loot' ? (b.copies > 0 ? 1 : 0) : (b.STATUS === '🟢' ? 1 : 0);
                    return statusB - statusA;
                });
                break;
            case 'copies':
                this.currentData.sort((a, b) => (b.copies || 0) - (a.copies || 0));
                break;
            case 'watched':
                this.currentData.sort((a, b) => {
                    const watchedA = a.WATCHED || a.watched || a.times_seen || 0;
                    const watchedB = b.WATCHED || b.watched || b.times_seen || 0;
                    return watchedB - watchedA;
                });
                break;
        }
        
        this.renderTable();
    }

    async refreshCurrentCategory() {
        this.showSyncIndicator();
        await this.loadCategoryData(this.currentCategory);
        this.hideSyncIndicator();
        this.showToast('Data refreshed successfully', '🔄');
    }

    async saveAllChanges() {
        if (this.modifiedItems.size === 0) {
            this.showToast('No changes to save', '💭');
            return;
        }

        this.showSyncIndicator();
        
        try {
            const categoryBtn = document.querySelector(`[data-category="${this.currentCategory}"]`);
            const table = categoryBtn.dataset.table;
            
            if (table === 'loot_items') {
                // Save to loot_items table
                for (const index of this.modifiedItems) {
                    const item = this.currentData[index];
                    await fetch(`/api/loot/${item.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item)
                    });
                }
            } else {
                // Save to json_data table or JSON file
                const response = await fetch(`/api/data/${this.currentCategory}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.currentData)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to save data');
                }
            }
            
            this.modifiedItems.clear();
            this.updateStats();
            this.renderTable(); // Remove visual modifications
            this.showToast('Changes saved successfully', '✅');
            
            // Broadcast update to HCMC and other pages
            this.broadcastUpdate();
            
        } catch (error) {
            console.error('Failed to save changes:', error);
            this.showToast('Failed to save changes', '❌');
        } finally {
            this.hideSyncIndicator();
        }
    }

    broadcastUpdate() {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
                type: 'adminUpdate',
                category: this.currentCategory,
                data: this.currentData
            }));
        }
    }

    toggleSelectAll(checked) {
        this.selectedItems.clear();
        
        if (checked) {
            this.currentData.forEach((_, index) => {
                this.selectedItems.add(index);
            });
        }
        
        document.querySelectorAll('.row-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    updateSelectAllState() {
        const selectAll = document.getElementById('select-all');
        const totalCheckboxes = document.querySelectorAll('.row-checkbox').length;
        
        if (this.selectedItems.size === 0) {
            selectAll.indeterminate = false;
            selectAll.checked = false;
        } else if (this.selectedItems.size === totalCheckboxes) {
            selectAll.indeterminate = false;
            selectAll.checked = true;
        } else {
            selectAll.indeterminate = true;
            selectAll.checked = false;
        }
    }

    showBulkModal() {
        if (this.selectedItems.size === 0) {
            this.showToast('Please select items first', '⚠️');
            return;
        }
        
        document.getElementById('selected-count').textContent = this.selectedItems.size;
        document.getElementById('bulk-modal').classList.remove('hidden');
    }

    hideBulkModal() {
        document.getElementById('bulk-modal').classList.add('hidden');
    }

    async executeBulkAction(action) {
        const selectedIndexes = Array.from(this.selectedItems);
        
        selectedIndexes.forEach(index => {
            const item = this.currentData[index];
            
            switch (action) {
                case 'activate':
                    if (this.currentCategory === 'loot') {
                        item.copies = Math.max(1, item.copies);
                    } else {
                        item.STATUS = '🟢';
                    }
                    break;
                case 'deactivate':
                    if (this.currentCategory === 'loot') {
                        item.copies = 0;
                    } else {
                        item.STATUS = '';
                    }
                    break;
                case 'reset-copies':
                    item.copies = 0;
                    break;
                case 'reset-watched':
                    if (item.WATCHED !== undefined) {
                        item.WATCHED = 0;
                    } else if (item.watched !== undefined) {
                        item.watched = 0;
                    } else {
                        item.times_seen = 0;
                    }
                    break;
            }
            
            this.markAsModified(index);
        });
        
        this.renderTable();
        this.hideBulkModal();
        this.selectedItems.clear();
        this.updateSelectAllState();
        
        this.showToast(`Bulk action applied to ${selectedIndexes.length} items`, '📦');
    }

    editItem(index) {
        // Open detailed edit modal (future enhancement)
        console.log('Edit item:', this.currentData[index]);
        this.showToast('Detailed edit coming soon', '🚧');
    }    handleRealTimeUpdate(data) {
        console.log('📡 Real-time update received:', data);
        
        switch (data.type) {
            case 'dataUpdate':
                if (data.category === this.currentCategory) {
                    this.refreshCurrentCategory();
                    this.showToast('Data updated from external source', '🔄');
                }
                break;
                
            case 'sync_status':
                this.handleSyncStatusUpdate(data.data);
                break;
                
            case 'connection':
                if (data.status === 'connected') {
                    this.isConnected = true;
                    this.updateConnectionStatus();
                }
                break;
                
            default:
                console.log('Unknown real-time update type:', data.type);
        }
    }

    handleSyncStatusUpdate(syncData) {
        console.log('📊 Processing sync status update:', syncData);
        
        if (syncData.action === 'data_updated' && syncData.category) {
            // Show notification for data update with sync status
            const message = syncData.syncSuccess 
                ? `${syncData.category} updated and synced successfully`
                : `${syncData.category} updated (sync failed)`;
            const icon = syncData.syncSuccess ? '✅' : '⚠️';
            this.showToast(message, icon);
            
            // Refresh if current category was updated
            if (syncData.category === this.currentCategory) {
                setTimeout(() => this.refreshCurrentCategory(), 1000);
            }
        } else if (syncData.action === 'manual_sync_completed') {
            this.updateSyncStatus(syncData.results);
            this.showToast('Manual sync completed successfully', '🔗');
        } else if (syncData.action === 'category_sync_completed') {
            const message = syncData.success 
                ? `${syncData.category} sync completed`
                : `${syncData.category} sync failed`;
            const icon = syncData.success ? '✅' : '❌';
            this.showToast(message, icon);
        }
    }

    showLoading() {
        document.getElementById('loading-state').classList.remove('hidden');
        document.getElementById('table-body').innerHTML = '';
    }

    hideLoading() {
        document.getElementById('loading-state').classList.add('hidden');
    }

    showEmpty() {
        document.getElementById('empty-state').classList.remove('hidden');
    }

    hideEmpty() {
        document.getElementById('empty-state').classList.add('hidden');
    }

    showSyncIndicator() {
        document.getElementById('sync-indicator').classList.remove('hidden');
    }    hideSyncIndicator() {
        document.getElementById('sync-indicator').classList.add('hidden');
    }

    async performManualSync() {
        try {
            console.log('🔄 Initiating manual sync - Database to JSON files');
            this.showSyncIndicator();
            
            const response = await fetch('/api/sync/database-to-json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Sync failed: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success') {
                const { totalSuccess, totalAttempted } = result.data;
                this.showToast(`Manual sync completed: ${totalSuccess}/${totalAttempted} successful`, '🔗');
                console.log('✅ Manual sync completed successfully:', result.data);
                
                // Update sync status in UI if needed
                this.updateSyncStatus(result.data);
            } else {
                throw new Error(result.message || 'Sync failed');
            }
        } catch (error) {
            console.error('❌ Manual sync failed:', error);
            this.showError(`Manual sync failed: ${error.message}`);
        } finally {
            this.hideSyncIndicator();
        }
    }

    updateSyncStatus(syncData) {
        // Update any sync status indicators in the UI
        const timestamp = new Date(syncData.timestamp).toLocaleTimeString();
        console.log(`📊 Sync status updated at ${timestamp}:`, syncData);
        
        // Could add visual indicators here if needed
        if (syncData.categories) {
            Object.entries(syncData.categories).forEach(([category, success]) => {
                const categoryBtn = document.querySelector(`[data-category="${category}"]`);
                if (categoryBtn) {
                    if (success) {
                        categoryBtn.classList.add('sync-success');
                        categoryBtn.classList.remove('sync-error');
                    } else {
                        categoryBtn.classList.add('sync-error');
                        categoryBtn.classList.remove('sync-success');
                    }
                    
                    // Remove status classes after 3 seconds
                    setTimeout(() => {
                        categoryBtn.classList.remove('sync-success', 'sync-error');
                    }, 3000);
                }
            });
        }
    }

    async performManualSync() {
        try {
            console.log('🔄 Initiating manual sync - Database to JSON files');
            this.showSyncIndicator();
            
            const response = await fetch('/api/sync/database-to-json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Sync failed: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success') {
                const { totalSuccess, totalAttempted } = result.data;
                this.showToast(`Manual sync completed: ${totalSuccess}/${totalAttempted} successful`, '🔗');
                console.log('✅ Manual sync completed successfully:', result.data);
                
                // Update sync status in UI if needed
                this.updateSyncStatus(result.data);
            } else {
                throw new Error(result.message || 'Sync failed');
            }
        } catch (error) {
            console.error('❌ Manual sync failed:', error);
            this.showError(`Manual sync failed: ${error.message}`);
        } finally {
            this.hideSyncIndicator();
        }
    }

    updateSyncStatus(syncData) {
        // Update any sync status indicators in the UI
        const timestamp = new Date(syncData.timestamp).toLocaleTimeString();
        console.log(`📊 Sync status updated at ${timestamp}:`, syncData);
        
        // Could add visual indicators here if needed
        if (syncData.categories) {
            Object.entries(syncData.categories).forEach(([category, success]) => {
                const categoryBtn = document.querySelector(`[data-category="${category}"]`);
                if
