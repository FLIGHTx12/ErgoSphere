document.addEventListener('DOMContentLoaded', (event) => {
  setDateAndTimeInputs();
  populateSelectOptions();

  document.querySelectorAll('.mod.take-screenshot').forEach(button => {
    button.addEventListener('click', handleScreenshotButtonClick);
  });

  addGlobalEventListeners();
});

function setDateAndTimeInputs() {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().substr(0, 10);
  const formattedTime = currentDate.toTimeString().substr(0, 5);

  document.querySelectorAll('input[type="date"]').forEach(dateInput => {
    dateInput.value = formattedDate;
  });

  document.querySelectorAll('input[type="time"]').forEach(timeInput => {
    timeInput.value = formattedTime;
  });
}

const selectContainers = [
  "excellentSnackContainer", "goodSnackContainer", "poorSnackContainer", "badSnackContainer",
  "drinksContainer", "mealModsContainer"
];

const games = [
  "Select", "🏸Badminton - 0", "🏀Basketball - 1 game 2-on-2 - 0", "🏀Basketball - best of 3 shooting game - 0", "🎳Bowling - 1 special game - 0",
  "🎳Bowling - 1 standard game - 0", "Brawlhalla - 0", "Brawlout - 0", "Clash - 0", "Dead or Alive 5 - 0", "Destiny 2 Crucible - 0", "Escape Academy - 0",
  "Fallguys - 0", "Fight Night Champion - 0", "Guilty Gear Strive - 0", "⛳Golf - 0", "Halo Infinite - 0", "Injustice 2 - 0", "Killer Instinct - 0",
  "Killer Instinct 2 - 0", "Killer Instinct Classic - 0", "Marvel Vs. Capcom 3 - 0", "Marvel Vs. Capcom Infinite - 0", "Mortal Kombat 1 - 0",
  "Mortal Kombat 11 - 0", "Mortal Kombat 2011 - 0", "Mortal Kombat X - 0", "Nidhogg 2 - 0", "⚽Soccer - 0", "Smash Brothers - 0", "Super Street Fighter IV - 0",
  "Tekken 6 - 0", "Tekken 7 - 0", "Tekken Tag Tournament 2 - 0", "🎾Tennis - 0", "Tetris - 0", "The King Of Fighters XIII - 0", "UFC - 0", "Virtua Fighters 5 - 0",
  "🏐Volleyball - 0"
];

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

function populateSelectOptions() {
  selectContainers.forEach(selectContainerId => {
    const selectContainer = document.getElementById(selectContainerId);
    if (selectContainer) { // Add this check
      const selectElement = selectContainer.querySelector('.custom-select');
      if (selectElement) {
        const optionsArray = optionsMap[selectContainerId];
        optionsArray.forEach((optionText) => {
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

// Add event listeners to the "+" buttons
selectContainers.forEach(selectContainerId => {
  const selectContainer = document.getElementById(selectContainerId);
  if (selectContainer) { // Add this check
    const addButton = selectContainer.querySelector('.add-button');
    if (addButton) {
      addButton.addEventListener('click', () => {
        addNewSelection(selectContainerId);
      });
    }
  }
});

function addNewSelection(selectContainerId) {
  const selectContainer = document.getElementById(selectContainerId);
  if (selectContainer) { // Add this check
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
  optionsArray.forEach((optionText) => {
    const option = document.createElement("option");
    const match = optionText.match(/(\d+)💷/);
    option.value = match ? match[1] : 0;
    option.text = optionText;
    selectElement.appendChild(option);
  });
}

function handleScreenshotButtonClick(event) {
  const modDiv = event.target.closest('.mod');
  if (modDiv) { // Add this check
    const selectedOptions = modDiv.querySelectorAll('.custom-select');

    // Temporarily hide non-selected options
    selectedOptions.forEach(select => {
      Array.from(select.options).forEach(option => {
        if (!option.selected && option.value !== '0') {
          option.style.display = 'none';
        }
      });
    });

    animateClick(modDiv);

    captureScreenshot(modDiv).finally(() => {
      // Restore all options
      selectedOptions.forEach(select => {
        Array.from(select.options).forEach(option => {
          option.style.display = '';
        });
      });
    });
  }
}

function animateClick(element) {
  element.classList.add('clicked');
  setTimeout(() => {
    element.classList.remove('clicked');
  }, 300);
}

function captureScreenshot(element) {
  return html2canvas(element).then(canvas => {
    return canvas.toBlob(blob => {
      return navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
    });
  }).then(() => {
    alert('Selected options screenshot copied to clipboard!');
  }).catch(err => {
    console.error('Failed to capture screenshot:', err);
  });
}

function submitSelection() {
  let selectedItems = [];
  let totalValue = 0;

  selectContainers.forEach(selectContainerId => {
    const selectContainer = document.getElementById(selectContainerId);
    if (selectContainer) { // Add this check
      const selectElements = selectContainer.querySelectorAll('.custom-select');
      const quantityInputs = selectContainer.querySelectorAll('.quantity-input');

      selectElements.forEach((selectElement, index) => {
        const quantity = parseInt(quantityInputs[index].value, 10);
        if (selectElement.value !== '0' && selectElement.value !== 'Select') {
          const itemName = selectElement.options[selectElement.selectedIndex].text;
          selectedItems.push(itemName + ' x ' + quantity);
          totalValue += parseInt(selectElement.value, 10) * quantity;
        }
      });
    }
  });

  document.getElementById('summary').innerHTML = `
      <h2>Receipt:</h2>
      <ul>${selectedItems.map(item => `<li>${item}</li>`).join('')}</ul>
      <p>Total: ${totalValue} 💷</p>
  `;

  document.getElementById('summary').style.display = 'block';
  document.querySelectorAll('.action-button.copy-clear').forEach(button => {
    button.style.display = 'inline-block';
  });
}

function clearSelection() {
  document.getElementById('summary').innerHTML = '';
}

function copySummary() {
  const summaryDiv = document.getElementById('summary');
  const range = document.createRange();
  range.selectNode(summaryDiv);
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
  const summary = document.querySelector("#summary");
  html2canvas(summary).then(canvas => {
    canvas.toBlob(blob => {
      navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]).then(() => {
        alert('Screenshot copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    });
  });
}

function addGlobalEventListeners() {
  let lastScrollTop = 0;
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  });

  const pages = [
    "index.html", "refreshments.html", "MODS.html",
    "casino.html", "contracts.html"
  ];

  let touchstartX = 0;
  let touchstartY = 0;
  let touchendX = 0;
  let touchendY = 0;
  const minSwipeDistance = 100;

  function handleGesture() {
    const horizontalSwipe = Math.abs(touchendX - touchstartX) > Math.abs(touchendY - touchstartY);
    const swipeDistance = Math.abs(touchendX - touchstartX);
    if (!horizontalSwipe || swipeDistance < minSwipeDistance) return;

    document.body.classList.add('page-transition');
    const currentPage = window.location.pathname.split("/").pop();
    const currentIndex = pages.indexOf(currentPage);

    setTimeout(() => {
      if (touchendX < touchstartX) {
        window.location.href = pages[(currentIndex + 1) % pages.length];
      } else if (touchendX > touchstartX) {
        window.location.href = pages[(currentIndex - 1 + pages.length) % pages.length];
      }
    }, 300);
  }

  document.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
    touchstartY = e.changedTouches[0].screenY;
  });

  document.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    touchendY = e.changedTouches[0].screenY;
    handleGesture();
  });
}
