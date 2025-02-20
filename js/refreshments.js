/* ...existing dynamic fetch code removed... */

// New static dropdown menu configuration:
const saltySnacks = [
   "🌿Roasted Seaweed - 10💷", "🔺Tortilla Chips (Donkey/El Milagro) - 10💷", "🍿Popcorn (Boom chicka/Skinny pop) - 20💷", "🧀Cheez-it - 30💷", "🧀Simply Cheetos Puffs White Cheddar - 30💷",  
   "🐄 Old Fashioned Beef Jerk - 40💷", "🍘Wheat Thins Original - 40💷"
];
const sweetSnacks = [
  "🐮Chobani Whole Milk Plain Greek Yogurt - 10💷", "🍪Simple Truth Blueberry Breakfast Cookies - 20💷", "🐻Chocolate Teddy Graham Snacks - 30💷", "🍫Dark Chocolate Covered Almonds/Raisins - 30💷", "🍪Belvita Blueberry Breakfast biscuits - 40💷",
  "🍪Chips Ahoy 2 pack - 40💷", "🎂Little Bites (Fudge/Banana) - 40💷"
];
const frozenSnacks = [
  "🍕Jacks Pizza Bois - 20💷", "🍨Breyers Mango Ice cream - 20💷", "🍕Totinos Pizza rolls - 30💷", "🥟Bibigo Chicken & Veggie Mini Wontos - 30💷", "🍨Kroger Deluxe artisan Vanilla bean ice cream - 40💷", 
  "🍦So Delicious Vanilla Bean Coconut milk IceCream Sandwiches - 40💷"
];
const badSnacks = [
   "🚬THC Gummies - 40💷"
];
const drinks = [
 "☕VJ Hot Cocoa 500ml - 20💷", "🍺Beer - 50💷", "🥃Mixed Drink (2shots) - 50💷", "🍷Wine Glass 500ml - 100💷", "🍾Wine Bottle 750ml - 150💷"
];
// Merge badSnacks and drinks into one "concoctions" array
const concoctions = badSnacks.concat(drinks);
const mealMods = [
  "🍔Fast Food Cheat Meal - 60💷", "🍴Lunch Snack - 2💷", "🌞Weekend AM Snack - 2💷",
  "🎉SNACK-A-THON MOD(1/2) - 0💷", "🎉🎉SNACK-A-THON MOD(2/2) - 0💷"
];

const optionsMap = {
  "saltySnackContainer": saltySnacks,
  "sweetSnackContainer": sweetSnacks,
  "frozenSnackContainer": frozenSnacks,
  "concoctionsContainer": concoctions,
  "mealModsContainer": mealMods
};

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

/* ...existing code for addNewSelection, populateSelect, submitSelection, clearSelection, copySummary, screenshotDiv... */

function populateSelectOptions() {
  Object.keys(optionsMap).forEach(id => {
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
