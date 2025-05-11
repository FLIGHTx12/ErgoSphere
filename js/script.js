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

  // Update calendar week dynamically
  updateCalendarWeek();

  // Restore site state
  restoreSiteState();

  // Add event listeners to save state on input changes
  document.querySelectorAll('input, select, textarea').forEach(element => {
    element.addEventListener('input', saveSiteState);
  });

  // Update quarter countdown
  updateQuarterCountdown();

  // Add event listeners for expandable cards
  document.querySelectorAll('.expandable').forEach(card => {
    card.addEventListener('click', () => {
      const expandedContent = card.querySelector('.expanded-content');
      if (expandedContent) {
        // Toggle the visible class
        expandedContent.classList.toggle('visible');
        
        // Update display property for animation to work properly
        if (expandedContent.classList.contains('visible')) {
          expandedContent.style.display = 'block';
        } else {
          // Use setTimeout to allow animation to complete before hiding
          setTimeout(() => {
            expandedContent.style.display = 'none';
          }, 500);
        }
        
        // Toggle expanded class on the card
        card.classList.toggle('expanded');
      }
    });
  });
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
    
    // Default data in case API fails
    const defaultData = {
      bingwaChampion: 'JAYBERS8',
      atleticoChamp: 'FLIGHTx12!',
      movieNight: 'Underwater (2020)'
    };
    
    // Fetch data from the server API
    fetch('/api/selections')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(ergosphereData => {
        // Set champion data with error checking
        const bingwaElement = document.getElementById('current-bingwa');
        const atleticoElement = document.getElementById('current-atletico');
        const movieElement = document.getElementById('current-movie');
        
        if (bingwaElement) {
          bingwaElement.textContent = ergosphereData.bingwaChampion || defaultData.bingwaChampion;
          console.log("Bingwa champion set to:", bingwaElement.textContent);
        } else {
          console.error("Element with ID 'current-bingwa' not found");
        }
        
        if (atleticoElement) {
          atleticoElement.textContent = ergosphereData.atleticoChamp || defaultData.atleticoChamp;
          console.log("Atletico champion set to:", atleticoElement.textContent);
        } else {
          console.error("Element with ID 'current-atletico' not found");
        }
        
        if (movieElement) {
          movieElement.textContent = ergosphereData.movieNight || defaultData.movieNight;
          console.log("Movie title set to:", movieElement.textContent);
        } else {
          console.error("Element with ID 'current-movie' not found");
        }
      })
      .catch(error => {
        console.error("Error fetching selections:", error);
        // Use default data if fetch fails
        applyDefaultSelections(defaultData);
      });
    
    // Start the countdowns
    updateCountdowns();
  } catch (error) {
    console.error("Error in initializeCountdowns:", error);
  }
}

function applyDefaultSelections(defaultData) {
  const bingwaElement = document.getElementById('current-bingwa');
  const atleticoElement = document.getElementById('current-atletico');
  const movieElement = document.getElementById('current-movie');
  
  if (bingwaElement) {
    bingwaElement.textContent = defaultData.bingwaChampion;
  }
  
  if (atleticoElement) {
    atleticoElement.textContent = defaultData.atleticoChamp;
  }
  
  if (movieElement) {
    movieElement.textContent = defaultData.movieNight;
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

function addGlowEffectToCountdown(id, targetDate) {
  const now = new Date();
  const diff = targetDate - now;

  // Check if the countdown is within 7 days
  if (diff <= 7 * 24 * 60 * 60 * 1000) {
    const countdownCard = document.querySelector(`#${id}-card`);
    if (countdownCard) {
      countdownCard.classList.add('glow-effect');
    }
  }
}

// Update the countdown function to include the glow effect
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

  // Add glow effect if within 7 days
  addGlowEffectToCountdown(id, targetDate);
}

// Save site state to localStorage
function saveSiteState() {
  const state = {};

  // Example: Save form inputs
  document.querySelectorAll('input, select, textarea').forEach(element => {
    state[element.id || element.name] = element.value;
  });

  // Save the state object to localStorage
  localStorage.setItem('siteState', JSON.stringify(state));
}

// Restore site state from localStorage
function restoreSiteState() {
  const state = JSON.parse(localStorage.getItem('siteState')) || {};

  // Example: Restore form inputs
  Object.keys(state).forEach(key => {
    const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
    if (element) {
      element.value = state[key];
    }
  });
}

function updateCalendarWeek() {
  const now = new Date();
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now - firstDayOfYear + (firstDayOfYear.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000) / 86400000;
  const currentWeek = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  const bingwaElement = document.getElementById('current-bingwa');
  const atleticoElement = document.getElementById('current-atletico');

  if (bingwaElement) {
    bingwaElement.previousElementSibling.innerHTML = `WK${currentWeek} Bingwa <br> Champion`;
  }

  if (atleticoElement) {
    atleticoElement.previousElementSibling.innerHTML = `WK${currentWeek} Atletico <br>Champ`;
  }
}

function calculateNextQuarterStart() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let nextQuarterStart;

  if (currentMonth < 3) {
    nextQuarterStart = new Date(currentYear, 3, 1); // April 1st
  } else if (currentMonth < 6) {
    nextQuarterStart = new Date(currentYear, 6, 1); // July 1st
  } else if (currentMonth < 9) {
    nextQuarterStart = new Date(currentYear, 9, 1); // October 1st
  } else {
    nextQuarterStart = new Date(currentYear + 1, 0, 1); // January 1st of next year
  }

  return nextQuarterStart;
}

function updateQuarterCountdown() {
  const nextQuarterStart = calculateNextQuarterStart();
  updateCountdown('quarter', nextQuarterStart);
}