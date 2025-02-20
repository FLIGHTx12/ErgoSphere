let choices = [];

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
  fetch(`../data/${pool}.json`)
    .then(response => response.json())
    .then(data => {
      choices = data;
      populateStaticRewards();
    })
    .catch(error => console.error('Error loading choices:', error));
}

function populateStaticRewards() {
  staticRewards.innerHTML = "<h3>Available Rewards</h3><ul>" +
    choices.map(choice => `<li>${choice.text}</li>`).join("") +
    "</ul>";
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

function spin() {
  const choice = selectWeightedChoice(choices);
  choiceImage.style.display = "block";
  choiceImage.src = choice.image;
  
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

// Load default pool on page load
loadChoices('loot');