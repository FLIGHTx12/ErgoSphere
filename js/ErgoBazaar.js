// Enhanced ErgoBazaar with Robust Data Loading
// Define the mapping of categories to their respective JSON file paths
const categoryFileMap = {
  "Single Player Games": "data/singleplayer.json",
  "Spin the wheel PVP Games": "data/pvp.json",
  "Spin the wheel Co-op Games": "data/coop.json",
  "Spin the wheel Loot Boxes": "data/loot.json",
  "Bingwa Movie Night": "data/movies.json",
  "YouTube Theater": "data/youtube.json",
  "Anime Shows": "data/anime.json",
  "Sunday Morning Shows": "data/sundaymorning.json",
  "Sunday Night Shows": "data/sundaynight.json"
};

// Robust data loading configuration for ErgoBazaar
const categoryApiMap = {
  "Single Player Games": "singleplayer",
  "Spin the wheel PVP Games": "pvp",
  "Spin the wheel Co-op Games": "coop",
  "Spin the wheel Loot Boxes": "loot",
  "Bingwa Movie Night": "movies",
  "YouTube Theater": "youtube",
  "Anime Shows": "anime",
  "Sunday Morning Shows": "sundaymorning",
  "Sunday Night Shows": "sundaynight"
};

// Set default user type
let userType = "KUSHINDWA";

// Initialize robust data loader for ErgoBazaar
let ergoBazaarDataLoader = null;
let ergoBazaarDataCache = new Map();

// Cache object to store last modified timestamps
const fileCache = {};

// Add a flag to track if any dropdown is currently in use
let isDropdownActive = false;

// Add a counter to track additional dropdowns per category
const categoryDropdownCounts = {};

// Initialize robust data loader
function initializeErgoBazaarLoader() {
  if (window.RobustDataLoader) {
    ergoBazaarDataLoader = new window.RobustDataLoader();
    console.log('✅ ErgoBazaar robust data loader initialized');
    
    // Add status indicator to the page
    addErgoBazaarStatusIndicator();
  } else {
    console.warn('⚠️ RobustDataLoader not available, falling back to basic loading');
  }
}

