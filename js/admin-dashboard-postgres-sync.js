/**
 * PostgreSQL Sync Method for ErgoSphere Admin Dashboard
 * This adds a method to the AdminDashboardDataLoader to sync from PostgreSQL to JSON files
 * Compatible with both original and enhanced PostgreSQL loaders
 */

// Make sure we don't override existing function if it exists
if (!AdminDashboardDataLoader.syncPostgresToJson) {
    AdminDashboardDataLoader.syncPostgresToJson = async function(category) {
    try {
        console.log(`Initiating PostgreSQL to JSON sync for ${category || 'all categories'}`);
        
        // Auto-detect environment and use appropriate base URL
        const isHeroku = window.location.hostname.includes('herokuapp.com');
        const baseUrl = isHeroku ? 'https://ergosphere-02b692b18f50.herokuapp.com' : '';
        
        // Specify category in the URL if provided, otherwise sync all
        const endpoint = category 
            ? `${baseUrl}/api/sync/${category}`
            : `${baseUrl}/api/sync/all`;
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('PostgreSQL to JSON sync completed successfully:', result);
            return {
                success: true,
                message: result.message || 'Sync completed successfully',
                data: result.data || {}
            };
        } else {
            console.error(`Sync failed: ${response.status}`);
            return {
                success: false,
                message: `Sync failed with status ${response.status}`,
                error: await response.text()
            };
        }
    } catch (error) {
        console.error('PostgreSQL sync error:', error);
        return {
            success: false,
            message: `Sync failed: ${error.message}`,
            error: error
        };    }
};
}

// Add a method to the AdminDashboard prototype if it doesn't already exist
if (typeof AdminDashboard !== 'undefined' && !AdminDashboard.prototype.syncPostgresToJson) {
    AdminDashboard.prototype.syncPostgresToJson = async function() {
        try {
            this.showSyncIndicator();
            this.showMessage('Syncing PostgreSQL to JSON files...');
            
            const result = await AdminDashboardDataLoader.syncPostgresToJson(this.currentCategory);
            
            if (result.success) {
                this.showMessage(`✅ ${result.message}`);
                // Refresh the current category to show updated data
                await this.refreshCurrentCategory();
            } else {
                this.showError(`❌ ${result.message}`);
            }
        } catch (error) {
            console.error('Sync failed:', error);
            this.showError(`Failed to sync: ${error.message}`);
        } finally {
            this.hideSyncIndicator();
        }
    };
}
