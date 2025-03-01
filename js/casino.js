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
});


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
        {text: "Most catches", value: "10/50"},
        {text: "Most TDs Scored (non QB)", value: "10/50"},
        {text: "Most INTs", value: "20/70"},
        {text: "Most Sacks", value: "20/70"},
        {text: "Most yards Overall", value: "30/100"},
        {text: "Most Tackles", value: "30/100"}
      ],
      STAT_HUNTING: [
        {text: "Reach 220 Passing", value: "10/30"},
        {text: "Reach 50 Rushing", value: "10/30"},
        {text: "Reach 2 FG made (non extra point)", value: "20/50"},
        {text: "Reach 1 Sack", value: "20/70"},
        {text: "Reach 1 INT", value: "20/70"},
        {text: "Reach 320 Passing", value: "15/80"},
        {text: "Reach 100 Rushing", value: "15/80"},
        {text: "Reach 4 FG made", value: "10/85"},
        {text: "Reach 2 Sacks", value: "10/90"},
        {text: "Reach 2 INT", value: "10/110"}
      ],
      TEAM: [
        {text: "Team Running Yards", value: "20/40"},
        {text: "Team Passing Yards", value: "20/40"},
        {text: "Team Yards Overall", value: "20/50"},
        {text: "Team Interceptions (def)", value: "20/50"},
        {text: "Team Sacks (def)", value: "30/70"},
        {text: "Team Most Possession Time", value: "30/70"}
      ],
      WILD_CARD: [
        {text: "Other team misses a Field goal in the 4th", value: "2/30"},
        {text: "1st TD is a run play", value: "15/30"},
        {text: "Other team does the Griddy at some point during game (on tv)", value: "20/50"},
        {text: "First Vikings possession is a TD or FG", value: "10/50"},
        {text: "QB touchdown for Vikings", value: "10/60"},
        {text: "Vikings lead going into halftime", value: "30/70"},
        {text: "Defensive TD Vikings", value: "20/90"},
        {text: "Kick return for a TD", value: "10/100"}
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
        {text: "Most FG attempted", value: "50/90"},
        {text: "Most FG made", value: "50/100"},
        {text: "Most blocks", value: "50/100"},
        {text: "Most Points", value: "50/100"}, 
        {text: "Most Rebounds", value: "50/150"},
        {text: "Most Threes Made", value: "50/150"},
        {text: "Most Assist", value: "50/200"},
        {text: "Most Steals", value: "50/200"}
      ],
      STAT_HUNTING: [
        {text: "Reach 1 Steal", value: "2/10"},
        {text: "Reach 1 Block", value: "2/10"},
        {text: "Reach +/- over 0", value: "2/10"},
        {text: "Reach 20 points", value: "10/30"},
        {text: "Reach 6 rebounds", value: "10/30"},
        {text: "Reach 3 Three Pointers Made", value: "10/30"},
        {text: "Reach 6 assists", value: "20/50"},
        {text: "Reach 2 Blocks", value: "20/50"},
        {text: "Reach +/- over 10", value: "20/50"},
        {text: "Reach 2 Steals", value: "30/70"},
        {text: "Reach a Doubling double", value: "40/90"},
        {text: "Reach 30 points", value: "40/90"},
        {text: "Reach 11 rebounds", value: "40/90"},
        {text: "Reach 4 Three Pointers Made", value: "40/90"},
        {text: "Reach +/- over 20", value: "50/110"},
        {text: "Reach 10 assists", value: "50/110"},
        {text: "Reach 3 Blocks", value: "50/110"},
        {text: "Reach 3 Steals", value: "50/120"},
        {text: "Reach a Tripple double", value: "50/150"}
      ],
      TEAM: [
        {text: "Team Field goal attempts", value: "2/10"},
        {text: "Team Total Rebounds", value: "2/10"},
        {text: "Team Field Goal %", value: "10/20"},
        {text: "Team Def. Rebounds", value: "10/20"},
        {text: "Team Off. Rebounds", value: "20/40"},
        {text: "Team Free-throws taken", value: "20/40"},
        {text: "Team steals", value: "20/40"},
        {text: "Team blocks", value: "20/40"},
        {text: "Team assists", value: "30/60"},
        {text: "Team Points in the Paint", value: "30/60"},
        {text: "Team Points off Turnovers", value: "30/60"},
        {text: "Team Fast Break Points", value: "40/90"},
        {text: "Team Turnovers (less wins)", value: "40/90"},
        {text: "Team fouls (less wins)", value: "40/90"}
      ],
      WILD_CARD: [
        {text: "MN has most fast break points", value: "2/10"},
        {text: "MN win tip off", value: "10/30"},
        {text: "Other team misses 2 free-throws in a row", value: "20/50"},
        {text: "MN has the biggest lead of the game", value: "20/50"},
        {text: "First MN FG is a 2 pointer.", value: "40/80"},
        {text: "First MN FG is a 3 pointer", value: "40/100"},
        {text: "Technical foul is called this game (either team)", value: "40/120"},
        {text: "Flagrant foul is called this game (either team)", value: "50/150"},
        {text: "Game goes into overtime", value: "50/150"},
        {text: "Half+ court shot made", value: "50/250"}
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
        {text: "Most FG attempted", value: "50/90"},
        {text: "Most FG made", value: "50/100"},
        {text: "Most blocks", value: "50/100"},
        {text: "Most Points", value: "50/100"}, 
        {text: "Most Rebounds", value: "50/150"},
        {text: "Most Threes Made", value: "50/150"},
        {text: "Most Assist", value: "50/200"},
        {text: "Most Steals", value: "50/200"}
      ],
      STAT_HUNTING: [
        {text: "Reach 1 Steal", value: "2/10"},
        {text: "Reach 1 Block", value: "2/10"},
        {text: "Reach +/- over 0", value: "2/10"},
        {text: "Reach 20 points", value: "10/30"},
        {text: "Reach 6 rebounds", value: "10/30"},
        {text: "Reach 3 Three Pointers Made", value: "10/30"},
        {text: "Reach 6 assists", value: "20/50"},
        {text: "Reach 2 Blocks", value: "20/50"},
        {text: "Reach +/- over 10", value: "20/50"},
        {text: "Reach 2 Steals", value: "30/70"},
        {text: "Reach a Doubling double", value: "40/90"},
        {text: "Reach 30 points", value: "40/90"},
        {text: "Reach 11 rebounds", value: "40/90"},
        {text: "Reach 4 Three Pointers Made", value: "40/90"},
        {text: "Reach +/- over 20", value: "50/110"},
        {text: "Reach 10 assists", value: "50/110"},
        {text: "Reach 3 Blocks", value: "50/110"},
        {text: "Reach 3 Steals", value: "50/120"},
        {text: "Reach a Tripple double", value: "50/150"}
      ],
      TEAM: [
        {text: "Team Field goal attempts", value: "2/10"},
        {text: "Team Field Goal %", value: "10/20"},
        {text: "Team Def. Rebounds", value: "10/20"},
        {text: "Team Off. Rebounds", value: "20/40"},
        {text: "Team Free-throws taken", value: "20/40"},
        {text: "Team steals", value: "20/40"},
        {text: "Team blocks", value: "20/40"},
        {text: "Team assists", value: "30/60"},
        {text: "Team Points in the Paint", value: "30/60"},
        {text: "Team Points off Turnovers", value: "30/60"},
        {text: "Team Fast Break Points", value: "40/90"},
        {text: "Team Turnovers (less wins)", value: "40/90"},
        {text: "Team fouls (less wins)", value: "40/90"}
      ],
      WILD_CARD: [
        {text: "MN has most fast break points", value: "2/10"},
        {text: "MN win tip off", value: "10/30"},
        {text: "MN wins by 5+ points", value: "10/30"},
        {text: "Other team misses 2 free-throws in a row", value: "20/50"},
        {text: "MN has the biggest lead of the game", value: "20/50"},
        {text: "First MN FG is a 2 pointer.", value: "40/80"},
        {text: "First MN FG is a 3 pointer", value: "40/100"},
        {text: "MN wins by 10+ points", value: "40/100"},
        {text: "Technical foul is called this game (either team)", value: "40/120"},
        {text: "Flagrant foul is called this game (either team)", value: "50/150"},
        {text: "Game goes into overtime", value: "50/150"},
        {text: "MN wins by 20+ points", value: "50/200"},
        {text: "Half+ court shot made", value: "50/250"}
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

  const lines = teamsData[league]?.categories[category];
  if (lines) {
    lineSelect.innerHTML = '<option value="">Select Line</option>';
    lines.forEach(line => {
      const [wager, win] = line.value.split('/');
      // Display as (wager/win) followed by bet text
      lineSelect.innerHTML += `<option value="${line.value}">(${wager}/${win}) ${line.text}</option>`;
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
  let totalCost = 0;

  for (let i = 1; i <= 3; i++) {
    const category = document.getElementById(`category${i}`).value;
    const lineSelect = document.getElementById(`line${i}`);
    const line = lineSelect.options[lineSelect.selectedIndex]?.value;
    const lineText = lineSelect.options[lineSelect.selectedIndex]?.text;
    const player = document.getElementById(`player${i}`).value;

    // Validate player selection for INDIVIDUAL and STAT_HUNTING categories.
    if (["INDIVIDUAL", "STAT_HUNTING"].includes(category) && !player) {
      alert("Please select a player for bet " + i);
      return;
    }

    if (line) {
      const [cost] = line.split('/');
      totalCost += parseInt(cost, 10);
      bets.push({ line, lineText, player: player || 'N/A' });
    }
  }

  if (league && awayTeam && homeTeam && bets.length > 0) {
    const betLines = bets.map(bet => 
      `<div class="bet-line">${bet.lineText} : ${bet.player !== 'N/A' ? bet.player : ''}</div>`
    ).join("");
    const receiptContent = `
      <div class="matchup">
        ${awayTeam} @ ${homeTeam}
      </div>
      ${betLines}
      <div class="wager-total">Wager: ${totalCost} 💷</div>
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