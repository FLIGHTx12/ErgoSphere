document.addEventListener('DOMContentLoaded', () => {
  const selectElements = document.querySelectorAll('select');
  const receiptDiv = document.getElementById('receipt');

  if (receiptDiv) {
      receiptDiv.addEventListener('click', captureReceiptScreenshot);
  }
  const receiptContent = document.getElementById('receipt-content');
  if (receiptContent) {
      receiptContent.addEventListener('click', captureReceiptContentScreenshot);
  }
  restoreCasinoState();

  document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', saveCasinoState);
  });
});

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

  Object.keys(state).forEach(key => {
    const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
    if (element) {
      element.value = state[key];
    }
  });
}

const teams = {
  nfl: [
    " 📯Minnesota Vikings", "Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills", 
    "Carolina Panthers", "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns",
    "Dallas Cowboys", "Denver Broncos", "Detroit Lions", "Green Bay Packers",
    "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs",
    "Las Vegas Raiders", "Los Angeles Chargers", "Los Angeles Rams", "Miami Dolphins",
    "New England Patriots", "New Orleans Saints", "New York Giants",
    "New York Jets", "Philadelphia Eagles", "Pittsburgh Steelers", "San Francisco 49ers",
    "Seattle Seahawks", "Tampa Bay Buccaneers", "Tennessee Titans", "Washington Commanders"
  ],
  nba: [
    " 🐺Minnesota Timberwolves", "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets",
    "Chicago Bulls", "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets",
    "Detroit Pistons", "Golden State Warriors", "Houston Rockets", "Indiana Pacers",
    "Los Angeles Clippers", "Los Angeles Lakers", "Memphis Grizzlies", "Miami Heat",
    "Milwaukee Bucks",  "New Orleans Pelicans", "New York Knicks",
    "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns",
    "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors",
    "Utah Jazz", "Washington Wizards"
  ],
  wnba: [
    " 😼Minnesota Lynx", "Atlanta Dream", "Chicago Sky", "Connecticut Sun", "Dallas Wings",
    "Indiana Fever", "Las Vegas Aces", "Los Angeles Sparks", 
    "New York Liberty", "Phoenix Mercury", "Seattle Storm", "Washington Mystics" 
  ]
};

