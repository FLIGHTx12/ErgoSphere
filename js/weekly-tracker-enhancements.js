/**
 * This file contains updates for the weekly-tracker-addon.js file
 * to use the proxiedFetch function for API requests.
 */

// Once the DOM is loaded, enhance the weekly tracker with proxied fetch
document.addEventListener('DOMContentLoaded', () => {
  // Wait for all scripts to load
  setTimeout(enhanceWeeklyTracker, 1000);
  
  // Force visibility for the current user's purchase section after a delay
  setTimeout(() => {
    if (typeof window.currentUser !== 'undefined') {
      const user = window.currentUser;
      const userSection = document.querySelector(`#${user}-purchases`);
      if (userSection) {
        console.log(`Force showing ${user} purchases section`);
        userSection.style.display = 'block';
        userSection.classList.add('active');
      }
    }
  }, 1500);
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
    
    window.loadPurchasesForWeek = async function(weekKey) {      // Show loading state in purchase container for current user only
      if (typeof window.users !== 'undefined' && typeof window.currentUser !== 'undefined') {
        const user = window.currentUser;
        const purchaseList = document.querySelector(`#${user}-purchases ul`);
        if (purchaseList && typeof window.showLoading === 'function') {
          window.showLoading(purchaseList);
        }
      }
        // Metrics functionality removed
      
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
        }          // Metrics functionality removed
        // Initialize empty metrics array (keeping this for compatibility)
        let metrics = [];
          // Continue with the original processing of purchases and metrics
        if (typeof window.users !== 'undefined' && typeof window.currentUser !== 'undefined') {
          // Group purchases by user, but we only care about the current user
          const purchasesByUser = {};
          purchasesByUser[window.currentUser] = [];
          
          // Organize purchases for the current user only
          purchases.forEach(purchase => {
            if (purchase.username === window.currentUser) {
              purchasesByUser[window.currentUser].push(purchase);
            }
          });
          
          // Only update the current user's display
          const user = window.currentUser;
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
                // Metrics functionality removed
              
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
                
                // Only display basic stats now that metrics functionality is removed
                stats.innerHTML = `
                  <p>Calories: ${userCalories} cal</p>
                  <p>Items: ${userPurchases.reduce((sum, p) => sum + (typeof p.items === 'string' ? JSON.parse(p.items).length : p.items.length), 0)}</p>
                `;
                
                totalElement.parentNode.insertBefore(stats, totalElement.nextSibling);
              } else {
                // Update existing stats
                statsElement.innerHTML = `
                  <p>Calories: ${userCalories} cal</p>
                  <p>Items: ${userPurchases.reduce((sum, p) => sum + (typeof p.items === 'string' ? JSON.parse(p.items).length : p.items.length), 0)}</p>
                `;
              }
            }
              // Show/hide user sections and metrics based on current user
            window.users.forEach(otherUser => {
              // Handle purchase sections
              const userSection = document.querySelector(`#${otherUser}-purchases`);
              if (userSection) {
                if (otherUser === window.currentUser) {
                  userSection.classList.add('active');
                } else {
                  userSection.classList.remove('active');
                }
              }
                // Metrics functionality removed
            });
        }
          // Metrics functionality removed
      } catch (error) {
        console.error('Error in enhanced loadPurchasesForWeek:', error);
        
        // Fall back to original implementation
        return originalLoadPurchases(weekKey);
      }
    };
    console.log('Successfully enhanced loadPurchasesForWeek with proxiedFetch');
  }
    // Convert updateMetricsCharts enhancement to a no-op since metrics functionality has been removed
  if (typeof window.updateMetricsCharts === 'function') {
    console.log('Metrics functionality has been removed, enhancment for updateMetricsCharts not needed');
    
    // Ensure the function is always a no-op
    window.updateMetricsCharts = async function(weekKey) {
      // This function is now a no-op (metrics functionality removed)
      console.log('Metrics summary functionality has been removed');
      try {
        // No-op function
        return;
      } catch (error) {
        console.error('Error in enhanced updateMetricsCharts:', error);
        return;
      }
    };
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
