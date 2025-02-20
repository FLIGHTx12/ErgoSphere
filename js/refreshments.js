// Remove static arrays and static optionsMap declarations

// Mapping between container element IDs and keys from refreshment.json
const containerMapping = {
  saltySnackContainer: 'saltySnacks',
  sweetSnackContainer: 'sweetSnacks',
  frozenSnackContainer: 'frozenSnacks',
  concoctionsContainer: 'concoctions',
  mealModsContainer: 'mealMods'
};

let optionsMap = {};

// Fetch options from the server and map them for each container
function loadOptionsMap() {
  return fetch('/api/refreshments')
    .then(res => res.json())
    .then(data => {
      console.log('Fetched refreshment options:', data); // Debug log added
      optionsMap = {};
      Object.entries(containerMapping).forEach(([containerId, dataKey]) => {
        optionsMap[containerId] = data[dataKey] || [];
      });
    })
    .catch(err => console.error('Error loading refreshment options:', err));
}

document.addEventListener('DOMContentLoaded', () => {
  loadOptionsMap().then(() => {
    // Refreshment containers and data arrays
    const selectContainers = Object.keys(optionsMap);
    // Populate selects and add "+" button listeners
    populateSelectOptions();
    selectContainers.forEach(selectContainerId => {
      const selectContainer = document.getElementById(selectContainerId);
      if (selectContainer) {
        const addButton = selectContainer.querySelector('.add-button');
        if (addButton) {
          addButton.addEventListener('click', () => {
            addNewSelection(selectContainerId);
          });
        }
      }
    });
  });
});

// Refreshment functions
function populateSelectOptions() {
  const selectContainers = Object.keys(optionsMap);
  selectContainers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      const selectElement = container.querySelector('.custom-select');
      if (selectElement) {
        optionsMap[id].forEach(optionText => {
          const option = document.createElement("option");
          const match = optionText.match(/(\d+)💷/);
          option.value = match ? match[1] : 0;
          option.text = optionText;
          selectElement.appendChild(option);
        });
      }
    }
  });
}

function addNewSelection(selectContainerId) {
  const selectContainer = document.getElementById(selectContainerId);
  if (selectContainer) {
    const addButton = selectContainer.querySelector('.add-button');
    if (addButton) {
      const newSelect = document.createElement('select');
      newSelect.classList.add('custom-select');
      const newQuantityInput = document.createElement('input');
      newQuantityInput.type = 'number';
      newQuantityInput.classList.add('quantity-input');
      newQuantityInput.value = 1;
      newQuantityInput.min = 0;
      selectContainer.insertBefore(newSelect, addButton);
      selectContainer.insertBefore(newQuantityInput, addButton);
      populateSelect(newSelect, optionsMap[selectContainerId]);
    }
  }
}

function populateSelect(selectElement, optionsArray) {
  // Ensure the default option is added first.
  const defaultOption = document.createElement("option");
  defaultOption.value = 0;
  defaultOption.text = "Select";
  selectElement.appendChild(defaultOption);
  
  optionsArray.forEach(optionText => {
    const option = document.createElement("option");
    const match = optionText.match(/(\d+)💷/);
    option.value = match ? match[1] : 0;
    option.text = optionText;
    selectElement.appendChild(option);
  });
}

function submitSelection() {
  let selectedItems = [];
  let totalValue = 0;
  Object.keys(optionsMap).forEach(selectContainerId => {
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
