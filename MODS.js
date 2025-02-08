document.addEventListener('DOMContentLoaded', () => {
    const gameOptions = ["Select", "🏸Badminton ", "🏀Basketball - 1 game 2-on-2 ", "🏀Basketball - best of 3 shooting game", "🎳Bowling - 1 special game ",
    "🎳Bowling - 1 standard game ", "Brawlhalla ", "Brawlout ", "Clash ", "Dead or Alive 5 ", "Destiny 2 Crucible ", "Escape Academy ",
    "Fallguys ", "Fight Night Champion ", "Guilty Gear Strive ", "⛳Golf ", "Halo Infinite ", "Injustice 2 ", "Killer Instinct ",
    "Killer Instinct 2 ", "Killer Instinct Classic ", "Marvel Vs. Capcom 3 ", "Marvel Vs. Capcom Infinite ", "Mortal Kombat 1 ",
    "Mortal Kombat 11 ", "Mortal Kombat 2011 ", "Mortal Kombat X ", "Nidhogg 2 ", "⚽Soccer ", "Smash Brothers ", "Super Street Fighter IV ",
    "Tekken 6 ", "Tekken 7 ", "Tekken Tag Tournament 2 ", "🎾Tennis ", "Tetris", "The King Of Fighters XIII ", "UFC ", "Virtua Fighters 5 ",
    "🏐Volleyball "];
  
    function populateSelect(selectElement) {
      gameOptions.forEach(optText => {
        const option = document.createElement("option");
        option.value = optText === "Select" ? 0 : optText;
        option.text = optText;
        selectElement.appendChild(option);
      });
    }
  
    const selectIds = ["gameSelect1", "gameSelect2", "gameSelect3", "gameSelect4", "gameSelect5"];
    selectIds.forEach(id => {
      const selectElement = document.getElementById(id);
      if(selectElement) {
        populateSelect(selectElement);
      }
    });
  });
