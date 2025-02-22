let choices = [];
let currentPool = 'LOOT';

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

function loadChoices(pool) {
  currentPool = pool.toUpperCase();
  fetch(`../data/${pool}.json`)
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
}

function filterChoices() {
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

function spin() {
  const selectedChoices = choices.filter(choice => choice.copies > 0);
  const choice = selectWeightedChoice(selectedChoices);
  choiceImage.style.display = "block";
  choiceImage.src = choice.image;
  updateActiveReward(choice); // mark current cycling item in available rewards
  
  if (spinning) {
    delay = delay * 0.95;
    setTimeout(spin, delay);
  } else if (stopInitiated) {
    if (Date.now() - rampStartTime < 5000) {
      delay = delay * 1.2;
      setTimeout(spin, delay);
    } else {
      showOptionPopup(choice);
    }
  }
}

function showOptionPopup(choice) {
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
}

startButton.addEventListener("click", () => {
  resetCycle();
  spinning = true;
  spin();
});

stopButton.addEventListener("click", () => {
  if (spinning) {
    spinning = false;
    stopInitiated = true;
    rampStartTime = Date.now();
  } else if (!spinning && stopInitiated) {
    resetCycle();
  }
});

lootButton.addEventListener("click", () => loadChoices('loot'));
pvpButton.addEventListener("click", () => loadChoices('pvp'));
coopButton.addEventListener("click", () => loadChoices('coop'));

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

// Call the function to set a random background on page load
setRandomBackground();

// Load default pool on page load
loadChoices('loot');

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