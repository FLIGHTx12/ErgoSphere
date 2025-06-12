/**
 * Weekly Purchase Tracker - Clean & Optimized Version
 * Consolidated functionality with better separation of concerns
 */

class WeeklyTracker {
  constructor() {
    this.currentDisplayWeek = null;
    this.users = ["FLIGHTx12", "Jaybers8"];
    this.currentUser = "FLIGHTx12";
    this.wsConnection = null;
    
    // Make global references available
    window.users = this.users;
    window.currentUser = this.currentUser;
  }

  /**
   * Initialize the tracker
   */
  async init() {
    await this.setupInitialState();
    this.setupUI();
    this.setupWebSocket();
    this.setupEventListeners();
  }

  /**
   * Setup initial state and theme
   */
  async setupInitialState() {
    // Initialize week
    if (typeof WeekTracker !== 'undefined') {
      WeekTracker.init();
      this.currentDisplayWeek = WeekTracker.getCurrentWeekKey();
    } else {
      this.currentDisplayWeek = new Date().toISOString().slice(0, 10);
    }

    // Setup user and theme
    const storedUser = localStorage.getItem('ergoShopCurrentUser');
    if (storedUser) {
      this.currentUser = storedUser;
      window.currentUser = storedUser;
    }
    
    this.updateUserTheme(this.currentUser);
    this.updateWeekDisplay();
    await this.loadPurchasesForWeek(this.currentDisplayWeek);
  }

  /**
   * Setup UI components
   */
  setupUI() {
    this.addUserSelector();
    this.initializeUserVisibility();
  }

