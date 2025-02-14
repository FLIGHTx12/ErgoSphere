document.addEventListener("DOMContentLoaded", () => {
  // Removed inline monsters array; now using global window.monsters
  const monsters = window.monsters;

  const gameContainer = document.querySelector(".game-container");
  const monsterButtonsContainer = document.getElementById("monsterButtons");
  const navbar = document.getElementById("navbar");
  let currentPlayer = 1;

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
      gameContainer.appendChild(monsterContainer);

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

      const historyContainer = document.createElement("div");
      historyContainer.id = "historyContainer";
      
      // New info container for monster details
      const infoContainer = document.createElement("div");
      infoContainer.id = "infoContainer";
      infoContainer.innerHTML = `<h3>
<span style="color:deepskyblue; font-weight:bold;">Name:</span>
<span style="color:white;">${monster.name}</span>
</h3>
<p>
<span style="color:deepskyblue; font-weight:bold;">Attack Type:</span>
<span style="color:white;">${monster.attackType}</span>
</p>
<p>
<span style="color:deepskyblue; font-weight:bold;">Health:</span>
<span style="color:white;">${monster.health}</span>
</p>
<p>
<span style="color:deepskyblue; font-weight:bold;">Hit Numbers:</span>
<span style="color:white;">${monster.hitNumbers.join(', ')}</span>
</p>
<p>
<span style="color:deepskyblue; font-weight:bold;">Rewards:</span>
<span style="color:white;">${monster.Rewards}</span>
</p>
<p>
<span style="color:deepskyblue; font-weight:bold;">Punishment:</span>
<span style="color:white;">${monster.Punishment}</span>
</p>
<p>
<span style="color:deepskyblue; font-weight:bold;">About:</span>
<span style="color:white;">${monster.About}</span>
</p>`;
// Change position to absolute so the monster container remains centered at the top
      infoContainer.style.position = "absolute";
      infoContainer.style.top = "50px";
      infoContainer.style.left = "-320px";  // shift further left from the monster container
      // Remove flex styling to prevent interfering with parent centering
      infoContainer.style.width = "300px";
      infoContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      infoContainer.style.border = "1px solid white";
      infoContainer.style.padding = "10px";
      infoContainer.style.overflowY = "auto";
      infoContainer.style.maxHeight = "400px";
      
      // Append new info container to monsterContainer
      monsterContainer.appendChild(infoContainer);

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
      attackButton.textContent = `Jaybers8 Attack!`;

      attackButtonContainer.appendChild(attackButton); // Add the button to the container
      monsterImage.appendChild(attackButtonContainer); // Add the container to the monsterImage
      monsterContainer.appendChild(historyContainer);

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
      monsterContainer.appendChild(historyContainer);

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

      attackButton.addEventListener("click", () => {
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

        // Replace previous shake logic with:
        if (totalDamage >= 5) {
          // Calculate shake steps: every 5 damage adds 1px shake, capped at 40px
          const shakeSteps = Math.min(Math.floor(totalDamage / 5), 40);
          const shakeAmplitude = shakeSteps + "px";
          // Set CSS variable on the monster container and add shake class
          monsterContainer.style.setProperty("--shake-amount", shakeAmplitude);
          monsterContainer.classList.add("shake");
          setTimeout(() => {
            monsterContainer.classList.remove("shake");
          }, 500);
        }

        const playerName = currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!";

        if (monsterLife === 0) {
          // Announce defeat in historyContainer with large, bold, bright red font
          historyContainer.innerHTML += `<p style="font-size:32px; font-weight:bold; color:#FF0000;">${playerName} defeated the ${monster.name}!</p>`;
          image.src = monster.defeatedImageSrc;
        }

        // Use the monster-specific dialogue methods:
        const damageDialogue = monster.getDamageDialogue(totalDamage, playerName);
        const hitDialogue = hitCount > 0 ? monster.getHitDialogue(hitCount, playerName) : "";

        historyContainer.innerHTML += `<p style="color:${playerName==="Jaybers8"?"purple":"green"};">${playerName} attacks for a cumulative total of ${totalDamage} damage.</p>`;
        if (damageDialogue) {
          historyContainer.innerHTML += `<p style="color:white; font-style: italic;">${damageDialogue}</p>`;
        }
        if (hitCount > 0) {
          historyContainer.innerHTML += `<p style="color:red;">${monster.name} hits ${playerName} ${hitCount} times.</p>`;
          if (hitDialogue) {
            historyContainer.innerHTML += `<p style="color:white; font-style: italic;">${hitDialogue}</p>`;
          }
        }
        historyContainer.innerHTML += `<hr>`;
        historyContainer.scrollTop = historyContainer.scrollHeight;

        for (let i = 1; i < currentContainer.children.length; i++) {
          currentContainer.children[i].value = "";
        }
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
      monsterDropdown.style.display = "block";
    });

    monsterDropdown.addEventListener("change", () => {
      const selectedMonsterIndex = monsterDropdown.value;

      const monsterContainers = document.querySelectorAll(".monster-container");
      monsterContainers.forEach(
        (container) => (container.style.display = "none"),
      );

      if (selectedMonsterIndex !== "") {
        monsterContainers[selectedMonsterIndex].style.display = "block";
        monsterDropdown.style.display = "none";
      }
    });
  }
});

function toggleButtonColors(player) {
  const attackButton = document.getElementById("attackButton");

  if (player === 1) {
    attackButton.style.backgroundColor = "purple";
    attackButton.style.color = "white";
  } else {
    attackButton.style.backgroundColor = "green";
    attackButton.style.color = "white";
  }
}
