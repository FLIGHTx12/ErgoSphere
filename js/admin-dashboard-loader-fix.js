/**
 * Data Loading Fix for ErgoSphere Admin Dashboard
 * This script patches issues with the loadCategoryData method to ensure reliable loading
 * of JSON data in different environments.
 */

class AdminDashboardDataLoader {
    /**
     * Load category data with enhanced error handling and path resolution
     * @param {string} category - The category to load
     * @returns {Promise<Array>} - The loaded data
     */
    static async loadCategoryData(category) {
        console.log(`Loading data for category: ${category}`);
        
        try {
            // First try relative path without leading slash
            try {
                console.log(`Trying to load from data/${category}.json`);
                const response = await fetch(`data/${category}.json`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`Successfully loaded data from data/${category}.json`);
                    return data;
                }
                console.log(`Failed to load from data/${category}.json`);
            } catch (error) {
                console.warn(`Error loading from data/${category}.json:`, error);
            }
            
            // Try with leading slash
            try {
                console.log(`Trying to load from /data/${category}.json`);
                const response = await fetch(`/data/${category}.json`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`Successfully loaded data from /data/${category}.json`);
                    return data;
                }
                console.log(`Failed to load from /data/${category}.json`);
            } catch (error) {
                console.warn(`Error loading from /data/${category}.json:`, error);
            }
            
            // Try relative to current directory
            try {
                console.log(`Trying to load from ./data/${category}.json`);
                const response = await fetch(`./data/${category}.json`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`Successfully loaded data from ./data/${category}.json`);
                    return data;
                }
                console.log(`Failed to load from ./data/${category}.json`);
            } catch (error) {
                console.warn(`Error loading from ./data/${category}.json:`, error);
            }
            
            // Try API as last resort
            try {
                console.log(`Trying to load from API: /api/data/${category}`);
                const response = await fetch(`/api/data/${category}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`Successfully loaded data from API`);
                    return data;
                }
                console.log(`Failed to load from API: ${response.status}`);
            } catch (error) {
                console.warn(`Error loading from API:`, error);
            }
            
            // If we get here, all attempts failed
            throw new Error(`Could not load data for category: ${category}`);
            
        } catch (error) {
            console.error(`Failed to load ${category} data:`, error);
            return [];
        }
    }
    
    /**
     * Load mods data by combining coop and loot data
     * @returns {Promise<Array>} - Combined mods data
     */
    static async loadModsData() {
        try {
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
            return [...ergoVillains, ...modItems];
            
        } catch (error) {
            console.error('Failed to load mods data:', error);
            return [];
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
            console.log('Patching AdminDashboard.loadCategoryData method');
            
            // Save original method for reference
            const originalLoadCategoryData = dashboardInstance.loadCategoryData;
            
            // Override the method
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
            
            console.log('AdminDashboard.loadCategoryData method patched successfully');
            
            // Refresh the current category
            dashboardInstance.refreshCurrentCategory();
            
        } else {
            console.error('AdminDashboard instance not found');
        }
    }, 500);
});
