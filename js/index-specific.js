document.addEventListener('DOMContentLoaded', () => {
  // Initialize the countdowns
  initializeCountdowns();

  // Initialize the week tracker if not already initialized
  if (typeof WeekTracker !== 'undefined') {
    WeekTracker.init();
  }
  
  // Update calendar display with week tracker data
  updateCalendarDisplay();
  
  // Fetch the current quarter's solo game
  fetchCurrentQuarterSoloGame();
  
  // Initialize week management UI
  initWeekManagementUI();
  
  // Listen for week updates from the WeekTracker
  document.addEventListener('weekUIUpdate', function(event) {
    updateCalendarDisplay();
  });
  
  // Listen for week change events
  document.addEventListener('weekChange', function(event) {
    console.log('Week changed:', event.detail);
    updateCalendarDisplay();
  });
});

// New function to update calendar display using WeekTracker
function updateCalendarDisplay() {
  // Get week and quarter from WeekTracker if available
  let currentWeek = (typeof WeekTracker !== 'undefined') ? 
    WeekTracker.getCurrentWeekNumber() : 
    calculateWeekNumber();
  
  let currentQuarter = (typeof WeekTracker !== 'undefined') ? 
    WeekTracker.getCurrentQuarter() : 
    calculateQuarter();
  
  // Update the Bingwa Champion week number
  const bingwaCardHeader = document.querySelector('#bingwa-card .card-header .neon-text');
  if (bingwaCardHeader) {
    bingwaCardHeader.innerHTML = `WK${currentWeek} Bingwa <br> Champion`;
  }

  // Update the Atletico Champ week number
  const atleticoCardHeader = document.querySelector('#atletico-card .card-header .neon-text');
  if (atleticoCardHeader) {
    atleticoCardHeader.innerHTML = `WK${currentWeek} Atletico <br> Champ`;
  }
  
  // Update the quarter number display
  const quarterElement = document.getElementById('current-quarter');
  if (quarterElement) {
    quarterElement.textContent = currentQuarter;
    
    // Also update the parent element's text to ensure proper formatting
    const quarterHeader = document.querySelector('.card-header .neon-text:has(#current-quarter)');
    if (quarterHeader) {
      quarterHeader.innerHTML = `ErgoSphere QTR: <span id="current-quarter">${currentQuarter}</span>`;
    }
  }
}

// Fallback function if WeekTracker is not available
function calculateWeekNumber() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = (now - startOfYear + ((startOfYear.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000)) / 86400000;
  return Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
}

// Fallback function if WeekTracker is not available
function calculateQuarter() {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  
  if (month < 3) return 1;      // Q1: Jan-Mar
  else if (month < 6) return 2; // Q2: Apr-Jun
  else if (month < 9) return 3; // Q3: Jul-Sep
  else return 4;                // Q4: Oct-Dec
}

