/**
 * Casino Real-Time Sync Manager
 * Extends the existing auto-sync pattern to provide WebSocket-based real-time updates
 * for the casino bet log system
 */

class CasinoSyncManager {
  constructor(options = {}) {
    this.options = {
      enableRealTimeSync: true,
      fallbackToPolling: true,
      pollingInterval: 5000, // 5 seconds fallback polling
      reconnectAttempts: 5,
      reconnectDelay: 3000,
      ...options
    };
    
    this.ws = null;
    this.isConnected = false;
    this.reconnectCount = 0;
    this.pollingInterval = null;
    this.lastKnownWeekKey = null;
    this.connectionAttempts = 0;
    
    // Track if we're currently rendering to avoid duplicate calls
    this.isRendering = false;
    
    this.init();
  }
  
  init() {
    if (this.options.enableRealTimeSync) {
      this.connectWebSocket();
    } else if (this.options.fallbackToPolling) {
      this.startPolling();
    }
    
    // Listen for page visibility changes to manage connections
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handlePageHidden();
      } else {
        this.handlePageVisible();
      }
    });
    
    // Handle window unload
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }
  
  connectWebSocket() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return; // Already connected
    }
    
    try {
      // Determine WebSocket URL based on current protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/casino`;
      
      console.log('🎰 Attempting WebSocket connection to:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('🎰 Casino WebSocket connected');
        this.isConnected = true;
        this.reconnectCount = 0;
        this.connectionAttempts = 0;
        
        // Stop polling if WebSocket is connected
        this.stopPolling();
        
        // Subscribe to casino updates
        this.subscribeToUpdates();
        
        // Show connection status
        this.showConnectionStatus('Connected', 'success');
      };
      
      this.ws.onmessage = (event) => {
        this.handleWebSocketMessage(event);
      };
      
      this.ws.onclose = (event) => {
        console.log('🎰 Casino WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.handleDisconnection();
      };
      
      this.ws.onerror = (error) => {
        console.error('🎰 Casino WebSocket error:', error);
        this.handleConnectionError();
      };
      
    } catch (error) {
      console.error('🎰 Failed to create WebSocket connection:', error);
      this.handleConnectionError();
    }
  }
  
  handleWebSocketMessage(event) {
    try {
      const message = JSON.parse(event.data);
      console.log('🎰 Received WebSocket message:', message);
        switch (message.type) {
        case 'BET_CREATED':
        case 'BET_UPDATED':
        case 'BET_DELETED':
        case 'BET_STATUS_CHANGED':
          this.handleBetUpdate(message);
          break;
          
        case 'WEEK_BETS_UPDATED':
          this.handleWeekUpdate(message);
          break;
          
        case 'PONG':
          // Handle ping/pong for connection keep-alive
          break;

        case 'connection':
          // Handle connection status updates from the server
          console.log('🎰 Connection status update:', message.status);
          break;
          
        default:
          console.log('🎰 Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('🎰 Error parsing WebSocket message:', error);
    }
  }
  
  handleBetUpdate(message) {
    const { weekKey, betId, action } = message.data;
    
    // Only update if it's for the current week we're viewing
    const currentWeekKey = this.getCurrentWeekKey();
    if (weekKey !== currentWeekKey) {
      return;
    }
    
    // Show update notification
    this.showUpdateNotification(action, message.data.userName);
    
    // Refresh the bet log
    this.refreshBetLog();
  }
  
  handleWeekUpdate(message) {
    const { weekKey } = message.data;
    const currentWeekKey = this.getCurrentWeekKey();
    
    if (weekKey === currentWeekKey) {
      this.refreshBetLog();
    }
  }
  
  subscribeToUpdates() {
    if (this.isConnected && this.ws) {
      const currentWeekKey = this.getCurrentWeekKey();
      
      this.ws.send(JSON.stringify({
        type: 'SUBSCRIBE_CASINO',
        data: {
          weekKey: currentWeekKey
        }
      }));
      
      this.lastKnownWeekKey = currentWeekKey;
      console.log('🎰 Subscribed to casino updates for week:', currentWeekKey);
    }
  }
  
  // Method to notify server of bet changes (called when user makes changes)
  notifyBetChange(action, betData) {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'BET_CHANGE',
        data: {
          action,
          weekKey: this.getCurrentWeekKey(),
          ...betData
        }
      }));
    }
  }
  
  handleDisconnection() {
    if (this.reconnectCount < this.options.reconnectAttempts) {
      console.log(`🎰 Attempting to reconnect (${this.reconnectCount + 1}/${this.options.reconnectAttempts})...`);
      
      setTimeout(() => {
        this.reconnectCount++;
        this.connectWebSocket();
      }, this.options.reconnectDelay);
      
      this.showConnectionStatus('Reconnecting...', 'warning');
    } else {
      console.log('🎰 Max reconnection attempts reached, falling back to polling');
      this.showConnectionStatus('Offline - Using local updates', 'error');
      
      if (this.options.fallbackToPolling) {
        this.startPolling();
      }
    }
  }
  
  handleConnectionError() {
    this.connectionAttempts++;
    
    // If WebSocket fails, fall back to polling immediately
    if (this.connectionAttempts >= 2 && this.options.fallbackToPolling) {
      console.log('🎰 WebSocket connection failed, falling back to polling');
      this.startPolling();
      this.showConnectionStatus('Using polling updates', 'warning');
    }
  }
  
  startPolling() {
    if (this.pollingInterval) {
      return; // Already polling
    }
    
    console.log('🎰 Starting polling for bet updates');
    
    this.pollingInterval = setInterval(() => {
      this.checkForUpdates();
    }, this.options.pollingInterval);
    
    // Check immediately
    this.checkForUpdates();
  }
  
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('🎰 Stopped polling for bet updates');
    }
  }
  
  async checkForUpdates() {
    // Check if the current week has changed
    const currentWeekKey = this.getCurrentWeekKey();
    if (currentWeekKey !== this.lastKnownWeekKey) {
      this.lastKnownWeekKey = currentWeekKey;
      this.refreshBetLog();
      return;
    }
    
    // For polling, we'll just refresh periodically
    // In a more sophisticated implementation, we could check timestamps
    this.refreshBetLog();
  }
  
  refreshBetLog() {
    // Prevent duplicate renders
    if (this.isRendering) {
      return;
    }
    
    this.isRendering = true;
    
    // Call the existing renderBetLog function
    if (typeof window.renderBetLog === 'function') {
      window.renderBetLog().then(() => {
        this.isRendering = false;
      }).catch((error) => {
        console.error('🎰 Error refreshing bet log:', error);
        this.isRendering = false;
      });
    } else {
      this.isRendering = false;
      console.warn('🎰 renderBetLog function not found');
    }
  }
  
  showUpdateNotification(action, userName) {
    const notifications = document.getElementById('casino-sync-notifications') || this.createNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = 'casino-sync-notification';
    
    let message = '';
    switch (action) {
      case 'created':
        message = `${userName} placed a new bet`;
        break;
      case 'updated':
        message = `${userName} updated a bet`;
        break;
      case 'deleted':
        message = `${userName} deleted a bet`;
        break;
      case 'status_changed':
        message = `Bet status updated`;
        break;
      default:
        message = 'Bet log updated';
    }
    
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      backgroundColor: '#3498db',
      color: 'white',
      padding: '8px 12px',
      marginBottom: '5px',
      borderRadius: '4px',
      fontSize: '14px',
      opacity: '0',
      transform: 'translateX(100%)',
      transition: 'all 0.3s ease-in-out'
    });
    
    notifications.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  showConnectionStatus(message, type) {
    // Check for the new compact status element first
    let statusEl = document.getElementById('connection-status');
    
    if (statusEl) {
      // Update the compact status indicator
      let status;
      let shortMessage;
      
      switch (type) {
        case 'success': 
          status = 'connected';
          shortMessage = 'Online';
          break;
        case 'error': 
          status = 'disconnected';
          shortMessage = 'Offline';
          break;
        case 'warning': 
        default: 
          status = 'connecting';
          shortMessage = 'Syncing';
          break;
      }
      
      statusEl.className = `connection-status-compact ${status}`;
      
      // Update the dot and text separately
      const textSpan = statusEl.querySelector('.status-text');
      if (textSpan) {
        textSpan.textContent = shortMessage;
      } else {
        // If elements don't exist yet, rebuild the content
        statusEl.innerHTML = `
          <span class="status-dot"></span>
          <span class="status-text">${shortMessage}</span>
        `;
      }
      return;
    }
    
    // Fall back to the old notification method if compact indicator not found
    statusEl = document.getElementById('casino-connection-status');
    
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.id = 'casino-connection-status';
      Object.assign(statusEl.style, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: '10000',
        transition: 'all 0.3s ease'
      });
      document.body.appendChild(statusEl);
    }
    
    statusEl.textContent = message;
    
    // Set color based on type
    const colors = {
      success: { bg: '#2ecc71', color: 'white' },
      warning: { bg: '#f39c12', color: 'white' },
      error: { bg: '#e74c3c', color: 'white' }
    };
    
    const colorScheme = colors[type] || colors.success;
    statusEl.style.backgroundColor = colorScheme.bg;
    statusEl.style.color = colorScheme.color;
    
    // Hide success messages after a delay
    if (type === 'success') {
      setTimeout(() => {
        statusEl.style.opacity = '0';
        setTimeout(() => {
          if (statusEl.parentNode) {
            statusEl.parentNode.removeChild(statusEl);
          }
        }, 300);
      }, 2000);
    }
  }
  
  createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'casino-sync-notifications';
    Object.assign(container.style, {
      position: 'fixed',
      top: '60px',
      right: '10px',
      zIndex: '9999',
      maxWidth: '300px'
    });
    document.body.appendChild(container);
    return container;
  }
  
  handlePageHidden() {
    // Reduce activity when page is hidden
    if (this.isConnected && this.ws) {
      // Send a message that we're going inactive
      this.ws.send(JSON.stringify({
        type: 'CLIENT_INACTIVE'
      }));
    }
  }
  
  handlePageVisible() {
    // Restore activity when page becomes visible
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'CLIENT_ACTIVE'
      }));
      
      // Re-subscribe to current week
      this.subscribeToUpdates();
    } else if (!this.isConnected) {
      // Try to reconnect if not connected
      this.connectWebSocket();
    }
    
    // Refresh the bet log when page becomes visible
    this.refreshBetLog();
  }
  
  getCurrentWeekKey() {
    // Use the same week key logic as the existing casino system
    if (typeof window.getCurrentWeekKey === 'function') {
      return window.getCurrentWeekKey();
    }
    
    // Fallback implementation
    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay());
    return sunday.toISOString().slice(0, 10);
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.stopPolling();
    this.isConnected = false;
  }
  
  // Public method to manually trigger a sync
  forceSync() {
    if (this.isConnected) {
      this.subscribeToUpdates();
    }
    this.refreshBetLog();
  }
}

// Create global instance
window.casinoSyncManager = new CasinoSyncManager();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎰 Casino Real-Time Sync Manager initialized');
  
  // Start syncing after a short delay to ensure other casino scripts are loaded
  setTimeout(() => {
    if (window.casinoSyncManager && typeof window.renderBetLog === 'function') {
      console.log('🎰 Casino sync manager ready');
    } else {
      console.warn('🎰 Casino sync manager waiting for dependencies...');
      
      // Check again after a longer delay
      setTimeout(() => {
        if (typeof window.renderBetLog !== 'function') {
          console.error('🎰 renderBetLog function not available, sync may not work properly');
        }
      }, 5000);
    }
  }, 1000);
});
