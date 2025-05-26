// Utility: Safely get element or its value
function safeGetElement(id) {
  return document.getElementById(id);
}

function safeGetElementValue(id, defaultValue = "") {
  const element = document.getElementById(id);
  return element ? element.value : defaultValue;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Load casino data from JSON file first
  await loadCasinoData();

  // Initialize the week tracker if available
  if (typeof WeekTracker !== 'undefined') {
    WeekTracker.init();
    
    // Listen for week change events
    document.addEventListener('weekChange', (event) => {
      console.log('Week changed in casino:', event.detail);
      // Refresh the bet log to reflect the new week
      renderBetLog();
    });
  }
  
  const selectElements = document.querySelectorAll('select');
  const receiptDiv = document.getElementById('receipt');

  if (receiptDiv) {
      receiptDiv.addEventListener('click', captureReceiptScreenshot);
  }
  
  // Prevent errors from script.js trying to initialize countdowns
  if (window.initializeCountdowns) {
    // Store original function
    const originalInitCountdowns = window.initializeCountdowns;
    
    // Override with safe version
    window.initializeCountdowns = function() {
      try {
        // Only run if countdown elements exist
        if (document.querySelector('[data-countdown]')) {
          originalInitCountdowns();
        }
      } catch (error) {
        console.log('Countdown initialization skipped - not needed on this page');
      }
    };
    
    // Also make updateCountdown safe
    if (window.updateCountdown) {
      const originalUpdateCountdown = window.updateCountdown;
      window.updateCountdown = function(element, endTime) {
        if (!element) return;
        originalUpdateCountdown(element, endTime);
      };
    }
    
    // Override updateQuarterCountdown which is failing
    window.updateQuarterCountdown = window.updateQuarterCountdown || function() {
      // Empty mock function
    };
  }
  
  restoreCasinoState();

  document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', saveCasinoState);
  });
});

// Update user and apply styling based on selection
function updateUser() {
  const user = safeGetElementValue("user");
  const leagueSelect = safeGetElement("league");
  const betContainer = safeGetElement("bet-container");
  const receipt = safeGetElement("receipt");

  // Only enable league selection if user is selected and element exists
  if (leagueSelect) {
    leagueSelect.disabled = !user;
  }

  // Apply background image based on user selection
  if (user === "FLIGHTx12!") {
    betContainer.style.backgroundImage = "url('../assets/img/backgrounds/betdivbackgroundgreen.jpg')";
    receipt.style.backgroundImage = "url('../assets/img/backgrounds/betdivbackgroundgreen.jpg')";
  } else if (user === "Jaybers8") {
    betContainer.style.backgroundImage = "url('../assets/img/backgrounds/betdivbackgroundpurp.jpg')";
    receipt.style.backgroundImage = "url('../assets/img/backgrounds/betdivbackgroundpurp.jpg')";
  } else {
    // Reset if no user selected
    betContainer.style.backgroundImage = "";
    receipt.style.backgroundImage = "";
  }

  // If user changes, reset league and all bet inputs
  if (leagueSelect.value) {
    leagueSelect.value = "";
    resetBetInputs();
  }
  
  saveCasinoState();
}

// Save Casino state to localStorage
function saveCasinoState() {
  const state = {};

  // Save select values
  document.querySelectorAll('select').forEach(select => {
    state[select.id || select.name] = select.value;
  });

  localStorage.setItem('casinoState', JSON.stringify(state));
}

// Restore Casino state from localStorage
function restoreCasinoState() {
  const state = JSON.parse(localStorage.getItem('casinoState')) || {};

  // First restore user selection
  const userSelect = document.getElementById('user');
  if (userSelect && state.user) {
    userSelect.value = state.user;
    updateUser(); // Apply user styles
  }

  // Then restore other selections
  Object.keys(state).forEach(key => {
    if (key !== 'user') { // Skip user as we already handled it
      const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
      if (element) {
        element.value = state[key];
      }
    }
  });
}

// Global variables to hold casino data
let teams = {};
let teamsData = {};

// Load casino data from JSON file
async function loadCasinoData() {
  try {
    const response = await fetch('../data/casino-data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Set teams data
    teams = data.teams;
    
    // Helper function to convert structured players to string format for compatibility
    function convertPlayersToStringFormat(structuredPlayers) {
      const players = [];
      structuredPlayers.forEach(categoryGroup => {
        // Add category separator
        players.push(`::::${categoryGroup.category}:::::`);
        // Add players with star prefix if starred
        categoryGroup.players.forEach(player => {
          const playerName = player.starred ? `⭐${player.name}` : player.name;
          players.push(playerName);
        });
      });
      return players;
    }
    
    // Set up league data with shared basketball categories for NBA and WNBA
    teamsData = {
      NFL: {
        teams: teams.nfl,
        categories: data.leagueData.NFL.categories,
        players: convertPlayersToStringFormat(data.leagueData.NFL.players)
      },
      WNBA: {
        teams: teams.wnba,
        categories: data.basketballCategories, // Shared basketball categories
        players: convertPlayersToStringFormat(data.leagueData.WNBA.players)
      },
      NBA: {
        teams: teams.nba,
        categories: data.basketballCategories, // Shared basketball categories
        players: convertPlayersToStringFormat(data.leagueData.NBA.players)
      },
      ErgoBall: {
        teams: teams.ergoball,
        categories: data.leagueData.ErgoBall.categories,
        players: data.leagueData.ErgoBall.players
      },
      ErgoGolf: {
        teams: teams.ergogolf,
        categories: data.leagueData.ErgoGolf.categories,
        players: data.leagueData.ErgoGolf.players
      }
    };
    
    console.log('Casino data loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load casino data:', error);
    // Fallback to prevent breaking the site
    teams = { nfl: [], nba: [], wnba: [], ergoball: [], ergogolf: [] };
    teamsData = {};
    return false;
  }
}

// Define risk percentages
const riskPayouts = {
  "Low": 0.3,    // 30% payout
  "Medium": 0.6, // 60% payout
  "High": 0.9,   // 90% payout
  "Extreme": 1.9 // 190% payout
};

function updateBets() {
  const user = safeGetElementValue("user");
  const league = safeGetElementValue("league");
  const bettingSystem = safeGetElement("betting-system");
  
  // If no user is selected, prompt to select user first
  if (!user) {
    alert("Please select a user first.");
    const leagueSelect = safeGetElement("league");
    if (leagueSelect) {
      leagueSelect.value = "";
    }
    return;
  }

  const categories = teamsData[league]?.categories;
  const players = teamsData[league]?.players;
  const leagueTeams = teamsData[league]?.teams || [];

  // Remove all league-specific classes
  bettingSystem.classList.remove('nfl', 'wnba', 'nba');
  
  // Add the appropriate league class
  if (league) {
    bettingSystem.classList.add(league.toLowerCase());
  }

  let backgroundColor;
  if (league === "NFL") backgroundColor = "#FFC62F";
  else if (league === "WNBA") backgroundColor = "#0C2340";
  else if (league === "NBA") backgroundColor = "#236192";

  const selectElements = document.querySelectorAll('select');
  selectElements.forEach(select => {
      select.style.backgroundColor = backgroundColor;
      if (league === "WNBA") {
          select.classList.add('wnba');
      } else {
          select.classList.remove('wnba');
      }
  });

  // Reset all bet-related dropdowns and inputs when league changes
  resetBetInputs();

  const awayTeamSelect = document.getElementById("awayTeam");
  const homeTeamSelect = document.getElementById("homeTeam");
  awayTeamSelect.innerHTML = '<option value="">Away Team</option>';
  homeTeamSelect.innerHTML = '<option value="">Home Team</option>';

  leagueTeams.forEach(team => {
      // Handle both old string format and new object format
      const teamName = typeof team === 'string' ? team : team.name;
      awayTeamSelect.innerHTML += `<option value="${teamName}">${teamName}</option>`;
      homeTeamSelect.innerHTML += `<option value="${teamName}">${teamName}</option>`;
  });

  if (categories) {
      for (let i = 1; i <= 3; i++) {
          const categorySelect = document.getElementById(`category${i}`);
          categorySelect.innerHTML = '<option value="">Select Category</option>';
          Object.keys(categories).forEach(category => {
              categorySelect.innerHTML += `<option value="${category}">${category}</option>`;
          });
      }
  }
}

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
        
        // Add event listener for real-time calculation
        input.addEventListener('input', function() {
          // If we have the potential-winnings.js script, it will handle this
          // This is just a fallback in case the separate script isn't loaded
          if (typeof calculateAndDisplayWinnings === 'function') {
            calculateAndDisplayWinnings(this);
          }
        });
        
        container.appendChild(input);
        
        // Create potential winnings display
        if (typeof ensureWinningsDisplay === 'function') {
          ensureWinningsDisplay(input);
        }
      }
    } else {
      betAmountInput.style.display = 'block';
      
      // Ensure winnings display exists when showing the input
      if (typeof ensureWinningsDisplay === 'function') {
        ensureWinningsDisplay(betAmountInput);
      }
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
      
      // Recalculate potential winnings if bet amount exists
      const betAmountInput = safeGetElement(`betAmount${betNum}`);
      if (betAmountInput && betAmountInput.value && typeof calculateAndDisplayWinnings === 'function') {
        calculateAndDisplayWinnings(betAmountInput);
      }
    };
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
      
      // Add onchange handler for recalculating potential winnings
      lineSelect.onchange = function() {
        const betAmountInput = safeGetElement(`betAmount${betNum}`);
        if (betAmountInput && betAmountInput.value && typeof calculateAndDisplayWinnings === 'function') {
          calculateAndDisplayWinnings(betAmountInput);
        }
      };
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
  
  // Add onchange handler for player select to recalculate potential winnings
  playerSelect.onchange = function() {
    const betAmountInput = safeGetElement(`betAmount${betNum}`);
    if (betAmountInput && betAmountInput.value && typeof calculateAndDisplayWinnings === 'function') {
      calculateAndDisplayWinnings(betAmountInput);
    }
  };
  
  console.log(`Player select now has ${playerSelect.options.length} options`);
}

