// Weekly Purchase Tracker
let currentDisplayWeek = null;
const users = ["FLIGHTx12", "Jaybers8"];
let currentUser = "FLIGHTx12"; // Default user

/**
 * Initialize the weekly purchase tracker
 */
function initWeeklyPurchaseTracker() {
  // Import the WeekTracker functionality
  if (typeof WeekTracker !== 'undefined') {
    // Use WeekTracker to get current week
    WeekTracker.init();
    currentDisplayWeek = WeekTracker.getCurrentWeekKey();
    updateWeekDisplay();
    loadPurchasesForWeek(currentDisplayWeek);
  } else {
    console.error("WeekTracker module not found!");
    // Fallback to current date-based week if WeekTracker is not available
    const now = new Date();
    currentDisplayWeek = now.toISOString().slice(0, 10);
    updateWeekDisplay();
    loadPurchasesForWeek(currentDisplayWeek);
  }

  // Add user selection dropdown
  addUserSelector();
  
  // Set up WebSocket connection for real-time updates
  setupWebSocket();
  
  // Set up initial theme based on stored user
  if (localStorage.getItem('ergoShopCurrentUser')) {
    currentUser = localStorage.getItem('ergoShopCurrentUser');
    updateUserTheme(currentUser);
  } else {
    updateUserTheme('FLIGHTx12'); // Default to FLIGHTx12 theme
  }
}

/**
 * Set up WebSocket connection for real-time updates
 */
function setupWebSocket() {
  // Check if WebSocket is available in the environment
  if (typeof WebSocket === 'undefined') {
    console.warn('WebSocket not available, real-time updates disabled');
    return;
  }
  
  // Create WebSocket connection
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('WebSocket connection established');
    // Send a ping to keep connection alive
    setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Every 30 seconds
  };
  
  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      
      // Handle purchase updates
      if (message.type === 'newPurchase') {
        // Reload purchases if the purchase is for the currently displayed week
        if (message.data.week_key === currentDisplayWeek) {
          loadPurchasesForWeek(currentDisplayWeek);
        }
      } else if (message.type === 'deletePurchase') {
        // Reload purchases if a purchase is deleted
        loadPurchasesForWeek(currentDisplayWeek);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket connection closed');
    // Try to reconnect after a delay
    setTimeout(setupWebSocket, 5000);
  };
}

/**
 * Add a user selector dropdown
 */
function addUserSelector() {
  // Get the header element to place the user selector below it
  const headerElement = document.querySelector('header');
  
  if (headerElement) {
    // Create a container for the user selector
    const selectorContainer = document.createElement('div');
    selectorContainer.id = 'user-selector-container';
    selectorContainer.className = 'user-selector-container';
    selectorContainer.style.textAlign = 'center';
    selectorContainer.style.margin = '10px auto';
    selectorContainer.style.maxWidth = '300px';
      // Create a label for the selector
    const label = document.createElement('label');
    label.htmlFor = 'user-selector';
    label.textContent = 'Select User: ';
    label.style.marginRight = '15px';
    label.style.color = '#fff';
    label.style.fontWeight = 'bold';
    label.style.fontSize = '1.1rem';
    
    // Create the user selector
    const userSelector = document.createElement('select');
    userSelector.id = 'user-selector';
    userSelector.className = 'custom-select';
    userSelector.style.width = 'auto';
    userSelector.style.padding = '8px';
    
    // Add options for each user
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user;
      option.textContent = user;
      userSelector.appendChild(option);
    });
      // Add change event listener
    userSelector.addEventListener('change', function() {
      currentUser = this.value;
      localStorage.setItem('ergoShopCurrentUser', currentUser);
      updateUserTheme(currentUser);
    });
    
    // Add elements to the container
    selectorContainer.appendChild(label);
    selectorContainer.appendChild(userSelector);
    
    // Insert after the header
    headerElement.after(selectorContainer);
    
    // Set initial value from localStorage if available
    if (localStorage.getItem('ergoShopCurrentUser')) {
      currentUser = localStorage.getItem('ergoShopCurrentUser');
      userSelector.value = currentUser;
    }
  }
}