  /**
   * Setup WebSocket with error handling
   */
  setupWebSocket() {
    if (typeof WebSocket === 'undefined') {
      console.warn('WebSocket not available');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let host = window.location.host;
    
    // Handle port redirects
    if (window.location.port === '1550') {
      const apiBaseUrl = sessionStorage.getItem('apiBaseUrl');
      if (apiBaseUrl) {
        try {
          host = new URL(apiBaseUrl).host;
        } catch (e) {
          host = host.replace(':1550', ':3000');
        }
      } else {
        host = host.replace(':1550', ':3000');
      }
    }

    const wsUrl = `${protocol}//${host}`;
    
    if (typeof WebSocketReconnector !== 'undefined') {
      this.wsConnection = new WebSocketReconnector(wsUrl, {
        reconnectInterval: 2000,
        maxReconnectInterval: 60000,
        maxReconnectAttempts: 20
      });
      
      this.wsConnection.on('message', (event) => this.handleWebSocketMessage(event));
    } else {
      this.wsConnection = new WebSocket(wsUrl);
      this.wsConnection.onmessage = (event) => this.handleWebSocketMessage(event);
    }
  }

  /**
   * Handle WebSocket messages
   */
  handleWebSocketMessage(event) {
    try {
      const message = JSON.parse(event.data);
      
      if ((message.type === 'newPurchase' || message.type === 'deletePurchase') &&
          message.data?.week_key === this.currentDisplayWeek) {
        this.loadPurchasesForWeek(this.currentDisplayWeek);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Override submitSelection for purchase recording
    if (typeof submitSelection === 'function') {
      const originalSubmitSelection = submitSelection;
      submitSelection = () => {
        originalSubmitSelection();
        this.handlePurchaseSubmission();
      };
    }
  }

  /**
   * Handle purchase submission from form
   */
  handlePurchaseSubmission() {
    const { selectedItems, totalValue } = this.extractSelectedItems();
    
    if (selectedItems.length > 0) {
      this.recordPurchase(selectedItems, totalValue);
    }
    
    localStorage.setItem('ergoShopCurrentUser', this.currentUser);
  }

  /**
   * Extract selected items from form
   */
  extractSelectedItems() {
    const selectedItems = [];
    let totalValue = 0;
    
    const containerIds = [
      "saltySnackContainer", "sweetSnackContainer", "frozenSnackContainer", 
      "concoctionsContainer", "mealModsContainer", "prizesContainer", 
      "replacementsContainer", "entertainmentContainer", 
      "schedulemodsContainer", "wantsvsneedsContainer"
    ];
    
    containerIds.forEach(containerId => {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const selects = container.querySelectorAll('select.custom-select');
      const quantities = container.querySelectorAll('.quantity-input');
      
      selects.forEach((select, index) => {
        if (index >= quantities.length) return;
        
        const quantityElement = quantities[index];
        const quantity = parseInt(quantityElement.value);
        const selectedOption = select.options[select.selectedIndex];
        
        if (selectedOption && select.selectedIndex !== 0 && quantity > 0) {
          const itemName = selectedOption.text.split(' - ')[0];
          const itemValue = parseInt(selectedOption.value);
          const totalItemValue = itemValue * quantity;
          
          selectedItems.push(`${itemName} (x${quantity}) - ${totalItemValue}💷`);
          totalValue += totalItemValue;
        }
      });
    });
    
    return { selectedItems, totalValue };
  }

  /**
   * Record a purchase
   */
  async recordPurchase(items, totalValue) {
    const weekKey = typeof WeekTracker !== 'undefined' ? 
      WeekTracker.getCurrentWeekKey() : new Date().toISOString().slice(0, 10);
    
    const totalCalories = await this.calculateTotalCalories(items);
    
    try {
      const success = await this.saveToServer(weekKey, items, totalValue, totalCalories);
      
      if (!success) {
        this.saveToLocalStorage(weekKey, items, totalValue, totalCalories);
        this.showToast('Server unavailable - saving offline', 'warning');
      } else {
        this.showToast('Purchase recorded successfully!', 'success');
      }
      
      if (this.currentDisplayWeek === weekKey) {
        this.loadPurchasesForWeek(weekKey);
      }
    } catch (error) {
      console.error('Error recording purchase:', error);
      this.showToast('Error recording purchase - please try again', 'error');
    }
  }

  /**
   * Calculate total calories for items
   */
  async calculateTotalCalories(items) {
    let totalCalories = 0;
    
    for (const item of items) {
      const match = item.match(/(.+) \(x(\d+)\)/);
      const name = match ? match[1].trim() : item;
      const quantity = match ? parseInt(match[2]) : 1;
      
      try {
        const calories = await this.calculateCalories(name, quantity);
        totalCalories += calories;
      } catch (error) {
        console.warn(`Could not calculate calories for ${name}:`, error);
      }
    }
    
    return totalCalories;
  }

  /**
   * Calculate calories for a specific item
   */
  async calculateCalories(itemText, quantity) {
    try {
      const response = await fetch('/data/ErgoShop.json');
      const data = await response.json();
      
      for (const category in data) {
        if (!Array.isArray(data[category])) continue;
        
        for (const item of data[category]) {
          const itemName = item.text?.split(' - ')[0]?.trim();
          if (itemName && itemText.includes(itemName)) {
            return (item.calories || 0) * quantity;
          }
        }
      }
    } catch (error) {
      console.warn('Error calculating calories:', error);
    }
    
    return 0;
  }

  /**
   * Save purchase to server
   */
  async saveToServer(weekKey, items, totalValue, totalCalories) {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        let baseUrl = sessionStorage.getItem('apiBaseUrl') || window.location.origin;
        
        if (!sessionStorage.getItem('apiBaseUrl') && window.location.port === '1550') {
          baseUrl = baseUrl.replace(':1550', ':3000');
        }
        
        const response = await fetch(`${baseUrl}/api/purchases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: this.currentUser,
            week_key: weekKey,
            items: JSON.stringify(items),
            total_value: totalValue,
            total_calories: totalCalories
          })
        });
        
        if (response.ok) {
          sessionStorage.setItem('apiBaseUrl', baseUrl);
          return true;
        }
        
        retryCount++;
        if (retryCount <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Network error (attempt ${retryCount + 1}):`, error);
        retryCount++;
        if (retryCount <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    return false;
  }

  /**
   * Save purchase to localStorage as fallback
   */
  saveToLocalStorage(weekKey, items, totalValue, totalCalories) {
    const weeklyPurchases = JSON.parse(localStorage.getItem(`ergoShop_purchases_${weekKey}`) || '{}');
    
    if (!weeklyPurchases[this.currentUser]) {
      weeklyPurchases[this.currentUser] = [];
    }
    
    weeklyPurchases[this.currentUser].push({
      date: new Date().toISOString(),
      items: items,
      total: totalValue,
      calories: totalCalories
    });
    
    localStorage.setItem(`ergoShop_purchases_${weekKey}`, JSON.stringify(weeklyPurchases));
  }

  /**
   * Load and display purchases for a week
   */
  async loadPurchasesForWeek(weekKey) {
    this.showLoading();
    
    try {
      const purchases = await this.fetchPurchases(weekKey);
      this.displayPurchases(purchases, weekKey);
    } catch (error) {
      console.error('Error loading purchases:', error);
      this.displayLocalPurchases(weekKey);
    }
  }

  /**
   * Fetch purchases from server
   */
  async fetchPurchases(weekKey) {
    let baseUrl = sessionStorage.getItem('apiBaseUrl') || window.location.origin;
    
    if (!sessionStorage.getItem('apiBaseUrl') && window.location.port === '1550') {
      baseUrl = baseUrl.replace(':1550', ':3000');
    }
    
    const response = await fetch(`${baseUrl}/api/purchases/${weekKey}`);
    
    if (response.ok) {
      sessionStorage.setItem('apiBaseUrl', baseUrl);
      return await response.json();
    }
    
    throw new Error(`Failed to fetch purchases: ${response.status}`);
  }

  /**
   * Display purchases in the UI
   */
  displayPurchases(purchases, weekKey) {
    const userPurchases = purchases.filter(p => p.username === this.currentUser);
    const purchaseList = document.querySelector(`#${this.currentUser}-purchases ul`);
    const totalElement = document.querySelector(`#${this.currentUser}-purchases .weekly-total`);
    
    if (!purchaseList || !totalElement) return;
    
    purchaseList.innerHTML = '';
    
    let userTotal = 0;
    let userCalories = 0;
    
    userPurchases.forEach(purchase => {
      userTotal += purchase.total_value;
      userCalories += purchase.total_calories || 0;
      
      const items = typeof purchase.items === 'string' ? 
        JSON.parse(purchase.items) : purchase.items;
      
      this.renderPurchaseItems(purchaseList, purchase, items);
    });
    
    this.updateStats(totalElement, userTotal, userCalories, userPurchases);
    this.updateUserVisibility();
  }

  /**
   * Render individual purchase items
   */
  renderPurchaseItems(purchaseList, purchase, items) {
    const purchaseDate = new Date(purchase.purchase_date);
    const dateStr = purchaseDate.toLocaleDateString() + ' ' + 
                   purchaseDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'purchase-item';
      li.dataset.purchaseId = purchase.id;
      
      const itemName = typeof item === 'string' ? item.split(' - ')[0] : item.name;
      const icon = this.getItemIcon(itemName);
      
      li.innerHTML = `
        <span class="item-content">
          ${icon} ${itemName} <span class="date-display">(${dateStr})</span>
        </span>
        <button class="delete-purchase-btn" title="Remove this purchase">×</button>
      `;
      
      // Add delete handler
      li.querySelector('.delete-purchase-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to remove "${itemName}"?`)) {
          this.deletePurchase(purchase.id);
        }
      });
      
      purchaseList.appendChild(li);
    });
  }

