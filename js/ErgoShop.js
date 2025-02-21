const optionsFile = "../data/options.json";

async function loadOptions(containerId) {
  const response = await fetch(optionsFile);
  const optionsData = await response.json();
  return optionsData[containerId];
}

function populateSelectOptions() {
  const selectContainers = [
    "saltySnackContainer", "sweetSnackContainer", "frozenSnackContainer", "concoctionsContainer",
    "mealModsContainer"
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
    "mealModsContainer"
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
});

/* ...existing functions: populateSelect, addNewSelection, submitSelection, clearSelection, copySummary, screenshotDiv... */

function populateSelect(selectElement, optionsArray) {
  // Ensure the default option is added first.
  const defaultOption = document.createElement("option");
  defaultOption.value = 0;
  defaultOption.text = "Select";
  selectElement.appendChild(defaultOption);
  
  optionsArray.forEach(option => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.text = option.text;
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
    "mealModsContainer"
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
