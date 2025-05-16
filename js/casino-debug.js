/**
 * Casino Debug Utilities
 * Provides API mocking and error handling support for Casino functionality
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize debug functions
  initApiMocks();
  fixCountdownErrors();
  configureConsoleFilters();
});

/**
 * Set up API mocks to handle missing endpoints
 */
function initApiMocks() {
  // Save original fetch function
  const originalFetch = window.fetch;

  // Replace with our version that handles missing endpoints
  window.fetch = function(url, options = {}) {
    console.debug(`Debug: fetch called for ${url}`);
    
    // Handle selections API first
    if (url === '/api/selections') {
      console.info('Using mock data for /api/selections');
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          bingwaChampion: 'JAYBERS8',
          atleticoChamp: 'FLIGHTx12!',
          movieNight: 'Underwater (2020)',
          banquetMeal: 'Spaghetti and side salad'
        })
      });
    }
    
    // Try the original fetch
    return originalFetch(url, options)
      .then(response => {
        // If API call failed, use fallback for known endpoints
        if (!response.ok && response.status === 404) {
          if (url.startsWith('/api/bets')) {
            return handleBetsApiFallback(url, options);
          }
        }
        return response;
      })
      .catch(error => {
        console.warn('Fetch error intercepted:', error.message);
        // Return fallback for network errors
        if (url.startsWith('/api/bets')) {
          return handleBetsApiFallback(url, options);
        }
        // For other unknown endpoints, return empty success response
        return {
          ok: true,
          json: () => Promise.resolve([]),
          text: () => Promise.resolve('Debug: API mock response')
        };
      });
  };
  
  console.info('API mocking initialized - handling missing endpoints');
}

/**
 * Handle fallbacks for /api/bets endpoints
 */
function handleBetsApiFallback(url, options = {}) {
  console.info(`Using localStorage fallback for ${url}`);
  
  // Extract weekKey from URL if it's a GET request for a specific week
  if (options.method !== 'DELETE' && url.match(/\/api\/bets\/\d{4}-\d{2}-\d{2}/)) {
    const weekKey = url.split('/').pop().split('?')[0];
    const betLog = JSON.parse(localStorage.getItem('casinoBetLog') || '{}');
    return {
      ok: true,
      json: () => Promise.resolve(
        (betLog[weekKey] || []).map((bet, idx) => ({
          ...bet,
          id: `local-${idx}`,
          bet_date: bet.date,
          bet_data: bet,
          user_name: bet.userName
        }))
      )
    };
  }
  
  // Handle POST requests (creating new bets)
  if (options.method === 'POST') {
    try {
      const body = JSON.parse(options.body);
      const weekKey = body.weekKey;
      let betLog = JSON.parse(localStorage.getItem('casinoBetLog') || '{}');
      if (!betLog[weekKey]) betLog[weekKey] = [];
      
      // Add the bet to localStorage
      betLog[weekKey].push(body.betData);
      localStorage.setItem('casinoBetLog', JSON.stringify(betLog));
      
      return {
        ok: true,
        json: () => Promise.resolve({ success: true, id: `local-${betLog[weekKey].length - 1}` }),
        text: () => Promise.resolve('Bet saved successfully (localStorage)')
      };
    } catch (e) {
      console.error('Error processing POST request:', e);
    }
  }
  
  // Handle status updates
  if (url.includes('/status') && options.method === 'PUT') {
    return {
      ok: true,
      json: () => Promise.resolve({ success: true }),
      text: () => Promise.resolve('Status updated successfully (mock)')
    };
  }
  
  // Handle payout data
  if (url.includes('/payout')) {
    // Extract bet ID
    const idMatch = url.match(/\/api\/bets\/([^\/]+)\/payout/);
    if (idMatch && idMatch[1] && idMatch[1].startsWith('local-')) {
      const localId = idMatch[1].split('-')[1];
      const weekKey = getCurrentWeekKey();
      const betLog = JSON.parse(localStorage.getItem('casinoBetLog') || '{}');
      if (betLog[weekKey] && betLog[weekKey][localId]) {
        const bet = betLog[weekKey][localId];
        return {
          ok: true,
          json: () => Promise.resolve({
            success: true,
            bet: {
              id: `local-${localId}`,
              user_name: bet.userName,
              bet_date: bet.date,
              bet_data: bet,
              bet_status: bet.betStatus || {},
              payout_data: bet.payoutData || {}
            }
          })
        };
      }
    }
  }
  
  // Default fallback
  return {
    ok: true,
    json: () => Promise.resolve([]),
    text: () => Promise.resolve('Fallback API response')
  };
}

