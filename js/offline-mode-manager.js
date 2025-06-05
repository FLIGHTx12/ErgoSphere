/**
 * Offline Mode Manager for ErgoSphere
 * 
 * This script manages the display and functionality when the app is in offline mode.
 */

let isOfflineMode = false;

/**
 * Initialize the offline mode manager
 */
function initOfflineModeManager() {
  // Create offline mode banner (hidden by default)
  createOfflineModeBanner();
  
  // Check if we have a stored API base URL (if not, might be offline)
  if (!sessionStorage.getItem('apiBaseUrl') && window.location.port === '1550') {
    // We're on port 1550 but haven't established a working server connection yet
    checkServerConnectivity();
  }
  
  // Listen for online/offline events from the browser
  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOfflineStatus);
}

/**
 * Create the offline mode banner
 */
function createOfflineModeBanner() {
  const banner = document.createElement('div');
  banner.id = 'offline-mode-banner';
  banner.style.display = 'none'; // Hidden by default
  
  // Style the banner
  banner.style.position = 'fixed';
  banner.style.top = '0';
  banner.style.left = '0';
  banner.style.right = '0';
  banner.style.backgroundColor = '#ff6b6b';
  banner.style.color = 'white';
  banner.style.padding = '8px';
  banner.style.textAlign = 'center';
  banner.style.fontWeight = 'bold';
  banner.style.zIndex = '10000';
  banner.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  
  banner.innerHTML = `
    <span>⚠️ OFFLINE MODE - Your changes will be saved locally</span>
    <button id="retry-connection" style="margin-left: 20px; padding: 2px 8px; background: #fff; color: #333; border: none; border-radius: 3px; cursor: pointer;">Retry Connection</button>
  `;
  
  document.body.appendChild(banner);
  
  // Add event listener to retry button
  document.getElementById('retry-connection').addEventListener('click', retryServerConnection);
}

/**
 * Show the offline mode banner
 */
function showOfflineModeBanner() {
  const banner = document.getElementById('offline-mode-banner');
  if (banner) {
    banner.style.display = 'block';
    
    // Add some space at the top of the body to account for the banner
    document.body.style.paddingTop = banner.offsetHeight + 'px';
  }
  
  isOfflineMode = true;
}

/**
 * Hide the offline mode banner
 */
function hideOfflineModeBanner() {
  const banner = document.getElementById('offline-mode-banner');
  if (banner) {
    banner.style.display = 'none';
    
    // Remove the padding from the body
    document.body.style.paddingTop = '0';
  }
  
  isOfflineMode = false;
}

/**
 * Handle browser online event
 */
function handleOnlineStatus() {
  // We're online according to the browser, but check if the server is actually reachable
  checkServerConnectivity();
}

/**
 * Handle browser offline event
 */
function handleOfflineStatus() {
  showOfflineModeBanner();
}

/**
 * Check if the server is reachable
 */
async function checkServerConnectivity() {
  try {
    // Test with the health endpoint
    let baseUrl;
    
    if (window.location.port === '1550') {
      // Try port 3000 first if we're running on port 1550 (development mode)
      baseUrl = window.location.protocol + '//' + window.location.hostname + ':3000';
    } else {
      // Otherwise use current origin
      baseUrl = window.location.origin;
    }
    
    const response = await fetch(`${baseUrl}/api/health`, { 
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      // Short timeout to quickly determine connectivity
      signal: AbortSignal.timeout(3000)
    });
    
    if (response.ok) {
      // Server is reachable, store the working base URL and hide offline banner
      sessionStorage.setItem('apiBaseUrl', baseUrl);
      hideOfflineModeBanner();
      console.log('Server connectivity restored. Using API at:', baseUrl);
      
      // If we have a user, refresh their data
      if (typeof loadPurchasesForWeek === 'function' && typeof currentDisplayWeek !== 'undefined') {
        loadPurchasesForWeek(currentDisplayWeek);
      }
      
      return true;
    } else {
      throw new Error(`Server returned ${response.status}`);
    }
  } catch (error) {
    console.error('Server connectivity check failed:', error);
    showOfflineModeBanner();
    return false;
  }
}

/**
 * Attempt to reconnect to the server
 */
async function retryServerConnection() {
  const retryBtn = document.getElementById('retry-connection');
  if (retryBtn) {
    retryBtn.textContent = 'Checking...';
    retryBtn.disabled = true;
  }
  
  const connected = await checkServerConnectivity();
  
  if (retryBtn) {
    retryBtn.textContent = 'Retry Connection';
    retryBtn.disabled = false;
  }
  
  if (connected) {
    // Show success toast
    if (typeof showToast === 'function') {
      showToast('Server connection restored!', 'success');
    }
  } else {
    // Show failure toast
    if (typeof showToast === 'function') {
      showToast('Could not connect to server', 'error');
    }
  }
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', initOfflineModeManager);

// Export API
window.offlineMode = {
  isOffline: () => isOfflineMode,
  checkConnectivity: checkServerConnectivity,
  retry: retryServerConnection
};
