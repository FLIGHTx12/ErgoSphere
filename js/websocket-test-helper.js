/**
 * WebSocket Test Helper for ErgoSphere
 * 
 * This script provides additional functions to help test WebSocket functionality
 * and improve the robustness of the WebSocket connection.
 */

/**
 * Ensure WebSocket connection is established
 */
function ensureWebSocketConnection() {
  // Check if we already have a connection
  if (window.wsConnection && 
      window.wsConnection.ws && 
      window.wsConnection.ws.readyState === WebSocket.OPEN) {
    console.log('WebSocket connection already established');
    return true;
  }
  
  // Try to use setupWebSocket if available
  if (typeof window.setupWebSocket === 'function') {
    try {
      console.log('Setting up WebSocket connection using setupWebSocket...');
      window.setupWebSocket();
      
      // Give it a moment to connect
      setTimeout(() => {
        if (window.wsConnection && window.wsConnection.ws) {
          console.log('WebSocket connection successfully established');
        } else {
          console.warn('Failed to establish WebSocket connection');
        }
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error setting up WebSocket connection:', error);
    }
  }
    // Manual fallback implementation
  if (typeof WebSocketReconnector !== 'undefined') {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      let host = window.location.host;
      
      if (window.location.port === '1550') {
        host = host.replace(':1550', ':3000');
      }
      
      // Add error handling for the URL construction
      let wsUrl;
      try {
        wsUrl = `${protocol}//${host}`;
        console.log(`Generated WebSocket URL: ${wsUrl}`);
      } catch (urlError) {
        console.error('Error constructing WebSocket URL:', urlError);
        wsUrl = 'ws://localhost:3000'; // Fallback URL
      }
      
      console.log('Manually creating WebSocket connection using WebSocketReconnector');
      window.wsConnection = new WebSocketReconnector(wsUrl, {
        reconnectInterval: 2000,
        maxReconnectInterval: 10000,
        reconnectDecay: 1.3,
        maxReconnectAttempts: 5
      });
      
      return true;
    } catch (error) {
      console.error('Manual WebSocket connection failed:', error);
    }
  } else {
    console.warn('WebSocketReconnector not available, cannot create WebSocket connection');
  }
  
  return false;
}

// Make function available globally
window.ensureWebSocketConnection = ensureWebSocketConnection;

// Try to establish connection when the script loads if not already connected
document.addEventListener('DOMContentLoaded', () => {
  // Wait a short time to let other scripts initialize first
  setTimeout(() => {
    if (!window.wsConnection) {
      ensureWebSocketConnection();
    }
  }, 2000);
});