const teamsData = {
  NFL: {
    teams: teams.nfl,
    categories: {
      INDIVIDUAL: [
        {text: "Most catches", value: "High"},
        {text: "Most TDs Scored (non QB)", value: "High"},
        {text: "Most INTs", value: "High"},
        {text: "Most Sacks", value: "High"},
        {text: "Most yards Overall", value: "High"},
        {text: "Most Tackles", value: "High"}
      ],
      STAT_HUNTING: [
        {text: "Reach 220 Passing", value: "Medium"},
        {text: "Reach 50 Rushing", value: "Medium"},
        {text: "Reach 2 FG made (non extra point)", value: "Medium"},
        {text: "Reach 1 Sack", value: "Medium"},
        {text: "Reach 1 INT", value: "Medium"},
        {text: "Reach 320 Passing", value: "High"},
        {text: "Reach 100 Rushing", value: "High"},
        {text: "Reach 4 FG made", value: "High"},
        {text: "Reach 2 Sacks", value: "High"},
        {text: "Reach 2 INT", value: "High"}
      ],
      TEAM: [
        {text: "Team Running Yards", value: "Medium"},
        {text: "Team Passing Yards", value: "Medium"},
        {text: "Team Yards Overall", value: "Medium"},
        {text: "Team Interceptions (def)", value: "Medium"},
        {text: "Team Sacks (def)", value: "Medium"},
        {text: "Team Most Possession Time", value: "Medium"}
      ],
      WILD_CARD: [
        {text: "Other team misses a Field goal in the 4th", value: "High"},
        {text: "1st TD is a run play", value: "High"},
        {text: "Other team does the Griddy at some point during game (on tv)", value: "High"},
        {text: "First Vikings possession is a TD or FG", value: "High"},
        {text: "QB touchdown for Vikings", value: "High"},
        {text: "Vikings lead going into halftime", value: "High"},
        {text: "Defensive TD Vikings", value: "High"},
        {text: "Kick return for a TD", value: "High"}
      ]
    },
    players:   [
  ":::::QB:::::", 
      "⭐J.J. McCarthy", 
      "⭐Sam Darnold",
      "Nick Mullens",
      "Daniel Jones",
      "Brett Rypien",
      
  ":::::RB:::::",
      "⭐Aaron Jones",
      "⭐Cam Akers",
      "Ty Chandler",
      "Zavier Scott",

   ":::::WR:::::",
      "⭐Jordan Addison",
      "Jalen Nailor",
      "⭐Justin Jefferson",
      "Trent Sherfield Sr.", 
      "Brandon Powell",
      "Thayer Thomas",
      "Lucky Jackson",
      "Jeshaun Jones",

  ":::::TE:::::",
      "Josh Oliver",
      "Johnny Mundt",
      "⭐T.J. Hockenson",

  ":::::FB:::::",
      "⭐C.J. Ham",

  ":::::LDE:::::",
      "Jalen Redmond",
      "Jerry Tillery",
      "Jonathan Harris",

  ":::::NT:::::",
      "⭐Harrison Phillips",
      "Taki Taimani IR",
      "Travis Bell",

  ":::::RDE:::::",
      "⭐Jihad Ward",
      "Jonathan Bullard",
      "Levi Drake Rodriguez",

  ":::::WLB:::::",
      "Bo Richter",
      "Gabriel Murphy",
      "⭐Jonathan Greenard",
      "Pat Jones II Q",

  ":::::LILB:::::",
      "Brian Asamoah II",
      "⭐Ivan Pace Jr.",
      "Kamu Grugier-Hill",
      "Max Tooley",

  ":::::RILB:::::",
      "⭐Blake Cashman",

  ":::::SLB:::::",
      "⭐Andrew Van Ginkel",
      "Dallas Turner",
      "Fabian Moreau",

  ":::::LCB:::::",
      "Ambry Thomas",
      "Fabian Moreau",
      "Mekhi Blackmon 5", 
      "NaJee Thompson IR",
      "⭐Stephon Gilmore",

  ":::::SS:::::",
      "⭐Harrison Smith",
      "Jay Ward",

  ":::::FS:::::",
      "⭐Camryn Bynum",
      "Theo Jackson",

  ":::::RCB:::::",
      "Dwight McGlothern",
      "Kahlef Hailassie",
      "Nahshon Wright",
      "Shaquill Griffin",

  ":::::NB:::::",
      "Byron Murphy Jr.",
      "⭐Josh Metellus",
      "Reddy Steward",

  ":::::K:::::",
      "⭐Will Reichard",

  ":::::P:::::",
      "⭐Ryan Wright",

  ":::::KR:::::",
      "Brandon Powell",
      "Jalen Nailor",

  ":::::PR:::::", 
      "Ty Chandler",

  ":::::LS:::::", 
      "Andrew DePaola",
  
  ":::::LT:::::",
      "Cam Robinson",
      "Walter Rouse",
      "Marcellus Johnson",
      "Leroy Watson IV",

  ":::::LG:::::",
      "Blake Brandel",
      "Dalton Risner",
      "Michael Jurgens",

  ":::::C:::::",
      "Dan Feeney",
      "Garrett Bradbury",
      "Henry Byrd",

  ":::::RG:::::",
      "Dalton Risner",
      "Ed Ingram",

  ":::::RT:::::",
      "Brian O'Neill Q",
      "David Quessenberry",
      "Trevor Reid",    
    
  ":::::OT:::::",
      "Christian Darrisaw 71" 
    ]
  },
  WNBA: {
    teams: teams.wnba,
    categories: {
      INDIVIDUAL: [
        {text: "Most FG attempted", value: "High"},
        {text: "Most FG made", value: "High"},
        {text: "Most blocks", value: "High"},
        {text: "Most Points", value: "High"}, 
        {text: "Most Rebounds", value: "High"},
        {text: "Most Threes Made", value: "High"},
        {text: "Most Assist", value: "High"},
        {text: "Most Steals", value: "High"}
      ],
      STAT_HUNTING: [
        {text: "Reach 1 Steal", value: "Low"},
        {text: "Reach 1 Block", value: "Low"},
        {text: "Reach +/- over 0", value: "Low"},
        {text: "Reach 20 points", value: "Medium"},
        {text: "Reach 6 rebounds", value: "Medium"},
        {text: "Reach 3 Three Pointers Made", value: "Medium"},
        {text: "Reach 6 assists", value: "Medium"},
        {text: "Reach 2 Blocks", value: "Medium"},
        {text: "Reach +/- over 10", value: "Medium"},
        {text: "Reach 2 Steals", value: "Medium"},
        {text: "Reach a Doubling double", value: "High"},
        {text: "Reach 30 points", value: "High"},
        {text: "Reach 11 rebounds", value: "High"},
        {text: "Reach 4 Three Pointers Made", value: "High"},
        {text: "Reach +/- over 20", value: "High"},
        {text: "Reach 10 assists", value: "High"},
        {text: "Reach 3 Blocks", value: "High"},
        {text: "Reach 3 Steals", value: "High"},
        {text: "Reach a Triple double", value: "High"}
      ],
      TEAM: [
        {text: "Team Field goal attempts", value: "Medium"},
        {text: "Team Total Rebounds", value: "Medium"},
        {text: "Team Field Goal %", value: "Medium"},
        {text: "Team Def. Rebounds", value: "Medium"},
        {text: "Team Off. Rebounds", value: "Medium"},
        {text: "Team Free-throws taken", value: "Medium"},
        {text: "Team steals", value: "Medium"},
        {text: "Team blocks", value: "Medium"},
        {text: "Team assists", value: "Medium"},
        {text: "Team Points in the Paint", value: "Medium"},
        {text: "Team Points off Turnovers", value: "Medium"},
        {text: "Team Fast Break Points", value: "Medium"},
        {text: "Team Turnovers (less wins)", value: "Medium"},
        {text: "Team fouls (less wins)", value: "Medium"}
      ],
      WILD_CARD: [
        {text: "MN win tip off", value: "High"},
        {text: "MN wins by 5+ points", value: "Low"},
        {text: "Other team misses 2 free-throws in a row", value: "High"},
        {text: "MN has the biggest lead of the game", value: "High"},
        {text: "First MN FG is a 2 pointer.", value: "High"},
        {text: "First MN FG is a 3 pointer", value: "High"},
        {text: "MN wins by 10+ points", value: "Medium"},
        {text: "Technical foul is called this game (either team)", value: "High"},
        {text: "Flagrant foul is called this game (either team)", value: "High"},
        {text: "Game goes into overtime", value: "High"},
        {text: "MN wins by 20+ points", value: "High"},
        {text: "Half+ court shot made", value: "High"}
      ]
    },
    players: [
      ":::::G:::::",
      "⭐Courtney Williams #10",
      "⭐Kayla McBride",
      "Natisha Hiedeman",
      "Olivia Epoupa",

      ":::::F:::::",     
      "Alissa Pili",
      "Bridget Carleton",
      "Diamond Miller",
      "⭐Napheesa Collier",

      ":::::C:::::",
      "⭐Alanna Smith",
      "Dorka Juhasz",
      "Marieme Badiane",        
    ]
  },
  NBA: {
    teams: teams.nba,
    categories: {
      INDIVIDUAL: [
        {text: "Most FG attempted", value: "High"},
        {text: "Most FG made", value: "High"},
        {text: "Most blocks", value: "High"},
        {text: "Most Points", value: "High"}, 
        {text: "Most Rebounds", value: "High"},
        {text: "Most Threes Made", value: "High"},
        {text: "Most Assist", value: "High"},
        {text: "Most Steals", value: "High"}
      ],
      STAT_HUNTING: [
        {text: "Reach 1 Steal", value: "Low"},
        {text: "Reach 1 Block", value: "Low"},
        {text: "Reach +/- over 0", value: "Low"},
        {text: "Reach 20 points", value: "Medium"},
        {text: "Reach 6 rebounds", value: "Medium"},
        {text: "Reach 3 Three Pointers Made", value: "Medium"},
        {text: "Reach 6 assists", value: "Medium"},
        {text: "Reach 2 Blocks", value: "Medium"},
        {text: "Reach +/- over 10", value: "Medium"},
        {text: "Reach 2 Steals", value: "Medium"},
        {text: "Reach a Doubling double", value: "High"},
        {text: "Reach 30 points", value: "High"},
        {text: "Reach 11 rebounds", value: "High"},
        {text: "Reach 4 Three Pointers Made", value: "High"},
        {text: "Reach +/- over 20", value: "High"},
        {text: "Reach 10 assists", value: "High"},
        {text: "Reach 3 Blocks", value: "High"},
        {text: "Reach 3 Steals", value: "High"},
        {text: "Reach a Triple double", value: "High"}
      ],
      TEAM: [
        {text: "Team Field goal attempts", value: "Medium"},
        {text: "Team Total Rebounds", value: "Medium"},
        {text: "Team Field Goal %", value: "Medium"},
        {text: "Team Def. Rebounds", value: "Medium"},
        {text: "Team Off. Rebounds", value: "Medium"},
        {text: "Team Free-throws taken", value: "Medium"},
        {text: "Team steals", value: "Medium"},
        {text: "Team blocks", value: "Medium"},
        {text: "Team assists", value: "Medium"},
        {text: "Team Points in the Paint", value: "Medium"},
        {text: "Team Points off Turnovers", value: "Medium"},
        {text: "Team Fast Break Points", value: "Medium"},
        {text: "Team Turnovers (less wins)", value: "Medium"},
        {text: "Team fouls (less wins)", value: "Medium"}
      ],
      WILD_CARD: [
        {text: "MN win tip off", value: "High"},
        {text: "MN wins by 5+ points", value: "Low"},
        {text: "Other team misses 2 free-throws in a row", value: "High"},
        {text: "MN has the biggest lead of the game", value: "High"},
        {text: "First MN FG is a 2 pointer.", value: "High"},
        {text: "First MN FG is a 3 pointer", value: "High"},
        {text: "MN wins by 10+ points", value: "Medium"},
        {text: "Technical foul is called this game (either team)", value: "High"},
        {text: "Flagrant foul is called this game (either team)", value: "High"},
        {text: "Game goes into overtime", value: "High"},
        {text: "MN wins by 20+ points", value: "High"},
        {text: "Half+ court shot made", value: "High"}
      ]
    },
    players: [
      ":::::G:::::",
      "⭐Anthony Edwards",
      "Donte DiVincenzo",
      "Jaylen Clark",
      "Joe Ingles",
      "Mike Conley",
      "Nickeil Alexander-Walker",
      "Rob Dillingham",
      "Terrence Shannon Jr.",
      "Tristen Newton",

      ":::::F:::::",
      "Jaden McDaniels",
      "Josh Minott",
      "⭐Julius Randle",
      "Leonard Miller",
             
      ":::::C:::::",
      "Jesse Edwards",
      "Luka Garza",
      "Naz Reid",      
      "⭐Rudy Gobert",      
    ]
  }
};

