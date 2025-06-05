/**
 * API Error Dashboard Extension for ErgoSphere
 * 
 * This script extends the API Error Tracker to provide a visual dashboard
 * for displaying and managing API errors.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Wait for API Error Tracker to initialize
  setTimeout(() => {
    if (typeof window.apiErrorTracker !== 'undefined') {
      initializeErrorDashboard();
    }
  }, 1000);
});

/**
 * Initialize the error dashboard
 */
function initializeErrorDashboard() {
  // Create a small floating indicator for critical errors
  createErrorIndicator();
  
  // Start monitoring for critical errors
  monitorForCriticalErrors();
}

/**
 * Create a small indicator that appears when critical errors are detected
 */
function createErrorIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'api-error-indicator';
  indicator.style.display = 'none'; // Hidden by default
  
  // Style the indicator
  indicator.style.position = 'fixed';
  indicator.style.bottom = '10px';
  indicator.style.left = '10px';
  indicator.style.backgroundColor = '#ff3333';
  indicator.style.color = 'white';
  indicator.style.padding = '5px 10px';
  indicator.style.borderRadius = '3px';
  indicator.style.fontSize = '12px';
  indicator.style.fontWeight = 'bold';
  indicator.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
  indicator.style.zIndex = '10000';
  indicator.style.cursor = 'pointer';
  indicator.style.display = 'flex';
  indicator.style.alignItems = 'center';
  
  indicator.innerHTML = `
    <span id="error-count-badge" style="
      background-color: white;
      color: #ff3333;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 7px;
      font-weight: bold;
    ">0</span>
    <span>API Errors</span>
  `;
  
  // Add click handler to show detailed error dashboard
  indicator.addEventListener('click', showErrorDashboard);
  
  // Add to the document
  document.body.appendChild(indicator);
}

/**
 * Monitor for critical errors and update the indicator
 */
function monitorForCriticalErrors() {
  // Check every 5 seconds
  setInterval(() => {
    if (typeof window.apiErrorTracker !== 'undefined') {
      const errorLog = window.apiErrorTracker.getErrorLog();
      const criticalErrors = errorLog.filter(error => 
        error.severity === window.apiErrorTracker.ErrorSeverity.HIGH);
      
      updateErrorIndicator(criticalErrors.length);
    }
  }, 5000);
}

/**
 * Update the error indicator based on error count
 * @param {number} count - Number of critical errors
 */