/**
 * Calculate calories from a product text and lookup in the options
 */
async function calculateCalories(itemText, quantity) {
  try {
    // Clean the item text to match product names
    const cleanText = itemText.split(' - ')[0];
    
    // Load the full products data to look up calories
    const response = await fetch(optionsFile);
    const optionsData = await response.json();
    
    // Search in all containers for the product
    let caloriesPerItem = 0;
    
    const containers = [
      "saltySnackContainer", "sweetSnackContainer", "frozenSnackContainer", 
      "concoctionsContainer", "mealModsContainer"
    ];
    
    for (const container of containers) {
      if (!optionsData[container]) continue;
      
      // Find the matching product
      const product = optionsData[container].find(p => 
        p.text && p.text.includes(cleanText)
      );
      
      if (product && product.calories) {
        caloriesPerItem = product.calories;
        break;
      }
    }
    
    return caloriesPerItem * quantity;
  } catch (error) {
    console.error('Error calculating calories:', error);
    return 0;
  }
}

/**
 * Check if an item is an alcoholic drink
 */
function isAlcoholicDrink(itemText) {
  if (typeof itemText !== 'string') return false;
  
  const lowerText = itemText.toLowerCase();
  return lowerText.includes('beer') || 
         lowerText.includes('wine') || 
         lowerText.includes('mixed drink') || 
         itemText.includes('🍺') || 
         itemText.includes('🍷') || 
         itemText.includes('🥃') || 
         itemText.includes('🍾');
}

/**
 * Record a purchase for the current user
 */
async function recordPurchase(items, totalValue) {
  const weekKey = typeof WeekTracker !== 'undefined' ? 
    WeekTracker.getCurrentWeekKey() : new Date().toISOString().slice(0, 10);
  
  // Calculate total calories for this purchase
  let totalCalories = 0;
  
  // Extract quantities and product names
  const itemDetails = items.map(item => {
    const match = item.match(/(.+) \(x(\d+)\)/);
    if (match) {
      return {
        name: match[1].trim(),
        quantity: parseInt(match[2])
      };
    }
    return { name: item, quantity: 1 };
  });
  
  // Calculate calories for each item
  for (const item of itemDetails) {
    const calories = await calculateCalories(item.name, item.quantity);
    totalCalories += calories;
  }
  
  try {
    // Send purchase to server
    const response = await fetch('/api/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: currentUser,
        weekKey: weekKey,
        items: items,
        totalValue: totalValue,
        totalCalories: totalCalories
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error recording purchase:', errorData);
      return;
    }
    
    // Update the display if we're viewing the current week
    if (currentDisplayWeek === weekKey) {
      loadPurchasesForWeek(weekKey);
    }
  } catch (error) {
    console.error('Error sending purchase to server:', error);
    
    // Fallback to localStorage if server request fails
    const weeklyPurchases = JSON.parse(localStorage.getItem(`ergoShop_purchases_${weekKey}`) || '{}');
    if (!weeklyPurchases[currentUser]) {
      weeklyPurchases[currentUser] = [];
    }
    weeklyPurchases[currentUser].push({
      date: new Date().toISOString(),
      items: items,
      total: totalValue,
      calories: totalCalories
    });
    localStorage.setItem(`ergoShop_purchases_${weekKey}`, JSON.stringify(weeklyPurchases));
    
    // Update the display
    if (currentDisplayWeek === weekKey) {
      loadPurchasesForWeek(weekKey);
    }
  }
}

/**
 * Delete a purchase by its ID
 * @param {number} purchaseId - The ID of the purchase to delete
 */