async function submitBets() {
  const league = safeGetElementValue("league");
  const awayTeam = safeGetElementValue("awayTeam");
  const homeTeam = safeGetElementValue("homeTeam");
  let bets = [];
  let totalBetAmount = 0;
  let totalPotentialWinnings = 0;
  for (let i = 1; i <= 3; i++) {
    const category = safeGetElementValue(`category${i}`);
    const lineSelect = safeGetElement(`line${i}`);
    if (!lineSelect) continue; // Skip this iteration if lineSelect is null
    
    const riskLevel = lineSelect.value; // This is now "Low", "Medium", or "High"
    const betText = lineSelect.options[lineSelect.selectedIndex]?.text || '';
    const player = safeGetElementValue(`player${i}`);
    const betAmountInput = safeGetElement(`betAmount${i}`);
    let betDesc = '';

    // For ErgoBall/ErgoGolf, get description from teamsData
    if ((league === 'ErgoBall' || league === 'ErgoGolf') && category === 'LINES' && riskLevel !== '') {
      const idx = parseInt(riskLevel, 10);
      const lineObj = teamsData[league].categories.LINES[idx];
      if (lineObj) betDesc = lineObj.desc;
    }
    // For other leagues, try to get description if present
    // (future-proof: if desc is added to other leagues)

    // Validate player selection for INDIVIDUAL and STAT_HUNTING categories.
    if (["INDIVIDUAL", "STAT_HUNTING"].includes(category) && !player) {
      alert("Please select a player for bet " + i);
      return;
    }
    
    // Validate bet amount
    if (riskLevel && betAmountInput) {
      const betAmount = parseInt(betAmountInput.value, 10);
      if (isNaN(betAmount) || betAmount <= 0) {
        alert("Please enter a valid bet amount for bet " + i);
        return;
      }
      
      // Calculate potential winnings based on risk level
      let payoutRate = riskPayouts[riskLevel];
      // For ErgoBall/ErgoGolf, riskLevel is index, so get value from lineObj
      if ((league === 'ErgoBall' || league === 'ErgoGolf') && category === 'LINES') {
        const idx = parseInt(riskLevel, 10);
        const lineObj = teamsData[league].categories.LINES[idx];
        payoutRate = riskPayouts[lineObj.value];
      }

      // Apply 9% boost if player does not have a ⭐ in front of their name and is not N/A or empty
      let playerBoost = 1;
      let rolePlayerBoost = false;      if (
        player &&
        player !== 'N/A' &&
        typeof player === 'string' &&
        !player.trim().startsWith('⭐')
      ) {
        playerBoost = 1.09;
        rolePlayerBoost = true;
      }

      if (!payoutRate) continue;
      const potentialWin = Math.round(betAmount * payoutRate * playerBoost);
      totalBetAmount += betAmount;
      totalPotentialWinnings += potentialWin;
      // Clean up the bet text to remove the risk level prefix
      const cleanBetText = betText.replace(/\[Low\]|\[Medium\]|\[High\]|\[Extreme\]/g, '').replace(/\(Extreme\)/g, '').trim();
      bets.push({ 
        betText: cleanBetText, 
        player: player !== 'N/A' ? player : '',
        betAmount,
        potentialWin,
        riskLevel,
        betDesc,
        rolePlayerBoost
      });
    }
  }

  if (league && awayTeam && homeTeam && bets.length > 0) {
    const betLines = bets.map(bet => {
      const totalWinAmount = bet.betAmount + bet.potentialWin;
      return `<div class="bet-line">${bet.betText} : ${bet.player}${
        bet.rolePlayerBoost ? ' <span style="color:#FFD700;font-weight:bold;">(Role Player +9%)</span>' : ''
      }<br><small><em>${bet.betDesc ? bet.betDesc : ''}</em></small><br>(${bet.betAmount}/${totalWinAmount} 💷)</div>`;
    }).join("");
      const receiptContent = `
      <div class="matchup">
        <span style="${styleTeamName(league, awayTeam)}">${awayTeam}</span><br>@<br><span style="${styleTeamName(league, homeTeam)}">${homeTeam}</span>
      </div>
      ${betLines}
      <div class="wager-total">Wager: ${totalBetAmount} 💷</div>
      <div class="potential-winnings">Potential Win: ${totalPotentialWinnings} 💷</div>
      <div class="actual-winnings">PAYOUT: ____________ 💷</div>    `;
    const receiptContentEl = safeGetElement("receipt-content");
    if (receiptContentEl) {
      receiptContentEl.innerHTML = receiptContent;
    }
    
    // Log bet to localStorage and database
    const userName = safeGetElementValue("user");
    await logSubmittedBet({
      date: new Date().toLocaleString(),
      league,
      awayTeam,
      homeTeam,
      bets,
      user_name: userName // Add userName to the bet object
    });

    await renderBetLog();
  } else {
    alert("Please complete at least one bet before submitting.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const receiptDiv = document.getElementById('receipt');
  if (receiptDiv) {
      receiptDiv.addEventListener('click', captureReceiptScreenshot);
  }
    // Initialize bet log
  renderBetLog().catch(error => {
    console.error('Error rendering bet log:', error);
  });
  
  // Initialize casino sync manager for real-time updates
  if (window.CasinoSyncManager) {
    window.casinoSyncManager = new CasinoSyncManager();
    window.casinoSyncManager.connect();
  }
});

function captureReceiptScreenshot() {
  const receiptElement = document.getElementById('receipt');
  
  // Add a class to ensure content is visible during capture
  receiptElement.classList.add('capturing');
  
  // Store original styles
  const originalStyles = {
    backgroundImage: receiptElement.style.backgroundImage,
    backgroundColor: receiptElement.style.backgroundColor,
    height: receiptElement.style.height,
    maxHeight: receiptElement.style.maxHeight,
    overflow: receiptElement.style.overflow
  };
  
  // Calculate the full height of the content
  const contentElement = document.getElementById('receipt-content');
  const contentHeight = contentElement ? contentElement.scrollHeight : receiptElement.scrollHeight;
  
  // Ensure the element shows its full height during capture
  receiptElement.style.height = contentHeight + 'px';
  receiptElement.style.maxHeight = 'none';
  receiptElement.style.overflow = 'visible';
  
  // Force background styling to be visible
  if (!receiptElement.style.backgroundImage || receiptElement.style.backgroundImage === 'none') {
    const computedStyle = getComputedStyle(receiptElement);
    if (computedStyle.backgroundImage !== 'none') {
      receiptElement.style.backgroundImage = computedStyle.backgroundImage;
      receiptElement.style.backgroundSize = computedStyle.backgroundSize;
      receiptElement.style.backgroundPosition = computedStyle.backgroundPosition;
    } else {
      // User-specific backgrounds based on currently selected user
      const currentUser = document.getElementById('user')?.value;
      if (currentUser === "FLIGHTx12!") {
        receiptElement.style.backgroundImage = "url('../assets/img/backgrounds/betdivbackgroundgreen.jpg')";
      } else if (currentUser === "Jaybers8") {
        receiptElement.style.backgroundImage = "url('../assets/img/backgrounds/betdivbackgroundpurp.jpg')";
      }
      receiptElement.style.backgroundSize = 'cover';
      receiptElement.style.backgroundPosition = 'center';
    }
  }
  
  // Make sure receipt has a solid background color as fallback
  receiptElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  
  // Preload background image to ensure it's fully rendered before capture
  const bgUrl = receiptElement.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
  if (bgUrl && bgUrl !== 'none') {
    const img = new Image();
    img.src = bgUrl.replace(/["']/g, ''); // Clean quotes if present
    img.onload = () => captureWithHtml2Canvas(); // Capture once image is loaded
    img.onerror = () => { // If image fails to load, capture anyway
        console.error("Failed to load background image for screenshot, capturing without it.");
        captureWithHtml2Canvas();
    };
  } else {
    captureWithHtml2Canvas(); // No background image, capture right away
  }
  
  function captureWithHtml2Canvas() {
    // Add slight delay to ensure styles are applied
    setTimeout(() => {
      html2canvas(receiptElement, { 
        useCORS: true, 
        allowTaint: true,
        backgroundColor: null, // Keep it transparent to preserve background
        logging: false,
        scale: 2, // Higher quality
        width: receiptElement.offsetWidth,
        height: contentHeight,
        onclone: function(clonedDoc) {
          const clonedElement = clonedDoc.getElementById(receiptElement.id);
          if (clonedElement) {
            const computedStyles = getComputedStyle(receiptElement);
            clonedElement.style.backgroundImage = computedStyles.backgroundImage;
            clonedElement.style.backgroundSize = computedStyles.backgroundSize;
            clonedElement.style.backgroundPosition = computedStyles.backgroundPosition;
            clonedElement.style.backgroundRepeat = computedStyles.backgroundRepeat;

            if (computedStyles.backgroundImage && computedStyles.backgroundImage !== 'none') {
              clonedElement.style.backgroundColor = 'transparent'; // Ensure canvas background (null) is used
            } else {
              clonedElement.style.backgroundColor = computedStyles.backgroundColor;
            }
          }
        }
      }).then(canvas => {
        // Restore original styles
        receiptElement.classList.remove('capturing');
        receiptElement.style.backgroundImage = originalStyles.backgroundImage;
        receiptElement.style.backgroundColor = originalStyles.backgroundColor;
        receiptElement.style.height = originalStyles.height;
        receiptElement.style.maxHeight = originalStyles.maxHeight;
        receiptElement.style.overflow = originalStyles.overflow;
        
        canvas.toBlob(blob => {
          if (navigator.clipboard && navigator.clipboard.write) {
            navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]).then(() => {
              alert('Receipt screenshot copied to clipboard!');
            }).catch(err => {
              console.error('Failed to copy screenshot:', err);
              fallbackDownload(blob, 'bet-receipt.png');
            });
          } else {
            fallbackDownload(blob, 'bet-receipt.png');
          }
        }, 'image/png', 1.0); // Highest quality PNG
      }).catch(err => {
        console.error('Failed to capture screenshot:', err);
        
        // Restore original styles
        receiptElement.classList.remove('capturing');
        receiptElement.style.backgroundImage = originalStyles.backgroundImage;
        receiptElement.style.backgroundColor = originalStyles.backgroundColor;
        receiptElement.style.height = originalStyles.height;
        receiptElement.style.maxHeight = originalStyles.maxHeight;
        receiptElement.style.overflow = originalStyles.overflow;
        
        alert('Failed to capture screenshot. Please try again or use a browser screenshot tool.');
      });
    }, 150); // Adjusted delay
  }
  
  // Helper function for fallback download (remains unchanged)
  function fallbackDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Receipt saved as image (clipboard access failed).');
  }
}

