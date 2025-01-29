// BossFight.js

// Monster data
const monsters = [
    {
      name: "TAKEN KNIGHT",
      health: 300,
      hitNumbers: [15, 6, 5, 19, 4],
      imageSrc: "https://i.ibb.co/Bykb0sv/Taken-Knight-strength.jpg" ,
      defeatedImageSrc: "taken-knight-defeated.jpg"
    },
    {
      name: "TAKEN CABAL",
      health: 400,
      hitNumbers: [16, 1, 8, 12, 5],
      imageSrc: "taken-cabal.jpg",
      defeatedImageSrc: "taken-cabal-defeated.jpg"
    },
    {
      name: "TAKEN WITCH",
      health: 200,
      hitNumbers: [16, 7, 19, 15, 14],
      imageSrc: "taken-witch.jpg",
      defeatedImageSrc: "taken-witch-defeated.jpg"
    },
    {
      name: "TAKEN PSION",
      health: 150,
      hitNumbers: [19, 10, 12, 1, 2],
      imageSrc: "taken-psion.jpg",
      defeatedImageSrc: "taken-psion-defeated.jpg"
    },
    {
      name: "BANISHED",
      health: 400,
      hitNumbers: [2, 11, 19, 13, 20],
      imageSrc: "banished.jpg",
      defeatedImageSrc: "banished-defeated.jpg"
    },
    {
      name: "ELITE",
      health: 200,
      hitNumbers: [11, 14, 4, 1, 12],
      imageSrc: "elite.jpg",
      defeatedImageSrc: "elite-defeated.jpg"
    },
    {
      name: "JACKEL",
      health: 100,
      hitNumbers: [6, 8, 3, 12, 1],
      imageSrc: "jackel.jpg",
      defeatedImageSrc: "jackel-defeated.jpg"
    },
    {
      name: "HUNTER",
      health: 400,
      hitNumbers: [8, 5, 11, 6, 13],
      imageSrc: "hunter.jpg",
      defeatedImageSrc: "hunter-defeated.jpg"
    }
  ];
  
  const gameContainer = document.querySelector('.game-container');
  const monsterButtonsContainer = document.getElementById('monsterButtons');
  
  monsters.forEach(monster => {
    // Create monster container
    const monsterContainer = document.createElement('div');
    monsterContainer.classList.add('monster-container');
    gameContainer.appendChild(monsterContainer);
  
    // Create elements for each monster
    const monsterName = document.createElement('h2');
    monsterName.textContent = monster.name;
    const monsterDiv = document.createElement('div');
    monsterDiv.id = 'monster';
    const lifeBar = document.createElement('div');
    lifeBar.id = 'lifeBar';
    const lifeBarGreen = document.createElement('div');
    lifeBarGreen.id = 'lifeBarGreen';
    const lifeBarText = document.createElement('div');
    lifeBarText.id = 'lifeBarText';
    lifeBarText.textContent = monster.health;
    const monsterImage = document.createElement('div');
    monsterImage.classList.add('monster-image');
    const image = document.createElement('img');
    image.src = monster.imageSrc;
    image.alt = monster.name; // Set alt text to monster name
    const hitCountDiv = document.createElement('div');
    hitCountDiv.id = 'hitCount';
    hitCountDiv.textContent = "Boss hits player 0 times";
    const flavorText = document.createElement('div');
    flavorText.classList.add('flavor-text');
    flavorText.textContent = "This is a placeholder for flavor text";
    const attackInputsContainer = document.createElement('div');
    attackInputsContainer.id = 'attackInputs';
    const addAttackButton = document.createElement('button');
    addAttackButton.id = 'addAttackButton';
    addAttackButton.textContent = "Add Attack";
    const attackButton = document.createElement('button');
    attackButton.id = 'attackButton';
    attackButton.textContent = "Attack!";
  
    // Append elements to the monster container
    monsterContainer.appendChild(monsterName);
    monsterContainer.appendChild(monsterDiv);
    monsterDiv.appendChild(lifeBar);
    lifeBar.appendChild(lifeBarGreen);
    monsterDiv.appendChild(lifeBarText);
    monsterContainer.appendChild(monsterImage);
    monsterImage.appendChild(image);
    monsterImage.appendChild(hitCountDiv);
    monsterContainer.appendChild(flavorText);
    monsterContainer.appendChild(attackInputsContainer);
    monsterContainer.appendChild(addAttackButton);
    monsterContainer.appendChild(attackButton);
  
    let monsterLife = monster.health;
    let hitCount = 0;
    let numAttacks = 1;
  
    // Create the initial attack damage input
    const initialInput = document.createElement('input');
    initialInput.type = 'number';
    initialInput.value = 0;
    initialInput.style.backgroundColor = 'red';
    attackInputsContainer.appendChild(initialInput);
  
    addAttackButton.addEventListener('click', () => {
      if (numAttacks < 11) {
        const input = document.createElement('input');
        input.type = 'number';
        input.value = 0;
        attackInputsContainer.appendChild(input);
        numAttacks++;
      }
    });
  
    attackButton.addEventListener('click', () => {
      let totalDamage = 0;
      // Calculate total damage from all inputs
      for (let i = 0; i < attackInputsContainer.children.length; i++) {
        const input = attackInputsContainer.children[i];
        const damage = parseInt(input.value);
        if (!isNaN(damage)) {
          totalDamage += damage;
        }
        // Check for hits
        if (monster.hitNumbers.includes(damage)) {
          hitCount++;
        }
      }
  
      monsterLife -= totalDamage;
      monsterLife = Math.max(0, monsterLife);
      lifeBarGreen.style.width = (monsterLife / monster.health) * 100 + '%';
  
      lifeBarText.textContent = monsterLife;
      hitCountDiv.textContent = `Boss hits player ${hitCount} times`;
  
      if (monsterLife === 0) {
        alert(`You defeated the ${monster.name}!`);
        image.src = monster.defeatedImageSrc; // Change image when defeated
      }
  
      // Reset input values
      for (let i = 0; i < attackInputsContainer.children.length; i++) {
        const input = attackInputsContainer.children[i];
        if (i !== 0) { // Skip the first (red) input
          input.value = 0;
        }
      }
    });
  
    // Create monster button
    const monsterButton = document.createElement('button');
    monsterButton.textContent = monster.name;
    monsterButton.addEventListener('click', () => {
      // Hide all monsters
      const monsterContainers = document.querySelectorAll('.monster-container');
      monsterContainers.forEach(container => container.style.display = 'none');
  
      // Show the selected monster
      monsterContainer.style.display = 'block';
    });
    monsterButtonsContainer.appendChild(monsterButton);
  });