// Function to load and display items from a JSON file
function loadItems(file, containerId) {
  fetch(file)
    .then(response => response.json())
    .then(data => {
      console.log('Data:', data); // Debug: log parsed JSON data
      const container = document.getElementById(containerId);

      // Extract genres based on the container ID
      let genres = [];
      if (containerId === 'coop-items' || containerId === 'loot-items' || containerId === 'pvp-items') {
        genres = [...new Set(data.flatMap(item => (item.genre || '').split(',').map(s => s.trim())))];
      } else {
        genres = [...new Set(data.flatMap(item => (item.GENRE || '').split(',').map(s => s.trim())))];
      }

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

        // Set the genre dataset based on the container ID
        let itemGenres = item.GENRE || item.genre || '';
        if (typeof itemGenres === 'string') {
          itemGenres = itemGenres.split(',').map(s => s.trim());
        }
        itemDiv.dataset.genre = JSON.stringify(itemGenres);

        let itemText = '';
        let statusText = '';
        let buttonsHTML = '';

        if (containerId === 'coop-items' || containerId === 'loot-items' || containerId === 'pvp-items') {
          itemText = item.text;
          statusText = '';
          buttonsHTML = `
            <span class="copies-count ${item.copies === 0 ? 'zero' : ''}">${item.copies}</span>
            <div class="buttons">
              <button class="decrease-button">-</button>
              <button class="increase-button">+</button>
            </div>
          `;
        } else {
          itemText = item.TITLE || item.Title;
          statusText = `<span class="status-text ${item.STATUS === '🟢' ? 'active' : ''}">${item.STATUS || ' '}</span>`;
          buttonsHTML = `
            <div class="buttons">
              <button class="toggle-button">${item.STATUS === '🟢' ? '🟢' : 'OFF'}</button>
            </div>
          `;
        }

        itemDiv.innerHTML = `
          <p>${itemText}</p>
          ${statusText}
          ${buttonsHTML}
        `;

        // Add event listeners for buttons
        if (containerId === 'coop-items' || containerId === 'loot-items' || containerId === 'pvp-items') {
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
            saveItems(file, data);
          });
        } else {
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
        }

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
      case 'has-copies':
        item.style.display = parseInt(item.querySelector('.copies-count').textContent) > 0 ? 'flex' : 'none';
        break;
      case 'zero-copies':
        item.style.display = parseInt(item.querySelector('.copies-count').textContent) === 0 ? 'flex' : 'none';
        break;
      case 'genre':
        const itemGenres = JSON.parse(item.dataset.genre);
        item.style.display = itemGenres.includes(genre) ? 'flex' : 'none';
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

// Save Admin state to localStorage
function saveAdminState() {
  const state = {};

  // Save filter button states and item copies
  document.querySelectorAll('.filter-button').forEach(button => {
    state[button.dataset.filter] = button.textContent;
  });
  document.querySelectorAll('.copies-count').forEach(span => {
    state[span.id || span.dataset.item] = span.textContent;
  });

  localStorage.setItem('adminState', JSON.stringify(state));
}

// Restore Admin state from localStorage
function restoreAdminState() {
  const state = JSON.parse(localStorage.getItem('adminState')) || {};

  Object.keys(state).forEach(key => {
    const button = document.querySelector(`.filter-button[data-filter="${key}"]`);
    if (button) {
      button.textContent = state[key];
    }
    const span = document.querySelector(`.copies-count[data-item="${key}"]`);
    if (span) {
      span.textContent = state[key];
    }
  });
}

// Load items from each JSON file with relative paths
loadItems('../../data/coop.json', 'coop-items');
loadItems('../../data/loot.json', 'loot-items');
loadItems('../../data/pvp.json', 'pvp-items');
loadItems('../../data/movies.json', 'movies-items');
loadItems('../../data/anime.json', 'anime-items');
loadItems('../../data/sundaymorning.json', 'sundaymorning-items');
loadItems('../../data/sundaynight.json', 'sundaynight-items');
loadItems('../../data/singleplayer.json', 'singleplayer-items');
loadItems('../../data/youtube.json', 'youtube-items');

document.addEventListener('DOMContentLoaded', function() {
  restoreAdminState();

  const coll = document.getElementsByClassName("collapsible");
  const collapseAllButton = document.getElementById('collapse-all');

  collapseAllButton.addEventListener('click', function() {
    for (let i = 0; i < coll.length; i++) {
      const content = coll[i].nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
        coll[i].classList.remove("active");
      }
    }
  });

  document.querySelectorAll('.filter-button, .copies-count').forEach(element => {
    element.addEventListener('input', saveAdminState);
  });
});