// Countdown functionality
function initializeCountdowns() {
  try {
    // Log to verify function is running
    console.log("Initializing countdowns and champions data (index-specific)");
      // Default data in case API fails
    const defaultData = {
      bingwaChampion: 'JAYBERS8',
      atleticoChamp: 'FLIGHTx12!',
      movieNight: 'Underwater (2020)',
      banquetMeal: 'Spaghetti and side salad',
      brunchMeal: 'Pancakes & Syrup', // Added default brunch
      youtubeTheater: 'No featured video', // Added default YouTube
      nextBingwaChallenge: '🏐Volleyball - best of 3🏐', // Default next Bingwa challenge
      atleticoWorkout: 'Juice & Toya 20 Minute Full Body Cardio Workout', // Default workout
      weeklyErrand: 'Target Stock up' // Default errand
    };
    
  // Fetch data from the server API
    fetch('/api/selections')
      .then(response => {
        if (!response.ok) {
          console.error('Failed to fetch selections, using default data.');
          applyDefaultSelections(defaultData); // Apply default data on API failure
          return defaultData; // Return default data to proceed
        }
        return response.json();
      })
      .then(async ergosphereData => {
        const bingwaElement = document.getElementById('current-bingwa');
        const atleticoElement = document.getElementById('current-atletico');
        const movieElement = document.getElementById('current-movie');
        const banquetElement = document.getElementById('current-banquet');
        const brunchElement = document.getElementById('current-brunch'); // Get brunch element
        const youtubeElement = document.getElementById('current-youtube'); // Get YouTube element
        
        // Weekly Choices - New elements
        const nextBingwaChallengeElement = document.getElementById('next-bingwa-challenge');
        const atleticoWorkoutElement = document.getElementById('atletico-workout');
        const weeklyErrandElement = document.getElementById('weekly-errand');

        // --- New Panels: Anime, Sunday Morning, Sunday Night ---
        const animeElement = document.getElementById('current-anime');
        const animeEndDateElement = document.getElementById('anime-end-date');
        const sundayMorningElement = document.getElementById('current-sunday-morning');
        const sundayMorningEndDateElement = document.getElementById('sunday-morning-end-date');
        const sundayNightElement = document.getElementById('current-sunday-night');
        const sundayNightEndDateElement = document.getElementById('sunday-night-end-date');

        if (bingwaElement) bingwaElement.textContent = ergosphereData.bingwaChampion || defaultData.bingwaChampion;
        if (atleticoElement) atleticoElement.textContent = ergosphereData.atleticoChamp || defaultData.atleticoChamp;
        if (movieElement) movieElement.textContent = ergosphereData.movieNight || defaultData.movieNight;
        if (banquetElement) banquetElement.textContent = ergosphereData.banquetMeal || defaultData.banquetMeal;
        if (brunchElement) brunchElement.textContent = ergosphereData.brunchMeal || defaultData.brunchMeal;
        
        // Update Weekly Choices
        if (nextBingwaChallengeElement) nextBingwaChallengeElement.textContent = ergosphereData.nextBingwaChallenge || 'SELECT A CHALLENGE';
        if (atleticoWorkoutElement) atleticoWorkoutElement.textContent = ergosphereData.atleticoWorkout || 'SELECT A WORKOUT';
        if (weeklyErrandElement) weeklyErrandElement.textContent = ergosphereData.weeklyErrand || 'SELECT AN ERRAND';
        
        // Anime
        if (animeElement) {
          animeElement.textContent = ergosphereData.anime || (ergosphereData.animeTitle || 'SELECT AN ANIME');
        }
        if (animeEndDateElement) {
          animeEndDateElement.textContent = getShowEndDateString('anime', ergosphereData.animeEndDate);
        }
        // Sunday Morning
        if (sundayMorningElement) {
          sundayMorningElement.textContent = ergosphereData.sundayMorning || (ergosphereData.sundayMorningTitle || 'SELECT A SHOW');
        }
        if (sundayMorningEndDateElement) {
          sundayMorningEndDateElement.textContent = getShowEndDateString('sundayMorning', ergosphereData.sundayMorningEndDate);
        }
        // Sunday Night
        if (sundayNightElement) {
          sundayNightElement.textContent = ergosphereData.sundayNight || (ergosphereData.sundayNightTitle || 'SELECT A SHOW');
        }
        if (sundayNightEndDateElement) {
          sundayNightEndDateElement.textContent = getShowEndDateString('sundayNight', ergosphereData.sundayNightEndDate);
        }
        
        if (youtubeElement) {
          let youtubeHTML = defaultData.youtubeTheater; // Default to a string
          if (ergosphereData.youtubeTheater && Array.isArray(ergosphereData.youtubeTheater) && ergosphereData.youtubeTheater.length > 0) {
            youtubeHTML = ergosphereData.youtubeTheater.join('<br>');
          } else if (typeof ergosphereData.youtubeTheater === 'string' && ergosphereData.youtubeTheater.trim() !== '') {
            youtubeHTML = ergosphereData.youtubeTheater; // Already a string, use as is
          } else if (ergosphereData.youtubeTheater && Array.isArray(ergosphereData.youtubeTheater) && ergosphereData.youtubeTheater.length === 0) {
            youtubeHTML = 'No video selected'; // Specific message for empty array from API
          }
          youtubeElement.innerHTML = youtubeHTML; // Use innerHTML to render <br>
        }
        
        // Start the countdowns
        updateCountdowns();
      })
      .catch(error => {
        console.error('Error fetching or processing selections:', error);
        applyDefaultSelections(defaultData); // Apply default data on any error
        // Start the countdowns even if API fails, using default or potentially empty values for target dates if not handled by updateCountdowns
        updateCountdowns();
      });
    
  } catch (error) {
    console.error("Error in initializeCountdowns (index-specific):", error);
    // Fallback to start countdowns with default/empty data if an early error occurs
    applyDefaultSelections(defaultData); // Ensure defaults are applied
    updateCountdowns(); // Try to start countdowns anyway
  }
}