async function deletePurchase(purchaseId) {
  try {
    // Show loading spinner
    const purchaseLi = document.querySelector(`li[data-purchase-id="${purchaseId}"]`);
    if (purchaseLi) {
      purchaseLi.classList.add('deleting');
    }
    
    // Call the API to delete the purchase
    const response = await fetch(`/api/purchases/${purchaseId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    // Reload purchases to update the display
    loadPurchasesForWeek(currentDisplayWeek);
    
    // Show success feedback
    showToast('Purchase removed successfully', 'success');
  } catch (error) {
    console.error('Error deleting purchase:', error);
    showToast('Failed to delete purchase', 'error');
    
    // Remove the loading state
    const purchaseLi = document.querySelector(`li[data-purchase-id="${purchaseId}"]`);
    if (purchaseLi) {
      purchaseLi.classList.remove('deleting');
    }
  }
}

/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, info)
 */
function showToast(message, type = 'info') {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Remove toast after animation
  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }, 10);
}

/**
 * Load and display purchases and metrics for a specific week
 */
async function loadPurchasesForWeek(weekKey) {
  // Show loading state in purchase containers
  users.forEach(user => {
    const purchaseList = document.querySelector(`#${user}-purchases ul`);
    if (purchaseList) {
      showLoading(purchaseList);
    }
  });
  
  // Also show loading in the metrics summary
  const metricsContainer = document.querySelector('#weekly-metrics-summary');
  if (metricsContainer) {
    showLoading(metricsContainer);
  }
  
  try {
    // Get purchases from server
    const purchasesResponse = await fetch(`/api/purchases/${weekKey}`);
    if (!purchasesResponse.ok) {
      throw new Error(`Server returned ${purchasesResponse.status}`);
    }
    
    const purchases = await purchasesResponse.json();
    
    // Get user metrics from server
    const metricsResponse = await fetch(`/api/purchases/metrics/${weekKey}`);
    const metrics = metricsResponse.ok ? await metricsResponse.json() : [];
    
    // Group purchases by user
    const purchasesByUser = {};
    users.forEach(user => {
      purchasesByUser[user] = [];
    });
    
    // Organize purchases by user
    purchases.forEach(purchase => {
      if (purchasesByUser[purchase.username]) {
        purchasesByUser[purchase.username].push(purchase);
      }
    });
    
    // Update display for each user
    users.forEach(user => {
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
            JSON.parse(purchase.items) : purchase.items;          // Create list item for each item in the purchase
          items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'purchase-item';
            li.dataset.purchaseId = purchase.id;
            
            // Extract just the item name without the price
            const itemName = typeof item === 'string' ? item.split(' - ')[0] : item.name;
            const icon = getItemIcon(itemName);
            
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
                deletePurchase(purchase.id);
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
    
    // Update the metrics charts
    updateMetricsCharts(weekKey);
  } catch (error) {
    console.error('Error loading purchases from server:', error);
    
    // Fallback to localStorage if server request fails
    const weeklyPurchases = JSON.parse(localStorage.getItem(`ergoShop_purchases_${weekKey}`) || '{}');
    
    // Update display for each user
    users.forEach(user => {
      const userPurchases = weeklyPurchases[user] || [];
      const purchaseList = document.querySelector(`#${user}-purchases ul`);
      const totalElement = document.querySelector(`#${user}-purchases .weekly-total`);
      const statsElement = document.querySelector(`#${user}-purchases .weekly-stats`);
      
      if (purchaseList && totalElement) {
        // Clear existing content
        purchaseList.innerHTML = '';
        
        // Calculate total
        let userTotal = 0;
        let userCalories = 0;
          // Add each purchase
        userPurchases.forEach(purchase => {
          userTotal += purchase.total;
          userCalories += purchase.calories || 0;
          
          // Format date
          const purchaseDate = new Date(purchase.date);
          const dateStr = purchaseDate.toLocaleDateString() + ' ' + 
                         purchaseDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            // Create list item for each item in the purchase
          purchase.items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'purchase-item';
            li.dataset.purchaseId = purchase.id || 'local-' + purchaseDate.getTime();
            
            // Extract just the item name without the price
            const itemName = item.split(' - ')[0];
            const icon = getItemIcon(itemName);
            
            // Create content container
            const contentSpan = document.createElement('span');
            contentSpan.className = 'item-content';
            contentSpan.innerHTML = `${icon} ${itemName} <span class="date-display">(${dateStr})</span>`;
            li.appendChild(contentSpan);
            
            // Create delete button (only for local storage purchases)
            if (purchase.id === undefined) {
              const deleteBtn = document.createElement('button');
              deleteBtn.className = 'delete-purchase-btn';
              deleteBtn.innerHTML = '×';
              deleteBtn.title = 'Remove this purchase';
              deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to remove "${itemName}"?`)) {
                  // Remove from local storage
                  const localStorageKey = `ergoShop_purchases_${weekKey}`;
                  const storedPurchases = JSON.parse(localStorage.getItem(localStorageKey) || '{}');
                  
                  if (storedPurchases[user]) {
                    // Find and remove the purchase
                    const purchaseIndex = storedPurchases[user].findIndex(p => 
                      new Date(p.date).getTime() === purchaseDate.getTime());
                    
                    if (purchaseIndex !== -1) {
                      storedPurchases[user].splice(purchaseIndex, 1);
                      localStorage.setItem(localStorageKey, JSON.stringify(storedPurchases));
                      
                      // Reload the purchases
                      loadPurchasesForWeek(weekKey);
                      
                      // Show success message
                      showToast('Purchase removed successfully', 'success');
                    }
                  }
                }
              });
              li.appendChild(deleteBtn);
            }
            
            purchaseList.appendChild(li);
          });
        });
        
        // Update total display
        totalElement.textContent = `Total: ${userTotal} 💷`;
        
        // Update or create stats element
        if (!statsElement) {
          const stats = document.createElement('div');
          stats.className = 'weekly-stats';
          stats.innerHTML = `
            <p>Calories: ${userCalories} cal</p>
            <p>Items: ${userPurchases.reduce((sum, p) => sum + p.items.length, 0)}</p>
          `;
          totalElement.parentNode.insertBefore(stats, totalElement.nextSibling);
        } else {
          statsElement.innerHTML = `
            <p>Calories: ${userCalories} cal</p>
            <p>Items: ${userPurchases.reduce((sum, p) => sum + p.items.length, 0)}</p>
          `;
        }
      }
    });
  }
}

/**
 * Update the metrics chart visualization
 */
async function updateMetricsCharts(weekKey) {
  try {
    // Get user metrics from server
    const response = await fetch(`/api/purchases/metrics/${weekKey}`);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const metrics = await response.json();
    
    // Find metrics for each user
    const userMetrics = {};
    users.forEach(user => {
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
    
    // Update the spent chart
    users.forEach(user => {
      const spentBar = document.querySelector(`#${user}-spent .bar`);
      const spentValue = document.querySelector(`#${user}-spent .value`);
      
      if (spentBar && spentValue) {
        const value = userMetrics[user].total_spent || 0;
        const percentage = (value / maxSpent) * 100;
        
        // Update the bar width
        spentBar.style.setProperty('--bar-width', `${percentage}%`);
        
        // Update the value text
        spentValue.textContent = `${value} 💷`;
      }
    });
    
    // Update the calories chart
    users.forEach(user => {
      const caloriesBar = document.querySelector(`#${user}-calories .bar`);
      const caloriesValue = document.querySelector(`#${user}-calories .value`);
      
      if (caloriesBar && caloriesValue) {
        const value = userMetrics[user].total_calories || 0;
        const percentage = (value / maxCalories) * 100;
        
        // Update the bar width
        caloriesBar.style.setProperty('--bar-width', `${percentage}%`);
        
        // Update the value text
        caloriesValue.textContent = `${value} cal`;
      }
    });
    
    // Update the alcohol consumption chart
    users.forEach(user => {
      const alcoholBar = document.querySelector(`#${user}-alcohol .bar`);
      const alcoholValue = document.querySelector(`#${user}-alcohol .value`);
      const alcoholContainer = document.querySelector(`#${user}-alcohol`);
      
      if (alcoholBar && alcoholValue) {
        const value = userMetrics[user].alcohol_count || 0;
        const percentage = (value / maxAlcohol) * 100;
        
        // Update the bar width
        alcoholBar.style.setProperty('--bar-width', `${percentage}%`);
        
        // Update the value text
        alcoholValue.textContent = `${value} 🍸`;
        
        // Add warning indicator for high consumption (more than 7 drinks per week)
        if (value > 7) {
          alcoholContainer.setAttribute('data-high-consumption', 'true');
        } else {
          alcoholContainer.removeAttribute('data-high-consumption');
        }
      }    });
    
    // Apply visual enhancements after updating charts
    setTimeout(() => {
      enhanceMetricsVisuals();
    }, 100);
  } catch (error) {
    console.error('Error updating metrics charts:', error);
  }
}

/**
 * Apply visual enhancements to metrics bars
 */
function enhanceMetricsVisuals() {
  // Add animations to metric cards
  const metricCards = document.querySelectorAll('.metric-card');
  
  metricCards.forEach((card, index) => {
    // Stagger animation for cards
    card.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s both`;
    
    // Add hover effect to show more details
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.8)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
    });
  });
  
  // Add glow effect to high values
  const userBars = document.querySelectorAll('.user-bar');
  userBars.forEach(bar => {
    const valueEl = bar.querySelector('.value');
    const barEl = bar.querySelector('.bar');
    
    if (valueEl && barEl) {
      const value = parseFloat(valueEl.textContent);
      if (!isNaN(value)) {
        // If the bar has high value (width > 70%)
        const barWidth = barEl.firstElementChild ? 
          parseInt(barEl.firstElementChild.style.width) : 0;
        
        if (barWidth > 70) {
          barEl.style.animation = 'glow 3s infinite';
        }
      }
    }
  });
}

/**
 * Update the week display
 */
function updateWeekDisplay() {
  const weekDisplay = document.getElementById('current-week-display');
  if (weekDisplay) {
    const displayDate = new Date(currentDisplayWeek);
    weekDisplay.textContent = `Week of ${displayDate.toLocaleDateString()}`;
  }
  
  // Update week number spans
  const weekElements = document.querySelectorAll('.week-number');
  if (typeof WeekTracker !== 'undefined') {
    const weekNumber = WeekTracker.getCurrentWeekNumber();
    weekElements.forEach(el => {
      el.textContent = weekNumber;
    });
  }
}

/**
 * Switch to the previous week
 */
function switchToPreviousWeek() {
  const currentDate = new Date(currentDisplayWeek);
  currentDate.setDate(currentDate.getDate() - 7);
  currentDisplayWeek = currentDate.toISOString().slice(0, 10);
  updateWeekDisplay();
  loadPurchasesForWeek(currentDisplayWeek);
}

/**
 * Switch to the next week
 */
function switchToNextWeek() {
  const currentDate = new Date(currentDisplayWeek);
  currentDate.setDate(currentDate.getDate() + 7);
  currentDisplayWeek = currentDate.toISOString().slice(0, 10);
  updateWeekDisplay();
  loadPurchasesForWeek(currentDisplayWeek);
}

// Override the submitSelection function to record purchases
const originalSubmitSelection = submitSelection;
submitSelection = function() {
  // First, call the original function
  originalSubmitSelection();
  
  // Then, get the selected items for recording
  let selectedItems = [];
  let totalValue = 0;
  
  const selectContainers = [
    "saltySnackContainer", "sweetSnackContainer", "frozenSnackContainer", "concoctionsContainer",
    "mealModsContainer", "prizesContainer", "replacementsContainer",
    "entertainmentContainer", "schedulemodsContainer", "wantsvsneedsContainer"
  ];
  
  selectContainers.forEach(selectContainerId => {
    const container = document.getElementById(selectContainerId);
    if (container) {
      const selects = container.querySelectorAll('select.custom-select');
      const quantities = container.querySelectorAll('.quantity-input');
      
      selects.forEach((select, index) => {
        if (index < quantities.length) {
          const quantityElement = quantities[index];
          const quantity = parseInt(quantityElement.value);
          
          const selectedOption = select.options[select.selectedIndex];
          if (selectedOption && select.selectedIndex !== 0 && quantity > 0) {
            const itemName = selectedOption.text.split(' - ')[0];
            const itemValue = parseInt(selectedOption.value);
            const totalItemValue = itemValue * quantity;
            let itemText = `${itemName} (x${quantity}) - ${totalItemValue}💷`;
            selectedItems.push(itemText);
            totalValue += totalItemValue;
          }
        }
      });
    }
  });
  
  // Only record if there are items to record
  if (selectedItems.length > 0) {
    recordPurchase(selectedItems, totalValue);
  }
  
  // Save current user
  localStorage.setItem('ergoShopCurrentUser', currentUser);
};

// Initialize the weekly purchase tracker when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize our tracker
  setTimeout(() => {
    initWeeklyPurchaseTracker();
    
    // Apply the theme separately to ensure it's applied after all DOM elements are ready
    const storedUser = localStorage.getItem('ergoShopCurrentUser') || 'FLIGHTx12';
    updateUserTheme(storedUser);
  }, 500);
});

/**
 * Update the theme based on the selected user
 */
function updateUserTheme(username) {
  const root = document.documentElement;
  
  // Add a transition class to body for smoother transitions
  document.body.classList.add('theme-transitioning');
  
  // Set a timeout to allow for transition to take effect
  setTimeout(() => {
    if (username === 'FLIGHTx12') {
      root.style.setProperty('--active-user-theme', 'var(--flight-color)');
      root.style.setProperty('--active-user-theme-dark', 'var(--flight-color-dark)');
      document.body.classList.remove('jaybers-theme');
      document.body.classList.add('flight-theme');
    } else if (username === 'Jaybers8') {
      root.style.setProperty('--active-user-theme', 'var(--jaybers-color)');
      root.style.setProperty('--active-user-theme-dark', 'var(--jaybers-color-dark)');
      document.body.classList.remove('flight-theme');
      document.body.classList.add('jaybers-theme');
    }
    
    // Update UI elements that need immediate refresh
    updateHeaderStyling();
    updateContainerStyling();
    
    // Remove the transition class after the theme has been fully applied
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);
  }, 50);
}

/**
 * Update header styling based on the current theme
 */
function updateHeaderStyling() {
  const header = document.querySelector('header h1');
  if (header) {
    // Force re-animation by removing and re-adding the element
    header.style.animation = 'none';
    setTimeout(() => {
      header.style.animation = '';
    }, 10);
  }
}

/**
 * Update container styling based on the current theme
 */
function updateContainerStyling() {
  // Update selectors and buttons to match the current theme
  const selectors = document.querySelectorAll('.custom-select');
  const buttons = document.querySelectorAll('button:not(#navbar button)');
  
  selectors.forEach(selector => {
    selector.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--active-user-theme');
  });
  
  buttons.forEach(button => {
    // Only update non-navbar buttons
    if (!button.closest('#navbar')) {
      button.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--active-user-theme');
    }
  });
}

/**
 * Show loading state in a container
 */
function showLoading(container) {
  if (!container) return;
  
  // Create loading spinner
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  
  // Clear container and add spinner
  container.innerHTML = '';
  container.appendChild(spinner);
}

/**
 * Hide loading state
 */
function hideLoading(container) {
  if (!container) return;
  
  // Remove any loading spinners
  const spinner = container.querySelector('.loading-spinner');
  if (spinner) {
    spinner.remove();
  }
}

/**
 * Get an icon for a purchase item based on its name
 */
function getItemIcon(itemName) {
  if (!itemName) return '';
  
  const lowerName = itemName.toLowerCase();
  
  // Detect food items
  if (lowerName.includes('chip') || lowerName.includes('crisp') || lowerName.includes('snack')) {
    return '🍟';
  }
  if (lowerName.includes('sweet') || lowerName.includes('chocolate') || lowerName.includes('candy')) {
    return '🍬';
  }
  if (lowerName.includes('ice cream') || lowerName.includes('frozen')) {
    return '🍦';
  }
  if (lowerName.includes('coffee') || lowerName.includes('tea')) {
    return '☕';
  }
  
  // Detect alcoholic drinks
  if (isAlcoholicDrink(itemName)) {
    return '🍸';
  }
  
  // Detect other drinks
  if (lowerName.includes('drink') || lowerName.includes('soda') || lowerName.includes('pop')) {
    return '🥤';
  }
  
  // Default icon
  return '📦';
}
