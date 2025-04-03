document.addEventListener('DOMContentLoaded', () => {
  // Add navbar scroll behavior
  let lastScrollTop = 0;
  const navbar = document.getElementById('navbar');
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }
    lastScrollTop = scrollTop;
  });

  // Add filter button to navbar
  const filterBtn = document.createElement('button');
  filterBtn.className = 'filter-btn';
  filterBtn.textContent = 'Status: All';
  navbar.appendChild(filterBtn);

  let currentFilter = 'all'; // Possible values: 'all', 'active', 'inactive', 'watched'
  let hasWatchedData = false;
  let hasCompletedData = false;
  let hasSeasonalData = false;

  // After creating the filter button, add the genre filter
  const genreFilter = document.createElement('div');
  genreFilter.className = 'genre-filter';
  
  const genreBtn = document.createElement('button');
  genreBtn.className = 'genre-btn';
  genreBtn.textContent = 'Genre: All';
  
  const genreDropdown = document.createElement('div');
  genreDropdown.className = 'genre-dropdown';
  
  genreFilter.appendChild(genreBtn);
  genreFilter.appendChild(genreDropdown);
  navbar.appendChild(genreFilter);

  // Add sort button
  const sortFilter = document.createElement('div');
  sortFilter.className = 'sort-filter';
  
  const sortBtn = document.createElement('button');
  sortBtn.className = 'sort-btn';
  sortBtn.textContent = 'Sort By';
  
  const sortDropdown = document.createElement('div');
  sortDropdown.className = 'sort-dropdown';
  
  sortFilter.appendChild(sortBtn);
  sortFilter.appendChild(sortDropdown);
  navbar.appendChild(sortFilter);

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!genreFilter.contains(e.target)) {
      genreDropdown.classList.remove('show');
    }
    if (!sortFilter.contains(e.target)) {
      sortDropdown.classList.remove('show');
    }
  });

  // Toggle dropdown
  genreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    genreDropdown.classList.toggle('show');
  });

  // Toggle dropdown
  sortBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sortDropdown.classList.toggle('show');
  });

  function populateGenreDropdown(data) {
    const genres = new Set();
    
    // Clear existing options
    while (genreDropdown.firstChild) {
      genreDropdown.removeChild(genreDropdown.firstChild);
    }
    
    // Extract only non-empty genres
    data.forEach(item => {
      const genreString = item.GENRE || item.genre || '';
      if (genreString.trim() !== '') {
        genreString.split(/[,&-]/).forEach(genre => {
          const trimmedGenre = genre.trim();
          if (trimmedGenre) genres.add(trimmedGenre);
        });
      }
    });

    // Only show genre filter if we have genres
    if (genres.size > 0) {
      const allOption = document.createElement('div');
      allOption.className = 'genre-option';
      allOption.textContent = 'All';
      allOption.addEventListener('click', () => {
        genreBtn.textContent = 'Genre: All';
        genreDropdown.classList.remove('show');
        filterByGenre('all');
      });
      genreDropdown.appendChild(allOption);

      Array.from(genres).sort().forEach(genre => {
        const option = document.createElement('div');
        option.className = 'genre-option';
        option.textContent = genre;
        option.addEventListener('click', () => {
          genreBtn.textContent = `Genre: ${genre}`;
          genreDropdown.classList.remove('show');
          filterByGenre(genre);
        });
        genreDropdown.appendChild(option);
      });
      genreBtn.style.display = 'block';
    } else {
      genreBtn.style.display = 'none';
    }
  }

  function filterByGenre(selectedGenre) {
    currentGenre = selectedGenre;
    applyAllFilters();
  }

  function populateSortOptions(data) {
    while (sortDropdown.firstChild) {
      sortDropdown.removeChild(sortDropdown.firstChild);
    }

    const sortOptions = [];
    
    // Check for year data - only look for (YYYY) in titles
    const hasYearData = data.some(item => {
      const title = item.Title || '';
      return /.*\(\d{4}\)/.test(title);
    });
    
    // Check for runtime data - FIX: Added missing closing parenthesis
    const hasRuntimeData = data.some(item => {
      const runtime = item.RUNTIME || '';
      return runtime.trim() !== '' || /\d+(?:h|min)/.test(item.Title || '');
    });
    
    // Check for specific fields
    const hasTimeTobeat = data.some(item => 
      (item['TIME TO BEAT'] || item['time to beat']) && 
      (item['TIME TO BEAT']?.trim() !== '' || item['time to beat']?.trim() !== '')
    );
    
    const hasCost = data.some(item => 
      item.cost && item.cost.trim() !== ''
    );
    
    const hasCopies = data.some(item => 
      typeof item.copies === 'number' || 
      (typeof item.copies === 'string' && item.copies.trim() !== '')
    );

    // Only add options that have data
    if (hasYearData) sortOptions.push('Year');
    if (hasRuntimeData) sortOptions.push('Runtime');
    if (hasTimeTobeat) sortOptions.push('Time to Beat');
    if (hasCost) sortOptions.push('Cost');
    if (hasCopies) sortOptions.push('Copies');

    // Only create dropdown if we have options
    if (sortOptions.length > 0) {
      sortOptions.forEach(option => {
        const sortOption = document.createElement('div');
        sortOption.className = 'sort-option';
        sortOption.textContent = option;
        sortOption.addEventListener('click', () => {
          const currentDirection = sortBtn.textContent.includes('↓') ? '↓' : '↑';
          sortBtn.textContent = `Sort By: ${option} ${currentDirection}`;
          sortDropdown.classList.remove('show');
          sortItems(option.toLowerCase());
        });
        sortDropdown.appendChild(sortOption);
      });
      sortBtn.style.display = 'block';
    } else {
      sortBtn.style.display = 'none';
    }
  }

  function sortItems(criteria, maintainDirection = false) {
    const container = document.getElementById('data-container');
    const items = Array.from(container.getElementsByClassName('item-row'));

    // Only get visible items
    const visibleItems = items.filter(item => item.style.display !== 'none');
    
    // Update sort state
    currentSort.field = criteria;
    if (!maintainDirection) {
      currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }

    const extractRuntime = (text) => {
      let totalMinutes = 0;
      
      // First check for specific runtime field in the details
      const runtimeMatch = text.match(/Runtime:?\s*(?:(\d+)\s*h(?:ours?)?)?[:\s]*(?:(\d+)\s*m(?:in(?:utes?)?)?)?/i);
      if (runtimeMatch) {
        const hours = runtimeMatch[1] ? parseInt(runtimeMatch[1]) : 0;
        const minutes = runtimeMatch[2] ? parseInt(runtimeMatch[2]) : 0;
        totalMinutes = hours * 60 + minutes;
        if (totalMinutes > 0) return totalMinutes;
      }
      
      // Match formats: "1h 35min", "2h30m", "150 minutes", "2:30", "1h", "30m", "90min"
      const timeMatch = text.match(/(?:(\d+)\s*h(?:ours?)?)?[:\s]*(?:(\d+)\s*m(?:in(?:utes?)?)?)?/);
      
      if (timeMatch) {
        const hours = timeMatch[1] ? parseInt(timeMatch[1]) : 0;
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        totalMinutes = hours * 60 + minutes;
      }
      
      // Also try to match just a pure number of minutes like "123 minutes"
      if (totalMinutes === 0) {
        const pureMinutes = text.match(/(\d+)\s*minutes?/i);
        if (pureMinutes) {
          totalMinutes = parseInt(pureMinutes[1]);
        }
      }
      
      // Try to match "X:YY" format (hours:minutes)
      if (totalMinutes === 0) {
        const timeFormat = text.match(/(\d+):(\d{2})/);
        if (timeFormat) {
          totalMinutes = parseInt(timeFormat[1]) * 60 + parseInt(timeFormat[2]);
        }
      }
      
      return totalMinutes || 9999; // Return 9999 for items without runtime
    };

    const extractYear = (text) => {
      // First try title with format: "Title (YYYY)"
      const titleMatch = text.match(/.*?\((\d{4})\)/);
      if (titleMatch) {
        return parseInt(titleMatch[1]);
      }
      
      // Try to find a year anywhere in the text
      const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/);
      if (yearMatch) {
        return parseInt(yearMatch[1]);
      }
      
      return 9999; // Default value for items without year
    };

    items.sort((a, b) => {
      const aTitle = a.querySelector('.item-title').textContent;
      const bTitle = b.querySelector('.item-title').textContent;
      const aDetails = a.querySelector('.item-details').textContent;
      const bDetails = b.querySelector('.item-details').textContent;
      const aFullText = aTitle + " " + aDetails;
      const bFullText = aTitle + " " + bDetails;
      
      switch(criteria) {
        case 'year':
          const yearA = extractYear(aFullText);
          const yearB = extractYear(bFullText);
          // Items without years go to the end
          if (yearA === 9999 && yearB === 9999) {
            return aTitle.localeCompare(bTitle); // Alphabetical if no years
          }
          if (yearA === 9999) return 1;
          if (yearB === 9999) return -1;
          return yearA - yearB;
          
        case 'runtime':
          const runtimeA = extractRuntime(aFullText);
          const runtimeB = extractRuntime(bFullText);
          // Items without runtime go to the end
          if (runtimeA === 9999 && runtimeB === 9999) {
            return aTitle.localeCompare(bTitle); // Alphabetical if no runtime
          }
          if (runtimeA === 9999) return 1;
          if (runtimeB === 9999) return -1;
          return runtimeA - runtimeB;

        case 'time to beat':
          const getTTB = (text) => {
            // Look for "Time to Beat: Xh Ymin" format
            const ttbMatch = text.match(/Time to [Bb]eat:?\s*(?:(\d+)\s*h(?:ours?)?)?[:\s]*(?:(\d+)\s*m(?:in(?:utes?)?)?)?/);
            if (ttbMatch) {
              const hours = ttbMatch[1] ? parseInt(ttbMatch[1]) : 0;
              const minutes = ttbMatch[2] ? parseInt(ttbMatch[2]) : 0;
              return hours * 60 + minutes;
            }
            
            // Try alternate formats
            const hourMinFormat = text.match(/TIME TO BEAT:?\s*(?:(\d+)\s*h(?:ours?)?)?[:\s]*(?:(\d+)\s*m(?:in(?:utes?)?)?)?/i);
            if (hourMinFormat) {
              const hours = hourMinFormat[1] ? parseInt(hourMinFormat[1]) : 0;
              const minutes = hourMinFormat[2] ? parseInt(hourMinFormat[2]) : 0;
              return hours * 60 + minutes;
            }
            
            // Look for just hours or just minutes
            const hoursOnly = text.match(/Time to [Bb]eat:?\s*(\d+)\s*h/);
            if (hoursOnly) {
              return parseInt(hoursOnly[1]) * 60;
            }
            
            const minutesOnly = text.match(/Time to [Bb]eat:?\s*(\d+)\s*m/);
            if (minutesOnly) {
              return parseInt(minutesOnly[1]);
            }
            
            // Try to find a plain number near "Time to Beat"
            const plainNumber = text.match(/Time to [Bb]eat:?\s*(\d+)/);
            if (plainNumber) {
              // Assume hours if number is small, minutes otherwise
              const num = parseInt(plainNumber[1]);
              return num < 10 ? num * 60 : num;
            }
            
            return 9999; // Default for items without TTB
          };
          
          const ttbA = getTTB(aFullText);
          const ttbB = getTTB(bFullText);
          if (ttbA === 9999 && ttbB === 9999) {
            return aTitle.localeCompare(bTitle);
          }
          if (ttbA === 9999) return 1;
          if (ttbB === 9999) return -1;
          return ttbA - ttbB;
          
        case 'cost':
          const getCostValue = (text) => {
            // Look for cost with dollar sign
            const matchWithSymbol = text.match(/Cost:?\s*\$?(\d+(?:\.\d+)?)/i);
            if (matchWithSymbol) {
              return parseFloat(matchWithSymbol[1]);
            }
            
            // Look for just a number after "Cost:"
            const plainMatch = text.match(/Cost:?\s*(\d+(?:\.\d+)?)/i);
            if (plainMatch) {
              return parseFloat(plainMatch[1]);
            }
            
            return 0; // Default for items without cost
          };
          
          const costA = getCostValue(aFullText);
          const costB = getCostValue(bFullText);
          if (costA === 0 && costB === 0) {
            return aTitle.localeCompare(bTitle);
          }
          if (costA === 0) return 1;
          if (costB === 0) return -1;
          return costA - costB;
          
        case 'copies':
          const getCopiesValue = (text) => {
            // First check for "Copies: X" format
            const copiesMatch = text.match(/Copies:?\s*(\d+)/i);
            if (copiesMatch) {
              return parseInt(copiesMatch[1]);
            }
            
            // Count 🟢 indicators (each represents a copy)
            const greenDots = (text.match(/🟢/g) || []).length;
            if (greenDots > 0) {
              return greenDots;
            }
            
            return 0; // Default for items without copies
          };
          
          const copiesA = getCopiesValue(aFullText);
          const copiesB = getCopiesValue(bFullText);
          if (copiesA === 0 && copiesB === 0) {
            return aTitle.localeCompare(bTitle);
          }
          if (copiesA === 0) return 1;
          if (copiesB === 0) return -1;
          return copiesA - copiesB;
          
        default:
          return aTitle.localeCompare(bTitle);
      }
    });

    // Apply direction
    if (currentSort.direction === 'desc') {
      visibleItems.reverse();
    }

    // Clear and re-append sorted items
    items.forEach(item => item.remove());
    visibleItems.forEach(item => container.appendChild(item));
    items.filter(item => !visibleItems.includes(item))
         .forEach(item => container.appendChild(item));

    // Update button text
    const arrow = currentSort.direction === 'asc' ? '↑' : '↓';
    sortBtn.textContent = `Sort By: ${criteria} ${arrow}`;
  }

  // Function to check if any items have watched-related data
  function checkForWatchedData(data) {
    return data.some(item => 
      item['LAST WATCHED'] !== undefined || 
      item['WATCHED'] !== undefined || 
      item['Watched'] !== undefined ||
      item['watched'] !== undefined ||
      item['TIMES SEEN'] !== undefined
    );
  }

  // Function to check if any items have completion data
  function checkForCompletedData(data) {
    return data.some(item => 
      (item['COMPLETED?']?.includes('🏆') || item['completed']?.includes('🏆'))
    );
  }

  // Function to check for seasonal status
  function checkForSeasonalData(data) {
    return data.some(item => item.STATUS?.includes('🟣'));
  }

  // Add filter state tracking
  let currentGenre = 'all';
  let currentSort = { field: null, direction: 'asc' };

  function applyAllFilters() {
    const items = document.querySelectorAll('.item-row');
    items.forEach(item => {
      // Start with item visible
      let shouldShow = true;

      // Apply genre filter
      if (currentGenre !== 'all') {
        const detailsElement = item.querySelector('.item-details');
        const genreText = detailsElement?.textContent || '';
        shouldShow = shouldShow && genreText.toLowerCase().includes(currentGenre.toLowerCase());
      }

      // Apply status filter
      const titleElement = item.querySelector('.item-title');
      const detailsElement = item.querySelector('.item-details');
      const hasActiveStatus = titleElement?.textContent.includes('🟢') || false;
      const hasSeasonalStatus = titleElement?.textContent.includes('🟣') || false;
      const hasWatchedStatus = detailsElement?.textContent.includes('👀') || false;
      const hasWatchedIndicator = 
        hasWatchedStatus || 
        titleElement?.textContent.includes('👀') || 
        detailsElement?.textContent.includes('TIMES SEEN') ||
        detailsElement?.textContent.includes('WATCHED') ||
        detailsElement?.textContent.includes('LAST WATCHED');
      const hasCompletedStatus = detailsElement?.textContent.includes('🏆') || false;

      switch(currentFilter) {
        case 'active':
          shouldShow = shouldShow && hasActiveStatus;
          break;
        case 'seasonal':
          shouldShow = shouldShow && hasSeasonalStatus;
          break;
        case 'inactive':
          shouldShow = shouldShow && !hasActiveStatus;
          break;
        case 'completed':
          shouldShow = shouldShow && hasCompletedStatus;
          break;
        case 'watched':
          shouldShow = shouldShow && hasWatchedIndicator;
          break;
        case 'unwatched':
          shouldShow = shouldShow && !hasWatchedIndicator;
          break;
      }

      item.style.display = shouldShow ? '' : 'none';
    });

    // Re-apply current sort if exists
    if (currentSort.field) {
      sortItems(currentSort.field, true);
    }
  }

  filterBtn.addEventListener('click', () => {
    const container = document.getElementById('data-container');
    const items = Array.from(container.getElementsByClassName('item-row'));
    const isSinglePlayerPage = window.location.pathname.includes('singleplayer.html');

    // Cycle through filter states based on data available
    switch(currentFilter) {
      case 'all':
        currentFilter = 'active';
        filterBtn.textContent = 'Status: Active 🟢';
        break;
      case 'active':
        if (isSinglePlayerPage && hasSeasonalData) {
          currentFilter = 'seasonal';
          filterBtn.textContent = 'Status: Seasonal 🟣';
        } else {
          currentFilter = 'inactive';
          filterBtn.textContent = 'Status: Inactive';
        }
        break;
      case 'seasonal':
        currentFilter = 'inactive';
        filterBtn.textContent = 'Status: Inactive';
        break;
      case 'inactive':
        // Only add watched state if we have watched data
        if (hasWatchedData) {
          currentFilter = 'watched';
          filterBtn.textContent = 'Status: Watched 👀';
        } else if (hasCompletedData) {
          currentFilter = 'completed';
          filterBtn.textContent = 'Status: Completed 🏆';
        } else {
          currentFilter = 'all';
          filterBtn.textContent = 'Status: All';
        }
        break;
      case 'watched':
        currentFilter = 'unwatched';
        filterBtn.textContent = 'Status: Unwatched';
        break;
      case 'unwatched':
        if (hasCompletedData) {
          currentFilter = 'completed';
          filterBtn.textContent = 'Status: Completed 🏆';
        } else {
          currentFilter = 'all';
          filterBtn.textContent = 'Status: All';
        }
        break;
      case 'completed':
        currentFilter = 'all';
        filterBtn.textContent = 'Status: All';
        break;
      default:
        currentFilter = 'all';
        filterBtn.textContent = 'Status: All';
    }

    applyAllFilters();
  });

  const dataFile = getDataFile();
  const containerId = 'data-container';

  loadItems(dataFile, containerId);

  function getDataFile() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '.json');
    return `../../data/${filename}`;
  }

  function loadItems(file, containerId) {
    fetch(file)
      .then(response => response.json())
      .then(data => {
        // Check if data has LAST WATCHED entries
        hasWatchedData = Array.isArray(data) && checkForWatchedData(data);
        hasCompletedData = Array.isArray(data) && checkForCompletedData(data);
        hasSeasonalData = Array.isArray(data) && checkForSeasonalData(data);
        
        const container = document.getElementById(containerId);
        const isYoutubePage = window.location.pathname.includes('youtube.html');

        // Helper to get the title from either key
        function getTitle(item) {
          return item.text || item.TITLE || item.Title || 'No Title';
        }
        
        // NEW: For ALL data-pages, sort the items alphabetically by title.
        if (Array.isArray(data)) {
          data.sort((a, b) => getTitle(a).localeCompare(getTitle(b)));
        } else if (typeof data === 'object' && data !== null) {
          Object.keys(data).forEach(key => {
            if (Array.isArray(data[key])) {
              data[key].sort((a, b) => getTitle(a).localeCompare(getTitle(b)));
            }
          });
        }
        // End NEW sorting block

        let processedData = data;
        if (isYoutubePage) {
          // Group items by channel
          processedData = data.reduce((acc, item) => {
            const channel = item.channel || 'Unknown Channel';
            if (!acc[channel]) {
              acc[channel] = [];
            }
            acc[channel].push(item);
            return acc;
          }, {});
        }

        // Process each item
        function processItem(item) {
          const itemDiv = document.createElement('div');
          itemDiv.classList.add('item-row');

          // Add mouseover event to show background image
          itemDiv.addEventListener('mouseover', function() {
            if (!this.classList.contains('expanded')) {
              let backgroundImage = '';
              if (item.imageUrl) {
                backgroundImage = item.imageUrl;
              } else if (item.image) {
                if (Array.isArray(item.image)) {
                  backgroundImage = '../' + item.image[0];
                } else {
                  backgroundImage = '../' + item.image;
                }
              }
              if (backgroundImage) {
                this.style.backgroundImage = `url('${backgroundImage}')`;
              }
            }
          });

          // Add mouseout event to remove background image
          itemDiv.addEventListener('mouseout', function() {
            if (!this.classList.contains('expanded')) {
              this.style.backgroundImage = '';
            }
          });

          // Use getTitle() to set the title text interchangeably
          let itemText = getTitle(item);
          let indicator = '';

          // If status is 🟢 or 🟣 then add the indicator
          if (item.status === '🟢' || item.STATUS === '🟢') {
            indicator += ' 🟢';
          } else if (item.status === '🟣' || item.STATUS === '🟣') {
            indicator += ' 🟣';
          }

          // Add copies indicators
          if (item.copies !== undefined) {
            indicator += ' 🟢'.repeat(item.copies);
          }

          // If COMPLETED? or completed contains 🏆 then add it
          if ((item['COMPLETED?']?.includes('🏆')) || (item['completed']?.includes('🏆'))) {
            indicator += ' 🏆';
          }

          // If COMPLETED? contains a ✔ then add a ✔ indicator
          if (item['COMPLETED?'] && item['COMPLETED?'].includes('✔')) {
            indicator += ' ✔';
          }
          // If LAST WATCHED has data, extract number and add that many 👀
          if (item['LAST WATCHED']) {
            const match = item['LAST WATCHED'].match(/\d+/);
            if (match) {
              const seasonCount = parseInt(match[0], 10);
              indicator += ' ' + '👀'.repeat(seasonCount);
            }
          }
          
          // Use "link", "LINK", or "Link" property to generate the anchor
          let linkVal = item.link || item.LINK || item.Link || '';
          let itemLink = linkVal 
            ? `<a class="item-title-link" data-href="${linkVal}" target="_blank">${itemText}${indicator}</a>` 
            : `${itemText}${indicator}`;

          // Build details HTML with property checks
          let detailsHTML = '';

          function addDetail(label, value) {
            if (value && value.trim() !== '') {
              detailsHTML += `<p><strong>${label}:</strong> ${value}</p>`;
            }
          }

          let genreValue = item.genre || item.GENRE || '';
          if (typeof genreValue === 'string') {
            genreValue = genreValue.split(',').map(genre => genre.trim());
          }
          addDetail('Genre', Array.isArray(genreValue) ? genreValue.join(', ') : genreValue);
          addDetail('Mode', item.mode);
          addDetail('Time per match', item['Time per match']);
          addDetail('Playability', item.playability);
          addDetail('Console', item.console || item.CONSOLE);
          addDetail('Time to beat', item['time to beat'] || item["TIME TO BEAT"]);
          addDetail('Completed', item.completed || item["COMPLETED?"]);
          if ((item.description && item.description.trim() !== '') || (item.DESCRIPTION && item.DESCRIPTION.trim() !== '')) {
            const desc = item.description || item.DESCRIPTION;
            addDetail('Description', desc);
          }
          addDetail('Cost', item.cost);
          addDetail('After Spin', item['after spin']);
          addDetail('Series Length', item['Series Length']);
          addDetail('Last Watched', item['LAST WATCHED']);
          addDetail('Ownership', item['OwnerShip']);
          addDetail('Runtime', item['RUNTIME']);
          addDetail('Max Episodes', item['Max Episodes']);
          addDetail('Game', item.game);
          addDetail('Watched', item.WATCHED);
          addDetail('Channel', item.CHANNEL);
          addDetail('Times Seen', item['TIMES SEEN']);
          addDetail('Episodes', item.EPISODES);
          addDetail('Console', item.CONSOLE);
          addDetail('Platform', item.PLATFORM);

          itemDiv.innerHTML = `
            <div class="item-title">${itemLink}</div>
            <div class="item-details">${detailsHTML}</div>
          `;

          container.appendChild(itemDiv);

          // Updated click event: collapse other items and toggle expansion.
          itemDiv.addEventListener('click', function(event) {
            // Don't collapse when clicking on links or details
            if (event.target.closest('.item-title-link') || 
                event.target.closest('.item-details')) {
              event.stopPropagation();
              return;
            }
            
            // If click is on the collapse corner, process it but don't return
            if (event.target.closest('.collapse-corner')) {
              event.stopPropagation();
              this.classList.remove('expanded');
              const collapseCorner = this.querySelector('.collapse-corner');
              if (collapseCorner) {
                collapseCorner.remove();
              }
              // Reset links and styling
              const currentLink = this.querySelector('a.item-title-link');
              if (currentLink) {
                currentLink.removeAttribute('href');
                currentLink.style.color = '';
              }
              // Reset background
              this.style.backgroundImage = '';
              this.style.color = '';
              this.style.textShadow = '';
              return;
            }
            
            event.stopPropagation();
            const allItems = container.querySelectorAll('.item-row');
            
            // Remove collapse corner from all items
            document.querySelectorAll('.collapse-corner').forEach(corner => {
              corner.remove();
            });
            
            allItems.forEach(el => {
              if (el !== this) {
                el.classList.remove('expanded');
                el.style.backgroundImage = ''; // Remove background image from other items
                // Disable links in closed items and reset styling
                const link = el.querySelector('a.item-title-link');
                if (link) {
                  link.removeAttribute('href');
                  link.style.color = '';
                }
              }
            });
            
            this.classList.toggle('expanded');
            
            // If expanded, add collapse corner, enable link and style it
            if (this.classList.contains('expanded')) {
              // Add collapse corner
              const collapseCorner = document.createElement('div');
              collapseCorner.className = 'collapse-corner';
              collapseCorner.innerHTML = '↕';
              collapseCorner.title = 'Click to collapse';
              
              // Insert the button right after the item-title div to ensure it's at the top
              const titleDiv = this.querySelector('.item-title');
              if (titleDiv && titleDiv.nextSibling) {
                this.insertBefore(collapseCorner, titleDiv.nextSibling);
              } else {
                // Fallback - just append it
                this.appendChild(collapseCorner);
              }
              
              // Make sure the button is positioned properly
              collapseCorner.style.position = 'absolute';
              collapseCorner.style.top = '10px';
              collapseCorner.style.right = '10px';
              collapseCorner.style.zIndex = '1000';
              
              // Enable link
              const currentLink = this.querySelector('a.item-title-link');
              if (currentLink) {
                currentLink.setAttribute('href', currentLink.dataset.href);
                currentLink.style.color = 'lightgreen';
              }
              
              // Set background image using imageUrl or first image from array
              let backgroundImage = '';
              if (item.imageUrl) {
                backgroundImage = item.imageUrl;
              } else if (item.image) {
                if (Array.isArray(item.image)) {
                  backgroundImage = '../' + item.image[0];
                } else {
                  backgroundImage = '../' + item.image;
                }
              }

              if (backgroundImage) {
                this.style.backgroundImage = `url('${backgroundImage}')`;
                this.style.backgroundSize = 'cover';
                this.style.backgroundPosition = 'center';
                this.style.backgroundRepeat = 'no-repeat';
                this.style.color = 'white';
                this.style.textShadow = '2px 2px 4px #000000';
              }

              // Add scroll listener for expanded div
              let startY = 0;
              let bgPos = 0;
              
              const handleScroll = (e) => {
                const delta = e.deltaY;
                bgPos = Math.max(0, Math.min(100, bgPos + (delta / 10)));
                this.style.backgroundPosition = `center ${bgPos}%`;
                e.preventDefault();
              };
              
              this.addEventListener('wheel', handleScroll, { passive: false });
              
              // Remove scroll listener when collapsed
              this.addEventListener('click', () => {
                if (!this.classList.contains('expanded')) {
                  this.removeEventListener('wheel', handleScroll);
                }
              }, { once: true });
            } else {
              // Reset styling when not expanded
              this.style.backgroundImage = '';
              this.style.color = '';
              this.style.textShadow = '';
            }
          });
          return itemDiv;
        }

        // Remove the simplified processItem function that didn't properly include details
        if (Array.isArray(processedData)) {
          processedData.forEach(item => {
            processItem(item);
          });
        } else if (typeof processedData === 'object' && processedData !== null) {
          // Handle YouTube page with channels
          Object.keys(processedData).forEach(key => {
            const channelSection = document.createElement('div');
            channelSection.classList.add('channel-section');
            channelSection.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

            // Add collapsible functionality
            const channelHeader = document.createElement('h2');
            channelHeader.textContent = key;
            channelHeader.classList.add('collapsible');
            channelSection.appendChild(channelHeader);

            const channelContent = document.createElement('div');
            channelContent.classList.add('content');
            channelContent.style.display = 'none'; // Initially hide the content

            processedData[key].forEach(item => {
              const itemDiv = processItem(item);
              channelContent.appendChild(itemDiv);
            });

            channelSection.appendChild(channelContent);
            container.appendChild(channelSection);

            // Add event listener to toggle collapsible content
            channelHeader.addEventListener('click', function() {
              this.classList.toggle('active');
              const content = this.nextElementSibling;
              if (content.style.display === 'block') {
                content.style.display = 'none';
              } else {
                content.style.display = 'block';
              }
            });
          });
        }

        // Populate genre dropdown
        populateGenreDropdown(data);

        // Populate sort options
        populateSortOptions(data);

        // Apply initial filters and sort
        applyAllFilters();
      })
      .catch(error => console.error('Error loading data:', error));
  }
});
