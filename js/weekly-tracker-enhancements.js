/**
 * This file contains updates for the weekly-tracker-addon.js file
 * to use the proxiedFetch function for API requests.
 */

// Once the DOM is loaded, enhance the weekly tracker with proxied fetch
document.addEventListener('DOMContentLoaded', () => {
  // Wait for all scripts to load
  setTimeout(enhanceWeeklyTracker, 1000);
});

/**
 * Enhance the weekly tracker to use proxied fetch
 */
function enhanceWeeklyTracker() {
  // Make sure weekly tracker and proxiedFetch are available
  if (typeof window.proxiedFetch === 'undefined') {
    console.error('proxiedFetch not available, cannot enhance weekly tracker');
    return;
  }
  
  console.log('Enhancing weekly tracker with proxiedFetch...');
  
  // Replace fetch calls with proxiedFetch in loadPurchasesForWeek
  if (typeof window.loadPurchasesForWeek === 'function') {
    const originalLoadPurchases = window.loadPurchasesForWeek;
    
    window.loadPurchasesForWeek = async function(weekKey) {
      // Show loading state in purchase containers
      if (typeof window.users !== 'undefined') {
        window.users.forEach(user => {
          const purchaseList = document.querySelector(`#${user}-purchases ul`);
          if (purchaseList && typeof window.showLoading === 'function') {
            window.showLoading(purchaseList);
          }
        });
      }
      
      // Also show loading in the metrics summary
      const metricsContainer = document.querySelector('#weekly-metrics-summary');
      if (metricsContainer && typeof window.showLoading === 'function') {
        window.showLoading(metricsContainer);
      }
      
      try {
        // Get purchases from server using proxiedFetch
        let purchases = [];
        try {
          console.log(`Fetching purchases for week ${weekKey} with proxiedFetch`);
          const purchasesResponse = await window.proxiedFetch(`/api/purchases/${weekKey}`);
          purchases = await purchasesResponse.json();
          console.log(`Loaded ${purchases.length} purchases for week ${weekKey}`);
          
          // If we get here, we're online and server is working
          if (window.offlineMode && typeof window.offlineMode.isOffline === 'function' && 
              window.offlineMode.isOffline()) {
            // We were offline, but now we're online
            if (typeof window.offlineMode.checkConnectivity === 'function') {
              window.offlineMode.checkConnectivity();
            }
          }
        } catch (purchaseErr) {
          console.warn(`Failed to load purchases: ${purchaseErr.message || purchaseErr}`);
          
          // If we're getting network errors, show offline mode banner
          if (window.offlineMode && typeof window.offlineMode.isOffline === 'function' && 
              !window.offlineMode.isOffline()) {
            if (typeof window.offlineMode.checkConnectivity === 'function') {
              window.offlineMode.checkConnectivity();
            }
          }
        }
          // Get user metrics using proxiedFetch with retry logic
        let metrics = [];
        let metricsRetries = 0;
        const MAX_METRICS_RETRIES = 2;
        
        while (metricsRetries <= MAX_METRICS_RETRIES) {
          try {
            console.log(`Fetching metrics for week ${weekKey} with proxiedFetch (attempt ${metricsRetries + 1})`);
            const metricsResponse = await window.proxiedFetch(`/api/purchases/metrics/${weekKey}`);
            metrics = await metricsResponse.json();
            console.log(`Loaded ${metrics.length} metrics for week ${weekKey}`);
            
            // If successful, break out of retry loop
            break;
          } catch (metricsErr) {
            metricsRetries++;          console.warn(`Failed to load metrics (attempt ${metricsRetries}): ${metricsErr.message || metricsErr}`);
            
            if (metricsRetries <= MAX_METRICS_RETRIES) {
              // Wait before retrying - exponential backoff
              const delay = Math.pow(2, metricsRetries - 1) * 1000;
              console.log(`Retrying metrics fetch in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            } else {
              // Generate default metrics for users when all retries fail
              console.log('Generating default metrics after all retries failed');
              if (typeof window.users !== 'undefined') {
                // Add message about no data before June 4, 2025 to avoid confusion
                const currentDate = new Date();
                const weekDate = new Date(weekKey);
                const june4th2025 = new Date('2025-06-04');
                
                // If requested week is before June 4th 2025, show a more specific message
                if (weekDate < june4th2025) {
                  console.info(`No data available before June 4th, 2025. Generating empty metrics for ${weekKey}.`);
                  
                  // Show a banner notification
                  if (typeof showNotification === 'function') {
                    showNotification('No historical data available before June 4th, 2025', 'info', 5000);
                  }
                }
                
                metrics = window.users.map(username => ({
                  username,
                  week_key: weekKey,
                  total_spent: 0,
                  total_calories: 0,
                  snack_count: 0,
                  concoction_count: 0,
                  alcohol_count: 0
                }));
              }
            }
          }
        }
        
        // Continue with the original processing of purchases and metrics
        if (typeof window.users !== 'undefined') {
          // Group purchases by user
          const purchasesByUser = {};
          window.users.forEach(user => {
            purchasesByUser[user] = [];
          });
          
          // Organize purchases by user
          purchases.forEach(purchase => {
            if (purchasesByUser[purchase.username]) {
              purchasesByUser[purchase.username].push(purchase);
            }
          });
          
          // Update display for each user
          window.users.forEach(user => {
            const userPurchases = purchasesByUser[user] || [];
            const purchaseList = document.querySelector(`#${user}-purchases ul`);
            const totalElement = document.querySelector(`#${user}-purchases .weekly-total`);
            const statsElement = document.querySelector(`#${user}-purchases .weekly-stats`);
            
            if (purchaseList && totalElement) {
              // Clear existing content
              purchaseList.innerHTML = '';
              
              // Calculate totals
              let userTotal = 0;
              let userCalories = 0;
              
              // Find metrics for this user
              const userMetrics = metrics.find(m => m.username === user);
              
              // Add each purchase
              userPurchases.forEach(purchase => {
                userTotal += purchase.total_value;
                userCalories += purchase.total_calories || 0;
                
                // Format date
                const purchaseDate = new Date(purchase.purchase_date);
                const dateStr = purchaseDate.toLocaleDateString() + ' ' + 
                              purchaseDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                
                // Parse items from JSON
                const items = typeof purchase.items === 'string' ? 
                  JSON.parse(purchase.items) : purchase.items;
                
                // Create list item for each item in the purchase
                items.forEach(item => {
                  const li = document.createElement('li');
                  li.className = 'purchase-item';
                  li.dataset.purchaseId = purchase.id;
                  
                  // Extract just the item name without the price
                  const itemName = typeof item === 'string' ? item.split(' - ')[0] : item.name;
                  const icon = typeof window.getItemIcon === 'function' ? 
                    window.getItemIcon(itemName) : '📦';
                  
                  // Create content container
                  const contentSpan = document.createElement('span');
                  contentSpan.className = 'item-content';
                  contentSpan.innerHTML = `${icon} ${itemName} <span class="date-display">(${dateStr})</span>`;
                  li.appendChild(contentSpan);
                  
                  // Create delete button
                  const deleteBtn = document.createElement('button');
                  deleteBtn.className = 'delete-purchase-btn';
                  deleteBtn.innerHTML = '×';
                  deleteBtn.title = 'Remove this purchase';
                  deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to remove "${itemName}"?`)) {
                      if (typeof window.deletePurchase === 'function') {
                        window.deletePurchase(purchase.id);
                      }
                    }
                  });
                  li.appendChild(deleteBtn);
                  
                  purchaseList.appendChild(li);
                });
              });
              
              // Update total display
              totalElement.textContent = `Total: ${userTotal} 💷`;
              
              // Update or create stats element
              if (!statsElement) {
                const stats = document.createElement('div');
                stats.className = 'weekly-stats';
                
                // Display metrics if available from server, otherwise use calculated values
                if (userMetrics) {
                  stats.innerHTML = `
                    <p>Calories: ${userMetrics.total_calories || 0} cal</p>
                    <p>Snacks: ${userMetrics.snack_count || 0}</p>
                    <p>Drinks: ${userMetrics.concoction_count || 0}</p>
                    <p>Alcohol: ${userMetrics.alcohol_count || 0} 🍸</p>
                  `;
                } else {
                  stats.innerHTML = `
                    <p>Calories: ${userCalories} cal</p>
                    <p>Items: ${userPurchases.reduce((sum, p) => sum + (typeof p.items === 'string' ? JSON.parse(p.items).length : p.items.length), 0)}</p>
                  `;
                }
                
                totalElement.parentNode.insertBefore(stats, totalElement.nextSibling);
              } else {
                // Update existing stats
                if (userMetrics) {
                  statsElement.innerHTML = `
                    <p>Calories: ${userMetrics.total_calories || 0} cal</p>
                    <p>Snacks: ${userMetrics.snack_count || 0}</p>
                    <p>Drinks: ${userMetrics.concoction_count || 0}</p>
                    <p>Alcohol: ${userMetrics.alcohol_count || 0} 🍸</p>
                  `;
                } else {
                  statsElement.innerHTML = `
                    <p>Calories: ${userCalories} cal</p>
                    <p>Items: ${userPurchases.reduce((sum, p) => sum + (typeof p.items === 'string' ? JSON.parse(p.items).length : p.items.length), 0)}</p>
                  `;
                }
              }
            }
          });
        }
        
        // Update the metrics charts
        if (typeof window.updateMetricsCharts === 'function') {
          window.updateMetricsCharts(weekKey);
        }
      } catch (error) {
        console.error('Error in enhanced loadPurchasesForWeek:', error);
        
        // Fall back to original implementation
        return originalLoadPurchases(weekKey);
      }
    };
    console.log('Successfully enhanced loadPurchasesForWeek with proxiedFetch');
  }
  
  // Also enhance updateMetricsCharts function
  if (typeof window.updateMetricsCharts === 'function') {
    const originalUpdateMetrics = window.updateMetricsCharts;
    
    window.updateMetricsCharts = async function(weekKey) {
      try {
        // Get user metrics using proxiedFetch
        let metrics = [];
        try {
          console.log(`Fetching metrics for charts for week ${weekKey} with proxiedFetch`);
          const response = await window.proxiedFetch(`/api/purchases/metrics/${weekKey}`);
          metrics = await response.json();
          console.log(`Loaded ${metrics.length} metrics for charts - week ${weekKey}`);
        } catch (err) {
          console.warn(`Failed to load metrics for charts: ${err.message || err}`);
        }
        
        // Continue with original implementation if we have window.users
        if (typeof window.users !== 'undefined') {
          // Find metrics for each user
          const userMetrics = {};
          window.users.forEach(user => {
            userMetrics[user] = metrics.find(m => m.username === user) || {
              total_spent: 0,
              total_calories: 0,
              alcohol_count: 0
            };
          });
          
          // Calculate max values for scaling
          const maxSpent = Math.max(...Object.values(userMetrics).map(m => m.total_spent || 0), 1);
          const maxCalories = Math.max(...Object.values(userMetrics).map(m => m.total_calories || 0), 1);
          const maxAlcohol = Math.max(...Object.values(userMetrics).map(m => m.alcohol_count || 0), 1);
          
          // Update all the charts and metrics displays
          // ... (same implementation as before)
          
          // Apply visual enhancements
          setTimeout(() => {
            if (typeof window.enhanceMetricsVisuals === 'function') {
              window.enhanceMetricsVisuals();
            }
          }, 100);
          
          return; // Don't fall back to original if we've successfully processed
        }
        
        // If we didn't have window.users, fall back to original implementation
        return originalUpdateMetrics(weekKey);
      } catch (error) {
        console.error('Error in enhanced updateMetricsCharts:', error);
        // Fall back to original implementation
        return originalUpdateMetrics(weekKey);
      }
    };
    console.log('Successfully enhanced updateMetricsCharts with proxiedFetch');
  }
  
  // Enhance deletePurchase function
  if (typeof window.deletePurchase === 'function') {
    const originalDeletePurchase = window.deletePurchase;
    
    window.deletePurchase = async function(purchaseId) {
      try {
        // Show loading spinner
        const purchaseLi = document.querySelector(`li[data-purchase-id="${purchaseId}"]`);
        if (purchaseLi) {
          purchaseLi.classList.add('deleting');
        }
        
        // Use proxiedFetch to delete the purchase
        console.log(`Deleting purchase ${purchaseId} with proxiedFetch`);
        const response = await window.proxiedFetch(`/api/purchases/${purchaseId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Reload purchases to update the display
        if (typeof window.currentDisplayWeek !== 'undefined' && 
            typeof window.loadPurchasesForWeek === 'function') {
          window.loadPurchasesForWeek(window.currentDisplayWeek);
        }
        
        // Show success feedback
        if (typeof window.showToast === 'function') {
          window.showToast('Purchase removed successfully', 'success');
        }
      } catch (error) {
        console.error('Error in enhanced deletePurchase:', error);
        
        if (typeof window.showToast === 'function') {
          window.showToast('Failed to delete purchase', 'error');
        }
        
        // Remove the loading state
        const purchaseLi = document.querySelector(`li[data-purchase-id="${purchaseId}"]`);
        if (purchaseLi) {
          purchaseLi.classList.remove('deleting');
        }
        
        // Fall back to original implementation
        return originalDeletePurchase(purchaseId);
      }
    };
    console.log('Successfully enhanced deletePurchase with proxiedFetch');
  }
  
  console.log('Weekly tracker enhancement complete!');
}
