/**
 * API Proxy for ErgoSphere
 * 
 * This script automatically proxies API requests to the correct server port
 * by detecting when running on port 1550 and redirecting to port 3000
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize API base URL for the application
  initializeApiProxy();
});

/**
 * Initialize the API proxy to handle different port configurations
 */
function initializeApiProxy() {
  // Check if we're running on port 1550 (Live Server or similar)
  const isDevServer = window.location.port === '1550';
  
  if (isDevServer) {
    console.log('Running on development server (port 1550). Setting up API proxy to port 3000.');
    
    // Create a base URL for API requests that points to port 3000
    const apiBaseUrl = window.location.protocol + '//' + 
                      window.location.hostname + ':3000';
    
    // Store this in session storage for use by other scripts
    sessionStorage.setItem('apiBaseUrl', apiBaseUrl);
    console.log('API proxy configured. Requests will be sent to:', apiBaseUrl);
    
    // Add a visual indicator for development mode
    addDevModeIndicator();
  } else {
    console.log('Running on production server. No API proxy needed.');
    // Clear any previously set apiBaseUrl to use default origin
    sessionStorage.removeItem('apiBaseUrl');
  }
}

/**
 * Add a visual indicator when running in development mode with proxied API
 */
function addDevModeIndicator() {
  // Create a dev mode indicator element
  const devIndicator = document.createElement('div');
  devIndicator.id = 'dev-mode-indicator';
  devIndicator.innerHTML = 'DEV MODE<br>API → :3000';
  
  // Style the indicator
  devIndicator.style.position = 'fixed';
  devIndicator.style.bottom = '10px';
  devIndicator.style.left = '10px';
  devIndicator.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
  devIndicator.style.color = 'white';
  devIndicator.style.padding = '5px 10px';
  devIndicator.style.borderRadius = '5px';
  devIndicator.style.fontSize = '11px';
  devIndicator.style.fontWeight = 'bold';
  devIndicator.style.zIndex = '9999';
  devIndicator.style.pointerEvents = 'none';
  
  // Add to the document
  document.body.appendChild(devIndicator);
}

/**
 * Helper function to create proxied fetch API calls with better error handling
 * Usage: const data = await proxiedFetch('/api/endpoint');
 */
async function proxiedFetch(url, options = {}) {
  // Get the base URL from session storage if available
  const baseUrl = sessionStorage.getItem('apiBaseUrl') || '';
  
  // Only add the base URL if the provided URL is relative
  const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : url;
  
  try {
    // Make the fetch request with the proper URL
    const response = await fetch(fullUrl, options);
    
    // Check if the response was successful
    if (!response.ok) {
      // Create a more descriptive error
      const statusText = response.statusText || 'Unknown Error';
      const responseError = new Error(`${response.status} ${statusText} for ${url}`);
      
      // Add the response object to the error for further inspection if needed
      responseError.response = response;
      
      // Add the attempted URL to the error to help with debugging
      responseError.url = fullUrl;
      
      // Add response status to help with conditional handling
      responseError.status = response.status;
        // Try to get response body as JSON if possible
      try {
        const errorData = await response.clone().json();
        responseError.data = errorData;
        
        // Track the error with our error tracker if available
        if (window.apiErrorTracker && typeof window.apiErrorTracker.trackApiError === 'function') {
          window.apiErrorTracker.trackApiError({
            url: fullUrl,
            status: response.status,
            method: options?.method || 'GET',
            responseData: errorData,
            message: `${response.status} ${statusText} for ${url}`,
            severity: response.status >= 500 ? 'high' : 'medium',
            source: 'proxy-js'
          });
        }
      } catch (e) {
        // If it's not valid JSON, don't worry about it
      }
      
      // Throw the enhanced error
      throw responseError;
    }
    
    return response;
  } catch (error) {    // For network errors, add more context
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error(`Network error accessing ${fullUrl}`, error);
      const networkError = new Error(`Network error: Could not connect to ${fullUrl}`);
      networkError.originalError = error;
      networkError.isNetworkError = true;
      
      // Track network errors with our error tracker if available
      if (window.apiErrorTracker && typeof window.apiErrorTracker.trackApiError === 'function') {
        window.apiErrorTracker.trackApiError({
          url: fullUrl,
          status: 0,
          method: options?.method || 'GET',
          requestData: options?.body ? JSON.parse(options.body) : null,
          message: `Network error: Could not connect to ${url}`,
          severity: 'high',
          source: 'proxy-js'
        });
      }
      throw networkError;
    }
    
    // Re-throw other errors
    throw error;
  }
}

// Make proxiedFetch available globally
window.proxiedFetch = proxiedFetch;
