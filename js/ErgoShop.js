// Update data file reference to ErgoShop.json
const optionsFile = "../data/ErgoShop.json";

async function loadOptions(containerId) {
  const response = await fetch(optionsFile);
  const optionsData = await response.json();
  return optionsData[containerId];
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
    // Also add a new quantity input
    const newQuantityInput = document.createElement('input');
    newQuantityInput.type = 'number';
    newQuantityInput.classList.add('quantity-input');
    newQuantityInput.value = 1;
    newQuantityInput.min = 0;
    selectContainer.insertBefore(newQuantityInput, addButton);
  }
}

function submitSelection() {
  let selectedItems = [];
  let totalValue = 0;
  // Updated container list to include new categories
  const selectContainers = [
    "saltySnackContainer", "sweetSnackContainer", "frozenSnackContainer", "concoctionsContainer",
    "mealModsContainer", "prizesContainer", "replacementsContainer",
    "entertainmentContainer", "schedulemodsContainer", "wantsvsneedsContainer"
  ];
  selectContainers.forEach(selectContainerId => {
    const container = document.getElementById(selectContainerId);
    if (container) {
      const selects = container.querySelectorAll('select.custom-select');
      const quantities = container.querySelectorAll('input.quantity-input');
      selects.forEach((select, index) => {
        const selectedOption = select.options[select.selectedIndex];
        const quantity = parseInt(quantities[index].value);
        if (selectedOption && selectedOption.value !== "0" && quantity > 0) {
          const itemName = selectedOption.text.split(' - ')[0];
          const itemValue = parseInt(selectedOption.value);
          const itemDescription = selectedOption.dataset.description; // Get description
          const totalItemValue = itemValue * quantity;
          let itemText = `${itemName} (x${quantity}) - ${totalItemValue}💷`;
          if (itemDescription) {
            itemText += `<br><small><em>${itemDescription}</em></small>`; // Add description
          }
          selectedItems.push(itemText);
          totalValue += totalItemValue;
        }
      });
    }
  });
  const summary = document.getElementById('summary');
  summary.innerHTML = `
      <hr>
      <h2>ErgoShop Receipt:</h2>
      <hr>
      <ul>${selectedItems.map(item => `<li>${item}</li>`).join('')}</ul>
      <hr>
      <p class="wager-total">TOTAL: ${totalValue} 💷</p>
  `;
  summary.style.display = 'block';
  if (window.innerWidth < 768) {
    summary.style.width = '90%';
  } else {
    summary.style.width = '50%'; // changed from '25%' to '50%'
  }
  document.querySelectorAll('.action-button.copy-clear').forEach(button => {
    button.style.display = 'inline-block';
  });
}

function clearSelection() {
  const summary = document.getElementById('summary');
  if (summary) summary.innerHTML = '';
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
  console.log('Showing description:', text); // Debug log
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
