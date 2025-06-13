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
                    this.showLoading();
                    
                    let data;
                    if (category === 'mods') {
                        data = await window.AdminDashboardDataLoader.loadModsData();
                    } else {
                        data = await window.AdminDashboardDataLoader.loadCategoryData(category);
                    }
                    
                    // Update the dashboard's internal data
                    this.currentData = Array.isArray(data) ? data : [];
                    this.currentCategory = category;
                    this.modifiedItems = new Set();
                    
                    // Sort alphabetically by default
                    this.sortData('name');
                    
                    // Render the table and update stats
                    this.renderTable();
                    this.updateStats();
                    
                    return data;
                    
                } catch (error) {
                    console.error('Enhanced load failed, falling back to original:', error);
                    return await originalLoadCategoryData(category);
                } finally {
                    this.hideLoading();
                }
            };
            
            // Enhanced saveAllChanges with PostgreSQL priority
            dashboardInstance.saveAllChanges = async function() {
                if (this.modifiedItems.size === 0) {
                    this.showMessage('No changes to save');
                    return;
                }
                
                try {
                    this.showSyncIndicator();
                    
                    // Use enhanced PostgreSQL loader
                    const success = await window.AdminDashboardDataLoader.saveData(
                        this.currentCategory, 
                        this.currentData
                    );
                    
                    if (success) {
                        this.modifiedItems.clear();
                        this.broadcastUpdate();
                        this.showMessage('✅ Changes saved successfully to PostgreSQL database');
                        this.clearAllStagingHighlights();
                        this.updateSaveButtonState();
                        this.updateStagingIndicator();
                    } else {
                        // Fall back to original save method
                        console.warn('PostgreSQL save failed, trying original method...');
                        return await originalSaveAllChanges();
                    }
                    
                } catch (error) {
                    console.error('Enhanced save failed, falling back to original:', error);
                    return await originalSaveAllChanges();
                } finally {
                    this.hideSyncIndicator();
                }
            };
              // Add health check functionality (non-intrusive) with error handling
            dashboardInstance.performHealthCheck = async function() {
                try {
                    const results = await window.AdminDashboardDataLoader.performHealthCheck();
                    
                    // Only show health status if there are issues (reduce visual noise)
                    if (!results.postgresql && !results.jsonFiles && !results.cached) {
                        this.displayHealthStatus(results);
                    }
                    
                    return results;
                } catch (error) {
                    console.error('Health check failed:', error);
                    // Return fallback results to prevent further errors
                    return { postgresql: false, jsonFiles: false, cached: false };
                }
            }; 
            
            dashboardInstance.displayHealthStatus = function(results) {
                // Remove existing status
                let existingStatus = document.getElementById('health-status');
                if (existingStatus) {
                    existingStatus.remove();
                }
                
                const healthDiv = document.createElement('div');
                healthDiv.id = 'health-status';
                healthDiv.className = 'health-status';
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
                
                document.body.appendChild(healthDiv);
                
                // Show with animation
                setTimeout(() => {
                    healthDiv.classList.add('visible');
                }, 100);
                
                // Auto-hide after 5 seconds (reduced from 10)
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
            };
            
            // Store dashboard instance globally for access
            window.dashboard = dashboardInstance;
              // Perform initial health check only if needed (reduce startup noise)
            setTimeout(async () => {
                try {
                    // Added safeguards to prevent potential recursion
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
        } else if (integrationAttempts < 10) {
            setTimeout(tryIntegrateEnhancedLoader, 500);
        } else {
            console.error('Enhanced integration failed: Required dashboard methods not found after multiple attempts');
        }
    }
    setTimeout(tryIntegrateEnhancedLoader, 1500);
});
