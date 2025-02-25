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
    mouseClick: new Audio('../assets/audio/mouse-click-normal.mp3')
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

function populateStaticRewards() {
  staticRewards.innerHTML = `<h3 style="text-align: center;">Available Rewards: ${currentPool}</h3><hr><ul>` +
    choices.filter(choice => choice.copies > 0)
      .map(choice => `<li class="reward-item" data-text="${choice.text}">${choice.text} ${'🟢'.repeat(choice.copies)}</li>`)
      .join("") +
    "</ul>" +
    `<select id="filter-dropdown">
      <option value="selected">Selected</option>
      <option value="all">All</option>
      <option value="owned">Owned</option>
      <option value="not-owned">Not Owned</option>
      <option value="completed">Completed</option>
      <option value="not-completed">Not Completed</option>
    </select>`;
  staticRewards.style.fontSize = ".6em"; // Decrease font size by half

  document.getElementById("filter-dropdown").addEventListener("change", filterChoices);

  // Add click sounds to static reward items
  staticRewards.querySelectorAll('.reward-item').forEach(item => {
    item.addEventListener('click', () => playClickSounds());
  });
}

function filterChoices() {
  resetCycle();
  const filterValue = document.getElementById("filter-dropdown").value;
  let filteredChoices = choices;

  switch (filterValue) {
    case "owned":
      filteredChoices = choices.filter(choice => choice.owned);
      break;
    case "not-owned":
      filteredChoices = choices.filter(choice => !choice.owned);
      break;
    case "completed":
      filteredChoices = choices.filter(choice => choice.completed);
      break;
    case "not-completed":
      filteredChoices = choices.filter(choice => !choice.completed);
      break;
    case "all":
      filteredChoices = choices;
      break;
    default:
      filteredChoices = choices.filter(choice => choice.copies > 0);
  }

  staticRewards.querySelector("ul").innerHTML = filteredChoices.map(choice => `<li>${choice.text} ${'🟢'.repeat(choice.copies)}</li>`).join("");
}

function selectWeightedChoice(choices) {
  const weightedArray = [];
  choices.forEach(choice => {
    const count = choice.copies || 1;
    for (let i = 0; i < count; i++) {
      weightedArray.push(choice);
    }
  });
  const randomIndex = Math.floor(Math.random() * weightedArray.length);
  return weightedArray[randomIndex];
}

function updateActiveReward(currentChoice) {
  const rewardItems = staticRewards.querySelectorAll(".reward-item");
  rewardItems.forEach(item => item.classList.remove("active"));
  const activeItem = staticRewards.querySelector(`.reward-item[data-text="${currentChoice.text}"]`);
  if (activeItem) activeItem.classList.add("active");
}

function spin(cycleId) {
  if (cycleId !== currentCycleId) return;

  const filterValue = document.getElementById("filter-dropdown").value;
  let filteredChoices = choices;

  switch (filterValue) {
    case "owned":
      filteredChoices = choices.filter(choice => choice.owned);
      break;
    case "not-owned":
      filteredChoices = choices.filter(choice => !choice.owned);
      break;
    case "completed":
      filteredChoices = choices.filter(choice => choice.completed);
      break;
    case "not-completed":
      filteredChoices = choices.filter(choice => !choice.completed);
      break;
    case "all":
      filteredChoices = choices;
      break;
    default:
      filteredChoices = choices.filter(choice => choice.copies > 0);
  }

  if (filteredChoices.length === 0) {
    resetCycle();
    alert("No choices available in current filter!");
    return;
  }

  const choice = selectWeightedChoice(filteredChoices);
  choiceImage.style.display = "block";
  choiceImage.src = choice.image;
  updateActiveReward(choice);
  
  if (spinning) {
    playSound('cycle');
    delay = delay * 0.95;
    powerDownPlayed = false; // Reset flag when spinning
    setTimeout(() => spin(cycleId), delay);
  } else if (stopInitiated) {
    if (Date.now() - rampStartTime < 5000) {
      if (!powerDownPlayed) {
        playSound('powerDown');
        powerDownPlayed = true;
      }
      delay = delay * 1.2;
      setTimeout(() => spin(cycleId), delay);
    } else {
      showOptionPopup(choice);
    }
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
  popup.style.width = "75%";
  popup.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
  popup.style.padding = "20px";
  popup.style.border = "2px solid white";
  popup.style.zIndex = "2000";
  
  const img = document.createElement("img");
  img.src = choice.image;
  img.style.width = "100%";
  img.style.objectFit = "cover";
  
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
}

startButton.addEventListener("click", () => {
  playClickSounds();
  playSound('spinUp'); // Play spin up sound when starting
  resetCycle();
  spinning = true;
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
    playClickSounds();
    stopAllAudio(); // Stop all audio when stop button is clicked
    if (spinning) {
        spinning = false;
        stopInitiated = true;
        rampStartTime = Date.now();
    } else {
        resetCycle();
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
    "../assets/img/backgrounds/CERN detailed.jpeg",
    "../assets/img/backgrounds/Hadron Collider inside.jpg",
    "../assets/img/backgrounds/Hadron Collider Pipe.jpg",
    "../assets/img/backgrounds/classicBlackHole.jpg",
    "../assets/img/backgrounds/mixingGalaxy.jpg"
  ];
  const randomIndex = Math.floor(Math.random() * backgrounds.length);
  document.body.style.backgroundImage = `url(${backgrounds[randomIndex]})`;
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