// Add data source status indicator for ErgoBazaar
function addErgoBazaarStatusIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'ergobazaar-status-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 15px;
    left: 15px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 10px;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0.8;
    transition: opacity 0.3s ease;
  `;
  
  indicator.innerHTML = `
    <div class="status-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #888;"></div>
    <span class="status-text">Ready</span>
  `;
  
  // Make it less intrusive
  indicator.addEventListener('mouseenter', () => {
    indicator.style.opacity = '1';
  });
  
  indicator.addEventListener('mouseleave', () => {
    indicator.style.opacity = '0.8';
  });
  
  document.body.appendChild(indicator);
}

// Update status indicator for ErgoBazaar
function updateErgoBazaarStatusIndicator(source, isHealthy = true) {
  const indicator = document.getElementById('ergobazaar-status-indicator');
  if (!indicator) return;
  
  const dot = indicator.querySelector('.status-dot');
  const text = indicator.querySelector('.status-text');
  
  const sourceNames = {
    'postgres': 'Database',
    'server-backup': 'Server Backup',
    'json-file': 'Local Files',
    'cache': 'Cached Data',
    'loading': 'Loading...'
  };
  
  const colors = {
    'postgres': '#4CAF50',
    'server-backup': '#FF9800',
    'json-file': '#2196F3',
    'cache': '#9C27B0',
    'loading': '#888'
  };
  
  dot.style.background = isHealthy ? colors[source] || '#888' : '#f44336';
  text.textContent = sourceNames[source] || source;
}

// Enhanced fetchOptions function with robust loading
const fetchOptions = async (filePath, categoryName = null) => {
  try {
    // Use robust loader if available and category is known
    if (ergoBazaarDataLoader && categoryName && categoryApiMap[categoryName]) {
      const apiCategory = categoryApiMap[categoryName];
      
      // Check if we already have cached data for this category
      if (ergoBazaarDataCache.has(apiCategory)) {
        console.log(`🔄 Using cached data for ${categoryName}`);
        return ergoBazaarDataCache.get(apiCategory);
      }
      
      console.log(`🔄 Loading ${categoryName} data with robust loader...`);
      updateErgoBazaarStatusIndicator('loading');
      
      const robustConfig = {
        sources: [
          {
            name: 'postgres',
            url: `/api/ergobazaar/${apiCategory}`,
            priority: 1
          },
          {
            name: 'server-backup',
            url: `/api/backup/${apiCategory}`,
            priority: 2
          },
          {
            name: 'json-file',
            url: `../${filePath}`,
            priority: 3
          }
        ],
        cacheKey: `ergobazaar-${apiCategory}`,
        retryConfig: {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 5000
        }
      };
      
      const data = await ergoBazaarDataLoader.loadData(apiCategory, robustConfig);
      
      // Cache the data
      ergoBazaarDataCache.set(apiCategory, data);
      
      // Update status based on source
      const metadata = ergoBazaarDataLoader.getLastLoadMetadata();
      updateErgoBazaarStatusIndicator(metadata.source, metadata.success);
      
      console.log(`✅ ${categoryName} data loaded from: ${metadata.source}`);
      return data;
    }
    
    // Fallback to original loading method
    console.log(`📁 Using fallback loading method for ${filePath}`);
    updateErgoBazaarStatusIndicator('json-file');
    
    // Add cache-busting query parameter
    const timestamp = Date.now();
    const response = await fetch(`../${filePath}?t=${timestamp}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Get last modified header
    const lastModified = response.headers.get('last-modified');
    
    // Check if file has been modified
    if (fileCache[filePath] && fileCache[filePath].lastModified === lastModified) {
      return fileCache[filePath].data;
    }

    const data = await response.json();
    
    // Update cache
    fileCache[filePath] = {
      lastModified,
      data
    };

    return data;
  } catch (error) {
    console.error(`❌ Error fetching data from ${filePath}:`, error);
    updateErgoBazaarStatusIndicator('error', false);
    
    // Try to use cached data as last resort
    if (categoryName && categoryApiMap[categoryName]) {
      const apiCategory = categoryApiMap[categoryName];
      const cachedData = localStorage.getItem(`ergobazaar-${apiCategory}`);
      if (cachedData) {
        console.log(`🔄 Using emergency cached data for ${categoryName}`);
        updateErgoBazaarStatusIndicator('cache');
        const parsedData = JSON.parse(cachedData);
        ergoBazaarDataCache.set(apiCategory, parsedData);
        return parsedData;
      }
    }
    
    // Fallback to file cache or empty array
    return fileCache[filePath]?.data || [];
  }
};

