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
    flight: true  };
  let timerStarted = false;
  let timer;
  let audioDuration = 365; // Default duration, will be updated
  const gameOverAudio = new Audio('../assets/audio/hazzard.mp3');
  const fightMusic = new Audio('../assets/audio/ErgoArenaTheme.mp3');
  const healerSound = new Audio('../assets/audio/healer.mp3'); // Add healer sound  fightMusic.loop = true; // loop the fight music
  fightMusic.volume = 0.5; // Set volume to 50% (adjust as needed)
  healerSound.volume = 0.7; // Set healer sound volume
    // ===== CURSOR THEME SWITCHING FOR FIGHTER TOGGLE =====
  function updateCursorTheme(player) {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('flight-theme', 'jaybers-theme');
    
    // Only apply themed cursors if the game has started (timer is active)
    if (timerStarted) {
      // Add appropriate theme class based on current player
      if (player === 1) {
        // Jaybers8 = Purple theme
        body.classList.add('jaybers-theme');
      } else if (player === 2) {
        // FLIGHTx12! = Green theme
        body.classList.add('flight-theme');
      }
    }
    // If game hasn't started (timerStarted = false), cursor remains default
  }
  
  // Initialize cursor theme on page load (will be default since timerStarted = false)
  updateCursorTheme(currentPlayer);
    // Game stats tracking
  let gameStats = {
    startTime: null,
    endTime: null,
    winner: null, // "victory" or "defeat"
    totalDamageDealt: 0,
    totalBossHits: 0, // Total boss hits across all players
    bossDamageDealt: 0,
    triviaStats: {
      correctAnswers: 0,
      wrongAnswers: 0,
      timeouts: 0
    },
    playerStats: {
      jaybers8: {
        damageDealt: 0,
        attackCount: 0,
        specialMoves: 0, // 8s and 12s
        bossHitsReceived: 0, // How many times boss hit this player
        triviaCorrect: 0,
        triviaWrong: 0,
        healsUsed: 0, // Special move: remove boss hits
        shieldsActive: 0 // Not used for Jaybers8, but for consistency
      },
      flight: {
        damageDealt: 0,
        attackCount: 0,
        specialMoves: 0, // 8s and 12s
        bossHitsReceived: 0, // How many times boss hit this player
        triviaCorrect: 0,
        triviaWrong: 0,
        healsUsed: 0, // Not used for Flight, but for consistency
        shieldsActive: 0 // Special move: negate next hit
      }
    },
    currentMonster: null,
    finalBossHealth: 0,
    maxTriviaMultiplier: 0
  };
  // Preload audio
  gameOverAudio.preload = 'auto';
  fightMusic.preload = 'auto';
  healerSound.preload = 'auto';  // Initialize game stats when a monster is selected
  function initializeGameStats(monster) {
    gameStats = {
      startTime: Date.now(),
      endTime: null,
      winner: null,
      totalDamageDealt: 0,
      totalBossHits: 0, // Total boss hits across all players
      bossDamageDealt: 0,
      triviaStats: {
        correctAnswers: 0,
        wrongAnswers: 0,
        timeouts: 0
      },
      playerStats: {
        jaybers8: {
          damageDealt: 0,
          attackCount: 0,
          specialMoves: 0,
          bossHitsReceived: 0, // How many times boss hit this player
          triviaCorrect: 0,
          triviaWrong: 0,
          healsUsed: 0, // Special move: remove boss hits
          shieldsActive: 0 // Not used for Jaybers8, but for consistency
        },
        flight: {
          damageDealt: 0,
          attackCount: 0,
          specialMoves: 0,
          bossHitsReceived: 0, // How many times boss hit this player
          triviaCorrect: 0,
          triviaWrong: 0,
          healsUsed: 0, // Not used for Flight, but for consistency
          shieldsActive: 0 // Special move: negate next hit
        }
      },
      currentMonster: monster,
      finalBossHealth: 0,
      maxTriviaMultiplier: 0
    };
  }

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
    if (!visibleContainer) return;    const attackButton = visibleContainer.querySelector("#attackButton");
    const playerToggle = visibleContainer.querySelector("#playerToggle");
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
  }  function gameOver() {
    fightMusic.pause(); // Pause fight music
    fightMusic.currentTime = 0; // Reset to the beginning
    gameOverAudio.play();
    
    // Stop trivia system
    if (window.triviaManager) {
      window.triviaManager.stopTrivia();
    }
    
    // Set end time and defeat status
    gameStats.endTime = Date.now();
    gameStats.winner = "defeat";
    
    // Get current monster health for final stats
    const activeMonsterContainer = Array.from(document.querySelectorAll(".monster-container"))
                                   .find(c => c.style.display === "block");
    if (activeMonsterContainer) {
      const lifeBarText = activeMonsterContainer.querySelector("#lifeBarText");
      if (lifeBarText) {
        gameStats.finalBossHealth = parseInt(lifeBarText.textContent) || 0;
      }
    }    showGameResultsScreen("defeat");
    unbindGameKeys(); // Unbind keys when game ends
    
    // Show game setup buttons when game ends
    showGameSetupButtons();
    
    // Reset cursor to default when game ends
    const body = document.body;
    body.classList.remove('flight-theme', 'jaybers-theme');
  }

  function showVictoryScreen() {
    fightMusic.pause(); // Pause fight music
    fightMusic.currentTime = 0; // Reset to the beginning
    
    // Stop trivia system
    if (window.triviaManager) {
      window.triviaManager.stopTrivia();
    }
    
    // Set end time and victory status
    gameStats.endTime = Date.now();
    gameStats.winner = "victory";
    gameStats.finalBossHealth = 0;

    // Play healer sound for victory
    healerSound.currentTime = 0;
    healerSound.play().catch(err => console.error("Error playing healer sound:", err));    showGameResultsScreen("victory");    unbindGameKeys(); // Unbind keys when game ends
    
    // Show game setup buttons when game ends
    showGameSetupButtons();
    
    // Reset cursor to default when game ends
    const body = document.body;
    body.classList.remove('flight-theme', 'jaybers-theme');
  }

  // Function to capture screenshot of battle results
  function captureBattleScreenshot(element) {
    // Hide the screenshot button temporarily for cleaner capture
    const screenshotBtn = element.querySelector('#screenshotBtn');
    const originalDisplay = screenshotBtn ? screenshotBtn.style.display : null;
    if (screenshotBtn) {
      screenshotBtn.style.display = 'none';
    }

    // Store original styles
    const originalStyles = {
      height: element.style.height,
      maxHeight: element.style.maxHeight,
      overflow: element.style.overflow
    };
    
    // Optimize element for screenshot
    element.style.height = 'auto';
    element.style.maxHeight = 'none';
    element.style.overflow = 'visible';
    
    // Add delay to ensure rendering is complete
    setTimeout(() => {      html2canvas(element, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        scale: 4, // Enhanced quality for Discord sharing
        onclone: function(clonedDoc) {
          // Enhance screenshot styling in the clone
          const clonedElement = clonedDoc.querySelector('.battle-manual-content');
          if (clonedElement) {
            // Ensure cyberpunk cards are properly styled
            const cyberCards = clonedElement.querySelectorAll('.cyber-card');
            cyberCards.forEach(card => {
              const styles = getComputedStyle(element.querySelector('.cyber-card'));
              card.style.background = styles.background;
              card.style.border = styles.border;
              card.style.boxShadow = styles.boxShadow;
            });
            
            // Enhance trophy visibility
            const trophies = clonedElement.querySelectorAll('.trophy');
            trophies.forEach(trophy => {
              trophy.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
              trophy.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
              trophy.style.padding = '3px 6px';
              trophy.style.borderRadius = '4px';
            });
          }
        }
      }).then(canvas => {
        // Restore original styles
        element.style.height = originalStyles.height;
        element.style.maxHeight = originalStyles.maxHeight;
        element.style.overflow = originalStyles.overflow;
        
        // Restore screenshot button
        if (screenshotBtn && originalDisplay !== null) {
          screenshotBtn.style.display = originalDisplay;
        } else if (screenshotBtn) {
          screenshotBtn.style.display = 'inline-block';
        }
        
        // Convert to blob and copy to clipboard or download
        canvas.toBlob(blob => {
          if (!blob) {
            console.error('Canvas is empty');
            alert('Failed to capture screenshot');
            return;
          }
          
          if (navigator.clipboard && navigator.clipboard.write) {
            navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]).then(() => {
              alert('🎯 Battle report screenshot copied to clipboard!');
            }).catch(err => {
              console.error('Clipboard API failed:', err);
              fallbackDownloadBattle(blob);
            });
          } else {
            fallbackDownloadBattle(blob);
          }
        }, 'image/png', 1.0);
      }).catch(err => {
        // Restore styles even if capture fails
        element.style.height = originalStyles.height;
        element.style.maxHeight = originalStyles.maxHeight;
        element.style.overflow = originalStyles.overflow;
        
        if (screenshotBtn && originalDisplay !== null) {
          screenshotBtn.style.display = originalDisplay;
        } else if (screenshotBtn) {
          screenshotBtn.style.display = 'inline-block';
        }
        
        console.error('Failed to capture battle screenshot:', err);
        alert('Failed to capture screenshot. Please try again.');
      });
    }, 300); // Delay to ensure complete rendering
  }

  // Fallback download function for battle screenshots
  function fallbackDownloadBattle(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Generate filename with timestamp and battle result
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const result = gameStats.winner === 'victory' ? 'VICTORY' : 'DEFEAT';
    const monsterName = gameStats.currentMonster?.name?.replace(/\s+/g, '_') || 'Unknown';
    a.download = `ErgoArena_${result}_vs_${monsterName}_${timestamp}.png`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('🎯 Battle report screenshot downloaded!');
  }  function showGameResultsScreen(result) {
    // First show Astral Coalescence Phase overlay
    showAstralCoalescencePhase(result);
  }
  function showAstralCoalescencePhase(battleResult) {
    const coalescenceDiv = document.createElement("div");
    coalescenceDiv.id = "astralCoalescence";
    coalescenceDiv.style.position = "fixed";
    coalescenceDiv.style.top = "0";
    coalescenceDiv.style.left = "0";
    coalescenceDiv.style.width = "100%";
    coalescenceDiv.style.height = "100%";
    coalescenceDiv.style.backgroundColor = "rgba(0, 0, 0, 0.95)";
    coalescenceDiv.style.color = "white";
    coalescenceDiv.style.zIndex = "10000";
    coalescenceDiv.style.overflowY = "auto";
    coalescenceDiv.style.padding = "20px";

    const jaybers8Hits = gameStats.playerStats.jaybers8.bossHitsReceived;
    const flightHits = gameStats.playerStats.flight.bossHitsReceived;
    const totalHits = jaybers8Hits + flightHits;
    
    // Detect single-player mode
    const jaybers8Active = activeFighters.jaybers8;
    const flightActive = activeFighters.flight;
    const isSinglePlayer = !(jaybers8Active && flightActive);
    
    const isVictory = battleResult === "victory";
    const battleIcon = isVictory ? "🏆" : "💀";
    const battleText = isVictory ? "BATTLE VICTORY!" : "BATTLE DEFEAT!";
    const battleColor = isVictory ? "#27ae60" : "#e74c3c";

    coalescenceDiv.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="battle-manual-content" style="max-height: 90vh; overflow-y: auto;">
        <div class="manual-header">
          <h2 style="color: ${battleColor};">${battleIcon} ${battleText}</h2>
          <div class="manual-subtitle">🌌 Entering Astral Coalescence Phase 🌌</div>
        </div>
        
        <div class="manual-columns">
          <div class="manual-column">
            <div class="section-card" style="border: 3px solid #9b59b6; background: linear-gradient(135deg, rgba(155,89,182,0.2) 0%, rgba(142,68,173,0.1) 100%);">
              <h3>🌌 Astral Coalescence Phase</h3>
              <p style="font-size: 1.1em; margin-bottom: 20px;">The battle has ended, but the astral energies from this dimensional encounter now threaten to overwhelm your team. Each hit received during combat must be survived using your Habitica resources.</p>
                <div style="background: rgba(155,89,182,0.3); padding: 15px; border-radius: 10px; margin: 15px 0;">
                <h4 style="color: #e8d5f2; margin-bottom: 10px;">💥 Astral Impact Summary</h4>
                ${isSinglePlayer ? `
                  <div style="text-align: center; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                    ${jaybers8Active ? `
                      <div style="font-size: 2em;">🐿️</div>
                      <div style="color: #f39c12; font-weight: bold;">Jaybers8</div>
                      <div style="color: #e74c3c; font-size: 1.8em; font-weight: bold;">${jaybers8Hits} Hits</div>
                      <div style="font-size: 1em; color: #bdc3c7;">Astral damage received</div>
                    ` : `
                      <div style="font-size: 2em;">🐨</div>
                      <div style="color: #3498db; font-weight: bold;">FLIGHTx12!</div>
                      <div style="color: #e74c3c; font-size: 1.8em; font-weight: bold;">${flightHits} Hits</div>
                      <div style="font-size: 1em; color: #bdc3c7;">Astral damage received</div>
                    `}
                  </div>
                ` : `
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="text-align: center; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                      <div style="font-size: 2em;">🐿️</div>
                      <div style="color: #f39c12; font-weight: bold;">Jaybers8</div>
                      <div style="color: #e74c3c; font-size: 1.5em; font-weight: bold;">${jaybers8Hits} Hits</div>
                      <div style="font-size: 0.9em; color: #bdc3c7;">Astral damage received</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                      <div style="font-size: 2em;">🐨</div>
                      <div style="color: #3498db; font-weight: bold;">FLIGHTx12!</div>
                      <div style="color: #e74c3c; font-size: 1.5em; font-weight: bold;">${flightHits} Hits</div>
                      <div style="font-size: 0.9em; color: #bdc3c7;">Astral damage received</div>
                    </div>
                  </div>
                `}
                <div style="text-align: center; margin-top: 15px; padding: 10px; background: rgba(231,76,60,0.2); border-radius: 8px; border: 2px solid #e74c3c;">
                  <div style="color: #e74c3c; font-weight: bold; font-size: 1.2em;">Total Astral Hits: ${totalHits}</div>
                  <div style="color: #e74c3c; font-size: 0.9em;">Each hit = -1 Health click in Habitica</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="manual-column">
            <div class="section-card">
              <h3>🛡️ Survival Instructions</h3>
              <ol style="font-size: 1.1em; line-height: 1.6;">
                <li><strong>Go to Habitica</strong> - Open your Habitica app/website</li>
                <li><strong>Use Resources</strong> - Expend Mana, activate Skills, or consume Potions to prepare</li>
                <li><strong>Take the Hits</strong> - Click your Health ${totalHits} times to simulate astral damage</li>
                <li><strong>Survive or Perish</strong> - See if your character survives the onslaught</li>
                <li><strong>Report Back</strong> - Use the buttons below to report your fate</li>
              </ol>
            </div>
            
            <div class="section-card" style="border-color: #f39c12;">
              <h3>⚠️ Important Notes</h3>
              <ul>
                <li><strong>Strategic Resource Use:</strong> Use Habitica mana/skills/potions BEFORE taking hits</li>
                <li><strong>Death Consequences:</strong> Dying forfeits all battle rewards</li>
                <li><strong>Survival Rewards:</strong> Successfully surviving claims full victory spoils</li>
                <li><strong>No Cheating:</strong> Honor system - accurately report your survival status</li>
              </ul>
            </div>
          </div>
        </div>
          <div class="manual-footer" style="text-align: center; padding: 20px;">          <div style="margin-bottom: 25px; font-size: 1.1em; color: #f39c12;">
            ${isSinglePlayer ? 
              `Ready to resolve the Astral Coalescence Phase? Take your hits in Habitica:` :
              `Ready to resolve the Astral Coalescence Phase? Each player takes their own hits in Habitica:`
            }
          </div>
          
          ${jaybers8Active && (jaybers8Hits > 0 ? `
          <div style="margin-bottom: 20px; padding: 15px; background: rgba(243,156,18,0.1); border-radius: 10px; border: 2px solid #f39c12;">
            <h4 style="color: #f39c12; margin-bottom: 15px;">🐿️ Jaybers8's Astral Trial</h4>
            <p style="margin-bottom: 15px; color: #ecf0f1;">Take ${jaybers8Hits} hits in Habitica, then report back:</p>
            <button id="jaybers8SurvivedBtn" class="menu-button" style="background: #27ae60; margin-right: 15px; padding: 12px 25px;">
              <i class="fas fa-shield-alt"></i> Jaybers8 Survived!
            </button>
            <button id="jaybers8DiedBtn" class="menu-button" style="background: #e74c3c; padding: 12px 25px;">
              <i class="fas fa-skull"></i> Jaybers8 Died...
            </button>
          </div>
          ` : `
          <div style="margin-bottom: 15px; padding: 10px; background: rgba(39,174,96,0.1); border-radius: 8px; border: 2px solid #27ae60;">
            <h4 style="color: #27ae60; margin: 0;">🐿️ Jaybers8: No Astral Hits - Automatically Survived!</h4>
          </div>
          `)}
          
          ${flightActive && (flightHits > 0 ? `
          <div style="margin-bottom: 20px; padding: 15px; background: rgba(52,152,219,0.1); border-radius: 10px; border: 2px solid #3498db;">
            <h4 style="color: #3498db; margin-bottom: 15px;">🐨 FLIGHTx12!'s Astral Trial</h4>
            <p style="margin-bottom: 15px; color: #ecf0f1;">Take ${flightHits} hits in Habitica, then report back:</p>
            <button id="flightSurvivedBtn" class="menu-button" style="background: #27ae60; margin-right: 15px; padding: 12px 25px;">
              <i class="fas fa-shield-alt"></i> FLIGHTx12! Survived!
            </button>
            <button id="flightDiedBtn" class="menu-button" style="background: #e74c3c; padding: 12px 25px;">
              <i class="fas fa-skull"></i> FLIGHTx12! Died...
            </button>
          </div>
          ` : `
          <div style="margin-bottom: 15px; padding: 10px; background: rgba(39,174,96,0.1); border-radius: 8px; border: 2px solid #27ae60;">
            <h4 style="color: #27ae60; margin: 0;">🐨 FLIGHTx12!: No Astral Hits - Automatically Survived!</h4>
          </div>
          `)}
          
          <div id="survivalStatus" style="margin-top: 20px; padding: 15px; background: rgba(155,89,182,0.1); border-radius: 8px; display: none;">
            <h4 style="color: #9b59b6; margin-bottom: 10px;">⚖️ Survival Status</h4>
            <p id="survivalText" style="margin: 0; color: #e8d5f2;"></p>
            <button id="proceedToSummaryBtn" class="menu-button" style="background: #9b59b6; margin-top: 15px; padding: 12px 25px; display: none;">
              <i class="fas fa-scroll"></i> View Final Battle Summary
            </button>
          </div>
        </div>
      </div>
    `;    document.body.appendChild(coalescenceDiv);
    
    // Track survival status for each player - inactive players automatically survive
    let jaybers8Survived = jaybers8Hits === 0 || !jaybers8Active; // Auto-survive if no hits or inactive
    let flightSurvived = flightHits === 0 || !flightActive; // Auto-survive if no hits or inactive
    let jaybers8Resolved = jaybers8Hits === 0 || !jaybers8Active; // Auto-resolved if no hits or inactive
    let flightResolved = flightHits === 0 || !flightActive; // Auto-resolved if no hits or inactive
      function updateSurvivalStatus() {
      const statusDiv = document.getElementById('survivalStatus');
      const statusText = document.getElementById('survivalText');
      const proceedBtn = document.getElementById('proceedToSummaryBtn');
      
      if (jaybers8Resolved && flightResolved) {
        statusDiv.style.display = 'block';
        
        let statusMessage = '';
        if (isSinglePlayer) {
          // Single player mode messages
          if (jaybers8Active) {
            statusMessage = jaybers8Survived ? 
              '🏆 Jaybers8 survived the Astral Coalescence! Proceeding to claim victory...' :
              '💀 Jaybers8 perished during the Astral Coalescence. All rewards forfeited...';
          } else {
            statusMessage = flightSurvived ? 
              '🏆 FLIGHTx12! survived the Astral Coalescence! Proceeding to claim victory...' :
              '💀 FLIGHTx12! perished during the Astral Coalescence. All rewards forfeited...';
          }
        } else {
          // Multiplayer mode messages
          if (jaybers8Survived && flightSurvived) {
            statusMessage = '🏆 Both players survived the Astral Coalescence! Proceeding to claim full victory...';
          } else if (jaybers8Survived && !flightSurvived) {
            statusMessage = '⚰️ Jaybers8 survived, but FLIGHTx12! perished. Partial survival outcome...';
          } else if (!jaybers8Survived && flightSurvived) {
            statusMessage = '⚰️ FLIGHTx12! survived, but Jaybers8 perished. Partial survival outcome...';
          } else {
            statusMessage = '💀 Both players perished during the Astral Coalescence. All rewards forfeited...';
          }
        }
        
        statusText.textContent = statusMessage;
        proceedBtn.style.display = 'block';
      }
    }
      // Add event listeners for survival buttons (only for active players with hits)
    if (jaybers8Active && jaybers8Hits > 0) {
      document.getElementById('jaybers8SurvivedBtn').addEventListener('click', () => {
        jaybers8Survived = true;
        jaybers8Resolved = true;
        document.getElementById('jaybers8SurvivedBtn').style.display = 'none';
        document.getElementById('jaybers8DiedBtn').style.display = 'none';
        updateSurvivalStatus();
      });
      
      document.getElementById('jaybers8DiedBtn').addEventListener('click', () => {
        jaybers8Survived = false;
        jaybers8Resolved = true;
        document.getElementById('jaybers8SurvivedBtn').style.display = 'none';
        document.getElementById('jaybers8DiedBtn').style.display = 'none';
        updateSurvivalStatus();
      });
    }
    
    if (flightActive && flightHits > 0) {
      document.getElementById('flightSurvivedBtn').addEventListener('click', () => {
        flightSurvived = true;
        flightResolved = true;
        document.getElementById('flightSurvivedBtn').style.display = 'none';
        document.getElementById('flightDiedBtn').style.display = 'none';
        updateSurvivalStatus();
      });
      
      document.getElementById('flightDiedBtn').addEventListener('click', () => {
        flightSurvived = false;
        flightResolved = true;
        document.getElementById('flightSurvivedBtn').style.display = 'none';
        document.getElementById('flightDiedBtn').style.display = 'none';
        updateSurvivalStatus();
      });
    }
    
    // Initialize status if both players auto-survived
    updateSurvivalStatus();
    
    // Proceed to final summary
    document.getElementById('proceedToSummaryBtn').addEventListener('click', () => {
      document.body.removeChild(coalescenceDiv);
      showFinalBattleSummary(battleResult, jaybers8Survived, flightSurvived);
    });
  }
  function showFinalBattleSummary(battleResult, jaybers8Survived, flightSurvived) {
    const resultDiv = document.createElement("div");
    resultDiv.id = "gameResults";
    resultDiv.style.position = "fixed";
    resultDiv.style.top = "0";
    resultDiv.style.left = "0";
    resultDiv.style.width = "100%";
    resultDiv.style.height = "100%";
    resultDiv.style.backgroundColor = "rgba(0, 0, 0, 0.95)";
    resultDiv.style.color = "white";
    resultDiv.style.zIndex = "10000";
    resultDiv.style.overflowY = "auto";
    resultDiv.style.padding = "20px";    const battleDuration = gameStats.endTime - gameStats.startTime;
    const minutes = Math.floor(battleDuration / 60000);
    const seconds = Math.floor((battleDuration % 60000) / 1000);
    
    // Detect single-player mode
    const jaybers8Active = activeFighters.jaybers8;
    const flightActive = activeFighters.flight;
    const isSinglePlayer = !(jaybers8Active && flightActive);
    
    // Determine final outcome based on single-player vs multiplayer
    const battleWon = battleResult === "victory";
    let anyPlayerSurvived, allPlayersSurvived, finalVictory;
    
    if (isSinglePlayer) {
      // Single player mode: only check if the active player survived
      const activePlayerSurvived = jaybers8Active ? jaybers8Survived : flightSurvived;
      anyPlayerSurvived = activePlayerSurvived;
      allPlayersSurvived = activePlayerSurvived;
      finalVictory = battleWon && activePlayerSurvived;
    } else {
      // Multiplayer mode: check both players
      anyPlayerSurvived = jaybers8Survived || flightSurvived;
      allPlayersSurvived = jaybers8Survived && flightSurvived;
      finalVictory = battleWon && allPlayersSurvived;
    }
    
    let headerIcon, headerText, headerColor;
    if (finalVictory) {
      headerIcon = "🏆";
      headerText = isSinglePlayer ? "ULTIMATE VICTORY!" : "ULTIMATE VICTORY!";
      headerColor = "#27ae60";
    } else if (battleWon && anyPlayerSurvived) {
      headerIcon = isSinglePlayer ? "💀" : "⚰️";
      headerText = isSinglePlayer ? "PYRRHIC DEFEAT" : "PARTIAL VICTORY";
      headerColor = isSinglePlayer ? "#e74c3c" : "#f39c12";
    } else if (battleWon && !anyPlayerSurvived) {
      headerIcon = "💀";
      headerText = "PYRRHIC DEFEAT";
      headerColor = "#e74c3c";
    } else {
      headerIcon = "💀";
      headerText = "COMPLETE DEFEAT";
      headerColor = "#e74c3c";
    }
    
    // Determine battle mode based on whether summon was used
    const monsterDropdown = document.getElementById("monsterDropdown");
    const wasRandomSummon = monsterDropdown && monsterDropdown.getAttribute('data-was-summon') === 'true';
    const battleMode = wasRandomSummon ? "🪄 Summon Mode" : "🔬 HCMC Portal Mode";
    const battleModeIcon = wasRandomSummon ? "🪄" : "🔬";

    resultDiv.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="battle-manual-content" style="max-height: 90vh; overflow-y: auto;">
        <span class="close" id="closeResults">&times;</span>        <div class="manual-header">
          <h2 style="color: ${headerColor};">${headerIcon} ${headerText} ${headerIcon}</h2>
          <div class="manual-subtitle">Battle Statistics & Performance Analysis</div>
          <div class="battle-mode-badge" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 8px 16px;
            border-radius: 20px;
            margin: 10px auto;
            width: fit-content;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          ">
            ${battleMode} Combat
          </div>
        </div>
        
        <div class="manual-columns">
          <div class="manual-column">            <div class="section-card">
              <h3>⚔️ Battle Overview</h3>
              <p><strong>Entry Mode:</strong> ${battleMode}</p>
              <p><strong>Opponent:</strong> ${gameStats.currentMonster?.name || 'Unknown'}</p>
              <p><strong>Duration:</strong> ${minutes}m ${seconds}s</p>
              <p><strong>Final Boss Health:</strong> ${gameStats.finalBossHealth} / ${gameStats.currentMonster?.health || 0} HP</p>
              <p><strong>Total Boss Hits:</strong> ${gameStats.totalBossHits}</p>
              <p><strong>Boss Damage Taken:</strong> ${gameStats.bossDamageDealt}</p>
              <p><strong>Peak Memory Sync:</strong> ×${gameStats.maxTriviaMultiplier.toFixed(1)}</p>
            </div>            <div class="section-card" style="border: 2px solid #9b59b6; background: linear-gradient(135deg, rgba(155,89,182,0.1) 0%, rgba(142,68,173,0.05) 100%);">
              <h3>🌌 Astral Coalescence Phase - RESOLVED</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div style="text-align: center; padding: 15px; background: ${jaybers8Survived ? 'rgba(39,174,96,0.2)' : 'rgba(231,76,60,0.2)'}; border-radius: 8px; border: 2px solid ${jaybers8Survived ? '#27ae60' : '#e74c3c'};">
                  <div style="font-size: 2em; margin-bottom: 5px;">🐿️</div>
                  <div style="color: #f39c12; font-weight: bold; margin-bottom: 5px;">Jaybers8</div>
                  <div style="color: ${jaybers8Survived ? '#27ae60' : '#e74c3c'}; font-size: 1.2em; font-weight: bold;">
                    ${gameStats.playerStats.jaybers8.bossHitsReceived} hits - ${jaybers8Survived ? '✅ Survived' : '💀 Perished'}
                  </div>
                </div>
                <div style="text-align: center; padding: 15px; background: ${flightSurvived ? 'rgba(39,174,96,0.2)' : 'rgba(231,76,60,0.2)'}; border-radius: 8px; border: 2px solid ${flightSurvived ? '#27ae60' : '#e74c3c'};">
                  <div style="font-size: 2em; margin-bottom: 5px;">🐨</div>
                  <div style="color: #3498db; font-weight: bold; margin-bottom: 5px;">FLIGHTx12!</div>
                  <div style="color: ${flightSurvived ? '#27ae60' : '#e74c3c'}; font-size: 1.2em; font-weight: bold;">
                    ${gameStats.playerStats.flight.bossHitsReceived} hits - ${flightSurvived ? '✅ Survived' : '💀 Perished'}
                  </div>
                </div>
              </div>
              <div style="padding: 10px; background: ${allPlayersSurvived ? 'rgba(39,174,96,0.2)' : anyPlayerSurvived ? 'rgba(243,156,18,0.2)' : 'rgba(231,76,60,0.2)'}; border-radius: 8px; border-left: 4px solid ${allPlayersSurvived ? '#27ae60' : anyPlayerSurvived ? '#f39c12' : '#e74c3c'};">
                <small style="color: ${allPlayersSurvived ? '#27ae60' : anyPlayerSurvived ? '#f39c12' : '#e74c3c'}; font-weight: bold;">
                  ${allPlayersSurvived ? 
                    '🛡️ Both players successfully withstood the astral bombardment through strategic use of Habitica resources!' : 
                    anyPlayerSurvived ?
                    '⚔️ Partial survival - only one player endured the astral coalescence. Rewards will be affected.' :
                    '💀 Both players perished during the astral coalescence phase, forfeiting all battle gains.'}
                </small>
              </div>
            </div>
            
            <div class="section-card">
              <h3>🧠 Dimension Sync Performance</h3>
              <div class="sync-mechanics">
                <div class="sync-item correct">
                  ✅ Correct Answers: <strong>${gameStats.triviaStats.correctAnswers}</strong>
                </div>
                <div class="sync-item wrong">
                  ❌ Wrong Answers: <strong>${gameStats.triviaStats.wrongAnswers}</strong>
                </div>
                <div class="sync-item timeout">
                  ⏰ Timeouts: <strong>${gameStats.triviaStats.timeouts}</strong>
                </div>
              </div>
              <p><strong>Accuracy Rate:</strong> ${gameStats.triviaStats.correctAnswers + gameStats.triviaStats.wrongAnswers > 0 ? 
                ((gameStats.triviaStats.correctAnswers / (gameStats.triviaStats.correctAnswers + gameStats.triviaStats.wrongAnswers)) * 100).toFixed(1) : 0}%</p>
            </div>            ${!finalVictory ? `
            <div class="section-card" style="border-color: ${!battleWon ? '#e74c3c' : anyPlayerSurvived ? '#f39c12' : '#e74c3c'};">
              <h3>${!battleWon ? '💀 Battle Defeat' : anyPlayerSurvived ? '⚰️ Partial Victory' : '💀 Pyrrhic Defeat'}</h3>
              ${!battleWon ? `
                <div style="margin-bottom: 15px;">
                  <strong style="color: #e74c3c;">Battle Lost - Mode-Specific Penalties:</strong>
                  <div style="margin-top: 8px; padding: 10px; background: rgba(231,76,60,0.1); border-radius: 6px;">
                    ${wasRandomSummon ? 
                      '🪄 <strong>Summon Mode Failure:</strong> No Ducat rewards earned. Early Habitica gold cashout forfeited.' :
                      '🔬 <strong>HCMC Portal Accident:</strong> Running away penalty applied as per HCMC safety protocols.'}
                  </div>
                </div>
                <div style="border-top: 1px solid #e74c3c; padding-top: 10px;">
                  <strong>ErgoVillain Punishment:</strong>
                  <p style="color: #e74c3c; font-weight: bold; margin-top: 8px;">${gameStats.currentMonster?.Punishment || "No punishment defined."}</p>
                </div>
              ` : anyPlayerSurvived ? `
                <div style="margin-bottom: 15px;">
                  <strong style="color: #f39c12;">Battle Won, Partial Astral Survival:</strong>
                  <div style="margin-top: 8px; padding: 10px; background: rgba(243,156,18,0.1); border-radius: 6px;">
                    <p style="color: #f39c12; margin: 0;">You defeated the ErgoVillain and ${jaybers8Survived && flightSurvived ? 'both players survived' : jaybers8Survived ? 'Jaybers8 survived but FLIGHTx12! perished' : 'FLIGHTx12! survived but Jaybers8 perished'}. Reduced rewards granted.</p>
                  </div>
                </div>
                <div style="border-top: 1px solid #f39c12; padding-top: 10px;">
                  <strong style="color: #f39c12;">Partial Rewards (50% of full):</strong>
                  <p style="color: #f39c12; font-weight: bold; margin-top: 8px;">${gameStats.currentMonster?.Rewards || "No rewards defined."}</p>
                </div>
              ` : `
                <div style="margin-bottom: 15px;">
                  <strong style="color: #e74c3c;">Battle Won, But Total Astral Failure:</strong>
                  <div style="margin-top: 8px; padding: 10px; background: rgba(231,76,60,0.1); border-radius: 6px;">
                    <p style="color: #e74c3c; margin: 0;">You defeated the ErgoVillain but both players perished during the Astral Coalescence Phase. All rewards are forfeited.</p>
                  </div>
                </div>
                <div style="border-top: 1px solid #e74c3c; padding-top: 10px;">
                  <strong style="color: #e74c3c;">Forfeited Rewards:</strong>
                  <p style="color: #95a5a6; font-weight: bold; margin-top: 8px; text-decoration: line-through;">${gameStats.currentMonster?.Rewards || "No rewards defined."}</p>
                </div>
              `}
              <div style="margin-top: 15px; padding: 10px; background: rgba(231,76,60,0.15); border-radius: 6px; border-left: 4px solid #e74c3c;">
                <strong style="color: #e74c3c;">💀 Astral Casualties:</strong>
                <p style="color: #e74c3c; margin-top: 5px; font-size: 0.9em;">
                  ${!jaybers8Survived && !flightSurvived ? 'Both players perished during coalescence.' : 
                    !jaybers8Survived ? 'Jaybers8 could not withstand the astral energies.' :
                    !flightSurvived ? 'FLIGHTx12! was overwhelmed by astral forces.' : 
                    'Astral energies proved manageable for the surviving team.'}
                </p>
              </div>
            </div>
            ` : `
            <div class="section-card" style="border-color: #27ae60;">
              <h3>🏆 Ultimate Victory!</h3>
              <div style="margin-bottom: 15px;">
                <strong style="color: #27ae60;">Mode-Specific Rewards Earned:</strong>
                <div style="margin-top: 8px; padding: 10px; background: rgba(39,174,96,0.1); border-radius: 6px;">
                  ${wasRandomSummon ? 
                    '🪄 <strong>Summon Mode Victory:</strong> 50 Ducats earned (scalable)! Early Habitica gold cashout unlocked.' :
                    '🔬 <strong>HCMC Portal Escape:</strong> Successfully navigated accidental portal breach. No penalties applied.'}
                </div>
              </div>
              <div style="border-top: 1px solid #27ae60; padding-top: 10px;">
                <strong>ErgoVillain Rewards:</strong>
                <p style="color: #27ae60; font-weight: bold; margin-top: 8px;">${gameStats.currentMonster?.Rewards || "No rewards defined."}</p>
              </div>              <div style="margin-top: 15px; padding: 10px; background: rgba(39,174,96,0.15); border-radius: 6px; border-left: 4px solid #27ae60;">
                <strong style="color: #27ae60;">🌌 ${isSinglePlayer ? 'Solo Astral Mastery' : 'Perfect Astral Mastery'}:</strong>
                <p style="color: #27ae60; margin-top: 5px; font-size: 0.9em;">
                  ${isSinglePlayer ? 
                    `${jaybers8Active ? 'Jaybers8' : 'FLIGHTx12!'} successfully weathered their astral impacts (${jaybers8Active ? gameStats.playerStats.jaybers8.bossHitsReceived : gameStats.playerStats.flight.bossHitsReceived} hits)! This solo victory demonstrates exceptional coordination between ErgoSphere combat skills and Habitica resource management.` :
                    `Both players successfully weathered their astral impacts (Jaybers8: ${gameStats.playerStats.jaybers8.bossHitsReceived}, FLIGHTx12!: ${gameStats.playerStats.flight.bossHitsReceived})! This complete victory demonstrates exceptional coordination between ErgoSphere combat skills and Habitica resource management.`}
                </p>
              </div>
            </div>
            `}
          </div>          <div class="manual-column">
            ${jaybers8Active ? `
            <!-- Jaybers8 Cyberpunk Performance Card -->
            <div class="cyber-card jaybers-theme" ${isSinglePlayer ? 'style="max-width: 600px; margin: 0 auto;"' : ''}>
              <div class="cyber-header">
                <div class="cyber-corner top-left"></div>
                <div class="cyber-corner top-right"></div>
                <h3 class="cyber-title">
                  <span class="squirrel-icon">🐿️</span>
                  <span class="cyber-glow">JAYBERS8</span>
                  <span class="cyber-subtitle">BELKAN COMBAT UNIT</span>
                </h3>
              </div>
              <div class="cyber-grid">
                <div class="cyber-stat">
                  <span class="cyber-label">DMG OUTPUT</span>
                  <span class="cyber-value">${gameStats.playerStats.jaybers8.damageDealt}</span>
                </div>
                <div class="cyber-stat">
                  <span class="cyber-label">ATTACK CYCLES</span>
                  <span class="cyber-value">${gameStats.playerStats.jaybers8.attackCount}</span>
                </div>
                <div class="cyber-stat">
                  <span class="cyber-label">INCOMING HITS</span>
                  <span class="cyber-value">${gameStats.playerStats.jaybers8.bossHitsReceived}</span>
                </div>                <div class="cyber-stat">
                  <span class="cyber-label">SPECIAL PROTOCOLS</span>
                  <span class="cyber-value">${gameStats.playerStats.jaybers8.specialMoves}</span>
                </div>
                <div class="cyber-stat">
                  <span class="cyber-label">HEALING CHARGES</span>
                  <span class="cyber-value">${gameStats.playerStats.jaybers8.healsUsed}</span>
                </div>
                <div class="cyber-stat">
                  <span class="cyber-label">SYNC SUCCESS</span>
                  <span class="cyber-value">${gameStats.playerStats.jaybers8.triviaCorrect}</span>
                </div>
                <div class="cyber-stat">
                  <span class="cyber-label">SYNC FAILURE</span>
                  <span class="cyber-value">${gameStats.playerStats.jaybers8.triviaWrong}</span>
                </div>
                <div class="cyber-stat full-width">
                  <span class="cyber-label">AVG DMG/CYCLE</span>
                  <span class="cyber-value">${gameStats.playerStats.jaybers8.attackCount > 0 ? 
                    (gameStats.playerStats.jaybers8.damageDealt / gameStats.playerStats.jaybers8.attackCount).toFixed(1) : 0}</span>
                </div>
              </div>
              <div class="cyber-trophies">
                ${isSinglePlayer ? '<span class="trophy">🏆 SOLO WARRIOR</span>' : ''}
                ${!isSinglePlayer && gameStats.playerStats.jaybers8.damageDealt > gameStats.playerStats.flight.damageDealt ? '<span class="trophy">⚔️ DAMAGE KING</span>' : ''}
                ${!isSinglePlayer && gameStats.playerStats.jaybers8.triviaCorrect > gameStats.playerStats.flight.triviaCorrect ? '<span class="trophy">🧠 SYNC MASTER</span>' : ''}
                ${!isSinglePlayer && gameStats.playerStats.jaybers8.bossHitsReceived > gameStats.playerStats.flight.bossHitsReceived ? '<span class="trophy">🛡️ PAIN ENDURED</span>' : ''}
                ${!isSinglePlayer && gameStats.playerStats.jaybers8.specialMoves > gameStats.playerStats.flight.specialMoves ? '<span class="trophy">✨ SPECIAL OPS</span>' : ''}
              </div>
              <div class="cyber-corner bottom-left"></div>
              <div class="cyber-corner bottom-right"></div>
            </div>
            ` : ''}
            
            ${flightActive ? `
            <!-- FLIGHTx12! Cyberpunk Performance Card -->
            <div class="cyber-card flight-theme" ${isSinglePlayer ? 'style="max-width: 600px; margin: 0 auto;"' : ''}>
              <div class="cyber-header">
                <div class="cyber-corner top-left"></div>
                <div class="cyber-corner top-right"></div>
                <h3 class="cyber-title">
                  <span class="koala-icon">🐨</span>
                  <span class="cyber-glow">FLIGHTx12!</span>
                  <span class="cyber-subtitle">DILARDIAN STRIKE UNIT</span>
                </h3>
              </div>
              <div class="cyber-grid">
                <div class="cyber-stat">
                  <span class="cyber-label">DMG OUTPUT</span>
                  <span class="cyber-value">${gameStats.playerStats.flight.damageDealt}</span>
                </div>
                <div class="cyber-stat">
                  <span class="cyber-label">ATTACK CYCLES</span>
                  <span class="cyber-value">${gameStats.playerStats.flight.attackCount}</span>
                </div>
                <div class="cyber-stat">
                  <span class="cyber-label">INCOMING HITS</span>
                  <span class="cyber-value">${gameStats.playerStats.flight.bossHitsReceived}</span>
                </div>                <div class="cyber-stat">
                  <span class="cyber-label">SPECIAL PROTOCOLS</span>
                  <span class="cyber-value">${gameStats.playerStats.flight.specialMoves}</span>
                </div>
                <div class="cyber-stat">
                  <span class="cyber-label">SHIELDS REMAINING</span>
                  <span class="cyber-value">${gameStats.playerStats.flight.shieldsActive}</span>
                </div>
                <div class="cyber-stat">
                  <span class="cyber-label">SYNC SUCCESS</span>
                  <span class="cyber-value">${gameStats.playerStats.flight.triviaCorrect}</span>
                </div>
                <div class="cyber-stat">
                  <span class="cyber-label">SYNC FAILURE</span>
                  <span class="cyber-value">${gameStats.playerStats.flight.triviaWrong}</span>
                </div>
                <div class="cyber-stat full-width">
                  <span class="cyber-label">AVG DMG/CYCLE</span>
                  <span class="cyber-value">${gameStats.playerStats.flight.attackCount > 0 ? 
                    (gameStats.playerStats.flight.damageDealt / gameStats.playerStats.flight.attackCount).toFixed(1) : 0}</span>
                </div>
              </div>
              <div class="cyber-trophies">
                ${isSinglePlayer ? '<span class="trophy">🏆 SOLO WARRIOR</span>' : ''}
                ${!isSinglePlayer && gameStats.playerStats.flight.damageDealt > gameStats.playerStats.jaybers8.damageDealt ? '<span class="trophy">⚔️ MOS HANDS</span>' : ''}
                ${!isSinglePlayer && gameStats.playerStats.flight.triviaCorrect > gameStats.playerStats.jaybers8.triviaCorrect ? '<span class="trophy">🧠 SYNC MASTER</span>' : ''}
                ${!isSinglePlayer && gameStats.playerStats.flight.bossHitsReceived > gameStats.playerStats.jaybers8.bossHitsReceived ? '<span class="trophy">🛡️ WALKING TANK</span>' : ''}
                ${!isSinglePlayer && gameStats.playerStats.flight.specialMoves > gameStats.playerStats.jaybers8.specialMoves ? '<span class="trophy">✨ SPECIAL OPS</span>' : ''}
              </div>
              <div class="cyber-corner bottom-left"></div>
              <div class="cyber-corner bottom-right"></div>
            </div>
            ` : ''}            <div class="section-card">
              <h3>🔄 Battle Actions & Individual Astral Impact</h3>
              <p><strong>Total Attacks:</strong> ${jaybers8Active && flightActive ? 
                gameStats.playerStats.jaybers8.attackCount + gameStats.playerStats.flight.attackCount :
                jaybers8Active ? gameStats.playerStats.jaybers8.attackCount : gameStats.playerStats.flight.attackCount}</p>
              <p><strong>Total Special Moves:</strong> ${jaybers8Active && flightActive ? 
                gameStats.playerStats.jaybers8.specialMoves + gameStats.playerStats.flight.specialMoves :
                jaybers8Active ? gameStats.playerStats.jaybers8.specialMoves : gameStats.playerStats.flight.specialMoves}</p>
              <p><strong>Total Trivia Questions:</strong> ${gameStats.triviaStats.correctAnswers + gameStats.triviaStats.wrongAnswers + gameStats.triviaStats.timeouts}</p>
              <p><strong>Boss Healing Events:</strong> ${gameStats.triviaStats.wrongAnswers + gameStats.triviaStats.timeouts}</p>
              <p><strong>HP Healed by Boss:</strong> ${(gameStats.triviaStats.wrongAnswers * 50) + (gameStats.triviaStats.timeouts * 20)}</p>
              <div style="margin-top: 15px; padding: 10px; background: rgba(155,89,182,0.1); border-radius: 6px;">
                <strong style="color: #9b59b6;">🌌 Individual Astral Exposure:</strong>
                ${isSinglePlayer ? `
                <div style="margin-top: 8px; display: flex; justify-content: center;">
                  <div style="text-align: center; padding: 12px; background: ${jaybers8Active ? 'rgba(243,156,18,0.1)' : 'rgba(52,152,219,0.1)'}; border-radius: 4px; min-width: 200px;">
                    <div style="color: ${jaybers8Active ? '#f39c12' : '#3498db'}; font-weight: bold;">
                      ${jaybers8Active ? '🐿️ Jaybers8' : '🐨 FLIGHTx12!'}
                    </div>
                    <div style="color: #9b59b6;">${jaybers8Active ? gameStats.playerStats.jaybers8.bossHitsReceived : gameStats.playerStats.flight.bossHitsReceived} astral hits</div>
                  </div>
                </div>
                <p style="margin-top: 8px; color: #9b59b6; font-size: 0.9em;">Solo astral trial resolved through individual Habitica resource management.</p>
                ` : `
                <div style="margin-top: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <div style="text-align: center; padding: 8px; background: rgba(243,156,18,0.1); border-radius: 4px;">
                    <div style="color: #f39c12; font-weight: bold;">🐿️ Jaybers8</div>
                    <div style="color: #9b59b6;">${gameStats.playerStats.jaybers8.bossHitsReceived} astral hits</div>
                  </div>
                  <div style="text-align: center; padding: 8px; background: rgba(52,152,219,0.1); border-radius: 4px;">
                    <div style="color: #3498db; font-weight: bold;">🐨 FLIGHTx12!</div>
                    <div style="color: #9b59b6;">${gameStats.playerStats.flight.bossHitsReceived} astral hits</div>
                  </div>
                </div>
                <p style="margin-top: 8px; color: #9b59b6; font-size: 0.9em;">Each player resolved their individual astral trial through separate Habitica resource management.</p>
                `}
              </div>
            </div>
          </div>
        </div>
          <div class="manual-footer">
          <button id="screenshotBtn" class="menu-button" style="margin-right: 15px;">
            <i class="fas fa-camera"></i> Screenshot Battle Report
          </button>
          <button id="restartGameBtn" class="menu-button" style="margin-right: 15px;">
            <i class="fas fa-redo"></i> Battle Again
          </button>
          <button id="leaveArenaBtn" class="menu-button">
            <i class="fas fa-arrow-left"></i> Leave Arena
          </button>
          <div class="version-info">ErgoSphere ARENA Battle Report v3.0 | Dual-Mode Combat & Astral Coalescence</div>
        </div>
      </div>
    `;

    // Add event listeners
    document.body.appendChild(resultDiv);
    
    // Close button
    document.getElementById('closeResults').addEventListener('click', () => {
      location.reload();
    });
    
    // Restart button
    document.getElementById('restartGameBtn').addEventListener('click', () => {
      location.reload();
    });
      // Leave arena button  
    const leaveBtn = resultDiv.querySelector('#leaveArenaBtn');
    if (leaveBtn) {
      leaveBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
      });
    }

    // Screenshot button
    const screenshotBtn = resultDiv.querySelector('#screenshotBtn');
    if (screenshotBtn) {
      screenshotBtn.addEventListener('click', () => {
        const battleContent = resultDiv.querySelector('.battle-manual-content');
        if (battleContent) {
          captureBattleScreenshot(battleContent);
        }
      });
    }

    // Click outside to close
    const overlay = resultDiv.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        location.reload();
      });
    }

    // Escape key to close
    document.addEventListener('keydown', function escapeHandler(event) {
      if (event.key === 'Escape') {
        document.removeEventListener('keydown', escapeHandler);
        location.reload();
      }
    });
  }

  if (!document.getElementById("chooseOpponentBtn")) {
    // Create Choose Fighters button first (will appear on the left)
    const chooseFightersBtn = document.createElement("button");
    chooseFightersBtn.id = "chooseFightersBtn";
    chooseFightersBtn.textContent = "Choose Fighters";
    monsterButtonsContainer.appendChild(chooseFightersBtn);

    // Create Choose Opponent button second (will appear on the right)
    const chooseOpponentBtn = document.createElement("button");
    chooseOpponentBtn.id = "chooseOpponentBtn";
    chooseOpponentBtn.textContent = "Choose Opponent";
    monsterButtonsContainer.appendChild(chooseOpponentBtn);

    const monsterDropdown = document.createElement("select");
    monsterDropdown.id = "monsterDropdown";
    monsterDropdown.style.display = "none";
    monsterButtonsContainer.appendChild(monsterDropdown);

    // Create Fighter Selection Dropdown
    const fighterDropdown = document.createElement("div");
    fighterDropdown.id = "fighterDropdown";    // Jaybers8 option with attack inputs
    const jaybers8Option = document.createElement("div");
    jaybers8Option.classList.add("fighter-option");
    
    // Create header row with checkbox and label
    const jaybers8Header = document.createElement("div");
    jaybers8Header.style.display = "flex";
    jaybers8Header.style.alignItems = "center";
    
    const jaybers8Checkbox = document.createElement("input");
    jaybers8Checkbox.type = "checkbox";
    jaybers8Checkbox.id = "jaybers8Checkbox";
    jaybers8Checkbox.checked = true;
    
    const jaybers8Label = document.createElement("label");
    jaybers8Label.textContent = "Jaybers8";
    jaybers8Label.htmlFor = "jaybers8Checkbox";
    
    jaybers8Header.appendChild(jaybers8Checkbox);
    jaybers8Header.appendChild(jaybers8Label);
    jaybers8Option.appendChild(jaybers8Header);
    
    // Jaybers8 attack input controls
    const jaybers8AttackControls = document.createElement("div");
    jaybers8AttackControls.classList.add("attack-input-controls");
    jaybers8AttackControls.innerHTML = `
      <div class="input-counter">
        <span class="player-indicator" style="color: var(--player1-color);">⚔️</span>
        <button class="attack-input-btn decrease" data-player="1">-</button>
        <span class="attack-count" id="jaybers8AttackCount">1</span>
        <button class="attack-input-btn increase" data-player="1">+</button>
        <span class="input-label">inputs</span>
      </div>
    `;
    jaybers8Option.appendChild(jaybers8AttackControls);
    
    // FLIGHTx12! option with attack inputs
    const flightOption = document.createElement("div");
    flightOption.classList.add("fighter-option");
    
    // Create header row with checkbox and label
    const flightHeader = document.createElement("div");
    flightHeader.style.display = "flex";
    flightHeader.style.alignItems = "center";
    
    const flightCheckbox = document.createElement("input");
    flightCheckbox.type = "checkbox";
    flightCheckbox.id = "flightCheckbox";
    flightCheckbox.checked = true;
    
    const flightLabel = document.createElement("label");
    flightLabel.textContent = "FLIGHTx12!";
    flightLabel.htmlFor = "flightCheckbox";
    
    flightHeader.appendChild(flightCheckbox);
    flightHeader.appendChild(flightLabel);
    flightOption.appendChild(flightHeader);
    
    // FLIGHTx12! attack input controls
    const flightAttackControls = document.createElement("div");
    flightAttackControls.classList.add("attack-input-controls");
    flightAttackControls.innerHTML = `
      <div class="input-counter">
        <span class="player-indicator" style="color: var(--player2-color);">⚔️</span>
        <button class="attack-input-btn decrease" data-player="2">-</button>
        <span class="attack-count" id="flightAttackCount">1</span>
        <button class="attack-input-btn increase" data-player="2">+</button>
        <span class="input-label">inputs</span>
      </div>
    `;
    flightOption.appendChild(flightAttackControls);
    
    fighterDropdown.appendChild(jaybers8Option);
    fighterDropdown.appendChild(flightOption);
    monsterButtonsContainer.appendChild(fighterDropdown);

    // Store planned attack counts for each player
    let plannedAttackCounts = { 1: 1, 2: 1 };

    // Attack input control handlers
    fighterDropdown.addEventListener("click", (e) => {
      if (e.target.classList.contains("attack-input-btn")) {
        e.stopPropagation(); // Prevent dropdown from closing
        const player = parseInt(e.target.dataset.player);
        const isIncrease = e.target.classList.contains("increase");
        
        if (isIncrease && plannedAttackCounts[player] < 11) {
          plannedAttackCounts[player]++;
        } else if (!isIncrease && plannedAttackCounts[player] > 1) {
          plannedAttackCounts[player]--;
        }
        
        // Update display
        const countElement = document.getElementById(player === 1 ? "jaybers8AttackCount" : "flightAttackCount");
        countElement.textContent = plannedAttackCounts[player];
        
        // Update existing monster containers if any
        updateAllMonsterContainersForPlannedInputs();
      }
    });

    // Function to update all monster containers with planned input counts
    function updateAllMonsterContainersForPlannedInputs() {
      const monsterContainers = document.querySelectorAll(".monster-container");
      monsterContainers.forEach(container => {
        const container1 = container.querySelector("#attackInputs1");
        const container2 = container.querySelector("#attackInputs2");
        
        if (container1 && container2) {
          // Update Jaybers8 inputs
          updateContainerInputs(container1, plannedAttackCounts[1], 1);
          // Update FLIGHTx12! inputs
          updateContainerInputs(container2, plannedAttackCounts[2], 2);
        }
      });
    }

    // Function to update a specific container's inputs
    function updateContainerInputs(container, targetCount, player) {
      const currentInputs = container.children.length;
      
      if (currentInputs < targetCount) {
        // Add inputs
        for (let i = currentInputs; i < targetCount; i++) {
          const input = document.createElement("input");
          input.type = "number";
          input.min = "1";
          input.max = "20";
          input.style.backgroundColor = player === 1 ? "purple" : "green";
          container.appendChild(input);
        }
      } else if (currentInputs > targetCount) {
        // Remove inputs
        for (let i = currentInputs; i > targetCount; i--) {
          container.removeChild(container.lastChild);
        }
      }
    }

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
        container2.style.display = "block";      } else {
        // Both active - normal toggle mode - use current player
        attackButton.textContent = `${currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!"} Attack!`;
        playerToggle.textContent = currentPlayer === 1 ? "Switch to FLIGHTx12!" : "Switch to Jaybers8";
        container1.style.display = currentPlayer === 1 ? "block" : "none";        container2.style.display = currentPlayer === 2 ? "block" : "none";      }

      updateCursorTheme(currentPlayer);    }    // Add "Enemy Select" option first as default
    const enemySelectOption = document.createElement("option");
    enemySelectOption.value = "";
    enemySelectOption.text = "Enemy Select";
    enemySelectOption.disabled = true;
    enemySelectOption.selected = true;
    monsterDropdown.appendChild(enemySelectOption);

    // Add "Summon" option second
    const summonOption = document.createElement("option");
    summonOption.value = "summon";
    summonOption.text = "Summon";
    summonOption.style.color = "red";
    summonOption.style.fontWeight = "bold";
    monsterDropdown.appendChild(summonOption);

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
<div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:5px;">  <p><span style="color:deepskyblue; font-weight:bold;">Attack Type:</span> <span style="color:white;">${monster.attackType}</span></p>
  <p><span style="color:deepskyblue; font-weight:bold;">Health:</span> <span style="color:white;">${monster.health}</span></p>
  <p><span style="color:deepskyblue; font-weight:bold;">Hit Numbers:</span> <span style="color:white;">${monster.hitNumbers.join(', ')}</span></p>
  <p><span style="color:deepskyblue; font-weight:bold;">Rewards:</span> <span style="color:white; font-size:0.85em;">${monster.Rewards}</span></p>
  <p><span style="color:deepskyblue; font-weight:bold;">Punishment:</span> <span style="color:white; font-size:0.85em;">${monster.Punishment}</span></p>
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
          attackButton.textContent = `${currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!"} Attack!`;          playerToggle.textContent =
            currentPlayer === 1 ? "Switch to FLIGHTx12!" : "Switch to Jaybers8";
          toggleContainer(currentPlayer);
          updateCursorTheme(currentPlayer);

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

      let monsterLife = monster.health;      let numAttacks = { 1: plannedAttackCounts[1], 2: plannedAttackCounts[2] }; // Use planned attack counts

      // Create initial inputs based on planned counts
      const initialInputs = {};
      
      // Create inputs for Jaybers8
      for (let i = 0; i < plannedAttackCounts[1]; i++) {
        const input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.max = "20";
        input.style.backgroundColor = "purple";
        container1.appendChild(input);
      }
      
      // Create inputs for FLIGHTx12!
      for (let i = 0; i < plannedAttackCounts[2]; i++) {
        const input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.max = "20";
        input.style.backgroundColor = "green";
        container2.appendChild(input);
      }

      let attackButtonCooldown = false; // Cooldown flag
      attackButton.addEventListener("click", () => {
        if (attackButtonCooldown) return; // If cooldown is active, ignore click

        attackButtonCooldown = true; // Activate cooldown
          if (!timerStarted) {
          timerStarted = true;
          timer = startTimer();
          playFightMusic(); // Attempt to play fight music
          updateCursorTheme(currentPlayer); // Apply themed cursor when game starts
        }        // Enhanced attack logic with special abilities
        const currentContainer = currentPlayer === 1 ? container1 : container2;
        let totalDamage = 0;
        let hitCount = 0;
        let specialMoveUsed = false;
        let specialMoveMessage = "";
        let specialEffectClass = "";
        
        // Check if multiplayer mode for damage buff
        const isMultiplayer = activeFighters.jaybers8 && activeFighters.flight;

        // Count special move occurrences for combo detection
        let eightCount = 0;
        let twelveCount = 0;
        
        // First pass: count special moves
        for (let i = 0; i < currentContainer.children.length; i++) {
          const input = currentContainer.children[i];
          const damage = parseInt(input.value);
          if (!isNaN(damage)) {
            if (currentPlayer === 1 && damage === 8) eightCount++;
            if (currentPlayer === 2 && damage === 12) twelveCount++;
          }
        }

        // Second pass: process damage and special abilities
        for (let i = 0; i < currentContainer.children.length; i++) {
          const input = currentContainer.children[i];
          const damage = parseInt(input.value);
          if (!isNaN(damage)) {
            if (currentPlayer === 1 && damage === 8) {
              // Jaybers8's enhanced special move: 100 DMG + Healing abilities
              totalDamage += 100;
              specialMoveUsed = true;
              
              if (eightCount >= 2) {
                // DOUBLE 8s - ULTIMATE HEALING SURGE
                let totalHealed = 0;
                if (isMultiplayer) {
                  // Heal 4 hits from both players
                  const jayHeal = Math.min(4, gameStats.playerStats.jaybers8.bossHitsReceived);
                  const flightHeal = Math.min(4, gameStats.playerStats.flight.bossHitsReceived);
                  
                  gameStats.playerStats.jaybers8.bossHitsReceived -= jayHeal;
                  gameStats.playerStats.flight.bossHitsReceived -= flightHeal;
                  gameStats.totalBossHits = Math.max(0, gameStats.totalBossHits - (jayHeal + flightHeal));
                  totalHealed = jayHeal + flightHeal;
                  
                  specialMoveMessage = "🌟✨ DOUBLE 8s! ULTIMATE HEALING SURGE! ✨🌟 Jaybers8 channels divine energy, healing " + totalHealed + " hits from both fighters! 💫🩹💫";
                  specialEffectClass = "ultimate-heal-effect";
                } else {
                  // Solo mode: heal 4 hits from self
                  const jayHeal = Math.min(4, gameStats.playerStats.jaybers8.bossHitsReceived);
                  gameStats.playerStats.jaybers8.bossHitsReceived -= jayHeal;
                  gameStats.totalBossHits = Math.max(0, gameStats.totalBossHits - jayHeal);
                  totalHealed = jayHeal;
                  
                  specialMoveMessage = "🌟✨ DOUBLE 8s! DIVINE RESTORATION! ✨🌟 Jaybers8 unleashes ultimate healing magic, restoring " + totalHealed + " hits! 💫🩹💫";
                  specialEffectClass = "ultimate-heal-effect";
                }
                gameStats.playerStats.jaybers8.healsUsed += totalHealed;
              } else {
                // Single 8 - Regular healing
                if (gameStats.playerStats.jaybers8.bossHitsReceived > 0) {
                  gameStats.playerStats.jaybers8.bossHitsReceived--;
                  gameStats.totalBossHits = Math.max(0, gameStats.totalBossHits - 1);
                  gameStats.playerStats.jaybers8.healsUsed++;
                  specialMoveMessage = "🎯 Jaybers8 rolls an 8! Deals 100 special damage and heals 1 previous boss hit! ⚡🩹";
                  specialEffectClass = "heal-effect";
                } else {
                  specialMoveMessage = "🎯 Jaybers8 rolls an 8! Deals 100 special damage! ⚡";
                  specialEffectClass = "special-attack-effect";
                }
              }
              
              // Play enhanced healing sound for double 8s
              if (eightCount >= 2) {
                healerSound.volume = 0.6;
                healerSound.play().catch(err => console.error("Error playing healer sound:", err));
                // Add second sound for ultimate effect
                setTimeout(() => {
                  const ultimateSound = new Audio('../assets/audio/punch - 1.mp3');
                  ultimateSound.volume = 0.4;
                  ultimateSound.play().catch(err => console.error("Error playing ultimate sound:", err));
                }, 300);
              } else {
                healerSound.volume = 0.4;
                healerSound.play().catch(err => console.error("Error playing healer sound:", err));
              }
              
            } else if (currentPlayer === 2 && damage === 12) {
              // Flight's enhanced special move: 100 DMG + Shield abilities
              totalDamage += 100;
              specialMoveUsed = true;
              
              if (twelveCount >= 2) {
                // DOUBLE 12s - FORTRESS SHIELD
                gameStats.playerStats.flight.shieldsActive += 5;
                specialMoveMessage = "🛡️⚔️ DOUBLE 12s! FORTRESS SHIELD ACTIVATED! ⚔️🛡️ FLIGHTx12! creates an impenetrable barrier that blocks the next 5 hits on BOTH fighters! 🌀💎🌀";
                specialEffectClass = "fortress-shield-effect";
              } else {
                // Single 12 - Regular shield
                gameStats.playerStats.flight.shieldsActive++;
                specialMoveMessage = "🎯 FLIGHTx12! rolls a 12! Deals 100 special damage and activates shield (negates next hit)! 🛡️⚡";
                specialEffectClass = "shield-effect";
              }
              
            } else {
              // Count how many times the damage value appears in hitNumbers
              const occurrences = monster.hitNumbers.filter(num => num === damage).length;
              if (occurrences > 0) {
                hitCount += occurrences; // Stack duplicate hits
              } else {
                totalDamage += damage;
              }            }
          }
        }// Apply trivia multiplier to total damage
        let triviaMultiplier = 1;
        if (window.triviaManager && totalDamage > 0) {
          triviaMultiplier = window.triviaManager.applyMultiplierAndReset();
          totalDamage = Math.floor(totalDamage * triviaMultiplier);
        }
        
        // Apply 20% multiplayer damage buff when both players are active
        if (isMultiplayer && totalDamage > 0) {
          totalDamage = Math.floor(totalDamage * 1.2);
        }

        // Track game stats for this attack
        const playerKey = currentPlayer === 1 ? 'jaybers8' : 'flight';
        
        // Update player-specific stats
        gameStats.playerStats[playerKey].attackCount++;
        gameStats.playerStats[playerKey].damageDealt += totalDamage;
        
        // Count special moves (8s for Jaybers8, 12s for FLIGHTx12!) using existing currentContainer
        for (let i = 0; i < currentContainer.children.length; i++) {
          const input = currentContainer.children[i];
          const damage = parseInt(input.value);
          if (!isNaN(damage)) {
            if ((currentPlayer === 1 && damage === 8) || (currentPlayer === 2 && damage === 12)) {
              gameStats.playerStats[playerKey].specialMoves++;
            }
          }
        }        
        // Update total damage dealt and track max trivia multiplier
        gameStats.totalDamageDealt += totalDamage;
        gameStats.bossDamageDealt += totalDamage;
        if (triviaMultiplier > gameStats.maxTriviaMultiplier) {
          gameStats.maxTriviaMultiplier = triviaMultiplier;
        }        // Track boss hits received by the current player with enhanced shield consumption
        let actualHitsReceived = hitCount;
        let shieldsUsed = 0;
        
        if (hitCount > 0) {
          // Check if ANY player has active shields (fortress shield protects both)
          if (gameStats.playerStats.flight.shieldsActive > 0) {
            const shieldsToUse = Math.min(hitCount, gameStats.playerStats.flight.shieldsActive);
            gameStats.playerStats.flight.shieldsActive -= shieldsToUse;
            actualHitsReceived -= shieldsToUse;
            shieldsUsed = shieldsToUse;
          }
          
          // Only apply hits that weren't blocked by shields
          if (actualHitsReceived > 0) {
            gameStats.playerStats[playerKey].bossHitsReceived += actualHitsReceived;
            gameStats.totalBossHits += actualHitsReceived;
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
          const imageElement = monsterImage.querySelector('img'); // Get the actual img element
          if (imageElement) {
            imageElement.style.animation = `shake ${shakeIntensity * 0.1}s infinite, redFlash ${redIntensity * 0.5}s infinite`;
            navigator.vibrate(shakeIntensity * 100); // Vibrate for intensity * 100ms
            setTimeout(() => {
              imageElement.style.animation = "";
            }, duration * 1000);
          }
        }        const playerName = currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!";        if (monsterLife === 0) {
          clearInterval(timer);  // Stop timer when boss is defeated
          
          // Update game stats for victory
          gameStats.endTime = Date.now();
          gameStats.winner = "victory";
          gameStats.finalBossHealth = 0;
          
          // Announce victory in historyContainer with large, bold, bright red font
          historyContainer.innerHTML += `<p style="font-size:2rem; font-weight:bold; color:#FF0000; text-align: center; margin: 15px 0; text-shadow: 2px 2px 4px rgba(0, 0, 0, 1);">${playerName} defeated the ${monster.name}!</p>`;
          image.src = monster.defeatedImageSrc;
          
          // Always add the copy log button after updating innerHTML
          ensureCopyLogButton(monster, historyContainer);
          
          // Show victory screen with detailed stats
          setTimeout(() => {
            showVictoryScreen();
          }, 2000); // Small delay to let players see the victory message first
        }// Use the monster-specific dialogue methods:
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
          historyContainer.innerHTML += `<p style="color:white; font-style: italic; font-size: 1.1rem; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);">${damageDialogue}</p>`;        }        // Add special move message first if any special moves were used
        if (specialMoveUsed && specialMoveMessage) {
          historyContainer.innerHTML += `<p class="${specialEffectClass}" style="color:gold; font-size: 1.3rem; font-weight: bold; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9); margin: 8px 0;">${specialMoveMessage}</p>`;
        }
        
        // Create damage message with trivia multiplier and multiplayer bonus info
        let damageMessage = `${playerName} attacks for a cumulative total of ${totalDamage} damage.`;
        
        if (triviaMultiplier > 1 && isMultiplayer) {
          const preTriviaPreMultiplayer = Math.floor(totalDamage / (triviaMultiplier * 1.2));
          const postTrivia = Math.floor(preTriviaPreMultiplayer * triviaMultiplier);
          damageMessage = `${playerName} attacks for ${preTriviaPreMultiplayer} damage (×${triviaMultiplier.toFixed(1)} trivia + ×1.2 multiplayer = ${totalDamage} total damage).`;
        } else if (triviaMultiplier > 1) {
          const baseDamage = Math.floor(totalDamage / triviaMultiplier);
          damageMessage = `${playerName} attacks for ${baseDamage} damage (×${triviaMultiplier.toFixed(1)} trivia bonus = ${totalDamage} total damage).`;
        } else if (isMultiplayer) {
          const baseDamage = Math.floor(totalDamage / 1.2);
          damageMessage = `${playerName} attacks for ${baseDamage} damage (×1.2 multiplayer bonus = ${totalDamage} total damage).`;
        }
        
        historyContainer.innerHTML += `<p style="color:${playerName==="Jaybers8"?"purple":"green"}; font-size: 1.1rem; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);">${damageMessage}</p>`;
          if (hitCount > 0) {
          // Play monster counter-attack sounds
          playPunchSounds(hitCount, '../assets/audio/Punch - 2.mp3');
            if (shieldsUsed > 0) {
            // Show enhanced shield consumption message
            const shieldMessage = gameStats.playerStats.flight.shieldsActive >= 4 ? 
              `🛡️🌀 FORTRESS SHIELD blocks ${shieldsUsed} hit${shieldsUsed > 1 ? 's' : ''} on ${playerName}! 🌀🛡️` :
              `🛡️ ${playerName}'s shield blocks ${shieldsUsed} hit${shieldsUsed > 1 ? 's' : ''}!`;
            historyContainer.innerHTML += `<p class="shield-block-effect" style="color:cyan; font-size: 1.1rem; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9); margin: 5px 0;">${shieldMessage}</p>`;
          }
          
          if (actualHitsReceived > 0) {
            historyContainer.innerHTML += `<p style="color:red; font-size: 1.1rem; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);">${monster.name} hits ${playerName} ${actualHitsReceived} time${actualHitsReceived > 1 ? 's' : ''}.</p>`;
          } else if (shieldsUsed > 0) {
            const blockMessage = gameStats.playerStats.flight.shieldsActive >= 4 ?
              `🌀💎 FORTRESS SHIELD completely protects ${playerName} from all ${hitCount} hit${hitCount > 1 ? 's' : ''}! 💎🌀` :
              `All ${hitCount} hit${hitCount > 1 ? 's' : ''} blocked by shield!`;
            historyContainer.innerHTML += `<p class="shield-block-effect" style="color:cyan; font-size: 1.1rem; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9); margin: 5px 0;">${blockMessage}</p>`;
          }
          
          if (hitDialogue && actualHitsReceived > 0) {
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
        if (activeFighters.jaybers8 && activeFighters.flight) {          currentPlayer = currentPlayer === 1 ? 2 : 1;
          attackButton.textContent = `${currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!"} Attack!`;
          playerToggle.textContent = currentPlayer === 1 ? "Switch to FLIGHTx12!" : "Switch to Jaybers8";
          toggleContainer(currentPlayer);
          updateCursorTheme(currentPlayer);
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
      fighterDropdown.style.display = "none";    });    monsterDropdown.addEventListener("change", () => {
      let selectedMonsterIndex = monsterDropdown.value;
      
      // Do nothing if "Enemy Select" default option is selected
      if (selectedMonsterIndex === "") {
        return;
      }
      
      // Handle "Summon" option - randomly pick a boss
      if (selectedMonsterIndex === "summon") {
        selectedMonsterIndex = Math.floor(Math.random() * monsters.length);
        // Update the dropdown to show the selected monster
        monsterDropdown.value = selectedMonsterIndex;
        
        // Add a summon message to history
        setTimeout(() => {
          const historyContainer = document.getElementById("historyContainer" + selectedMonsterIndex);
          if (historyContainer) {
            historyContainer.innerHTML += `<p style="color:red; font-size: 1.2rem; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9); text-align: center;">🔮 HCMC Collison COMPLETE! 🔮</p>`;
            historyContainer.innerHTML += `<p style="color:orange; font-size: 1.1rem; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9); text-align: center;"> ${monsters[selectedMonsterIndex].name} appears!</p>`;
            historyContainer.innerHTML += `<hr>`;
            historyContainer.scrollTop = historyContainer.scrollHeight;
          }
        }, 1000); // Delay to let the game setup complete first
      }

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
      
      if (selectedMonsterIndex !== "" && selectedMonsterIndex !== "summon") {
        // Hide the How To Play modal when game starts
        const modal = document.getElementById('howToPlayModal');
        if (modal) {
          modal.style.display = 'none';
        }
        
        // Initialize game stats for the selected monster
        const selectedMonster = monsters[selectedMonsterIndex];
        initializeGameStats(selectedMonster);
        
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
          monsterDropdown.style.display = "none";        // Always start/restart timer when a monster is selected
        timerStarted = true;
        timer = startTimer();
        playFightMusic();
        updateCursorTheme(currentPlayer); // Apply themed cursor when game starts
        
        // Hide game setup buttons when game starts
        hideGameSetupButtons();
      }
    });  }

  // Function to hide game setup buttons when game starts
  function hideGameSetupButtons() {
    const chooseFightersBtn = document.getElementById("chooseFightersBtn");
    const chooseOpponentBtn = document.getElementById("chooseOpponentBtn");
    const howToPlayBtn = document.getElementById("howToPlayBtn");
    const leaveArenaBtn = document.getElementById("leaveArenaBtn");
    
    if (chooseFightersBtn) chooseFightersBtn.style.display = "none";
    if (chooseOpponentBtn) chooseOpponentBtn.style.display = "none";
    if (howToPlayBtn) howToPlayBtn.style.display = "none";
    
    // Update leave arena button to show escape option
    if (leaveArenaBtn) {
      leaveArenaBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Escape - 2🌐';
      leaveArenaBtn.onclick = function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to escape? This will cost you 2🌐 and end the current battle.')) {
          // Handle escape logic - deduct 2 energy and return to home
          window.location.href = '../index.html';
        }
      };
    }
  }

  // Function to show game setup buttons when game ends
  function showGameSetupButtons() {
    const chooseFightersBtn = document.getElementById("chooseFightersBtn");
    const chooseOpponentBtn = document.getElementById("chooseOpponentBtn");
    const howToPlayBtn = document.getElementById("howToPlayBtn");
    const leaveArenaBtn = document.getElementById("leaveArenaBtn");
    
    if (chooseFightersBtn) chooseFightersBtn.style.display = "block";
    if (chooseOpponentBtn) chooseOpponentBtn.style.display = "block";
    if (howToPlayBtn) howToPlayBtn.style.display = "block";
    
    // Reset leave arena button to normal
    if (leaveArenaBtn) {
      leaveArenaBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Leave Arena';
      leaveArenaBtn.onclick = function(e) {
        e.preventDefault();
        window.location.href = '../index.html';
      };
    }
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
      const container1 = activeMonsterContainer.querySelector("#attackInputs1");
      const container2 = activeMonsterContainer.querySelector("#attackInputs2");
      
      if (attackButton && playerToggle) {
        attackButton.textContent = `${currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!"} Attack!`;
        playerToggle.textContent = currentPlayer === 1 ? "Switch to FLIGHTx12!" : "Switch to Jaybers8";
          // Handle container toggling directly
        if (container1 && container2) {
          container1.style.display = currentPlayer === 1 ? "block" : "none";
          container2.style.display = currentPlayer === 2 ? "block" : "none";
        }
        
        // Handle button colors directly
        updateCursorTheme(currentPlayer);
      }
    }
  }
  // Keep only the event listeners for trivia events - remove all the duplicate functions
  document.addEventListener('triviaTimeout', handleTriviaTimeout);
  document.addEventListener('triviaWrongAnswer', handleTriviaWrongAnswer);
  document.addEventListener('triviaCorrectAnswer', handleTriviaCorrectAnswer);
  
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
    
    // Heal boss by 20 points, but don't exceed max health
    const oldHealth = currentHealth;
    currentHealth = Math.min(currentHealth + 20, maxHealth);
    const actualHealing = currentHealth - oldHealth;
      if (actualHealing > 0) {
      // Update life bar display
      lifeBarGreen.style.width = (currentHealth / maxHealth) * 100 + "%";
      lifeBarText.textContent = currentHealth;
      
      // Track trivia timeout stats
      gameStats.triviaStats.timeouts++;
      
      // Add healing message to battle log
      const healMessage = `⏰ Trivia timeout! ${monster.name} regenerates ${actualHealing} health! (${oldHealth} → ${currentHealth})`;
      historyContainer.innerHTML += `<p style="color:#f39c12; font-size: 1.1rem; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);">${healMessage}</p>`;
      historyContainer.innerHTML += `<hr>`;
      historyContainer.scrollTop = historyContainer.scrollHeight;
      
      // Visual feedback - green flash on monster
      const monsterImage = activeMonsterContainer.querySelector(".monster-image");
      if (monsterImage) {
        const imageElement = monsterImage.querySelector('img');
        if (imageElement) {
          imageElement.style.filter = "hue-rotate(120deg) brightness(1.3)";
          setTimeout(() => {
            imageElement.style.filter = "";
          }, 500);
        }
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
    
    // Get current player info
    const playerKey = currentPlayer === 1 ? 'jaybers8' : 'flight';
    const playerName = currentPlayer === 1 ? 'Jaybers8' : 'FLIGHTx12!';
    
    // Add hit to current player first (before healing boss)
    gameStats.playerStats[playerKey].bossHitsReceived++;
    
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
    
    // Track trivia wrong answer stats (always, regardless of healing)
    gameStats.triviaStats.wrongAnswers++;
    
    // Track for current player (always, regardless of healing)
    gameStats.playerStats[playerKey].triviaWrong++;
    
    // Add player hit message to battle log (always happens)
    const hitMessage = `💥 ${playerName} takes a hit for the wrong answer! (Hits received: ${gameStats.playerStats[playerKey].bossHitsReceived})`;
    historyContainer.innerHTML += `<p style="color:#ff6b6b; font-size: 1.1rem; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);">${hitMessage}</p>`;
    
    // Add healing message to battle log (show even if no healing occurred)
    if (actualHealing > 0) {
      const healMessage = `❌ Wrong answer! ${monster.name} regenerates ${actualHealing} health! (${oldHealth} → ${currentHealth})`;
      historyContainer.innerHTML += `<p style="color:#e74c3c; font-size: 1.1rem; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);">${healMessage}</p>`;
      
      // Update life bar display only if healing occurred
      lifeBarGreen.style.width = (currentHealth / maxHealth) * 100 + "%";
      lifeBarText.textContent = currentHealth;
    } else {
      // Boss was already at full health
      const noHealMessage = `❌ Wrong answer! ${monster.name} is already at full health!`;
      historyContainer.innerHTML += `<p style="color:#e74c3c; font-size: 1.1rem; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);">${noHealMessage}</p>`;
    }
    
    // Check if we should switch players (always happens if both players are active)
    let switchMessage = "";
    if (activeFighters.jaybers8 && activeFighters.flight) {
      const oldPlayer = playerName;
      switchToNextPlayer();
      const newPlayerName = currentPlayer === 1 ? 'Jaybers8' : 'FLIGHTx12!';
      switchMessage = `🔄 Player switched! Now it's ${newPlayerName}'s turn!`;
      historyContainer.innerHTML += `<p style="color:#4ecdc4; font-size: 1.1rem; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);">${switchMessage}</p>`;
    }
    
    historyContainer.innerHTML += `<hr>`;
    historyContainer.scrollTop = historyContainer.scrollHeight;
    
    // Visual feedback - red flash on monster (always happens)
    const monsterImage = activeMonsterContainer.querySelector(".monster-image");
    if (monsterImage) {
      const imageElement = monsterImage.querySelector('img');
      if (imageElement) {
        imageElement.style.filter = "hue-rotate(-60deg) brightness(1.4) saturate(1.5)"; // Red healing flash
        setTimeout(() => {
          imageElement.style.filter = "";
        }, 700);
      }
    }
    
    // Play a different healing sound effect for wrong answers (always happens)
    const wrongHealSound = new Audio('../assets/audio/healer.mp3');
    wrongHealSound.volume = 0.4;
    wrongHealSound.playbackRate = 0.8; // Slower/deeper sound for wrong answers
    wrongHealSound.play().catch(err => console.error("Error playing wrong answer heal sound:", err));
      console.log(`Boss healing attempt: ${oldHealth} → ${currentHealth} (+${actualHealing})`);
    console.log(`${playerName} received a hit (total: ${gameStats.playerStats[playerKey].bossHitsReceived})${switchMessage ? ' and player switched' : ''}`);
  }
  // Handler for trivia correct answers
  function handleTriviaCorrectAnswer(event) {
    // Extract timestamp from event if available
    const timestamp = event.detail?.timestamp || Date.now();
    const eventId = `correct_${timestamp}`;
    
    // Check if we've already processed this event
    if (processedTriviaEvents.has(eventId)) {
      console.log('Ignoring duplicate trivia correct answer event', eventId);
      return;
    }
    
    // Add to registry of processed events
    processedTriviaEvents.add(eventId);
    console.log('Processing trivia correct answer event', eventId);
    
    // Track trivia correct answer stats (global and per-player)
    gameStats.triviaStats.correctAnswers++;
    
    // Track for current player
    const playerKey = currentPlayer === 1 ? 'jaybers8' : 'flight';
    gameStats.playerStats[playerKey].triviaCorrect++;
    
    console.log(`Trivia correct answer tracked for ${playerKey}. Total correct: ${gameStats.triviaStats.correctAnswers}`);
  }

});
