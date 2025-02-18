const choices = [
  {
    image: "https://i.ibb.co/j92kZQgd/Human-Fall-Flat.jpg",
    text: "Reward 1",
    copies: 1  // Default: one copy
  },
  {
    image: "https://i.ibb.co/cX3Mn0vG/WarFrame.jpg",
    text: "Reward 2",
    copies: 1  // 2 copies: twice the chance
  },
  {
    image: "https://i.ibb.co/0RFyXyZY/Valheim.png",
    text: "Reward 3",
    copies: 1
  },
  {
    image: "https://static.vecteezy.com/system/resources/thumbnails/023/122/996/small/skull-with-roses-human-skull-in-beautiful-flowers-halloween-images-day-of-the-dead-generative-ai-photo.jpg",
    text: "Reward 4",
    copies: 3  // 3 copies: three times the chance
  },
  {
    image: "https://i.ibb.co/20mPhJ38/The-ASCENT.jpg",
    text: "Reward 5",
    copies: 1
  },
  {
    image: "https://i.ibb.co/prPP8873/TMNT-Shredders-Revenge.png",
    text: "Reward 6",
    copies: 1
  },
  // ... more choices
];

const choiceDisplay = document.getElementById("choice-display");
const choiceImage = document.getElementById("choice-image");
const choiceText = document.getElementById("choice-text");
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const rewardDisplay = document.getElementById("reward-display");
// New static rewards container
const staticRewards = document.getElementById("static-rewards");
const choiceContent = document.getElementById("choice-content");

/* Populate static rewards once on load */
function populateStaticRewards() {
  staticRewards.innerHTML = "<h3>Available Rewards</h3><ul>" +
    choices.map(choice => `<li>${choice.text}</li>`).join("") +
    "</ul>";
}
populateStaticRewards();

let spinning = false;
let delay = 1000; // starting delay (ms)
let stopInitiated = false;
let rampStartTime = null;

// New helper to select a weighted choice using "copies"
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
  
  // Restore image display and update source
  choiceImage.style.display = "block";
  choiceImage.src = choice.image;
  
  if (spinning) {
    delay = delay * 0.95; // progressively faster
    setTimeout(spin, delay);
  } else if (stopInitiated) {
    if (Date.now() - rampStartTime < 5000) {
      delay = delay * 1.2; // ramp down effect
      setTimeout(spin, delay);
    } else {
      // Ramp down complete: show pop-up with final choice details
      showOptionPopup(choice);
    }
  }
}

// New function: creates a pop-up displaying the landed option and an extra text area.
function showOptionPopup(choice) {
  const popup = document.createElement("div");
  popup.id = "optionPopup";
  // Set the pop-up to be 75% of the viewport width and always centered
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.width = "75%";
  popup.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
  popup.style.padding = "20px";
  popup.style.border = "2px solid white";
  popup.style.zIndex = "2000";
  
  // Create an image element
  const img = document.createElement("img");
  img.src = choice.image;
  img.style.width = "100%";
  img.style.objectFit = "cover";
  
  // Create a div for the option text
  const textDiv = document.createElement("div");
  textDiv.textContent = choice.text;
  textDiv.style.color = "white";
  textDiv.style.textAlign = "center";
  textDiv.style.marginTop = "10px";
  
  // Create an extra div under it for additional text
  const extraDiv = document.createElement("div");
  extraDiv.id = "extraText";
  extraDiv.style.color = "white";
  extraDiv.style.textAlign = "center";
  extraDiv.style.marginTop = "10px";
  extraDiv.textContent = ""; // initially empty
  
  popup.appendChild(img);
  popup.appendChild(textDiv);
  popup.appendChild(extraDiv);
  
  // Append the pop-up to the document body
  document.body.appendChild(popup);
  
  // Add event listener to close popup when clicking outside it
  function handleOutsideClick(event) {
    if (!popup.contains(event.target)) {
      popup.remove();
      document.removeEventListener("click", handleOutsideClick);
    }
  }
  // Use setTimeout to avoid immediate removal upon popup creation
  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
  }, 0);
}

function resetCycle() {
  spinning = false;
  stopInitiated = false;
  delay = 1000;
  rampStartTime = null;
  // Clear and remove any image element from view
  choiceImage.src = "";
  choiceImage.style.display = "none";
  choiceText.textContent = "";
}

startButton.addEventListener("click", () => {
  // Restart cycle no matter what by resetting first then starting a new spin.
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
    // If already stopped, refresh to the beginning.
    resetCycle();
  }
});