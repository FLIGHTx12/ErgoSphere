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

// Set default user type
let userType = "KUSHINDWA";

// Cache object to store last modified timestamps
const fileCache = {};

// Function to fetch options from JSON file with cache validation
const fetchOptions = async (filePath) => {
  try {
    // Add cache-busting query parameter
    const timestamp = Date.now();
    const response = await fetch(`../${filePath}?t=${timestamp}`);
    
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
    console.error(`Error fetching data from ${filePath}:`, error);
    return fileCache[filePath]?.data || [];
  }
};

// Function to refresh options for a category
const refreshCategoryOptions = async (category) => {
  const catName = category.getAttribute('data-category');
  const filePath = categoryFileMap[catName];

  if (filePath) {
    const optionsArray = await fetchOptions(filePath);
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
            optionText = `${title} ┃ ${status} ${movieWatched} ${ownership}`.trim();
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
            const seriesLength = item["Series Length"] || '';
            optionText = `${title} ┃ ${status} ${watchCountShows} ┃ ${seriesLength}`.trim();
            break;
            
          case "Single Player Games":
            const completed = item["COMPLETED?"] || '';
            const timeToBeat = item["TIME TO BEAT"] || '';
            const playability = item.Playability ? `[${item.Playability}]` : '';
            optionText = `${title} ┃ ${status} ${completed} ┃ ${timeToBeat} ${playability}`.trim();
            break;
            
          default: // PVP and Co-op Games
            let copies = '';
            if (item.copies > 0) {
              copies = '🟢'.repeat(item.copies);
            }
            const gameMode = item.mode || '';
            optionText = `${title} ┃ ${status} ${copies} ┃ ${gameMode}`.trim();
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

document.addEventListener('DOMContentLoaded', () => {
  restoreErgoBazaarState();

  // Initial population of dropdowns
  refreshAllCategories();

  // Set up periodic refresh (every 30 seconds)
  setInterval(refreshAllCategories, 30000);
  
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
      document.querySelectorAll('#entertainment .category').forEach(cat => {
        updateCategoryTotal(cat);
      });
    });
  }
  
  document.querySelectorAll('.ent-select').forEach(select => {
    select.addEventListener('change', saveErgoBazaarState);
  });

  document.getElementById('user-type').addEventListener('change', saveErgoBazaarState);

  // Helper function to update a category's total cost.
  function updateCategoryTotal(categoryDiv) {
    // Determine cost multiplier based on user type.
    const multiplier = (userType === "KUSHINDWA") ? 30 : 20;
    let count = 0;
    let discountEyeCount = 0;
    
    categoryDiv.querySelectorAll('.ent-select').forEach(select => {
      if (select.selectedIndex > 0) {
        count++;
        // Count eye emojis in the selected option for discount calculation
        const selectedText = select.options[select.selectedIndex].text;
        const eyeCount = (selectedText.match(/👀/g) || []).length;
        discountEyeCount += eyeCount;
      }
    });
    
    // Calculate base cost and discount
    const baseCost = count * multiplier;
    const discountPercentage = discountEyeCount * 0.2; // 20% per eye emoji
    const discountAmount = Math.round(baseCost * discountPercentage);
    const finalCost = baseCost - discountAmount;
    
    // Update the visible total inside the category div.
    const totalElem = categoryDiv.querySelector('.category-total');
    if (totalElem) {
      if (discountAmount > 0) {
        totalElem.textContent = `${finalCost} 💷 (${discountAmount} off)`;
      } else {
        totalElem.textContent = `${baseCost} 💷`;
      }
    }
  }
  
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
        
        selects.forEach(select => {
          if (select.selectedIndex > 0) {
            const selectedText = select.options[select.selectedIndex].text;
            selections.push(selectedText);
            catCount++;
            
            // Count eye emojis for discount
            const eyeCount = (selectedText.match(/👀/g) || []).length;
            categoryEyeCount += eyeCount;
          }
        });
        
        // Determine cost multiplier based on user type.
        const multiplier = (userType === "KUSHINDWA") ? 30 : 20;
        const baseCatTotal = catCount * multiplier;
        const discountPercentage = categoryEyeCount * 0.2; // 20% per eye emoji
        const discountAmount = Math.round(baseCatTotal * discountPercentage);
        const finalCatTotal = baseCatTotal - discountAmount;
        
        overallTotal += finalCatTotal;
        overallDiscount += discountAmount;
        
        if (selections.length > 0) {
          let catSummary = `<li><strong><u>${catName}:</u></strong><br>${selections.join('<br>')}`;
          
          if (discountAmount > 0) {
            catSummary += ` - <em>${baseCatTotal} 💷</em>`;
            catSummary += ` <span style="color:lightgreen">(-${discountAmount} 💷 discount)</span>`;
            catSummary += ` = <em>${finalCatTotal} 💷</em>`;
          } else {
            catSummary += ` - <em>${finalCatTotal} 💷</em>`;
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

});