function updateErrorIndicator(count) {
  const indicator = document.getElementById('api-error-indicator');
  const countBadge = document.getElementById('error-count-badge');
  
  if (!indicator || !countBadge) return;
  
  // Update count in badge
  countBadge.textContent = count;
  
  // Show/hide based on count
  if (count > 0) {
    indicator.style.display = 'flex';
    
    // Animate the indicator for attention
    if (indicator.getAttribute('data-animated') !== 'true') {
      indicator.style.animation = 'pulse-error 2s infinite';
      indicator.setAttribute('data-animated', 'true');
      
      // Add animation keyframes if they don't exist
      if (!document.getElementById('error-animation-style')) {
        const style = document.createElement('style');
        style.id = 'error-animation-style';
        style.textContent = `
          @keyframes pulse-error {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  } else {
    indicator.style.display = 'none';
    indicator.setAttribute('data-animated', 'false');
  }
}

/**
 * Show the full error dashboard
 */
function showErrorDashboard() {
  if (typeof window.apiErrorTracker === 'undefined') {
    console.error('API Error Tracker not available');
    return;
  }
  
  // Get error log
  const errorLog = window.apiErrorTracker.getErrorLog();
  
  // Create dashboard container
  const dashboard = document.createElement('div');
  dashboard.id = 'api-error-dashboard';
  
  // Style the dashboard
  dashboard.style.position = 'fixed';
  dashboard.style.top = '10%';
  dashboard.style.left = '10%';
  dashboard.style.width = '80%';
  dashboard.style.maxHeight = '80%';
  dashboard.style.backgroundColor = '#222';
  dashboard.style.color = '#eee';
  dashboard.style.padding = '20px';
  dashboard.style.borderRadius = '5px';
  dashboard.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
  dashboard.style.zIndex = '10001';
  dashboard.style.overflowY = 'auto';
  
  // Count errors by severity
  const criticalCount = errorLog.filter(e => e.severity === 'high').length;
  const mediumCount = errorLog.filter(e => e.severity === 'medium').length;
  const lowCount = errorLog.filter(e => e.severity === 'low').length;
  
  // Create dashboard content
  dashboard.innerHTML = `
    <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <h2 style="margin: 0; color: #ff3333;">API Error Dashboard</h2>
      <button id="close-error-dashboard" style="background: none; border: none; color: #fff; font-size: 24px; cursor: pointer;">×</button>
    </div>
    
    <div style="display: flex; margin-bottom: 15px; gap: 10px;">
      <div style="flex: 1; padding: 10px; text-align: center; background-color: #3a0909; border-radius: 5px;">
        <div style="font-size: 24px; font-weight: bold; color: #ff3333;">${criticalCount}</div>
        <div>Critical Errors</div>
      </div>
      <div style="flex: 1; padding: 10px; text-align: center; background-color: #3a3a09; border-radius: 5px;">
        <div style="font-size: 24px; font-weight: bold; color: #ffcc33;">${mediumCount}</div>
        <div>Warning Errors</div>
      </div>
      <div style="flex: 1; padding: 10px; text-align: center; background-color: #0a3a0a; border-radius: 5px;">
        <div style="font-size: 24px; font-weight: bold; color: #33ff33;">${lowCount}</div>
        <div>Minor Errors</div>
      </div>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <div style="display: flex; gap: 10px;">
        <button id="filter-all-errors" class="error-filter-btn active" style="background: #444; border: none; color: #fff; padding: 5px 10px; border-radius: 3px; cursor: pointer;">All Errors</button>
        <button id="filter-critical-errors" class="error-filter-btn" style="background: #444; border: none; color: #fff; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Critical Only</button>
      </div>
      <button id="clear-all-errors" style="background: #333; border: none; color: #fff; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Clear All Errors</button>
    </div>
    
    <div id="error-list" style="max-height: 400px; overflow-y: auto; margin-top: 10px;">
      ${errorLog.length > 0 ? renderErrorList(errorLog) : '<p>No errors logged</p>'}
    </div>
  `;
  
  // Add to the document
  document.body.appendChild(dashboard);
  
  // Add event listeners
  document.getElementById('close-error-dashboard').addEventListener('click', () => {
    dashboard.remove();
  });
  
  document.getElementById('clear-all-errors').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all logged errors?')) {
      window.apiErrorTracker.clearErrorLog();
      dashboard.remove();
      updateErrorIndicator(0);
    }
  });
  
  document.getElementById('filter-all-errors').addEventListener('click', (e) => {
    document.querySelectorAll('.error-filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    const errorList = document.getElementById('error-list');
    errorList.innerHTML = renderErrorList(errorLog);
  });
  
  document.getElementById('filter-critical-errors').addEventListener('click', (e) => {
    document.querySelectorAll('.error-filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    const criticalErrors = errorLog.filter(error => error.severity === 'high');
    const errorList = document.getElementById('error-list');
    errorList.innerHTML = renderErrorList(criticalErrors);
  });
  
  // Add some style for active filter button
  const style = document.createElement('style');
  style.textContent = `
    .error-filter-btn.active {
      background-color: #666 !important;
    }
  `;
  dashboard.appendChild(style);
}

/**
 * Render the error list as HTML
 * @param {Array} errors - List of errors to render
 * @returns {string} HTML string
 */
function renderErrorList(errors) {
  if (errors.length === 0) {
    return '<p>No errors to display</p>';
  }
  
  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return '#ff3333';
      case 'medium':
        return '#ffcc33';
      case 'low':
        return '#33cc33';
      default:
        return '#ffffff';
    }
  };
  
  // Format the error timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };
  
  return errors.map((error, index) => `
    <div style="
      background-color: #333;
      margin-bottom: 10px;
      padding: 10px;
      border-left: 4px solid ${getSeverityColor(error.severity)};
      border-radius: 2px;
    ">
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <div style="font-weight: bold; color: ${getSeverityColor(error.severity)};">
          ${error.message}
        </div>
        <div style="font-size: 12px; color: #999;">
          ${formatTimestamp(error.timestamp)}
        </div>
      </div>
      <div style="font-size: 13px; margin-bottom: 5px; color: #ccc;">
        ${error.method} ${error.url}
      </div>
      ${error.status ? `
        <div style="font-size: 12px; background-color: #2a2a2a; padding: 5px; border-radius: 2px;">
          Status: ${error.status}
        </div>
      ` : ''}
    </div>
  `).join('');
}

// Make available globally
window.apiErrorDashboard = {
  showDashboard: showErrorDashboard,
  updateIndicator: updateErrorIndicator
};
