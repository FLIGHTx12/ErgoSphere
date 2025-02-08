// Moved to global scope:
const excellentSnacks = [
  "Select", "🐮Chobani Whole Milk Plain Greek Yogurt - 10💷", "🌿Roasted Seaweed - 10💷", "🔺Tortilla Chips (Donkey/El Milagro) - 10💷"
];
const goodSnacks = [
  "Select", "🍨Breyers Mango Ice cream - 20💷", "🍪Simple Truth Blueberry Breakfast Cookies - 20💷", "🍕Jacks Pizza Bois - 20💷",
  "🍿Popcorn (Boom chicka/Skinny pop) - 20💷"
];
const poorSnacks = [
  "Select", "🧀Cheez-it - 30💷", "🐻Chocolate Teddy Graham Snacks - 30💷", "🍫Dark Chocolate Covered Almonds/Raisins - 30💷",
  "🧀Simply Cheetos Puffs White Cheddar - 30💷", "🍕Totinos Pizza rolls - 30💷"
];
const badSnacks = [
  "Select", "🍪Belvita Blueberry Breakfast biscuits - 40💷", "🍪Chips Ahoy 2 pack - 40💷", "🍦So Delicious Vanilla Bean Coconut milk Ice cream Ice/Cream Sandwiches - 40💷",
  "🎂Little Bites (Fudge/Banana) - 40💷", "🐄 Old Fashioned Beef Jerk - 40💷", "🍨Kroger Deluxe artisan Vanilla bean ice cream - 40💷", "🍘Wheat Thins Original - 40💷"
];
const drinks = [
  "Select", "🍺Beer - 50💷", "☕VJ Hot Cocoa 500ml - 20💷", "🥃Mixed Drink 500ml - 100💷", "🍷Wine Glass 500ml - 100💷", "🍾Wine Bottle 750ml - 150💷"
];
const mealMods = [
  "Select", "🍔Fast Food Cheat Meal - 60💷", "🍴Lunch Snack - 2💷"
];
const optionsMap = {
  "excellentSnackContainer": excellentSnacks,
  "goodSnackContainer": goodSnacks,
  "poorSnackContainer": poorSnacks,
  "badSnackContainer": badSnacks,
  "drinksContainer": drinks,
  "mealModsContainer": mealMods
};

document.addEventListener('DOMContentLoaded', () => {
  // Refreshment containers and data arrays
  const selectContainers = [
    "excellentSnackContainer", "goodSnackContainer", "poorSnackContainer", "badSnackContainer",
    "drinksContainer", "mealModsContainer"
  ];

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
      <h2>Receipt:</h2>
      <ul>${selectedItems.map(item => `<li>${item}</li>`).join('')}</ul>
      <p>Total: ${totalValue} 💷</p>
  `;
  summary.style.display = 'block';
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
  html2canvas(summary).then(canvas => {
    canvas.toBlob(blob => {
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]).then(() => {
        alert('Screenshot copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    });
  });
}
