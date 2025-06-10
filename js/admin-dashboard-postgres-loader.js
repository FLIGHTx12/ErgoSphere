/**
 * Data Loading Fix for ErgoSphere Admin Dashboard
 * This script prioritizes loading data from Heroku PostgreSQL server
 * instead of local JSON files.
 */

class AdminDashboardDataLoader {
    /**
     * Load category data from Heroku PostgreSQL server with fallbacks
     * @param {string} category - The category to load
     * @returns {Promise<Array>} - The loaded data
     */
    static async loadCategoryData(category) {
        console.log(`Loading data for category: ${category}`);
        
        try {
            // Primary approach: Try API first (Heroku PostgreSQL)
            try {
                console.log(`Trying to load from API: /api/data/${category}`);
                const apiUrl = `https://ergosphere-api.herokuapp.com/api/data/${category}`;
                console.log(`Connecting to: ${apiUrl}`);
                
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`Successfully loaded data from Heroku PostgreSQL API`);
                    return data;
                }
                console.log(`Failed to load from API: ${response.status}`);
            } catch (error) {
                console.warn(`Error loading from API:`, error);
            }
            
            // Fallback: Try another API endpoint format
            try {
                const altApiUrl = `https://ergosphere-api.herokuapp.com/api/${category}`;
                console.log(`Trying alternate API endpoint: ${altApiUrl}`);
                
                const response = await fetch(altApiUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`Successfully loaded data from alternate API endpoint`);
                    return data;
                }
                console.log(`Failed to load from alternate API: ${response.status}`);
            } catch (error) {
                console.warn(`Error loading from alternate API:`, error);
            }
            
            // Fallback to local data as a last resort
            console.log("API loading failed. Falling back to local JSON files...");
            
            // Try relative path without leading slash
            try {
                console.log(`Trying to load from data/${category}.json`);
                const response = await fetch(`data/${category}.json`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`Successfully loaded data from local JSON file`);
                    return data;
                }
            } catch (error) {
                console.warn(`Error loading from local JSON file:`, error);
            }
            
            // If we get here, all attempts failed
            throw new Error(`Could not load data for category: ${category}`);
            
        } catch (error) {
            console.error(`Failed to load ${category} data:`, error);
            return [];
        }
    }
    
    /**
     * Load mods data from PostgreSQL or by combining coop and loot data as fallback
     * @returns {Promise<Array>} - Combined mods data
     */
    static async loadModsData() {
        try {
            // Try loading mods directly from API first
            try {
                console.log("Trying to load mods data directly from API");
                const apiUrl = "https://ergosphere-api.herokuapp.com/api/data/mods";
                
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log("Successfully loaded mods data from API");
                    return data;
                }
                console.log(`Failed to load mods from API: ${response.status}`);
            } catch (error) {
                console.warn("Error loading mods from API:", error);
            }
            
            // Fallback: Load and combine from coop and loot data
            console.log("Falling back to combining data from coop and loot");
            
            // Load coop data
            const coopData = await this.loadCategoryData('coop');
            const ergoVillains = (coopData || []).filter(item => item.genre === 'ERGOvillians');
            
            // Load loot data
            const lootData = await this.loadCategoryData('loot');
            const modItems = (lootData || []).filter(item => 
                item.genre === 'week modifiers' || 
                item.genre === 'helper' || 
                item.genre === 'hazzard'
            );
            
            // Combine and return
            const combinedData = [...ergoVillains, ...modItems];
            console.log(`Combined mods data: ${combinedData.length} items`);
            return combinedData;
            
        } catch (error) {
            console.error('Failed to load mods data:', error);
            return [];
        }
    }
    
    /**
     * Send data to Heroku PostgreSQL database
     * @param {string} category - The category to save
     * @param {Array} data - The data to save
     * @returns {Promise<boolean>} - Whether the save was successful
     */    static async saveData(category, data) {
        try {
            console.log(`Saving data for category: ${category}`);
            const apiUrl = `https://ergosphere-api.herokuapp.com/api/data/${category}`;
            
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                console.log(`Successfully saved data to PostgreSQL`);
                return true;
            } else {
                console.error(`Failed to save data: ${response.status}`);
                return false;
            }
        } catch (error) {
            console.error(`Error saving data:`, error);
            return false;
        }
    }
    
    /**
     * Check if PostgreSQL connection is available
     * @returns {Promise<boolean>} - Whether the connection is available
     */
    static async checkPostgresConnection() {
        try {
            console.log('Checking PostgreSQL connection...');
            // Try to fetch a simple health check endpoint
            const apiUrl = 'https://ergosphere-api.herokuapp.com/api/health';
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                // Short timeout to avoid long waits
                signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok) {
                console.log('PostgreSQL connection successful');
                return true;
            } else {
                console.warn(`PostgreSQL health check failed: ${response.status}`);
                return false;
            }
        } catch (error) {
            console.error('PostgreSQL connection check error:', error);
            return false;
        }
    }
}

