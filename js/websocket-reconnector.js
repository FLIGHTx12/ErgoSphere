/**
 * WebSocket Reconnector for ErgoSphere
 * 
 * This script adds automatic reconnection capabilities to WebSocket connections
 * with exponential backoff to prevent overwhelming the server.
 */

class WebSocketReconnector {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      reconnectInterval: 1000, // Start with 1 second
      maxReconnectInterval: 30000, // Max of 30 seconds
      reconnectDecay: 1.5, // Exponential factor
      maxReconnectAttempts: 10, // Maximum reconnection attempts
      ...options
    };
    
    this.ws = null;
    this.reconnectAttempts = 0;
    this.reconnectTimeout = null;
    this.listeners = {
      message: [],
      open: [],
      close: [],
      error: [],
      reconnecting: [],
      reconnected: [],
      maxAttemptsExceeded: []
    };
    
    this.connect();
  }
  
  /**
   * Connect or reconnect to the WebSocket server
   */
  connect() {
    if (this.ws) {
      this.ws.onclose = null; // Remove the onclose handler to prevent recursive reconnects
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }
      console.log(`Connecting to WebSocket: ${this.url}`);    try {
      // Safety check to ensure URL is valid
      if (!this.url || typeof this.url !== 'string' || !this.url.startsWith('ws')) {
        throw new Error(`Invalid WebSocket URL: ${this.url}`);
      }
      
      this.ws = new WebSocket(this.url);
    
      this.ws.onopen = (event) => {
        console.log('WebSocket connection established');
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        
        // Notify listeners with error handling
        this.listeners.open.forEach(callback => {
          try {
            callback(event);
          } catch (err) {
            console.error('Error in WebSocket open listener:', err);
          }
        });
        
        if (this.reconnectAttempts > 0) {
          // This was a reconnection
          this.listeners.reconnected.forEach(callback => {
            try {
              callback({ attempts: this.reconnectAttempts });
            } catch (err) {
              console.error('Error in WebSocket reconnected listener:', err);
            }
          });
        }
        
        // Show a notification using our new helper
        if (typeof window.showNotification === 'function') {
          window.showNotification('Server connection established', 'success', 3000);
        }
      };
    } catch (e) {
      console.error('Failed to create WebSocket connection:', e);
      // Schedule a reconnect attempt
      this.scheduleReconnect();
    }
      this.ws.onmessage = (event) => {
      // Notify listeners with error handling
      this.listeners.message.forEach(callback => {
        try {
          callback(event);
        } catch (err) {
          console.error('Error in WebSocket message listener:', err);
        }
      });
    };
    
    this.ws.onclose = (event) => {
      // Notify close listeners with error handling
      this.listeners.close.forEach(callback => {
        try {
          callback(event);
        } catch (err) {
          console.error('Error in WebSocket close listener:', err);
        }
      });
      
      // Don't reconnect if the close was intentional
      if (!event.wasClean && this.options.autoReconnect !== false) {
        this.scheduleReconnect();
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Notify error listeners with error handling
      this.listeners.error.forEach(callback => {
        try {
          callback(error);
        } catch (err) {
          console.error('Error in WebSocket error listener:', err);
        }
      });
    };
  }
  
  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts > this.options.maxReconnectAttempts) {
      console.error(`Max WebSocket reconnection attempts (${this.options.maxReconnectAttempts}) exceeded`);
      this.listeners.maxAttemptsExceeded.forEach(callback => 
        callback({ attempts: this.reconnectAttempts })
      );
      return;
    }
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.options.reconnectInterval * Math.pow(this.options.reconnectDecay, this.reconnectAttempts - 1),
      this.options.maxReconnectInterval
    );
    
    console.log(`WebSocket reconnecting in ${Math.round(delay / 1000)}s (attempt ${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);
      // Notify listeners that we're reconnecting with error handling
    this.listeners.reconnecting.forEach(callback => {
      try {
        callback({ attempts: this.reconnectAttempts, delay });
      } catch (err) {
        console.error('Error in WebSocket reconnecting listener:', err);
      }
    });
    
    // Create a safe reconnect timeout
    try {
      this.reconnectTimeout = setTimeout(() => {
        try {
          this.connect();
        } catch (err) {
          console.error('Error during reconnect attempt:', err);
        }
      }, delay);
    } catch (err) {
      console.error('Error setting reconnect timeout:', err);
    }
  }
  
  /**
   * Send data through the WebSocket
   * @param {*} data - The data to send
   * @returns {boolean} - Whether the send was successful
   */
  send(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message - WebSocket not open');
      return false;
    }
    
    try {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }
  
  /**
   * Add an event listener
   * @param {string} event - Event type: 'message', 'open', 'close', 'error', 'reconnecting', 'reconnected', 'maxAttemptsExceeded'
   * @param {function} callback - The callback function
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    } else {
      console.warn(`Unknown WebSocket event type: ${event}`);
    }
    return this; // For chaining
  }
  
  /**
   * Remove an event listener
   * @param {string} event - Event type
   * @param {function} callback - The callback to remove
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
    return this; // For chaining
  }
  
  /**
   * Close the WebSocket connection
   */
  close() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      // Prevent reconnection attempts when we're explicitly closing
      this.ws.onclose = () => {};
      this.ws.close();
      this.ws = null;
    }
  }
  
  /**
   * Get the current state of the WebSocket connection
   * @returns {number} - WebSocket readyState (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)
   */
  getState() {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }
}

// Make available globally
window.WebSocketReconnector = WebSocketReconnector;
