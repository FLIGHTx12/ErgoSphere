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

  let timerStarted = false;
  let timer;
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
    let timeLeft = 365; // 5 minutes in seconds
    const timerElement = document.getElementById("timer");
    timer = setInterval(() => { // Assign the interval to the timer variable
      if (timeLeft <= 0) {
        clearInterval(timer);
        gameOver();
      } else {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      }
    }, 1000);
    bindGameKeys(); // Bind keys when timer starts (game starts)
    return timer;
  }

  function gameOver() {
    fightMusic.pause(); // Pause fight music
    fightMusic.currentTime = 0; // Reset to the beginning
    gameOverAudio.play();
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

    monsters.forEach((monster, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.text = monster.name;
      monsterDropdown.appendChild(option);

      const monsterContainer = document.createElement("div");
      monsterContainer.classList.add("monster-container");
      monsterContainer.style.display = "none";
      gameContainer.appendChild(monsterContainer);      // Create history container as sibling to monster container, not as child
      const historyContainer = document.createElement("div");
      historyContainer.id = "historyContainer" + index; // Add index to make it unique
      historyContainer.style.display = "none"; // Hide by default, show only when monster is selected
      
      // Add timer element to history container
      const timerElement = document.createElement("div");
      timerElement.id = "timer";
      timerElement.style.fontSize = "2em";
      timerElement.style.fontWeight = "bold";
      timerElement.style.marginBottom = "10px";
      historyContainer.appendChild(timerElement);
      
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
</div>`;      infoContainer.style.position = "absolute";
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

      const container1 = document.createElement("div");
      container1.id = "attackInputs1";
      const container2 = document.createElement("div");
      container2.id = "attackInputs2";
      container2.style.display = "none"; // initially hide FLIGHTx12!'s inputs

      const attackButtonContainer = document.createElement("div");
      attackButtonContainer.classList.add("attack-button-container"); // Container for the button
      const attackButton = document.createElement("button");
      attackButton.id = "attackButton";
      attackButton.classList.add("attack-button"); // Add this class
      attackButton.textContent = `Jaybers8 Attack!`;      attackButtonContainer.appendChild(attackButton); // Add the button to the container
      monsterImage.appendChild(attackButtonContainer); // Add the container to the monsterImage

      const playerToggle = document.createElement("button");
      playerToggle.id = "playerToggle";
      playerToggle.textContent = "Switch to FLIGHTx12!";
      playerToggle.addEventListener("click", () => {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        attackButton.textContent = `${currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!"} Attack!`;
        playerToggle.textContent =
          currentPlayer === 1 ? "Switch to FLIGHTx12!" : "Switch to Jaybers8";
        toggleContainer(currentPlayer);
        toggleButtonColors(currentPlayer);

        // Add toggle dialogue to history container
        const playerName = currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!";
        const toggleDialogue = selectDialogue(monster.toggleDialogues[`player${currentPlayer}`]);
        historyContainer.innerHTML += `<p style="color:${playerName==="Jaybers8"?"purple":"green"};">${toggleDialogue}</p>`;
        historyContainer.scrollTop = historyContainer.scrollHeight;
      });

      monsterContainer.appendChild(playerToggle);
      monsterContainer.appendChild(monsterDiv);
      monsterDiv.appendChild(lifeBar);
      lifeBar.appendChild(lifeBarGreen);
      lifeBar.appendChild(lifeBarText);
      monsterContainer.appendChild(monsterImage);
      monsterImage.appendChild(image);
      monsterContainer.appendChild(container1);
      monsterContainer.appendChild(container2);
      // Remove this line as we're no longer adding historyContainer to monsterContainer
      // monsterContainer.appendChild(historyContainer);

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
      });

      let attackButtonCooldown = false; // Cooldown flag
      attackButton.addEventListener("click", () => {
        if (attackButtonCooldown) return; // If cooldown is active, ignore click

        attackButtonCooldown = true; // Activate cooldown

        if (!timerStarted) {
          timerStarted = true;
          timer = startTimer();
          playFightMusic(); // Attempt to play fight music
        }

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
          }
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

        const playerName = currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!";

        if (monsterLife === 0) {
          clearInterval(timer);  // Stop timer when boss is defeated
          fightMusic.pause(); // Pause fight music
          fightMusic.currentTime = 0; // Reset to the beginning
          
          // Play healer sound immediately
          healerSound.currentTime = 0; // Ensure it plays from the beginning
          healerSound.play().catch(err => console.error("Error playing healer sound:", err));
          
          // Announce defeat in historyContainer with large, bold, bright red font
          historyContainer.innerHTML += `<p style="font-size:32px; font-weight:bold; color:#FF0000;">${playerName} defeated the ${monster.name}!</p>`;
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
          historyContainer.innerHTML += `<p style="color:white; font-style: italic;">${damageDialogue}</p>`;
        }
        
        historyContainer.innerHTML += `<p style="color:${playerName==="Jaybers8"?"purple":"green"};">${playerName} attacks for a cumulative total of ${totalDamage} damage.</p>`;
        
        if (hitCount > 0) {
          // Play monster counter-attack sounds
          playPunchSounds(hitCount, '../assets/audio/Punch - 2.mp3');
          historyContainer.innerHTML += `<p style="color:red;">${monster.name} hits ${playerName} ${hitCount} times.</p>`;
          if (hitDialogue) {
            historyContainer.innerHTML += `<p style="color:white; font-style: italic;">${hitDialogue}</p>`;
          }
        }
        // Add time remaining to history
        const timeElement = document.getElementById("timer");
        historyContainer.innerHTML += `<p style="color:#888; font-size:0.9em;">Time Remaining: ${timeElement.textContent}</p>`;
        historyContainer.innerHTML += `<hr>`;
        historyContainer.scrollTop = historyContainer.scrollHeight;

        // If the copy log button is present (boss defeated), re-append it after updating innerHTML
        if (historyContainer.querySelector('.copy-log-button')) {
          ensureCopyLogButton(monster, historyContainer);
        }

        for (let i = 1; i < currentContainer.children.length; i++) {
          currentContainer.children[i].value = "";
        }

        setTimeout(() => {
          attackButtonCooldown = false; // Deactivate cooldown after 1 second
        }, 1000);
      });

      function toggleContainer(player) {
        container1.style.display = player === 1 ? "block" : "none";
        container2.style.display = player === 2 ? "block" : "none";
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
        if (historyContainer) historyContainer.style.display = "none";
        if (infoContainer) infoContainer.style.display = "none";
      }

      if (selectedMonsterIndex !== "") {
        // Hide the How To Play modal when game starts
        const modal = document.getElementById('howToPlayModal');
        if (modal) {
          modal.style.display = 'none';
        }
        
        // Show the selected monster container
        monsterContainers[selectedMonsterIndex].style.display = "block";
        
        // Show the corresponding history and info containers
        const historyContainer = document.getElementById("historyContainer" + selectedMonsterIndex);
        const infoContainer = document.getElementById("infoContainer" + selectedMonsterIndex);
        if (historyContainer) historyContainer.style.display = "block";
        if (infoContainer) infoContainer.style.display = "block";
        
        monsterDropdown.style.display = "none";
        
        // Start timer and play music immediately after monster selection
        if (!timerStarted) {
          timerStarted = true;
          timer = startTimer();
          playFightMusic();
        }
      }
    });
  }

  function toggleButtonColors(player) {
    const attackButton = document.getElementById("attackButton");
    const playerToggle = document.getElementById("playerToggle");

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
      const timerClone = tempDiv.querySelector('#timer');
      if (timerClone) timerClone.remove();
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
});
