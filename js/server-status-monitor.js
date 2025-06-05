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
    // Style the indicator - positioned bottom-right and smaller
  statusIndicator.style.position = 'fixed';
  statusIndicator.style.bottom = '10px'; // Changed from top to bottom
  statusIndicator.style.right = '10px';
  statusIndicator.style.width = '10px'; // Reduced from 15px to 10px
  statusIndicator.style.height = '10px'; // Reduced from 15px to 10px
  statusIndicator.style.borderRadius = '50%';
  statusIndicator.style.backgroundColor = '#888';
  statusIndicator.style.border = '1px solid #555'; // Reduced border from 2px to 1px
  statusIndicator.style.zIndex = '9999';
  statusIndicator.style.cursor = 'pointer';
  statusIndicator.style.transition = 'all 0.3s ease';
  statusIndicator.style.opacity = '0.7'; // Added slight transparency
  
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
      statusIndicator.style.border = '1px solid #008800'; // Changed from 2px to 1px
      serverIsConnected = true;
    } else {
      // Server returned error
      statusIndicator.className = 'status-error';
      statusIndicator.title = `Server error: ${response.status} ${response.statusText}`;
      statusIndicator.style.backgroundColor = '#ff9900';
      statusIndicator.style.border = '1px solid #cc6600'; // Changed from 2px to 1px
      serverIsConnected = false;
    }
  } catch (error) {
    // Connection failed completely
    statusIndicator.className = 'status-disconnected';
    statusIndicator.title = 'Cannot connect to server';
    statusIndicator.style.backgroundColor = '#ff0000';
    statusIndicator.style.border = '1px solid #cc0000'; // Changed from 2px to 1px
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
  
  // Fetch detailed health data
  fetchDetailedHealthInfo(baseUrl);
  
  // Create detail popup
  const popup = document.createElement('div');
  popup.id = 'server-status-details';
    // Style the popup - positioned above the indicator (which is now at bottom)
  popup.style.position = 'fixed';
  popup.style.bottom = '30px'; // Changed from top to bottom
  popup.style.right = '10px';
  popup.style.padding = '15px';
  popup.style.backgroundColor = '#222';
  popup.style.color = '#fff';
  popup.style.borderRadius = '5px';
  popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  popup.style.zIndex = '9998';
  popup.style.maxWidth = '400px'; // Made wider to accommodate more info
  popup.style.fontFamily = 'monospace'; // Better for technical details
  
  // Set initial loading content
  popup.innerHTML = `
    <h3 style="margin-top: 0; color: #888;">Loading server status...</h3>
    <p>Fetching detailed health information</p>
    <div style="display: flex; justify-content: center; margin: 15px 0;">
      <div class="loading-spinner" style="width: 20px; height: 20px; border: 3px solid #888; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    </div>
    <button id="close-server-details" style="background: #666; color: #fff; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; margin-left: 5px;">Close</button>

    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .health-metric {
        display: flex;
        justify-content: space-between;
        margin: 5px 0;
        border-bottom: 1px solid #444;
        padding-bottom: 3px;
      }
      .health-metric-label {
        font-weight: bold;
        color: #aaa;
      }
      .health-metric-value {
        color: #fff;
      }
    </style>
  `;
  
  // Add to document
  document.body.appendChild(popup);
  
  // Add close button handler
  document.getElementById('close-server-details').addEventListener('click', () => {
    document.body.removeChild(popup);
  });
  
  // Fetch detailed health info
  fetchHealthDetails(popup, baseUrl);
}

/**
 * Fetch detailed health information from the server
 * @param {HTMLElement} popup - The popup element to update
 * @param {string} baseUrl - The base URL of the API
 */
