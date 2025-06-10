# ErgoSphere Admin Dashboard Sync Queue Manager

## Overview

The Sync Queue Manager is a robust system for handling changes made to the admin dashboard when PostgreSQL is temporarily unavailable. It ensures that all changes made in fallback mode are properly synchronized when connectivity is restored.

## Features

1. **Persistent Change Queueing**
   - Automatically detects when PostgreSQL is unavailable and queues changes
   - Stores pending changes safely in localStorage to persist across page reloads
   - Preserves data integrity even through browser crashes or network issues

2. **Automatic Background Synchronization**
   - Periodically checks PostgreSQL connectivity in the background
   - Automatically synchronizes queued changes when connection is restored
   - Priorities and batches changes for efficient synchronization

3. **Conflict Resolution**
   - Implements multiple conflict resolution strategies:
     - Last modified wins (default)
     - Remote data priority
     - Local changes priority
     - Deep merge by identifier
   - Prevents data loss when changes are made on multiple devices

4. **Visual Indicators**
   - Displays non-intrusive indicator for pending changes
   - Shows real-time sync status information
   - Provides detailed view of queued changes by category
   - Clearly indicates sync progress during operations

5. **Manual Controls**
   - Allows manual triggering of synchronization
   - Provides options to clear pending changes if needed
   - Shows detailed sync statistics and history

## How It Works

1. **Normal Operation Mode**
   - Changes are directly saved to PostgreSQL
   - No items are queued

2. **Fallback Mode Activation**
   - When PostgreSQL is unavailable, changes are automatically queued
   - A small indicator appears showing the number of pending changes
   - User can continue working normally

3. **Background Synchronization**
   - System periodically checks PostgreSQL connectivity
   - When connection is restored, queued changes are synchronized
   - Visual indicators show sync progress

4. **Multi-Device Synchronization**
   - When multiple users make changes, timestamps are used for conflict resolution
   - Latest changes take priority by default
   - Data integrity is maintained across all devices

## Integration with Existing Dashboard

The Sync Queue Manager seamlessly integrates with the existing dashboard functionality:

- Overrides the save operation to queue changes when PostgreSQL is unavailable
- Works with the existing enhanced PostgreSQL loader
- Provides visibility into the sync status without disrupting workflow

## Usage Examples

### Automatic Queueing

Changes are automatically queued when PostgreSQL is unavailable:

```javascript
// This happens automatically when PostgreSQL is down
await window.AdminDashboardDataLoader.saveData('coop', coopData);
// Data is saved locally and queued for sync
```

### Checking Pending Changes

```javascript
// Check if there are pending changes
const hasPending = window.SyncQueueManager.hasPendingChanges();
console.log(`Has pending changes: ${hasPending}`);

// Check for a specific category
const hasPendingCoop = window.SyncQueueManager.hasPendingChanges('coop');
console.log(`Has pending coop changes: ${hasPendingCoop}`);
```

### Manual Sync Triggering

```javascript
// Force synchronization of all pending changes
const syncResult = await window.SyncQueueManager.forceSyncAllChanges();
if (syncResult.success) {
    console.log(`Successfully synced ${syncResult.itemsSynced} items`);
} else {
    console.error(`Sync failed: ${syncResult.message}`);
}
```

### Getting Sync Status

```javascript
// Get detailed sync status
const status = window.SyncQueueManager.getSyncStatus();
console.log(`Pending items: ${status.pendingItems}`);
console.log(`Last successful sync: ${status.lastSuccessfulSync}`);
console.log(`Categories pending sync: ${status.pendingCategories.join(', ')}`);
```

## Configuration Options

The Sync Queue Manager can be configured by modifying the `config` object:

```javascript
// Example of changing configuration
window.SyncQueueManager.config.checkInterval = 120000; // Check every 2 minutes
window.SyncQueueManager.config.conflictStrategy = 'remoteWins'; // Remote data priority
window.SyncQueueManager.config.debug = true; // Enable detailed logging
```

### Available Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `storagePrefix` | `'ergoSphere_syncQueue_'` | Prefix for localStorage keys |
| `checkInterval` | `60000` | How often to check connection (ms) |
| `maxRetries` | `3` | Maximum retry attempts for sync |
| `retryDelay` | `2000` | Delay between retry attempts (ms) |
| `conflictStrategy` | `'lastModified'` | How to resolve conflicts |
| `debug` | `false` | Enable verbose logging |

## Technical Details

- Uses localStorage for persistent queue storage
- Efficiently handles large data sets with batch processing
- Implements progressive retry mechanisms
- Low overhead on main UI thread
- Batches changes for efficient network usage
- Memory-efficient storage format for large data sets
