/**
 * Fixed PostgreSQL Data Loader for ErgoSphere Admin Dashboard
 * This addresses the connection issues and ensures reliable data loading
 */

class FixedPostgreSQLLoader {    constructor() {
        // Detect if we're running on Heroku or locally
        const isHeroku = window.location.hostname.includes('herokuapp.com');
        const baseUrl = isHeroku ? 'https://ergosphere-02b692b18f50.herokuapp.com' : '';
        
        this.config = {
            // Primary PostgreSQL endpoints - Updated to work on both Heroku and local
            primaryEndpoints: {
                data: `${baseUrl}/api/data`,      // Main data endpoint
                backup: `${baseUrl}/api/backup`,  // Backup endpoint  
                fallback: `${baseUrl}/api/fallback`, // Emergency fallback
                ergoshop: `${baseUrl}/api/ergoshop`, // Specific ErgoShop endpoint
                ergobazaar: `${baseUrl}/api/ergobazaar` // ErgoBazaar endpoints
            },
            // Fallback JSON endpoints (for file fallback)
            fallbackEndpoints: [
                './data',
                '../data', 
                '../../data'
            ],
            // Connection settings
            timeout: 8000,
            retryAttempts: 2,
            retryDelay: 1000,
            isHeroku: isHeroku
        };
        
        this.connectionStatus = 'checking';
        this.cachedData = new Map();
        this.dataSource = 'unknown';
    }

    async loadCategoryData(category) {
        console.log(`🔄 Loading category data: ${category}`);
          try {
            // Try API endpoints first (PostgreSQL database)
            const data = await this.loadFromLocalAPI(category);
            this.updateConnectionStatus('connected', this.config.isHeroku ? 'Heroku PostgreSQL' : 'Local PostgreSQL');
            this.cacheData(category, data);
            return data;        } catch (apiError) {
            console.warn('API failed, trying JSON fallback:', apiError.message);
            
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
    }    async loadFromLocalAPI(category) {
        // Build the endpoints based on category and server type
        const endpoints = [
            `${this.config.primaryEndpoints.data}/${category}`,
            `${this.config.primaryEndpoints.backup}/${category}`,
            `${this.config.primaryEndpoints.fallback}/${category}`
        ];
        
        // Add category-specific endpoints for special cases
        if (category === 'ErgoShop') {
            endpoints.unshift(this.config.primaryEndpoints.ergoshop);
        } else if (['coop', 'pvp', 'singleplayer', 'loot', 'movies', 'anime', 'youtube', 'sundaymorning', 'sundaynight'].includes(category)) {
            endpoints.unshift(`${this.config.primaryEndpoints.ergobazaar}/${category}`);
        }
        
        console.log(`🔄 Trying API endpoints for ${category}:`, endpoints);
        
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying API endpoint: ${endpoint}`);
                
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
                    throw new Error(`API response not OK: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Validate movie data if it's the movies category
                if (category === 'movies' && Array.isArray(data) && window.DataValidators) {
                    console.log('Validating movie WATCHED fields...');
                    return window.DataValidators.validateMoviesData(data);
                }
                
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
            const direct = await this.loadCategoryData('mods');
            if (Array.isArray(direct) && direct.length > 0) {
                return direct;
            }
        } catch (error) {
            console.warn('Direct mods loading failed, trying combination approach');
        }
        try {
            // Combine coop, loot, and pvp data for mods
            const [coopData, lootData, pvpData] = await Promise.all([
                this.loadCategoryData('coop'),
                this.loadCategoryData('loot'),
                this.loadCategoryData('pvp')
            ]);
            const genres = ['ERGOvillians', 'week modifiers', 'helper', 'hazzard'];
            const filterMods = item => item && genres.includes((item.genre || '').trim());
            const modItems = [
                ...coopData.filter(filterMods),
                ...lootData.filter(filterMods),
                ...pvpData.filter(filterMods)
            ];
            console.log('[MODS DEBUG] coop:', coopData.length, 'loot:', lootData.length, 'pvp:', pvpData.length, 'mods:', modItems.length);
            if (modItems.length === 0) {
                console.warn('[MODS DEBUG] No mod items found. Check source files and genres.');
            }
            return modItems;
        } catch (combineError) {
            console.error('Failed to combine mods data:', combineError);
            return [];
        }
    }    async saveData(category, data) {
        // Validate data if it's movies category
        if (category === 'movies' && Array.isArray(data) && window.DataValidators) {
            console.log('Validating movie WATCHED fields before saving...');
            data = window.DataValidators.validateMoviesData(data);
        }

        // Build the endpoint URL
        const endpoint = `${this.config.primaryEndpoints.data}/${category}`;
        
        try {
            // Validate data before saving
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format: Expected an array');
            }
            
            const response = await fetch(endpoint, {
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
            
            console.log(`✅ Successfully saved ${data.length} items to ${this.config.isHeroku ? 'Heroku' : 'Local'} PostgreSQL`);
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
    }    async performHealthCheck() {
        const results = {
            postgresql: false,
            jsonFiles: false,
            cached: this.cachedData.size > 0
        };
        
        // Check the appropriate API endpoints based on environment
        const healthEndpoint = this.config.isHeroku ? '/api/health' : '/api/status';
        
        try {
            const response = await fetch(healthEndpoint, { 
                signal: AbortSignal.timeout(3000) 
            });
            results.postgresql = response.ok;
            
            if (response.ok) {
                const healthData = await response.json();
                console.log(`✅ Health check passed: ${JSON.stringify(healthData)}`);
            }
        } catch (error) {
            console.warn(`❌ Health check failed for ${healthEndpoint}:`, error.message);
            results.postgresql = false;
        }
        
        // Quick check of JSON files (only for local testing)
        if (!this.config.isHeroku) {
            try {
                const response = await fetch('./data/coop.json');
                results.jsonFiles = response.ok;
            } catch (error) {
                results.jsonFiles = false;
            }
        }
        
        return results;
    }
}

// Replace the existing AdminDashboardDataLoader with fixed version
if (typeof window !== 'undefined') {
    window.AdminDashboardDataLoader = new FixedPostgreSQLLoader();
    console.log('✅ Fixed PostgreSQL loader initialized');
}
