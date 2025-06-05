/**
 * Server Status Monitor for ErgoSphere
 * 
 * This script checks the status of the API server and displays a visual indicator
 * to help debug connection issues.
 */

let serverStatusCheckInterval;
let serverIsConnected = false;

document.addEventListener('DOMContentLoaded', () => {
  // Create server status indicator
  createServerStatusIndicator();
  
  // Check server status immediately and then periodically
  checkServerStatus();
  serverStatusCheckInterval = setInterval(checkServerStatus, 30000); // Check every 30 seconds
});

/**
 * Create the visual server status indicator
 */
function createServerStatusIndicator() {
  const statusIndicator = document.createElement('div');
  statusIndicator.id = 'server-status-indicator';
  statusIndicator.className = 'status-unknown';
  statusIndicator.title = 'Checking server connection...';
  
  // Style the indicator
  statusIndicator.style.position = 'fixed';
  statusIndicator.style.top = '10px';
  statusIndicator.style.right = '10px';
  statusIndicator.style.width = '15px';
  statusIndicator.style.height = '15px';
  statusIndicator.style.borderRadius = '50%';
  statusIndicator.style.backgroundColor = '#888';
  statusIndicator.style.border = '2px solid #555';
  statusIndicator.style.zIndex = '9999';
  statusIndicator.style.cursor = 'pointer';
  statusIndicator.style.transition = 'all 0.3s ease';
  
  // Add click handler to show more info
  statusIndicator.addEventListener('click', showServerStatusDetails);
  
  // Add to the document
  document.body.appendChild(statusIndicator);
}

/**
 * Check the status of the server/API connection
 */
async function checkServerStatus() {
  const statusIndicator = document.getElementById('server-status-indicator');
  if (!statusIndicator) return;
  
  // Get base URL, taking into account possible port redirects
  const baseUrl = sessionStorage.getItem('apiBaseUrl') || window.location.origin;
  
  try {
    // Try a simple endpoint that should always be available
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (response.ok) {
      // Server is up
      statusIndicator.className = 'status-connected';
      statusIndicator.title = 'Server is connected';
      statusIndicator.style.backgroundColor = '#00cc00';
      statusIndicator.style.border = '2px solid #008800';
      serverIsConnected = true;
    } else {
      // Server returned error
      statusIndicator.className = 'status-error';
      statusIndicator.title = `Server error: ${response.status} ${response.statusText}`;
      statusIndicator.style.backgroundColor = '#ff9900';
      statusIndicator.style.border = '2px solid #cc6600';
      serverIsConnected = false;
    }
  } catch (error) {
    // Connection failed completely
    statusIndicator.className = 'status-disconnected';
    statusIndicator.title = 'Cannot connect to server';
    statusIndicator.style.backgroundColor = '#ff0000';
    statusIndicator.style.border = '2px solid #cc0000';
    serverIsConnected = false;
    
    console.error('Server connection check failed:', error);
  }
}

/**
 * Display detailed server status information when the indicator is clicked
 */
function showServerStatusDetails() {
  // Get base URL
  const baseUrl = sessionStorage.getItem('apiBaseUrl') || window.location.origin;
  
  // Create detail popup
  const popup = document.createElement('div');
  popup.id = 'server-status-details';
  
  // Style the popup
  popup.style.position = 'fixed';
  popup.style.top = '40px';
  popup.style.right = '10px';
  popup.style.padding = '15px';
  popup.style.backgroundColor = '#222';
  popup.style.color = '#fff';
  popup.style.borderRadius = '5px';
  popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  popup.style.zIndex = '9998';
  popup.style.maxWidth = '300px';
  
  // Add content based on connection status
  if (serverIsConnected) {
    popup.innerHTML = `
      <h3 style="margin-top: 0; color: #00cc00;">✓ Server Connected</h3>
      <p>API URL: ${baseUrl}</p>
      <p>All systems operational</p>
      <button id="check-server-now" style="background: #444; color: #fff; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">Check Now</button>
      <button id="close-server-details" style="background: #666; color: #fff; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; margin-left: 5px;">Close</button>
    `;
  } else {
    popup.innerHTML = `
      <h3 style="margin-top: 0; color: #ff0000;">✗ Server Disconnected</h3>
      <p>API URL: ${baseUrl}</p>
      <p>Possible issues:</p>
      <ul>
        <li>Node.js server not running</li>
        <li>Wrong port configuration</li>
        <li>Network connectivity issue</li>
      </ul>
      <p>Fallback: Local storage will be used</p>
      <button id="check-server-now" style="background: #444; color: #fff; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">Check Now</button>
      <button id="close-server-details" style="background: #666; color: #fff; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; margin-left: 5px;">Close</button>
    `;
  }
  
  // Add to the document
  document.body.appendChild(popup);
  
  // Add event listeners
  document.getElementById('check-server-now').addEventListener('click', () => {
    checkServerStatus();
    // Remove the popup
    document.getElementById('server-status-details').remove();
  });
  
  document.getElementById('close-server-details').addEventListener('click', () => {
    document.getElementById('server-status-details').remove();
  });
  
  // Auto close after 10 seconds
  setTimeout(() => {
    const element = document.getElementById('server-status-details');
    if (element) element.remove();
  }, 10000);
}