function applyDefaultSelections(defaultData) {
  const bingwaElement = document.getElementById('current-bingwa');
  const atleticoElement = document.getElementById('current-atletico');
  const movieElement = document.getElementById('current-movie');
  const banquetElement = document.getElementById('current-banquet');
  const brunchElement = document.getElementById('current-brunch'); // Get brunch element
  const youtubeElement = document.getElementById('current-youtube'); // Get YouTube element
  
  // Weekly Choices - New elements
  const nextBingwaChallengeElement = document.getElementById('next-bingwa-challenge');
  const atleticoWorkoutElement = document.getElementById('atletico-workout');
  const weeklyErrandElement = document.getElementById('weekly-errand');
  
  // --- New Panels: Anime, Sunday Morning, Sunday Night ---
  const animeElement = document.getElementById('current-anime');
  const animeEndDateElement = document.getElementById('anime-end-date');
  const sundayMorningElement = document.getElementById('current-sunday-morning');
  const sundayMorningEndDateElement = document.getElementById('sunday-morning-end-date');
  const sundayNightElement = document.getElementById('current-sunday-night');
  const sundayNightEndDateElement = document.getElementById('sunday-night-end-date');
  
  if (bingwaElement) {
    bingwaElement.textContent = defaultData.bingwaChampion;
  }
  
  if (atleticoElement) {
    atleticoElement.textContent = defaultData.atleticoChamp;
  }
  
  if (movieElement) {
    movieElement.textContent = defaultData.movieNight;
  }

  if (banquetElement) {
    banquetElement.textContent = defaultData.banquetMeal;
  }

  if (brunchElement) { // Set default brunch
    brunchElement.textContent = defaultData.brunchMeal;
  }
  
  // Set defaults for Weekly Choices
  if (nextBingwaChallengeElement) {
    nextBingwaChallengeElement.textContent = defaultData.nextBingwaChallenge || 'SELECT A CHALLENGE';
  }
  
  if (atleticoWorkoutElement) {
    atleticoWorkoutElement.textContent = defaultData.atleticoWorkout || 'SELECT A WORKOUT';
  }
  
  if (weeklyErrandElement) {
    weeklyErrandElement.textContent = defaultData.weeklyErrand || 'SELECT AN ERRAND';
  }

  // Anime
  if (animeElement) {
    animeElement.textContent = defaultData.anime || 'SELECT AN ANIME';
  }
  if (animeEndDateElement) {
    animeEndDateElement.textContent = getShowEndDateString('anime');
  }
  // Sunday Morning
  if (sundayMorningElement) {
    sundayMorningElement.textContent = defaultData.sundayMorning || 'SELECT A SHOW';
  }
  if (sundayMorningEndDateElement) {
    sundayMorningEndDateElement.textContent = getShowEndDateString('sundayMorning');
  }
  // Sunday Night
  if (sundayNightElement) {
    sundayNightElement.textContent = defaultData.sundayNight || 'SELECT A SHOW';
  }
  if (sundayNightEndDateElement) {
    sundayNightEndDateElement.textContent = getShowEndDateString('sundayNight');
  }

  if (youtubeElement) { // Set default YouTube
    youtubeElement.innerHTML = defaultData.youtubeTheater; // Use innerHTML for default as well
  }
}

