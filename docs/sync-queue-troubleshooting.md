# Sync Queue Manager Troubleshooting Guide

This guide provides solutions for common issues that might arise when using the Sync Queue Manager.

## Common Issues and Solutions

### 1. Changes Not Being Queued When PostgreSQL is Down

**Symptoms:**
- Changes disappear when PostgreSQL is unavailable
- No sync indicator appears after saving

**Possible Causes:**
- Integration with the dashboard's saveData method failed
- Manual save implementation that bypasses the enhanced PostgreSQL loader

**Solutions:**
1. Verify the integration in browser console:
   ```javascript
   console.log(window.SyncQueueManager !== undefined);
   console.log(window.AdminDashboardDataLoader.saveData.toString().includes('SyncQueueManager'));
   ```

2. Manually queue changes if needed:
   ```javascript
   await window.SyncQueueManager.queueChanges('category', data);
   ```

### 2. Queued Changes Not Syncing When Connection Returns

**Symptoms:**
- Sync indicator remains visible even when connection is restored
- Changes remain in the queue indefinitely

**Possible Causes:**
- Background connection checking is disabled
- Health check API endpoint failure
- Sync errors during background sync

**Solutions:**
1. Force a manual synchronization:
   ```javascript
   await window.SyncQueueManager.forceSyncAllChanges();
   ```

2. Check connection status:
   ```javascript
   const health = await window.AdminDashboardDataLoader.performHealthCheck();
   console.log(health.postgresql ? 'PostgreSQL available' : 'PostgreSQL down');
   ```

3. Review browser console for sync errors

### 3. Conflict Resolution Issues

**Symptoms:**
- Data is inconsistent after syncing
- Some changes are lost during synchronization

**Possible Causes:**
- Conflict resolution strategy not appropriate for your data model
- Missing timestamps on data items
- Multiple conflicting changes to the same items

**Solutions:**
1. Change the conflict resolution strategy:
   ```javascript
   window.SyncQueueManager.config.conflictStrategy = 'merge'; // For deep merging
   // Other options: 'lastModified', 'remoteWins', 'localWins'
   ```

2. Ensure all data items have timestamp/modifiedAt properties

3. Implement custom conflict resolution:
   ```javascript
   // Override the _resolveConflicts method with custom implementation
   window.SyncQueueManager._resolveConflicts = function(queueItems, remoteData) {
       // Custom implementation
       return mergedData;
   };
   ```

### 4. LocalStorage Limitations

**Symptoms:**
- Error: "QuotaExceededError: The quota has been exceeded"
- Queue seems to lose items sporadically

**Possible Causes:**
- LocalStorage limit reached (typically 5-10MB)
- Large data sets exceed storage capacity

**Solutions:**
1. Clear unnecessary queued changes:
   ```javascript
   await window.SyncQueueManager.clearPendingChanges('largeCategory');
   ```

2. Implement data compression for large datasets:
   ```javascript
   // Example implementation for compressing data
   function compressData(data) {
       // Remove unnecessary fields, use shorthand property names, etc.
       return data.map(item => ({
           i: item.id,
           n: item.name,
           v: item.value
       }));
   }
   ```

3. Periodically clean up old queue items that have been successfully synced

### 5. Visual Indicators Not Appearing

**Symptoms:**
- No sync indicator appears when changes are queued
- No visual feedback during synchronization

**Possible Causes:**
- CSS conflicts with other dashboard styles
- DOM structure changes affecting indicator placement
- Indicator creation timing issues

**Solutions:**
1. Force recreation of indicators:
   ```javascript
   window.SyncQueueManager._createSyncStatusIndicator();
   ```

2. Check CSS conflicts in browser inspector

3. Update the indicator position in CSS:
   ```css
   .sync-queue-indicator {
       bottom: 60px; /* Adjust if overlapping with other elements */
       right: 30px;
       z-index: 1001; /* Increase if being covered by other elements */
   }
   ```

## Performance Optimization

If the Sync Queue Manager is causing performance issues:

1. Increase the check interval:
   ```javascript
   window.SyncQueueManager.config.checkInterval = 300000; // 5 minutes
   ```

2. Reduce the number of retry attempts:
   ```javascript
   window.SyncQueueManager.config.maxRetries = 1;
   ```

3. Implement batch size limits:
   ```javascript
   // Split large data sets into smaller batches
   const chunks = [];
   for (let i = 0; i < data.length; i += 100) {
       chunks.push(data.slice(i, i + 100));
   }
   
   // Queue each batch separately
   for (const chunk of chunks) {
       await window.SyncQueueManager.queueChanges(category, chunk);
   }
   ```

## Debugging

Enable debug mode for detailed logging:

```javascript
window.SyncQueueManager.config.debug = true;
```

View the current sync queue state:

```javascript
console.log(window.SyncQueueManager.syncQueue);
console.log(window.SyncQueueManager.getSyncStatus());
```

## Recovery Steps

### Last Resort: Clear All Pending Changes

If the sync queue becomes corrupt or causes persistent issues:

```javascript
await window.SyncQueueManager.clearPendingChanges();
```

### Export Queued Changes for Manual Recovery

```javascript
function exportQueuedChanges() {
    const queueData = window.localStorage.getItem('ergoSphere_syncQueue_pendingSync');
    if (queueData) {
        const dataUri = 'data:text/json;charset=utf-8,' + encodeURIComponent(queueData);
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = 'syncQueue_backup_' + new Date().toISOString() + '.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
```
