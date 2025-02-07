document.addEventListener("DOMContentLoaded", () => {
    const monsters = [
      {
        name: "Forbearer-Ramis",
        attackType: "",
        health: 300,
        hitNumbers: [15, 6, 5, 19, 4],
        imageSrc: "https://i.ibb.co/JWj2G6mp/Forbearer-Ramis-Ergo-Villian.jpg",
        defeatedImageSrc:
          "https://i.ibb.co/JWj2G6mp/Forbearer-Ramis-Ergo-Villian.jpg",
      },
      {
        name: "PURSCERx17",
        attackType: "C",
        health: 400,
        hitNumbers: [16, 1, 8, 12, 5],
        imageSrc: "https://i.ibb.co/mFDZz1p3/PURSCERx17-Ergo-Villian.jpg",
        defeatedImageSrc: "https://i.ibb.co/mFDZz1p3/PURSCERx17-Ergo-Villian.jpg",
      },
      {
        name: "Aphen Neel",
        attackType: "",
        health: 200,
        hitNumbers: [16, 7, 19, 15, 14],
        imageSrc: "https://i.ibb.co/rGgXk56y/Aphen-Neel-Ergo-Villian.jpg",
        defeatedImageSrc: "https://i.ibb.co/rGgXk56y/Aphen-Neel-Ergo-Villian.jpg",
      },
      {
        name: "Curve",
        attackType: "",
        health: 150,
        hitNumbers: [19, 10, 12, 1, 2],
        imageSrc: "https://i.ibb.co/6JB8WQ2g/Curve-Ergo-Villian.jpg",
        defeatedImageSrc: "https://i.ibb.co/6JB8WQ2g/Curve-Ergo-Villian.jpg",
      },
      {
        name: "Dulguun Bolor",
        attackType: "",
        health: 710,
        hitNumbers: [2, 11, 19, 13, 20],
        imageSrc: "https://i.ibb.co/j9PBJZdy/Dulguun-Bolor-Ergo-Villian.jpg",
        defeatedImageSrc:
          "https://i.ibb.co/j9PBJZdy/Dulguun-Bolor-Ergo-Villian.jpg",
      },
      {
        name: "Dulguun Bolor",
        attackType: "",
        health: 400,
        hitNumbers: [11, 14, 4, 1, 12],
        imageSrc: "https://i.ibb.co/fVN7Xhdh/Bennu-Ergo-Villian.jpg",
        defeatedImageSrc: "https://i.ibb.co/fVN7Xhdh/Bennu-Ergo-Villian.jpg",
      },
      {
        name: "Forbearer Tren",
        attackType: "",
        health: 250,
        hitNumbers: [6, 8, 3, 12, 1],
        imageSrc: "https://i.ibb.co/W42ZGbd2/Forbearer-Tren-Ergo-Villian.jpg",
        defeatedImageSrc:
          "https://i.ibb.co/W42ZGbd2/Forbearer-Tren-Ergo-Villian.jpg",
      },
      {
        name: "Tash-Nadia",
        attackType: "",
        health: 800,
        hitNumbers: [8, 5, 11, 6, 13],
        imageSrc: "https://i.ibb.co/FLzybjYd/Tash-Nadia-Ergo-Villian.jpg",
        defeatedImageSrc: "https://i.ibb.co/FLzybjYd/Tash-Nadia-Ergo-Villian.jpg",
      },
    ];
  
    const gameContainer = document.querySelector(".game-container");
    const monsterButtonsContainer = document.getElementById("monsterButtons");
    let currentPlayer = 1;
  
    if (!document.getElementById("chooseOpponentBtn")) {
      const chooseOpponentBtn = document.createElement("button");
      chooseOpponentBtn.id = "chooseOpponentBtn";
      chooseOpponentBtn.textContent = "Choose Opponent";
      monsterButtonsContainer.appendChild(chooseOpponentBtn);
  
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
  
        const container1 = document.createElement("div");
        container1.id = "attackInputs1";
        const container2 = document.createElement("div");
        container2.id = "attackInputs2";
        container2.style.display = "none"; // initially hide FLIGHTx12!'s inputs
  
        const addAttackButton = document.createElement("button");
        addAttackButton.id = "addAttackButton";
        addAttackButton.textContent = "Add Attack";
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
        monsterContainer.appendChild(addAttackButton);
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
  
        attackButton.addEventListener("click", () => {
          const currentContainer = currentPlayer === 1 ? container1 : container2;
          let totalDamage = 0;
          let hitCount = 0;
  
          for (let i = 0; i < currentContainer.children.length; i++) {
            const input = currentContainer.children[i];
            const damage = parseInt(input.value);
            if (!isNaN(damage)) {
              if (!monster.hitNumbers.includes(damage)) {
                totalDamage += damage;
              } else {
                hitCount++;
              }
            }
          }
  
          monsterLife -= totalDamage;
          monsterLife = Math.max(0, monsterLife);
          lifeBarGreen.style.width = (monsterLife / monster.health) * 100 + "%";
          lifeBarText.textContent = monsterLife;
  
          const attackColor = currentPlayer === 1 ? "purple" : "green";
  
          if (monsterLife === 0) {
            alert(
              `${currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!"} defeated the ${monster.name}!`,
            );
            image.src = monster.defeatedImageSrc;
          }
  
          historyContainer.innerHTML += `<p style="color:${attackColor};">${currentPlayer === 1 ? "Jaybers8" : "FLIGHTx12!"} attacks for a cumulative total of ${totalDamage} damage.</p>`;
          if (hitCount > 0) {
            historyContainer.innerHTML += `<p style="color:red;">Boss hits player ${hitCount} times.</p>`;
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
      attackButton.style.color = "purple";
    } else {
      attackButton.style.backgroundColor = "green";
      attackButton.style.color = "green";
    }
  }
  