// Helper to get show end date string (1 week from now or use provided date)
function getShowEndDateString(type, overrideDate) {
  try {
    // If we have an endDate from the database, use it
    if (overrideDate) {
      const dateObj = new Date(overrideDate);
      if (isNaN(dateObj.getTime())) {
        return ''; // Invalid date
      }

      // Format as MM/DD
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const formattedDate = `${month}/${day}`;
      
      // Calculate weeks remaining
      const now = new Date();
      const diffTime = dateObj.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.ceil(diffDays / 7);
      
      // Format the weeks text
      let weeksText = '';
      if (diffDays <= 0) {
        weeksText = 'Ended';
      } else if (diffWeeks === 1) {
        weeksText = '1 week left';
      } else {
        weeksText = `${diffWeeks} weeks left`;
      }
      
      // Get the correct element ID
      // Convert camelCase to kebab-case and add -end-date
      const elementId = type === 'anime' ? 'anime-end-date' :
                      type === 'sundayMorning' ? 'sunday-morning-end-date' :
                      type === 'sundayNight' ? 'sunday-night-end-date' : null;
      
      // Add a data attribute to the element to mark if it's the last week
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          if (diffWeeks === 1) {
            element.setAttribute('data-final-week', 'true');
          } else {
            element.setAttribute('data-final-week', 'false');
          }
        }
      }
      
      return `${formattedDate} - ${weeksText}`;
    }
    
    // Fallback to showing a generic "End date TBD" message
    return '';
  } catch (error) {
    console.error('Error formatting end date:', error);
    return '';
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
  if (currentMonth < 3) { // Q1 (Jan, Feb, Mar)
    quarterEndMonth = 2; // End of March
  } else if (currentMonth < 6) { // Q2 (Apr, May, Jun)
    quarterEndMonth = 5; // End of June
  } else if (currentMonth < 9) { // Q3 (Jul, Aug, Sep)
    quarterEndMonth = 8; // End of September
  } else { // Q4 (Oct, Nov, Dec)
    quarterEndMonth = 11; // End of December
  }
  
  const quarterEndDay = quarterEndMonth === 2 ? 31 : (quarterEndMonth === 5 ? 30 : (quarterEndMonth === 8 ? 30 : 31));

  let quarterEndTarget = new Date(now.getFullYear(), quarterEndMonth, quarterEndDay, 23, 59, 59);
  if (now > quarterEndTarget) { // If current date is past this quarter's end, aim for next quarter's end
      const nextQuarterInfo = calculateNextQuarterStart(); // This is start of next quarter
      let nextQuarterEndMonth = nextQuarterInfo.getMonth() + 2; // e.g. if nextQ starts Apr (3), end is Jun (5)
      let nextQuarterEndYear = nextQuarterInfo.getFullYear();
      
      const nextQuarterEndDay = nextQuarterEndMonth === 2 ? 31 : (nextQuarterEndMonth === 5 ? 30 : (nextQuarterEndMonth === 8 ? 30 : 31));
      quarterEndTarget = new Date(nextQuarterEndYear, nextQuarterEndMonth, nextQuarterEndDay, 23, 59, 59);
  }

  // Update the countdowns
  updateCountdown('ergoart', nextErgoArt);
  updateCountdown('quarter', quarterEndTarget); // Using the calculated quarter end
  
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
  
  const baseMonth = 3; // April
  const baseYear = 2025;
  
  let nextEventYear = year;
  let nextEventMonth = month;

  // Find the ErgoArt month for the current or next cycle based on current date
  // ErgoArt months are April, July, October, January (months 3, 6, 9, 0)
  // relative to the base year 2025 for April.
  
  // Determine the current 3-month cycle relative to the base (April 2025)
  let monthsSinceBase = (year - baseYear) * 12 + (month - baseMonth);
  let currentCycle = Math.floor(monthsSinceBase / 3);
  
  let nextCycleMonthOffset = (currentCycle + 1) * 3;
  nextEventMonth = (baseMonth + nextCycleMonthOffset) % 12;
  nextEventYear = baseYear + Math.floor((baseMonth + nextCycleMonthOffset) / 12);

  let nextErgoArtDate = getSecondSaturdayOfMonth(nextEventYear, nextEventMonth);

  // If this calculated date is in the past (e.g. current date is just after the 2nd Sat of an ErgoArt month)
  // then we need to advance to the next ErgoArt month.
  if (nextErgoArtDate < currentDate) {
      nextCycleMonthOffset = (currentCycle + 2) * 3; // Advance by one more cycle (total +6 months from start of current cycle)
      nextEventMonth = (baseMonth + nextCycleMonthOffset) % 12;
      nextEventYear = baseYear + Math.floor((baseMonth + nextCycleMonthOffset) / 12);
      nextErgoArtDate = getSecondSaturdayOfMonth(nextEventYear, nextEventMonth);
  }
  
  return nextErgoArtDate;
}

