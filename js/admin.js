// Function to load and display items from a JSON file
function loadItems(file, containerId) {
  fetch(file)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`Loaded data for ${containerId}:`, data.length || 'object'); 
      const container = document.getElementById(containerId);

      // Remove genre extraction and button logic
      // let genres = [];
      // if (containerId === 'coop-items' || containerId === 'loot-items' || containerId === 'pvp-items') {
      //   genres = [...new Set(data.flatMap(item => (item.genre || '').split(',').map(s => s.trim())))];
      // } else {
      //   genres = [...new Set(data.flatMap(item => (item.GENRE || '').split(',').map(s => s.trim())))];
      // }

      // const genreButton = container.querySelector('.filter-button[data-filter="genre"]');
      // let currentGenreIndex = 0;

      // if (genreButton) { // Check if genreButton exists
      //   genreButton.addEventListener('click', () => {
      //     currentGenreIndex = (currentGenreIndex + 1) % genres.length;
      //     genreButton.textContent = genres[currentGenreIndex];
      //     filterItems(containerId, 'genre', genres[currentGenreIndex]);
      //   });
      // }

      data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');

        // Set the genre dataset based on the container ID (can be kept if genre data is still useful for other purposes or future use)
        let itemGenres = item.GENRE || item.genre || '';
        if (typeof itemGenres === 'string') {
          itemGenres = itemGenres.split(',').map(s => s.trim());
        }
        itemDiv.dataset.genre = JSON.stringify(itemGenres); // Keep for potential future use or if other logic depends on it

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
        // Store itemText on the element for searching
        itemDiv.dataset.itemText = itemText.toLowerCase();

        // Add event listeners for buttons
        if (containerId === 'coop-items' || containerId === 'loot-items' || containerId === 'pvp-items') {
          const decreaseButton = itemDiv.querySelector('.decrease-button');
          const increaseButton = itemDiv.querySelector('.increase-button');
          const copiesCountSpan = itemDiv.querySelector('.copies-count');

          const clickSound = new Audio('../../assets/audio/mouse-click-deep.mp3');          
          decreaseButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            clickSound.play();
            
            // Provide immediate button feedback
            decreaseButton.style.backgroundColor = "#4a235a";
            setTimeout(() => { decreaseButton.style.backgroundColor = ""; }, 300);
            
            if (item.copies > 0) {
              item.copies--;
              copiesCountSpan.textContent = item.copies;
              if (item.copies === 0) {
                copiesCountSpan.classList.add('zero');
                copiesCountSpan.style.backgroundColor = 'red';
              }
              saveItems(file, data);
            }
          });

          increaseButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            clickSound.play();
            
            // Provide immediate button feedback
            increaseButton.style.backgroundColor = "#4a235a";
            setTimeout(() => { increaseButton.style.backgroundColor = ""; }, 300);
            
            item.copies++;
            copiesCountSpan.textContent = item.copies;
            if (item.copies > 0) {
              copiesCountSpan.classList.remove('zero');
              copiesCountSpan.style.backgroundColor = 'green';
            }
            saveItems(file, data);
          });
        } else {
          const toggleButton = itemDiv.querySelector('.toggle-button');
          const statusTextSpan = itemDiv.querySelector('.status-text');

          const clickSound = new Audio('../../assets/audio/mouse-click-deep.mp3');          
          toggleButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            clickSound.play();
            
            // Provide immediate button feedback
            toggleButton.style.backgroundColor = "#4a235a";
            setTimeout(() => { toggleButton.style.backgroundColor = ""; }, 300);
            
            item.STATUS = item.STATUS === '🟢' ? '' : '🟢';
            toggleButton.textContent = item.STATUS === '🟢' ? '🟢' : 'OFF';
            statusTextSpan.textContent = item.STATUS || ' ';
            statusTextSpan.classList.toggle('active', item.STATUS === '🟢');
            statusTextSpan.style.backgroundColor = item.STATUS === '🟢' ? 'green' : 'transparent';
            saveItems(file, data);
          });
        }

        container.appendChild(itemDiv);
      });

      // Add filter functionality for the cycling button
      const cyclingFilterButton = container.querySelector('.cycling-filter-button');
      if (cyclingFilterButton) {
        const filterStates = cyclingFilterButton.dataset.filterStates.split(',');
        const displayNames = cyclingFilterButton.dataset.displayNames.split(',');
        let currentIndex = parseInt(cyclingFilterButton.dataset.currentFilterIndex, 10);

        // Set initial text based on current index
        cyclingFilterButton.textContent = `Filter: ${displayNames[currentIndex]}`;

        cyclingFilterButton.addEventListener('click', () => {
          currentIndex = (currentIndex + 1) % filterStates.length;
          cyclingFilterButton.dataset.currentFilterIndex = currentIndex;
          const currentFilterValue = filterStates[currentIndex];
          cyclingFilterButton.textContent = `Filter: ${displayNames[currentIndex]}`;
          filterItems(containerId, currentFilterValue, null);
          saveAdminState(); // Save state on filter change
        });
      }

      // Add event listener for the search bar
      const searchBar = container.querySelector('.search-bar');
      if (searchBar) {
        searchBar.addEventListener('input', (e) => {
          const searchTerm = e.target.value.toLowerCase();
          filterItems(containerId, 'search', searchTerm);
        });
      }
    })    
    .catch(error => {
      console.error('Error loading or parsing JSON:', error);
      
      // Show error message to user
      const errorMsg = document.createElement('div');
      errorMsg.textContent = `Error loading data: ${error.message}`;
      errorMsg.style.color = 'red';
      errorMsg.style.padding = '10px';
      errorMsg.style.margin = '10px 0';
      errorMsg.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
      errorMsg.style.borderRadius = '5px';
      errorMsg.style.border = '1px solid red';
      
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = ''; // Clear previous content
        container.appendChild(errorMsg);
      }
    });
}