// Function to refresh options for a category with robust loading
const refreshCategoryOptions = async (category) => {
  const catName = category.getAttribute('data-category');
  const filePath = categoryFileMap[catName];

  if (filePath) {
    let optionsArray = await fetchOptions(filePath, catName); // Pass category name for robust loading// Sort options alphabetically specifically for Bingwa Movie Night
    if (catName === "Bingwa Movie Night") {
      optionsArray.sort((a, b) => {
        const titleA = (a.Title || a.TITLE || '').toLowerCase();
        const titleB = (b.Title || b.TITLE || '').toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

    category.querySelectorAll('.ent-select').forEach(select => {
      const currentValue = select.value;
      
      select.innerHTML = '<option value="0">Select</option>';
      optionsArray.forEach(item => {
        // Skip ERGOarena items and items with specific genres in Loot Boxes
        if (item.game === "ERGOarena") return;
        if (catName === "Spin the wheel Loot Boxes" && 
           (item.genre === "hazzard" || item.genre === "week modifiers" || item.genre === "helper")) return;
        
        let optionText = '';
        const title = item.Title || item.TITLE || item.text || 'No Title';
        let status = item.STATUS || '';
        
        // Format based on category type
        switch(catName) {
          case "Bingwa Movie Night":
            const movieWatched = item.WATCHED || '';
            const ownership = item.OwnerShip ? `[${item.OwnerShip}]` : '';
            // Add runtime to movie information
            const runtime = item.RUNTIME ? `${item.RUNTIME}` : '';
            optionText = `${title} ┃ ${runtime} ┃ ${status} ${movieWatched} ${ownership}`.trim();
            break;
            
          case "YouTube Theater":
            let watchCount = '';
            if (typeof item["TIMES SEEN"] === 'number') {
              watchCount = '👀'.repeat(item["TIMES SEEN"]);
            } else if (item["TIMES SEEN"]) {
              // If TIMES SEEN contains actual eye emojis, use their count
              const matches = (item["TIMES SEEN"].match(/👀/g) || []).length;
              watchCount = '👀'.repeat(matches);
            }
            const channel = item.CHANNEL ? `[${item.CHANNEL}]` : '';
            optionText = `${title} ┃ ${channel} ┃ ${status} ${watchCount}`.trim();
            break;
            
          case "Anime Shows":
          case "Sunday Morning Shows":
          case "Sunday Night Shows":
            let watchCountShows = '';
            if (item["TIMES SEEN"]) {
              watchCountShows = '👀'.repeat(item["TIMES SEEN"]);
            } else if (item.WATCHED) {
              watchCountShows = '👀'.repeat(item.WATCHED.length);
            } else if (item["LAST WATCHED"]) {
              const seasonMatch = item["LAST WATCHED"].match(/se(\d+)/i);
              if (seasonMatch) {
                watchCountShows = '👀'.repeat(parseInt(seasonMatch[1]));
              }
            }
            
            // Calculate seasons left
            let seasonsLeft = '';
            if (item["Series Length"] && item["LAST WATCHED"]) {
              // Extract total seasons from Series Length
              const seriesLengthMatch = item["Series Length"].match(/(\d+)\s*seasons?/i);
              // Extract current season from LAST WATCHED
              const lastWatchedMatch = item["LAST WATCHED"].match(/se(\d+)/i);
              
              if (seriesLengthMatch && lastWatchedMatch) {
                const totalSeasons = parseInt(seriesLengthMatch[1]);
                const currentSeason = parseInt(lastWatchedMatch[1]);
                const remaining = totalSeasons - currentSeason;
                if (remaining > 0) {
                  seasonsLeft = `${remaining} seasons left`;
                } else if (remaining === 0) {
                  seasonsLeft = 'Complete';
                }
              }
            } else if (item["Series Length"]) {
              // Just show the series length if LAST WATCHED isn't available
              seasonsLeft = item["Series Length"];
            }
            
            optionText = `${title} ┃ ${status} ${watchCountShows} ┃ ${seasonsLeft}`.trim();
            break;
            
          case "Single Player Games":
            const completed = item["COMPLETED?"] || '';
            const timeToBeat = item["TIME TO BEAT"] || '';
            const playability = item.Playability ? `[${item.Playability}]` : '';
            optionText = `${title} ┃ ${status} ${completed} ┃ ${timeToBeat} ${playability}`.trim();
            break;
            
          case "Spin the wheel PVP Games":
          case "Spin the wheel Co-op Games":
            let copies = '';
            if (item.copies > 0) {
              copies = '🟢'.repeat(item.copies);
            }
            // Remove details and mode information for PVP and Co-op games
            optionText = `${title} ┃ ${status} ${copies}`.trim();
            break;
            
          default: // Other categories
            let copiesDefault = '';
            if (item.copies > 0) {
              copiesDefault = '🟢'.repeat(item.copies);
            }
            const gameMode = item.mode || '';
            optionText = `${title} ┃ ${status} ${copiesDefault} ┃ ${gameMode}`.trim();
        }

        const opt = document.createElement('option');
        opt.value = title;
        opt.text = optionText;
        select.appendChild(opt);
      });

      // Restore previous selection
      if (currentValue !== "0") {
        const matchingOption = Array.from(select.options).find(opt => opt.value === currentValue);
        if (matchingOption) {
          select.value = currentValue;
        }
      }
    });
  }
};

// Function to refresh all categories
const refreshAllCategories = () => {
  // Skip refresh if a dropdown is currently active/open
  if (isDropdownActive) {
    console.log("Dropdown active, skipping refresh");
    return;
  }
  
  document.querySelectorAll('#entertainment .category').forEach(category => {
    refreshCategoryOptions(category);
  });
};

// Save ErgoBazaar state to localStorage
function saveErgoBazaarState() {
  const state = {};

  // Save dropdown selections and user type
  document.querySelectorAll('.ent-select').forEach(select => {
    state[select.id || select.name] = select.value;
  });
  state['userType'] = userType;

  localStorage.setItem('ergoBazaarState', JSON.stringify(state));
}

// Restore ErgoBazaar state from localStorage
function restoreErgoBazaarState() {
  const state = JSON.parse(localStorage.getItem('ergoBazaarState')) || {};

  Object.keys(state).forEach(key => {
    if (key === 'userType') {
      userType = state[key];
      document.getElementById('user-type').value = userType;
    } else {
      const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
      if (element) {
        element.value = state[key];
      }
    }
  });
}

// Function to create a new dropdown for a category
function addDropdownToCategory(categoryDiv) {
  const catName = categoryDiv.getAttribute('data-category');
  
  // Initialize counter if not exists
  if (!categoryDropdownCounts[catName]) {
    categoryDropdownCounts[catName] = 0;
  }
  
  categoryDropdownCounts[catName]++;
  
  // Create new select element
  const newSelect = document.createElement('select');
  newSelect.className = 'ent-select dynamic-dropdown';
  newSelect.id = `${catName.replace(/\s+/g, '-').toLowerCase()}-select-${categoryDropdownCounts[catName] + 2}`;
  
  // Add default option
  newSelect.innerHTML = '<option value="0">Select</option>';
  
  // Find the add button and move it after the new dropdown
  const addButton = categoryDiv.querySelector('.category-add-btn');
  const totalSpan = categoryDiv.querySelector('.category-total');
  
  // Insert new dropdown before the add button
  categoryDiv.insertBefore(newSelect, addButton);
  categoryDiv.insertBefore(document.createElement('br'), addButton);
  
  // Populate with options
  refreshCategoryOptions(categoryDiv);
  
  // Add event listeners
  newSelect.addEventListener('change', function() {
    saveErgoBazaarState();
    updateCategoryTotal(categoryDiv);
    updateAllCategoryTotalsAndOverall();
  });
  
  // Track dropdown activity
  newSelect.addEventListener('mousedown', function() {
    isDropdownActive = true;
  });
  
  newSelect.addEventListener('blur', function() {
    setTimeout(() => { isDropdownActive = false; }, 100);
  });
}

// Helper function to update a category's total cost.
function updateCategoryTotal(categoryDiv) {
  // Get category name to check if it's YouTube Theater
  const catName = categoryDiv.getAttribute('data-category');
  
  // Determine cost multiplier based on user type and category
  let baseCost = (userType === "KUSHINDWA") ? 30 : 20;
  
  // Special pricing for YouTube Theater
  if (catName === "YouTube Theater") {
    baseCost = (userType === "KUSHINDWA") ? 20 : 10;
  }
  
  let count = 0;
  let discountEyeCount = 0;
  let greenDotCost = 0;
  let totalCost = 0;

  categoryDiv.querySelectorAll('.ent-select').forEach((select, index) => {
    if (select.selectedIndex > 0) {
      count++;
      const selectedText = select.options[select.selectedIndex].text;
      
      // Calculate cost with scaling for additional dropdowns
      let itemCost = baseCost;
      if (index >= 2) { // Third dropdown and beyond
        const scalingFactor = 1 + (0.3 * (index - 1)); // 30% increase per additional dropdown
        itemCost = Math.round(baseCost * scalingFactor);
      }
      
      totalCost += itemCost;
      
      // Count eye emojis in the selected option for discount calculation
      const eyeCount = (selectedText.match(/👀/g) || []).length;
      discountEyeCount += eyeCount;
      
      // Count 🟢 and add 2 per each
      const greenCount = (selectedText.match(/🟢/g) || []).length;
      greenDotCost += greenCount * 2;
    }
  });

  // Calculate discount (applies to total base cost, not green dots)
  const discountPercentage = discountEyeCount * 0.2; // 20% per eye emoji
  const discountAmount = Math.round(totalCost * discountPercentage);
  const finalCost = totalCost + greenDotCost - discountAmount;

  // Update the visible total inside the category div.
  const totalElem = categoryDiv.querySelector('.category-total');
  if (totalElem) {
    let display = `${finalCost} 💷`;
    if (greenDotCost > 0) display += ` (+${greenDotCost}🟢)`;
    if (discountAmount > 0) display += ` (${discountAmount} off)`;
    totalElem.textContent = display;
  }
  
  // Return the final cost for use in overall total
  return finalCost;
}

// New: Update all category totals and the overall preview total
function updateAllCategoryTotalsAndOverall() {
  let overallTotal = 0;
  document.querySelectorAll('#entertainment .category').forEach(cat => {
    overallTotal += updateCategoryTotal(cat);
  });
  // Update the overall total preview (now inside #cashout)
  const overallTotalElem = document.getElementById('overall-total-preview');
  if (overallTotalElem) {
    overallTotalElem.textContent = `Total Preview: ${overallTotal} 💷`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize robust data loader with a small delay to ensure it's loaded
  setTimeout(() => {
    initializeErgoBazaarLoader();
  }, 100);
  
  restoreErgoBazaarState();

  // Initial population of dropdowns
  refreshAllCategories();

  // Set up periodic refresh (every 30 seconds)
  setInterval(refreshAllCategories, 30000);
  
  // Track when dropdowns are being actively used
  document.querySelectorAll('.ent-select').forEach(select => {
    // When user clicks on a dropdown
    select.addEventListener('mousedown', function() {
      isDropdownActive = true;
    });
    
    // When dropdown loses focus or a selection is made
    select.addEventListener('change', function() {
      setTimeout(() => { isDropdownActive = false; }, 100);
      saveErgoBazaarState();
      // Find the parent category div and update its total
      const categoryDiv = select.closest('.category');
      if (categoryDiv) {
        updateCategoryTotal(categoryDiv);
      }
      updateAllCategoryTotalsAndOverall();
    });
    
    // When dropdown loses focus without selection
    select.addEventListener('blur', function() {
      setTimeout(() => { isDropdownActive = false; }, 100);
    });
  });

  // Add global click handler to detect clicks outside of dropdowns
  document.addEventListener('click', function(event) {
    if (!event.target.matches('.ent-select')) {
      setTimeout(() => { isDropdownActive = false; }, 100);
    }
  });
  
  // Add dropdown-based user type listener.
  const userTypeDropdown = document.getElementById('user-type');
  if (userTypeDropdown) {
    userTypeDropdown.addEventListener('change', (e) => {
      userType = e.target.value;
      if (userType === "BINGWA") {
        document.body.classList.add('bingwa-theme');
      } else {
        document.body.classList.remove('bingwa-theme');
      }
      // Update all category totals after multiplier change.
      updateAllCategoryTotalsAndOverall();
    });
  }
  
  // Update category total and overall total live as user changes dropdowns
  document.querySelectorAll('.ent-select').forEach(select => {
    select.addEventListener('change', function() {
      saveErgoBazaarState();
      // Find the parent category div and update its total
      const categoryDiv = select.closest('.category');
      if (categoryDiv) {
        updateCategoryTotal(categoryDiv);
      }
      updateAllCategoryTotalsAndOverall();
    });
  });

  document.getElementById('user-type').addEventListener('change', saveErgoBazaarState);

  // Initial update of all totals
  updateAllCategoryTotalsAndOverall();

  const submitBtn = document.getElementById('ent-submit');
  const summaryDiv = document.getElementById('ent-summary');
  
  submitBtn.addEventListener('click', () => {
    console.log('Submit button clicked');
    try {
      let summaryHTML = '<hr><h2>ErgoBazaar Summary:</h2><ul>';
      let overallTotal = 0;
      let overallDiscount = 0;
      
      // Process each category and accumulate totals.
      document.querySelectorAll('.category').forEach(cat => {
        const catName = cat.getAttribute('data-category');
        const selects = cat.querySelectorAll('.ent-select');
        let selections = [];
        let catCount = 0;
        let categoryEyeCount = 0;
        let categoryGreenDotCost = 0;
        let categoryTotalCost = 0;
        
        // Determine base cost multiplier
        let baseCost = (userType === "KUSHINDWA") ? 30 : 20;
        if (catName === "YouTube Theater") {
          baseCost = (userType === "KUSHINDWA") ? 20 : 10;
        }
        
        selects.forEach((select, index) => {
          if (select.selectedIndex > 0) {
            const selectedText = select.options[select.selectedIndex].text;
            
            // Calculate cost with scaling for additional dropdowns
            let itemCost = baseCost;
            if (index >= 2) {
              const scalingFactor = 1 + (0.3 * (index - 1));
              itemCost = Math.round(baseCost * scalingFactor);
            }
            
            categoryTotalCost += itemCost;
            
            // Add scaling indicator to selection text if applicable
            let displayText = selectedText;
            if (index >= 2) {
              const scalingPercentage = (index - 1) * 30;
              displayText += ` <span style="color:orange">[+${scalingPercentage}% cost]</span>`;
            }
            
            selections.push(displayText);
            catCount++;
            
            // Count eye emojis for discount
            const eyeCount = (selectedText.match(/👀/g) || []).length;
            categoryEyeCount += eyeCount;
            
            // Count 🟢 for extra cost
            const greenCount = (selectedText.match(/🟢/g) || []).length;
            categoryGreenDotCost += greenCount * 2;
          }
        });
        
        const discountPercentage = categoryEyeCount * 0.2;
        const discountAmount = Math.round(categoryTotalCost * discountPercentage);
        const finalCatTotal = categoryTotalCost + categoryGreenDotCost - discountAmount;
        
        overallTotal += finalCatTotal;
        overallDiscount += discountAmount;
        
        if (selections.length > 0) {
          let catSummary = `<li><strong><u>${catName}:</u></strong><br>${selections.join('<br>')}`;
          catSummary += ` - <em>${categoryTotalCost} 💷`;
          if (categoryGreenDotCost > 0) catSummary += ` +${categoryGreenDotCost}🟢`;
          catSummary += `</em>`;
          if (discountAmount > 0) {
            catSummary += ` <span style="color:lightgreen">(-${discountAmount} 💷 discount)</span>`;
            catSummary += ` = <em>${finalCatTotal} 💷</em>`;
          } else if (categoryGreenDotCost > 0) {
            catSummary += ` = <em>${finalCatTotal} 💷</em>`;
          } else {
            catSummary += ` = <em>${finalCatTotal} 💷</em>`;
          }
          catSummary += '</li><br>';
          summaryHTML += catSummary;
        }
      });
      
      const cashout = document.getElementById('cashout-input').value;
      summaryHTML += '</ul>';
      
      // Simplified total summary without showing discount breakdown
      let totalSummary = `<p><hr><strong> TOTAL:</strong>`;
      totalSummary += `<span style="color: gold; font-weight: bold;"> ${overallTotal}💷</span>`;
      totalSummary += ` </p>`;
      
      summaryHTML += totalSummary;
      summaryHTML += `<p><strong>Cashout Request:</strong> <span style="color: gold; font-weight: bold;">${cashout} 💷</span></p>`;
      summaryHTML += '<hr>';
      
      summaryDiv.innerHTML = summaryHTML;
      
      // Ensure background image is explicitly set and visible
      const computedStyle = getComputedStyle(summaryDiv);
      if (computedStyle.backgroundImage === 'none' || !computedStyle.backgroundImage) {
        // Use the background image from CSS if not already applied
        summaryDiv.style.backgroundImage = "url('https://i.ibb.co/CtB1Dvz/black-glass.jpg')";
        summaryDiv.style.backgroundSize = 'cover';
        summaryDiv.style.backgroundPosition = 'center';
      }
      
      summaryDiv.style.display = 'block';
      console.log('Submit processing complete');
    } catch(err) {
      console.error('Error during submit processing:', err);
    }
  });
  
  // New: When summary is clicked, capture its screenshot.
  summaryDiv.addEventListener('click', () => {
    captureScreenshot(summaryDiv);
  });

  // Add click handlers for category add buttons
  document.querySelectorAll('.category-add-btn').forEach(button => {
    button.addEventListener('click', function() {
      const categoryDiv = this.closest('.category');
      addDropdownToCategory(categoryDiv);
    });
  });
});