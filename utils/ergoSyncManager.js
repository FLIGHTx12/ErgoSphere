/**
 * ErgoSphere Bidirectional JSON Sync Manager
 * Keeps local and server JSON files synchronized with minimal intrusion
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const chokidar = require('chokidar');

class ErgoSyncManager {
  constructor(options = {}) {
    this.options = {
      serverUrl: process.env.HEROKU_URL || 'https://ergosphere.herokuapp.com',
      dataDir: path.join(__dirname, '..', 'data'),
      categories: ['loot', 'pvp', 'coop', 'movies', 'anime', 'singleplayer'],
      syncInterval: 60 * 60 * 1000, // Hourly background sync
      enableWatcher: true, // Watch for local file changes
      createBackups: true, // Create backups before overwriting
      ...options
    };
    
    this.syncInterval = null;
    this.fileWatcher = null;
    this.syncInProgress = false;
    this.lastSyncTimes = {};
    
    // Initialize sync times for each category
    this.options.categories.forEach(category => {
      this.lastSyncTimes[category] = { 
        local: 0, 
        server: 0 
      };
    });
  }
  
  async init() {
    console.log('🔄 ErgoSync Manager initializing...');
    
    // Create data directory if it doesn't exist
    try {
      await fs.mkdir(this.options.dataDir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.error('Error creating data directory:', err);
      }
    }
    
    // Load last sync times if available
    await this.loadSyncState();
    
    // Start file watcher if enabled
    if (this.options.enableWatcher) {
      this.startFileWatcher();
    }
    
    // Start regular sync interval
    this.startSyncInterval();
    
    // Do initial sync
    await this.syncAll();
    
    console.log('🔄 ErgoSync Manager initialized');
    return this;
  }
  
  /**
   * Starts watching local JSON files for changes
   */
  startFileWatcher() {
    const watchPatterns = this.options.categories.map(category => 
      path.join(this.options.dataDir, `${category}.json`)
    );
    
    this.fileWatcher = chokidar.watch(watchPatterns, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });
    
    this.fileWatcher.on('change', async (filePath) => {
      const filename = path.basename(filePath);
      const category = filename.replace('.json', '');
      
      // Don't react to our own sync operations
      if (this.syncInProgress) return;
      
      console.log(`🔄 Local file changed: ${filename}`);
      
      // Push changes to server
      await this.syncToServer(category);
    });
    
    console.log('🔄 Watching local JSON files for changes');
  }
  
  /**
   * Starts regular sync interval
   */
  startSyncInterval() {
    this.syncInterval = setInterval(async () => {
      await this.syncAll();
    }, this.options.syncInterval);
    
    console.log(`🔄 Regular sync scheduled every ${this.options.syncInterval / (60 * 1000)} minutes`);
  }
  
  /**
   * Sync all categories between local and server
   */
  async syncAll() {
    if (this.syncInProgress) {
      console.log('🔄 Sync already in progress, skipping');
      return;
    }
    
    this.syncInProgress = true;
    console.log('🔄 Starting full sync operation');
    
    try {
      for (const category of this.options.categories) {
        await this.syncCategory(category);
      }
      
      // Save updated sync state
      await this.saveSyncState();
      
      console.log('🔄 Full sync completed successfully');
    } catch (error) {
      console.error('🔄 Error during full sync:', error.message);
    } finally {
      this.syncInProgress = false;
    }
  }
  
  /**
   * Sync a specific category bidirectionally
   */
  async syncCategory(category) {
    console.log(`🔄 Syncing category: ${category}`);
    
    try {
      // Check local and server timestamps to determine direction
      const localTimestamp = await this.getLocalFileTimestamp(category);
      const serverTimestamp = await this.getServerTimestamp(category);
      
      // Compare with last known sync times
      const lastLocalSync = this.lastSyncTimes[category]?.local || 0;
      const lastServerSync = this.lastSyncTimes[category]?.server || 0;
      
      if (localTimestamp > lastLocalSync && serverTimestamp > lastServerSync) {
        // Both changed - need conflict resolution
        console.log(`🔄 Conflict detected for ${category} - resolving...`);
        await this.resolveConflict(category, localTimestamp, serverTimestamp);
      } else if (localTimestamp > lastLocalSync) {
        // Local is newer, push to server
        await this.syncToServer(category);
      } else if (serverTimestamp > lastServerSync) {
        // Server is newer, pull to local
        await this.syncFromServer(category);
      } else {
        console.log(`🔄 Category ${category} is already in sync`);
      }
      
      // Update sync times
      this.lastSyncTimes[category] = {
        local: localTimestamp,
        server: serverTimestamp
      };
      
    } catch (error) {
      console.error(`🔄 Error syncing ${category}:`, error.message);
    }
  }
  
  /**
   * Push local JSON file to server
   */
  async syncToServer(category) {
    const filePath = path.join(this.options.dataDir, `${category}.json`);
    console.log(`🔄 Pushing ${category} to server`);
    
    try {
      // Read local file
      const fileContent = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      // Push to server
      const response = await axios.put(
        `${this.options.serverUrl}/api/data/${category}`,
        data,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (response.status === 200) {
        console.log(`🔄 Successfully pushed ${category} to server`);
        
        // Update last sync time
        const localTimestamp = await this.getLocalFileTimestamp(category);
        this.lastSyncTimes[category].local = localTimestamp;
        this.lastSyncTimes[category].server = Date.now();
      } else {
        console.error(`🔄 Server returned error: ${response.status}`);
      }
    } catch (error) {
      console.error(`🔄 Error pushing ${category} to server:`, error.message);
      throw error;
    }
  }
  
  /**
   * Pull JSON data from server to local file
   */
  async syncFromServer(category) {
    const filePath = path.join(this.options.dataDir, `${category}.json`);
    console.log(`🔄 Pulling ${category} from server`);
    
    try {
      // Create backup if enabled
      if (this.options.createBackups) {
        await this.createBackup(category);
      }
      
      // Get data from server
      const response = await axios.get(`${this.options.serverUrl}/api/data/${category}`);
      
      if (response.status === 200 && response.data) {
        // Write to local file
        await fs.writeFile(
          filePath, 
          JSON.stringify(response.data, null, 2), 
          'utf8'
        );
        
        console.log(`🔄 Successfully pulled ${category} from server`);
        
        // Update last sync time
        const serverTimestamp = await this.getServerTimestamp(category);
        this.lastSyncTimes[category].server = serverTimestamp;
        this.lastSyncTimes[category].local = Date.now();
      } else {
        console.error(`🔄 Server returned error or empty data: ${response.status}`);
      }
    } catch (error) {
      console.error(`🔄 Error pulling ${category} from server:`, error.message);
      throw error;
    }
  }
  
  /**
   * Create a backup of the local JSON file
   */
  async createBackup(category) {
    const sourceFile = path.join(this.options.dataDir, `${category}.json`);
    const backupDir = path.join(this.options.dataDir, 'backups');
    const timestamp = Date.now();
    const backupFile = path.join(backupDir, `${category}_${timestamp}.json`);
    
    try {
      // Create backup directory if it doesn't exist
      await fs.mkdir(backupDir, { recursive: true });
      
      // Copy file to backup
      await fs.copyFile(sourceFile, backupFile);
      console.log(`🔄 Created backup: ${backupFile}`);
    } catch (error) {
      console.error(`🔄 Error creating backup:`, error.message);
    }
  }
  
  /**
   * Resolve conflict between local and server versions
   */
  async resolveConflict(category, localTimestamp, serverTimestamp) {
    // For now, use simple "newest wins" strategy
    if (localTimestamp > serverTimestamp) {
      console.log(`🔄 Local ${category} is newer, pushing to server`);
      await this.syncToServer(category);
    } else {
      console.log(`🔄 Server ${category} is newer, pulling to local`);
      await this.syncFromServer(category);
    }
    
    // More sophisticated merge strategies could be implemented here
  }
  
  /**
   * Get the last modified timestamp of a local file
   */
  async getLocalFileTimestamp(category) {
    const filePath = path.join(this.options.dataDir, `${category}.json`);
    
    try {
      const stats = await fs.stat(filePath);
      return stats.mtimeMs;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return 0; // File doesn't exist yet
      }
      console.error(`Error getting file timestamp:`, error);
      return 0;
    }
  }
  
  /**
   * Get the last modified timestamp from the server
   */
  async getServerTimestamp(category) {
    try {
      const response = await axios.head(
        `${this.options.serverUrl}/api/data/${category}`
      );
      
      const lastModified = response.headers['last-modified'];
      if (lastModified) {
        return new Date(lastModified).getTime();
      }
      
      return Date.now(); // Default to current time if no header
    } catch (error) {
      console.error(`Error getting server timestamp:`, error.message);
      return 0;
    }
  }
  
  /**
   * Save sync state to disk
   */
  async saveSyncState() {
    const statePath = path.join(this.options.dataDir, '.sync-state.json');
    
    try {
      await fs.writeFile(
        statePath,
        JSON.stringify({
          lastSyncTimes: this.lastSyncTimes,
          lastFullSync: Date.now()
        }, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Error saving sync state:', error);
    }
  }
  
  /**
   * Load sync state from disk
   */
  async loadSyncState() {
    const statePath = path.join(this.options.dataDir, '.sync-state.json');
    
    try {
      const data = await fs.readFile(statePath, 'utf8');
      const state = JSON.parse(data);
      
      if (state.lastSyncTimes) {
        this.lastSyncTimes = state.lastSyncTimes;
      }
      
      console.log('🔄 Loaded previous sync state');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error loading sync state:', error);
      }
    }
  }
  
  /**
   * Stop all sync operations
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    if (this.fileWatcher) {
      this.fileWatcher.close();
      this.fileWatcher = null;
    }
    
    console.log('🔄 ErgoSync Manager stopped');
  }
}

module.exports = ErgoSyncManager;