// Function to refresh data from the server
function refreshData(file, containerId) {
  // Clear the container
  const container = document.getElementById(containerId);
  if (container) {
    // Save current filter state and search term
    let currentFilterStateValue = 'all';
    const cyclingButtonOld = container.querySelector('.cycling-filter-button');
    if (cyclingButtonOld) {
        const filterStates = cyclingButtonOld.dataset.filterStates.split(',');
        const currentIndex = parseInt(cyclingButtonOld.dataset.currentFilterIndex, 10);
        if (filterStates[currentIndex]) {
            currentFilterStateValue = filterStates[currentIndex];
        }
    }
    const currentSearchTerm = container.querySelector('.search-bar')?.value || '';
    
    container.innerHTML = '';
    
    // Re-add the filter buttons and search bar
    const filters = document.createElement('div');
    filters.className = 'filters';
    
    let filterButtonHTML = '';
    if (containerId === 'coop-items' || containerId === 'loot-items' || containerId === 'pvp-items') {
      filterButtonHTML = `<button class="cycling-filter-button" data-filter-states="all,has-copies,zero-copies" data-display-names="All,Active,Not Active" data-current-filter-index="0">Filter: All</button>`;
    } else {
      filterButtonHTML = `<button class="cycling-filter-button" data-filter-states="all,has-status,no-status" data-display-names="All,Active,Not Active" data-current-filter-index="0">Filter: All</button>`;
    }
    
    filters.innerHTML = `
      ${filterButtonHTML}
      <input type="text" class="search-bar" placeholder="Search..." data-container="${containerId}">
    `;
    // Always add refresh button
    const refreshButton = document.createElement('button');
    refreshButton.className = 'refresh-button';
    refreshButton.dataset.file = file;
    refreshButton.dataset.container = containerId;
    refreshButton.innerHTML = '↻';
    filters.appendChild(refreshButton);
    
    container.appendChild(filters);
    
    // Show loading indicator
    const loading = document.createElement('div');
    loading.textContent = 'Refreshing data...';
    loading.style.padding = '10px';
    loading.style.textAlign = 'center';
    loading.style.color = 'white';
    loading.style.marginTop = '10px';
    container.appendChild(loading);
    
    // Reload the data with a cache-busting query parameter
    const cacheBuster = `?t=${Date.now()}`;
    loadItems(`${file}${cacheBuster}`, containerId);
    
    // Restore search term and re-apply filter if necessary
    setTimeout(() => {
      const searchBar = container.querySelector('.search-bar');
      const cyclingButtonNew = container.querySelector('.cycling-filter-button');
      
      if (searchBar && currentSearchTerm) {
        searchBar.value = currentSearchTerm;
        filterItems(containerId, 'search', currentSearchTerm.toLowerCase());
      } else if (cyclingButtonNew && currentFilterStateValue && currentFilterStateValue !== 'all') {
        const filterStates = cyclingButtonNew.dataset.filterStates.split(',');
        const displayNames = cyclingButtonNew.dataset.displayNames.split(',');
        const savedFilterIndex = filterStates.indexOf(currentFilterStateValue);
        if (savedFilterIndex !== -1) {
          cyclingButtonNew.dataset.currentFilterIndex = savedFilterIndex;
          cyclingButtonNew.textContent = `Filter: ${displayNames[savedFilterIndex]}`;
          filterItems(containerId, currentFilterStateValue, null);
        } else {
          cyclingButtonNew.dataset.currentFilterIndex = 0;
          cyclingButtonNew.textContent = `Filter: ${displayNames[0]}`;
          filterItems(containerId, 'all', null);
        }
      } else if (cyclingButtonNew) { // Default to 'all'
        const displayNames = cyclingButtonNew.dataset.displayNames.split(',');
        cyclingButtonNew.dataset.currentFilterIndex = 0;
        cyclingButtonNew.textContent = `Filter: ${displayNames[0]}`;
        filterItems(containerId, 'all', null);
      }
    }, 500);
  }
}

