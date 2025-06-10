/**
 * Enhanced PostgreSQL Sync Implementation
 * Provides safe DB to JSON synchronization with fallback mechanisms
 */

document.addEventListener('DOMContentLoaded', () => {
    // Wait for dashboard initialization
    setTimeout(() => {
        const syncBtn = document.getElementById('manual-sync-btn');
        if (syncBtn) {
            // Remove existing event listeners by cloning and replacing
            const newSyncBtn = syncBtn.cloneNode(true);
            syncBtn.parentNode.replaceChild(newSyncBtn, syncBtn);
            
            // Add enhanced sync handler
            newSyncBtn.addEventListener('click', async () => {
                const dashboardInstance = window.dashboard || 
                    Object.values(window).find(val => val && typeof val.showMessage === 'function');
                
                if (!dashboardInstance) {
                    console.error('Dashboard instance not found for sync');
                    return;
                }
                
                // Show sync in progress
                dashboardInstance.showSyncIndicator();
                dashboardInstance.showMessage('Initiating sync from PostgreSQL to JSON...');
                
                try {
                    // Try with enhanced loader first if available
                    if (window.AdminDashboardDataLoader && typeof window.AdminDashboardDataLoader.syncPostgresToJson === 'function') {
                        console.log('Using enhanced PostgreSQL sync method');
                        
                        const result = await window.AdminDashboardDataLoader.syncPostgresToJson(
                            dashboardInstance.currentCategory
                        );
                        
                        if (result.success) {
                            dashboardInstance.showMessage(`✅ ${result.message}`);
                            await dashboardInstance.refreshCurrentCategory();
                        } else {
                            dashboardInstance.showMessage(`⚠️ Sync encountered issues: ${result.message}`);
                        }
                    } 
                    // Fallback to original method if available on the dashboard
                    else if (typeof dashboardInstance.syncPostgresToJson === 'function') {
                        console.log('Using dashboard syncPostgresToJson method');
                        await dashboardInstance.syncPostgresToJson();
                    }
                    // Ultimate fallback to manual sync method
                    else if (typeof dashboardInstance.performManualSync === 'function') {
                        console.log('Falling back to performManualSync method');
                        await dashboardInstance.performManualSync();
                    }
                    else {
                        dashboardInstance.showMessage('⚠️ No sync method available');
                    }
                } catch (error) {
                    console.error('Sync operation failed:', error);
                    dashboardInstance.showMessage('❌ Sync failed: ' + (error.message || 'Unknown error'));
                } finally {
                    dashboardInstance.hideSyncIndicator();
                }
            });
            
            console.log('Enhanced sync button handler attached');
        }
    }, 2000);
});
