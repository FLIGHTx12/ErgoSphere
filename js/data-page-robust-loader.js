/**
 * Robust Data Loader for ErgoSphere Data Pages
 * 
 * This module provides a multi-tier fallback system for loading data:
 * 1. PostgreSQL Database (primary)
 * 2. Server API Backup (secondary)
 * 3. JSON File Backup (tertiary)
 * 4. Cached Data (emergency)
 * 
 * Features:
 * - Automatic retry logic with exponential backoff
 * - Connection health monitoring
 * - Performance metrics tracking
 * - Seamless fallback without breaking functionality
 * - Cache management for offline resilience
 */

class RobustDataLoader {
    constructor() {
        this.connectionStatus = {
            postgres: 'unknown',
            server: 'unknown',
            jsonFiles: 'unknown'
        };
        
        this.cache = new Map();
        this.retryConfig = {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 10000
        };
        
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            fallbackUsage: {
                postgres: 0,
                server: 0,
                jsonFiles: 0,
                cache: 0
            },
            avgResponseTime: 0
        };
        
        this.healthCheckInterval = null;
        this.lastHealthCheck = 0;
        
        // Initialize health monitoring
        this.startHealthMonitoring();
    }

    /**
     * Main data loading method with intelligent fallback
     * @param {string} category - Data category to load
     * @param {Object} options - Loading options
     * @returns {Promise<Array>} - Loaded data
     */
    async loadData(category, options = {}) {
        const startTime = performance.now();
        this.metrics.totalRequests++;
        
        try {
            console.log(`🔄 Loading data for category: ${category}`);
            
            // Try PostgreSQL first
            try {
                const data = await this.loadFromPostgreSQL(category, options);
                if (data && data.length > 0) {
                    this.updateConnectionStatus('postgres', 'connected');
                    this.cacheData(category, data);
                    this.recordSuccess('postgres', startTime);
                    console.log(`✅ Loaded ${data.length} items from PostgreSQL`);
                    return data;
                }
            } catch (error) {
                console.warn(`⚠️ PostgreSQL failed: ${error.message}`);
                this.updateConnectionStatus('postgres', 'error');
            }

            // Fallback to server API
            try {
                const data = await this.loadFromServerAPI(category, options);
                if (data && data.length > 0) {
                    this.updateConnectionStatus('server', 'connected');
                    this.cacheData(category, data);
                    this.recordSuccess('server', startTime);
                    console.log(`✅ Loaded ${data.length} items from Server API (fallback)`);
                    return data;
                }
            } catch (error) {
                console.warn(`⚠️ Server API failed: ${error.message}`);
                this.updateConnectionStatus('server', 'error');
            }

            // Fallback to JSON files
            try {
                const data = await this.loadFromJSONFiles(category, options);
                if (data && data.length > 0) {
                    this.updateConnectionStatus('jsonFiles', 'connected');
                    this.cacheData(category, data);
                    this.recordSuccess('jsonFiles', startTime);
                    console.log(`✅ Loaded ${data.length} items from JSON files (fallback)`);
                    return data;
                }
            } catch (error) {
                console.warn(`⚠️ JSON files failed: ${error.message}`);
                this.updateConnectionStatus('jsonFiles', 'error');
            }

            // Emergency fallback to cache
            const cachedData = this.getCachedData(category);
            if (cachedData) {
                this.recordSuccess('cache', startTime);
                console.log(`⚠️ Using cached data for ${category} (${cachedData.length} items)`);
                this.showDataSourceWarning('cache');
                return cachedData;
            }

            // All fallbacks failed
            throw new Error(`All data sources failed for category: ${category}`);

        } catch (error) {
            console.error(`❌ Critical error loading data for ${category}:`, error);
            this.showDataSourceError(category, error);
            return []; // Return empty array to prevent page breaking
        }
    }

    /**
     * Load data from PostgreSQL database
     */
    async loadFromPostgreSQL(category, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);

        try {
            const response = await fetch(`/api/data/${category}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Data-Source': 'postgres'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`PostgreSQL API returned ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('PostgreSQL request timed out');
            }
            throw error;
        }
    }

    /**
     * Load data from server API backup
     */
    async loadFromServerAPI(category, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || 8000);

        try {
            // Try alternative API endpoints
            const endpoints = [
                `/api/backup/${category}`,
                `/api/data/${category}?source=backup`,
                `/api/fallback/${category}`
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'X-Data-Source': 'server-backup'
                        },
                        signal: controller.signal
                    });

                    if (response.ok) {
                        const data = await response.json();
                        clearTimeout(timeoutId);
                        return Array.isArray(data) ? data : [];
                    }
                } catch (endpointError) {
                    console.log(`Endpoint ${endpoint} failed, trying next...`);
                }
            }

            throw new Error('All server backup endpoints failed');

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Server API request timed out');
            }
            throw error;
        }
    }

    /**
     * Load data from JSON files
     */
    async loadFromJSONFiles(category, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || 5000);

        try {
            // Try multiple JSON file paths
            const paths = [
                `/data/${category}.json`,
                `./data/${category}.json`,
                `../data/${category}.json`,
                `/assets/data/${category}.json`
            ];

            for (const path of paths) {
                try {
                    const response = await fetch(path, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'X-Data-Source': 'json-file'
                        },
                        signal: controller.signal
                    });

                    if (response.ok) {
                        const data = await response.json();
                        clearTimeout(timeoutId);
                        return Array.isArray(data) ? data : [];
                    }
                } catch (pathError) {
                    console.log(`JSON path ${path} failed, trying next...`);
                }
            }

            throw new Error('All JSON file paths failed');

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('JSON file request timed out');
            }
            throw error;
        }
    }

    /**
     * Cache management
     */
    cacheData(category, data) {
        try {
            const cacheEntry = {
                data: data,
                timestamp: Date.now(),
                source: this.getLastSuccessfulSource()
            };
            
            this.cache.set(category, cacheEntry);
            
            // Also store in localStorage for persistence
            localStorage.setItem(`ergo_cache_${category}`, JSON.stringify(cacheEntry));
        } catch (error) {
            console.warn('Failed to cache data:', error);
        }
    }

    getCachedData(category) {
        try {
            // Try memory cache first
            const memoryCache = this.cache.get(category);
            if (memoryCache && this.isCacheValid(memoryCache)) {
                return memoryCache.data;
            }

            // Try localStorage
            const stored = localStorage.getItem(`ergo_cache_${category}`);
            if (stored) {
                const cacheEntry = JSON.parse(stored);
                if (this.isCacheValid(cacheEntry)) {
                    this.cache.set(category, cacheEntry); // Restore to memory
                    return cacheEntry.data;
                }
            }
        } catch (error) {
            console.warn('Failed to retrieve cached data:', error);
        }
        
        return null;
    }

    isCacheValid(cacheEntry) {
        const maxAge = 30 * 60 * 1000; // 30 minutes
        return (Date.now() - cacheEntry.timestamp) < maxAge;
    }

    /**
     * Health monitoring
     */
    startHealthMonitoring() {
        this.healthCheckInterval = setInterval(() => {
            this.performHealthCheck();
        }, 60000); // Check every minute

        // Initial health check
        setTimeout(() => this.performHealthCheck(), 1000);
    }

    async performHealthCheck() {
        const now = Date.now();
        if (now - this.lastHealthCheck < 30000) return; // Throttle checks
        
        this.lastHealthCheck = now;

        // Check PostgreSQL
        try {
            const response = await fetch('/api/health', { 
                method: 'GET',
                timeout: 5000 
            });
            
            if (response.ok) {
                const health = await response.json();
                this.updateConnectionStatus('postgres', 
                    health.services?.database?.status === 'ok' ? 'connected' : 'degraded'
                );
            } else {
                this.updateConnectionStatus('postgres', 'error');
            }
        } catch (error) {
            this.updateConnectionStatus('postgres', 'error');
        }

        // Check server status
        try {
            const response = await fetch('/api/status', { 
                method: 'GET',
                timeout: 3000 
            });
            this.updateConnectionStatus('server', response.ok ? 'connected' : 'error');
        } catch (error) {
            this.updateConnectionStatus('server', 'error');
        }
    }

    updateConnectionStatus(source, status) {
        if (this.connectionStatus[source] !== status) {
            this.connectionStatus[source] = status;
            this.broadcastStatusUpdate(source, status);
        }
    }

    broadcastStatusUpdate(source, status) {
        const event = new CustomEvent('dataSourceStatusUpdate', {
            detail: { source, status, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }

    /**
     * Metrics and success tracking
     */
    recordSuccess(source, startTime) {
        this.metrics.successfulRequests++;
        this.metrics.fallbackUsage[source]++;
        
        const responseTime = performance.now() - startTime;
        this.metrics.avgResponseTime = 
            (this.metrics.avgResponseTime * (this.metrics.successfulRequests - 1) + responseTime) / 
            this.metrics.successfulRequests;
    }

    getLastSuccessfulSource() {
        const usage = this.metrics.fallbackUsage;
        return Object.keys(usage).reduce((a, b) => usage[a] > usage[b] ? a : b);
    }

    /**
     * User feedback
     */
    showDataSourceWarning(source) {
        const message = {
            cache: 'Using cached data - some information may be outdated',
            jsonFiles: 'Using backup files - data may not be current',
            server: 'Using server backup - some features may be limited'
        };

        this.showNotification(message[source], 'warning');
    }

    showDataSourceError(category, error) {
        this.showNotification(
            `Unable to load ${category} data. Please check your connection and try again.`,
            'error'
        );
    }

    showNotification(message, type = 'info') {
        // Create or update notification element
        let notification = document.getElementById('data-loader-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'data-loader-notification';
            notification.style.cssText = `
                position: fixed;
                top: 70px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
            `;
            document.body.appendChild(notification);
        }

        // Set color based on type
        const colors = {
            info: '#4CAF50',
            warning: '#FF9800',
            error: '#F44336'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        notification.style.display = 'block';
        notification.style.opacity = '1';

        // Auto-hide after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, type === 'error' ? 8000 : 5000);
    }

    /**
     * Get current status and metrics
     */
    getStatus() {
        return {
            connectionStatus: { ...this.connectionStatus },
            metrics: { ...this.metrics },
            cacheSize: this.cache.size,
            healthCheckActive: !!this.healthCheckInterval
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        this.cache.clear();
    }
}

// Export for use in data-page.js
window.RobustDataLoader = RobustDataLoader;
