/**
 * Universal Week Tracker
 * This module provides functionality for tracking weeks that start on Sunday at 10:00 AM.
 * It includes functions to get the current week, start a new week, and handle quarter calculations.
 */

const WeekTracker = (function() {
  // Week start time (Sunday at 10:00 AM)
  const WEEK_START_DAY = 0; // Sunday
  const WEEK_START_HOUR = 10; // 10:00 AM
  
  // Private state
  let currentWeekKey = null;
  let currentWeekNumber = null;
  let currentQuarter = null;
  
  /**
   * Gets the start date (Sunday 10:00 AM) for the current week
   * @returns {Date} The Date object representing the start of the current week
   */
  function getCurrentWeekStart() {
    const now = new Date();
    
    // Get this week's Sunday
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay());
    
    // Set to 10:00 AM
    sunday.setHours(WEEK_START_HOUR, 0, 0, 0);
    
    // If current time is before Sunday 10:00 AM, use previous week's Sunday
    if (now < sunday) {
      sunday.setDate(sunday.getDate() - 7);
    }
    
    return sunday;
  }
  
  /**
   * Gets the key for the current week in YYYY-MM-DD format
   * Represents Sunday at 10:00 AM of the current week
   * @returns {string} Week key in YYYY-MM-DD format
   */
  function getCurrentWeekKey() {
    const weekStart = getCurrentWeekStart();
    return weekStart.toISOString().slice(0, 10);
  }
  
  /**
   * Calculate the ISO week number for the current date
   * @returns {number} Current week number (1-53)
   */
  function getCurrentWeekNumber() {
    const now = new Date();
    const weekStart = getCurrentWeekStart();
    
    // Create a new date object for the first day of the year
    const firstDayOfYear = new Date(weekStart.getFullYear(), 0, 1);
    
    // Calculate the number of days since the first day of the year
    const daysSinceFirstDay = Math.floor((weekStart - firstDayOfYear) / (24 * 60 * 60 * 1000));
    
    // Calculate the week number
    return Math.ceil((daysSinceFirstDay + firstDayOfYear.getDay() + 1) / 7);
  }
  
  /**
   * Calculate which quarter the current date falls into
   * @returns {number} Current quarter (1-4)
   */
  function getCurrentQuarter() {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    
    if (month < 3) return 1;      // Q1: Jan-Mar
    else if (month < 6) return 2; // Q2: Apr-Jun
    else if (month < 9) return 3; // Q3: Jul-Sep
    else return 4;                // Q4: Oct-Dec
  }
  
  /**
   * Calculate the end date of the current quarter
   * @returns {Date} Date object representing the end of the current quarter
   */
  function getCurrentQuarterEnd() {
    const now = new Date();
    const currentYear = now.getFullYear();
    let quarterEndMonth;
    
    switch (getCurrentQuarter()) {
      case 1: quarterEndMonth = 2; break;  // End of March
      case 2: quarterEndMonth = 5; break;  // End of June
      case 3: quarterEndMonth = 8; break;  // End of September
      case 4: quarterEndMonth = 11; break; // End of December
    }
    
    // Set the last day of the quarter
    const quarterEndDay = new Date(currentYear, quarterEndMonth + 1, 0).getDate();
    return new Date(currentYear, quarterEndMonth, quarterEndDay, 23, 59, 59);
  }
  
  /**
   * Calculate the start date of the next quarter
   * @returns {Date} Date object representing the start of the next quarter
   */
  function getNextQuarterStart() {
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
  
  /**
   * Force the start of a new week, regardless of the current date
   * This can be used for manual week rollovers
   * @returns {string} The new week key
   */
  function startNewWeek() {
    // Get the next Sunday
    const now = new Date();
    const nextSunday = new Date(now);
    const daysToNextSunday = (7 - now.getDay()) % 7;
    
    nextSunday.setDate(now.getDate() + daysToNextSunday);
    nextSunday.setHours(WEEK_START_HOUR, 0, 0, 0);
    
    // If today is Sunday but before 10 AM, use today at 10 AM
    if (daysToNextSunday === 0 && now.getHours() < WEEK_START_HOUR) {
      nextSunday.setDate(now.getDate());
    }
    
    // Update the current week key
    currentWeekKey = nextSunday.toISOString().slice(0, 10);
    
    // Also update week number and quarter
    refreshState();
    
    // Trigger a custom event for week change
    const weekChangeEvent = new CustomEvent('weekChange', { 
      detail: { 
        weekKey: currentWeekKey,
        weekNumber: currentWeekNumber,
        quarter: currentQuarter 
      } 
    });
    
    document.dispatchEvent(weekChangeEvent);
    
    return currentWeekKey;
  }
  
  /**
   * Refresh all state values (week key, number, quarter)
   */
  function refreshState() {
    currentWeekKey = getCurrentWeekKey();
    currentWeekNumber = getCurrentWeekNumber();
    currentQuarter = getCurrentQuarter();
    
    return {
      weekKey: currentWeekKey,
      weekNumber: currentWeekNumber, 
      quarter: currentQuarter
    };
  }
  
  /**
   * Updates any UI elements that display week or quarter information
   * Can be customized per page to update specific elements
   */
  function updateUI() {
    // Make sure state is refreshed
    refreshState();
    
    // Update any elements with class 'week-number'
    const weekElements = document.querySelectorAll('.week-number');
    weekElements.forEach(el => {
      el.textContent = currentWeekNumber;
    });
    
    // Update any elements with class 'quarter-number'
    const quarterElements = document.querySelectorAll('.quarter-number');
    quarterElements.forEach(el => {
      el.textContent = currentQuarter;
    });
    
    // Update any elements with class 'week-key'
    const weekKeyElements = document.querySelectorAll('.week-key');
    weekKeyElements.forEach(el => {
      el.textContent = currentWeekKey;
    });
    
    // Custom event for pages to implement their own UI updates
    const weekUIEvent = new CustomEvent('weekUIUpdate', { 
      detail: { 
        weekKey: currentWeekKey,
        weekNumber: currentWeekNumber,
        quarter: currentQuarter 
      } 
    });
    
    document.dispatchEvent(weekUIEvent);
  }
  
  /**
   * Initialize the week tracker and set up automatic updates
   */
  function init() {
    // Initialize state
    refreshState();
    
    // Update UI immediately
    updateUI();
    
    // Check for week changes every hour
    setInterval(() => {
      const oldWeekKey = currentWeekKey;
      refreshState();
      
      // If week has changed, update UI
      if (oldWeekKey !== currentWeekKey) {
        updateUI();
        
        // Trigger week change event
        const weekChangeEvent = new CustomEvent('weekChange', { 
          detail: { 
            weekKey: currentWeekKey,
            weekNumber: currentWeekNumber,
            quarter: currentQuarter 
          } 
        });
        
        document.dispatchEvent(weekChangeEvent);
      }
    }, 60 * 60 * 1000); // Check every hour
  }
  
  // Public API
  return {
    init: init,
    getCurrentWeekKey: getCurrentWeekKey,
    getCurrentWeekNumber: getCurrentWeekNumber,
    getCurrentQuarter: getCurrentQuarter,
    startNewWeek: startNewWeek,
    updateUI: updateUI,
    refreshState: refreshState,
    getCurrentQuarterEnd: getCurrentQuarterEnd,
    getNextQuarterStart: getNextQuarterStart
  };
})();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeekTracker;
}
