let choices = [];
let currentPool = 'LOOT';
let currentCycleId = null;
let spinning = false;
let stopInitiated = false;
let delay = 1000;
let rampStartTime = null;
let powerDownPlayed = false; // Add this with other state variables at the top

const choiceDisplay = document.getElementById("choice-display");
const choiceImage = document.getElementById("choice-image");
const choiceText = document.getElementById("choice-text");
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const rewardDisplay = document.getElementById("reward-display");
const staticRewards = document.getElementById("static-rewards");
const choiceContent = document.getElementById("choice-content");
const lootButton = document.getElementById("loot-button");
const pvpButton = document.getElementById("pvp-button");
const coopButton = document.getElementById("coop-button");

const AUDIO = {
    click: new Audio('../assets/audio/click.mp3'),
    cycle: new Audio('../assets/audio/cycle.mp3'),
    slowdown: new Audio('../assets/audio/slowdown.mp3'),
    popup: new Audio('../assets/audio/popup.mp3'),
    spinUp: new Audio('../assets/audio/HCMC spin up.mp3'),
    powerDown: new Audio('../assets/audio/Power down.mp3'), // Add power down sound
    mouseClick: new Audio('../assets/audio/mouse-click-normal.mp3'),
    hazzard: new Audio('../assets/audio/hazzard.mp3'),
    helper: new Audio('../assets/audio/healer.mp3'),
    weekMod: new Audio('../assets/audio/Week Mod.mp3'),
    want: new Audio('../assets/audio/happy-logo-13397.mp3')
};

// Initialize audio settings
Object.values(AUDIO).forEach(audio => {
    audio.preload = 'auto';
    audio.volume = 0.5;
});

function playSound(soundName) {
    const sound = AUDIO[soundName];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }
}

// Update the click sound to include both sounds
function playClickSounds() {
    playSound('mouseClick');
    playSound('click');
}

function loadChoices(pool) {
  resetCycle();
  currentPool = pool.toUpperCase();
  currentCycleId = Math.random();
  
  return fetch(`../data/${pool}.json`)
    .then(response => response.json())
    .then(data => {
      choices = data;
      populateStaticRewards();
    })
    .catch(error => console.error('Error loading choices:', error));
}

function createInfoOverlay(choice) {
    const overlay = document.createElement('div');
    overlay.className = 'info-overlay';
    
    // Create HTML content based on available choice properties
    let content = `<h4>${choice.text}</h4>`;
    
    // Add each available property to the overlay
    const properties = [
        { key: 'mode', label: 'Mode' },
        { key: 'details', label: 'Details' },
        { key: 'genre', label: 'Genre' },
        { key: 'type', label: 'Type' },
        { key: 'cost', label: 'Cost' },
        { key: 'console', label: 'Console' },
        { key: 'time to beat', label: 'Time to Beat' },
        { key: 'owned', label: 'Owned', transform: val => val ? 'Yes' : 'No' },
        { key: 'completed', label: 'Completed', transform: val => val ? 'Yes' : 'No' },
        { key: 'after spin', label: 'After Spin' }
    ];

    content += properties
        .filter(prop => choice[prop.key] !== undefined && choice[prop.key] !== '')
        .map(prop => {
            const value = prop.transform ? prop.transform(choice[prop.key]) : choice[prop.key];
            return `<p><strong>${prop.label}:</strong> ${value}</p>`;
        })
        .join('');

    overlay.innerHTML = content;
    return overlay;
}

function populateStaticRewards() {
    staticRewards.innerHTML = `<h3 style="text-align: center;">Available Rewards: ${currentPool}</h3><hr><ul>` +
        choices.filter(choice => choice.copies > 0)
            .map(choice => `<li class="reward-item" data-text="${choice.text}">
                ${choice.text}
                <br>
                <span style="font-size: 0.6em;">${'🟢'.repeat(choice.copies)}</span>
            </li>`)
            .join("") +
        "</ul>" +
        `<select id="filter-dropdown">
            <option value="active">Active</option>
            <option value="selectable">Selectable</option>
            <option value="wants">Wants</option>
            <option value="modifiers">Modifiers</option>
            <option value="helpers">Helpers</option>
            <option value="hazzards">Hazzards</option>
        </select>`;
    staticRewards.style.fontSize = ".6em";

    document.getElementById("filter-dropdown").addEventListener("change", filterChoices);

    // Add click handler for reward items
    staticRewards.querySelectorAll('.reward-item').forEach(item => {
        item.addEventListener('click', () => {
            const choice = choices.find(c => c.text === item.dataset.text);
            if (choice) {
                showRewardInfo(choice);
            }
        });
    });
}