  /**
   * Update stats display
   */
  updateStats(totalElement, userTotal, userCalories, userPurchases) {
    totalElement.textContent = `Total: ${userTotal} 💷`;
    
    let statsElement = document.querySelector(`#${this.currentUser}-purchases .weekly-stats`);
    
    const itemCount = userPurchases.reduce((sum, p) => {
      const items = typeof p.items === 'string' ? JSON.parse(p.items) : p.items;
      return sum + items.length;
    }, 0);
    
    const statsHTML = `
      <p>Calories: ${userCalories} cal</p>
      <p>Items: ${itemCount}</p>
    `;
    
    if (!statsElement) {
      statsElement = document.createElement('div');
      statsElement.className = 'weekly-stats';
      statsElement.innerHTML = statsHTML;
      totalElement.parentNode.insertBefore(statsElement, totalElement.nextSibling);
    } else {
      statsElement.innerHTML = statsHTML;
    }
  }

  /**
   * Display purchases from localStorage
   */
  displayLocalPurchases(weekKey) {
    const weeklyPurchases = JSON.parse(localStorage.getItem(`ergoShop_purchases_${weekKey}`) || '{}');
    const userPurchases = weeklyPurchases[this.currentUser] || [];
    
    const purchaseList = document.querySelector(`#${this.currentUser}-purchases ul`);
    const totalElement = document.querySelector(`#${this.currentUser}-purchases .weekly-total`);
    
    if (!purchaseList || !totalElement) return;
    
    purchaseList.innerHTML = '';
    
    let userTotal = 0;
    let userCalories = 0;
    
    userPurchases.forEach(purchase => {
      userTotal += purchase.total;
      userCalories += purchase.calories || 0;
      
      const purchaseDate = new Date(purchase.date);
      const dateStr = purchaseDate.toLocaleDateString() + ' ' + 
                     purchaseDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      purchase.items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'purchase-item';
        
        const itemName = item.split(' - ')[0];
        const icon = this.getItemIcon(itemName);
        
        li.innerHTML = `
          <span class="item-content">
            ${icon} ${itemName} <span class="date-display">(${dateStr})</span>
          </span>
        `;
        
        purchaseList.appendChild(li);
      });
    });
    
    this.updateStats(totalElement, userTotal, userCalories, userPurchases);
    this.updateUserVisibility();
  }

  /**
   * Delete a purchase
   */
  async deletePurchase(purchaseId) {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        this.loadPurchasesForWeek(this.currentDisplayWeek);
        this.showToast('Purchase removed successfully', 'success');
      } else {
        throw new Error('Failed to delete purchase');
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
      this.showToast('Failed to delete purchase', 'error');
    }
  }

  /**
   * Add user selector dropdown
   */
  addUserSelector() {
    const headerElement = document.querySelector('header');
    if (!headerElement) return;
    
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'user-selector-container';
    selectorContainer.style.cssText = 'text-align: center; margin: 10px auto; max-width: 300px;';
    
    const label = document.createElement('label');
    label.htmlFor = 'user-selector';
    label.textContent = 'Select User: ';
    label.style.cssText = 'margin-right: 15px; color: #fff; font-weight: bold; font-size: 1.1rem;';
    
    const userSelector = document.createElement('select');
    userSelector.id = 'user-selector';
    userSelector.className = 'custom-select';
    userSelector.style.cssText = 'width: auto; padding: 8px;';
    
    this.users.forEach(user => {
      const option = document.createElement('option');
      option.value = user;
      option.textContent = user;
      if (user === this.currentUser) option.selected = true;
      userSelector.appendChild(option);
    });
    
    userSelector.addEventListener('change', () => {
      this.currentUser = userSelector.value;
      window.currentUser = this.currentUser;
      localStorage.setItem('ergoShopCurrentUser', this.currentUser);
      this.updateUserTheme(this.currentUser);
      this.initializeUserVisibility();
      this.loadPurchasesForWeek(this.currentDisplayWeek);
    });
    
    selectorContainer.appendChild(label);
    selectorContainer.appendChild(userSelector);
    headerElement.insertAdjacentElement('afterend', selectorContainer);
  }

  /**
   * Initialize user visibility
   */
  initializeUserVisibility() {
    this.users.forEach(user => {
      const userSection = document.querySelector(`#${user}-purchases`);
      if (userSection) {
        if (user === this.currentUser) {
          userSection.classList.add('active');
          userSection.style.display = 'block';
        } else {
          userSection.classList.remove('active');
          userSection.style.display = 'none';
        }
      }
    });
  }

  /**
   * Update user visibility after data changes
   */
  updateUserVisibility() {
    this.users.forEach(user => {
      const userSection = document.querySelector(`#${user}-purchases`);
      if (userSection) {
        userSection.style.display = user === this.currentUser ? 'block' : 'none';
      }
    });
  }

  /**
   * Update user theme
   */
  updateUserTheme(username) {
    const root = document.documentElement;
    
    document.body.classList.add('theme-transitioning');
    
    setTimeout(() => {
      if (username === 'FLIGHTx12') {
        root.style.setProperty('--active-user-theme', '#ff6b35');
      } else if (username === 'Jaybers8') {
        root.style.setProperty('--active-user-theme', '#4ecdc4');
      }
      
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
      }, 300);
    }, 50);
  }

  /**
   * Update week display
   */
  updateWeekDisplay() {
    const weekDisplay = document.getElementById('current-week-display');
    if (weekDisplay) {
      const displayDate = new Date(this.currentDisplayWeek);
      weekDisplay.textContent = `Week of ${displayDate.toLocaleDateString()}`;
    }
    
    if (typeof WeekTracker !== 'undefined') {
      const weekNumber = WeekTracker.getCurrentWeekNumber();
      document.querySelectorAll('.week-number').forEach(el => {
        el.textContent = weekNumber;
      });
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    const purchaseList = document.querySelector(`#${this.currentUser}-purchases ul`);
    if (purchaseList) {
      purchaseList.innerHTML = '<div class="loading-spinner"></div>';
    }
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    // Disabled to reduce screen clutter
    console.log(`Toast: ${message} (${type})`);
  }

  /**
   * Get icon for item
   */
  getItemIcon(itemName) {
    if (!itemName) return '📦';
    
    const lowerName = itemName.toLowerCase();
    
    if (lowerName.includes('chip') || lowerName.includes('crisp') || lowerName.includes('snack')) return '🍟';
    if (lowerName.includes('sweet') || lowerName.includes('chocolate') || lowerName.includes('candy')) return '🍫';
    if (lowerName.includes('ice cream') || lowerName.includes('frozen')) return '🍦';
    if (lowerName.includes('coffee') || lowerName.includes('tea')) return '☕';
    if (lowerName.includes('beer') || lowerName.includes('wine') || lowerName.includes('🍺') || lowerName.includes('🍷')) return '🍺';
    if (lowerName.includes('drink') || lowerName.includes('soda')) return '🥤';
    
    return '📦';
  }

  /**
   * Switch to previous week
   */
  switchToPreviousWeek() {
    const currentDate = new Date(this.currentDisplayWeek);
    currentDate.setDate(currentDate.getDate() - 7);
    this.currentDisplayWeek = currentDate.toISOString().slice(0, 10);
    this.updateWeekDisplay();
    this.loadPurchasesForWeek(this.currentDisplayWeek);
  }

  /**
   * Switch to next week
   */
  switchToNextWeek() {
    const currentDate = new Date(this.currentDisplayWeek);
    currentDate.setDate(currentDate.getDate() + 7);
    this.currentDisplayWeek = currentDate.toISOString().slice(0, 10);
    this.updateWeekDisplay();
    this.loadPurchasesForWeek(this.currentDisplayWeek);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(async () => {
    const tracker = new WeeklyTracker();
    await tracker.init();
    
    // Make globally available for compatibility
    window.weeklyTracker = tracker;
    window.loadPurchasesForWeek = (weekKey) => tracker.loadPurchasesForWeek(weekKey);
    window.deletePurchase = (purchaseId) => tracker.deletePurchase(purchaseId);
    window.switchToPreviousWeek = () => tracker.switchToPreviousWeek();
    window.switchToNextWeek = () => tracker.switchToNextWeek();
  }, 500);
});
