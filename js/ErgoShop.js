// Enhanced ErgoShop with Robust Data Loading
// Update data file reference to ErgoShop.json
const optionsFile = "../data/ErgoShop.json";

// Initialize robust data loader for ErgoShop
let ergoShopDataLoader = null;
let ergoShopData = null;

// Robust data loading configuration for ErgoShop
const ergoShopRobustConfig = {
  sources: [
    {
      name: 'postgres',
      url: '/api/ergoshop',
      priority: 1
    },
    {
      name: 'server-backup',
      url: '/api/backup/ErgoShop',
      priority: 2
    },
    {
      name: 'json-file',
      url: optionsFile,
      priority: 3
    }
  ],
  cacheKey: 'ergoShop-data',
  retryConfig: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000
  }
};

// Initialize robust data loader
function initializeErgoShopLoader() {
  if (window.RobustDataLoader) {
    ergoShopDataLoader = new window.RobustDataLoader();
    console.log('✅ ErgoShop robust data loader initialized');
  } else {
    console.warn('⚠️ RobustDataLoader not available, falling back to basic loading');
  }
}

// Enhanced loadOptions function with robust loading
async function loadOptions(containerId) {
  try {
    // Use robust loader if available
    if (ergoShopDataLoader) {    if (!ergoShopData) {
        console.log('🔄 Loading ErgoShop data with robust loader...');
        
        ergoShopData = await ergoShopDataLoader.loadData('ErgoShop', ergoShopRobustConfig);
        
        // Update status based on source
        const metadata = ergoShopDataLoader.getLastLoadMetadata();
        
        console.log(`✅ ErgoShop data loaded from: ${metadata.source}`);
      }
      
      return ergoShopData[containerId];    } else {
      // Fallback to original loading method
      console.log('📁 Using fallback loading method');
      
      const response = await fetch(optionsFile);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const optionsData = await response.json();
      ergoShopData = optionsData;
      return optionsData[containerId];
    }  } catch (error) {
    console.error('❌ Error loading ErgoShop options:', error);
    
    // Try to use cached data as last resort
    const cachedData = localStorage.getItem('ergoShop-data');
    if (cachedData) {
      console.log('🔄 Using emergency cached data');
      const parsedData = JSON.parse(cachedData);
      return parsedData[containerId] || [];
    }
    
    return [];
  }
}

