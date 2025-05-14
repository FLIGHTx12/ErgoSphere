// Utility: Safely get element or its value
function safeGetElement(id) {
  return document.getElementById(id);
}

function safeGetElementValue(id, defaultValue = "") {
  const element = document.getElementById(id);
  return element ? element.value : defaultValue;
}

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
  ],
  ergoball: ["Belkans", "Dilardians"],
  ergogolf: ["Belkans", "Dilardians"]
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
        {text: "Most Steals", value: "Extreme"}
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
        {text: "Reach a Triple double", value: "Extreme"}
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
        {text: "MN wins by 5+ points", value: "Medium"},
        {text: "Other team misses 2 free-throws in a row", value: "High"},
        {text: "MN has the biggest lead of the game", value: "High"},
        {text: "First MN FG is a 2 pointer.", value: "Medium"},
        {text: "First MN FG is a 3 pointer", value: "High"},
        {text: "MN wins by 10+ points", value: "Medium"},
        {text: "Technical foul is called this game (either team)", value: "High"},
        {text: "Flagrant foul is called this game (either team)", value: "High"},
        {text: "Game goes into overtime", value: "High"},
        {text: "MN wins by 20+ points", value: "Extreme"},
        {text: "Half+ court shot made", value: "Extreme"}
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
        {text: "Most Steals", value: "Extreme"}
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
        {text: "Reach a Triple double", value: "Extreme"}
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
        {text: "MN wins by 5+ points", value: "Medium"},
        {text: "Other team misses 2 free-throws in a row", value: "High"},
        {text: "MN has the biggest lead of the game", value: "High"},
        {text: "First MN FG is a 2 pointer.", value: "Medium"},
        {text: "First MN FG is a 3 pointer", value: "High"},
        {text: "MN wins by 10+ points", value: "Medium"},
        {text: "Technical foul is called this game (either team)", value: "High"},
        {text: "Flagrant foul is called this game (either team)", value: "High"},
        {text: "Game goes into overtime", value: "High"},
        {text: "MN wins by 20+ points", value: "Extreme"},
        {text: "Half+ court shot made", value: "Extreme"}
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
  },
  ErgoBall: {
    teams: teams.ergoball,
    categories: {
      LINES: [
        { text: "NO SWEAT", value: "Low", desc: "Win by 3 or more" },
        { text: "VOLLEYBALL", value: "Medium", desc: "Get 2 or more blocks" },
        { text: "LONG DISTANCE CALL", value: "High", desc: "3 or more 2 pointers made" },
        { text: "FORGOT SOMETHIN?", value: "Medium", desc: "Get at least 2 steals" },
        { text: "SNIPER WATCH", value: "Medium", desc: "Go full game using only jumpers and fades." },
        { text: "FLOOR GENERAL", value: "High", desc: "No turnovers or airballs. Every shot must either be a make or hit rim." },
        { text: "SUPREME VICTORY", value: "Extreme", desc: "Opponent scores no points" },
        { text: "ORBITAL CANNON", value: "Extreme", desc: "Make a half court shot before the end of the game." }
      ]
    },
    players: ["Jaybers8", "FLIGHTx12!"]
  },
  ErgoGolf: {
    teams: teams.ergogolf,
    categories: {
      LINES: [
        { text: "NO SWEAT", value: "Low", desc: "Must win by 3 or more" },
        { text: "NO BATHS", value: "Medium", desc: "Must go full game without hitting water. Water traps are instant loss." },
        { text: "SANDSTORM", value: "Low", desc: "Must go full game without hitting sand traps. Sand traps are instant loss." },
        { text: "COOL HAND", value: "Medium", desc: "Make your first 3 putts without a miss." },
        { text: "LAWN CARE", value: "Medium", desc: "Go full game without hitting the rough." },
        { text: "SURGICAL", value: "High", desc: "Go full game without getting an OB at all." },
        { text: "SUPREME VICTORY", value: "Extreme", desc: "Opponent scores no points." },
        { text: "EAGLE!", value: "Extreme", desc: "Get a 10+ before the game ends." }
      ]
    },
    players: ["Jaybers8", "FLIGHTx12!"]
  }
};

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
  const league = safeGetElementValue("league");
  const category = safeGetElementValue(`category${betNum}`);
  const lineSelect = safeGetElement(`line${betNum}`);
  const playerSelect = safeGetElement(`player${betNum}`);
  const betAmountInput = safeGetElement(`betAmount${betNum}`);
  
  // Safety check - if lineSelect doesn't exist, we can't continue
  if (!lineSelect) return;
  
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
    }    // Show description below dropdown when a line is selected
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
      // Hide description div for NFL, NBA, WNBA      const descDiv = safeGetElement(`line-desc${betNum}`);
      if (descDiv) descDiv.style.display = 'none';
      lineSelect.onchange = null;
    } else {
      lineSelect.innerHTML = '<option value="">Select Line</option>';      const descDiv = safeGetElement(`line-desc${betNum}`);
      if (descDiv) descDiv.style.display = 'none';
    }
  }

  // For INDIVIDUAL and STAT_HUNTING, require player selection; otherwise, set to N/A.
  if ((["INDIVIDUAL", "STAT_HUNTING"].includes(category) && teamsData[league]?.players)) {
    playerSelect.innerHTML = '<option value="">Select Player</option>';
    teamsData[league].players.forEach(player => {
      playerSelect.innerHTML += `<option value="${player}">${player}</option>`;
    });
  } else if ((league === 'ErgoBall' || league === 'ErgoGolf') && category === 'LINES') {
    playerSelect.innerHTML = '<option value="">Select Player</option>';
    teamsData[league].players.forEach(player => {
      playerSelect.innerHTML += `<option value="${player}">${player}</option>`;
    });
  } else {
    playerSelect.innerHTML = '<option value="">N/A</option>';
  }
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
        ${awayTeam}<br>@<br>${homeTeam}
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
  const receiptContent = document.getElementById('receipt-content');
  if (receiptContent) {
      receiptContent.addEventListener('click', captureReceiptContentScreenshot);
  }
  
  // Initialize bet log
  renderBetLog().catch(error => {
    console.error('Error rendering bet log:', error);
  });
});