// Function to get the second Saturday of a given month
function getSecondSaturdayOfMonth(year, month) {
  let date = new Date(year, month, 1);
  
  let saturdayCount = 0;
  // Iterate to find the first Saturday
  while (date.getDay() !== 6) { // 6 is Saturday
    date.setDate(date.getDate() + 1);
    if (date.getMonth() !== month) { // Safety break if we somehow skip into next month
        console.error("Could not find first Saturday in the month for", year, month);
        return new Date(year, month, 8); // fallback to 8th as a rough guess
    }
  }
  
  // The date is now the first Saturday. Add 7 days to get the second Saturday.
  date.setDate(date.getDate() + 7);
  
  return date;
}

function addGlowEffectToCountdown(id, targetDate) {
  const now = new Date();
  const diff = targetDate - now;

  // Check if the countdown is within 7 days
  if (diff <= 7 * 24 * 60 * 60 * 1000 && diff > 0) { // ensure diff is positive
    const countdownCard = document.querySelector(`#${id}-card`); // Use template literal for ID
    if (countdownCard) {
        countdownCard.classList.add('glow-effect'); // Example class
    }
  } else {
    const countdownCard = document.querySelector(`#${id}-card`);
    if (countdownCard) {
        countdownCard.classList.remove('glow-effect');
    }
  }
}

// Update the countdown function to include the glow effect
function updateCountdown(id, targetDate) {
  const now = new Date();
  const diff = targetDate - now;

  // If the target date has passed, display 0 or handle as needed
  if (diff <= 0) {
    if (document.getElementById(`${id}-days`)) {
        document.getElementById(`${id}-days`).textContent = '00';
        document.getElementById(`${id}-hours`).textContent = '00';
        document.getElementById(`${id}-minutes`).textContent = '00';
        document.getElementById(`${id}-seconds`).textContent = '00';
    }
    // Optionally, remove glow effect if it was applied
    const countdownCard = document.querySelector(`#${id}-card`);
    if (countdownCard) countdownCard.classList.remove('glow-effect');
    return; 
  }

  // Calculate days, hours, minutes, and seconds
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Update the HTML, only if elements exist
  if (document.getElementById(`${id}-days`)) {
    document.getElementById(`${id}-days`).textContent = days.toString().padStart(2, '0');
    document.getElementById(`${id}-hours`).textContent = hours.toString().padStart(2, '0');
    document.getElementById(`${id}-minutes`).textContent = minutes.toString().padStart(2, '0');
    document.getElementById(`${id}-seconds`).textContent = seconds.toString().padStart(2, '0');
  } else {
    // console.warn(`Countdown elements for '${id}' not found.`); // Helpful for debugging non-index pages
    return; // Stop if elements aren't there
  }


  // Add glow effect if within 7 days
  addGlowEffectToCountdown(id, targetDate);
}