function showRewardInfo(choice) {
    const infoDisplay = document.getElementById('reward-info-display');
    const infoContent = document.getElementById('reward-info-content');
    
    // Create title, making it a link if a link property exists
    let titleContent = choice.text;
    if (choice.link && choice.link.trim() !== '') {
        titleContent = `<a href="${choice.link}" target="_blank" style="color: #4CAF50; text-decoration: none; hover: underline;">${choice.text}</a>`;
    }
    let content = `<h4>${titleContent}</h4>`;
    
    // Rest of properties display remains the same
    const properties = [
        { key: 'mode', label: 'Mode' },
        { key: 'details', label: 'Details' },
        { key: 'genre', label: 'Genre' },
        { key: 'type', label: 'Type' },
        { key: 'cost', label: 'Cost' },
        { key: 'console', label: 'Console' },
        { key: 'time to beat', label: 'Time to Beat' },
        { key: 'owned', label: 'Owned', transform: val => val ? 'Yes' : 'No' },
        { key: 'completed', label: 'Completed', transform: val => val ? 'Yes' : 'No' },
        { key: 'after spin', label: 'After Spin' }
    ];

    content += properties
        .filter(prop => choice[prop.key] !== undefined && choice[prop.key] !== '')
        .map(prop => {
            const value = prop.transform ? prop.transform(choice[prop.key]) : choice[prop.key];
            return `<p><strong>${prop.label}:</strong> ${value}</p>`;
        })
        .join('');

    infoContent.innerHTML = content;
    infoDisplay.classList.remove('hidden');
}

// Add close button handler
document.getElementById('close-info').addEventListener('click', () => {
    document.getElementById('reward-info-display').classList.add('hidden');
});

function filterChoices() {
    resetCycle();
    const filterValue = document.getElementById("filter-dropdown").value;
    let filteredChoices = choices;

    switch (filterValue) {
        case "active":
            filteredChoices = choices.filter(choice => 
                choice.copies > 0 && choice.text.trim() !== '');
            break;
        case "selectable":
            filteredChoices = choices.filter(choice => 
                choice.copies === 0 && choice.text.trim() !== '');
            break;
        case "wants":
            filteredChoices = choices.filter(choice => 
                choice.genre?.toLowerCase() === 'want');
            break;
        case "modifiers":
            filteredChoices = choices.filter(choice => 
                choice.genre?.toLowerCase() === 'week modifiers');
            break;
        case "helpers":
            filteredChoices = choices.filter(choice => 
                choice.genre?.toLowerCase() === 'helper');
            break;
        case "hazzards":
            filteredChoices = choices.filter(choice => 
                choice.genre?.toLowerCase() === 'hazzard');
            break;
        default:
            filteredChoices = choices.filter(choice => choice.copies > 0);
    }

    staticRewards.querySelector("ul").innerHTML = filteredChoices
        .map(choice => `<li class="reward-item" data-text="${choice.text}">
            ${choice.text}
            <br>
            <span style="font-size: 0.6em;">${'🟢'.repeat(choice.copies)}</span>
        </li>`)
        .join("");
}

function selectWeightedChoice(choices) {
  // Create array of choices where each copy is a separate instance
  const weightedArray = choices.reduce((acc, choice) => {
    const copies = Math.max(0, choice.copies || 0);
    // Add this choice to array once for each copy
    for (let i = 0; i < copies; i++) {
      acc.push(choice);
    }
    return acc;
  }, []);

  if (weightedArray.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * weightedArray.length);
  return weightedArray[randomIndex];
}

function updateActiveReward(currentChoice) {
  const rewardItems = staticRewards.querySelectorAll(".reward-item");
  rewardItems.forEach(item => item.classList.remove("active"));
  const activeItem = staticRewards.querySelector(`.reward-item[data-text="${currentChoice.text}"]`);
  if (activeItem) activeItem.classList.add("active");
}

