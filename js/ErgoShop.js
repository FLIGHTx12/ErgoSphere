const optionsFile = "../data/options.json";

async function loadOptions(containerId) {
  const response = await fetch(optionsFile);
  const optionsData = await response.json();
  return optionsData[containerId];
}

function populateSelectOptions() {
  const selectContainers = [
    "saltySnackContainer", "sweetSnackContainer", "frozenSnackContainer", "concoctionsContainer",
    "mealModsContainer", "entertainmentContainer"  // added new container
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
  // Add "+" button event listeners for additional selections
  const selectContainers = [
    "saltySnackContainer", "sweetSnackContainer", "frozenSnackContainer", "concoctionsContainer",
    "mealModsContainer", "entertainmentContainer"  // added new container
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
});

/* ...existing functions: populateSelect, addNewSelection, submitSelection, clearSelection, copySummary, screenshotDiv... */

function populateSelect(selectElement, optionsArray) {
  // Ensure the default option is added first and hidden.
  const defaultOption = document.createElement("option");
  defaultOption.value = 0;
  defaultOption.text = "Select";
  defaultOption.hidden = true; // hide the default option
  selectElement.appendChild(defaultOption);
  
  optionsArray.forEach(option => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.text = option.text;
    if (option.description) {
      optionElement.dataset.description = option.description; // store description
    }
    selectElement.appendChild(optionElement);
  });
}

function addNewSelection(selectContainerId) {
  const selectContainer = document.getElementById(selectContainerId);
  if (selectContainer) {
    const addButton = selectContainer.querySelector('.add-button');
    if (addButton) {
      // Remove duplicate <select>; only add new quantity input.
      const newQuantityInput = document.createElement('input');
      newQuantityInput.type = 'number';
      newQuantityInput.classList.add('quantity-input');
      newQuantityInput.value = 1;
      newQuantityInput.min = 0;
      selectContainer.insertBefore(newQuantityInput, addButton);
    }
  }
}

function submitSelection() {
  let selectedItems = [];
  let totalValue = 0;
  const selectContainers = [
    "saltySnackContainer", "sweetSnackContainer", "frozenSnackContainer", "concoctionsContainer",
    "mealModsContainer", "entertainmentContainer"  // added new container
  ];
  selectContainers.forEach(selectContainerId => {
    const container = document.getElementById(selectContainerId);
    if (container) {
      const selectElements = container.querySelectorAll('.custom-select');
      const quantityInputs = container.querySelectorAll('.quantity-input');
      selectElements.forEach((select, index) => {
        const quantity = parseInt(quantityInputs[index].value, 10);
        // Changed check: ignore the default option by checking the selectedIndex
        if (select.selectedIndex !== 0) {
          const itemName = select.options[select.selectedIndex].text;
          selectedItems.push(itemName + ' x ' + quantity);
          totalValue += parseInt(select.value, 10) * quantity;
        }
      });
    }
  });
  const summary = document.getElementById('summary');
  summary.innerHTML = `
      <hr>
      <h2>Receipt:</h2>
      <hr>
      <ul>${selectedItems.map(item => `<li>${item}</li>`).join('')}</ul>
      <hr>
      <p class="wager-total">TOTAL: ${totalValue} 💷</p>
  `;
  summary.style.display = 'block';
  // Set width based on screen size: wider on small screens
  if (window.innerWidth < 768) {
    summary.style.width = '90%';
  } else {
    summary.style.width = '25%';
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
    alert('Summary copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy:', err);
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
        alert('Summary screenshot copied to clipboard!');
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
  let descDiv = document.getElementById('description-popup');
  if (!descDiv) {
    descDiv = document.createElement('div');
    descDiv.id = 'description-popup';
    descDiv.style.position = 'absolute'; // Changed to absolute
    descDiv.style.background = 'rgba(0,0,0,0.8)';
    descDiv.style.color = 'white';
    descDiv.style.padding = '8px';
    descDiv.style.borderRadius = '4px';
    descDiv.style.zIndex = 10000;
    document.body.appendChild(descDiv);
  }
  descDiv.textContent = text;

  // Calculate position relative to the select element
  const rect = selectElement.getBoundingClientRect();
  descDiv.style.left = (rect.right + 10) + 'px'; // Position to the right of the select
  descDiv.style.top = rect.top + 'px'; // Align with the top of the select
  descDiv.style.display = 'block';
  descDiv.style.zIndex = '10001'; // Make sure it's above everything else
}

function hideDescription() {
  clearTimeout(holdTimer);
  const descDiv = document.getElementById('description-popup');
  if (descDiv) {
    descDiv.style.display = 'none';
  }
}