function updateCalendarWeek() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = (now - startOfYear + ((startOfYear.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000)) / 86400000;
  const currentWeek = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);

  // Update the Bingwa Champion week number
  const bingwaCardHeader = document.querySelector('#bingwa-card .card-header .neon-text');
  if (bingwaCardHeader) {
    bingwaCardHeader.innerHTML = `WK${currentWeek} Bingwa <br> Champion`;
  }

  // Update the Atletico Champ week number
  const atleticoCardHeader = document.querySelector('#atletico-card .card-header .neon-text');
  if (atleticoCardHeader) {
    atleticoCardHeader.innerHTML = `WK${currentWeek} Atletico <br> Champ`;
  }
}

function calculateNextQuarterStart() {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  const currentYear = now.getFullYear();
  let nextQuarterStartYear = currentYear;
  let nextQuarterStartMonth;

  if (currentMonth < 3) { // Q1 (Jan-Mar) -> Next is Q2 (Apr)
    nextQuarterStartMonth = 3; 
  } else if (currentMonth < 6) { // Q2 (Apr-Jun) -> Next is Q3 (Jul)
    nextQuarterStartMonth = 6;
  } else if (currentMonth < 9) { // Q3 (Jul-Sep) -> Next is Q4 (Oct)
    nextQuarterStartMonth = 9;
  } else { // Q4 (Oct-Dec) -> Next is Q1 of next year (Jan)
    nextQuarterStartMonth = 0;
    nextQuarterStartYear = currentYear + 1;
  }
  return new Date(nextQuarterStartYear, nextQuarterStartMonth, 1);
}

