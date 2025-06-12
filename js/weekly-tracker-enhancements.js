/**
 * Weekly Tracker Enhancement Module - Clean Version
 * Provides alcohol tracking and proxied fetch integration
 */

class WeeklyTrackerEnhancer {
  constructor() {
    this.ergoShopData = null;
  }

  /**
   * Initialize the enhancement
   */
  async init() {
    await this.loadErgoShopData();
    this.enhanceWeeklyTracker();
    this.setupUserVisibility();
  }

  /**
   * Load ErgoShop data for alcohol detection
   */
  async loadErgoShopData() {
    if (this.ergoShopData) return this.ergoShopData;
    
    try {
      const response = await fetch('/data/ErgoShop.json');
      this.ergoShopData = await response.json();
      console.log('ErgoShop data loaded for alcohol detection');
      return this.ergoShopData;
    } catch (error) {
      console.error('Failed to load ErgoShop data:', error);
      return null;
    }
  }

  /**
   * Check if an item has alcohol rating
   */
  isAlcoholItem(itemName) {
    if (!this.ergoShopData || !itemName) return false;
    
    const cleanItemName = itemName.replace(/\s*\(x\d+\)\s*$/, '').trim();
    
    for (const category in this.ergoShopData) {
      if (!Array.isArray(this.ergoShopData[category])) continue;
      
      for (const item of this.ergoShopData[category]) {
        if (item.rating === 'Alcohol') {
          const shopItemName = item.text.split(' - ')[0].trim();
          
          if (cleanItemName === shopItemName || 
              cleanItemName.includes(shopItemName) || 
              shopItemName.includes(cleanItemName)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Enhance the weekly tracker with proxied fetch and alcohol tracking
   */
  enhanceWeeklyTracker() {
    if (typeof window.proxiedFetch === 'undefined') {
      console.error('proxiedFetch not available, cannot enhance weekly tracker');
      return;
    }

    console.log('Enhancing weekly tracker with proxiedFetch and alcohol tracking...');
    
    this.enhanceLoadPurchases();
    this.enhanceDeletePurchase();
  }

  /**
   * Enhance loadPurchasesForWeek function
   */
  enhanceLoadPurchases() {
    if (typeof window.loadPurchasesForWeek !== 'function') return;
    
    const originalLoadPurchases = window.loadPurchasesForWeek;
    
    window.loadPurchasesForWeek = async (weekKey) => {
      try {
        await this.loadPurchasesWithEnhancements(weekKey);
      } catch (error) {
        console.error('Error in enhanced loadPurchasesForWeek:', error);
        return originalLoadPurchases(weekKey);
      }
    };
  }

  /**
   * Load purchases with enhancements
   */
  async loadPurchasesWithEnhancements(weekKey) {
    const user = window.currentUser;
    if (!user) return;

    this.showLoadingForUser(user);

    try {
      const purchases = await this.fetchPurchasesWithProxy(weekKey);
      this.displayEnhancedPurchases(user, purchases, weekKey);
      this.updateOfflineStatus(true);
    } catch (error) {
      console.warn(`Failed to load purchases: ${error.message}`);
      this.updateOfflineStatus(false);
    }
  }

  /**
   * Fetch purchases using proxied fetch
   */
  async fetchPurchasesWithProxy(weekKey) {
    console.log(`Fetching purchases for week ${weekKey} with proxiedFetch`);
    const response = await window.proxiedFetch(`/api/purchases/${weekKey}`);
    const purchases = await response.json();
    console.log(`Loaded ${purchases.length} purchases for week ${weekKey}`);
    return purchases;
  }

  /**
   * Display enhanced purchases with alcohol tracking
   */
  displayEnhancedPurchases(user, purchases, weekKey) {
    const userPurchases = purchases.filter(p => p.username === user);
    const purchaseList = document.querySelector(`#${user}-purchases ul`);
    const totalElement = document.querySelector(`#${user}-purchases .weekly-total`);
    const statsElement = document.querySelector(`#${user}-purchases .weekly-stats`);
    
    if (!purchaseList || !totalElement) return;
    
    purchaseList.innerHTML = '';
    
    let userTotal = 0;
    let userCalories = 0;
    
    userPurchases.forEach(purchase => {
      userTotal += purchase.total_value;
      userCalories += purchase.total_calories || 0;
      
      const purchaseDate = new Date(purchase.purchase_date);
      const dateStr = this.formatDate(purchaseDate);
      const items = this.parseItems(purchase.items);
      
      this.renderEnhancedItems(purchaseList, purchase, items, dateStr);
    });
    
    totalElement.textContent = `Total: ${userTotal} 💷`;
    this.updateEnhancedStats(statsElement, totalElement, userCalories, userPurchases);
    this.updateUserSectionVisibility();
  }

  /**
   * Render enhanced items with delete buttons
   */
  renderEnhancedItems(purchaseList, purchase, items, dateStr) {
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'purchase-item';
      li.dataset.purchaseId = purchase.id;
      
      const itemName = this.extractItemName(item);
      const icon = this.getItemIcon(itemName);
      
      li.innerHTML = `
        <span class="item-content">
          ${icon} ${itemName} <span class="date-display">(${dateStr})</span>
        </span>
        <button class="delete-purchase-btn" title="Remove this purchase">×</button>
      `;
      
      this.attachDeleteHandler(li, purchase.id, itemName);
      purchaseList.appendChild(li);
    });
  }

  /**
   * Update enhanced stats with alcohol count
   */
  updateEnhancedStats(statsElement, totalElement, userCalories, userPurchases) {
    const itemCount = this.countItems(userPurchases);
    const alcoholCount = this.countAlcoholItems(userPurchases);
    
    const statsHTML = `
      <p>Calories: ${userCalories} cal</p>
      <p>Items: ${itemCount}</p>
      <p>Alcohol: ${alcoholCount} 🍸</p>
    `;
    
    if (!statsElement) {
      const stats = document.createElement('div');
      stats.className = 'weekly-stats';
      stats.innerHTML = statsHTML;
      totalElement.parentNode.insertBefore(stats, totalElement.nextSibling);
    } else {
      statsElement.innerHTML = statsHTML;
    }
  }

  /**
   * Count alcohol items in purchases
   */
  countAlcoholItems(userPurchases) {
    return userPurchases.reduce((count, purchase) => {
      const items = this.parseItems(purchase.items);
      const alcoholItems = items.filter(item => {
        const itemName = this.extractItemName(item);
        const isAlcohol = this.isAlcoholItem(itemName);
        if (isAlcohol) {
          console.log(`Detected alcohol item: ${itemName}`);
        }
        return isAlcohol;
      });
      return count + alcoholItems.length;
    }, 0);
  }

  /**
   * Enhance deletePurchase function
   */
  enhanceDeletePurchase() {
    if (typeof window.deletePurchase !== 'function') return;
    
    const originalDeletePurchase = window.deletePurchase;
    
    window.deletePurchase = async (purchaseId) => {
      try {
        await this.deleteWithEnhancements(purchaseId);
      } catch (error) {
        console.error('Error in enhanced deletePurchase:', error);
        return originalDeletePurchase(purchaseId);
      }
    };
  }

  /**
   * Delete purchase with enhancements
   */
  async deleteWithEnhancements(purchaseId) {
    const purchaseLi = document.querySelector(`li[data-purchase-id="${purchaseId}"]`);
    if (purchaseLi) {
      purchaseLi.classList.add('deleting');
    }
    
    try {
      console.log(`Deleting purchase ${purchaseId} with proxiedFetch`);
      await window.proxiedFetch(`/api/purchases/${purchaseId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (window.currentDisplayWeek && window.loadPurchasesForWeek) {
        window.loadPurchasesForWeek(window.currentDisplayWeek);
      }
      
      this.showToast('Purchase removed successfully', 'success');
    } catch (error) {
      console.error('Delete failed:', error);
      
      if (purchaseLi) {
        purchaseLi.classList.remove('deleting');
      }
      
      this.showToast('Failed to delete purchase', 'error');
      throw error;
    }
  }

  /**
   * Setup user visibility
   */
  setupUserVisibility() {
    setTimeout(() => {
      if (window.currentUser) {
        const userSection = document.querySelector(`#${window.currentUser}-purchases`);
        if (userSection) {
          console.log(`Force showing ${window.currentUser} purchases section`);
          userSection.style.display = 'block';
          userSection.classList.add('active');
        }
      }
    }, 1500);
  }

  /**
   * Update user section visibility
   */
  updateUserSectionVisibility() {
    if (!window.users || !window.currentUser) return;
    
    window.users.forEach(user => {
      const userSection = document.querySelector(`#${user}-purchases`);
      if (userSection) {
        if (user === window.currentUser) {
          userSection.classList.add('active');
          userSection.style.display = 'block';
        } else {
          userSection.classList.remove('active');
          userSection.style.display = 'none';
        }
      }
    });
  }

  // Utility methods

  showLoadingForUser(user) {
    const purchaseList = document.querySelector(`#${user}-purchases ul`);
    if (purchaseList && window.showLoading) {
      window.showLoading(purchaseList);
    }
  }

  updateOfflineStatus(isOnline) {
    if (!window.offlineMode) return;
    
    if (isOnline && window.offlineMode.isOffline?.()) {
      window.offlineMode.checkConnectivity?.();
    } else if (!isOnline && !window.offlineMode.isOffline?.()) {
      window.offlineMode.checkConnectivity?.();
    }
  }

  formatDate(date) {
    return date.toLocaleDateString() + ' ' + 
           date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }

  parseItems(items) {
    return typeof items === 'string' ? JSON.parse(items) : items;
  }

  extractItemName(item) {
    return typeof item === 'string' ? item.split(' - ')[0] : item.name;
  }

  getItemIcon(itemName) {
    return window.getItemIcon ? window.getItemIcon(itemName) : '📦';
  }

  countItems(userPurchases) {
    return userPurchases.reduce((sum, p) => {
      const items = this.parseItems(p.items);
      return sum + items.length;
    }, 0);
  }

  attachDeleteHandler(li, purchaseId, itemName) {
    const deleteBtn = li.querySelector('.delete-purchase-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Are you sure you want to remove "${itemName}"?`)) {
        window.deletePurchase?.(purchaseId);
      }
    });
  }

  showToast(message, type) {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`Toast: ${message} (${type})`);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const enhancer = new WeeklyTrackerEnhancer();
  
  try {
    await enhancer.init();
    console.log('Weekly tracker enhancement complete!');
  } catch (error) {
    console.error('Failed to initialize weekly tracker enhancements:', error);
  }
});
