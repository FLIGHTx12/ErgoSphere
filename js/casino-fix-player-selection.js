// Fix for player selection dropdown issues

// Improved updateLines function with better player selection handling
function updateLines(betNum) {
  const league = safeGetElementValue("league");
  const category = safeGetElementValue(`category${betNum}`);
  const lineSelect = safeGetElement(`line${betNum}`);
  const playerSelect = safeGetElement(`player${betNum}`);
  const betAmountInput = safeGetElement(`betAmount${betNum}`);
  
  console.log(`⚙️ updateLines(${betNum}): league=${league}, category=${category}`);
  
  // Safety check - if lineSelect or playerSelect doesn't exist, we can't continue
  if (!lineSelect) {
    console.error(`Line select #${betNum} not found`);
    return;
  }
  
  if (!playerSelect) {
    console.error(`Player select #${betNum} not found`);
    return;
  }
  
  // Make sure bet amount input is visible when category is selected
  if (category) {
    if (!betAmountInput) {
      // Create bet amount input if it doesn't exist
      const container = lineSelect.parentElement;
      if (container) {
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `betAmount${betNum}`;
        input.className = 'bet-amount';
        input.placeholder = 'Bet Amount';
        input.min = '1';
        container.appendChild(input);
      }
    } else {
      betAmountInput.style.display = 'block';
    }
  }

  // Special handling for ErgoBall and ErgoGolf: only one category 'LINES'
  if ((league === 'ErgoBall' || league === 'ErgoGolf') && category === 'LINES') {
    const lines = teamsData[league]?.categories.LINES;
    if (lines) {
      lineSelect.innerHTML = '<option value="">Select Line</option>';
      lines.forEach((line, idx) => {
        lineSelect.innerHTML += `<option value="${idx}">[${line.value}] ${line.text}</option>`;
      });
    }
    // Show description below dropdown when a line is selected
    lineSelect.onchange = function() {
      const idx = parseInt(this.value, 10);
      const descDiv = safeGetElement(`line-desc${betNum}`);
      if (descDiv) {
        if (!isNaN(idx) && lines[idx]) {
          descDiv.style.display = '';
          descDiv.innerHTML = `<span class='line-desc'>${lines[idx].desc}</span>`;
        } else {
          descDiv.innerHTML = '';
          descDiv.style.display = 'none';
        }
      }
    };
    // Always hide description div initially
    const descDiv = safeGetElement(`line-desc${betNum}`);
    if (descDiv) descDiv.style.display = 'none';
  } else {
    const lines = teamsData[league]?.categories[category];
    if (lines) {
      lineSelect.innerHTML = '<option value="">Select Line</option>';
      lines.forEach((line, idx) => {
        lineSelect.innerHTML += `<option value="${line.value}">[${line.value}] ${line.text}</option>`;
      });
      // Hide description div for NFL, NBA, WNBA      
      const descDiv = safeGetElement(`line-desc${betNum}`);
      if (descDiv) descDiv.style.display = 'none';
      lineSelect.onchange = null;
    } else {
      lineSelect.innerHTML = '<option value="">Select Line</option>';      
      const descDiv = safeGetElement(`line-desc${betNum}`);
      if (descDiv) descDiv.style.display = 'none';
    }
  }

  // For INDIVIDUAL and STAT_HUNTING, require player selection; otherwise, set to N/A.
  console.log(`Updating player dropdown for: league=${league}, category=${category}`);
  
  // Always clear the player select first
  playerSelect.innerHTML = '<option value="">Select Player</option>';
  
  if (["INDIVIDUAL", "STAT_HUNTING"].includes(category) && teamsData[league]?.players) {
    console.log(`Populating ${teamsData[league].players.length} players for ${category} in ${league}`);
    
    // Populate players for this league
    teamsData[league].players.forEach(player => {
      const option = document.createElement('option');
      option.value = player;
      option.textContent = player;
      playerSelect.appendChild(option);
    });
    
  } else if ((league === 'ErgoBall' || league === 'ErgoGolf') && category === 'LINES') {
    console.log(`Populating ${teamsData[league].players.length} players for ${league}`);
    
    // Populate players for ErgoBall or ErgoGolf
    teamsData[league].players.forEach(player => {
      const option = document.createElement('option');
      option.value = player;
      option.textContent = player;
      playerSelect.appendChild(option);
    });
    
  } else {
    // For other categories, set to N/A
    playerSelect.innerHTML = '<option value="N/A">N/A</option>';
    console.log(`Set player selection to N/A for ${category} in ${league}`);
  }
  
  console.log(`Player select now has ${playerSelect.options.length} options`);
}

// Improved resetBetInputs function that properly resets player selections
function resetBetInputs() {
  console.log("🧹 Resetting bet inputs");
  
  // Reset team selects
  const awayTeamEl = safeGetElement("awayTeam");
  const homeTeamEl = safeGetElement("homeTeam");
  
  if (awayTeamEl) awayTeamEl.innerHTML = '<option value="">Away Team</option>';
  if (homeTeamEl) homeTeamEl.innerHTML = '<option value="">Home Team</option>';
  
  // Reset bet entries
  for (let i = 1; i <= 3; i++) {
    const categoryEl = safeGetElement(`category${i}`);
    const lineEl = safeGetElement(`line${i}`);
    const playerEl = safeGetElement(`player${i}`);
    
    if (categoryEl) categoryEl.innerHTML = '<option value="">Select Category</option>';
    if (lineEl) lineEl.innerHTML = '<option value="">Select Line</option>';
    if (playerEl) playerEl.innerHTML = '<option value="">Select Player</option>';
    
    // Remove bet amount input if present
    const betAmountInput = safeGetElement(`betAmount${i}`);
    if (betAmountInput && betAmountInput.parentElement) {
      betAmountInput.value = "";
      betAmountInput.style.display = 'none';
    }
    
    // Hide line description
    const descDiv = safeGetElement(`line-desc${i}`);
    if (descDiv) {
      descDiv.innerHTML = '';
      descDiv.style.display = 'none';
    }
  }
}

// Fix for the TypeError: betId.startsWith is not a function
// This is a monkey patch for any function that uses betId.startsWith
const originalCreatePayoutReceipt = window.createPayoutReceipt;
function fixedCreatePayoutReceipt(bet) {
  try {
    // Handle different data formats for local vs. database bets
    const betId = bet.id;
    const isLocal = betId && typeof betId === 'string' && betId.startsWith('local-');
    
    // Store this safely on the bet object to avoid the type error later
    bet._isLocal = isLocal;
    
    // Call the original function with our safely processed bet object
    return originalCreatePayoutReceipt(bet);
  } catch (error) {
    console.error("Error in createPayoutReceipt:", error);
    alert("There was an error creating the payout receipt. Please try again.");
  }
}

// Override the original functions on document load
document.addEventListener('DOMContentLoaded', function() {
  console.log("🔧 Installing casino.js fixes");
  
  // Override the updateLines function
  window.updateLines = updateLines;
  
  // Override the resetBetInputs function
  window.resetBetInputs = resetBetInputs;
  
  // Fix the TypeError: betId.startsWith issue
  if (window.createPayoutReceipt) {
    window.createPayoutReceipt = fixedCreatePayoutReceipt;
  }
  
  console.log("✅ Casino.js fixes installed");
});
