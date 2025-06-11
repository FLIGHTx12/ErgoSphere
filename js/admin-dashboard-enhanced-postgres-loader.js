/**
 * Enhanced PostgreSQL Data Loader with Robust Endpoint Validation and Fallback
 * This replaces the existing postgres loader with improved error handling and fallback mechanisms
 */

class EnhancedPostgreSQLLoader {
    constructor() {        this.config = {
            // Primary PostgreSQL endpoints with environment detection
            primaryEndpoints: {
                heroku: window.location.hostname.includes('herokuapp.com') 
                    ? 'https://ergosphere-02b692b18f50.herokuapp.com/api' 
                    : 'https://ergosphere-api.herokuapp.com/api',
                // Add backup endpoint if you have one
                // backup: 'https://backup-postgres-server.com/api'
            },
            // Fallback JSON endpoints
            fallbackEndpoints: [
                '../../data',
                '../data',
                './data'
            ],
            // Connection settings
            timeout: 8000, // 8 seconds - reasonable timeout
            retryAttempts: 2, // Reduced to avoid long waits
            retryDelay: 1000 // 1 second
        };
        
        this.connectionStatus = 'checking';
        this.lastSuccessfulFetch = null;
        this.cachedData = new Map();
        this.dataSource = 'unknown';
    }

    async loadCategoryData(category) {
        console.log(`Enhanced loader: Loading category ${category}`);
        
        // Try PostgreSQL first
        try {
            const data = await this.loadFromPostgreSQL(category);
            this.updateConnectionStatus('connected', 'PostgreSQL');
            this.cacheData(category, data);
            return data;
        } catch (postgresError) {
            console.warn('PostgreSQL failed, trying fallback:', postgresError.message);
            
            // Try JSON fallback
            try {
                const data = await this.loadFromJSONFallback(category);
                this.updateConnectionStatus('fallback', 'JSON Files');
                return data;
            } catch (jsonError) {
                console.error('JSON fallback failed:', jsonError.message);
                
                // Try cached data
                if (this.cachedData.has(category)) {
                    console.warn('Using cached data for', category);
                    this.updateConnectionStatus('cached', 'Cached Data');
                    return this.cachedData.get(category);
                }
                
                // Complete failure - return empty array to prevent breaking
                this.updateConnectionStatus('disconnected', 'No Data Source');
                console.error(`All data sources failed for ${category}`);
                return [];
            }
        }
    }

    async loadFromPostgreSQL(category) {
        const endpoints = Object.values(this.config.primaryEndpoints);
        
        for (let i = 0; i < endpoints.length; i++) {
            const endpoint = endpoints[i];
            
            for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
                try {
                    console.log(`Trying PostgreSQL endpoint ${i + 1}, attempt ${attempt}`);
                    
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
                    
                    const response = await fetch(`${endpoint}/data/${category}`, {
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
                        throw new Error('Invalid data format received from PostgreSQL');
                    }
                    
                    console.log(`Successfully loaded ${data.length} items from PostgreSQL`);
                    this.lastSuccessfulFetch = new Date();
                    this.dataSource = `PostgreSQL`;
                    
                    return data;
                    
                } catch (error) {
                    console.warn(`PostgreSQL attempt ${attempt} failed:`, error.message);
                    
                    if (attempt < this.config.retryAttempts) {
                        await this.delay(this.config.retryDelay * attempt);
                    }
                }
            }
        }
        
        throw new Error('All PostgreSQL endpoints failed');
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
                
                console.log(`Successfully loaded ${data.length} items from JSON fallback`);
                this.dataSource = `JSON Files`;
                
                return data;
                
            } catch (error) {
                console.warn(`JSON fallback failed for ${endpoint}:`, error.message);
            }
        }
        
        throw new Error('All JSON fallback endpoints failed');
    }

    async loadModsData() {
        // Special handling for mods category
        try {
            // Try PostgreSQL first
            return await this.loadCategoryData('mods');
        } catch (error) {
            console.warn('Mods PostgreSQL failed, trying combined approach');
            
            try {
                // Fallback to combining coop and loot data
                const [coopData, lootData] = await Promise.all([
                    this.loadFromJSONFallback('coop'),
                    this.loadFromJSONFallback('loot')
                ]);
                
                const ergoVillains = coopData.filter(item => item.genre === 'ERGOvillians');
                const modItems = lootData.filter(item => 
                    item.genre === 'week modifiers' || 
                    item.genre === 'helper' || 
                    item.genre === 'hazzard');
                
                const combinedData = [...ergoVillains, ...modItems];
                console.log(`Successfully combined mods data: ${combinedData.length} items`);
                return combinedData;
                
            } catch (combineError) {
                console.error('Failed to combine mods data:', combineError);
                return [];
            }
        }
    }

    async saveData(category, data) {
        // Try PostgreSQL save first
        try {
            await this.saveToPostgreSQL(category, data);
            console.log(`Successfully saved ${data.length} items to PostgreSQL`);
            return true;
        } catch (error) {
            console.error('PostgreSQL save failed:', error.message);
            
            // Cache the changes locally as fallback
            this.cacheData(category, data);
            return false;
        }
    }

    async saveToPostgreSQL(category, data) {
        const endpoints = Object.values(this.config.primaryEndpoints);
        
        for (const endpoint of endpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
                
                const response = await fetch(`${endpoint}/data/${category}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                console.log(`Successfully saved to PostgreSQL`);
                return;
                
            } catch (error) {
                console.warn(`Save failed for endpoint:`, error.message);
            }
        }
        
        throw new Error('All PostgreSQL save endpoints failed');
    }

    async performHealthCheck() {
        const results = {
            postgresql: false,
            jsonFiles: false,
            cached: this.cachedData.size > 0
        };
          // Check PostgreSQL - quick check only
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // Quick timeout
            
            // Auto-detect environment for health check
            const isHeroku = window.location.hostname.includes('herokuapp.com');
            const healthUrl = isHeroku 
                ? 'https://ergosphere-02b692b18f50.herokuapp.com/api/health'
                : `${this.config.primaryEndpoints.heroku}/health`;
            
            const response = await fetch(healthUrl, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            results.postgresql = response.ok;
        } catch (error) {
            // Silently fail - don't log to reduce console noise
            results.postgresql = false;
        }
        
        // Check JSON files - quick check
        try {
            const response = await fetch(`${this.config.fallbackEndpoints[0]}/coop.json`);
            results.jsonFiles = response.ok;
        } catch (error) {
            results.jsonFiles = false;
        }
        
        return results;
    }

    cacheData(category, data) {
        this.cachedData.set(category, data);
        this.cachedData.set(`${category}_timestamp`, new Date());
    }    updateConnectionStatus(status, source) {
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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Replace the existing AdminDashboardDataLoader with enhanced version
if (typeof window !== 'undefined') {
    window.AdminDashboardDataLoader = new EnhancedPostgreSQLLoader();
    console.log('Enhanced PostgreSQL loader initialized');
}
