# Sync Queue Manager Installation Guide

This guide provides instructions for installing and configuring the Sync Queue Manager for the ErgoSphere Admin Dashboard.

## Prerequisites

- ErgoSphere Admin Dashboard already installed and configured
- Enhanced PostgreSQL Loader already installed and working
- Web server with appropriate permissions

## Installation Steps

### 1. Add Required Files

Copy the following files to your web server:

- `admin-dashboard-sync-queue-manager.js` → `js/` directory
- `admin-dashboard-sync-queue.css` → `css/` directory

### 2. Update Admin HTML

Edit your `admin.html` file to include the new files:

```html
<!-- Add this CSS in the <head> section -->
<link rel="stylesheet" href="../../css/admin-dashboard-sync-queue.css">

<!-- Add this JavaScript just before the closing </body> tag -->
<script src="../../js/admin-dashboard-sync-queue-manager.js"></script>
```

### 3. Verify Integration

After installation, verify the following:

1. Open the admin dashboard in a web browser
2. Open browser developer tools (F12)
3. Check the console for the message: "Sync Queue Manager initialized"
4. Confirm no JavaScript errors are present

### 4. Configuration (Optional)

To customize the Sync Queue Manager, you can add a configuration script:

```html
<!-- Add this after loading the sync-queue-manager.js -->
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Wait for Sync Queue Manager to initialize
    setTimeout(() => {
      if (window.SyncQueueManager) {
        // Customize configuration
        window.SyncQueueManager.config.checkInterval = 120000; // Check every 2 minutes
        window.SyncQueueManager.config.conflictStrategy = 'merge'; // Deep merge for conflict resolution
        console.log('Sync Queue Manager configuration customized');
      }
    }, 2500);
  });
</script>
```

## Advanced Installation Options

### Handling Large Datasets

If your application works with large datasets, consider the following adjustments:

```javascript
// Add this configuration after loading sync-queue-manager.js
window.SyncQueueManager.config.bulkSyncThreshold = 20; // Increase batch processing threshold
```

### Disabling Debug Mode in Production

For production environments, ensure debug mode is disabled:

```javascript
window.SyncQueueManager.config.debug = false;
```

### Custom Storage Prefix

If you have multiple ErgoSphere instances on the same domain, use a custom storage prefix:

```javascript
window.SyncQueueManager.config.storagePrefix = 'ergoSphere_instanceName_syncQueue_';
```

## Troubleshooting

If you encounter issues during installation:

1. Check browser console for JavaScript errors
2. Verify file paths are correct for your server configuration
3. Ensure the Enhanced PostgreSQL Loader is functioning correctly
4. Test connection to PostgreSQL server

For detailed troubleshooting steps, refer to the [Sync Queue Troubleshooting Guide](../docs/sync-queue-troubleshooting.md).

## Testing the Installation

After installation, you can test the functionality:

1. Open the admin dashboard
2. Temporarily disable network connection or use browser dev tools to simulate offline mode
3. Make changes to data and save
4. Verify that a sync indicator appears showing pending changes
5. Restore network connection
6. Verify that changes are automatically synchronized

## Updating from Previous Versions

When updating from a previous version:

1. Backup any customizations you've made to the configuration
2. Replace the existing JS and CSS files with the new versions
3. Reapply your configuration changes
4. Clear browser cache to ensure the latest files are loaded