function updateVibrationIntensity() {
    if (!spinning) return;
    
    const timeSinceStart = Date.now() - rampStartTime;
    const baseIntensity = 8.8; // Starting duration in seconds
    const minIntensity = 0.05; // Fastest vibration duration
    
    // Create exponential decrease over time
    const timeRatio = Math.min(timeSinceStart / 30000, 1); // 30 seconds to reach max intensity
    const newDuration = baseIntensity * Math.pow(0.1, timeRatio);
    
    // Clamp the duration between min and base intensity
    const clampedDuration = Math.max(minIntensity, Math.min(baseIntensity, newDuration));
    document.body.style.animationDuration = `${clampedDuration}s`;
}

function startVibration() {
    rampStartTime = Date.now();
    setTimeout(() => {
        document.body.classList.add('vibrating');
        document.body.style.animationDuration = '8.8s'; // Start very slow
    }, 2000); // 5 second delay before vibration starts
}

function stopVibration() {
    document.body.classList.remove('vibrating');
    document.body.style.animationDuration = '';
}

function showFlashEffect() {
    document.body.classList.add('flashing');
    setTimeout(() => {
        document.body.classList.remove('flashing');
    }, 7000); // Total flash effect duration (3s intense + 4s fade)
}

function getRandomImage(choice) {
    if (Array.isArray(choice.image)) {
        const randomIndex = Math.floor(Math.random() * choice.image.length);
        return choice.image[randomIndex];
    }
    return choice.image;
}

function spin(cycleId) {
    if (cycleId !== currentCycleId) return;

    const filterValue = document.getElementById("filter-dropdown").value;
    let filteredChoices = choices;

    switch (filterValue) {
        case "active":
            filteredChoices = choices.filter(choice => 
                choice.copies > 0 && choice.text?.trim() !== '');
            break;
        case "selectable":
            filteredChoices = choices.filter(choice => 
                choice.copies === 0 && choice.text?.trim() !== '');
            break;
        case "wants":
            filteredChoices = choices.filter(choice => 
                choice.genre?.toLowerCase() === 'want');
            break;
        case "modifiers":
            filteredChoices = choices.filter(choice => 
                choice.genre?.toLowerCase() === 'week modifiers');
            break;
        case "helpers":
            filteredChoices = choices.filter(choice => 
                choice.genre?.toLowerCase() === 'helper');
            break;
        case "hazzards":
            filteredChoices = choices.filter(choice => 
                choice.genre?.toLowerCase() === 'hazzard');
            break;
        default:
            filteredChoices = choices.filter(choice.copies > 0);
    }

    // Check if we have any valid choices
    const hasValidChoices = filteredChoices.some(choice => choice.copies > 0);
    if (!hasValidChoices) {
        resetCycle();
        alert("No choices available in current filter!");
        return;
    }

    const choice = selectWeightedChoice(filteredChoices);
    if (!choice) {
        resetCycle();
        return;
    }

    choiceImage.style.display = "block";
    choiceImage.src = getRandomImage(choice); // Use getRandomImage instead of direct assignment
    updateActiveReward(choice);

    if (spinning) {
        playSound('cycle');
        delay = delay * 0.95;
        powerDownPlayed = false; // Reset flag when spinning
        updateVibrationIntensity();
        setTimeout(() => spin(cycleId), delay);
    } else if (stopInitiated) {
        if (Date.now() - rampStartTime < 5000) {
            if (!powerDownPlayed) {
                playSound('powerDown');
                powerDownPlayed = true;
                showFlashEffect();
                stopVibration();
            }
            delay = delay * 1.2;
            setTimeout(() => spin(cycleId), delay);
        } else {
            // Play genre-specific sound before showing popup
            if (choice.genre) {
                const genreSound = {
                    'hazzard': 'hazzard',
                    'helper': 'helper',
                    'week modifiers': 'weekMod',
                    'want': 'want'
                }[choice.genre.toLowerCase()];
                
                if (genreSound) {
                    playSound(genreSound);
                }
            }
            showOptionPopup(choice);
        }
    }
}

