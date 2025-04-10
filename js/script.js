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
  try {
    // Log to verify function is running
    console.log("Initializing countdowns and champions data");
    
    // Set champion data with error checking
    const bingwaElement = document.getElementById('current-bingwa');
    const atleticoElement = document.getElementById('current-atletico');
    const movieElement = document.getElementById('current-movie');
    
    if (bingwaElement) {
      bingwaElement.textContent = 'Jayber8';
      console.log("Bingwa champion set");
    } else {
      console.error("Element with ID 'current-bingwa' not found");
    }
    
    if (atleticoElement) {
      atleticoElement.textContent = 'Jaybers8';
      console.log("Atletico champion set");
    } else {
      console.error("Element with ID 'current-atletico' not found");
    }
    
    if (movieElement) {
      movieElement.textContent = 'A Scanner Darkly';
      console.log("Movie title set");
    } else {
      console.error("Element with ID 'current-movie' not found");
    }
    
    // Start the countdowns
    updateCountdowns();
  } catch (error) {
    console.error("Error in initializeCountdowns:", error);
  }
}

function updateCountdowns() {
  // Get current date
  const now = new Date();
  
  // Calculate the next ErgoArt Challenge date
  // ErgoArt happens every 3 months on the second Saturday of the month
  // Starting with April 12th, 2025
  const nextErgoArt = calculateNextErgoArt(now);
  
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

// Function to calculate the next ErgoArt event
function calculateNextErgoArt(currentDate) {
  // First ErgoArt date: April 12th, 2025 (second Saturday)
  const baseDate = new Date(2025, 3, 12); // April is month 3 (0-indexed)
  
  // If current date is before the first event, return the first event date
  if (currentDate < baseDate) {
    return baseDate;
  }
  
  // Calculate the next date after currentDate
  let year = currentDate.getFullYear();
  let month = currentDate.getMonth();
  
  // Determine how many months to add to get to the next ErgoArt month
  // Starting from the base month (April 2025, which is month 3)
  const baseMonth = 3; // April
  const baseYear = 2025;
  
  // Calculate total months since base date
  const totalMonthsSinceBase = (year - baseYear) * 12 + month - baseMonth;
  
  // Calculate how many 3-month intervals have passed
  const intervalsPassedSinceBase = Math.floor(totalMonthsSinceBase / 3);
  
  // Calculate the next interval
  const nextIntervalMonthsFromBase = (intervalsPassedSinceBase + 1) * 3;
  
  // Calculate the next month and year
  const nextEventMonth = (baseMonth + nextIntervalMonthsFromBase) % 12;
  const nextEventYear = baseYear + Math.floor((baseMonth + nextIntervalMonthsFromBase) / 12);
  
  // Find the second Saturday of that month
  return getSecondSaturdayOfMonth(nextEventYear, nextEventMonth);
}

// Function to get the second Saturday of a given month
function getSecondSaturdayOfMonth(year, month) {
  let date = new Date(year, month, 1);
  let saturdayCount = 0;
  
  // Find the first Saturday
  while (date.getDay() !== 6) { // 6 is Saturday
    date.setDate(date.getDate() + 1);
  }
  
  // Find the second Saturday
  date.setDate(date.getDate() + 7);
  
  return date;
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