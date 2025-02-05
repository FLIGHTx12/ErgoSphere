const teams = {
    nfl: [
      "Minnesota Vikings", "Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills", 
      "Carolina Panthers", "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns",
      "Dallas Cowboys", "Denver Broncos", "Detroit Lions", "Green Bay Packers",
      "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs",
      "Las Vegas Raiders", "Los Angeles Chargers", "Los Angeles Rams", "Miami Dolphins",
      "New England Patriots", "New Orleans Saints", "New York Giants",
      "New York Jets", "Philadelphia Eagles", "Pittsburgh Steelers", "San Francisco 49ers",
      "Seattle Seahawks", "Tampa Bay Buccaneers", "Tennessee Titans", "Washington Commanders"
    ],
    nba: [
      "Minnesota Timberwolves", "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets",
      "Chicago Bulls", "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets",
      "Detroit Pistons", "Golden State Warriors", "Houston Rockets", "Indiana Pacers",
      "Los Angeles Clippers", "Los Angeles Lakers", "Memphis Grizzlies", "Miami Heat",
      "Milwaukee Bucks",  "New Orleans Pelicans", "New York Knicks",
      "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns",
      "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors",
      "Utah Jazz", "Washington Wizards"
    ],
    wnba: [
      "Minnesota Lynx", "Atlanta Dream", "Chicago Sky", "Connecticut Sun", "Dallas Wings",
      "Indiana Fever", "Las Vegas Aces", "Los Angeles Sparks", 
      "New York Liberty", "Phoenix Mercury", "Seattle Storm", "Washington Mystics"
    ]
  };
  
  const teamsData = {
    NFL: {
      teams: teams.nfl,
      categories: {
        INDIVIDUAL: [
          {text: "Pick Most catches", value: "10/50"},
          {text: "Pick Most TDs Scored (non QB)", value: "10/50"},
          {text: "Pick Most INTs", value: "20/70"},
          {text: "Pick Most Sacs", value: "20/70"},
          {text: "Pick Most yards Overall", value: "30/100"},
          {text: "Pick Most Tackles", value: "30/100"}
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
      players: ["Player1", "Player2", "Player3"]
    },
    WNBA: {
      teams: teams.wnba,
      categories: {
        INDIVIDUAL: [
          {text: "Pick FG attempted", value: "2/5"},
          {text: "Pick FG made", value: "2/10"},
          {text: "Pick blocks", value: "5/10"},
          {text: "Pick Most Points", value: "10/20"},
          {text: "Pick Most Assist", value: "20/40"},
          {text: "Pick Most Rebounds", value: "20/40"},
          {text: "Pick Most Steals", value: "30/60"},
          {text: "Pick Most Threes Made", value: "40/90"}
        ],
        STAT_HUNTING: [
          {text: "Reach 20 points", value: "10/30"},
          {text: "Reach 6 rebounds", value: "10/30"},
          {text: "Reach 3 Three Pointers Made", value: "10/30"},
          {text: "Reach 6 assists", value: "20/50"},
          {text: "Reach 2 Blocks", value: "20/50"},
          {text: "Reach +/- over 10", value: "20/50"},
          {text: "Reach 2 Steals", value: "30/70"},
          {text: "Reach 30 points", value: "40/90"},
          {text: "Reach 11 rebounds", value: "40/90"},
          {text: "Reach 4 Three Pointers Made", value: "40/90"},
          {text: "Reach +/- over 20", value: "50/110"},
          {text: "Reach 10 assists", value: "50/110"},
          {text: "Reach 3 Blocks", value: "50/110"},
          {text: "Reach 3 Steals", value: "50/120"}
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
          {text: "Other team misses 2 free-throws in a row", value: "20/50"},
          {text: "MN has the biggest lead of the game", value: "20/50"},
          {text: "First MN FG is a 2 pointer.", value: "40/80"},
          {text: "First MN FG is a 3 pointer", value: "40/100"},
          {text: "Technical foul is called this game (either team)", value: "40/120"},
          {text: "Flagrant foul is called this game (either team)", value: "50/150"},
          {text: "Half court shot made (either team)", value: "50/250"}
        ]
      },
      players: ["Player1", "Player2", "Player3"]
    },
    NBA: {
      teams: teams.nba,
      categories: {
        INDIVIDUAL: [
          {text: "Pick FG attempted", value: "2/5"},
          {text: "Pick FG made", value: "2/10"},
          {text: "Pick blocks", value: "5/10"},
          {text: "Pick Most Points", value: "10/20"},
          {text: "Pick Most Assist", value: "20/40"},
          {text: "Pick Most Rebounds", value: "20/40"},
          {text: "Pick Most Steals", value: "30/60"},
          {text: "Pick Most Threes Made", value: "40/90"}
        ],
        STAT_HUNTING: [
          {text: "Reach 20 points", value: "10/30"},
          {text: "Reach 6 rebounds", value: "10/30"},
          {text: "Reach 3 Three Pointers Made", value: "10/30"},
          {text: "Reach 6 assists", value: "20/50"},
          {text: "Reach 2 Blocks", value: "20/50"},
          {text: "Reach +/- over 10", value: "20/50"},
          {text: "Reach 2 Steals", value: "30/70"},
          {text: "Reach 30 points", value: "40/90"},
          {text: "Reach 11 rebounds", value: "40/90"},
          {text: "Reach 4 Three Pointers Made", value: "40/90"},
          {text: "Reach +/- over 20", value: "50/110"},
          {text: "Reach 10 assists", value: "50/110"},
          {text: "Reach 3 Blocks", value: "50/110"},
          {text: "Reach 3 Steals", value: "50/120"}
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
          {text: "Other team misses 2 free-throws in a row", value: "20/50"},
          {text: "MN has the biggest lead of the game", value: "20/50"},
          {text: "First MN FG is a 2 pointer.", value: "40/80"},
          {text: "First MN FG is a 3 pointer", value: "40/100"},
          {text: "Technical foul is called this game (either team)", value: "40/120"},
          {text: "Flagrant foul is called this game (either team)", value: "50/150"},
          {text: "Half court shot made (either team)", value: "50/250"}
        ]
      },
      players: ["Player1", "Player2", "Player3"]
    }
  };
  
  function updateBets() {
    const league = document.getElementById("league").value;
    const categories = teamsData[league]?.categories;
    const players = teamsData[league]?.players;
    const leagueTeams = teamsData[league]?.teams || [];
  
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
    playerSelect.innerHTML = '<option value="">Select Player</option>';
  
    if (lines) {
      lineSelect.innerHTML = '<option value="">Select Line</option>';
      lines.forEach(line => {
        lineSelect.innerHTML += `<option value="${line.value}">${line.text}</option>`;
      });
    }
  
    if (["INDIVIDUAL", "STAT_HUNTING"].includes(category) && teamsData[league]?.players) {
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
    const bets = [];
    let totalCost = 0;
  
    for (let i = 1; i <= 3; i++) {
      const category = document.getElementById(`category${i}`).value;
      const line = document.getElementById(`line${i}`).value;
      const player = document.getElementById(`player${i}`).value;
  
      if (category && line) {
        const [cost, payout] = line.split('/');
        totalCost += parseInt(cost);
        bets.push({ category, line, player: player || 'N/A' });
      }
    }
  
    if (league && awayTeam && homeTeam && bets.length === 3) {
      const receiptContent = `
      ${awayTeam} @ ${homeTeam}\n
      ${bets.map(bet => `(${bet.line}) ${bet.category}: ${bet.player !== 'N/A' ? `${bet.player}` : ''}`).join("\n")}
      Wager: ${totalCost}
      `;
      document.getElementById("receipt-content").textContent = receiptContent;
    } else {
      alert("Please complete all selections before submitting.");
    }
  }