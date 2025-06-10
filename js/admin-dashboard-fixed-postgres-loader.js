/**
 * Fixed PostgreSQL Data Loader for ErgoSphere Admin Dashboard
 * This addresses the connection issues and ensures reliable data loading
 */

class FixedPostgreSQLLoader {
    constructor() {
        this.config = {
            // Primary PostgreSQL endpoints - Updated to use working URL patterns
            primaryEndpoints: {
                local: '/api/data',  // Local server endpoint
                backup: '/api/backup', // Backup endpoint
                fallback: '/api/fallback' // Additional fallback
            },
            // Fallback JSON endpoints
            fallbackEndpoints: [
                './data',
                '../data',
                '../../data'
            ],
            // Connection settings
            timeout: 8000,
            retryAttempts: 2,
            retryDelay: 1000
        };
        
        this.connectionStatus = 'checking';
        this.cachedData = new Map();
        this.dataSource = 'unknown';
    }

    async loadCategoryData(category) {
        console.log(`🔄 Loading category data: ${category}`);
        
        try {
            // Try local API endpoints first (these work since database is working)
            const data = await this.loadFromLocalAPI(category);
            this.updateConnectionStatus('connected', 'Local PostgreSQL');
            this.cacheData(category, data);
            return data;
        } catch (apiError) {
            console.warn('Local API failed, trying JSON fallback:', apiError.message);
            
            try {
                // Try JSON files as fallback
                const data = await this.loadFromJSONFallback(category);
                this.updateConnectionStatus('fallback', 'JSON Files');
                return data;
            } catch (jsonError) {
                console.error('JSON fallback failed:', jsonError.message);
                
                // Try cached data as last resort
                if (this.cachedData.has(category)) {
                    console.warn('Using cached data for', category);
                    this.updateConnectionStatus('cached', 'Cached Data');
                    return this.cachedData.get(category);
                }
                
                // Return empty array to prevent breaking
                this.updateConnectionStatus('disconnected', 'No Data Source');
                console.error(`All data sources failed for ${category}`);
                return [];
            }
        }
    }

    async loadFromLocalAPI(category) {
        const endpoints = [
            `/api/data/${category}`,
            `/api/backup/${category}`,
            `/api/fallback/${category}`
        ];
        
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying local endpoint: ${endpoint}`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
                
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (!Array.isArray(data)) {
                    throw new Error('Invalid data format received');
                }
                
                console.log(`✅ Loaded ${data.length} items from ${endpoint}`);
                this.dataSource = 'Local PostgreSQL';
                return data;
                
            } catch (error) {
                console.warn(`Local API failed for ${endpoint}:`, error.message);
            }
        }
        
        throw new Error('All local API endpoints failed');
    }

    async loadFromJSONFallback(category) {
        const endpoints = this.config.fallbackEndpoints;
        
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying JSON fallback: ${endpoint}/${category}.json`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout / 2);
                
                const response = await fetch(`${endpoint}/${category}.json`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (!Array.isArray(data)) {
                    throw new Error('Invalid JSON data format');
                }
                
                console.log(`✅ Loaded ${data.length} items from JSON fallback`);
                this.dataSource = 'JSON Files';
                return data;
                
            } catch (error) {
                console.warn(`JSON fallback failed for ${endpoint}:`, error.message);
            }
        }
        
        throw new Error('All JSON fallback endpoints failed');
    }

    async loadModsData() {
        try {
            // Try loading mods directly first
            return await this.loadCategoryData('mods');
        } catch (error) {
            console.warn('Direct mods loading failed, trying combination approach');
            
            try {
                // Fallback to combining coop and loot data
                const [coopData, lootData] = await Promise.all([
                    this.loadCategoryData('coop'),
                    this.loadCategoryData('loot')
                ]);
                
                const ergoVillains = coopData.filter(item => item.genre === 'ERGOvillians');
                const modItems = lootData.filter(item => 
                    item.genre === 'week modifiers' || 
                    item.genre === 'helper' || 
                    item.genre === 'hazzard'
                );
                
                const combinedData = [...ergoVillains, ...modItems];
                console.log(`✅ Combined mods data: ${combinedData.length} items`);
                return combinedData;
                
            } catch (combineError) {
                console.error('Failed to combine mods data:', combineError);
                return [];
            }
        }
    }

    async saveData(category, data) {
        try {
            // Try to save to local API
            const response = await fetch(`/api/data/${category}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`Save failed: HTTP ${response.status}`);
            }
            
            console.log(`✅ Successfully saved ${data.length} items to PostgreSQL`);
            this.cacheData(category, data);
            return true;
            
        } catch (error) {
            console.error('PostgreSQL save failed:', error.message);
            
            // Cache the changes locally as fallback
            this.cacheData(category, data);
            return false;
        }
    }

    cacheData(category, data) {
        this.cachedData.set(category, data);
        this.cachedData.set(`${category}_timestamp`, new Date());
    }

    updateConnectionStatus(status, source) {
        this.connectionStatus = status;
        this.dataSource = source;
        
        const indicator = document.getElementById('connection-indicator');
        const text = document.getElementById('connection-text');
        const dbType = document.getElementById('database-type');
        
        if (!indicator || !text || !dbType) return;
        
        // Clear any text content and use CSS classes instead
        indicator.textContent = '';
        
        switch (status) {
            case 'connected':
                indicator.className = 'status-indicator connected';
                text.textContent = `Connected to ${source}`;
                dbType.textContent = source;
                dbType.className = 'database-type connected';
                break;
            case 'fallback':
                indicator.className = 'status-indicator connecting';
                text.textContent = `Using fallback: ${source}`;
                dbType.textContent = `Fallback: ${source}`;
                dbType.className = 'database-type fallback';
                break;
            case 'cached':
                indicator.className = 'status-indicator connecting';
                text.textContent = `Using cached data`;
                dbType.textContent = 'Cached Data';
                dbType.className = 'database-type cached';
                break;
            case 'disconnected':
                indicator.className = 'status-indicator disconnected';
                text.textContent = 'No data source available';
                dbType.textContent = 'Disconnected';
                dbType.className = 'database-type disconnected';
                break;
            default:
                indicator.className = 'status-indicator connecting';
                text.textContent = 'Checking connection...';
                dbType.textContent = 'Checking...';
                dbType.className = 'database-type checking';
        }
    }

    async performHealthCheck() {
        const results = {
            postgresql: false,
            jsonFiles: false,
            cached: this.cachedData.size > 0
        };
        
        // Quick check of local API
        try {
            const response = await fetch('/api/status', { 
                signal: AbortSignal.timeout(3000) 
            });
            results.postgresql = response.ok;
        } catch (error) {
            results.postgresql = false;
        }
        
        // Quick check of JSON files
        try {
            const response = await fetch('./data/coop.json');
            results.jsonFiles = response.ok;
        } catch (error) {
            results.jsonFiles = false;
        }
        
        return results;
    }
}

// Replace the existing AdminDashboardDataLoader with fixed version
if (typeof window !== 'undefined') {
    window.AdminDashboardDataLoader = new FixedPostgreSQLLoader();
    console.log('✅ Fixed PostgreSQL loader initialized');
}
