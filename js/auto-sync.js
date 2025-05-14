/**
 * Auto-sync module for ErgoSphere admin panels
 * This script enables real-time data synchronization across multiple users
 */

class DataSyncManager {
  constructor(options = {}) {
    this.options = {
      checkInterval: 10000, // 10 seconds
      enableSync: true,
      ...options
    };
    
    this.trackingFiles = [];
    this.fileTimestamps = {};
    this.intervalId = null;
  }
  
  /**
   * Start tracking a file for changes
   * @param {string} filePath - Path to the JSON file to track
   * @param {string} containerId - ID of the container element to refresh
   */
  trackFile(filePath, containerId) {
    this.trackingFiles.push({
      path: filePath,
      containerId: containerId,
      lastModified: Date.now()
    });
    
    // Initialize with current timestamp
    fetch(`${filePath}?t=${Date.now()}`, { 
      method: 'HEAD'
    })
    .then(response => {
      const lastModified = response.headers.get('Last-Modified');
      if (lastModified) {
        this.fileTimestamps[filePath] = new Date(lastModified).getTime();
      } else {
        this.fileTimestamps[filePath] = Date.now();
      }
    })
    .catch(err => console.error(`Error checking file timestamp for ${filePath}:`, err));
  }
  
  /**
   * Start checking for changes in tracked files
   */
  startSync() {
    if (!this.options.enableSync || this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      this.checkForChanges();
    }, this.options.checkInterval);
    
    console.log('Data synchronization started');
  }
  
  /**
   * Stop checking for changes
   */
  stopSync() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Data synchronization stopped');
    }
  }
  
  /**
   * Check all tracked files for changes
   */
  checkForChanges() {
    this.trackingFiles.forEach(file => {
      fetch(`${file.path}?t=${Date.now()}`, { 
        method: 'HEAD'
      })
      .then(response => {
        const lastModified = response.headers.get('Last-Modified');
        if (lastModified) {
          const timestamp = new Date(lastModified).getTime();
          
          if (this.fileTimestamps[file.path] && timestamp > this.fileTimestamps[file.path]) {
            console.log(`File changed: ${file.path}`);
            this.fileTimestamps[file.path] = timestamp;
            this.refreshContainer(file.path, file.containerId);
          }
        }
      })
      .catch(err => console.error(`Error checking file timestamp for ${file.path}:`, err));
    });
  }
  
  /**
   * Refresh a container with new data
   * @param {string} filePath - Path to the JSON file
   * @param {string} containerId - ID of the container to refresh
   */
  refreshContainer(filePath, containerId) {
    // If refreshData is available, use it
    if (typeof refreshData === 'function') {
      refreshData(filePath, containerId);
      
      // Show sync notification
      const syncNotif = document.getElementById('sync-notification') || (() => {
        const el = document.createElement('div');
        el.id = 'sync-notification';
        el.style.position = 'fixed';
        el.style.bottom = '60px';
        el.style.right = '20px';
        el.style.padding = '8px 12px';
        el.style.borderRadius = '5px';
        el.style.backgroundColor = '#3498db';
        el.style.color = 'white';
        el.style.fontSize = '14px';
        el.style.fontWeight = 'bold';
        el.style.zIndex = '1000';
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.3s ease-in-out';
        document.body.appendChild(el);
        return el;
      })();
      
      syncNotif.textContent = 'Changes detected - Data synchronized';
      syncNotif.style.opacity = '1';
      
      setTimeout(() => {
        syncNotif.style.opacity = '0';
      }, 3000);
    }
  }
}

// Create global instance
window.dataSyncManager = new DataSyncManager();

document.addEventListener('DOMContentLoaded', function() {
  // Wait for the main admin.js to load
  setTimeout(() => {
    // Initialize auto-sync for each container
    document.querySelectorAll('.refresh-button').forEach(button => {
      const file = button.dataset.file;
      const containerId = button.dataset.container;
      
      if (file && containerId) {
        window.dataSyncManager.trackFile(file, containerId);
      }
    });
    
    // Start sync after a delay to ensure page is fully loaded
    setTimeout(() => {
      window.dataSyncManager.startSync();
    }, 2000);
  }, 500);
});
