// Add arrays linking each entertainment category to its options.
const entertainmentOptions = {
  "Spin the wheel PVP Games": ["0. NONE",   
    "3ON3 FREESTYLE (3on3 mode online)(5 games) 🟢",
    "Animal Royal (quickplay)",
    "Apex Legends (quickplay)",
    "Destiny 2 Crucible (competative) 🟢",
    "Escape Academy (PvP mode) (no longer on gamepass)",
    "ExoPrimal ( quickplay PvP only)",
    "Fallguys ( doubles ) 🟢",
    "FIFA ( online)(1- 6min qtrs. game Hard difficulty)",
    "Fortnite (doubles)",
    "Gears 5 (pvp quickplay)",
    "Halo Infinite (tactical slayer ranked) 🟢",
    "HAWKED! (quickplay)",
    "Headbangers: Rhythm Royale (quickplay) (no longer on gamepass)",
    "Hunt showdown 1896 (Time to beat) - {battle royal}",
    "Naraka: Bladepoint (quickplay)",
    "NBA 2k (4 3v3 games)",
    "Overwatch 2 (ranked) 🟢",
    "Paladins (quickplay)",
    "POWERSTAR Golf ( back 9, Bingwa pick coarse) 🟢",
    "Predecessor (quickplay)",
    "PUBG: Battlegrounds (quickplay)",
    "ROCKET LEAGUE (quickplay)",
    "Rogue Company (quickplay)",
    "Smite (quickplay)",
    "Sonic all-star racing (quickplay)",
    "Splitgate (quickplay)",
    "Star Wars Battlefront (quickplay)",
    "The Finals (quickplay)",
    "Titanfall 2 (quickplay)",
    "Valorant (ranked) 🟢🟢",
    "WILDSTYLE Board game"],

  "Spin the wheel Co-op Games": ["0. NONE", 
    "33 Immortals",
    "Army of 2 (XBOX 360)",
    "As Dusk falls",
    "Battle Toads 🟢",
    "Broforce",
    "Brothers 🏆",
    "Chariot",
    "Common'hood (24 hrs) - {simulation} (no longer on gamepass)",
    "Darksiders Genesis",
    "DayZ",
    "Deep Rock Galactic, ROCK AND STONE!",
    "Diablo 3: reaper of souls",
    "Diablo IV 🟢🟢🟢",
    "Divinity 2: Original sin",
    "Dune: Spice Wars 🟢",
    "Endless Dungeon 🟢",
    "Escape Academy",
    "ExoPrimal",
    "Fallout 76",
    "Generation Zero (50hrs) - {FPS Survival}",
    "Grounded",
    "How to survive 2: Storm warning edition",
    "Human Fall Flat",
    "Ilo and Milo",
    "IT TAKES TWO 🏆",
    "Knights on Bikes (not available currently on gamepass)",
    "Legendary: Marvel Card Game",
    "Livelock",
    "LOVERS In A Dangerous Spacetime 🏆",
    "Marvel ultimate alliance",
    "Marvel Ultimate Alliance 3: The Black Order (13hrs) - {action}",
    "Marvel's Avengers",
    "Minecraft Dungeons",
    "Monster hunter rise",
    "NBA2k (WNBA Season)",
    "Out of Space Couch Edition",
    "OUTRIDERS",
    "overcooked",
    "Palworld",
    "Payday 2 Crimewave",
    "Photosynthesis",
    "Plate UP! 🟢",
    "PORTAL 2 🏆",
    "Red Dead Redemption 2, story missions",
    "Redfall 🏆",
    "Resident evil revelation 2",
    "Sea of thieves",
    "Space lines fare out 🏆",
    "State of Decay 2",
    "Stranded Deep (not available currently on gamepass)",
    "Streets of rage 4 (not available currently on gamepass)",
    "Terraria",
    "Tetris (quickplay)",
    "The ASCENT 🏆",
    "TMNT: Shredders Revenge",
    "Unravel 2 🏆",
    "Valheim",
    "Vampire survivors 🟢🟢",
    "WarFrame",
    "Wilmonts Warehouse",
    "ZHEROS",
    "Zombie Warrior 4: Dead War"],
    // Add more categories and options as needed.
  "Spin the wheel Loot Boxes": ["0. NONE", 
    "YOU FOUND!! 1 XBOX series X's (Continue until 2 are claimed)",
    "YOU FOUND!! Bathroom clock (hide after spin)",
    "YOU FOUND!! FBSPORT Ping pong net (hide after spin) - $19.99",
    "YOU FOUND!! First floor clock (hide after spin)",
    "YOU FOUND!! Kitchen scissors (hide after spin)",
    "YOU FOUND!! massage equipment (continues)",
    "YOU FOUND!! New Alexa component (Continues)",
    "YOU FOUND!! New bed comforter (hide after spin)",
    "YOU FOUND!! new bed sheets (hide after spin)",
    "YOU FOUND!! new computer monitor (hide after 2 are found) - $150 🟢",
    "YOU FOUND!! New living room TV! (hide after spin)",
    "YOU FOUND!! New Robes (hide after spin)",
    "YOU FOUND!! New Salt rock light (hide after spin)",
    "YOU FOUND!! New treadmill (hide after spin)",
    "YOU FOUND!! New yoga mats (hide after spin)",
    "YOU FOUND!! Poached egg maker cozilife (hide after spin) - $10.97",
    "YOU FOUND!! Splatoon 3 (hide after spin)",
    "YOU FOUND!! Steering wheel cover (hide after spin)",
    "YOU FOUND!! Switch SPORTS equipment pack (hide after spin)",
    "YOU FOUND!! VASAGLE Laundry Hamper (hide after spin) - $34.31 🟢",
    "YOU FOUND!!: Dimmable front room lights (hide after spin)",
    "zYOU FOUND!! 10 or 20-gallon fish tank, 30x15 max (hide after spin) 🔴",
    "zYOU FOUND!! Bathroom rugs (hide after spin) 🔴",
    "zYOU FOUND!! Cupping Therapy Set (hide after spin) 🔴",
    "zYOU FOUND!! Golf wedge (found) 🔴",
    "zYOU FOUND!! New Basketball (Found) 🔴",
    "zYOU FOUND!! New Kitchen mat (hide after spin) 🔴",
    "zYOU FOUND!! New Microphone for RockBand (hide after spin) 🔴",
    "zYOU FOUND!! Outlet extender/adapter (hide after spin) 🔴",
    "zYOU FOUND!! Samsung Soundbar (hide after spin) 🔴",
    "zYOU FOUND!! Storage Freezer for the basement (found) 🔴"],
   // Add more categories and options as needed.
  "Single Player Games": ["0. NONE", 
    "(((Action/Adventure)))",
    "Alan Wake (14 hrs) - {Action Adventure} game pass",
    "Broken Age (10hrs - 13hrs)",
    "Creatures of Ava (20hrs)",
    "Disco Elysium (60hrs) - {RPG}",
    "Firewatch (4hrs - 5hrs)",
    "Flintlock: Siege of the Dawn (20hrs)",
    "Hauntii (8-14hrs) - {Action/Adventure}",
    "Kunitsu-Gami: Path of the Goddess (34hrs) - {Action}",
    "The inner world (6hrs - 8hrs)",
    "The Rewinder (5hrs) - {Adventure}",
    "TUNIC (12-20hrs)",
    "zHellblade: Senua's Sacrifice (8hrs - 9hrs) 🔴",
    "zReCore: Definitive Edition (Time to beat) 🔴",
    "zSenua's Saga Hellblade 2 (May 21 - 9hrs) 🔴",
    "zStarfield (100hrs) - {RPG} 🔴",
    "(((Fighting)))",
    "(((First Person Shooter)))",
    "(((Horror)))",
    "(((Platformer)))",
    "Fe (12hrs - 15hrs)",
    "Gris (4hrs - 6hrs)",
    "zJusant (3hrs - 5hrs) 🔴",
    "(((Puzzle)))",
    "Planet of Lana (5-6hrs)",
    "Spirit of the North: Enhanced Edition (6-8hrs)",
    "(((Retro)))",
    "(((RPG)))",
    "Dragon Age: The Veilguard (Time to beat) - 2024",
    "Dragon Age: Inquisition (40-88hrs)",
    "Nine Sols (30hrs) - {Action RPG - Soulslike}",
    "The Outer Worlds (15-40hrs)",
    "(((Rouge Like)))",
    "(((Shooter Vehicle/Twin stick)))",
    "(((Survival )))",
    "(((Stealth)))",
    "We Happy Few (21hrs - 66hrs)",
    "(((Strategy)))",
    "The Wandering Village (not on gamepass) (10-18hrs)",
    "(((Sports/Racing)))",
    "(((Visual novel/Graphic adventure)))",
    "As Dusk Falls (6.5hrs - 13hrs)"],
  // Add more categories and options as needed.
  "Bingwa Movie Night": ["0. NONE", 
    "🎥(((Romance/Romantic Comedy)))🎥",
    "13 going on 30 (Netflix) 1hr37m",
    "Benny and Joon (Prime) 1hr38mn 👀",
    "Breakfast at Tiffany's (Paramount+) 115 minutes",
    "Casablanca (HBO Max) 102 minutes",
    "Crazy Rich Asians (HBO Max) - 113 minutes",
    "Cyrano (Prime) 2hr3m",
    "Date Night (Prime) 1hr26m 👀",
    "Garden State (Hulu) 1hr42m 👀",
    "I Want You Back (Prime) 1hr57m 👀",
    "In the Mood for Love (HBO Max) 99 minutes",
    "Licorice Pizza (Prime) 2hr13m",
    "Little Fish (Hulu) 1hr41m 👀",
    "Morris from America (HBO) 1h30m",
    "Needle in a Timestack (Prime) 1h 51m 👀",
    "Paris Can Wait (Hulu, Starz, Kanopy) 1h 32m",
    "Plus One (Netflix) 1hr38m 👀",
    "Pride and Prejudice (2005) (Hulu) 129 minutes",
    "Racing with the Moon (Prime) 1hr48m",
    "Rust and Bone (HBO Max, Criterion Channel) 2h 0m",
    "She's all that (Netflix) 1hr35m",
    "Sixteen Candles (Prime) 1h32m",
    "The Fault in Our Stars (Hulu) - 125 minutes",
    "The King's Speech (Hulu) - 118 minutes",
    "The Lovebirds (Netflix) 1hr27min 👀",
    "The Lunchbox (HBO Max, Mubi, Kanopy) 1h 44m",
    "The Proposal (Hulu) - 108 minutes",
    "The Shape of Water (Prime) 2h3m 👀",
    "Three Thousand Years of Longing (Prime) Duration 1h48m - {Fantasy/Romance}",
    "Vanilla Sky (prime) 2h 25m 👀",
    "We Live in Time (Prime - pay) Duration 1h47m - {Romantic Drama}",
    "When Harry Met Sally (HBO Max) 126 minutes",
    "🎥(((Drama/Thrillers)))🎥",
    "Chungking Express (Prime) Duration 1h43m -  {Drama}👀",
    //... (Rest of the Drama/Thrillers)
    "🎥(((Sci-Fi/Fantasy)))🎥",
    "13 lives (Prime) 2h27m",
    //... (Rest of the Sci-Fi/Fantasy)
    "🎥(((Action Adventure/Crime)))🎥",
    "Adventures in babysitting (Disney+) 1h42m 👀",
    //... (Rest of the Action Adventure/Crime)
    "🎥(((Horror)))🎥",
    "1922 (Netflix) 1h41m",
    //... (Rest of the Horror)
    "🎥(((Comedy/Comedy Horror/Dark Comedy)))🎥",
    "Asteroid City (PRIME) 1h45m 👀",
    //... (Rest of the Comedy/Comedy Horror/Dark Comedy)
    "🎥(((Documentary/Biography)))🎥",
    "American Movie (HBO Max) - 111 minutes 👀",],
  // Add more categories and options as needed.
  "Anime Shows": ["0. NONE",
     "Anime Option A", "Anime Option B"],
  // Add more categories and options as needed.
  "Sunday Morning Shows": ["0. NONE",
     "Morning Option A", "Morning Option B"],
  // Add more categories and options as needed. 
  "Sunday Night Shows": ["0. NONE",
     "Night Option A", "Night Option B"],
  // Add more categories and options as needed.
  "YouTube Theater": ["0. NONE", 
    "YouTube Option A", "YouTube Option B"]
};

