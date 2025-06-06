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
  const healerSound = new Audio('../assets/audio/healer.mp3'); // Add healer sound
  fightMusic.loop = true; // loop the fight music
  fightMusic.volume = 0.5; // Set volume to 50% (adjust as needed)
  healerSound.volume = 0.7; // Set healer sound volume
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
        triviaWrong: 0
      },
      flight: {
        damageDealt: 0,
        attackCount: 0,
        specialMoves: 0, // 8s and 12s
        bossHitsReceived: 0, // How many times boss hit this player
        triviaCorrect: 0,
        triviaWrong: 0
      }
    },
    currentMonster: null,
    finalBossHealth: 0,
    maxTriviaMultiplier: 0
  };
  // Preload audio
  gameOverAudio.preload = 'auto';
  fightMusic.preload = 'auto';
  healerSound.preload = 'auto';
  // Initialize game stats when a monster is selected
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
          triviaWrong: 0
        },
        flight: {
          damageDealt: 0,
          attackCount: 0,
          specialMoves: 0,
          bossHitsReceived: 0, // How many times boss hit this player
          triviaCorrect: 0,
          triviaWrong: 0
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
    }

    showGameResultsScreen("defeat");
    unbindGameKeys(); // Unbind keys when game ends
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
    healerSound.play().catch(err => console.error("Error playing healer sound:", err));

    showGameResultsScreen("victory");    unbindGameKeys(); // Unbind keys when game ends
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
    setTimeout(() => {
      html2canvas(element, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        scale: 2, // High quality
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
  }

  function showGameResultsScreen(result) {
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
    resultDiv.style.padding = "20px";

    const battleDuration = gameStats.endTime - gameStats.startTime;
    const minutes = Math.floor(battleDuration / 60000);
    const seconds = Math.floor((battleDuration % 60000) / 1000);
    
    const isVictory = result === "victory";
    const headerIcon = isVictory ? "🏆" : "💀";
    const headerText = isVictory ? "VICTORY!" : "DEFEAT!";
    const headerColor = isVictory ? "#27ae60" : "#e74c3c";

    resultDiv.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="battle-manual-content" style="max-height: 90vh; overflow-y: auto;">
        <span class="close" id="closeResults">&times;</span>
        <div class="manual-header">
          <h2 style="color: ${headerColor};">${headerIcon} ${headerText} ${headerIcon}</h2>
          <div class="manual-subtitle">Battle Statistics & Performance Analysis</div>
        </div>
        
        <div class="manual-columns">
          <div class="manual-column">
            <div class="section-card">
              <h3>⚔️ Battle Overview</h3>
              <p><strong>Opponent:</strong> ${gameStats.currentMonster?.name || 'Unknown'}</p>
              <p><strong>Duration:</strong> ${minutes}m ${seconds}s</p>
              <p><strong>Final Boss Health:</strong> ${gameStats.finalBossHealth} / ${gameStats.currentMonster?.health || 0} HP</p>
              <p><strong>Total Boss Hits:</strong> ${gameStats.totalBossHits}</p>
              <p><strong>Boss Damage Taken:</strong> ${gameStats.bossDamageDealt}</p>
              <p><strong>Peak Memory Sync:</strong> ×${gameStats.maxTriviaMultiplier.toFixed(1)}</p>
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
            </div>

            ${!isVictory ? `
            <div class="section-card" style="border-color: #e74c3c;">
              <h3>💀 Consequences</h3>
              <p style="color: #e74c3c; font-weight: bold;">${gameStats.currentMonster?.Punishment || "No punishment defined."}</p>
            </div>
            ` : `
            <div class="section-card" style="border-color: #27ae60;">
              <h3>🎁 Rewards</h3>
              <p style="color: #27ae60; font-weight: bold;">${gameStats.currentMonster?.Rewards || "No rewards defined."}</p>
            </div>
            `}
          </div>          <div class="manual-column">
            <!-- Jaybers8 Cyberpunk Performance Card -->
            <div class="cyber-card jaybers-theme">
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
                </div>
                <div class="cyber-stat">
                  <span class="cyber-label">SPECIAL PROTOCOLS</span>
                  <span class="cyber-value">${gameStats.playerStats.jaybers8.specialMoves}</span>
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
                ${gameStats.playerStats.jaybers8.damageDealt > gameStats.playerStats.flight.damageDealt ? '<span class="trophy">⚔️ DAMAGE KING</span>' : ''}
                ${gameStats.playerStats.jaybers8.triviaCorrect > gameStats.playerStats.flight.triviaCorrect ? '<span class="trophy">🧠 SYNC MASTER</span>' : ''}
                ${gameStats.playerStats.jaybers8.bossHitsReceived > gameStats.playerStats.flight.bossHitsReceived ? '<span class="trophy">🛡️ PAIN ENDURED</span>' : ''}
                ${gameStats.playerStats.jaybers8.specialMoves > gameStats.playerStats.flight.specialMoves ? '<span class="trophy">✨ SPECIAL OPS</span>' : ''}
              </div>
              <div class="cyber-corner bottom-left"></div>
              <div class="cyber-corner bottom-right"></div>
            </div>
            
            <!-- FLIGHTx12! Cyberpunk Performance Card -->
            <div class="cyber-card flight-theme">
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
                </div>
                <div class="cyber-stat">
                  <span class="cyber-label">SPECIAL PROTOCOLS</span>
                  <span class="cyber-value">${gameStats.playerStats.flight.specialMoves}</span>
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
                ${gameStats.playerStats.flight.damageDealt > gameStats.playerStats.jaybers8.damageDealt ? '<span class="trophy">⚔️ MOS HANDS</span>' : ''}
                ${gameStats.playerStats.flight.triviaCorrect > gameStats.playerStats.jaybers8.triviaCorrect ? '<span class="trophy">🧠 SYNC MASTER</span>' : ''}
                ${gameStats.playerStats.flight.bossHitsReceived > gameStats.playerStats.jaybers8.bossHitsReceived ? '<span class="trophy">🛡️ WALKING TANK</span>' : ''}
                ${gameStats.playerStats.flight.specialMoves > gameStats.playerStats.jaybers8.specialMoves ? '<span class="trophy">✨ SPECIAL OPS</span>' : ''}
              </div>
              <div class="cyber-corner bottom-left"></div>
              <div class="cyber-corner bottom-right"></div>
            </div>

            <div class="section-card">
              <h3>🔄 Battle Actions</h3>
              <p><strong>Total Attacks:</strong> ${gameStats.playerStats.jaybers8.attackCount + gameStats.playerStats.flight.attackCount}</p>
              <p><strong>Total Special Moves:</strong> ${gameStats.playerStats.jaybers8.specialMoves + gameStats.playerStats.flight.specialMoves}</p>
              <p><strong>Total Trivia Questions:</strong> ${gameStats.triviaStats.correctAnswers + gameStats.triviaStats.wrongAnswers + gameStats.triviaStats.timeouts}</p>
              <p><strong>Boss Healing Events:</strong> ${gameStats.triviaStats.wrongAnswers + gameStats.triviaStats.timeouts}</p>
              <p><strong>HP Healed by Boss:</strong> ${(gameStats.triviaStats.wrongAnswers * 50) + (gameStats.triviaStats.timeouts * 20)}</p>
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
          <div class="version-info">ErgoSphere ARENA Battle Report v1.0</div>
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
        container2.style.display = "block";      } else {
        // Both active - normal toggle mode - use current player
        attackButton.textContent = `${currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!"} Attack!`;
        playerToggle.textContent = currentPlayer === 1 ? "Switch to FLIGHTx12!" : "Switch to Jaybers8";
        container1.style.display = currentPlayer === 1 ? "block" : "none";
        container2.style.display = currentPlayer === 2 ? "block" : "none";      }

      toggleButtonColors(currentPlayer);    }    // Add "Enemy Select" option first as default
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
      });      removeAttackButton.addEventListener("click", () => {
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
              }            }
          }
        }        // Apply trivia multiplier to total damage
        let triviaMultiplier = 1;
        if (window.triviaManager && totalDamage > 0) {
          triviaMultiplier = window.triviaManager.applyMultiplierAndReset();
          totalDamage = Math.floor(totalDamage * triviaMultiplier);
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
        }
        
        // Track boss hits received by the current player
        if (hitCount > 0) {
          gameStats.playerStats[playerKey].bossHitsReceived += hitCount;
          gameStats.totalBossHits += hitCount;
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
        toggleButtonColors(currentPlayer);
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