async function capturePopupScreenshot(element) {
    try {
        // Save original styles
        const originalStyles = {
            transform: element.style.transform,
            position: element.style.position,
            left: element.style.left,
            top: element.style.top
        };

        // Temporarily modify element for screenshot
        element.style.transform = 'none';
        element.style.position = 'fixed';
        element.style.left = '0';
        element.style.top = '0';

        const canvas = await html2canvas(element, {
            backgroundColor: null,
            scale: 2, // Increase quality
            logging: false,
            useCORS: true,
            allowTaint: true,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        });

        // Restore original styles
        element.style.transform = originalStyles.transform;
        element.style.position = originalStyles.position;
        element.style.left = originalStyles.left;
        element.style.top = originalStyles.top;

        canvas.toBlob(function(blob) {
            const item = new ClipboardItem({ "image/png": blob });
            navigator.clipboard.write([item]).then(() => {
                const toast = document.createElement('div');
                toast.textContent = 'Screenshot copied to clipboard!';
                toast.style.position = 'fixed';
                toast.style.bottom = '20px';
                toast.style.left = '50%';
                toast.style.transform = 'translateX(-50%)';
                toast.style.background = 'rgba(0, 255, 0, 0.8)';
                toast.style.color = 'white';
                toast.style.padding = '10px 20px';
                toast.style.borderRadius = '5px';
                toast.style.zIndex = '9999';
                
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2000);
            });
        });
    } catch (error) {
        console.error('Screenshot failed:', error);
    }
}

function showOptionPopup(choice) {
    playSound('popup');
    const popup = document.createElement("div");
    popup.id = "optionPopup";
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.maxWidth = "90vw";
    popup.style.maxHeight = "90vh";
    popup.style.width = "75%";
    popup.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    popup.style.padding = "20px";
    popup.style.border = "2px solid white";
    popup.style.borderRadius = "15px"; // Added rounded corners
    popup.style.zIndex = "2000";
    popup.style.boxSizing = "border-box";
    popup.style.overflow = "hidden"; // Prevent scrolling
    popup.style.cursor = "pointer"; // Indicate clickable
    
    popup.classList.add('glow-effect');
    popup.addEventListener('animationend', () => {
        popup.classList.remove('glow-effect');
    });
    
    const img = document.createElement("img");
    img.src = getRandomImage(choice); // Use getRandomImage for popup as well
    img.style.width = "100%";
    img.style.maxHeight = "60vh"; // Ensure image doesn't overflow
    img.style.objectFit = "contain"; // Keep aspect ratio
    
    const textDiv = document.createElement("div");
    textDiv.textContent = choice.text;
    textDiv.style.color = "white";
    textDiv.style.textAlign = "center";
    textDiv.style.marginTop = "10px";
    
    const extraDiv = document.createElement("div");
    extraDiv.id = "extraText";
    extraDiv.style.color = "white";
    extraDiv.style.textAlign = "center";
    extraDiv.style.marginTop = "10px";
    extraDiv.textContent = "";
    
    popup.appendChild(img);
    popup.appendChild(textDiv);
    popup.appendChild(extraDiv);
    
    let infoTimeout;
    const overlay = createInfoOverlay(choice);
    popup.appendChild(overlay);

    // Show info with delay for popup
    const showInfo = () => {
        infoTimeout = setTimeout(() => {
            overlay.style.display = 'block';
            setTimeout(() => overlay.classList.add('visible'), 10);
        }, 2000);
    };

    const hideInfo = () => {
        clearTimeout(infoTimeout);
        overlay.classList.remove('visible');
        setTimeout(() => overlay.style.display = 'none', 300);
    };

    popup.addEventListener('mouseenter', showInfo);
    popup.addEventListener('mouseleave', hideInfo);
    popup.addEventListener('touchstart', showInfo);
    popup.addEventListener('touchend', hideInfo);

    // Add click handler for screenshot
    popup.addEventListener('click', () => capturePopupScreenshot(popup));
    
    document.body.appendChild(popup);
    
    function handleOutsideClick(event) {
        if (!popup.contains(event.target)) {
            popup.remove();
            document.removeEventListener("click", handleOutsideClick);
        }
    }
    
    setTimeout(() => {
        document.addEventListener("click", handleOutsideClick);
    }, 0);
}