// Set default user type
let userType = "KUSHINDWA";

document.addEventListener('DOMContentLoaded', () => {
  
  // Populate each category's select boxes with options from the corresponding array.
  document.querySelectorAll('#entertainment .category').forEach(cat => {
    const catName = cat.getAttribute('data-category');
    const optionsArray = entertainmentOptions[catName] || [];
    cat.querySelectorAll('.ent-select').forEach(select => {
      select.innerHTML = '';
      optionsArray.forEach(optionText => {
        const opt = document.createElement('option');
        opt.value = optionText.split(' ')[0]; // use first token as value
        opt.text = optionText;
        select.appendChild(opt);
      });
      // Add change listener to update this category's total when option changes
      select.addEventListener('change', () => {
        updateCategoryTotal(cat);
      });
    });
  });
  
  // Add dropdown-based user type listener.
  const userTypeDropdown = document.getElementById('user-type');
  if (userTypeDropdown) {
    userTypeDropdown.addEventListener('change', (e) => {
      userType = e.target.value;
      if (userType === "BINGWA") {
        document.body.classList.add('bingwa-theme');
      } else {
        document.body.classList.remove('bingwa-theme');
      }
      // Update all category totals after multiplier change.
      document.querySelectorAll('#entertainment .category').forEach(cat => {
        updateCategoryTotal(cat);
      });
    });
  }
  
  // Helper function to update a category's total cost.
  function updateCategoryTotal(categoryDiv) {
    // Determine cost multiplier based on user type.
    const multiplier = (userType === "KUSHINDWA") ? 30 : 20;
    let count = 0;
    categoryDiv.querySelectorAll('.ent-select').forEach(select => {
      if (select.selectedIndex > 0) {
        count++;
      }
    });
    // Update the visible total inside the category div.
    const totalElem = categoryDiv.querySelector('.category-total');
    if (totalElem) {
      totalElem.textContent = `${count * multiplier} 💷`;
    }
  }
  
  const submitBtn = document.getElementById('ent-submit');
  const summaryDiv = document.getElementById('ent-summary');
  
  submitBtn.addEventListener('click', () => {
    console.log('Submit button clicked');
    try {
      let summaryHTML = '<hr><h2>ErgoShop Summary:</h2><ul>';
      let overallTotal = 0;
      
      // Process each category and accumulate totals.
      document.querySelectorAll('.category').forEach(cat => {
        const catName = cat.getAttribute('data-category');
        const selects = cat.querySelectorAll('.ent-select');
        let selections = [];
        let catCount = 0;
        selects.forEach(select => {
          if (select.selectedIndex > 0) {
            selections.push(select.options[select.selectedIndex].text);
            catCount++;
          }
        });
        // Determine cost multiplier based on user type.
        const multiplier = (userType === "KUSHINDWA") ? 30 : 20;
        const catTotal = catCount * multiplier;
        overallTotal += catTotal;
        if (selections.length > 0) {
          // Use <u> tags to underline the category and <br> for each option.
          summaryHTML += `<li><strong><u>${catName}:</u></strong><br>${selections.join('<br>')} - <em>${catTotal} 💷</em></li><br>`;
        }
      });
      
      const cashout = document.getElementById('cashout-input').value;
      summaryHTML += '</ul>';
      summaryHTML += `<p><hr><strong> TOTAL:</strong><span style="color: gold; font-weight: bold;"> ${overallTotal}💷</span> </p>`;
      summaryHTML += `<p><strong>Cashout Request:</strong> <span style="color: gold; font-weight: bold;">${cashout} 💷</span></p>`;
      summaryHTML += '<hr>';
      
      summaryDiv.innerHTML = summaryHTML;
      summaryDiv.style.display = 'block';
      console.log('Submit processing complete');
    } catch(err) {
      console.error('Error during submit processing:', err);
    }
  });
  
  // New: When summary is clicked, capture its screenshot.
  summaryDiv.addEventListener('click', () => {
    captureScreenshot(summaryDiv);
  });

});