async function fetchHealthDetails(popup, baseUrl) {
  try {
    // Try to fetch health details from the API
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (response.ok) {
      const healthData = await response.json();
      
      // Format memory usage to be more readable
      const formatMemory = (bytes) => {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
      };
      
      // Format uptime to be more readable
      const formatUptime = (seconds) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
      };
      
      // Update popup with detailed information
      popup.innerHTML = `
        <h3 style="margin-top: 0; color: ${healthData.status === 'ok' ? '#00cc00' : '#ff9900'};">
          ${healthData.status === 'ok' ? '✓ Server Healthy' : '⚠ Server Degraded'}
        </h3>
        
        <div class="health-metric">
          <span class="health-metric-label">Status:</span>
          <span class="health-metric-value">${healthData.status}</span>
        </div>
        
        <div class="health-metric">
          <span class="health-metric-label">Version:</span>
          <span class="health-metric-value">${healthData.version}</span>
        </div>
        
        <div class="health-metric">
          <span class="health-metric-label">API URL:</span>
          <span class="health-metric-value">${baseUrl}</span>
        </div>
        
        <div class="health-metric">
          <span class="health-metric-label">Last check:</span>
          <span class="health-metric-value">${new Date(healthData.timestamp).toLocaleTimeString()}</span>
        </div>
        
        <h4 style="margin: 15px 0 5px; color: #aaa; border-top: 1px solid #444; padding-top: 10px;">Database</h4>
        
        <div class="health-metric">
          <span class="health-metric-label">DB Status:</span>
          <span class="health-metric-value" style="color: ${healthData.database.status === 'connected' ? '#00cc00' : '#ff0000'}">
            ${healthData.database.status}
          </span>
        </div>
        
        <div class="health-metric">
          <span class="health-metric-label">Response time:</span>
          <span class="health-metric-value">
            ${healthData.database.responseTime ? healthData.database.responseTime + ' ms' : 'N/A'}
          </span>
        </div>
        
        <h4 style="margin: 15px 0 5px; color: #aaa; border-top: 1px solid #444; padding-top: 10px;">System</h4>
        
        <div class="health-metric">
          <span class="health-metric-label">Node version:</span>
          <span class="health-metric-value">${healthData.system.nodeVersion}</span>
        </div>
        
        <div class="health-metric">
          <span class="health-metric-label">Platform:</span>
          <span class="health-metric-value">${healthData.system.platform}</span>
        </div>
        
        <div class="health-metric">
          <span class="health-metric-label">Memory usage:</span>
          <span class="health-metric-value">${formatMemory(healthData.system.memory.rss)}</span>
        </div>
        
        <div class="health-metric">
          <span class="health-metric-label">Heap usage:</span>
          <span class="health-metric-value">${formatMemory(healthData.system.memory.heapUsed)} / ${formatMemory(healthData.system.memory.heapTotal)}</span>
        </div>
        
        <div class="health-metric">
          <span class="health-metric-label">Uptime:</span>
          <span class="health-metric-value">${formatUptime(healthData.system.uptime)}</span>
        </div>
        
        <div style="margin-top: 15px; display: flex; justify-content: space-between;">
          <button id="check-server-now" style="background: #444; color: #fff; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">Refresh</button>
          <button id="close-server-details" style="background: #666; color: #fff; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">Close</button>
        </div>
      `;
      
      // Update serverIsConnected status
      serverIsConnected = healthData.status === 'ok';
      
      // Add refresh button handler
      document.getElementById('check-server-now').addEventListener('click', () => {
        // Replace content with loading indicator
        popup.innerHTML = `
          <h3 style="margin-top: 0; color: #888;">Refreshing...</h3>
          <div style="display: flex; justify-content: center; margin: 15px 0;">
            <div class="loading-spinner" style="width: 20px; height: 20px; border: 3px solid #888; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          </div>
          <button id="close-server-details" style="background: #666; color: #fff; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; margin-left: 5px;">Close</button>
        `;
        
        // Add close button handler again since we replaced content
        document.getElementById('close-server-details').addEventListener('click', () => {
          document.body.removeChild(popup);
        });
        
        // Check server status and update UI
        checkServerStatus();
        
        // Fetch updated health details
        setTimeout(() => fetchHealthDetails(popup, baseUrl), 500);
      });
      
      // Add close button handler again since we replaced content
      document.getElementById('close-server-details').addEventListener('click', () => {
        document.body.removeChild(popup);
      });
    } else {
      // Server returned error
      popup.innerHTML = `
        <h3 style="margin-top: 0; color: #ff0000;">✗ Server Error</h3>
        <p>API URL: ${baseUrl}</p>
        <p>Status: ${response.status} ${response.statusText}</p>
        <p>Unable to fetch detailed health information.</p>
        <button id="check-server-now" style="background: #444; color: #fff; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">Try Again</button>
        <button id="close-server-details" style="background: #666; color: #fff; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; margin-left: 5px;">Close</button>
      `;
      
      // Set connected status to false
      serverIsConnected = false;
      
      // Add refresh button handler
      document.getElementById('check-server-now').addEventListener('click', () => {
        checkServerStatus();
        fetchHealthDetails(popup, baseUrl);
      });
      
      // Add close button handler
      document.getElementById('close-server-details').addEventListener('click', () => {
        document.body.removeChild(popup);
      });
    }
  } catch (error) {
    // Connection failed completely
    popup.innerHTML = `
      <h3 style="margin-top: 0; color: #ff0000;">✗ Server Disconnected</h3>
      <p>API URL: ${baseUrl}</p>
      <p>Error: ${error.message || "Connection failed"}</p>
      <p>Possible issues:</p>
      <ul>
        <li>Node.js server not running</li>
        <li>Wrong port configuration</li>
        <li>Network connectivity issue</li>
      </ul>
      <p>Fallback: Local storage will be used</p>
      <button id="check-server-now" style="background: #444; color: #fff; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">Try Again</button>
      <button id="close-server-details" style="background: #666; color: #fff; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; margin-left: 5px;">Close</button>
    `;
    
    // Set connected status to false
    serverIsConnected = false;
    
    // Add refresh button handler
    document.getElementById('check-server-now').addEventListener('click', () => {
      checkServerStatus();
      fetchHealthDetails(popup, baseUrl);
    });
    
    // Add close button handler
    document.getElementById('close-server-details').addEventListener('click', () => {
      document.body.removeChild(popup);
    });
  }
}
