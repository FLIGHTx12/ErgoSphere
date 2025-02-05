document.addEventListener('DOMContentLoaded', (event) => {
    updateTeamsAndLines();
  });
  
  const teams = {
    "NFL": {
      "name": "Minnesota Vikings",
      "lines": {
        "INDIVIDUAL": [
          {"text": "(10/50) Pick Most catches:", "value": "40"},
          {"text": "(10/50) Pick Most TDs Scored (non QB):", "value": "40"},
          {"text": "(20/70) Pick Most INTs:", "value": "50"},
          {"text": "(20/70) Pick Most Sacs:", "value": "50"},
          {"text": "(30/100) Pick Most yards Overall:", "value": "70"},
          {"text": "(30/100) Pick Most Tackles:", "value": "70"}
        ],
        "STAT HUNTING": [
          {"text": "(10/30) Reach 220 Passing:", "value": "20"},
          {"text": "(10/30) Reach 50 Rushing:", "value": "20"},
          {"text": "(20/50) Reach 2 FG made (non extra point):", "value": "30"},
          {"text": "(20/70) Reach 1 Sack:", "value": "50"},
          {"text": "(20/70) Reach 1 INT:", "value": "50"},
          {"text": "(15/80) Reach 320 Passing:", "value": "65"},
          {"text": "(15/80) Reach 100 Rushing:", "value": "65"},
          {"text": "(10/85) Reach 4 FG made:", "value": "75"},
          {"text": "(10/90) Reach 2 Sacks:", "value": "80"},
          {"text": "(10/110) Reach 2 INT:", "value": "100"}
        ],
        "TEAM": [
          {"text": "(20/40) Team Running Yards", "value": "20"},
          {"text": "(20/40) Team Passing Yards", "value": "20"},
          {"text": "(20/50) Team Yards Overall", "value": "30"},
          {"text": "(20/50) Team Interceptions (def)", "value": "30"},
          {"text": "(30/70) Team Sacks (def)", "value": "40"},
          {"text": "(30/70) Team Most Possession Time", "value": "40"},
          {"text": "(40/90) Team 4th down conversions (0/0 tie is a loss)", "value": "50"}
        ],
        "WILD CARD": [
          {"text": "(2/30) Other team misses a Field goal in the 4th", "value": "28"},
          {"text": "(15/30) 1st TD is a run play", "value": "15"},
          {"text": "(20/50) Other team does the Griddy at some point during game (on tv)", "value": "30"},
          {"text": "(10/50) First Vikings possession is a TD or FG", "value": "40"},
          {"text": "(10/60) QB touchdown for Vikings", "value": "50"},
          {"text": "(30/70) Vikings lead going into halftime", "value": "40"},
          {"text": "(20/90) Defensive TD Vikings", "value": "70"},
          {"text": "(10/100) Kick return for a TD", "value": "90"}
        ]
      },
      "players": ["Kirk Cousins", "Justin Jefferson", "Dalvin Cook", "Danielle Hunter", "Harrison Smith"]
    },
    "WNBA": {
      "name": "Minnesota Lynx",
      "lines": {
        "INDIVIDUAL": [
          {"text": "(2/5) Pick FG attempted:", "value": "3"},
          {"text": "(2/10) Pick FG made:", "value": "8"},
          {"text": "(5/10) Pick blocks:", "value": "5"},
          {"text": "(10/20) Pick Most Points:", "value": "10"},
          {"text": "(20/40) Pick Most Assist:", "value": "20"},
          {"text": "(20/40) Pick Most Rebounds:", "value": "20"},
          {"text": "(30/60) Pick Most Steals:", "value": "30"},
          {"text": "(40/90) Pick Most Threes Made:", "value": "50"}
        ],
        "STAT HUNTING": [
          {"text": "(10/30) Reach 20 points:", "value": "20"},
          {"text": "(10/30) Reach 6 rebounds:", "value": "20"},
          {"text": "(10/30) Reach 3 Three Pointers Made:", "value": "20"},
          {"text": "(20/50) Reach 6 assists:", "value": "30"},
          {"text": "(20/50) Reach 2 Blocks:", "value": "30"},
          {"text": "(20/50) Reach +/- over 10:", "value": "30"},
          {"text": "(30/70) Reach 2 Steals:", "value": "40"},
          {"text": "(40/90) Reach 30 points:", "value": "50"},
          {"text": "(40/90) Reach 11 rebounds:", "value": "50"},
          {"text": "(40/90) Reach 4 Three Pointers Made:", "value": "50"},
          {"text": "(50/110) Reach +/- over 20:", "value": "60"},
          {"text": "(50/110) Reach 10 assists:", "value": "60"},
          {"text": "(50/110) Reach 3 Blocks:", "value": "60"},
          {"text": "(50/120) Reach 3 Steals:", "value": "70"}
        ],
        "TEAM": [
          {"text": "(2/10) Team Field goal attempts", "value": "8"},
          {"text": "(10/20) Team Field Goal %", "value": "10"},
          {"text": "(10/20) Team Def. Rebounds", "value": "10"},
          {"text": "(20/40) Team Off. Rebounds", "value": "20"},
          {"text": "(20/40) Team Free-throws taken", "value": "20"},
          {"text": "(20/40) Team steals", "value": "20"},
          {"text": "(20/40) Team blocks", "value": "20"},
          {"text": "(30/60) Team assists", "value": "30"},
          {"text": "(30/60) Team Points in the Paint", "value": "30"},
          {"text": "(30/60) Team Points off Turnovers", "value": "30"},
          {"text": "(40/90) Team Fast Break Points", "value": "50"},
          {"text": "(40/90) Team Turnovers (less wins)", "value": "50"},
          {"text": "(40/90) Team fouls (less wins)", "value": "50"}
        ],
        "WILD CARD": [
          {"text": "(2/10) MN has most fast break points", "value": "8"},
          {"text": "(10/30) MN win tip off", "value": "20"},
          {"text": "(20/50) Other team misses 2 free-throws in a row", "value": "30"},
          {"text": "(20/50) MN has the biggest lead of the game", "value": "30"},
          {"text": "(40/80) First MN FG is a 2 pointer.", "value": "40"},
          {"text": "(40/100) First MN FG is a 3 pointer", "value": "60"},
          {"text": "(40/120) Technical foul is called this game (either team)", "value": "80"},
          {"text": "(50/150) Flagrant foul is called this game (either team)", "value": "100"},
          {"text": "(50/250) Half court shot made (either team)", "value": "200"}
        ]
      },
      "players": ["Napheesa Collier", "Kayla McBride", "Diamond Miller", "Aerial Powers", "Jessica Shepard"]
    },
    "NBA": {
      "name": "Minnesota Timberwolves",
      "lines": {
        "INDIVIDUAL": [
          {"text": "(2/5) Pick FG attempted:", "value": "3"},
          {"text": "(2/10) Pick FG made:", "value": "8"},
          {"text": "(5/10) Pick blocks:", "value": "5"},
          {"text": "(10/20) Pick Most Points:", "value": "10"},
          {"text": "(20/40) Pick Most Assist:", "value": "20"},
          {"text": "(20/40) Pick Most Rebounds:", "value": "20"},
          {"text": "(30/60) Pick Most Steals:", "value": "30"},
          {"text": "(40/90) Pick Most Threes Made:", "value": "50"}
        ],
        "STAT HUNTING": [
          {"text": "(10/30) Reach 20 points:", "value": "20"},
          {"text": "(10/30) Reach 6 rebounds:", "value": "20"},
          {"text": "(10/30) Reach 3 Three Pointers Made:", "value": "20"},
          {"text": "(20/50) Reach 6 assists:", "value": "30"},
          {"text": "(20/50) Reach 2 Blocks:", "value": "30"},
          {"text": "(20/50) Reach +/- over 10:", "value": "30"},
          {"text": "(30/70) Reach 2 Steals:", "value": "40"},
          {"text": "(40/90) Reach 30 points:", "value": "50"},
          {"text": "(40/90) Reach 11 rebounds:", "value": "50"},
          {"text": "(40/90) Reach 4 Three Pointers Made:", "value": "50"},
          {"text": "(50/110) Reach +/- over 20:", "value": "60"},
          {"text": "(50/110) Reach 10 assists:", "value": "60"},
          {"text": "(50/110) Reach 3 Blocks:", "value": "60"},
          {"text": "(50/120) Reach 3 Steals:", "value": "70"}
        ],
        "TEAM": [
          {"text": "(2/10) Team Field goal attempts", "value": "8"},
          {"text": "(10/20) Team Field Goal %", "value": "10"},
          {"text": "(10/20) Team Def. Rebounds", "value": "10"},
          {"text": "(20/40) Team Off. Rebounds", "value": "20"},
          {"text": "(20/40) Team Free-throws taken", "value": "20"},
          {"text": "(20/40) Team steals", "value": "20"},
          {"text": "(20/40) Team blocks", "value": "20"},
          {"text": "(30/60) Team assists", "value": "30"},
          {"text": "(30/60) Team Points in the Paint", "value": "30"},
          {"text": "(30/60) Team Points off Turnovers", "value": "30"},
          {"text": "(40/90) Team Fast Break Points", "value": "50"},
          {"text": "(40/90) Team Turnovers (less wins)", "value": "50"},
          {"text": "(40/90) Team fouls (less wins)", "value": "50"}
        ],
        "WILD CARD": [
          {"text": "(2/10) MN has most fast break points", "value": "8"},
          {"text": "(10/30) MN win tip off", "value": "20"},
          {"text": "(20/50) Other team misses 2 free-throws in a row", "value": "30"},
          {"text": "(20/50) MN has the biggest lead of the game", "value": "30"},
          {"text": "(40/80) First MN FG is a 2 pointer.", "value": "40"},
          {"text": "(40/100) First MN FG is a 3 pointer", "value": "60"},
          {"text": "(40/120) Technical foul is called this game (either team)", "value": "80"},
          {"text": "(50/150) Flagrant foul is called this game (either team)", "value": "100"},
          {"text": "(50/250) Half court shot made (either team)", "value": "200"}
        ]
      },
      "players": ["Anthony Edwards", "Rudy Gobert", "Karl-Anthony Towns", "Kyle Anderson", "Mike Conley"]
    }
  };
  
  function updateTeamsAndLines() {
    const leagueSelect = document.getElementById("league");
    const ourTeamSelect = document.getElementById("ourTeam");
    const categorySelects = document.querySelectorAll(".category-select");
    const lineSelects = document.querySelectorAll(".line-select");
  
    ourTeamSelect.innerHTML = '<option value="">Select Team</option>';
    categorySelects.forEach(select => (select.innerHTML = '<option value="">Select Category</option>'));
    lineSelects.forEach(select => (select.innerHTML = '<option value="">Select Line</option>'));
  
    const league = leagueSelect.value;
    if (league) {
      const ourTeam = teams[league].name;
      ourTeamSelect.innerHTML = `<option value="${ourTeam}">${ourTeam}</option>`;
      updateLines(); // This line is crucial! It triggers the update of the lines based on the selected team
    }
  }
  
  function updateLines() {
    const league = document.getElementById("league").value;
    const categorySelects = document.querySelectorAll(".category-select"); 
    const lineSelects = document.querySelectorAll(".line-select");
  
    categorySelects.forEach(select => {
      select.innerHTML = '<option value="">Select Category</option>';
      if (league) {
        Object.keys(teams[league].lines).forEach(category => {
          select.innerHTML += `<option value="${category}">${category}</option>`;
        });
      }
    });
  
    lineSelects.forEach((select, index) => {
      const category = categorySelects[index].value; // Access the correct category value
      select.innerHTML = '<option value="">Select Line</option>';
      if (league && category) {
        teams[league].lines[category].forEach(line => {
          select.innerHTML += `<option value="${line.value}">${line.text}</option>`;
        });
      }
    });
  }
  
  function updatePlayerOptions(betNum) {
    const league = document.getElementById("league").value;
    const category = document.getElementById(`category${betNum}`).value;
    const playerSelect = document.getElementById(`player${betNum}`);
  
    playerSelect.innerHTML = '<option value="">Select Player</option>';
  
    if (league && category && ["INDIVIDUAL", "STAT HUNTING"].includes(category)) {
      teams[league].players.forEach(player => {
        playerSelect.innerHTML += `<option value="${player}">${player}</option>`;
      });
    }
  }
  
  function submitBets() {
    const league = document.getElementById("league").value;
    const ourTeam = document.getElementById("ourTeam").value;
    const bets = []; // Initialize bets array correctly
  
    for (let i = 1; i <= 3; i++) {
      const category = document.getElementById(`category${i}`).value;
      const line = document.getElementById(`line${i}`).value;
      const player = document.getElementById(`player${i}`).value;
      if (category && line) {
        if (["INDIVIDUAL", "STAT HUNTING"].includes(category) && !player) {
          alert("Please select a player for INDIVIDUAL and STAT HUNTING categories.");
          return;
        }
        bets.push({ category, line, player });
      }
    }
  
    if (league && ourTeam && bets.length === 3) {
      const receiptContent = `League: ${league}\nOur Team: ${ourTeam}\n\nBets:\n${bets
      .map(bet => `${bet.category} - ${bet.line} ${bet.player ? `- ${bet.player}` : ""}`)
      .join("\n")}`;
      document.getElementById("receipt-content").textContent = receiptContent;
    } else {
      alert("Please complete all selections before submitting.");
    }
  }