/**
 * Fix countdown errors and related issues
 */
function fixCountdownErrors() {
  // Make updateCountdown safe
  if (window.updateCountdown) {
    const origUpdateCountdown = window.updateCountdown;
    window.updateCountdown = function(id, date) {
      try {
        // Safely check if element exists before updating
        if (typeof id === 'string') {
          // Check all required elements exist
          const hasAllElements = ['days', 'hours', 'minutes', 'seconds']
            .every(suffix => document.getElementById(`${id}-${suffix}`));
          
          if (!hasAllElements) {
            return; // Missing countdown elements, skip update
          }
        }
        
        // Call original function if checks pass
        return origUpdateCountdown(id, date);
      } catch(e) {
        console.debug('Caught countdown error:', e);
        // Silently ignore errors
      }
    };
  }
  
  // Create safe stub for updateQuarterCountdown
  if (!window.updateQuarterCountdown) {
    window.updateQuarterCountdown = function() { 
      // Empty stub
    };
  }
  
  // Make initializeCountdowns safe
  if (window.initializeCountdowns) {
    const origInitCountdowns = window.initializeCountdowns;
    window.initializeCountdowns = function() {
      // Only run if we're on a page with countdowns
      if (document.querySelector('[data-countdown]') || 
          document.getElementById('ergoart-days') ||
          document.getElementById('quarter-days')) {
        try {
          origInitCountdowns();
        } catch(e) {
          console.debug('Skipped initialization of countdowns:', e);
        }
      } else {
        console.debug('No countdowns found on page, skipping initialization');
      }
    };
  }
}

/**
 * Configure console logging to reduce noise
 */
function configureConsoleFilters() {
  // Store original console methods
  const originalConsoleError = console.error;
  
  // Filter out specific error messages
  console.error = function(...args) {
    const message = args.join(' ');
    
    // Ignore React errors related to strict mode and reducer
    if (message.includes('Warning: ReactDOM.render is no longer supported') || 
        message.includes('reducer with the initial state failed')) {
      return;
    }
    
    // Allow other errors to pass through
    originalConsoleError.apply(console, args);
  };
}

/**
 * Helper function for getting current week key
 */
function getCurrentWeekKey() {
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  return sunday.toISOString().slice(0, 10);
}

// Add utility function to clear all casino data
window.clearCasinoData = function() {
  if (confirm('This will clear all locally stored casino data. Continue?')) {
    localStorage.removeItem('casinoBetLog');
    localStorage.removeItem('casinoState');
    location.reload();
    return 'All casino data cleared successfully.';
  }
  return 'Operation cancelled.';
};

// Add utility to show storage usage
window.showCasinoStorageSize = function() {
  const casinoBetLog = localStorage.getItem('casinoBetLog') || '{}';
  const casinoState = localStorage.getItem('casinoState') || '{}';
  
  const betLogSize = new Blob([casinoBetLog]).size;
  const stateSize = new Blob([casinoState]).size;
  
  console.log(`Casino Bet Log: ${(betLogSize / 1024).toFixed(2)} KB`);
  console.log(`Casino State: ${(stateSize / 1024).toFixed(2)} KB`);
  
  return {
    betLogSize: `${(betLogSize / 1024).toFixed(2)} KB`,
    stateSize: `${(stateSize / 1024).toFixed(2)} KB`,
    totalSize: `${((betLogSize + stateSize) / 1024).toFixed(2)} KB`,
    availableSpace: `${(5 * 1024).toFixed(2)} KB` // Most browsers allow at least 5MB
  };
};

console.info('Casino debug utilities loaded');
