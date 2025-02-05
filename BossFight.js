// BossFight.js

document.addEventListener('DOMContentLoaded', () => {
    const monsters = [
      {
        name: "TAKEN KNIGHT",
        health: 300,
        hitNumbers: [15, 6, 5, 19, 4],
        imageSrc: "https://i.ibb.co/Bykb0sv/Taken-Knight-strength.jpg",
        defeatedImageSrc: "https://i.ibb.co/Bykb0sv/Taken-Knight-strength.jpg"
      },
      {
        name: "TAKEN CABAL",
        health: 400,
        hitNumbers: [16, 1, 8, 12, 5],
        imageSrc: "https://i.ibb.co/Pt5nwB1/Taken-Cabal-Const.jpg",
        defeatedImageSrc: "https://i.ibb.co/Pt5nwB1/Taken-Cabal-Const.jpg"
      },
      {
        name: "TAKEN WITCH",
        health: 200,
        hitNumbers: [16, 7, 19, 15, 14],
        imageSrc: "https://i.ibb.co/jwGzMS1/taken-witch-Intel.jpg",
        defeatedImageSrc: "https://i.ibb.co/jwGzMS1/taken-witch-Intel.jpg"
      },
      {
        name: "TAKEN PSION",
        health: 150,
        hitNumbers: [19, 10, 12, 1, 2],
        imageSrc: "https://i.ibb.co/H4cSB3w/Taken-Psion-Perception.jpg",
        defeatedImageSrc: "https://i.ibb.co/H4cSB3w/Taken-Psion-Perception.jpg"
      },
      {
        name: "BANISHED",
        health: 400,
        hitNumbers: [2, 11, 19, 13, 20],
        imageSrc: "https://i.ibb.co/cQNhdDY/Halo-Banished-strength.jpg",
        defeatedImageSrc: "https://i.ibb.co/cQNhdDY/Halo-Banished-strength.jpg"
      },
      {
        name: "ELITE",
        health: 200,
        hitNumbers: [11, 14, 4, 1, 12],
        imageSrc: "https://i.ibb.co/gyzXmkY/Halo-Elite-Intel.jpg",
        defeatedImageSrc: "https://i.ibb.co/gyzXmkY/Halo-Elite-Intel.jpg"
      },
      {
        name: "JACKEL",
        health: 100,
        hitNumbers: [6, 8, 3, 12, 1],
        imageSrc: "https://i.ibb.co/9Z7n1RX/Halo-Jackel-Perception.jpg",
        defeatedImageSrc: "https://i.ibb.co/9Z7n1RX/Halo-Jackel-Perception.jpg"
      },
      {
        name: "HUNTER",
        health: 400,
        hitNumbers: [8, 5, 11, 6, 13],
        imageSrc: "https://i.ibb.co/tCWXSXZ/Halo-Hunter-Constitution.jpg",
        defeatedImageSrc: "https://i.ibb.co/tCWXSXZ/Halo-Hunter-Constitution.jpg"
      }
    ];
  
  const gameContainer = document.querySelector('.game-container');
    const monsterButtonsContainer = document.getElementById('monsterButtons');
    
    if (!monsterButtonsContainer) {
      console.error('monsterButtonsContainer is not found in the DOM.');
      return;
    }
  
    let currentPlayer = 1;
    
    // Ensure the button isn't created multiple times
    if (!document.getElementById('chooseOpponentBtn')) {
      // Add a button to choose opponent
      const chooseOpponentBtn = document.createElement('button');
      chooseOpponentBtn.id = 'chooseOpponentBtn';
      chooseOpponentBtn.textContent = "Choose Opponent";
      monsterButtonsContainer.appendChild(chooseOpponentBtn);
  
      // Add dropdown for selecting monster
      const monsterDropdown = document.createElement('select');
      monsterDropdown.id = 'monsterDropdown';
      monsterDropdown.style.display = 'none';
      monsterButtonsContainer.appendChild(monsterDropdown);
  
      monsters.forEach((monster, index) => {
        // Add options to the dropdown
        const option = document.createElement('option');
        option.value = index;
        option.text = monster.name;
        monsterDropdown.appendChild(option);
  
        // Create monster container
        const monsterContainer = document.createElement('div');
        monsterContainer.classList.add('monster-container');
        monsterContainer.style.display = 'none'; // Ensuring it's hidden initially
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
  
        const historyContainer = document.createElement('div');
        historyContainer.id = 'historyContainer';
  
        const attackInputsContainer = document.createElement('div');
        attackInputsContainer.id = 'attackInputs';
        const addAttackButton = document.createElement('button');
        addAttackButton.id = 'addAttackButton';
        addAttackButton.textContent = "Add Attack";
        const attackButton = document.createElement('button');
        attackButton.id = 'attackButton';
        attackButton.textContent = `Jaybers8 Attack!`;
  
        const playerToggle = document.createElement('button');
        playerToggle.textContent = "Toggle Player";
        playerToggle.addEventListener('click', () => {
          currentPlayer = currentPlayer === 1 ? 2 : 1;
          attackButton.textContent = `${currentPlayer === 1 ? 'Jaybers8' : 'FLIGHTx12!'} Attack!`;
          initialInput.style.backgroundColor = currentPlayer === 1 ? 'purple': 'green';
        });
  
        monsterContainer.appendChild(playerToggle);
  
        // Append elements to the monster container
        monsterContainer.appendChild(monsterDiv);
        monsterDiv.appendChild(lifeBar);
        lifeBar.appendChild(lifeBarGreen);
        lifeBar.appendChild(lifeBarText);
        monsterContainer.appendChild(monsterImage);
        monsterImage.appendChild(image);
        monsterContainer.appendChild(historyContainer);
        monsterContainer.appendChild(attackInputsContainer);
        monsterContainer.appendChild(addAttackButton);
        monsterContainer.appendChild(attackButton);
  
        let monsterLife = monster.health;
        let numAttacks = 1;
  
        // Create the initial attack input
        const initialInput = document.createElement('input');
        initialInput.type = 'number';
        initialInput.min = '1';
        initialInput.max = '20';
        initialInput.classList.add('initial');
        initialInput.style.backgroundColor = 'purple';
  
        attackInputsContainer.appendChild(initialInput);
  
        addAttackButton.addEventListener('click', () => {
          if (numAttacks < 11) {
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.max = '20';
            attackInputsContainer.appendChild(input);
            numAttacks++;
          }
        });
  
        attackButton.addEventListener('click', () => {
          let totalDamage = 0;
          let hitCount = 0;
  
          for (let i = 0; i < attackInputsContainer.children.length; i++) {
            const input = attackInputsContainer.children[i];
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
          lifeBarGreen.style.width = (monsterLife / monster.health) * 100 + '%';
          lifeBarText.textContent = monsterLife;
  
          if (monsterLife === 0) {
            alert(`${currentPlayer === 1 ? 'Jaybers8' : 'FLIGHTx12!'} defeated the ${monster.name}!`);
            image.src = monster.defeatedImageSrc;
          }
  
          historyContainer.innerHTML += `<p style="color:green;">${currentPlayer === 1 ? 'Jaybers8' : 'FLIGHTx12!'} attacks for a cumulative total of ${totalDamage} damage.</p>`;
          if (hitCount > 0) {
            historyContainer.innerHTML += `<p style="color:red;">Boss hits player ${hitCount} times.</p>`;
          }
          historyContainer.scrollTop = historyContainer.scrollHeight;
  
          // Reset additional inputs
          for (let i = 1; i < attackInputsContainer.children.length; i++) {
            attackInputsContainer.children[i].value = '';
          }
        });
      });
  
      chooseOpponentBtn.addEventListener('click', () => {
        monsterDropdown.style.display = 'block';
      });
  
      monsterDropdown.addEventListener('change', () => {
        const selectedMonsterIndex = monsterDropdown.value;
  
        const monsterContainers = document.querySelectorAll('.monster-container');
        monsterContainers.forEach(container => container.style.display = 'none');
  
        if (selectedMonsterIndex !== '') {
          monsterContainers[selectedMonsterIndex].style.display = 'block';
          monsterDropdown.style.display = 'none';  // Hide the dropdown after selection
        }
      });
    }
  });