// Function to create and display the payout receipt
function createPayoutReceipt(bet) {
  // Remove any existing payout receipt
  const existingReceipt = document.querySelector('.payout-receipt');
  if (existingReceipt) {
    existingReceipt.remove();
  }
    // Handle different data formats for local vs. database bets
  const isLocal = bet.id && typeof bet.id.toString === 'function' && bet.id.toString().startsWith('local-');
  const betData = isLocal ? bet.bet_data : bet.bet_data;
  const betStatus = bet.bet_status || {};
  const payoutData = bet.payout_data || {};
  
  // Create payout receipt element
  const receiptDiv = document.createElement('div');
  receiptDiv.className = 'payout-receipt glass-effect';
  
  // Determine which user's styling to use
  let userClass = '';
  if (bet.user_name === "FLIGHTx12!") {
    userClass = 'user-flight';
    receiptDiv.style.backgroundImage = "url('../assets/img/backgrounds/betdivbackgroundgreen.jpg')";
  } else if (bet.user_name === "Jaybers8") {
    userClass = 'user-jaybers';
    receiptDiv.style.backgroundImage = "url('../assets/img/backgrounds/betdivbackgroundpurp.jpg')";
  }
  
  // Add user class
  if (userClass) {
    receiptDiv.classList.add(userClass);
  }
  
  // Format date nicely
  const betDate = new Date(bet.bet_date).toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'short', // Use short month name to save space
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Count wins and calculate payout
  let winsCount = 0;
  let totalWager = 0;
  let totalWinnings = 0;
  let totalReturn = 0; // Add this to track payout including original bet
  let samePlayerBoostApplied = false;
  let samePlayerName = null;
  let samePlayerEligible = false;

  // Check if all bets have the same non-empty player (and at least 3 bets)
  if (betData.bets && betData.bets.length === 3) {
    const playerNames = betData.bets.map(b => (b.player || '').trim());
    if (playerNames[0] && playerNames.every(p => p === playerNames[0])) {
      samePlayerEligible = true;
      samePlayerName = playerNames[0];
    }
  }

  betData.bets.forEach((b, idx) => {
    totalWager += b.betAmount;
    let winAmount = b.potentialWin;
    // Apply 15% boost if all players are the same and this bet is a win
    if (betStatus[idx] === 'won') {
      winsCount++;
      if (samePlayerEligible) {
        winAmount = Math.ceil(winAmount * 1.15); // 15% boost, always round up
        samePlayerBoostApplied = true;
      }
      winAmount = Math.ceil(winAmount); // Always round up to whole number
      totalWinnings += winAmount;
      totalReturn += winAmount + b.betAmount;
    }  });
    // Create receipt HTML with improved structure for mobile visibility
  receiptDiv.innerHTML = `
    <h2>Payout Receipt<button class="payout-receipt-close">&times;</button></h2>
    <div class="receipt-content-wrapper">
      <div class="receipt-user-date"><b>${bet.user_name}</b> | ${betDate}</div>      <div class="matchup">
        <span style="${styleTeamName(betData.league, betData.awayTeam)}">${betData.awayTeam}</span><br>@<br><span style="${styleTeamName(betData.league, betData.homeTeam)}">${betData.homeTeam}</span>
      </div>
      
      <div class="bet-details">
        <h3>Bet Results:</h3>
        <ul>
          ${betData.bets.map((b, idx) => {
            const status = betStatus[idx] || 'pending';
            const statusClass = status === 'won' ? 'bet-won' : status === 'lost' ? 'bet-lost' : '';
            let winAmount = b.potentialWin;
            let boostText = '';
            
            if (status === 'won' && samePlayerEligible) {
              winAmount = Math.ceil(winAmount * 1.15);
              boostText = ' <span class="boost boost-same-player">(+15% Same Player Boost)</span>';
            }
              // Format player name to be shorter if needed
            let playerName = b.player;
            if (playerName && playerName.length > 15) {
              playerName = playerName.substring(0, 13) + '...';
            }              return `
              <li class="${statusClass}">
                <span class="bet-text">${b.betText.trim()} ${playerName ? ': ' + playerName : ''}</span> 
                <span class="bet-status">
                  ${status === 'won' ? `<b>WON</b>` : `<b>${status.toUpperCase()}</b>`}
                  ${status === 'won' ? `<div>(+${winAmount} 💷, Bet: ${b.betAmount} 💷)${boostText}</div>` : ''}
                </span>
              </li>
            `;
          }).join('')}
        </ul>
      </div>
        <div class="payout-summary">        <div class="payout-summary-details">
          <span>Total Wager: ${totalWager} 💷</span>
          <span>Bets Won: ${winsCount} of ${betData.bets.length}</span>
        </div>
        <div class="payout-value">TOTAL PAYOUT: ${Math.ceil(totalReturn)} 💷</div>
        ${samePlayerBoostApplied ? '<div class="boost boost-same-player">Same Player Boost (+15% to win amounts for all bets)</div>' : ''}
      </div>
      
      <button id="copy-payout-receipt" class="copy-receipt-btn">Copy Receipt</button>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(receiptDiv);
  
  // Apply background image AFTER the element is in the DOM with delay for proper rendering
  setTimeout(() => {
    if (bet.user_name === "FLIGHTx12!") {
      receiptDiv.style.backgroundImage = "url('../assets/img/backgrounds/betdivbackgroundgreen.jpg')";
    } else if (bet.user_name === "Jaybers8") {
      receiptDiv.style.backgroundImage = "url('../assets/img/backgrounds/betdivbackgroundpurp.jpg')";
    }
  }, 10);
  
  // Add event listeners
  receiptDiv.querySelector('.payout-receipt-close').addEventListener('click', () => {
    receiptDiv.remove();
  });
  
  receiptDiv.querySelector('#copy-payout-receipt').addEventListener('click', () => {
    capturePayoutReceiptScreenshot(receiptDiv);
  });
}

// Function to capture payout receipt as screenshot
function capturePayoutReceiptScreenshot(receiptElement) {
  // Add a class to ensure content is visible during capture
  receiptElement.classList.add('capturing');
  
  // Show loading state on button if it exists
  const copyButton = receiptElement.querySelector('#copy-payout-receipt');
  if (copyButton) {
    copyButton.classList.add('loading');
    copyButton.textContent = 'Creating image...';
    copyButton.disabled = true;
  }
  
  // Store original styles before modification
  const originalStyles = {
    backgroundImage: receiptElement.style.backgroundImage,
    backgroundColor: receiptElement.style.backgroundColor,
    position: receiptElement.style.position,
    zIndex: receiptElement.style.zIndex,
    boxShadow: receiptElement.style.boxShadow,
    border: receiptElement.style.border,
    maxHeight: receiptElement.style.maxHeight,
    height: receiptElement.style.height,
    overflow: receiptElement.style.overflow,
    transform: receiptElement.style.transform,
    top: receiptElement.style.top,
    left: receiptElement.style.left
  };
  
  // Calculate total height of content
  const contentWrapper = receiptElement.querySelector('.receipt-content-wrapper');
  const contentHeight = contentWrapper ? contentWrapper.scrollHeight : receiptElement.scrollHeight;
  
  // Enhance appearance for screenshot and ensure all content is visible
  receiptElement.style.position = 'fixed';
  receiptElement.style.zIndex = '9999';
  receiptElement.style.boxShadow = '0 0 50px rgba(255, 215, 0, 0.8)';
  receiptElement.style.border = '4px solid gold';
  receiptElement.style.maxHeight = 'none';
  receiptElement.style.height = 'auto';
  receiptElement.style.overflow = 'visible';
  receiptElement.style.transform = 'none';
  receiptElement.style.top = '50%';
  receiptElement.style.left = '50%';  
  // Give browser a moment to render with new styles
  setTimeout(() => {
    // Hide the copy button during screenshot
    if (copyButton) {
      copyButton.style.display = 'none';
    }
      // Find share button if it exists and hide it too
    const shareButton = receiptElement.querySelector('.share-receipt-btn');
    if (shareButton) {
      shareButton.style.display = 'none';
    }
    
    html2canvas(receiptElement, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null, // Allow transparent background for better image quality
      scale: 2, // Balance between quality and performance
      logging: false,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
      scrollX: 0,
      scrollY: 0,
      width: receiptElement.offsetWidth,
      height: receiptElement.scrollHeight, // Use scrollHeight to capture full content
      onclone: function(clonedDoc) {
        const clonedReceipt = clonedDoc.querySelector('.payout-receipt');
        if (clonedReceipt) {
          // Ensure cloned receipt has good dimensions for capture
          clonedReceipt.style.height = 'auto';
          clonedReceipt.style.position = 'absolute';
          clonedReceipt.style.maxHeight = 'none';
          clonedReceipt.style.overflow = 'visible';
          
          // Enhance text visibility for screenshot
          clonedReceipt.querySelectorAll('.bet-details li, .payout-summary, .matchup, .receipt-user-date')
            .forEach(el => {
              el.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.9)';
              el.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
              el.style.borderRadius = '5px';
            });
        }
      }
    }).then(canvas => {
      processCanvas(canvas);
    }).catch(err => {
      console.error('Failed to capture payout receipt:', err);
      alert('Failed to capture payout receipt. Please try again.');
      cleanupAndRestoreStyles();
    });
  }, 100); // Short timeout to ensure styles are applied before capture
  
  // Process the canvas after capture
  function processCanvas(canvas) {
    // Create a cleaner version of the image by drawing to a new canvas
    const cleanCanvas = document.createElement('canvas');
    const ctx = cleanCanvas.getContext('2d');
    
    // Set dimensions to the visible receipt size
    cleanCanvas.width = canvas.width;
    cleanCanvas.height = canvas.height;
    
    // Draw original canvas onto clean canvas
    ctx.drawImage(canvas, 0, 0);
    
    canvas.toBlob(blob => {
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]).then(() => {
        // Success - show feedback
        const successMessage = document.createElement('div');
        successMessage.textContent = '✓ Copied to clipboard!';
        successMessage.style.position = 'absolute';
        successMessage.style.top = '50%';
        successMessage.style.left = '50%';
        successMessage.style.transform = 'translate(-50%, -50%)';
        successMessage.style.backgroundColor = 'rgba(0, 128, 0, 0.8)';
        successMessage.style.color = 'white';
        successMessage.style.padding = '10px 20px';
        successMessage.style.borderRadius = '5px';
        successMessage.style.zIndex = '10000';
        document.body.appendChild(successMessage);
        
        // Remove the success message after 2 seconds
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 2000);
        
        cleanupAndRestoreStyles();
      }).catch(err => {
        console.error('Failed to copy payout receipt:', err);
        
        // Fallback - offer direct download if clipboard fails
        const link = document.createElement('a');
        link.download = 'payout-receipt.png';
        link.href = cleanCanvas.toDataURL('image/png');
        link.click();
        
        alert('Receipt image downloaded (clipboard access failed)');
        cleanupAndRestoreStyles();
      });
    }, 'image/png', 0.95);
  }
  
  function cleanupAndRestoreStyles() {
    // Remove the capturing class
    receiptElement.classList.remove('capturing');
    
    // Restore all original styles
    Object.keys(originalStyles).forEach(key => {
      receiptElement.style[key] = originalStyles[key];
    });
    
    // Show the copy button again
    if (copyButton) {
      copyButton.style.display = '';
      copyButton.classList.remove('loading');
      copyButton.textContent = 'Copy Receipt';
      copyButton.disabled = false;
    }
    
    // Show share button again if it exists
    const shareButton = receiptElement.querySelector('.share-receipt-btn');
    if (shareButton) {
      shareButton.style.display = '';
    }  }
}

// Reset all bet-related dropdowns and inputs (except league)
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

// On page load, always reset league dropdown to default and reset bet inputs
document.addEventListener('DOMContentLoaded', () => {
  // Reset league dropdown and bet inputs on load
  const leagueSelect = document.getElementById('league');
  if (leagueSelect) {
    leagueSelect.selectedIndex = 0; // Set to "Select League"
  }
  resetBetInputs();
});

// Utility: Get current week key (Sunday-Saturday, e.g. "2024-07-07")
function getCurrentWeekKey() {
  // Use WeekTracker if available, otherwise fallback to original implementation
  if (typeof WeekTracker !== 'undefined') {
    return WeekTracker.getCurrentWeekKey();
  }
  
  // Fallback implementation
  const now = new Date();
  // Get Sunday of this week
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  // Format as YYYY-MM-DD
  return sunday.toISOString().slice(0, 10);
}

function getCurrentWeekNumber() {
  // Use WeekTracker if available, otherwise fallback to original implementation
  if (typeof WeekTracker !== 'undefined') {
    return WeekTracker.getCurrentWeekNumber();
  }
  
  // Fallback implementation
  const now = new Date();
  // Create a new date object for the first day of the year
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
  // Calculate the number of days since the first day of the year
  const daysSinceFirstDay = Math.floor((now - firstDayOfYear) / (24 * 60 * 60 * 1000));
  // Calculate the week number
  return Math.ceil((daysSinceFirstDay + firstDayOfYear.getDay() + 1) / 7);
}

// Mock API endpoints to avoid 404 errors
// Add this before the logSubmittedBet function
async function fetchWithFallback(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      return response;
    }
    // If server returns 404, use localStorage fallback
    if (response.status === 404) {
      console.log(`API endpoint not available: ${url} - Using localStorage fallback`);
      return {
        ok: true,
        json: async () => {
          if (url.includes('/api/bets/')) {
            // Return empty array for bet lists
            if (!url.includes('/status') && !url.includes('/payout')) {
              const weekKey = url.split('/').pop().split('?')[0];
              const betLog = JSON.parse(localStorage.getItem('casinoBetLog') || '{}');
              return betLog[weekKey] || [];
            }
            // Return sample bet for single bet requests
            return { success: true };
          }
          return [];
        },
        text: async () => 'Fallback: Operation simulated with localStorage'
      };
    }
    return response;
  } catch (error) {
    console.warn('Network request failed, using localStorage fallback:', error);
    return {
      ok: true,
      json: async () => [],
      text: async () => 'Fallback: Operation simulated with localStorage'
    };
  }
}

// Save submitted bet to both localStorage log and database
async function logSubmittedBet(betObj) {
  const weekKey = getCurrentWeekKey();
  const userName = safeGetElementValue("user");
  
  // Add userName to betObj for localStorage
  betObj.userName = userName;
  
  // Keep local storage for backup/offline functionality
  let betLog = JSON.parse(localStorage.getItem('casinoBetLog') || '{}');
  if (!betLog[weekKey]) betLog[weekKey] = [];
  betLog[weekKey].push(betObj);
  localStorage.setItem('casinoState', JSON.stringify(betObj));
  localStorage.setItem('casinoBetLog', JSON.stringify(betLog));
  
  // Save to database if user is selected (but use fallback if API fails)
  if (userName) {
    try {
      const response = await fetchWithFallback('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userName: userName,
          league: betObj.league,
          awayTeam: betObj.awayTeam,
          homeTeam: betObj.homeTeam,
          weekKey: weekKey,
          betData: betObj
        })
      });
      
      if (!response.ok) {
        console.info('Using localStorage for bet storage (API unavailable)');
      }
    } catch (error) {
      console.info('Using localStorage for bet storage (API error):', error);
    }
  }
  
  // Notify sync manager of the new bet
  if (window.casinoSyncManager) {
    window.casinoSyncManager.notifyBetChange(weekKey);
  }
}

// Render bet log for the current week, with delete buttons for each bet
async function renderBetLog() {
  const weekKey = getCurrentWeekKey();
  const logDiv = safeGetElement('bet-log');
  if (!logDiv) return;

  try {
    // Fetch bets for all users from database for the current week
    let weekBets = [];

    // First try to get all bets for the current week from the database
    const response = await fetchWithFallback(`/api/bets/${weekKey}`);
    if (response.ok) {
      weekBets = await response.json();
    }

    // Always merge with localStorage bets to ensure we have everything
    const betLog = JSON.parse(localStorage.getItem('casinoBetLog') || '{}');
    const localBets = (betLog[weekKey] || []).map((bet, idx) => ({
      ...bet,
      id: `local-${idx}`, // Flag as local storage item
      localIdx: idx, // Keep track of localStorage index
      user_name: bet.userName || document.getElementById("user").value // Ensure we have a user name
    }));

    // Improved deduplication: Create a unique signature for each bet
    const uniqueBets = [];
    const seenSignatures = new Set();

    // Process database bets first (they take priority)
    weekBets.forEach(bet => {
      // Create a signature based on key bet properties
      const signature = createBetSignature(bet);
      seenSignatures.add(signature);
      uniqueBets.push(bet);
    });

    // Then add local bets that aren't duplicates
    localBets.forEach(localBet => {
      const signature = createBetSignature(localBet);
      if (!seenSignatures.has(signature)) {
        seenSignatures.add(signature);
        uniqueBets.push(localBet);
      }
    });

    // Use uniqueBets instead of the combined arrays
    weekBets = uniqueBets;

    // Get the current week number
    const weekNumber = getCurrentWeekNumber();

    if (weekBets.length === 0) {
      logDiv.innerHTML = `<h2>WEEK ${weekNumber} BETS</h2><div class='bet-log-empty'>No bets submitted this week.</div>`;
      return;
    }

    // Sort by date, with newest bets first
    weekBets.sort((a, b) => {
      // For database entries, use bet_date
      const dateA = a.bet_date || a.date;
      const dateB = b.bet_date || b.date;
      return new Date(dateB) - new Date(dateA);
    });    // Continue with existing code...
    logDiv.innerHTML = `
      <h2>WEEK ${weekNumber} BETS</h2>
      <div class="bet-log-controls">
        <button id="sync-bets-btn" class="sync-bet-log-btn casino-action-btn">Sync with Server</button>
        <div class="filter-controls">
          <label for="league-filter">Filter by League:</label>
          <select id="league-filter" class="league-filter-select">
            <option value="">All Leagues</option>
            <option value="NFL">NFL</option>
            <option value="NBA">NBA</option>
            <option value="WNBA">WNBA</option>
            <option value="ErgoBall">ErgoBall</option>
            <option value="ErgoGolf">ErgoGolf</option>
          </select>
        </div>
      </div>
      <div class="bet-log-list">
        ${weekBets.map(bet => {          // Extract bet data from DB format or use as is for localStorage
          const betData = bet.bet_data || bet;
          const betId = bet.id || `local-${bet.localIdx}`;
          const isLocal = betId && typeof betId === 'string' ? betId.startsWith('local-') : false;

          // Format date nicely
          const rawDate = bet.bet_date || bet.date;
          const displayDate = new Date(rawDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          const userName = bet.user_name || document.getElementById("user").value;
          // Determine background class based on user
          let userClass = '';
          if (userName === "FLIGHTx12!") {
            userClass = 'user-flight';
          } else if (userName === "Jaybers8") {
            userClass = 'user-jaybers';
          }            // Check if the bet has status information
            const betStatus = bet.bet_status || {};
            const payoutData = bet.payout_data || {};            return `<div class="bet-log-entry ${userClass}">
            <button class="delete-bet-entry-btn" data-betid="${betId}" data-local="${isLocal}" title="Delete this bet">&times;</button>
            <span class="bet-date">${displayDate}</span> | <span>${betData.league}</span> | <b class="user-name">${userName}</b>
            <br>
            <span>
              <span style="${styleTeamName(betData.league, betData.awayTeam)}">${betData.awayTeam}</span> @ <span style="${styleTeamName(betData.league, betData.homeTeam)}">${betData.homeTeam}</span>
            </span>
            <ul>${betData.bets.map((b, idx) => {
                const betLineStatus = betStatus[idx] || 'pending';
                const statusClass = betLineStatus === 'won' ? 'bet-won' : betLineStatus === 'lost' ? 'bet-lost' : '';
                  return `<li class="${statusClass}">
                  <div class="bet-line-content">
                    ${b.betText} : ${b.player} (${b.betAmount}/${b.potentialWin + b.betAmount} 💷)${b.rolePlayerBoost ? ' <span style="color:#FFD700;font-weight:bold;">(Role Player +9%)</span>' : ''}
                    <span class="bet-status-controls" data-betid="${betId}" data-betindex="${idx}" data-local="${isLocal}">
                      ${betLineStatus === 'pending' ? `
                        <button class="bet-won-btn" title="Mark as won">W</button>
                        <button class="bet-lost-btn" title="Mark as lost">L</button>                      ` : `
                        <span class="bet-status-indicator" title="Click to change status">${betLineStatus.toUpperCase()}</span>
                      `}
                    </span>
                  </div>                </li>`;
              }).join('')}            </ul>
            ${Object.keys(betStatus).length > 0 && Object.values(betStatus).every(s => s !== 'pending') ? `
              <button class="create-payout-receipt-btn" data-betid="${betId}" data-local="${isLocal}" title="Create payout receipt">Create Payout Receipt</button>
            ` : ''}
          </div>`;
        }).join('')}
      </div>
    `;
    // Add event listeners for each delete button
    logDiv.querySelectorAll('.delete-bet-entry-btn').forEach(btn => {
      btn.onclick = async function() {
        const betId = this.getAttribute('data-betid');
        const isLocal = this.getAttribute('data-local') === 'true';
        
        if (confirm("Delete this bet entry? This cannot be undone.")) {
          if (isLocal) {            // Handle local storage deletion
            const localIdx = parseInt(betId.split('-')[1], 10);
            let betLog = JSON.parse(localStorage.getItem('casinoBetLog') || '{}');
            if (betLog[weekKey]) {
              betLog[weekKey].splice(localIdx, 1);
              // If no bets left for the week, remove the week key
              if (betLog[weekKey].length === 0) {
                delete betLog[weekKey];
              }
              localStorage.setItem('casinoBetLog', JSON.stringify(betLog));
              
              // Notify sync manager of bet deletion
              if (window.casinoSyncManager) {
                window.casinoSyncManager.notifyBetChange(weekKey);
              }
            }          } else {
            // Handle database deletion
            try {
              const response = await fetch(`/api/bets/${betId}`, {
                method: 'DELETE'
              });
              
              if (!response.ok) {
                console.error('Failed to delete bet from database:', await response.text());
              } else {
                // Notify sync manager of bet deletion
                if (window.casinoSyncManager) {
                  window.casinoSyncManager.notifyBetChange(weekKey);
                }
              }
            } catch (error) {
              console.error('Error deleting bet from database:', error);
            }
          }
            // Refresh the bet log
          renderBetLog();
        }
      };
    });
    
    // Add event listeners for won/lost buttons
    console.log('Adding event listeners to', logDiv.querySelectorAll('.bet-won-btn, .bet-lost-btn').length, 'buttons');
    logDiv.querySelectorAll('.bet-won-btn, .bet-lost-btn').forEach(btn => {
      btn.onclick = async function() {
        console.log('Button clicked:', this.innerText);
        // Use 'this' instead of 'btn' to correctly identify which button was clicked
        const status = this.classList.contains('bet-won-btn') ? 'won' : 'lost';
        console.log('Status:', status);
        const controlsElement = this.closest('.bet-status-controls');
        console.log('Controls element:', controlsElement);
        const betId = controlsElement ? controlsElement.getAttribute('data-betid') : null;
        const betIndex = controlsElement ? parseInt(controlsElement.getAttribute('data-betindex'), 10) : null;
        const isLocal = controlsElement ? controlsElement.getAttribute('data-local') === 'true' : false;
        console.log('Bet ID:', betId, 'Index:', betIndex, 'Local:', isLocal);
        
        if (!controlsElement) {
          console.error('Could not find .bet-status-controls element');
          return;
        }
        
        try {
          if (isLocal) {
            // Handle local bet status updates
            const weekKey = getCurrentWeekKey();
            const localIdx = parseInt(betId.split('-')[1], 10);
            
            
            // Get current local bets
            let betLog = JSON.parse(localStorage.getItem('casinoBetLog') || '{}');
            if (!betLog[weekKey] || !betLog[weekKey][localIdx]) {
              console.error('Local bet not found');
              return;
            }
            
            // Update bet status
            const localBet = betLog[weekKey][localIdx];
            localBet.betStatus = localBet.betStatus || {};
            localBet.betStatus[betIndex] = status;
            
            // Calculate payout data if all bets have been evaluated
            const bets = localBet.bets || [];
            const currentStatus = localBet.betStatus;
            
            const allEvaluated = bets.every((b, idx) => currentStatus[idx]);
            if (allEvaluated) {
              // Calculate total win amount
              let totalWager = 0;
              let totalWin = 0;
              
              bets.forEach((b, idx) => {
                totalWager += b.betAmount;
                if (currentStatus[idx] === 'won') {
                  totalWin += b.potentialWin;
                }
              });
              
              localBet.payoutData = {
                totalWager,
                totalWin,
                netPayout: totalWin,
                evaluatedAt: new Date().toISOString()
              };
            }
            
            // Save updates to localStorage
            betLog[weekKey][localIdx] = localBet;
            localStorage.setItem('casinoBetLog', JSON.stringify(betLog));
            
            // Notify sync manager of the bet status update
            if (window.casinoSyncManager) {
              window.casinoSyncManager.notifyBetChange(weekKey);
            }
            
            // Refresh bet log
            renderBetLog();
          } else {
            // Handle database bet status updates
            // Get current bet details
            const response = await fetch(`/api/bets/${betId}`);
            if (!response.ok) {
              console.error('Failed to get bet details');
              return;
            }
            
            const bet = await response.json();
            const currentStatus = bet.bet_status || {};
            const bets = bet.bet_data.bets || [];
            
            // Update status for this specific bet line
            currentStatus[betIndex] = status;
            
            // Calculate payout data if all bets have been evaluated
            let payoutData = null;
            const allEvaluated = bets.every((b, idx) => currentStatus[idx]);
            
            if (allEvaluated) {
              // Calculate total win amount
              let totalWager = 0;
              let totalWin = 0;
              
              bets.forEach((b, idx) => {
                totalWager += b.betAmount;
                if (currentStatus[idx] === 'won') {
                  totalWin += b.potentialWin;
                }
              });
              
              payoutData = {
                totalWager,
                totalWin,
                netPayout: totalWin,
                evaluatedAt: new Date().toISOString()
              };
            }
            
            // Update bet status in the database
            const updateResponse = await fetch(`/api/bets/${betId}/status`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                betStatus: currentStatus,
                payoutData
              })
            });
            
            if (!updateResponse.ok) {
              console.error('Failed to update bet status');
              return;
            }
            
            // Notify sync manager of the bet status update
            if (window.casinoSyncManager) {
              window.casinoSyncManager.notifyBetChange(bet.week_key || weekKey);
            }
            
            // Refresh bet log
            renderBetLog();
          }
        } catch (error) {
          console.error('Error updating bet status:', error);
        }
      };
    });
      // Add event listeners for creating payout receipts
    logDiv.querySelectorAll('.create-payout-receipt-btn').forEach(btn => {
      btn.onclick = async function() {
        const betId = this.getAttribute('data-betid');
        const isLocal = this.getAttribute('data-local') === 'true';
        
        try {
          if (isLocal) {
            // Handle local bet payout receipt
            const weekKey = getCurrentWeekKey();
            const localIdx = parseInt(betId.split('-')[1], 10);
            
            // Get current local bets
            let betLog = JSON.parse(localStorage.getItem('casinoBetLog') || '{}');
            if (!betLog[weekKey] || !betLog[weekKey][localIdx]) {
              console.error('Local bet not found');
              return;
            }
            
            // Create a bet object in the same format as the database for createPayoutReceipt
            const localBet = betLog[weekKey][localIdx];
            const formattedBet = {
              id: betId,
              user_name: localBet.userName || document.getElementById("user").value,
              bet_date: localBet.date,
              bet_data: localBet,
              bet_status: localBet.betStatus,
              payout_data: localBet.payoutData
            };
            
            createPayoutReceipt(formattedBet);
          } else {
            // Handle database bet payout receipt
            const response = await fetch(`/api/bets/${betId}/payout`);
            if (!response.ok) {
              console.error('Failed to get payout data');
              return;
            }
            
            const data = await response.json();
            createPayoutReceipt(data.bet);
          }
        } catch (error) {
          console.error('Error creating payout receipt:', error);
        }
      };
    });
    // Add event listener for the new "Sync with Server" button
    const syncBetsBtn = document.getElementById('sync-bets-btn');
    if (syncBetsBtn) {
      syncBetsBtn.onclick = async function() {
        if (window.casinoSyncManager && typeof window.casinoSyncManager.forceSync === 'function') {
          try {
            window.casinoSyncManager.forceSync(); // This will trigger renderBetLog again

            // Show notification
            if (window.casinoSyncManager.showConnectionStatus) {
              window.casinoSyncManager.showConnectionStatus("Bet log sync initiated. View will update.", "success");
            } else {
              alert("Bet log sync initiated. View will update.");
            }
          } catch (error) {
            console.error('Error during force sync:', error);
            if (window.casinoSyncManager && window.casinoSyncManager.showConnectionStatus) {
              window.casinoSyncManager.showConnectionStatus("Error syncing bet log.", "error");
            } else {
              alert("Error syncing bet log.");
            }
          }
        } else {
          alert("Casino sync manager is not available to sync bets.");
          // Fallback: attempt to re-render the log directly if sync manager is missing
          console.warn("CasinoSyncManager not found, attempting direct renderBetLog for sync.");
          try {
            await renderBetLog(); // Re-render to fetch latest
             if (window.casinoSyncManager && window.casinoSyncManager.showConnectionStatus) {
                window.casinoSyncManager.showConnectionStatus("Bet log refreshed.", "success");
            } else {
                alert("Bet log refreshed.");
            }
          } catch (e) {
            alert("Error refreshing bet log.");
          }
        }
      };
    }

    // Add event listener for the league filter
    const leagueFilter = document.getElementById('league-filter');
    if (leagueFilter) {
      leagueFilter.onchange = function() {
        filterBetsByLeague(weekBets, this.value);
      };
    }

    // Function to filter and re-render bet entries based on selected league
    function filterBetsByLeague(allBets, selectedLeague) {
      const betLogList = document.querySelector('.bet-log-list');
      if (!betLogList) return;

      // Filter bets based on selected league
      const filteredBets = selectedLeague ? 
        allBets.filter(bet => {
          const betData = bet.bet_data || bet;
          return betData.league === selectedLeague;
        }) : 
        allBets;      // Re-render the bet entries
      betLogList.innerHTML = filteredBets.map(bet => {
        const betData = bet.bet_data || bet;
        const betId = bet.id || `local-${bet.localIdx}`;
        const isLocal = betId && typeof betId === 'string' ? betId.startsWith('local-') : false;

        // Format date nicely
        const rawDate = bet.bet_date || bet.date;
        const displayDate = new Date(rawDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const userName = bet.user_name || document.getElementById("user").value;
        // Determine background class based on user
        let userClass = '';
        if (userName === "FLIGHTx12!") {
          userClass = 'user-flight';
        } else if (userName === "Jaybers8") {
          userClass = 'user-jaybers';
        }

        const betStatus = bet.bet_status || {};
        const payoutData = bet.payout_data || {};

        return `<div class="bet-log-entry ${userClass}">
          <button class="delete-bet-entry-btn" data-betid="${betId}" data-local="${isLocal}" title="Delete this bet">&times;</button>
          <span class="bet-date">${displayDate}</span> | <span>${betData.league}</span> | <b class="user-name">${userName}</b>
          <br>
          <span>
            <span style="${styleTeamName(betData.league, betData.awayTeam)}">${betData.awayTeam}</span> @ <span style="${styleTeamName(betData.league, betData.homeTeam)}">${betData.homeTeam}</span>
          </span>
          <ul>
            ${betData.bets.map((b, idx) => {
              const betLineStatus = betStatus[idx] || 'pending';
              const statusClass = betLineStatus === 'won' ? 'bet-won' : betLineStatus === 'lost' ? 'bet-lost' : '';
              return `<li class="${statusClass}">
                <div class="bet-line-content">
                  ${b.betText} : ${b.player} (${b.betAmount}/${b.potentialWin + b.betAmount} 💷)${b.rolePlayerBoost ? ' <span style="color:#FFD700;font-weight:bold;">(Role Player +9%)</span>' : ''}
                  <span class="bet-status-controls" data-betid="${betId}" data-betindex="${idx}" data-local="${isLocal}">
                    ${betLineStatus === 'pending' ? `
                      <button class="bet-won-btn" title="Mark as won">W</button>
                      <button class="bet-lost-btn" title="Mark as lost">L</button>
                    ` : `
                      <span class="bet-status-indicator" title="Click to change status">${betLineStatus.toUpperCase()}</span>
                    `}
                  </span>
                </div>
              </li>`;
            }).join('')}
          </ul>
          ${Object.keys(betStatus).length > 0 && Object.values(betStatus).every(s => s !== 'pending') ? `
            <button class="create-payout-receipt-btn" data-betid="${betId}" data-local="${isLocal}" title="Create payout receipt">Create Payout Receipt</button>
          ` : ''}
        </div>`;
      }).join('');

      // Re-attach event listeners for the filtered results
      reattachBetLogEventListeners();
    }

    // Function to reattach event listeners after filtering
    function reattachBetLogEventListeners() {
      // Add event listeners for each delete button
      logDiv.querySelectorAll('.delete-bet-entry-btn').forEach(btn => {
        btn.onclick = async function() {
          const betId = this.getAttribute('data-betid');
          const isLocal = this.getAttribute('data-local') === 'true';
          
          if (confirm("Delete this bet entry? This cannot be undone.")) {
            if (isLocal) {
              // Handle local storage deletion
              const localIdx = parseInt(betId.split('-')[1], 10);
              let betLog = JSON.parse(localStorage.getItem('casinoBetLog') || '{}');
              if (betLog[weekKey]) {
                betLog[weekKey].splice(localIdx, 1);
                // If no bets left for the week, remove the week key
                if (betLog[weekKey].length === 0) {
                  delete betLog[weekKey];
                }
                localStorage.setItem('casinoBetLog', JSON.stringify(betLog));
                
                // Notify sync manager of bet deletion
                if (window.casinoSyncManager) {
                  window.casinoSyncManager.notifyBetChange(weekKey);
                }
              }
            } else {
              // Handle database deletion
              try {
                const response = await fetch(`/api/bets/${betId}`, {
                  method: 'DELETE'
                });
                
                if (!response.ok) {
                  console.error('Failed to delete bet from database:', await response.text());
                } else {
                  // Notify sync manager of bet deletion
                  if (window.casinoSyncManager) {
                    window.casinoSyncManager.notifyBetChange(weekKey);
                  }
                }
              } catch (error) {
                console.error('Error deleting bet from database:', error);
              }
            }
            
            // Refresh the bet log
            renderBetLog();
          }
        };
      });

      // Add event listeners for won/lost buttons
      console.log('Adding event listeners to', logDiv.querySelectorAll('.bet-won-btn, .bet-lost-btn').length, 'buttons');
      logDiv.querySelectorAll('.bet-won-btn, .bet-lost-btn').forEach(btn => {
        btn.onclick = async function() {
          console.log('Button clicked:', this.innerText);
          // Use 'this' instead of 'btn' to correctly identify which button was clicked
          const status = this.classList.contains('bet-won-btn') ? 'won' : 'lost';
          console.log('Status:', status);
          const controlsElement = this.closest('.bet-status-controls');
          console.log('Controls element:', controlsElement);
          const betId = controlsElement ? controlsElement.getAttribute('data-betid') : null;
          const betIndex = controlsElement ? parseInt(controlsElement.getAttribute('data-betindex'), 10) : null;
          const isLocal = controlsElement ? controlsElement.getAttribute('data-local') === 'true' : false;
          console.log('Bet ID:', betId, 'Index:', betIndex, 'Local:', isLocal);
          
          if (!controlsElement) {
            console.error('Could not find .bet-status-controls element');
            return;
          }
          
          try {
            if (isLocal) {
              // Handle local bet status updates
              const weekKey = getCurrentWeekKey();
              const localIdx = parseInt(betId.split('-')[1], 10);
              
              // Get current local bets
              let betLog = JSON.parse(localStorage.getItem('casinoBetLog') || '{}');
              if (!betLog[weekKey] || !betLog[weekKey][localIdx]) {
                console.error('Local bet not found');
                return;
              }
              
              // Update bet status
              const localBet = betLog[weekKey][localIdx];
              localBet.betStatus = localBet.betStatus || {};
              localBet.betStatus[betIndex] = status;
              
              // Calculate payout data if all bets have been evaluated
              const bets = localBet.bets || [];
              const currentStatus = localBet.betStatus;
              
              const allEvaluated = bets.every((b, idx) => currentStatus[idx]);
              if (allEvaluated) {
                // Calculate total win amount
                let totalWager = 0;
                let totalWin = 0;
                
                bets.forEach((b, idx) => {
                  totalWager += b.betAmount;
                  if (currentStatus[idx] === 'won') {
                    totalWin += b.potentialWin;
                  }
                });
                
                localBet.payoutData = {
                  totalWager,
                  totalWin,
                  netPayout: totalWin,
                  evaluatedAt: new Date().toISOString()
                };
              }
              
              // Save updates to localStorage
              betLog[weekKey][localIdx] = localBet;
              localStorage.setItem('casinoBetLog', JSON.stringify(betLog));
              
              // Notify sync manager of the bet status update
              if (window.casinoSyncManager) {
                window.casinoSyncManager.notifyBetChange(weekKey);
              }
              
              // Refresh bet log
              renderBetLog();
            } else {
              // Handle database bet status updates
              // Get current bet details
              const response = await fetch(`/api/bets/${betId}`);
              if (!response.ok) {
                console.error('Failed to get bet details');
                return;
              }
              
              const bet = await response.json();
              const currentStatus = bet.bet_status || {};
              const bets = bet.bet_data.bets || [];
              
              // Update status for this specific bet line
              currentStatus[betIndex] = status;
              
              // Calculate payout data if all bets have been evaluated
              let payoutData = null;
              const allEvaluated = bets.every((b, idx) => currentStatus[idx]);
              
              if (allEvaluated) {
                // Calculate total win amount
                let totalWager = 0;
                let totalWin = 0;
                
                bets.forEach((b, idx) => {
                  totalWager += b.betAmount;
                  if (currentStatus[idx] === 'won') {
                    totalWin += b.potentialWin;
                  }
                });
                
                payoutData = {
                  totalWager,
                  totalWin,
                  netPayout: totalWin,
                  evaluatedAt: new Date().toISOString()
                };
              }
              
              // Update bet status in the database
              const updateResponse = await fetch(`/api/bets/${betId}/status`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  betStatus: currentStatus,
                  payoutData
                })
              });
              
              if (!updateResponse.ok) {
                console.error('Failed to update bet status');
                return;
              }
              
              // Notify sync manager of the bet status update
              if (window.casinoSyncManager) {
                window.casinoSyncManager.notifyBetChange(bet.week_key || weekKey);
              }
              
              // Refresh bet log
              renderBetLog();
            }
          } catch (error) {
            console.error('Error updating bet status:', error);
          }
        };
      });

      // Add event listeners for creating payout receipts
      logDiv.querySelectorAll('.create-payout-receipt-btn').forEach(btn => {
        btn.onclick = async function() {
          const betId = this.getAttribute('data-betid');
          const isLocal = this.getAttribute('data-local') === 'true';
          
          try {
            if (isLocal) {
              // Handle local bet payout receipt
              const weekKey = getCurrentWeekKey();
              const localIdx = parseInt(betId.split('-')[1], 10);
              
              // Get current local bets
              let betLog = JSON.parse(localStorage.getItem('casinoBetLog') || '{}');
              if (!betLog[weekKey] || !betLog[weekKey][localIdx]) {
                console.error('Local bet not found');
                return;
              }
              
              // Create a bet object in the same format as the database for createPayoutReceipt
              const localBet = betLog[weekKey][localIdx];
              const formattedBet = {
                id: betId,
                user_name: localBet.userName || document.getElementById("user").value,
                bet_date: localBet.date,
                bet_data: localBet,
                bet_status: localBet.betStatus,
                payout_data: localBet.payoutData
              };
              
              createPayoutReceipt(formattedBet);
            } else {
              // Handle database bet payout receipt
              const response = await fetch(`/api/bets/${betId}/payout`);
              if (!response.ok) {
                console.error('Failed to get payout data');
                return;
              }
              
              const data = await response.json();
              createPayoutReceipt(data.bet);
            }
          } catch (error) {
            console.error('Error creating payout receipt:', error);
          }
        };
      });
    }

    // Initial render with all bets
    filterBetsByLeague(weekBets, '');

  } catch (error) {
   
    console.error('Error rendering bet log:', error);
    logDiv.innerHTML = `<h2>This Week's Bets</h2><div class='bet-log-empty'>Error loading bets. Please try again later.</div>`;
  }
}