// Function to fetch the current quarter's solo game from selections.json
function fetchCurrentQuarterSoloGame() {
  try {
    console.log("Fetching current quarter's solo game");
    
    // Get current date to determine the current quarter
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    let currentQuarter;
    let quarterNumber;
    
    if (currentMonth < 3) { // Q1 (Jan-Mar)
      currentQuarter = 'q1';
      quarterNumber = 1;
    } else if (currentMonth < 6) { // Q2 (Apr-Jun)
      currentQuarter = 'q2';
      quarterNumber = 2;
    } else if (currentMonth < 9) { // Q3 (Jul-Sep)
      currentQuarter = 'q3';
      quarterNumber = 3;
    } else { // Q4 (Oct-Dec)
      currentQuarter = 'q4';
      quarterNumber = 4;
    }
      // Update the quarter number display
    const quarterElement = document.getElementById('current-quarter');
    if (quarterElement) {
      quarterElement.textContent = quarterNumber;
      
      // Also update the parent element's text to ensure proper formatting
      const quarterHeader = document.querySelector('.card-header .neon-text:has(#current-quarter)');
      if (quarterHeader) {
        quarterHeader.innerHTML = `ErgoSphere QTR: <span id="current-quarter">${quarterNumber}</span>`;
      }
    }
      // Fetch data from API endpoint which has the quarterly game selections
    fetch('/api/selections')
      .then(response => {
        if (!response.ok) {
          console.error('Failed to fetch selections data from API.');
          // Fallback to local JSON file if API fails
          return fetch('/data/selections.json').then(response => {
            if (!response.ok) {
              console.error('Failed to fetch selections data from local file.');
              return {};
            }
            return response.json();
          });
        }
        return response.json();
      })
      .then(data => {
        // Get the solo game element
        const soloGameElement = document.getElementById('current-solo-game');
          // Update ErgoArt subject if it's available
        if (data.ergoArtSubject) {
          const ergoArtSubjectElement = document.getElementById('ergo-art-subject');
          if (ergoArtSubjectElement) {
            ergoArtSubjectElement.textContent = data.ergoArtSubject;
          } else {
            // Fallback to the old method if the new ID isn't found
            const ergoArtElements = document.querySelectorAll('.card-header .neon-text');
            for (let i = 0; i < ergoArtElements.length; i++) {
              if (ergoArtElements[i].textContent.includes('quarter') && ergoArtElements[i].textContent.includes('subject')) {
                ergoArtElements[i].innerHTML = `This quarter's subject is:<br> "${data.ergoArtSubject}"`;
                break;
              }
            }
          }
        }        // Update solo game if available
        if (data.quarterlyGames && data.quarterlyGames[currentQuarter] && data.quarterlyGames[currentQuarter].trim() !== '' && 
            !data.quarterlyGames[currentQuarter].includes('No Q') && 
            !data.quarterlyGames[currentQuarter].includes('No Game')) {
          if (soloGameElement) {
            soloGameElement.textContent = data.quarterlyGames[currentQuarter];
            console.log(`Displaying ${currentQuarter} game: ${data.quarterlyGames[currentQuarter]}`);
          }
        } else if (soloGameElement) {
          console.log('No quarterly game found for the current quarter, falling back to purple status game');
          // Fallback to purple status game if no quarterly game is set or it has a default "No Game" value
          fetch('/data/singleplayer.json')
            .then(response => {
              if (!response.ok) {
                console.error('Failed to fetch singleplayer games.');
                return [];
              }
              return response.json();
            })
            .then(games => {
              // Filter games with 🟣 status
              const purpleStatusGames = games.filter(game => 
                game.STATUS && game.STATUS.includes('🟣')
              );
              
              // Update the element with the game title if found
              if (purpleStatusGames.length > 0 && soloGameElement) {
                // Sort by name and take the first one, or implement your own priority logic
                const selectedGame = purpleStatusGames[0];
                soloGameElement.textContent = selectedGame.TITLE || selectedGame.Title || 'Current Quarter Game';              } else if (soloGameElement) {
                soloGameElement.textContent = '-- Select a quarterly game --';
              }
            })
            .catch(error => {
              console.error('Error fetching or processing singleplayer games:', error);
              if (soloGameElement) {
                soloGameElement.textContent = '-- Select a quarterly game --';
              }
            });
        }
      })      .catch(error => {
        console.error('Error fetching or processing selections data:', error);
        const soloGameElement = document.getElementById('current-solo-game');
        if (soloGameElement) {
          soloGameElement.textContent = 'Error loading quarterly game';
        }
        
        const ergoArtSubjectElement = document.getElementById('ergo-art-subject');
        if (ergoArtSubjectElement) {
          ergoArtSubjectElement.textContent = 'Mars'; // Default fallback
        }
      });
    
  } catch (error) {
    console.error("Error in fetchCurrentQuarterSoloGame:", error);
    const soloGameElement = document.getElementById('current-solo-game');
    if (soloGameElement) {
      soloGameElement.textContent = 'Error loading quarterly game';
    }
    
    const ergoArtSubjectElement = document.getElementById('ergo-art-subject');
    if (ergoArtSubjectElement) {
      ergoArtSubjectElement.textContent = 'Mars'; // Default fallback
    }
  }
}

/**
 * Initialize the week management UI controls
 */
function initWeekManagementUI() {
  // Get references to UI elements
  const startNewWeekBtn = document.getElementById('start-new-week');
  const refreshWeekBtn = document.getElementById('refresh-week');
  const weekStartDate = document.getElementById('week-start-date');
  
  if (!startNewWeekBtn || !refreshWeekBtn || !weekStartDate) {
    console.warn('Week management UI elements not found');
    return;
  }
  
  // Update the week start date display
  updateWeekStartDateDisplay();
  
  // Event listener for start new week button
  startNewWeekBtn.addEventListener('click', () => {
    if (typeof WeekTracker !== 'undefined') {
      // Confirm with user
      if (confirm('Are you sure you want to start a new week? This will affect all week-based features.')) {
        try {
          // Start a new week
          const newWeekKey = WeekTracker.startNewWeek();
          
          // Show success message
          showMessage(`New week started successfully! (${newWeekKey})`, 'success');
          
          // Update the UI
          updateWeekStartDateDisplay();
        } catch (error) {
          console.error('Error starting new week:', error);
          showMessage('Error starting new week: ' + error.message, 'error');
        }
      }
    } else {
      showMessage('Week tracker not available', 'error');
    }
  });
  
  // Event listener for refresh week data button
  refreshWeekBtn.addEventListener('click', () => {
    if (typeof WeekTracker !== 'undefined') {
      try {
        // Refresh the week data
        WeekTracker.refreshState();
        
        // Update the UI
        WeekTracker.updateUI();
        updateWeekStartDateDisplay();
        
        // Show success message
        showMessage('Week data refreshed successfully!', 'success');
      } catch (error) {
        console.error('Error refreshing week data:', error);
        showMessage('Error refreshing week data: ' + error.message, 'error');
      }
    } else {
      showMessage('Week tracker not available', 'error');
    }
  });
  
  // Listen for week change events
  document.addEventListener('weekChange', () => {
    // Update the week start date display
    updateWeekStartDateDisplay();
  });
}