// Patch AdminDashboard.loadCategoryData
document.addEventListener('DOMContentLoaded', () => {
    // Wait for AdminDashboard to initialize
    setTimeout(() => {
        // Find the AdminDashboard instance
        const dashboardInstance = window._dashboard || 
            Object.values(window).find(val => val instanceof AdminDashboard);
        
        if (dashboardInstance) {
            console.log('Patching AdminDashboard methods to prioritize PostgreSQL database');
            
            // Override the loadCategoryData method
            dashboardInstance.loadCategoryData = async function(category) {
                this.showLoading();
                
                try {
                    let data;
                    
                    if (category === 'mods') {
                        // Special handling for mods category
                        data = await AdminDashboardDataLoader.loadModsData();
                    } else {
                        // Regular category loading
                        data = await AdminDashboardDataLoader.loadCategoryData(category);
                    }
                    
                    this.currentData = Array.isArray(data) ? data : [];
                    
                    // Sort alphabetically by default
                    this.sortData('name');
                    
                    this.renderTable();
                    this.updateStats();
                    
                } catch (error) {
                    console.error('Failed to load category data:', error);
                    this.showError('Failed to load data. Please try again.');
                } finally {
                    this.hideLoading();
                }
            };
            
            // Override the saveAllChanges method to use PostgreSQL
            const originalSaveAllChanges = dashboardInstance.saveAllChanges;
            dashboardInstance.saveAllChanges = async function() {
                if (this.modifiedItems.size === 0) {
                    this.showMessage('No changes to save');
                    return;
                }

                try {
                    this.showSyncIndicator();
                    
                    // Save to PostgreSQL database
                    const saveResult = await AdminDashboardDataLoader.saveData(this.currentCategory, this.currentData);
                    
                    if (saveResult) {
                        this.modifiedItems.clear();
                        this.broadcastUpdate();
                        this.showMessage('✅ Changes saved successfully to PostgreSQL database');
                        this.clearAllStagingHighlights();
                    } else {
                        throw new Error('Failed to save to database');
                    }
                    
                } catch (error) {
                    console.error('Save failed:', error);
                    
                    // Fallback to original save method
                    console.warn('Falling back to original save method...');
                    return originalSaveAllChanges.call(this);
                } finally {
                    this.hideSyncIndicator();
                }
            };
            
            console.log('AdminDashboard methods patched successfully');
              // Update connection status to show PostgreSQL connection
            const connectionText = document.getElementById('connection-text');
            const databaseType = document.getElementById('database-type');
            const connectionStatus = document.querySelector('.connection-status');
            const connectionIndicator = document.getElementById('connection-indicator');
            
            // Verify PostgreSQL connection on page load
            AdminDashboardDataLoader.checkPostgresConnection()
                .then(isConnected => {
                    if (connectionText) {
                        connectionText.textContent = isConnected 
                            ? 'Connected to PostgreSQL' 
                            : 'PostgreSQL disconnected, using JSON fallback';
                    }
                    
                    if (connectionStatus) {
                        if (isConnected) {
                            connectionStatus.classList.add('postgres-connected');
                            connectionStatus.classList.remove('json-fallback');
                        } else {
                            connectionStatus.classList.add('json-fallback');
                            connectionStatus.classList.remove('postgres-connected');
                        }
                    }
                    
                    if (connectionIndicator) {
                        connectionIndicator.textContent = isConnected ? '🟢' : '🟠';
                    }
                    
                    if (databaseType) {
                        databaseType.textContent = isConnected ? 'PostgreSQL' : 'JSON Fallback';
                    }
                });
            
            // Refresh the current category
            dashboardInstance.refreshCurrentCategory();
            
        } else {
            console.error('AdminDashboard instance not found');
        }
    }, 500);
});