function filterItems(containerId, filter, value) { // Renamed 'genre' to 'value' for broader use
  const container = document.getElementById(containerId);
  const items = container.querySelectorAll('.item');
  const searchTerm = (filter === 'search' && value) ? value.toLowerCase() : null;

  items.forEach(item => {
    let showItem = false;
    const itemText = item.dataset.itemText || ''; // Get stored item text

    switch (filter) {
      case 'all':
        showItem = true;
        break;
      case 'has-status':
        showItem = item.querySelector('.status-text').textContent === '🟢';
        break;
      case 'no-status':
        showItem = item.querySelector('.status-text').textContent !== '🟢';
        break;
      case 'has-copies':
        showItem = parseInt(item.querySelector('.copies-count').textContent) > 0;
        break;
      case 'zero-copies':
        showItem = parseInt(item.querySelector('.copies-count').textContent) === 0;
        break;
      // case 'genre': // Removed genre case
      //   const itemGenres = JSON.parse(item.dataset.genre);
      //   showItem = itemGenres.includes(value);
      //   break;
      case 'search':
        showItem = searchTerm ? itemText.includes(searchTerm) : true; // Show all if search term is empty
        break;
      default:
        showItem = true;
    }
    item.style.display = showItem ? 'flex' : 'none';
  });
}

// Function to save the updated JSON data back to the file
function saveItems(file, data) {
  const filename = file.split('/').pop();
  
  // Add visual feedback
  const statusMsg = document.getElementById('save-status') || (() => {
    const el = document.createElement('div');
    el.id = 'save-status';
    el.style.position = 'fixed';
    el.style.bottom = '20px';
    el.style.right = '20px';
    el.style.padding = '10px';
    el.style.borderRadius = '5px';
    el.style.backgroundColor = '#3498db';
    el.style.color = 'white';
    el.style.fontWeight = 'bold';
    el.style.zIndex = '1000';
    document.body.appendChild(el);
    return el;
  })();
    statusMsg.textContent = 'Saving...';
  statusMsg.style.display = 'block';
  
  // Find container ID from the file path
  const containerId = filename.replace('.json', '-items');
  console.log(`Saving ${filename} with ${Array.isArray(data) ? data.length : 'object'} items to container ${containerId}`);
  
  fetch(`/data/${filename}`, {
    method: 'PUT', // Use PUT to update the resource
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })    
    .then(result => {
      console.log('JSON data saved successfully!', result);
      statusMsg.textContent = result.message || 'Saved successfully!';
      statusMsg.style.backgroundColor = '#2ecc71';
      
      // Store this change in localStorage for persistence
      saveAdminState();
      
      // Hide the message after 1.5 seconds
      setTimeout(() => {
        statusMsg.style.display = 'none';
      }, 1500);
    })
    .catch(error => {
      console.error('Error saving JSON data:', error);
      statusMsg.textContent = `Error: ${error.message}`;
      statusMsg.style.backgroundColor = '#e74c3c';
      
      // Hide the message after 5 seconds
      setTimeout(() => {
        statusMsg.style.display = 'none';
      }, 5000);
    });
}

// Function to save the current admin state (filters, etc.) to localStorage
function saveAdminState() {
  const state = {
    activeFilters: {},
    searchTerms: {}, // Add search terms
    timestamp: Date.now()
  };
  
  // Save active filters and search terms for each container
  document.querySelectorAll('.item-container').forEach(container => {
    const id = container.id;
    const cyclingButton = container.querySelector('.cycling-filter-button');
    let currentFilter = 'all';
    if (cyclingButton) {
        const filterStates = cyclingButton.dataset.filterStates.split(',');
        // Ensure currentIndex is valid before accessing filterStates
        const currentIndex = parseInt(cyclingButton.dataset.currentFilterIndex, 10);
        if (filterStates && currentIndex >= 0 && currentIndex < filterStates.length) {
            currentFilter = filterStates[currentIndex];
        }
    }
    
    const searchTerm = container.querySelector('.search-bar')?.value || '';
    state.activeFilters[id] = currentFilter;
    state.searchTerms[id] = searchTerm; // Save search term
  });
  
  localStorage.setItem('adminState', JSON.stringify(state));
}