/**
 * Update the week start date display
 */
function updateWeekStartDateDisplay() {
  const weekStartDate = document.getElementById('week-start-date');
  if (!weekStartDate) return;
  
  if (typeof WeekTracker !== 'undefined') {
    const weekKey = WeekTracker.getCurrentWeekKey();
    // Create a Date object from the week key, which is in YYYY-MM-DD format
    const date = new Date(weekKey + 'T10:00:00'); // Add T10:00:00 for 10 AM
    
    // Format the date with day and time
    const options = { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    weekStartDate.textContent = date.toLocaleDateString('en-US', options);
  } else {
    weekStartDate.textContent = 'Week tracker not available';
  }
}

/**
 * Show a message to the user
 * @param {string} message - The message to show
 * @param {string} type - The type of message ('success' or 'error')
 */
function showMessage(message, type = 'success') {
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', type);
  messageElement.textContent = message;
  
  // Find admin section
  const adminSection = document.querySelector('.admin-section');
  if (adminSection) {
    // Insert message at the top
    adminSection.insertBefore(messageElement, adminSection.firstChild);
    
    // Remove message after animation completes
    setTimeout(() => {
      messageElement.remove();
    }, 6000); // 3s display + 3s fadeout
  }
}

/**
 * Get the end date for a show formatted as MM/DD with weeks remaining
 * @param {string} type - The type of show (anime, sundayMorning, sundayNight)
 * @param {string} endDate - The end date in ISO format
 * @returns {string} - The formatted end date string with weeks remaining
 */
function getShowEndDateString(type, endDate) {
  try {
    // If we have an endDate from the database, use it
    if (endDate) {
      const dateObj = new Date(endDate);
      if (isNaN(dateObj.getTime())) {
        return ''; // Invalid date
      }

      // Format as MM/DD
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const formattedDate = `${month}/${day}`;
      
      // Calculate weeks remaining
      const now = new Date();
      const diffTime = dateObj.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.ceil(diffDays / 7);
      
      // Format the weeks text
      let weeksText = '';
      if (diffDays <= 0) {
        weeksText = 'Ended';
      } else if (diffWeeks === 1) {
        weeksText = '1 week left';
      } else {
        weeksText = `${diffWeeks} weeks left`;
      }
      
      // Get the correct element ID
      // Convert camelCase to kebab-case and add -end-date
      const elementId = type === 'anime' ? 'anime-end-date' :
                      type === 'sundayMorning' ? 'sunday-morning-end-date' :
                      type === 'sundayNight' ? 'sunday-night-end-date' : null;
      
      // Add a data attribute to the element to mark if it's the last week
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          if (diffWeeks === 1) {
            element.setAttribute('data-final-week', 'true');
          } else {
            element.setAttribute('data-final-week', 'false');
          }
        }
      }
      
      return `${formattedDate} - ${weeksText}`;
    }
    
    // Fallback to showing a generic "End date TBD" message
    return '';
  } catch (error) {
    console.error('Error formatting end date:', error);
    return '';
  }
}
