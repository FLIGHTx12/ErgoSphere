document.addEventListener("DOMContentLoaded", () => {
  // Removed inline monsters array; now using global window.monsters
  const monsters = window.monsters;

  const gameContainer = document.querySelector(".game-container");
  gameContainer.style.display = "flex";
  gameContainer.style.flexDirection = "column";
  gameContainer.style.alignItems = "center";

  const monsterButtonsContainer = document.getElementById("monsterButtons");
  const navbar = document.getElementById("navbar");
  let currentPlayer = 1;
  
  // Add fighter selection state
  let activeFighters = {
    jaybers8: true,
    flight: true
  };

  // Dual cursor integration
  let dualCursorActive = false;
  let simultaneousMode = false;

  let timerStarted = false;
  let timer;
  let audioDuration = 365; // Default duration, will be updated
  const gameOverAudio = new Audio('../assets/audio/hazzard.mp3');
  const fightMusic = new Audio('../assets/audio/ErgoArenaTheme.mp3');
  const healerSound = new Audio('../assets/audio/healer.mp3'); // Add healer sound
  fightMusic.loop = true; // loop the fight music
  fightMusic.volume = 0.5; // Set volume to 50% (adjust as needed)
  healerSound.volume = 0.7; // Set healer sound volume

  // Preload audio
  gameOverAudio.preload = 'auto';
  fightMusic.preload = 'auto';
  healerSound.preload = 'auto';

  // Function to attempt playing the audio
  function playFightMusic() {
    const playPromise = fightMusic.play();

    // Start the stars animation when music plays
    const movingStars = document.querySelector('.moving-stars');
    movingStars.classList.add('stars-animated');
    movingStars.style.animationDuration = '40s'; // Initial animation duration

    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Autoplay started!
        console.log("Fight music started playing.");
      }).catch(error => {
        // Autoplay was prevented.
        console.error("Autoplay prevented:", error);
        // Show a button to allow the user to start the music manually
        const playButton = document.createElement('button');
        playButton.textContent = 'Play Music';
        playButton.addEventListener('click', () => {
          fightMusic.play();
          // Also ensure animation starts when button is clicked
          document.querySelector('.moving-stars').classList.add('stars-animated');
          playButton.remove(); // Remove the button after it's clicked
        });
        document.body.appendChild(playButton); // Append the button to the body or another appropriate container
      });
    }
  }

  let keyHandlerBound = false; // Track if key handler is active

  // Key handler function
  function handleGameKeys(e) {
    // Only act if a monster is selected and visible
    const monsterContainers = document.querySelectorAll(".monster-container");
    const visibleContainer = Array.from(monsterContainers).find(c => c.style.display === "block");
    if (!visibleContainer) return;

    const attackButton = visibleContainer.querySelector("#attackButton");
    const playerToggle = visibleContainer.querySelector("#playerToggle");
    const addAttackButton = document.getElementById("addAttackButton");
    const removeAttackButton = document.getElementById("removeAttackButton");
    if (!attackButton || !playerToggle) return;

    // Tab: cycle between attack inputs for the current player only
    if (e.code === "Tab") {
      // Find current player (by attackButton text)
      let player = attackButton.textContent.includes("Jaybers8") ? 1 : 2;
      const inputContainer = visibleContainer.querySelector(`#attackInputs${player}`);
      if (inputContainer) {
        const inputs = Array.from(inputContainer.querySelectorAll('input[type="number"]'));
        if (inputs.length > 0) {
          e.preventDefault();
          // Find currently focused input
          const active = document.activeElement;
          let idx = inputs.indexOf(active);
          idx = (idx + 1) % inputs.length;
          inputs[idx].focus();
          inputs[idx].select && inputs[idx].select();
        }
      }
      return;
    }

    // + key: add attack input
    if (
      e.code === "NumpadAdd" ||
      (e.code === "Equal" && (e.shiftKey || e.key === "+")) ||
      (e.key === "+" && !e.ctrlKey && !e.altKey)
    ) {
      if (addAttackButton) {
        e.preventDefault();
        addAttackButton.click();
      }
      return;
    }

    // - key: remove attack input
    if (
      e.code === "NumpadSubtract" ||
      e.code === "Minus" ||
      (e.key === "-" && !e.ctrlKey && !e.altKey)
    ) {
      if (removeAttackButton) {
        e.preventDefault();
        removeAttackButton.click();
      }
      return;
    }

    if (e.code === "Space") {
      e.preventDefault();
      playerToggle.click(); // Changed: Space now switches players
    } else if (e.code === "Enter") {
      e.preventDefault();
      attackButton.click(); // Changed: Enter now attacks
    }
  }

  // Bind keys when game starts
  function bindGameKeys() {
    if (!keyHandlerBound) {
      document.addEventListener("keydown", handleGameKeys);
      keyHandlerBound = true;
    }
  }
  // Unbind keys when game ends
  function unbindGameKeys() {
    if (keyHandlerBound) {
      document.removeEventListener("keydown", handleGameKeys);
      keyHandlerBound = false;
    }
  }

  function startTimer() {
    const activeMonsterContainer = Array.from(document.querySelectorAll(".monster-container"))
                                     .find(c => c.style.display === "block");
    if (!activeMonsterContainer) {
        console.error("No active monster container found for timer.");
        return null;
    }
    const timerElement = activeMonsterContainer.querySelector("#timer"); 
    if (!timerElement) {
      console.error("Timer element not found in the active monster container!");
      return null;
    }

    // Clear any existing timer before starting a new one
    if (timer) {
        clearInterval(timer);
    }

    // Set initial time based on audio duration or default
    let timeLeft = audioDuration; // Start with default
    if (fightMusic.duration && fightMusic.duration !== Infinity) {
        timeLeft = Math.floor(fightMusic.duration);
        audioDuration = timeLeft; // Update global
    }

    // Function to update the timer display
    function updateTimerDisplay() {
        // Ensure timerElement is still valid
        if (!document.body.contains(timerElement)) {
            clearInterval(timer);
            return;
        }

        if (fightMusic.duration && fightMusic.duration !== Infinity && !fightMusic.paused) {
            // Use actual audio time if music is playing
            timeLeft = Math.max(0, Math.floor(fightMusic.duration - fightMusic.currentTime));
        } else {
            // Fallback countdown if audio not available or paused
            timeLeft = Math.max(0, timeLeft - 1);
        }
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        // Update star animation speed based on remaining time
        const movingStars = document.querySelector('.moving-stars');
        if (movingStars && movingStars.classList.contains('stars-animated')) {
            // Calculate animation duration: starts at 40s, decreases to 10s as timer approaches 0
            const totalDuration = audioDuration; // Total initial time
            const minAnimationDuration = 10; // Fastest animation in seconds
            const maxAnimationDuration = 40; // Slowest animation in seconds
            
            // Calculate percentage of time remaining and scale animation accordingly
            const timePercentage = timeLeft / totalDuration;
            const animationDuration = minAnimationDuration + (timePercentage * (maxAnimationDuration - minAnimationDuration));
            
            // Apply the new animation duration
            movingStars.style.animationDuration = `${animationDuration}s`;
        }

        if (timeLeft <= 0 && timerStarted) {
            clearInterval(timer);
            gameOver();
        }
    }

    // Set initial display
    const initialMinutes = Math.floor(timeLeft / 60);
    const initialSeconds = timeLeft % 60;
    timerElement.textContent = `${initialMinutes}:${initialSeconds < 10 ? '0' : ''}${initialSeconds}`;

    // Start the countdown
    timer = setInterval(updateTimerDisplay, 1000);

    // Update when audio metadata loads
    fightMusic.onloadedmetadata = () => {
        if (fightMusic.duration && fightMusic.duration !== Infinity) {
            timeLeft = Math.floor(fightMusic.duration);
            audioDuration = timeLeft;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    };

    bindGameKeys(); // Bind keys when timer starts (game starts)
    return timer;
  }
  function gameOver() {
    fightMusic.pause(); // Pause fight music
    fightMusic.currentTime = 0; // Reset to the beginning
    gameOverAudio.play();
    
    // Stop trivia system
    if (window.triviaManager) {
      window.triviaManager.stopTrivia();
    }
    
    const gameOverDiv = document.createElement("div");
    gameOverDiv.id = "gameOver";
    gameOverDiv.style.position = "fixed";
    gameOverDiv.style.top = "0";
    gameOverDiv.style.left = "0";
    gameOverDiv.style.width = "100%";
    gameOverDiv.style.height = "100%";
    gameOverDiv.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    gameOverDiv.style.display = "flex";
    gameOverDiv.style.flexDirection = "column";
    gameOverDiv.style.justifyContent = "center";
    gameOverDiv.style.alignItems = "center";
    gameOverDiv.style.color = "white";
    gameOverDiv.style.zIndex = "10000";

    const gameOverImage = document.createElement("img");
    gameOverImage.src = "../assets/img/backgrounds/YouDied.jpg";
    gameOverImage.style.maxWidth = "80%";
    gameOverImage.style.maxHeight = "80%";
    gameOverImage.onerror = function() {
      console.error("Error loading game over image:", this.src);
    };
    gameOverDiv.appendChild(gameOverImage);

    // Ensure currentMonster is defined before accessing its properties
    let currentMonster = monsters[document.getElementById("monsterDropdown").value];
    const punishmentText = document.createElement("p");
    punishmentText.innerHTML = currentMonster ? currentMonster.Punishment : "No punishment defined.";
    punishmentText.style.marginTop = "20px";
    punishmentText.style.fontSize = "1.5em";
    gameOverDiv.appendChild(punishmentText);

    // Add restart button
    const restartButton = document.createElement("button");
    restartButton.textContent = "Restart Game";
    restartButton.style.marginTop = "20px";
    restartButton.style.fontSize = "1.2em";
    restartButton.addEventListener("click", () => {
      location.reload(); // Reload the page to restart the game
    });
    gameOverDiv.appendChild(restartButton);

    document.body.appendChild(gameOverDiv);
    unbindGameKeys(); // Unbind keys when game ends
  }

  if (!document.getElementById("chooseOpponentBtn")) {
    const chooseOpponentBtn = document.createElement("button");
    chooseOpponentBtn.id = "chooseOpponentBtn";
    chooseOpponentBtn.textContent = "Choose Opponent";
    monsterButtonsContainer.appendChild(chooseOpponentBtn);

    // Create Choose Fighters button
    const chooseFightersBtn = document.createElement("button");
    chooseFightersBtn.id = "chooseFightersBtn";
    chooseFightersBtn.textContent = "Choose Fighters";
    monsterButtonsContainer.appendChild(chooseFightersBtn);

    const addAttackButton = document.createElement("button");
    addAttackButton.id = "addAttackButton";
    addAttackButton.textContent = "Add Attack";
    navbar.appendChild(addAttackButton);

    const removeAttackButton = document.createElement("button");
    removeAttackButton.id = "removeAttackButton";
    removeAttackButton.textContent = "Remove Attack";
    navbar.appendChild(removeAttackButton);

    const monsterDropdown = document.createElement("select");
    monsterDropdown.id = "monsterDropdown";
    monsterDropdown.style.display = "none";
    monsterButtonsContainer.appendChild(monsterDropdown);

    // Create Fighter Selection Dropdown
    const fighterDropdown = document.createElement("div");
    fighterDropdown.id = "fighterDropdown";
    
    // Jaybers8 option
    const jaybers8Option = document.createElement("div");
    jaybers8Option.classList.add("fighter-option");
    const jaybers8Checkbox = document.createElement("input");
    jaybers8Checkbox.type = "checkbox";
    jaybers8Checkbox.id = "jaybers8Checkbox";
    jaybers8Checkbox.checked = true;
    const jaybers8Label = document.createElement("label");
    jaybers8Label.textContent = "Jaybers8";
    jaybers8Label.htmlFor = "jaybers8Checkbox";
    jaybers8Option.appendChild(jaybers8Checkbox);
    jaybers8Option.appendChild(jaybers8Label);
    
    // FLIGHTx12! option
    const flightOption = document.createElement("div");
    flightOption.classList.add("fighter-option");
    const flightCheckbox = document.createElement("input");
    flightCheckbox.type = "checkbox";
    flightCheckbox.id = "flightCheckbox";
    flightCheckbox.checked = true;
    const flightLabel = document.createElement("label");
    flightLabel.textContent = "FLIGHTx12!";
    flightLabel.htmlFor = "flightCheckbox";
    flightOption.appendChild(flightCheckbox);
    flightOption.appendChild(flightLabel);
    
    fighterDropdown.appendChild(jaybers8Option);
    fighterDropdown.appendChild(flightOption);
    monsterButtonsContainer.appendChild(fighterDropdown);

    // Fighter selection event handlers
    chooseFightersBtn.addEventListener("click", () => {
      fighterDropdown.style.display = fighterDropdown.style.display === "block" ? "none" : "block";
      // Hide monster dropdown if open
      monsterDropdown.style.display = "none";
    });

    jaybers8Checkbox.addEventListener("change", () => {
      activeFighters.jaybers8 = jaybers8Checkbox.checked;
      updateFighterSelection();
    });

    flightCheckbox.addEventListener("change", () => {
      activeFighters.flight = flightCheckbox.checked;
      updateFighterSelection();
    });

    // Click outside to close dropdowns
    document.addEventListener("click", (e) => {
      if (!chooseFightersBtn.contains(e.target) && !fighterDropdown.contains(e.target)) {
        fighterDropdown.style.display = "none";
      }
      if (!chooseOpponentBtn.contains(e.target) && !monsterDropdown.contains(e.target)) {
        monsterDropdown.style.display = "none";
      }
    });

    // Function to update fighter selection
    function updateFighterSelection() {
      // Ensure at least one fighter is selected
      if (!activeFighters.jaybers8 && !activeFighters.flight) {
        // Revert the change - at least one must be active
        if (!jaybers8Checkbox.checked) {
          jaybers8Checkbox.checked = true;
          activeFighters.jaybers8 = true;
        } else {
          flightCheckbox.checked = true;
          activeFighters.flight = true;
        }
        return;
      }

      // Update current player if they're no longer active
      if (currentPlayer === 1 && !activeFighters.jaybers8) {
        currentPlayer = 2;
      } else if (currentPlayer === 2 && !activeFighters.flight) {
        currentPlayer = 1;
      }

      // Update all existing monster containers
      const monsterContainers = document.querySelectorAll(".monster-container");
      monsterContainers.forEach(container => {
        updateContainerForFighters(container);
      });
    }

    function updateContainerForFighters(container) {
      const playerToggle = container.querySelector("#playerToggle");
      const attackButton = container.querySelector("#attackButton");
      const container1 = container.querySelector("#attackInputs1");
      const container2 = container.querySelector("#attackInputs2");

      if (!playerToggle || !attackButton) return;

      // Hide/show player toggle button based on active fighters
      if (activeFighters.jaybers8 && activeFighters.flight) {
        playerToggle.style.display = "block";
      } else {
        playerToggle.style.display = "none";
      }

      // Update button texts and visibility
      if (activeFighters.jaybers8 && !activeFighters.flight) {
        currentPlayer = 1;
        attackButton.textContent = "Jaybers8 Attack!";
        container1.style.display = "block";
        container2.style.display = "none";
      } else if (!activeFighters.jaybers8 && activeFighters.flight) {
        currentPlayer = 2;
        attackButton.textContent = "FLIGHTx12! Attack!";        container1.style.display = "none";
        container2.style.display = "block";
      } else {
        // Both active - check for dual cursor mode
        if (simultaneousMode && dualCursorActive) {
          // In dual cursor mode, show both containers side by side
          updateGameForDualCursors();
        } else {
          // Normal toggle mode - use current player
          attackButton.textContent = `${currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!"} Attack!`;
          playerToggle.textContent = currentPlayer === 1 ? "Switch to FLIGHTx12!" : "Switch to Jaybers8";
          container1.style.display = currentPlayer === 1 ? "block" : "none";
          container2.style.display = currentPlayer === 2 ? "block" : "none";
        }
      }

      if (!simultaneousMode) {
        toggleButtonColors(currentPlayer);
      }
    }

    // Create monster containers and populate dropdown
    monsters.forEach((monster, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.text = monster.name;
      monsterDropdown.appendChild(option);

      const monsterContainer = document.createElement("div");
      monsterContainer.classList.add("monster-container");
      monsterContainer.style.display = "none";
      gameContainer.appendChild(monsterContainer);

      // Create history container as sibling to monster container, not as child
      const historyContainer = document.createElement("div");
      historyContainer.id = "historyContainer" + index; // Add index to make it unique
      historyContainer.style.display = "none"; // Hide by default, show only when monster is selected
      
      // REMOVE timer element from history container
      // const timerElement = document.createElement("div");
      // timerElement.id = "timer"; // This ID was problematic here
      // timerElement.style.fontSize = "2em";
      // timerElement.style.fontWeight = "bold";
      // timerElement.style.marginBottom = "10px";
      // historyContainer.appendChild(timerElement); 
      
      gameContainer.appendChild(historyContainer); // Append to game container, NOT monster container

      const monsterName = document.createElement("h2");
      monsterName.textContent = monster.name;
      const monsterDiv = document.createElement("div");
      monsterDiv.id = "monster";
      const lifeBar = document.createElement("div");
      lifeBar.id = "lifeBar";
      const lifeBarGreen = document.createElement("div");
      lifeBarGreen.id = "lifeBarGreen";
      const lifeBarText = document.createElement("div");
      lifeBarText.id = "lifeBarText";
      lifeBarText.textContent = monster.health;
      const monsterImage = document.createElement("div");
      monsterImage.classList.add("monster-image");
      const image = document.createElement("img");
      image.src = monster.imageSrc;

      // New info container for monster details
      const infoContainer = document.createElement("div");
      infoContainer.id = "infoContainer" + index; // Add index to make it unique
      infoContainer.innerHTML = `
<div style="text-align:center;">
  <h2 style="color:white; margin-bottom:5px;">${monster.name}</h2>
  <div style="font-size:0.9em; color:#888; margin-bottom:15px;">${monster.About}</div>
</div>
<div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:5px;">
  <p><span style="color:deepskyblue; font-weight:bold;">Attack Type:</span> <span style="color:white;">${monster.attackType}</span></p>
  <p><span style="color:deepskyblue; font-weight:bold;">Health:</span> <span style="color:white;">${monster.health}</span></p>
  <p><span style="color:deepskyblue; font-weight:bold;">Hit Numbers:</span> <span style="color:white;">${monster.hitNumbers.join(', ')}</span></p>
  <p><span style="color:deepskyblue; font-weight:bold;">Rewards:</span> <span style="color:white;">${monster.Rewards}</span></p>
  <p><span style="color:deepskyblue; font-weight:bold;">Punishment:</span> <span style="color:white;">${monster.Punishment}</span></p>
</div>`;
      infoContainer.style.position = "absolute";
      infoContainer.style.top = "100px";
      infoContainer.style.left = "10px";  // Position on left side of the screen
      infoContainer.style.display = "none"; // Hide by default
      infoContainer.style.width = "350px";
      infoContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      infoContainer.style.border = "1px solid white";
      infoContainer.style.padding = "10px";
      infoContainer.style.overflowY = "auto";
      infoContainer.style.maxHeight = "500px";
        // Append new info container to game container, not monster container
      gameContainer.appendChild(infoContainer);

      // Create and append trivia container
      if (window.triviaManager) {
        const triviaContainer = window.triviaManager.createTriviaContainer(index);
        gameContainer.appendChild(triviaContainer);
      }

      const container1 = document.createElement("div");
      container1.id = "attackInputs1";
      const container2 = document.createElement("div");
      container2.id = "attackInputs2";
      container2.style.display = "none"; // initially hide FLIGHTx12!'s input

      // Create top button row container
      const topButtonsContainer = document.createElement("div");
      topButtonsContainer.classList.add("monster-top-buttons");

      // Create player toggle button (left side)
      const playerToggle = document.createElement("button");
      playerToggle.id = "playerToggle";
      playerToggle.textContent = "Switch to FLIGHTx12!";
      playerToggle.addEventListener("click", () => {
        // Only switch if both players are active
        if (activeFighters.jaybers8 && activeFighters.flight) {
          currentPlayer = currentPlayer === 1 ? 2 : 1;
          attackButton.textContent = `${currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!"} Attack!`;
          playerToggle.textContent =
            currentPlayer === 1 ? "Switch to FLIGHTx12!" : "Switch to Jaybers8";
          toggleContainer(currentPlayer);
          toggleButtonColors(currentPlayer);

          // Add toggle dialogue to history container
          const playerName = currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!";
          const toggleDialogue = selectDialogue(monster.toggleDialogues[`player${currentPlayer}`]);
          historyContainer.innerHTML += `<p style="color:${playerName==="Jaybers8"?"purple":"green"}; font-size: 1.1rem; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);">${toggleDialogue}</p>`;
          historyContainer.scrollTop = historyContainer.scrollHeight;
        }
      });

      // Create Timer element for the top bar
      const timerDisplayElement = document.createElement("div");
      timerDisplayElement.id = "timer"; // This ID will be targeted by CSS and startTimer
      timerDisplayElement.textContent = "6:05"; // Initial display

      // Create attack button (back in top right)
      const attackButtonContainer = document.createElement("div");
      attackButtonContainer.classList.add("attack-button-container");
      const attackButton = document.createElement("button");
      attackButton.id = "attackButton";
      attackButton.classList.add("attack-button");
      attackButton.textContent = `Jaybers8 Attack!`;
      attackButtonContainer.appendChild(attackButton);

      // Add elements to top container: toggle, TIMER, attack button
      topButtonsContainer.appendChild(playerToggle);
      topButtonsContainer.appendChild(timerDisplayElement); // Add timer here
      topButtonsContainer.appendChild(attackButtonContainer);

      // Append elements to monster container in new order
      monsterContainer.appendChild(topButtonsContainer);
      monsterContainer.appendChild(monsterDiv);
      monsterDiv.appendChild(lifeBar);
      lifeBar.appendChild(lifeBarGreen);
      lifeBar.appendChild(lifeBarText);
      monsterContainer.appendChild(monsterImage);
      monsterImage.appendChild(image);
      monsterContainer.appendChild(container1);
      monsterContainer.appendChild(container2);

      let monsterLife = monster.health;
      let numAttacks = { 1: 1, 2: 1 }; // Track attack inputs for both players

      const initialInputs = {
        1: document.createElement("input"),
        2: document.createElement("input"),
      };

      for (let player in initialInputs) {
        initialInputs[player].type = "number";
        initialInputs[player].min = "1";
        initialInputs[player].max = "20";
        initialInputs[player].classList.add("initial");
        initialInputs[player].style.backgroundColor =
          player == 1 ? "purple" : "green";
      }

      container1.appendChild(initialInputs[1]); // Start with Jaybers8 input
      container2.appendChild(initialInputs[2]); // Initialize FLIGHTx12!'s input

      addAttackButton.addEventListener("click", () => {
        const currentContainer = currentPlayer === 1 ? container1 : container2;
        const currentInputCount = currentContainer.children.length;
        if (numAttacks[currentPlayer] < 11 && currentInputCount < 11) {
          const input = document.createElement("input");
          input.type = "number";
          input.min = "1";
          input.max = "20";
          currentContainer.appendChild(input);
          numAttacks[currentPlayer]++;
        }
      });

      removeAttackButton.addEventListener("click", () => {
        const currentContainer = currentPlayer === 1 ? container1 : container2;
        if (currentContainer.children.length > 1) {
          currentContainer.removeChild(currentContainer.lastChild);
          numAttacks[currentPlayer]--;
        }
      });      let attackButtonCooldown = false; // Cooldown flag
      attackButton.addEventListener("click", () => {
        if (attackButtonCooldown) return; // If cooldown is active, ignore click

        attackButtonCooldown = true; // Activate cooldown

        if (!timerStarted) {
          timerStarted = true;
          timer = startTimer();
          playFightMusic(); // Attempt to play fight music
        }

        // Handle dual cursor simultaneous mode
        if (simultaneousMode && dualCursorActive) {
          executeCombinedAttack();
          setTimeout(() => {
            attackButtonCooldown = false;
          }, 1000);
          return;
        }

        // Original single player attack logic
        const currentContainer = currentPlayer === 1 ? container1 : container2;
        let totalDamage = 0;
        let hitCount = 0;

        for (let i = 0; i < currentContainer.children.length; i++) {
          const input = currentContainer.children[i];
          const damage = parseInt(input.value);
          if (!isNaN(damage)) {
            if (currentPlayer === 1 && damage === 8) {
              totalDamage += 100; // Jaybers8's special damage
            } else if (currentPlayer === 2 && damage === 12) {
              totalDamage += 100; // FLIGHTx12's special damage
            } else {
              // Count how many times the damage value appears in hitNumbers
              const occurrences = monster.hitNumbers.filter(num => num === damage).length;
              if (occurrences > 0) {
                hitCount += occurrences; // Stack duplicate hits
              } else {
                totalDamage += damage;
              }
            }
          }        }

        // Apply trivia multiplier to total damage
        let triviaMultiplier = 1;
        if (window.triviaManager && totalDamage > 0) {
          triviaMultiplier = window.triviaManager.applyMultiplierAndReset();
          totalDamage = Math.floor(totalDamage * triviaMultiplier);
        }

        monsterLife -= totalDamage;
        monsterLife = Math.max(0, monsterLife);
        lifeBarGreen.style.width = (monsterLife / monster.health) * 100 + "%";
        lifeBarText.textContent = monsterLife;

        // Add vibration, shake, and red flash animation based on damage
        if (totalDamage > 0) {
          const shakeIntensity = Math.min(totalDamage / 15, 20); // Cap intensity at 10
          const redIntensity = Math.min(totalDamage / 150, 4); // Cap red intensity at 1
          const duration = Math.min(totalDamage / 50, 4); // Cap duration at 3 seconds
          monsterImage.style.animation = `shake ${shakeIntensity * 0.1}s infinite, redFlash ${redIntensity * 0.5}s infinite`;
          navigator.vibrate(shakeIntensity * 100); // Vibrate for intensity * 100ms
          setTimeout(() => {
            monsterImage.style.animation = "";
          }, duration * 1000);
        }

        const playerName = currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!";        if (monsterLife === 0) {
          clearInterval(timer);  // Stop timer when boss is defeated
          fightMusic.pause(); // Pause fight music
          fightMusic.currentTime = 0; // Reset to the beginning
          
          // Stop trivia system when boss is defeated
          if (window.triviaManager) {
            window.triviaManager.stopTrivia();
          }
          
          // Play healer sound immediately
          healerSound.currentTime = 0; // Ensure it plays from the beginning
          healerSound.play().catch(err => console.error("Error playing healer sound:", err));
          
          // Announce defeat in historyContainer with large, bold, bright red font
          historyContainer.innerHTML += `<p style="font-size:2rem; font-weight:bold; color:#FF0000; text-align: center; margin: 15px 0; text-shadow: 2px 2px 4px rgba(0, 0, 0, 1);">${playerName} defeated the ${monster.name}!</p>`;
          image.src = monster.defeatedImageSrc;
          
          // Always add the copy log button after updating innerHTML
          ensureCopyLogButton(monster, historyContainer);
        }        // Use the monster-specific dialogue methods:
        const damageDialogue = monster.getDamageDialogue(totalDamage, playerName);
        const hitDialogue = hitCount > 0 ? monster.getHitDialogue(hitCount, playerName) : "";

        // Function to play punch sounds
        const playPunchSounds = (count, soundFile) => {
          for (let i = 0; i < count; i++) {
            setTimeout(() => {
              const punchSound = new Audio(soundFile);
              punchSound.volume = 0.5; // Adjust volume as needed
              punchSound.play().catch(err => console.error("Error playing punch sound:", err));
            }, i * 300); // Delay between each sound
          }
        };        // Play player attack sound if damage was dealt
        if (totalDamage > 0) {
          const attackSound = new Audio('../assets/audio/punch - 1.mp3');
          attackSound.volume = 0.6;
          attackSound.play().catch(err => console.error("Error playing attack sound:", err));
        }

        if (damageDialogue) {
          historyContainer.innerHTML += `<p style="color:white; font-style: italic; font-size: 1.1rem; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);">${damageDialogue}</p>`;        }
        
        // Create damage message with trivia multiplier info
        let damageMessage = `${playerName} attacks for a cumulative total of ${totalDamage} damage.`;
        if (triviaMultiplier > 1) {
          const baseDamage = Math.floor(totalDamage / triviaMultiplier);
          damageMessage = `${playerName} attacks for ${baseDamage} damage (×${triviaMultiplier.toFixed(1)} trivia bonus = ${totalDamage} total damage).`;
        }
        
        historyContainer.innerHTML += `<p style="color:${playerName==="Jaybers8"?"purple":"green"}; font-size: 1.1rem; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);">${damageMessage}</p>`;
        
        if (hitCount > 0) {
          // Play monster counter-attack sounds
          playPunchSounds(hitCount, '../assets/audio/Punch - 2.mp3');
          historyContainer.innerHTML += `<p style="color:red; font-size: 1.1rem; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);">${monster.name} hits ${playerName} ${hitCount} times.</p>`;
          if (hitDialogue) {
            historyContainer.innerHTML += `<p style="color:white; font-style: italic; font-size: 1.1rem; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);">${hitDialogue}</p>`;
          }
        }
        // Add time remaining to history
        const currentTimerElement = monsterContainer.querySelector("#timer"); // Get timer from current monster
        if (currentTimerElement) {
            historyContainer.innerHTML += `<p style="color:#888; font-size:1rem; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);">Time Remaining: ${currentTimerElement.textContent}</p>`;
        } else {
            historyContainer.innerHTML += `<p style="color:#888; font-size:1rem; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);">Time Remaining: N/A</p>`;
        }
        historyContainer.innerHTML += `<hr>`;
        historyContainer.scrollTop = historyContainer.scrollHeight;

        // If the copy log button is present (boss defeated), re-append it after updating innerHTML
        if (historyContainer.querySelector('.copy-log-button')) {
          ensureCopyLogButton(monster, historyContainer);
        }

        // Clear input values
        for (let i = 1; i < currentContainer.children.length; i++) {
          currentContainer.children[i].value = "";
        }

        // Automatically switch to the next player after attack (only if monster is still alive)
        if (monsterLife > 0 && activeFighters.jaybers8 && activeFighters.flight) {
          setTimeout(() => {
            switchToNextPlayer();
            
            // Add toggle dialogue to history container for automatic switch
            const newPlayerName = currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!";
            const toggleDialogue = selectDialogue(monster.toggleDialogues[`player${currentPlayer}`]);
            historyContainer.innerHTML += `<p style="color:${newPlayerName==="Jaybers8"?"purple":"green"}; font-size: 1.1rem; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);">${toggleDialogue}</p>`;
            historyContainer.scrollTop = historyContainer.scrollHeight;
          }, 500); // Small delay to let the attack animations complete
        }

        setTimeout(() => {
          attackButtonCooldown = false; // Deactivate cooldown after 1 second
        }, 1000);
      });

      function toggleContainer(player) {
        container1.style.display = player === 1 ? "block" : "none";
        container2.style.display = player === 2 ? "block" : "none";
      }

      // Function to switch to the next player (moved inside monster container scope)
      function switchToNextPlayer() {
        // Only switch if both players are active
        if (activeFighters.jaybers8 && activeFighters.flight) {
          currentPlayer = currentPlayer === 1 ? 2 : 1;
          attackButton.textContent = `${currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!"} Attack!`;
          playerToggle.textContent = currentPlayer === 1 ? "Switch to FLIGHTx12!" : "Switch to Jaybers8";
          toggleContainer(currentPlayer);
          toggleButtonColors(currentPlayer);
        }
      }

      // Add swipe gesture handlers on mobile within each monster container
      let swipeStartX = 0;
      monsterContainer.addEventListener("touchstart", (e) => {
        swipeStartX = e.touches[0].clientX;
      });
      monsterContainer.addEventListener("touchend", (e) => {
        const swipeEndX = e.changedTouches[0].clientX;
        const deltaX = swipeEndX - swipeStartX;
        const threshold = 50; // minimum swipe distance in pixels
        if (deltaX > threshold) {
          // Swipe right: reveal full info container
          infoContainer.style.right = "auto";
          infoContainer.style.left = "0";
          historyContainer.style.left = "100%";
        } else if (deltaX < -threshold) {
          // Swipe left: reveal full history container
          historyContainer.style.left = "0";
          infoContainer.style.left = "";
          infoContainer.style.right = "100%";
        } else {
          // Reset to default: lock viewport on the monster image
          infoContainer.style.left = "";
          infoContainer.style.right = "100%";
          historyContainer.style.left = "100%";
        }
      });
    });

    chooseOpponentBtn.addEventListener("click", () => {
      monsterDropdown.style.display = monsterDropdown.style.display === "block" ? "none" : "block";
      // Hide fighter dropdown if open
      fighterDropdown.style.display = "none";
    });

    monsterDropdown.addEventListener("change", () => {
      const selectedMonsterIndex = monsterDropdown.value;

      // Hide all containers
      const monsterContainers = document.querySelectorAll(".monster-container");
      monsterContainers.forEach(
        (container) => (container.style.display = "none"),
      );
        // Hide all history and info containers
      for (let i = 0; i < monsters.length; i++) {
        const historyContainer = document.getElementById("historyContainer" + i);
        const infoContainer = document.getElementById("infoContainer" + i);
        const triviaContainer = document.getElementById("triviaContainer" + i);
        if (historyContainer) historyContainer.style.display = "none";
        if (infoContainer) infoContainer.style.display = "none";
        if (triviaContainer) triviaContainer.style.display = "none";
      }
      
      // Stop trivia when changing monsters
      if (window.triviaManager) {
        window.triviaManager.stopTrivia();
      }

      if (selectedMonsterIndex !== "") {
        // Hide the How To Play modal when game starts
        const modal = document.getElementById('howToPlayModal');
        if (modal) {
          modal.style.display = 'none';
        }
        
        // Show the selected monster container
        const activeMonsterContainer = monsterContainers[selectedMonsterIndex];
        activeMonsterContainer.style.display = "block";
          // Show the corresponding history and info containers
        const historyContainer = document.getElementById("historyContainer" + selectedMonsterIndex);
        const infoContainer = document.getElementById("infoContainer" + selectedMonsterIndex);
        if (historyContainer) historyContainer.style.display = "block";
        if (infoContainer) infoContainer.style.display = "block";
        
        // Start trivia system for this monster
        if (window.triviaManager) {
          const triviaContainer = document.getElementById("triviaContainer" + selectedMonsterIndex);
          if (triviaContainer) {
            triviaContainer.style.display = "block";
            window.triviaManager.triviaContainer = triviaContainer;
            window.triviaManager.startTrivia();
          }
        }
        
        // Update the selected monster container for current fighter selection
        updateContainerForFighters(activeMonsterContainer);
        
        monsterDropdown.style.display = "none";

        // Always start/restart timer when a monster is selected
        timerStarted = true;
        timer = startTimer(); 
        playFightMusic();
      }
    });
  }

  function toggleButtonColors(player) {
    // Ensure we are targeting buttons within the *active* monster container
    const activeMonsterContainer = Array.from(document.querySelectorAll(".monster-container")).find(c => c.style.display === "block");
    if (!activeMonsterContainer) return;

    const attackButton = activeMonsterContainer.querySelector("#attackButton");
    const playerToggle = activeMonsterContainer.querySelector("#playerToggle");

    if (!attackButton || !playerToggle) return;

    if (player === 1) {
      attackButton.style.background = "purple";
      attackButton.style.color = "white";
      playerToggle.classList.remove("player2Active");
      playerToggle.classList.add("player1Active");
    } else {
      attackButton.style.background = "green";
      attackButton.style.color = "white";
      playerToggle.classList.remove("player1Active");
      playerToggle.classList.add("player2Active");
    }

    // Remove any background images that might interfere
    attackButton.style.backgroundImage = "none";
    playerToggle.style.backgroundImage = "none";
  }

  // Helper to add/re-add the copy log button and handler
  function ensureCopyLogButton(monster, historyContainer) {
    // Remove any existing button
    const oldBtn = historyContainer.querySelector('.copy-log-button');
    if (oldBtn) oldBtn.remove();

    const copyLogButton = document.createElement("button");
    copyLogButton.textContent = "Copy Battle Log";
    copyLogButton.classList.add("copy-log-button");
    copyLogButton.style.display = "block";
    copyLogButton.style.margin = "10px auto";
    copyLogButton.style.backgroundColor = "#2c3e50";
    copyLogButton.style.color = "white";
    copyLogButton.style.border = "2px solid #0ff";
    copyLogButton.style.borderRadius = "5px";
    copyLogButton.style.padding = "8px 15px";
    copyLogButton.style.fontWeight = "bold";
    copyLogButton.style.cursor = "pointer";
    copyLogButton.style.boxShadow = "0 0 10px #0ff";

    copyLogButton.addEventListener("click", () => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = historyContainer.innerHTML;
      const buttonClone = tempDiv.querySelector('.copy-log-button');
      if (buttonClone) buttonClone.remove();
      // const timerClone = tempDiv.querySelector('#timer'); // Timer is no longer in history container
      // if (timerClone) timerClone.remove();
      const paragraphs = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
      let battleLog = "";
      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text) {
          battleLog += text + "\n\n";
        }
      });
      battleLog = battleLog.replace(/\n\s*\n\s*\n/g, "\n\n").trim();
      battleLog = `BATTLE LOG: ${monster.name}\n` + 
                  `${new Date().toLocaleString()}\n` +
                  `===================\n\n` + 
                  battleLog;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(battleLog)
          .then(() => {
            copyLogButton.textContent = "Copied!";
            copyLogButton.style.backgroundColor = "#27ae60";
            setTimeout(() => {
              copyLogButton.textContent = "Copy Battle Log";
              copyLogButton.style.backgroundColor = "#2c3e50";
            }, 2000);
          })
          .catch(err => {
            fallbackCopyMethod(battleLog);
          });
      } else {
        fallbackCopyMethod(battleLog);
      }
      function fallbackCopyMethod(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            copyLogButton.textContent = "Copied!";
            copyLogButton.style.backgroundColor = "#27ae60";
          } else {
            copyLogButton.textContent = "Copy Failed";
            copyLogButton.style.backgroundColor = "#e74c3c";
          }
        } catch (err) {
          copyLogButton.textContent = "Copy Failed";
          copyLogButton.style.backgroundColor = "#e74c3c";
        }
        document.body.removeChild(textArea);
        setTimeout(() => {
          copyLogButton.textContent = "Copy Battle Log";
          copyLogButton.style.backgroundColor = "#2c3e50";
        }, 2000);
      }
    });
    historyContainer.appendChild(copyLogButton);
  }

  // Function to switch to the next player
  function switchToNextPlayer() {
    // Only switch if both players are active
    if (activeFighters.jaybers8 && activeFighters.flight) {
      currentPlayer = currentPlayer === 1 ? 2 : 1;
      
      // Target elements within the currently visible monster container
      const activeMonsterContainer = Array.from(document.querySelectorAll(".monster-container")).find(c => c.style.display === "block");
      if (!activeMonsterContainer) return;

      const attackButton = activeMonsterContainer.querySelector("#attackButton");
      const playerToggle = activeMonsterContainer.querySelector("#playerToggle");
      
      if (attackButton && playerToggle) {
        attackButton.textContent = `${currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!"} Attack!`;
        playerToggle.textContent = currentPlayer === 1 ? "Switch to FLIGHTx12!" : "Switch to Jaybers8";
        toggleContainer(currentPlayer);
        toggleButtonColors(currentPlayer);
      }
    }
  }

  // Listen for dual cursor events
  document.addEventListener('dualCursorEvent', (e) => {
    const { type, data, cursorsActive, activePlayers } = e.detail;
    
    switch(type) {
      case 'dual-cursors-enabled':
        dualCursorActive = true;
        simultaneousMode = true;
        updateGameForDualCursors();
        break;
      case 'single-cursor-mode':
        dualCursorActive = false;
        simultaneousMode = false;
        updateGameForSingleCursor();
        break;
      case 'player-click':
        if (simultaneousMode) {
          handleDualCursorClick(data);
        }
        break;
    }
  });

  // Function to update game UI for dual cursor mode
  function updateGameForDualCursors() {
    console.log('Enabling simultaneous dual-player mode');
    
    // Show both input containers simultaneously
    const activeMonsterContainer = Array.from(document.querySelectorAll(".monster-container")).find(c => c.style.display === "block");
    if (activeMonsterContainer) {
      const container1 = activeMonsterContainer.querySelector("#attackInputs1");
      const container2 = activeMonsterContainer.querySelector("#attackInputs2");
      const playerToggle = activeMonsterContainer.querySelector("#playerToggle");
      
      if (container1 && container2) {
        container1.style.display = "block";
        container2.style.display = "block";
        
        // Position containers side by side for dual cursor mode
        container1.style.float = "left";
        container1.style.width = "48%";
        container1.style.marginRight = "2%";
        container2.style.float = "left";
        container2.style.width = "48%";
        container2.style.marginLeft = "2%";
      }
      
      // Hide player toggle button in simultaneous mode
      if (playerToggle) {
        playerToggle.style.display = "none";
      }
      
      // Update attack button for dual mode
      const attackButton = activeMonsterContainer.querySelector("#attackButton");
      if (attackButton) {
        attackButton.textContent = "Both Players Attack!";
        attackButton.style.background = "linear-gradient(45deg, purple, green)";
      }
    }
  }

  // Function to update game UI for single cursor mode
  function updateGameForSingleCursor() {
    console.log('Reverting to single-player toggle mode');
    
    const activeMonsterContainer = Array.from(document.querySelectorAll(".monster-container")).find(c => c.style.display === "block");
    if (activeMonsterContainer) {
      const container1 = activeMonsterContainer.querySelector("#attackInputs1");
      const container2 = activeMonsterContainer.querySelector("#attackInputs2");
      const playerToggle = activeMonsterContainer.querySelector("#playerToggle");
      
      if (container1 && container2) {
        // Reset container styling
        container1.style.float = "";
        container1.style.width = "";
        container1.style.marginRight = "";
        container2.style.float = "";
        container2.style.width = "";
        container2.style.marginLeft = "";
        
        // Show only current player's container
        container1.style.display = currentPlayer === 1 ? "block" : "none";
        container2.style.display = currentPlayer === 2 ? "block" : "none";
      }
      
      // Show player toggle button
      if (playerToggle && activeFighters.jaybers8 && activeFighters.flight) {
        playerToggle.style.display = "block";
      }
      
      // Reset attack button
      const attackButton = activeMonsterContainer.querySelector("#attackButton");
      if (attackButton) {
        attackButton.textContent = `${currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!"} Attack!`;
        toggleButtonColors(currentPlayer);
      }
    }
  }

  // Handle clicks from dual cursor system
  function handleDualCursorClick(data) {
    const { player, target } = data;
    
    // Check if click is on attack button
    if (target && target.id === 'attackButton') {
      // In simultaneous mode, both players attack together
      if (simultaneousMode) {
        executeCombinedAttack();
      }
    }
    
    // Handle other game interactions based on player
    if (target && target.type === 'number') {
      // Focus input for the clicking player
      const playerNum = player === 'player1' ? 1 : 2;
      const activeContainer = document.querySelector(`#attackInputs${playerNum}`);
      if (activeContainer && activeContainer.contains(target)) {
        target.focus();
      }
    }
  }

  // Execute combined attack from both players
  function executeCombinedAttack() {
    const activeMonsterContainer = Array.from(document.querySelectorAll(".monster-container")).find(c => c.style.display === "block");
    if (!activeMonsterContainer) return;
    
    const container1 = activeMonsterContainer.querySelector("#attackInputs1");
    const container2 = activeMonsterContainer.querySelector("#attackInputs2");
    const historyContainer = document.getElementById("historyContainer" + monsterDropdown.value);
    
    if (!container1 || !container2 || !historyContainer) return;
    
    const monster = monsters[monsterDropdown.value];
    if (!monster) return;
    
    let totalCombinedDamage = 0;
    let attackResults = [];
    
    // Process Player 1 (Jaybers8) attacks
    const player1Damage = calculatePlayerDamage(container1, 1, monster);
    if (player1Damage.total > 0) {
      totalCombinedDamage += player1Damage.total;
      attackResults.push(`Jaybers8: ${player1Damage.total} damage`);
    }
    
    // Process Player 2 (FLIGHTx12) attacks  
    const player2Damage = calculatePlayerDamage(container2, 2, monster);
    if (player2Damage.total > 0) {
      totalCombinedDamage += player2Damage.total;
      attackResults.push(`FLIGHTx12: ${player2Damage.total} damage`);
    }
    
    // Apply combined damage
    if (totalCombinedDamage > 0) {
      const monsterImage = activeMonsterContainer.querySelector("img");
      let monsterLife = parseInt(activeMonsterContainer.querySelector(".life-bar-text").textContent.split('/')[0]);
      
      monsterLife -= totalCombinedDamage;
      monsterLife = Math.max(0, monsterLife);
      
      // Update monster health display
      updateMonsterHealth(activeMonsterContainer, monsterLife, monster.health);
      
      // Add combined attack to history
      const combinedResultText = `<strong>COMBINED ATTACK!</strong><br/>${attackResults.join('<br/>')} <br/><strong>Total: ${totalCombinedDamage} damage</strong>`;
      historyContainer.innerHTML += `<p style="color: gold; font-size: 1.2rem; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9); border: 2px solid gold; padding: 10px; margin: 5px 0; background: rgba(0,0,0,0.3);">${combinedResultText}</p>`;
      
      // Trigger visual effects
      if (monsterImage) {
        const shakeIntensity = Math.min(totalCombinedDamage / 20, 10);
        monsterImage.style.animation = `shake ${shakeIntensity * 0.1}s infinite, redFlash ${shakeIntensity * 0.5}s infinite`;
        setTimeout(() => {
          monsterImage.style.animation = "";
        }, 1000);
      }
      
      // Check if monster is defeated
      if (monsterLife <= 0) {
        clearInterval(timer);
        fightMusic.pause();
        fightMusic.currentTime = 0;
        
        if (window.triviaManager) {
          window.triviaManager.stopTrivia();
        }
        
        healerSound.currentTime = 0;
        healerSound.play().catch(err => console.error("Error playing healer sound:", err));
        
        const victoryText = "Victory! Both players worked together to defeat the monster!";
        historyContainer.innerHTML += `<p style="color: lime; font-size: 1.5rem; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9); text-align: center; font-weight: bold; background: rgba(0,255,0,0.2); padding: 15px; margin: 10px 0; border: 3px solid lime;">${victoryText}</p>`;
      }
      
      historyContainer.scrollTop = historyContainer.scrollHeight;
    }
  }

  // Helper function to calculate damage for a specific player
  function calculatePlayerDamage(container, playerNum, monster) {
    let totalDamage = 0;
    let hitCount = 0;
    
    for (let i = 0; i < container.children.length; i++) {
      const input = container.children[i];
      const damage = parseInt(input.value);
      if (!isNaN(damage)) {
        if (playerNum === 1 && damage === 8) {
          totalDamage += 100; // Jaybers8's special damage
        } else if (playerNum === 2 && damage === 12) {
          totalDamage += 100; // FLIGHTx12's special damage
        } else {
          // Count how many times the damage value appears in hitNumbers
          const occurrences = monster.hitNumbers.filter(num => num === damage).length;
          if (occurrences > 0) {
            hitCount += occurrences; // Stack duplicate hits
          } else {
            totalDamage += damage;
          }
        }
      }
    }
    
    return { total: totalDamage, hits: hitCount };
  }

  // Helper function to update monster health display
  function updateMonsterHealth(container, currentHealth, maxHealth) {
    const lifeBarGreen = container.querySelector(".life-bar-green");
    const lifeBarText = container.querySelector(".life-bar-text");
    
    if (lifeBarGreen && lifeBarText) {
      const healthPercentage = (currentHealth / maxHealth) * 100;
      lifeBarGreen.style.width = `${healthPercentage}%`;
      lifeBarText.textContent = `${currentHealth}/${maxHealth}`;
    }
  }

  // Keep only the event listeners for trivia events - remove all the duplicate functions
  document.addEventListener('triviaTimeout', handleTriviaTimeout);
  document.addEventListener('triviaWrongAnswer', handleTriviaWrongAnswer);
  
  // Maintain a registry of processed events by timestamp to avoid duplicates
  const processedTriviaEvents = new Set();
  
  // Function to handle trivia timeout and heal boss
  function handleTriviaTimeout(event) {
    // Extract timestamp from event if available
    const timestamp = event.detail?.timestamp || Date.now();
    const eventId = `timeout_${timestamp}`;
    
    // Check if we've already processed this event
    if (processedTriviaEvents.has(eventId)) {
      console.log('Ignoring duplicate trivia timeout event', eventId);
      return;
    }
    
    // Add to registry of processed events
    processedTriviaEvents.add(eventId);
    console.log('Processing trivia timeout event', eventId);
    
    // Clear old events (keep registry from growing too large)
    if (processedTriviaEvents.size > 100) {
      const oldEvents = Array.from(processedTriviaEvents).slice(0, 50);
      oldEvents.forEach(e => processedTriviaEvents.delete(e));
    }
    
    // Rest of healing logic
    const activeMonsterContainer = Array.from(document.querySelectorAll(".monster-container"))
                                     .find(c => c.style.display === "block");
    if (!activeMonsterContainer) return;

    const selectedMonsterIndex = document.getElementById("monsterDropdown").value;
    if (selectedMonsterIndex === "") return;

    const monster = monsters[selectedMonsterIndex];
    const lifeBarGreen = activeMonsterContainer.querySelector("#lifeBarGreen");
    const lifeBarText = activeMonsterContainer.querySelector("#lifeBarText");
    const historyContainer = document.getElementById("historyContainer" + selectedMonsterIndex);
    
    if (!monster || !lifeBarGreen || !lifeBarText || !historyContainer) return;

    // Get current health from the display
    const currentHealthText = lifeBarText.textContent;
    let currentHealth = parseInt(currentHealthText);
    const maxHealth = monster.health; // Original max health from monster data
    
    // Heal boss by 10 points, but don't exceed max health
    const oldHealth = currentHealth;
    currentHealth = Math.min(currentHealth + 10, maxHealth);
    const actualHealing = currentHealth - oldHealth;
    
    if (actualHealing > 0) {
      // Update life bar display
      lifeBarGreen.style.width = (currentHealth / maxHealth) * 100 + "%";
      lifeBarText.textContent = currentHealth;
      
      // Add healing message to battle log
      const healMessage = `⏰ Trivia timeout! ${monster.name} regenerates ${actualHealing} health! (${oldHealth} → ${currentHealth})`;
      historyContainer.innerHTML += `<p style="color:#f39c12; font-size: 1.1rem; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);">${healMessage}</p>`;
      historyContainer.innerHTML += `<hr>`;
      historyContainer.scrollTop = historyContainer.scrollHeight;
      
      // Visual feedback - green flash on monster
      const monsterImage = activeMonsterContainer.querySelector(".monster-image img");
      if (monsterImage) {
        monsterImage.style.filter = "hue-rotate(120deg) brightness(1.3)";
        setTimeout(() => {
          monsterImage.style.filter = "";
        }, 500);
      }
      
      // Play a healing sound effect
      const healSound = new Audio('../assets/audio/healer.mp3');
      healSound.volume = 0.3;
      healSound.play().catch(err => console.error("Error playing heal sound:", err));
      
      console.log(`Boss healed from timeout: ${oldHealth} → ${currentHealth} (+${actualHealing})`);
    }
  }

  // Similar update for wrong answers
  function handleTriviaWrongAnswer(event) {
    // Extract timestamp from event if available
    const timestamp = event.detail?.timestamp || Date.now();
    const eventId = `wrong_${timestamp}`;
    
    // Check if we've already processed this event
    if (processedTriviaEvents.has(eventId)) {
      console.log('Ignoring duplicate trivia wrong answer event', eventId);
      return;
    }
    
    // Add to registry of processed events
    processedTriviaEvents.add(eventId);
    console.log('Processing trivia wrong answer event', eventId);
    
    // Heal boss by 50 points for wrong answer, but don't exceed max health
    const activeMonsterContainer = Array.from(document.querySelectorAll(".monster-container"))
                                     .find(c => c.style.display === "block");
    if (!activeMonsterContainer) return;

    const selectedMonsterIndex = document.getElementById("monsterDropdown").value;
    if (selectedMonsterIndex === "") return;

    const monster = monsters[selectedMonsterIndex];
    const lifeBarGreen = activeMonsterContainer.querySelector("#lifeBarGreen");
    const lifeBarText = activeMonsterContainer.querySelector("#lifeBarText");
    const historyContainer = document.getElementById("historyContainer" + selectedMonsterIndex);
    
    if (!monster || !lifeBarGreen || !lifeBarText || !historyContainer) return;

    // Get current health from the display
    const currentHealthText = lifeBarText.textContent;
    let currentHealth = parseInt(currentHealthText);
    const maxHealth = monster.health; // Original max health from monster data
    
    // Heal boss by 50 points for wrong answer, but don't exceed max health
    const oldHealth = currentHealth;
    currentHealth = Math.min(currentHealth + 50, maxHealth);
    const actualHealing = currentHealth - oldHealth;
    
    if (actualHealing > 0) {
      // Update life bar display
      lifeBarGreen.style.width = (currentHealth / maxHealth) * 100 + "%";
      lifeBarText.textContent = currentHealth;
      
      // Add healing message to battle log
      const healMessage = `❌ Wrong answer! ${monster.name} regenerates ${actualHealing} health! (${oldHealth} → ${currentHealth})`;
      historyContainer.innerHTML += `<p style="color:#e74c3c; font-size: 1.1rem; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);">${healMessage}</p>`;
      historyContainer.innerHTML += `<hr>`;
      historyContainer.scrollTop = historyContainer.scrollHeight;
      
      // Visual feedback - red flash on monster (different from timeout)
      const monsterImage = activeMonsterContainer.querySelector(".monster-image img");
      if (monsterImage) {
        monsterImage.style.filter = "hue-rotate(-60deg) brightness(1.4) saturate(1.5)"; // Red healing flash
        setTimeout(() => {
          monsterImage.style.filter = "";
        }, 700);
      }
      
      // Play a different healing sound effect for wrong answers
      const wrongHealSound = new Audio('../assets/audio/healer.mp3');
      wrongHealSound.volume = 0.4;
      wrongHealSound.playbackRate = 0.8; // Slower/deeper sound for wrong answers
      wrongHealSound.play().catch(err => console.error("Error playing wrong answer heal sound:", err));
      
      console.log(`Boss healed from wrong answer: ${oldHealth} → ${currentHealth} (+${actualHealing})`);
    }
  }

});