function resetCycle() {
  spinning = false;
  stopInitiated = false;
  delay = 1000;
  rampStartTime = null;
  choiceImage.src = "";
  choiceImage.style.display = "none";
  choiceText.textContent = "";
  
  const rewardItems = staticRewards.querySelectorAll(".reward-item");
  rewardItems.forEach(item => item.classList.remove("active"));
  
  const existingPopup = document.getElementById("optionPopup");
  if (existingPopup) {
    existingPopup.remove();
  }
  powerDownPlayed = false; // Reset the flag when resetting cycle
  stopVibration();
}

startButton.addEventListener("click", () => {
  playClickSounds();
  playSound('spinUp'); // Play spin up sound when starting
  resetCycle();
  spinning = true;
  startVibration();
  const cycleId = currentCycleId;
  spin(cycleId);
});

function stopAllAudio() {
    Object.values(AUDIO).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
}

stopButton.addEventListener("click", () => {
    const wasSpinning = spinning; // Store spinning state
    if (spinning) {
        spinning = false;
        stopInitiated = true;
        rampStartTime = Date.now();
    } else {
        resetCycle();
    }
    playClickSounds(); // Play click sounds after state changes but before stopping other audio
    if (wasSpinning) {
        // Only stop non-click audio if we were spinning
        Object.entries(AUDIO).forEach(([key, audio]) => {
            if (!['mouseClick', 'click'].includes(key)) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }
});

lootButton.addEventListener("click", async () => {
  stopAllAudio();
  playClickSounds();
  highlightActiveButton(lootButton);
  await loadChoices('loot');
  localStorage.setItem('currentPool', 'loot'); // Save current selection
});

pvpButton.addEventListener("click", async () => {
  stopAllAudio();
  playClickSounds();
  highlightActiveButton(pvpButton);
  await loadChoices('pvp');
  localStorage.setItem('currentPool', 'pvp'); // Save current selection
});

coopButton.addEventListener("click", async () => {
  stopAllAudio();
  playClickSounds();
  highlightActiveButton(coopButton);
  await loadChoices('coop');
  localStorage.setItem('currentPool', 'coop'); // Save current selection
});

function highlightActiveButton(activeButton) {
  [lootButton, pvpButton, coopButton].forEach(button => {
    button.classList.remove('active');
  });
  activeButton.classList.add('active');
}

function setRandomBackground() {
  const backgrounds = [
    "../assets/img/backgrounds/CERN_detailed.jpeg",         // Updated filename
    "../assets/img/backgrounds/Hadron_Collider_inside.jpg", // Updated filename
    "../assets/img/backgrounds/Hadron_Collider_Pipe.jpg",   // Updated filename
    "../assets/img/backgrounds/classicBlackHole.jpg",
    "../assets/img/backgrounds/mixingGalaxy.jpg"
  ];
  const randomIndex = Math.floor(Math.random() * backgrounds.length);
  const selectedBg = backgrounds[randomIndex];
  console.log('Loading background:', selectedBg); // Add logging to debug
  document.body.style.backgroundImage = `url(${selectedBg})`;
}

setRandomBackground();

document.addEventListener('DOMContentLoaded', () => {
  const savedPool = localStorage.getItem('currentPool') || 'loot';
  loadChoices(savedPool);
  highlightActiveButton(document.getElementById(`${savedPool}-button`));
});

function toggleSidebar() {
  const staticRewards = document.getElementById("static-rewards");
  staticRewards.classList.toggle("visible");
}

document.addEventListener('DOMContentLoaded', function() {
  if (window.innerWidth <= 600) {
    const staticRewards = document.getElementById("static-rewards");
    let touchstartX = 0;
    let touchendX = 0;

    function handleGesture() {
      if (touchendX < touchstartX) {
        staticRewards.classList.add('visible');
      }
      if (touchendX > touchstartX) {
        staticRewards.classList.remove('visible');
      }
    }

    document.addEventListener('touchstart', function(e) {
      touchstartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', function(e) {
      touchendX = e.changedTouches[0].screenX;
      handleGesture();
    });
  }
});

// Add navbar hide on scroll
let lastScrollPosition = window.pageYOffset;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    const currentScrollPosition = window.pageYOffset;
    if (lastScrollPosition < currentScrollPosition) {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }
    lastScrollPosition = currentScrollPosition;
});