// Function to restore the admin state from localStorage
function restoreAdminState() {
  try {
    const savedState = JSON.parse(localStorage.getItem('adminState'));
    
    if (savedState) {
      // Set a timeout to ensure the DOM is fully loaded
      setTimeout(() => {
        // Restore active filters and search terms for each container
        Object.keys(savedState.activeFilters).forEach(containerId => {
          const container = document.getElementById(containerId);
          if (container) {
            const savedFilterValue = savedState.activeFilters[containerId];
            const searchTerm = savedState.searchTerms ? (savedState.searchTerms[containerId] || '') : '';

            const searchBar = container.querySelector('.search-bar');
            const cyclingButton = container.querySelector('.cycling-filter-button');

            if (searchBar && searchTerm) {
              searchBar.value = searchTerm;
              filterItems(containerId, 'search', searchTerm.toLowerCase()); // Apply search
            } else if (cyclingButton && savedFilterValue && savedFilterValue !== 'all') {
              const filterStates = cyclingButton.dataset.filterStates.split(',');
              const displayNames = cyclingButton.dataset.displayNames.split(',');
              const savedFilterIndex = filterStates.indexOf(savedFilterValue);

              if (savedFilterIndex !== -1) {
                cyclingButton.dataset.currentFilterIndex = savedFilterIndex;
                cyclingButton.textContent = `Filter: ${displayNames[savedFilterIndex]}`;
                filterItems(containerId, savedFilterValue, null);
              } else { // Default to 'all' if problem
                cyclingButton.dataset.currentFilterIndex = 0;
                cyclingButton.textContent = `Filter: ${displayNames[0] || 'All'}`; // Ensure displayNames[0] exists
                filterItems(containerId, 'all', null);
              }
            } else if (cyclingButton) { // Default to 'all'
              const displayNames = cyclingButton.dataset.displayNames.split(',');
              cyclingButton.dataset.currentFilterIndex = 0;
              cyclingButton.textContent = `Filter: ${displayNames[0] || 'All'}`; // Ensure displayNames[0] exists
              filterItems(containerId, 'all', null);
            }
          }
        });
      }, 500); // Increased timeout slightly to ensure all elements are ready
    }
  } catch (err) {
    console.error('Error restoring admin state:', err);
    // Clear potentially corrupted state
    localStorage.removeItem('adminState');
  }
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

  // document.querySelectorAll('.filter-button, .copies-count, .search-bar').forEach(element => { // Added .search-bar
  //   element.addEventListener('input', saveAdminState); // Changed to 'input' for search-bar for immediate saving
  // });
  // Cycling filter button saves state in its own handler.
  // +/- buttons trigger saveItems which calls saveAdminState.
  // Search bar needs to save state on input.
  document.querySelectorAll('.search-bar').forEach(element => {
    element.addEventListener('input', saveAdminState);
  });
  
  // Add event listeners for refresh buttons
  document.querySelectorAll('.refresh-button').forEach(button => {
    button.addEventListener('click', function() {
      const file = this.dataset.file;
      const containerId = this.dataset.container;
      
      // Visual feedback for refresh button
      this.classList.add('refreshing');
      this.disabled = true;
      
      // Show refresh notification
      const statusMsg = document.getElementById('save-status') || (() => {
        const el = document.createElement('div');
        el.id = 'save-status';
        el.style.position = 'fixed';
        el.style.bottom = '20px';
        el.style.right = '20px';
        el.style.padding = '10px';
        el.style.borderRadius = '5px';
        el.style.backgroundColor = '#3498db';
        el.style.color = 'white';
        el.style.fontWeight = 'bold';
        el.style.zIndex = '1000';
        document.body.appendChild(el);
        return el;
      })();
      
      statusMsg.textContent = 'Refreshing data...';
      statusMsg.style.display = 'block';
      statusMsg.style.backgroundColor = '#3498db';
      
      // Refresh the data
      refreshData(file, containerId);
      
      // Reset the button after refresh
      setTimeout(() => {
        this.classList.remove('refreshing');
        this.disabled = false;
        statusMsg.textContent = 'Data refreshed!';
        statusMsg.style.backgroundColor = '#2ecc71';
        
        setTimeout(() => {
          statusMsg.style.display = 'none';
        }, 1500);
      }, 1000);
    });
  });
});