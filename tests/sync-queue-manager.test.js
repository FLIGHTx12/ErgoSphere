/**
 * Integration Tests for Sync Queue Manager
 * 
 * This file contains tests to verify the Sync Queue Manager's functionality
 * including queueing changes, syncing, conflict resolution, and integration
 * with the main dashboard.
 */

// Mock console methods to reduce test output noise
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Setup global mocks for testing
class MockStorage {
    constructor() {
        this.store = {};
    }
    
    getItem(key) {
        return this.store[key] || null;
    }
    
    setItem(key, value) {
        this.store[key] = String(value);
    }
    
    removeItem(key) {
        delete this.store[key];
    }
    
    clear() {
        this.store = {};
    }
}

// Mock the fetch function
window.originalFetch = window.fetch;
let mockFetchResponses = {
    success: true,
    data: {}
};

// Test Helper Functions
function createMockPostgresLoader() {
    return {
        config: {
            primaryEndpoints: {
                heroku: 'https://ergosphere-api.herokuapp.com/api'
            },
            fallbackEndpoints: [
                '../../data',
                '../data',
                './data'
            ]
        },
        connectionStatus: 'connected',
        dataSource: 'PostgreSQL',
        cachedData: new Map(),
        
        async loadFromPostgreSQL(category) {
            if (!mockFetchResponses.success) {
                throw new Error('Mock PostgreSQL connection failed');
            }
            return mockFetchResponses.data[category] || [];
        },
        
        async saveToPostgreSQL(category, data) {
            if (!mockFetchResponses.success) {
                throw new Error('Mock PostgreSQL save failed');
            }
            mockFetchResponses.data[category] = data;
            return true;
        },
        
        async performHealthCheck() {
            return {
                postgresql: mockFetchResponses.success,
                jsonFiles: true,
                cached: true
            };
        }
    };
}

// Main test runner
async function runTests() {
    // Setup test environment
    console.log = (...args) => {
        if (args[0]?.startsWith('[TEST]')) {
            originalConsoleLog(...args);
        }
    };
    console.warn = (...args) => {};
    console.error = (...args) => {};
    
    // Override localStorage with mock
    const originalLocalStorage = window.localStorage;
    window.localStorage = new MockStorage();
    
    // Override fetch
    window.fetch = async (url, options) => {
        if (!mockFetchResponses.success) {
            throw new Error('Network error');
        }
        
        return {
            ok: true,
            status: 200,
            json: async () => {
                if (url.includes('/health')) {
                    return { status: 'ok' };
                }
                
                const category = url.split('/').pop().replace('.json', '');
                return mockFetchResponses.data[category] || [];
            }
        };
    };
    
    try {
        // Create test instances
        window.AdminDashboardDataLoader = createMockPostgresLoader();
        
        // Load the SyncQueueManager class
        await loadScript('../../js/admin-dashboard-sync-queue-manager.js');
        
        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Run the tests
        await testQueueCreation();
        await testPersistence();
        await testSynchronization();
        await testConflictResolution();
        await testAutoSync();
        
        console.log = originalConsoleLog;
        console.log('[TEST] All tests completed successfully');
        
    } catch (error) {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        console.error('[TEST FAILED]', error);
        
    } finally {
        // Restore original functions
        window.localStorage = originalLocalStorage;
        window.fetch = window.originalFetch;
        console.log = originalConsoleLog;
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
    }
}

// Individual Test Functions
async function testQueueCreation() {
    console.log('[TEST] Testing queue creation');
    
    // Simulate PostgreSQL failure
    mockFetchResponses.success = false;
    
    const testData = [
        { id: 1, name: 'Test Item 1', value: 100 },
        { id: 2, name: 'Test Item 2', value: 200 }
    ];
    
    // Queue changes
    await window.SyncQueueManager.queueChanges('testCategory', testData);
    
    // Verify queue contents
    const queueStatus = window.SyncQueueManager.getSyncStatus();
    
    if (queueStatus.pendingItems !== 1) {
        throw new Error(`Expected 1 pending item, got ${queueStatus.pendingItems}`);
    }
    
    if (!queueStatus.pendingCategories.includes('testCategory')) {
        throw new Error('Expected testCategory in pending categories');
    }
    
    console.log('[TEST] Queue creation test passed');
}

