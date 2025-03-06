// Function to load and display items from a JSON file
function loadItems(file, containerId) {
  fetch(file)
    .then(response => response.json())
    .then(data => {
      console.log('Data:', data); // Debug: log parsed JSON data
      const container = document.getElementById(containerId);
      const genres = [...new Set(data.map(item => item.genre))];
      const genreButton = container.querySelector('.filter-button[data-filter="genre"]');
      let currentGenreIndex = 0;

      genreButton.addEventListener('click', () => {
        currentGenreIndex = (currentGenreIndex + 1) % genres.length;
        genreButton.textContent = genres[currentGenreIndex];
        filterItems(containerId, 'genre', genres[currentGenreIndex]);
      });

      data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        itemDiv.dataset.genre = item.genre;
        itemDiv.innerHTML = `
          <p>${item.text}</p>
          <span class="copies-count ${item.copies === 0 ? 'zero' : ''}">${item.copies}</span>
          <div class="buttons">
            <button class="decrease-button">-</button>
            <button class="increase-button">+</button>
          </div>
        `;

        // Add event listeners for buttons
        const decreaseButton = itemDiv.querySelector('.decrease-button');
        const increaseButton = itemDiv.querySelector('.increase-button');
        const copiesCountSpan = itemDiv.querySelector('.copies-count');

        const clickSound = new Audio('../../assets/audio/mouse-click-deep.mp3');

        decreaseButton.addEventListener('click', () => {
          clickSound.play();
          if (item.copies > 0) {
            item.copies--;
            copiesCountSpan.textContent = item.copies;
            if (item.copies === 0) {
              copiesCountSpan.classList.add('zero');
            }
            // Save the updated JSON data back to the file (implementation below)
            saveItems(file, data);
          }
        });

        increaseButton.addEventListener('click', () => {
          clickSound.play();
          item.copies++;
          copiesCountSpan.textContent = item.copies;
          if (item.copies > 0) {
            copiesCountSpan.classList.remove('zero');
          }
          // Save the updated JSON data back to the file (implementation below)
          saveItems(file, data);
        });

        container.appendChild(itemDiv);
      });

      // Add filter functionality
      const filterButtons = container.querySelectorAll('.filter-button');
      filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          const filter = button.dataset.filter;
          filterItems(containerId, filter, genres[currentGenreIndex]);
        });
      });
    })
    .catch(error => {
      console.error('Error loading or parsing JSON:', error); // Error handling
    });
}

function filterItems(containerId, filter, genre) {
  const container = document.getElementById(containerId);
  const items = container.querySelectorAll('.item');

  items.forEach(item => {
    switch (filter) {
      case 'all':
        item.style.display = 'flex';
        break;
      case 'has-copies':
        item.style.display = parseInt(item.querySelector('.copies-count').textContent) > 0 ? 'flex' : 'none';
        break;
      case 'zero-copies':
        item.style.display = parseInt(item.querySelector('.copies-count').textContent) === 0 ? 'flex' : 'none';
        break;
      case 'genre':
        item.style.display = item.dataset.genre === genre ? 'flex' : 'none';
        break;
      default:
        item.style.display = 'flex';
    }
  });
}

// Function to save the updated JSON data back to the file
function saveItems(file, data) {
  fetch(file, {
    method: 'PUT', // Use PUT to update the resource
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.ok) {
        console.log('JSON data saved successfully!');
      } else {
        console.error('Error saving JSON data:', response.status);
      }
    });
}

// Load items from each JSON file with corrected relative paths
loadItems('../../data/coop.json', 'coop-items');
loadItems('../../data/loot.json', 'loot-items');
loadItems('../../data/pvp.json', 'pvp-items');