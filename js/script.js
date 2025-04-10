document.addEventListener('DOMContentLoaded', () => {
  setDateAndTimeInputs();
  
  document.querySelectorAll('.mod.take-screenshot').forEach(button => {
    button.addEventListener('click', handleScreenshotButtonClick);
  });

  addGlobalEventListeners();

  const clickSound = new Audio('../../assets/audio/mouse-click-deep.mp3');
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      clickSound.play();
    });
  });
  
  // Initialize the countdowns
  initializeCountdowns();
});

function handleScreenshotButtonClick(event) {
  const modDiv = event.target.closest('.mod');
  if (modDiv) {
    const selectedOptions = modDiv.querySelectorAll('.custom-select');

    selectedOptions.forEach(select => {
      Array.from(select.options).forEach(option => {
        if (!option.selected && option.value !== '0') {
          option.style.display = 'none';
        }
      });
    });

    animateClick(modDiv);

    captureScreenshot(modDiv).finally(() => {
      selectedOptions.forEach(select => {
        Array.from(select.options).forEach(option => {
          option.style.display = '';
        });
      });
    });
  }
}

// Countdown functionality
function initializeCountdowns() {
  // Set placeholder data - you can replace these with actual data
  document.getElementById('current-bingwa').textContent = 'Player 1';
  document.getElementById('current-atletico').textContent = 'Player 2';
  document.getElementById('current-movie').textContent = 'Blade Runner 2049';
  
  // Start the countdowns
  updateCountdowns();
}

function updateCountdowns() {
  // Get current date
  const now = new Date();
  
  // Next ErgoArt Challenge - Example: First day of next month
  let nextErgoArt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
  // End of Quarter - Calculate the end of the current quarter
  const currentMonth = now.getMonth();
  let quarterEndMonth;
  
  if (currentMonth < 3) {
    quarterEndMonth = 2; // March (0-indexed)
  } else if (currentMonth < 6) {
    quarterEndMonth = 5; // June
  } else if (currentMonth < 9) {
    quarterEndMonth = 8; // September
  } else {
    quarterEndMonth = 11; // December
  }
  
  const quarterEndDates = [31, 30, 31, 30]; // Last day of Mar, Jun, Sep, Dec
  const quarterEndDay = quarterEndDates[Math.floor(currentMonth / 3)];
  let quarterEnd = new Date(now.getFullYear(), quarterEndMonth, quarterEndDay);
  
  // Update the countdowns
  updateCountdown('ergoart', nextErgoArt);
  updateCountdown('quarter', quarterEnd);
  
  // Update every second
  setTimeout(updateCountdowns, 1000);
}

function updateCountdown(id, targetDate) {
  const now = new Date();
  const diff = targetDate - now;
  
  // If the target date has passed, recalculate for next occurrence
  if (diff <= 0) return;
  
  // Calculate days, hours, minutes, and seconds
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  // Update the HTML
  document.getElementById(`${id}-days`).textContent = days.toString().padStart(2, '0');
  document.getElementById(`${id}-hours`).textContent = hours.toString().padStart(2, '0');
  document.getElementById(`${id}-minutes`).textContent = minutes.toString().padStart(2, '0');
  document.getElementById(`${id}-seconds`).textContent = seconds.toString().padStart(2, '0');
}