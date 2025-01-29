document.addEventListener('DOMContentLoaded', (event) => {
  setDateAndTimeInputs();
  populateSelectOptions();

  document.querySelectorAll('.mod .take-screenshot').forEach(button => {
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

const selectIds = [
  "gameSelect1", "gameSelect2", "gameSelect3", "gameSelect4", "gameSelect5",
  "excelentSnack", "excelentSnack2", "goodSnack", "goodSnack2",
  "poorSnack", "poorSnack2", "badSnack", "badSnack2",
  "drinksList", "drinksList2", "mealModList", "mealModList2"
];

const games = [
  "Select", "🏸Badminton", "🏀Basketball - 1 game 2-on-2", "🏀Basketball - best of 3 shooting game", "🎳Bowling - 1 special game", 
  "🎳Bowling - 1 standard game", "Brawlhalla", "Brawlout", "Clash", "Dead or Alive 5", "Destiny 2 Crucible", "Escape Academy",
  "Fallguys", "Fight Night Champion", "Guilty Gear Strive", "⛳Golf", "Halo Infinite", "Injustice 2", "Killer Instinct",
  "Killer Instinct 2", "Killer Instinct Classic", "Marvel Vs. Capcom 3", "Marvel Vs. Capcom Infinite", "Mortal Kombat 1",
  "Mortal Kombat 11", "Mortal Kombat 2011", "Mortal Kombat X", "Nidhogg 2", "⚽Soccer", "Smash Brothers", "Super Street Fighter IV",
  "Tekken 6", "Tekken 7", "Tekken Tag Tournament 2", "🎾Tennis", "Tetris", "The King Of Fighters XIII", "UFC", "Virtua Fighters 5",
  "🏐Volleyball"
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
  "Select", "🍔Fast Food Cheat Meal - 60💷" , "🍴Lunch Snack - 2💷"
];

const optionsMap = {
  "gameSelect1": games, "gameSelect2": games, "gameSelect3": games, "gameSelect4": games, "gameSelect5": games,
  "excelentSnack": excellentSnacks, "excelentSnack2": excellentSnacks, "goodSnack": goodSnacks, "goodSnack2": goodSnacks,
  "poorSnack": poorSnacks, "poorSnack2": poorSnacks, "badSnack": badSnacks, "badSnack2": badSnacks, "drinksList": drinks,
  "drinksList2": drinks, "mealModList": mealMods, "mealModList2": mealMods
};

function populateSelectOptions() {
  selectIds.forEach(selectId => {
    const selectElement = document.getElementById(selectId);
    if (selectElement) {
      const optionsArray = optionsMap[selectId];
      optionsArray.forEach((optionText) => {
        const option = document.createElement("option");
        option.value = optionText.split('- ')[1]?.slice(0, -1) || 0; // Corrected missing )
        option.text = optionText;
        selectElement.appendChild(option);
      });
    }
  });
}

function handleScreenshotButtonClick(event) {
  const modDiv = event.target.closest('.mod');
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

  selectIds.forEach(selectId => {
    const selectElement = document.getElementById(selectId);
    if (selectElement && selectElement.value !== '0') {
      selectedItems.push(selectElement.options[selectElement.selectedIndex].text);
      totalValue += parseInt(selectElement.value, 10);
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