function captureReceiptScreenshot() {
  const receiptElement = document.getElementById('receipt');
  
  // Add a class to ensure content is visible during capture
  receiptElement.classList.add('capturing');
  
  html2canvas(receiptElement, { 
    useCORS: true, 
    allowTaint: true,
    backgroundColor: null,
    removeContainer: true,
    foreignObjectRendering: false,
    logging: false,
    scale: 2 // Increase quality
  }).then(canvas => {
      // Remove the capturing class
      receiptElement.classList.remove('capturing');
      
      canvas.toBlob(blob => {
          navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
          ]).then(() => {
              alert('Receipt screenshot copied to clipboard!');
          }).catch(err => {
              console.error('Failed to copy screenshot:', err);
              // Fallback - offer direct download if clipboard fails
              const link = document.createElement('a');
              link.download = 'bet-receipt.png';
              link.href = canvas.toDataURL('image/png');
              link.click();
              alert('Receipt saved as image (clipboard access failed).');
          });
      });
  }).catch(err => {
      console.error('Failed to capture screenshot:', err);
      receiptElement.classList.remove('capturing');
      alert('Failed to capture screenshot. Please try again or use a browser screenshot tool.');
  });
}

function captureReceiptContentScreenshot() {
  const receiptContentElement = document.getElementById('receipt-content');
  
  // Add a class to ensure content is visible during capture
  receiptContentElement.classList.add('capturing');
  
  html2canvas(receiptContentElement, { 
    useCORS: true, 
    allowTaint: true,
    backgroundColor: null,
    removeContainer: true,
    scale: 2 // Increase quality
  }).then(canvas => {
      // Remove the capturing class
      receiptContentElement.classList.remove('capturing');
      
      canvas.toBlob(blob => {
          navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
          ]).then(() => {
              alert('Receipt content screenshot copied to clipboard!');
          }).catch(err => {
              console.error('Failed to copy content screenshot:', err);
              // Fallback - offer direct download if clipboard fails
              const link = document.createElement('a');
              link.download = 'bet-receipt-content.png';
              link.href = canvas.toDataURL('image/png');
              link.click();
              alert('Receipt content saved as image (clipboard access failed).');
          });
      });
  }).catch(err => {
      console.error('Failed to capture content screenshot:', err);
      receiptContentElement.classList.remove('capturing');
      alert('Failed to capture content screenshot. Please try again.');
  });
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
  
  // Format date nicely
  const betDate = new Date(bet.bet_date).toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Count wins and calculate payout
  let winsCount = 0;
  let totalWager = 0;
  let totalWinnings = 0;
  
  betData.bets.forEach((b, idx) => {
    totalWager += b.betAmount;
    if (betStatus[idx] === 'won') {
      winsCount++;
      totalWinnings += b.potentialWin;
    }
  });
  
  // Create receipt HTML
  receiptDiv.innerHTML = `
    <button class="payout-receipt-close">&times;</button>
    <h2>Payout Receipt</h2>
    <div>
      <div><b>${bet.user_name}</b> | ${betDate}</div>
      <div class="matchup">${betData.awayTeam} @ ${betData.homeTeam}</div>
      
      <div class="bet-details">
        <h3>Bet Results:</h3>
        <ul>
          ${betData.bets.map((b, idx) => {
            const status = betStatus[idx] || 'pending';
            const statusClass = status === 'won' ? 'bet-won' : status === 'lost' ? 'bet-lost' : '';
            
            return `
              <li class="${statusClass}">
                ${b.betText} : ${b.player} - 
                <b>${status.toUpperCase()}</b> 
                ${status === 'won' ? `<span>(+${b.potentialWin} 💷)</span>` : ''}
              </li>
            `;
          }).join('')}
        </ul>
      </div>
      
      <div class="payout-summary">
        <div>Total Wager: ${totalWager} 💷</div>
        <div>Bets Won: ${winsCount} of ${betData.bets.length}</div>
        <div class="payout-value">TOTAL PAYOUT: ${totalWinnings} 💷</div>
      </div>
      
      <button id="copy-payout-receipt" class="copy-receipt-btn">Copy Receipt</button>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(receiptDiv);
  
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
  
  html2canvas(receiptElement, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    scale: 2 // Increase quality
  }).then(canvas => {
    // Remove the capturing class
    receiptElement.classList.remove('capturing');
    
    canvas.toBlob(blob => {
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]).then(() => {
        alert('Payout receipt copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy payout receipt:', err);
        // Fallback - offer direct download if clipboard fails
        const link = document.createElement('a');
        link.download = 'payout-receipt.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        alert('Payout receipt saved as image (clipboard access failed).');
      });
    });
  }).catch(err => {
    console.error('Failed to capture payout receipt:', err);
    receiptElement.classList.remove('capturing');
    alert('Failed to capture payout receipt. Please try again.');
  });
}

// Reset all bet-related dropdowns and inputs (except league)
function resetBetInputs() {
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
      betAmountInput.parentElement.removeChild(betAmountInput);
    }
    
    // Hide line description
    const descDiv = safeGetElement(`line-desc${i}`);
    if (descDiv) descDiv.style.display = 'none';
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
  const now = new Date();
  // Get Sunday of this week
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  // Format as YYYY-MM-DD
  return sunday.toISOString().slice(0, 10);
}

function getCurrentWeekNumber() {
  const now = new Date();
  // Create a new date object for the first day of the year
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
  // Calculate the number of days since the first day of the year
  const daysSinceFirstDay = Math.floor((now - firstDayOfYear) / (24 * 60 * 60 * 1000));
  // Calculate the week number
  return Math.ceil((daysSinceFirstDay + firstDayOfYear.getDay() + 1) / 7);
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
  localStorage.setItem('casinoBetLog', JSON.stringify(betLog));
  
  // Save to database
  try {
    if (!userName) return; // Don't save to database if user is not selected
    
    const response = await fetch('/api/bets', {
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
      console.error('Failed to save bet to database:', await response.text());
    }
  } catch (error) {
    console.error('Error saving bet to database:', error);
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
    const response = await fetch(`/api/bets/${weekKey}`);
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
    
    // Combine both sources, avoiding duplicates
    // This is a simple approach - duplicates might still occur if same bet exists in both sources
    weekBets = [...weekBets, ...localBets];
    
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
    });
      logDiv.innerHTML = `
      <h2>WEEK ${weekNumber} BETS</h2>
      <button id="delete-all-bets" class="delete-bet-log-btn">Delete All Bets</button>
      <div class="bet-log-list">
        ${weekBets.map(bet => {          // Extract bet data from DB format or use as is for localStorage
          const betData = bet.bet_data || bet;
          const betId = bet.id || `local-${bet.localIdx}`;
          const isLocal = betId && typeof betId === 'string' ? betId.startsWith('local-') : false;
          const displayDate = bet.bet_date || bet.date;
          const userName = bet.user_name || document.getElementById("user").value;
          
          // Determine background class based on user
          let userClass = '';
          if (userName === "FLIGHTx12!") {
            userClass = 'user-flight';
          } else if (userName === "Jaybers8") {
            userClass = 'user-jaybers';
          }            // Check if the bet has status information
            const betStatus = bet.bet_status || {};
            const payoutData = bet.payout_data || {};
            
            return `<div class="bet-log-entry ${userClass}">
            <button class="delete-bet-entry-btn" data-betid="${betId}" data-local="${isLocal}" title="Delete this bet">&times;</button>
            <span class="bet-date">${displayDate}</span> | <span>${betData.league}</span> | <b class="user-name">${userName}</b>
            <br>
            <span>${betData.awayTeam} @ ${betData.homeTeam}</span>
            <ul>              ${betData.bets.map((b, idx) => {
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
                        <span class="bet-status-indicator">${betLineStatus.toUpperCase()}</span>
                      `}
                    </span>
                  </div>
                </li>`;
              }).join('')}            </ul>
            ${Object.keys(betStatus).length > 0 ? `
              <div class="bet-actions">
                <button class="create-payout-receipt-btn" data-betid="${betId}" data-local="${isLocal}" title="Create payout receipt">Create Payout Receipt</button>
              </div>
            ` : ''}
          </div>`;
        }).join('')}
      </div>
    `;    // Add event listeners for each delete button
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
            }
          } else {
            // Handle database deletion
            try {
              const response = await fetch(`/api/bets/${betId}`, {
                method: 'DELETE'
              });
              
              if (!response.ok) {
                console.error('Failed to delete bet from database:', await response.text());
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
    
    // Add event listener for delete all button
    const deleteAllBtn = document.getElementById('delete-all-bets');
    if (deleteAllBtn) {
      deleteAllBtn.onclick = async function() {
        if (confirm("Delete ALL bets for this week? This cannot be undone!")) {
          const userName = document.getElementById("user").value;
          
          // Clear localStorage first
          let betLog = JSON.parse(localStorage.getItem('casinoBetLog') || '{}');
          if (betLog[weekKey]) {
            delete betLog[weekKey];
            localStorage.setItem('casinoBetLog', JSON.stringify(betLog));
          }
          
          // If user is selected, delete from database as well
          if (userName) {
            try {
              // For database, we have to delete each bet one by one
              const response = await fetch(`/api/bets/${weekKey}?userName=${encodeURIComponent(userName)}`);
              if (response.ok) {
                const bets = await response.json();
                
                // Delete each bet from database
                for (const bet of bets) {
                  await fetch(`/api/bets/${bet.id}`, {
                    method: 'DELETE'
                  });
                }
              }
            } catch (error) {
              console.error('Error deleting all bets from database:', error);
            }
          }
          
          // Refresh the bet log
          renderBetLog();
        }
      };
    }
  } catch (error) {
    console.error('Error rendering bet log:', error);
    logDiv.innerHTML = `<h2>This Week's Bets</h2><div class='bet-log-empty'>Error loading bets. Please try again later.</div>`;
  }
}