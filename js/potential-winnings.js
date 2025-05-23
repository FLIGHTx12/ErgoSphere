/**
 * Potential Winnings Calculator for Casino Betting System
 * This script adds real-time potential winnings calculation display
 * as users type in their bet amounts.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Listen for bet amount changes throughout the document using event delegation
  document.addEventListener('input', handleBetAmountInput);
  
  // Also handle any initial setup needed for existing bet amounts
  setupExistingBetAmounts();
});

/**
 * Sets up winnings display for any existing bet amount inputs
 */
function setupExistingBetAmounts() {
  const betAmountInputs = document.querySelectorAll('.bet-amount');
  betAmountInputs.forEach(input => {
    if (input.value) {
      calculateAndDisplayWinnings(input);
    }
    
    // Create winnings display element if it doesn't exist
    ensureWinningsDisplay(input);
  });
}

/**
 * Handles input events on bet amount fields
 */
function handleBetAmountInput(event) {
  // Check if the event target is a bet amount input
  if (event.target.classList.contains('bet-amount')) {
    calculateAndDisplayWinnings(event.target);
  }
}

/**
 * Calculates and displays potential winnings for a bet amount input
 */
function calculateAndDisplayWinnings(betAmountInput) {
  // Get the bet number from the input ID
  const betNum = betAmountInput.id.replace('betAmount', '');
  const betAmount = parseInt(betAmountInput.value, 10);
  
  // Get the necessary elements
  const lineSelect = document.getElementById(`line${betNum}`);
  const playerSelect = document.getElementById(`player${betNum}`);
  const categorySelect = document.getElementById(`category${betNum}`);
  
  if (!lineSelect || !categorySelect) return;
  
  // Get values from selections
  const league = safeGetElementValue("league");
  const category = categorySelect.value;
  const riskLevel = lineSelect.value;
  const player = playerSelect?.value;
  
  // Ensure the winnings display element exists
  const winningsDisplay = ensureWinningsDisplay(betAmountInput);

  // If bet amount is invalid, hide the display
  if (isNaN(betAmount) || betAmount <= 0) {
    winningsDisplay.style.display = 'none';
    return;
  }
  
  // Calculate potential winnings
  
  // Get payout rate based on risk level
  let payoutRate = 0;
  
  // For ErgoBall/ErgoGolf, riskLevel is index, so get value from lineObj
  if ((league === 'ErgoBall' || league === 'ErgoGolf') && category === 'LINES') {
    const idx = parseInt(riskLevel, 10);
    if (!isNaN(idx) && teamsData[league]?.categories?.LINES?.[idx]) {
      const lineObj = teamsData[league].categories.LINES[idx];
      payoutRate = riskPayouts[lineObj.value];
    }
  } else {
    // For other leagues
    payoutRate = riskPayouts[riskLevel];
  }

  // Apply 9% boost if player does not have a ⭐ in front of their name
  let playerBoost = 1;
  let hasRolePlayerBoost = false;
  
  if (
    player && 
    player !== 'N/A' && 
    typeof player === 'string' &&
    !player.trim().startsWith('⭐')
  ) {
    playerBoost = 1.09; // 9% boost
    hasRolePlayerBoost = true;
  }

  // If we can't calculate payouts yet, hide the display
  if (!payoutRate) {
    winningsDisplay.style.display = 'none';
    return;
  }

  // Calculate potential win amount
  const potentialWin = Math.round(betAmount * payoutRate * playerBoost);
  const totalReturn = betAmount + potentialWin;

  // Update the display
  winningsDisplay.innerHTML = `
    Potential Win: <span class="win-amount">${potentialWin} 💷</span>
    <br>Total Return: <span class="total-return">${totalReturn} 💷</span>
    ${hasRolePlayerBoost ? '<br><span class="role-player-boost">(+9% Role Player Boost)</span>' : ''}
  `;
  winningsDisplay.style.display = 'block';
}

/**
 * Ensures the winnings display element exists for a bet amount input
 * @returns The winnings display element
 */
function ensureWinningsDisplay(betAmountInput) {
  // Check if the winnings display already exists
  const existingDisplay = betAmountInput.nextElementSibling;
  if (existingDisplay && existingDisplay.classList.contains('potential-winnings-display')) {
    return existingDisplay;
  }
  
  // Create the winnings display element if it doesn't exist
  const winningsDisplay = document.createElement('div');
  winningsDisplay.className = 'potential-winnings-display';
  winningsDisplay.style.display = 'none'; // Initially hidden
  
  // Insert after the bet amount input
  if (betAmountInput.nextSibling) {
    betAmountInput.parentNode.insertBefore(winningsDisplay, betAmountInput.nextSibling);
  } else {
    betAmountInput.parentNode.appendChild(winningsDisplay);
  }
  
  return winningsDisplay;
}

// Helper function to safely get element value
function safeGetElementValue(id) {
  const element = document.getElementById(id);
  return element ? element.value : '';
}

// Helper function to safely get element
function safeGetElement(id) {
  return document.getElementById(id);
}