// Function to create a unique signature for a bet to detect duplicates
function createBetSignature(bet) {
  // Extract the key properties that would identify a unique bet
  const betData = bet.bet_data || bet;
  const userName = bet.user_name || bet.userName || '';
  const date = bet.bet_date || bet.date || '';
  
  // Create signature from key bet properties
  let betSignature = `${userName}|${betData.league}|${betData.awayTeam}|${betData.homeTeam}|`;
  
  // Add bet lines to signature
  if (betData.bets && Array.isArray(betData.bets)) {
    betData.bets.forEach(betLine => {
      betSignature += `${betLine.betText}|${betLine.player}|${betLine.betAmount}|`;
    });
  }
  
  // Use the date/time if available (to the minute precision, not seconds)
  // This allows for the same person to place very similar bets but at different times
  if (date) {
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      // Format to YYYY-MM-DD HH:MM to ignore seconds for comparison
      betSignature += dateObj.toISOString().substring(0, 16);
    }
  }
  
  return betSignature;
}

// Helper function to get team colors by league and team name
function getTeamColors(league, teamName) {
  if (!league || !teamName || !teams) {
    return { primaryColor: '#FFFFFF', secondaryColor: '#000000' };
  }
  
  const leagueKey = league.toLowerCase();
  const leagueTeams = teams[leagueKey];
  
  if (!leagueTeams) {
    return { primaryColor: '#FFFFFF', secondaryColor: '#000000' };
  }
  
  const team = leagueTeams.find(t => t.name === teamName);
  return team ? { 
    primaryColor: team.primaryColor, 
    secondaryColor: team.secondaryColor 
  } : { primaryColor: '#FFFFFF', secondaryColor: '#000000' };
}

