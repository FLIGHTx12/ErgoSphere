/**
 * Enhanced Integration Script for PostgreSQL Loader
 * Integrates with existing dashboard without breaking functionality..
 */

document.addEventListener('DOMContentLoaded', () => {
    // Wait for the main dashboard to initialize
    let integrationAttempts = 0;
    function tryIntegrateEnhancedLoader() {
        integrationAttempts++;
        const dashboardInstance = window.dashboard || 
            Object.values(window).find(val => val && typeof val.loadCategoryData === 'function');
        if (
            dashboardInstance &&
            typeof dashboardInstance.loadCategoryData === 'function' &&
            typeof dashboardInstance.saveAllChanges === 'function'
        ) {
            console.log('Integrating enhanced PostgreSQL loader...');
            
            // Backup original methods
            const originalLoadCategoryData = dashboardInstance.loadCategoryData.bind(dashboardInstance);
            const originalSaveAllChanges = dashboardInstance.saveAllChanges.bind(dashboardInstance);
            
            // Enhanced loadCategoryData with fallback
            dashboardInstance.loadCategoryData = async function(category) {
                try {
                    if (typeof this.showLoading === 'function') this.showLoading();
                    let data;
                    if (category === 'mods') {
                        data = await window.AdminDashboardDataLoader.loadModsData();
                    } else {
                        data = await window.AdminDashboardDataLoader.loadCategoryData(category);
                    }
                    // Update the dashboard's internal data
                    if (Array.isArray(data)) {
                        this.currentData = data;
                    } else if (data && typeof data === 'object') {
                        // If object, try to flatten to array if possible
                        const arr = Object.values(data).every(Array.isArray)
                            ? Object.values(data).flat()
                            : Object.values(data);
                        this.currentData = Array.isArray(arr) ? arr : [];
                        if (!Array.isArray(arr)) {
                            this.showMessage && this.showMessage('Warning: Data is not an array. Some features may not work.');
                        }
                    } else {
                        this.currentData = [];
                        this.showMessage && this.showMessage('Warning: No data loaded.');
                    }
                    this.currentCategory = category;
                    this.modifiedItems = new Set();
                    // Robust sort: try common fields, fallback to no sort
                    const sortFields = ['name', 'text', 'Title', 'TITLE', 'meal', 'title'];
                    let sorted = false;
                    for (const field of sortFields) {
                        if (this.currentData.length && this.currentData[0] && this.currentData[0][field] !== undefined) {
                            this.sortData(field);
                            sorted = true;
                            break;
                        }
                    }
                    if (!sorted && typeof this.sortData === 'function') {
                        // No sort field found, skip sorting
                    }
                    if (typeof this.renderTable === 'function') this.renderTable();
                    if (typeof this.updateStats === 'function') this.updateStats();
                    return this.currentData;
                } catch (error) {
                    console.error('Enhanced load failed, falling back to original:', error);
                    this.showMessage && this.showMessage('Error loading data. Trying fallback.');
                    return await originalLoadCategoryData(category);
                } finally {
                    if (typeof this.hideLoading === 'function') this.hideLoading();
                }
            };
            // Enhanced saveAllChanges with PostgreSQL priority
            dashboardInstance.saveAllChanges = async function() {
                if (!this.modifiedItems || this.modifiedItems.size === 0) {
                    this.showMessage && this.showMessage('No changes to save');
                    return;
                }
                try {
                    if (typeof this.showSyncIndicator === 'function') this.showSyncIndicator();
                    const success = await window.AdminDashboardDataLoader.saveData(
                        this.currentCategory, 
                        this.currentData
                    );
                    if (success) {
                        this.modifiedItems.clear();
                        if (typeof this.broadcastUpdate === 'function') this.broadcastUpdate();
                        this.showMessage && this.showMessage('✅ Changes saved successfully to PostgreSQL database');
                        if (typeof this.clearAllStagingHighlights === 'function') this.clearAllStagingHighlights();
                        if (typeof this.updateSaveButtonState === 'function') this.updateSaveButtonState();
                        if (typeof this.updateStagingIndicator === 'function') this.updateStagingIndicator();
                    } else {
                        this.showMessage && this.showMessage('PostgreSQL save failed, trying fallback...');
                        return await originalSaveAllChanges();
                    }
                } catch (error) {
                    console.error('Enhanced save failed, falling back to original:', error);
                    this.showMessage && this.showMessage('Error saving data. Trying fallback.');
                    return await originalSaveAllChanges();
                } finally {
                    if (typeof this.hideSyncIndicator === 'function') this.hideSyncIndicator();
                }
            };
            // Add health check functionality (non-intrusive) with error handling
            dashboardInstance.performHealthCheck = async function() {
                try {
                    const results = await window.AdminDashboardDataLoader.performHealthCheck();
                    // Only show health status if there are issues (reduce visual noise)
                    if (!results.postgresql && !results.jsonFiles && !results.cached) {
                        this.displayHealthStatus(results);
                    } else {
                        // If health status div exists, update it
                        this.displayHealthStatus(results, true);
                    }
                    return results;
                } catch (error) {
                    console.error('Health check failed:', error);
                    this.showMessage && this.showMessage('Health check failed.');
                    return { postgresql: false, jsonFiles: false, cached: false };
                }
            };
            dashboardInstance.displayHealthStatus = function(results, updateOnly) {
                let healthDiv = document.getElementById('health-status');
                if (!healthDiv) {
                    healthDiv = document.createElement('div');
                    healthDiv.id = 'health-status';
                    healthDiv.className = 'health-status';
                    document.body.appendChild(healthDiv);
                }
                healthDiv.innerHTML = `
                    <div class="health-item">
                        <div class="health-indicator ${results.postgresql ? 'healthy' : 'unhealthy'}"></div>
                        <span>PostgreSQL: ${results.postgresql ? 'Online' : 'Offline'}</span>
                    </div>
                    <div class="health-item">
                        <div class="health-indicator ${results.jsonFiles ? 'healthy' : 'unhealthy'}"></div>
                        <span>JSON Files: ${results.jsonFiles ? 'Available' : 'Unavailable'}</span>
                    </div>
                    ${results.cached ? `<div class="health-item">
                        <div class="health-indicator healthy"></div>
                        <span>Cached: Available</span>
                    </div>` : ''}
                `;
                healthDiv.classList.add('visible');
                // Only auto-hide if not updateOnly
                if (!updateOnly) {
                    setTimeout(() => {
                        if (healthDiv.parentNode) {
                            healthDiv.classList.remove('visible');
                            setTimeout(() => {
                                if (healthDiv.parentNode) {
                                    healthDiv.remove();
                                }
                            }, 300);
                        }
                    }, 5000);
                }
            };
            // Store dashboard instance globally for access, but don't overwrite if already set
            if (!window.dashboard) window.dashboard = dashboardInstance;
            // Perform initial health check only if needed (reduce startup noise)
            setTimeout(async () => {
                try {
                    if (window.AdminDashboardDataLoader && typeof window.AdminDashboardDataLoader.performHealthCheck === 'function') {
                        const results = await window.AdminDashboardDataLoader.performHealthCheck();
                        if (!results.postgresql) {
                            console.warn('PostgreSQL not available, using fallback data sources');
                        }
                    }
                } catch (error) {
                    console.error('Health check failed:', error);
                }
            }, 3000);
            console.log('Enhanced PostgreSQL loader integration complete');
        } else if (integrationAttempts < 30) { // Increased attempts for slow dashboards
            setTimeout(tryIntegrateEnhancedLoader, 500);
        } else {
            console.error('Enhanced integration failed: Required dashboard methods not found after multiple attempts');
        }
    }
    setTimeout(tryIntegrateEnhancedLoader, 1500);
});