async function testPersistence() {
    console.log('[TEST] Testing persistence');
    
    // Get current queue state
    const queueBefore = window.SyncQueueManager.getSyncStatus();
    
    // Create a new instance (simulating page reload)
    window.SyncQueueManager = new SyncQueueManager();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify queue was restored
    const queueAfter = window.SyncQueueManager.getSyncStatus();
    
    if (queueAfter.pendingItems !== queueBefore.pendingItems) {
        throw new Error('Queue persistence failed');
    }
    
    console.log('[TEST] Persistence test passed');
}

async function testSynchronization() {
    console.log('[TEST] Testing synchronization');
    
    // First queue an item with PostgreSQL down
    mockFetchResponses.success = false;
    mockFetchResponses.data = { testCategory: [] };
    
    const testData = [
        { id: 3, name: 'Test Item 3', value: 300 },
        { id: 4, name: 'Test Item 4', value: 400 }
    ];
    
    await window.SyncQueueManager.queueChanges('syncTest', testData);
    
    // Now restore PostgreSQL and force sync
    mockFetchResponses.success = true;
    
    const syncResult = await window.SyncQueueManager.forceSyncAllChanges();
    
    if (!syncResult.success) {
        throw new Error(`Sync failed: ${syncResult.message}`);
    }
    
    // Verify queue is empty after successful sync
    const queueStatus = window.SyncQueueManager.getSyncStatus();
    
    if (queueStatus.pendingItems !== 0) {
        throw new Error(`Expected 0 pending items after sync, got ${queueStatus.pendingItems}`);
    }
    
    // Verify data was saved to PostgreSQL
    if (!mockFetchResponses.data.syncTest || 
        mockFetchResponses.data.syncTest.length !== 2) {
        throw new Error('Data was not properly synced to PostgreSQL');
    }
    
    console.log('[TEST] Synchronization test passed');
}

async function testConflictResolution() {
    console.log('[TEST] Testing conflict resolution');
    
    // Setup initial data in PostgreSQL
    mockFetchResponses.success = true;
    mockFetchResponses.data = { 
        conflictTest: [
            { id: 1, name: 'Original Item 1', value: 100, timestamp: new Date(2025, 5, 1).toISOString() },
            { id: 2, name: 'Original Item 2', value: 200, timestamp: new Date(2025, 5, 1).toISOString() }
        ] 
    };
    
    // Create local changes with newer timestamp
    const localChanges = [
        { id: 1, name: 'Updated Item 1', value: 150, timestamp: new Date(2025, 5, 10).toISOString() },
        { id: 3, name: 'New Item 3', value: 300, timestamp: new Date(2025, 5, 10).toISOString() }
    ];
    
    // Simulate offline mode
    mockFetchResponses.success = false;
    
    // Queue changes
    await window.SyncQueueManager.queueChanges('conflictTest', localChanges);
    
    // Restore connection and sync
    mockFetchResponses.success = true;
    await window.SyncQueueManager.forceSyncAllChanges();
    
    // Verify merged results
    const result = mockFetchResponses.data.conflictTest;
    
    // Should have 3 items total
    if (result.length !== 3) {
        throw new Error(`Expected 3 items after merge, got ${result.length}`);
    }
    
    // Item 1 should be updated
    const updatedItem = result.find(item => item.id === 1);
    if (updatedItem.name !== 'Updated Item 1' || updatedItem.value !== 150) {
        throw new Error('Conflict resolution failed for updated item');
    }
    
    // Item 3 should be added
    const newItem = result.find(item => item.id === 3);
    if (!newItem || newItem.name !== 'New Item 3') {
        throw new Error('Conflict resolution failed for new item');
    }
    
    console.log('[TEST] Conflict resolution test passed');
}

async function testAutoSync() {
    console.log('[TEST] Testing auto sync');
    
    // Setup
    mockFetchResponses.success = false;
    
    const testData = [
        { id: 5, name: 'Auto Sync Test', value: 500 }
    ];
    
    await window.SyncQueueManager.queueChanges('autoSyncTest', testData);
    
    // Simulate PostgreSQL becoming available
    mockFetchResponses.success = true;
    
    // Trigger a connection check (simulate timer)
    await window.SyncQueueManager._checkConnection();
    
    // Give it time to detect and perform auto-sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify queue is empty after auto sync
    const queueStatus = window.SyncQueueManager.getSyncStatus();
    
    if (window.SyncQueueManager.hasPendingChanges('autoSyncTest')) {
        throw new Error('Auto sync did not clear the queue');
    }
    
    console.log('[TEST] Auto sync test passed');
}

// Helper to load a script dynamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Run the tests when the page loads
document.addEventListener('DOMContentLoaded', runTests);
