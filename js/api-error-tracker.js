/**
 * API Error Tracker for ErgoSphere
 * 
 * This script logs and tracks API errors to help diagnose connection issues
 * and provide more detailed error reports.
 */

// Store errors for the current session
let apiErrorLog = [];
const MAX_ERROR_LOG_SIZE = 100;
const ERROR_LOG_KEY = 'ergoSphere_apiErrorLog';

// Error severity levels
const ErrorSeverity = {
  LOW: 'low',       // Non-critical errors
  MEDIUM: 'medium', // Errors that affect functionality but aren't critical
  HIGH: 'high',     // Critical errors that prevent core functionality
};

// Initialize error tracking
document.addEventListener('DOMContentLoaded', () => {
  // Load previous errors from local storage
  loadErrorLog();
  
  // Monitor for unhandled fetch errors
  monitorFetchErrors();
  
  console.log('API Error Tracker initialized');
});

/**
 * Track and log an API error
 * 
 * @param {Object} options - Error details
 * @param {string} options.url - The API URL that failed
 * @param {number} options.status - HTTP status code (if available)
 * @param {string} options.method - HTTP method (GET, POST, etc)
 * @param {Object} options.requestData - Request payload (if applicable)
 * @param {Object} options.responseData - Response data (if available)
 * @param {string} options.message - Error message
 * @param {string} options.severity - Error severity (from ErrorSeverity enum)
 * @param {string} options.source - Source component that encountered the error
 */
function trackApiError(options) {
  // Special case handling: ignore errors for pre-inception date queries (before June 4, 2025)
  if (options.url) {
    const urlObj = new URL(options.url, window.location.origin);
    const weekKeyMatch = urlObj.pathname.match(/\/api\/purchases(?:\/metrics)?\/(\d{4}-\d{2}-\d{2})/);
    
    if (weekKeyMatch) {
      const weekDate = new Date(weekKeyMatch[1]);
      const inceptionDate = new Date('2025-06-04');
      
      // If this is for a date before inception, downgrade severity and mark as expected
      if (weekDate < inceptionDate) {
        console.info(`Ignoring error for pre-inception date ${weekKeyMatch[1]}`);
        
        // If no data is the expected behavior, reduce severity or skip tracking entirely
        options.severity = 'low';
        options.expected = true;
        
        // For 404 responses before inception date, we don't need to track this as an error
        if (options.status === 404) {
          return; // Skip tracking this error altogether
        }
      }
    }
  }

  const {
    url,
    status,
    method = 'GET',
    requestData,
    responseData,
    message,
    severity = ErrorSeverity.MEDIUM,
    source = 'api-client'
  } = options;
  
  // Create error entry with timestamp
  const errorEntry = {
    timestamp: new Date().toISOString(),
    url,
    status,
    method,
    requestData,
    responseData,
    message,
    severity,
    source,
    userAgent: navigator.userAgent,
    connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown',
    online: navigator.onLine
  };
  
  // Log to console
  const consoleMethod = severity === ErrorSeverity.HIGH ? console.error : console.warn;
  consoleMethod(`API Error (${severity}): ${message}`, errorEntry);
  
  // Add to in-memory log
  apiErrorLog.unshift(errorEntry); // Add to beginning of array
  
  // Trim log if it gets too large
  if (apiErrorLog.length > MAX_ERROR_LOG_SIZE) {
    apiErrorLog = apiErrorLog.slice(0, MAX_ERROR_LOG_SIZE);
  }
  
  // Save to localStorage
  saveErrorLog();
  
  // Show notification for high severity errors
  if (severity === ErrorSeverity.HIGH && typeof showToast === 'function') {
    showToast(`API Error: ${message}`, 'error');
  }
  
  // Return the error entry
  return errorEntry;
}

/**
 * Save error log to localStorage
 */
function saveErrorLog() {
  try {
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(apiErrorLog));
  } catch (e) {
    console.warn('Failed to save error log to localStorage', e);
  }
}

/**
 * Load error log from localStorage
 */
function loadErrorLog() {
  try {
    const savedLog = localStorage.getItem(ERROR_LOG_KEY);
    if (savedLog) {
      apiErrorLog = JSON.parse(savedLog);
      
      // Check if log is an array
      if (!Array.isArray(apiErrorLog)) {
        apiErrorLog = [];
      }
    }
  } catch (e) {
    console.warn('Failed to load error log from localStorage', e);
    apiErrorLog = [];
  }
}

/**
 * Clear the error log
 */
function clearErrorLog() {
  apiErrorLog = [];
  localStorage.removeItem(ERROR_LOG_KEY);
  console.log('API error log cleared');
}

/**
 * Get the current error log
 */
function getErrorLog() {
  return [...apiErrorLog]; // Return a copy
}

/**
 * Monitor for unhandled fetch errors by overriding the fetch API
 */
function monitorFetchErrors() {
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    const url = args[0];
    const options = args[1] || {};
    
    try {
      const response = await originalFetch.apply(this, args);
      
      // Track non-200 responses as errors
      if (!response.ok) {
        let responseData;
        try {
          // Try to get response data, but don't fail if we can't
          responseData = await response.clone().json().catch(() => null);
        } catch (e) {
          responseData = null;
        }
        
        trackApiError({
          url,
          status: response.status,
          method: options.method || 'GET',
          requestData: options.body ? JSON.parse(options.body) : null,
          responseData,
          message: `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`,
          severity: response.status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
          source: 'fetch-monitor'
        });
      }
      
      return response;
    } catch (error) {
      // Track network errors
      trackApiError({
        url,
        status: 0,
        method: options.method || 'GET',
        requestData: options.body ? JSON.parse(options.body) : null,
        responseData: null,
        message: `Network error: ${error.message || 'Unknown error'}`,
        severity: ErrorSeverity.HIGH,
        source: 'fetch-monitor'
      });
      
      throw error; // Re-throw so the original error handling still works
    }
  };
}

// Expose functions globally
window.apiErrorTracker = {
  trackApiError,
  getErrorLog,
  clearErrorLog,
  ErrorSeverity
};