// Helper function to style team names with their colors
function styleTeamName(league, teamName, isBackground = false) {
  const colors = getTeamColors(league, teamName);
  
  if (isBackground) {
    // For background styling (like in receipts)
    return `background: linear-gradient(135deg, ${colors.primaryColor}, ${colors.secondaryColor}); 
            color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); 
            padding: 4px 8px; border-radius: 4px; font-weight: bold;`;
  } else {
    // For text styling
    return `color: ${colors.primaryColor}; text-shadow: 1px 1px 1px ${colors.secondaryColor}; font-weight: bold;`;
  }
}

// Visual feedback for clicked buttons
document.addEventListener('DOMContentLoaded', function() {
  // Function to add visual feedback to bet status buttons
  const enhanceBetStatusButtons = function() {
    const buttons = document.querySelectorAll('.bet-won-btn, .bet-lost-btn');
    buttons.forEach(btn => {
      // Store original background color
      const originalColor = btn.classList.contains('bet-won-btn') 
        ? 'rgba(0, 180, 0, 0.8)' 
        : 'rgba(180, 0, 0, 0.8)';
      
      // Replace onclick with addEventListener
      const originalOnClick = btn.onclick;
      if (originalOnClick) {
        btn.onclick = null;
        btn.addEventListener('click', async function(e) {
          // Visual feedback
          const originalText = this.innerText;
          const originalBgColor = this.style.backgroundColor;
          
          this.innerText = '...';
          this.disabled = true;
          this.style.backgroundColor = 'rgba(100, 100, 100, 0.5)';
          
          try {
            // Call the original onclick handler
            await originalOnClick.call(this, e);
          } catch (err) {
            console.error('Error processing button click:', err);
            // Restore button state if there's an error
            this.innerText = originalText;
            this.disabled = false;
            this.style.backgroundColor = originalBgColor;
            alert('Failed to update bet status. Please try again.');
          }
        });
      }
    });
  };

  // Initial enhancement
  enhanceBetStatusButtons();

  // Create a MutationObserver to detect when new bet entries are added
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any of the added nodes contain bet buttons
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && (node.classList?.contains('bet-log-list') || 
             node.querySelector?.('.bet-won-btn, .bet-lost-btn'))) {
            enhanceBetStatusButtons();
          }
        });
      }
    });
  });

  // Watch for changes in the bet-log element
  const betLog = document.getElementById('bet-log');
  if (betLog) {
    observer.observe(betLog, { childList: true, subtree: true });
  }
});