// Define risk percentages
const riskPayouts = {
  "Low": 0.3,    // 30% payout
  "Medium": 0.6, // 60% payout
  "High": 0.9    // 90% payout
};

function updateBets() {
  const league = document.getElementById("league").value;
  const bettingSystem = document.getElementById("betting-system");
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

  const awayTeamSelect = document.getElementById("awayTeam");
  const homeTeamSelect = document.getElementById("homeTeam");

  awayTeamSelect.innerHTML = '<option value="">Select Away Team</option>';
  homeTeamSelect.innerHTML = '<option value="">Select Home Team</option>';

  leagueTeams.forEach(team => {
      awayTeamSelect.innerHTML += `<option value="${team}">${team}</option>`;
      homeTeamSelect.innerHTML += `<option value="${team}">${team}</option>`;
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
  const league = document.getElementById("league").value;
  const category = document.getElementById(`category${betNum}`).value;
  const lineSelect = document.getElementById(`line${betNum}`);
  const playerSelect = document.getElementById(`player${betNum}`);
  const betAmountInput = document.getElementById(`betAmount${betNum}`);
  
  // Make sure bet amount input is visible when category is selected
  if (category) {
    if (!betAmountInput) {
      // Create bet amount input if it doesn't exist
      const container = lineSelect.parentElement;
      const input = document.createElement('input');
      input.type = 'number';
      input.id = `betAmount${betNum}`;
      input.className = 'bet-amount';
      input.placeholder = 'Bet Amount';
      input.min = '1';
      container.appendChild(input);
    } else {
      betAmountInput.style.display = 'block';
    }
  }

  const lines = teamsData[league]?.categories[category];
  if (lines) {
    lineSelect.innerHTML = '<option value="">Select Line</option>';
    lines.forEach(line => {
      const riskLevel = line.value; // Now this is "Low", "Medium", or "High"
      // Display risk level alongside bet text
      lineSelect.innerHTML += `<option value="${riskLevel}">[${riskLevel}] ${line.text}</option>`;
    });
  } else {
    lineSelect.innerHTML = '<option value="">Select Line</option>';
  }

  // For INDIVIDUAL and STAT_HUNTING, require player selection; otherwise, set to N/A.
  if (["INDIVIDUAL", "STAT_HUNTING"].includes(category) && teamsData[league]?.players) {
    playerSelect.innerHTML = '<option value="">Select Player</option>';
    teamsData[league].players.forEach(player => {
      playerSelect.innerHTML += `<option value="${player}">${player}</option>`;
    });
  } else {
    playerSelect.innerHTML = '<option value="">N/A</option>';
  }
}

function submitBets() {
  const league = document.getElementById("league").value;
  const awayTeam = document.getElementById("awayTeam").value;
  const homeTeam = document.getElementById("homeTeam").value;
  let bets = [];
  let totalBetAmount = 0;
  let totalPotentialWinnings = 0;

  for (let i = 1; i <= 3; i++) {
    const category = document.getElementById(`category${i}`).value;
    const lineSelect = document.getElementById(`line${i}`);
    const riskLevel = lineSelect.value; // This is now "Low", "Medium", or "High"
    const betText = lineSelect.options[lineSelect.selectedIndex]?.text || '';
    const player = document.getElementById(`player${i}`).value;
    const betAmountInput = document.getElementById(`betAmount${i}`);
    
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
      const payoutRate = riskPayouts[riskLevel];
      const potentialWin = Math.round(betAmount * payoutRate);
      
      totalBetAmount += betAmount;
      totalPotentialWinnings += potentialWin;
      
      // Clean up the bet text to remove the risk level prefix
      const cleanBetText = betText.replace(/\[Low\]|\[Medium\]|\[High\]/g, '').trim();
      
      bets.push({ 
        betText: cleanBetText, 
        player: player !== 'N/A' ? player : '',
        betAmount,
        potentialWin,
        riskLevel
      });
    }
  }

  if (league && awayTeam && homeTeam && bets.length > 0) {
    const betLines = bets.map(bet => {
      const totalWinAmount = bet.betAmount + bet.potentialWin;
      return `<div class="bet-line">${bet.betText} : ${bet.player}<br>(${bet.betAmount}/${totalWinAmount} 💷)</div>`;
    }).join("");
    
    const receiptContent = `
      <div class="matchup">
        ${awayTeam}<br>@<br>${homeTeam}
      </div>
      ${betLines}
      <div class="wager-total">Wager: ${totalBetAmount} 💷</div>
      <div class="potential-winnings">Potential Win: ${totalPotentialWinnings} 💷</div>
      <div class="actual-winnings">PAYOUT: ____________ 💷</div>
    `;
    document.getElementById("receipt-content").innerHTML = receiptContent;
  } else {
    alert("Please complete at least one bet before submitting.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const receiptDiv = document.getElementById('receipt');
  if (receiptDiv) {
      receiptDiv.addEventListener('click', captureReceiptScreenshot);
  }
  const receiptContent = document.getElementById('receipt-content');
  if (receiptContent) {
      receiptContent.addEventListener('click', captureReceiptContentScreenshot);
  }
});

function captureReceiptScreenshot() {
  const receiptElement = document.getElementById('receipt');
  html2canvas(receiptElement, { useCORS: true, allowTaint: true }).then(canvas => {
      canvas.toBlob(blob => {
          navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
          ]).then(() => {
              alert('Receipt screenshot copied to clipboard!');
          }).catch(err => {
              console.error('Failed to copy screenshot:', err);
          });
      });
  }).catch(err => {
      console.error('Failed to capture screenshot:', err);
  });
}

function captureReceiptContentScreenshot() {
  const receiptContentElement = document.getElementById('receipt-content');
  html2canvas(receiptContentElement, { useCORS: true, allowTaint: true }).then(canvas => {
      canvas.toBlob(blob => {
          navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
          ]).then(() => {
              alert('Receipt content screenshot copied to clipboard!');
          }).catch(err => {
              console.error('Failed to copy content screenshot:', err);
          });
      });
  }).catch(err => {
      console.error('Failed to capture content screenshot:', err);
  });
}