// Revert container list in populateSelectOptions and DOMContentLoaded event
function populateSelectOptions() {
  const selectContainers = [
    "saltySnackContainer", "sweetSnackContainer", "frozenSnackContainer", "concoctionsContainer",
    "mealModsContainer", "prizesContainer", "replacementsContainer",
    "entertainmentContainer", "schedulemodsContainer", "wantsvsneedsContainer"
  ];
  
  selectContainers.forEach(selectContainerId => {
    loadOptions(selectContainerId).then(optionsArray => {
      const container = document.getElementById(selectContainerId);
      if (container) {
        const selectElement = container.querySelector('.custom-select');
        if (selectElement) {
          populateSelect(selectElement, optionsArray);
        }
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize robust data loader with a small delay to ensure it's loaded
  setTimeout(() => {
    initializeErgoShopLoader();
  }, 100);
  
  // Convert any remaining input type=number to select dropdowns
  document.querySelectorAll('input.quantity-input[type="number"]').forEach(input => {
    const value = input.value || 1;
    const parent = input.parentNode;
    
    // Create replacement dropdown
    const select = document.createElement('select');
    select.className = 'quantity-input';
    
    // Add options 1-10
    for (let i = 1; i <= 10; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      if (i === parseInt(value)) {
        option.selected = true;
      }
      select.appendChild(option);
    }
    
    // Replace the input with the select
    parent.replaceChild(select, input);
  });

  populateSelectOptions();
  restoreErgoShopState();

  const selectContainers = [
    "saltySnackContainer", "sweetSnackContainer", "frozenSnackContainer", "concoctionsContainer",
    "mealModsContainer", "prizesContainer", "replacementsContainer",
    "entertainmentContainer", "schedulemodsContainer", "wantsvsneedsContainer"
  ];
  selectContainers.forEach(selectContainerId => {
    const container = document.getElementById(selectContainerId);
    if (container) {
      const addButton = container.querySelector('.add-button');
      if (addButton) {
        addButton.addEventListener('click', () => {
          addNewSelection(selectContainerId);
        });
      }
    }
  });

  // Add long-press event to display descriptions on options.
  document.querySelectorAll('select.custom-select').forEach(select => {
    select.addEventListener('mouseover', function(e) { // Mouse hover
      if (e.target && e.target.tagName === 'OPTION' && e.target.dataset.description) {
        showDescription(e.target.dataset.description, select); // Pass select element
      }
    });
    select.addEventListener('mouseout', hideDescription); // Mouse leave

    select.addEventListener('touchstart', function(e) { // Touch start
      if (e.target && e.target.tagName === 'OPTION' && e.target.dataset.description) {
        showDescription(e.target.dataset.description, select); // Pass select element
      }
    });
    select.addEventListener('touchend', hideDescription); // Touch end
  });

  document.querySelectorAll('.custom-select, .quantity-input').forEach(element => {
    element.addEventListener('input', saveErgoShopState);
  });
});

/* ...existing functions: populateSelect, addNewSelection, submitSelection, clearSelection, copySummary, screenshotDiv... */

function populateSelect(selectElement, optionsArray) {
  // Ensure the default option is added first and hidden.
  const defaultOption = document.createElement("option");
  defaultOption.value = 0;
  defaultOption.text = "Select";
  defaultOption.hidden = true; // hide the default option
  selectElement.appendChild(defaultOption);

  optionsArray.forEach(optionData => {
    const option = document.createElement("option");
    option.value = optionData.value;
    option.text = optionData.text;
    if (optionData.description) {
      option.dataset.description = optionData.description; // Store description in dataset
    }
    selectElement.appendChild(option);
  });
}

function addNewSelection(selectContainerId) {
  const selectContainer = document.getElementById(selectContainerId);
  if (selectContainer) {
    const addButton = selectContainer.querySelector('.add-button');
    // Clone the custom-select and reset its selection
    const originalSelect = selectContainer.querySelector('.custom-select');
    if (originalSelect) {
      const clonedSelect = originalSelect.cloneNode(true);
      clonedSelect.selectedIndex = 0; // reset selection
      selectContainer.insertBefore(clonedSelect, addButton);
    }
    // Create a new quantity dropdown
    const newQuantitySelect = document.createElement('select');
    newQuantitySelect.classList.add('quantity-input');
    
    // Add options 1-10
    for (let i = 1; i <= 10; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      newQuantitySelect.appendChild(option);
    }
    
    selectContainer.insertBefore(newQuantitySelect, addButton);
  }
}

function submitSelection() {
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
      
      // Select both input and select quantity elements to handle all cases
      const quantities = container.querySelectorAll('.quantity-input');
      
      selects.forEach((select, index) => {
        // Check if we have a matching quantity element
        if (index < quantities.length) {
          const quantityElement = quantities[index];
          // Get value whether it's an input or select element
          const quantity = parseInt(quantityElement.value);
          
          // Continue with original logic
          const selectedOption = select.options[select.selectedIndex];
          if (selectedOption && select.selectedIndex !== 0 && quantity > 0) {
            const itemName = selectedOption.text.split(' - ')[0];
            const itemValue = parseInt(selectedOption.value);
            const itemDescription = selectedOption.dataset.description;
            const totalItemValue = itemValue * quantity;
            let itemText = `${itemName} (x${quantity}) - ${totalItemValue}💷`;
            if (itemDescription) {
              itemText += `<br><small><em>${itemDescription}</em></small>`;
            }
            selectedItems.push(itemText);
            totalValue += totalItemValue;
          }
        }
      });
    }
  });    // Create the receipt
  const summary = document.getElementById('summary');
  summary.innerHTML = `
      <hr>
      <h2>ErgoShop Receipt:</h2>
      <hr>
      <ul>${selectedItems.map(item => `<li>${item}</li>`).join('')}</ul>
      <hr>
      <p class="wager-total">TOTAL: ${totalValue} 💷</p>
  `;
    // Make the receipt visible with appropriate width
  summary.style.display = 'block';
  if (window.innerWidth < 768) {
    summary.style.width = '99%'; // Wider for mobile screens
  } else {
    summary.style.width = '50%'; // Wider for desktop screens
  }
}

function clearSelection() {
  const summary = document.getElementById('summary');
  if (summary) {
    summary.innerHTML = '';
    summary.style.display = 'none';
  }
}

function copySummary() {
  const summary = document.getElementById('summary');
  const range = document.createRange();
  range.selectNode(summary);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  try {
    document.execCommand('copy');
    alert('Here is your receipt 🐨  Thanks for shopping at ErgoShop!');
  } catch (err) {
    console.error('Lil problem here..:', err);
  }
  window.getSelection().removeAllRanges();
}

function screenshotDiv() {
  const summary = document.getElementById('summary');
  html2canvas(summary, { useCORS: true, allowTaint: true }).then(canvas => {
    canvas.toBlob(blob => {
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]).then(() => {
        alert('Here is your receipt 🐨  Thanks for shopping at ErgoShop!');
      }).catch(err => {
        console.error('Failed to copy screenshot:', err);
      });
    });
  }).catch(err => {
    console.error('Failed to capture screenshot:', err);
  });
}

// Functions to show/hide the option description on long press.
let holdTimer;

function showDescription(text, selectElement) {
  // Remove any existing popup
  const existingPopup = document.getElementById('description-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create new popup
  const descDiv = document.createElement('div');
  descDiv.id = 'description-popup';
  descDiv.textContent = text;
  document.body.appendChild(descDiv);

  // Position the popup
  const rect = selectElement.getBoundingClientRect();
  const popupRect = descDiv.getBoundingClientRect();
  
  // Check if popup would go off-screen to the right
  if (rect.right + popupRect.width + 10 > window.innerWidth) {
    // Position to the left of the select if it would go off-screen
    descDiv.style.left = (rect.left - popupRect.width - 10) + 'px';
  } else {
    // Position to the right of the select
    descDiv.style.left = (rect.right + 10) + 'px';
  }
  
  descDiv.style.top = rect.top + 'px';
    // Ensure visibility
  descDiv.style.display = 'block';
}

function hideDescription() {
  clearTimeout(holdTimer);
  const descDiv = document.getElementById('description-popup');
  if (descDiv) {
    descDiv.style.display = 'none';
  }
}

// Save ErgoShop state to localStorage
function saveErgoShopState() {
  const state = {};

  // Save select and input values
  document.querySelectorAll('.custom-select, .quantity-input').forEach(element => {
    state[element.id || element.name] = element.value;
  });

  localStorage.setItem('ergoShopState', JSON.stringify(state));
}

// Restore ErgoShop state from localStorage
function restoreErgoShopState() {
  const state = JSON.parse(localStorage.getItem('ergoShopState')) || {};

  Object.keys(state).forEach(key => {
    const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
    if (element) {
      element.value = state[key];
    }
  });
}
