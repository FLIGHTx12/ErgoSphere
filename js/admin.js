// Function to load and display items from a JSON file
function loadItems(file, containerId) {
  fetch(file)
    .then(response => response.json())
    .then(data => {
      console.log('Data:', data); // Debug: log parsed JSON data
      const container = document.getElementById(containerId);
      const genres = [...new Set(data.map(item => item.GENRE))];
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
        itemDiv.dataset.genre = item.GENRE;
        itemDiv.innerHTML = `
          <p>${item.TITLE || item.Title}</p>
          <span class="status-text ${item.STATUS === '🟢' ? 'active' : ''}">${item.STATUS || ' '}</span>
          <div class="buttons">
            <button class="toggle-button">${item.STATUS === '🟢' ? '🟢' : 'OFF'}</button>
          </div>
        `;

        // Add event listeners for buttons
        const toggleButton = itemDiv.querySelector('.toggle-button');
        const statusTextSpan = itemDiv.querySelector('.status-text');

        const clickSound = new Audio('../../assets/audio/mouse-click-deep.mp3');

        toggleButton.addEventListener('click', () => {
          clickSound.play();
          item.STATUS = item.STATUS === '🟢' ? '' : '🟢';
          toggleButton.textContent = item.STATUS === '🟢' ? '🟢' : 'OFF';
          statusTextSpan.textContent = item.STATUS || ' ';
          statusTextSpan.classList.toggle('active', item.STATUS === '🟢');
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
      case 'has-status':
        item.style.display = item.querySelector('.status-text').textContent === '🟢' ? 'flex' : 'none';
        break;
      case 'no-status':
        item.style.display = item.querySelector('.status-text').textContent !== '🟢' ? 'flex' : 'none';
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
  fetch(`/data/${file.split('/').pop()}`, {
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
loadItems('../../data/movies.json', 'movies-items');
loadItems('../../data/anime.json', 'anime-items');
loadItems('../../data/sundaymorning.json', 'sundaymorning-items');
loadItems('../../data/sundaynight.json', 'sundaynight-items');
loadItems('../../data/singleplayer.json', 'singleplayer-items');