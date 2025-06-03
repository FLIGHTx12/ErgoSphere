// Test script for adjustHealthByQuarter function
// This script will test the health adjustment for each quarter

console.log("===== Testing Health Adjustment Function =====");

// Simulate each quarter to see health adjustments
const baseHealth = 1000;
const quarters = [1, 2, 3, 4];

// Mock WeekTracker for testing
const originalWeekTracker = window.WeekTracker;
const mockWeekTracker = {
  getCurrentQuarter: function() { 
    return this._quarter; 
  },
  _quarter: 1,
  init: function() {}
};

quarters.forEach(quarter => {
  console.log(`Testing Quarter ${quarter}:`);
  
  // Set the mock WeekTracker to return the current quarter
  window.WeekTracker = mockWeekTracker;
  mockWeekTracker._quarter = quarter;
  
  // Test the health adjustment function
  const adjustedHealth = adjustHealthByQuarter(baseHealth);
  
  console.log(`- Base Health: ${baseHealth}`);
  console.log(`- Adjusted Health: ${adjustedHealth}`);
  console.log(`- Expected Multiplier: ${quarter === 1 ? 1.0 : quarter === 2 ? 1.25 : quarter === 3 ? 1.5 : 1.75}`);
  console.log(`- Actual Multiplier: ${adjustedHealth / baseHealth}`);
  console.log(`- Working Correctly: ${adjustedHealth === Math.floor(baseHealth * (quarter === 1 ? 1.0 : quarter === 2 ? 1.25 : quarter === 3 ? 1.5 : 1.75)) ? '✅ Yes' : '❌ No'}`);
  console.log("------------------------------");
});

// Restore the original WeekTracker
window.WeekTracker = originalWeekTracker;

console.log("===== Test Complete =====");
