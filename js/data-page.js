document.addEventListener('DOMContentLoaded', () => {
  // Initialize robust data loader
  const dataLoader = new window.RobustDataLoader();
  
  // Add navbar scroll behavior
  let lastScrollTop = 0;
  const navbar = document.getElementById('navbar');
    // No save status indicator needed
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }
    lastScrollTop = scrollTop;
  });

  // Add filter button to navbar with smaller size
  const filterBtn = document.createElement('button');
  filterBtn.className = 'filter-btn';
  filterBtn.textContent = 'Status: All';
  filterBtn.style.padding = '3px 6px';  // Smaller padding
  filterBtn.style.fontSize = '0.85em';  // Smaller font
  filterBtn.style.height = '24px';     // Explicit height
  filterBtn.style.minWidth = '80px';   // Minimum width
  navbar.appendChild(filterBtn);
  // After creating the filter button, add the genre filter with smaller size
  const genreFilter = document.createElement('div');
  genreFilter.className = 'genre-filter';
  
  const genreBtn = document.createElement('button');
  genreBtn.className = 'genre-btn';
  genreBtn.textContent = 'Genre: All';
  genreBtn.style.padding = '3px 6px';  // Smaller padding
  genreBtn.style.fontSize = '0.85em';  // Smaller font
  genreBtn.style.height = '24px';     // Explicit height
  genreBtn.style.minWidth = '80px';   // Minimum width
  
  const genreDropdown = document.createElement('div');
  genreDropdown.className = 'genre-dropdown';
  
  genreFilter.appendChild(genreBtn);
  genreFilter.appendChild(genreDropdown);
  navbar.appendChild(genreFilter);

  // Add sort filter with smaller size
  const sortFilter = document.createElement('div');
  sortFilter.className = 'sort-filter';
  
  const sortBtn = document.createElement('button');
  sortBtn.className = 'sort-btn';
  sortBtn.textContent = 'Sort By: None';
  sortBtn.style.padding = '3px 6px';  // Smaller padding
  sortBtn.style.fontSize = '0.85em';  // Smaller font
  sortBtn.style.height = '24px';     // Explicit height
  sortBtn.style.minWidth = '100px';   // Minimum width
  sortBtn.style.display = 'none';     // Initially hidden
  
  const sortDropdown = document.createElement('div');
  sortDropdown.className = 'sort-dropdown';
  
  sortFilter.appendChild(sortBtn);
  sortFilter.appendChild(sortDropdown);
  navbar.appendChild(sortFilter);

  // Move search field to the right of the genre filter with smaller size
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search...';
  searchInput.className = 'navbar-search';
  searchInput.style.margin = '0 5px'; // Reduced margin
  searchInput.style.padding = '1px 4px'; // Smaller padding
  searchInput.style.borderRadius = '6px'; // Smaller border radius
  searchInput.style.border = '1px solid #4682B4'; // Thinner border
  searchInput.style.backgroundColor = '#e0e0e0';
  searchInput.style.fontSize = '0.75em'; // Even smaller font
  searchInput.style.minWidth = '15px'; // Smaller minimum width
  searchInput.style.width = '60px'; // Fixed smaller width
  searchInput.style.height = '16px'; // Reduced height
  searchInput.style.transition = 'all 0.3s ease, width 0.3s ease, border-color 0.5s ease, box-shadow 0.3s ease';
  searchInput.style.color = '#333';
  
  // Add focus and input event styles
  searchInput.addEventListener('focus', function() {
    this.style.boxShadow = '0 0 2px #4682B4, 0 0 3px #4682B4'; // Smaller shadow
    this.style.borderColor = '#6CB4EE';
    this.style.width = '100px'; // Expand width when focused
  });
  
  searchInput.addEventListener('blur', function() {
    if (this.value.trim() === '') {
      this.style.boxShadow = 'none';
      this.style.borderColor = '#4682B4';
      this.style.width = '60px'; // Revert to smaller width when not in use and empty
    }
  });
  
  // Make border shine when typing
  searchInput.addEventListener('input', function() {
    if (this.value.trim() !== '') {
      this.style.boxShadow = '0 0 2px #4682B4, 0 0 3px #4682B4'; // Smaller shadow
      this.style.borderColor = '#87CEFA';
      this.style.width = '100px'; // Keep expanded while text is present    } else {
      this.style.boxShadow = 'none';
      this.style.borderColor = '#4682B4';
      // Don't shrink while focused
      if (document.activeElement !== this) {
        this.style.width = '60px';
      }
    }
  });
  
  // Insert after genreFilter
  navbar.insertBefore(searchInput, genreFilter.nextSibling);

  // Add data source status indicator
  const dataSourceIndicator = document.createElement('div');
  dataSourceIndicator.id = 'data-source-indicator';
  dataSourceIndicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.7em;
    font-weight: bold;
    color: white;
    z-index: 1001;
    transition: all 0.3s ease;
    cursor: pointer;
    display: none;
  `;
  dataSourceIndicator.title = 'Click for data source details';
  document.body.appendChild(dataSourceIndicator);

  // Listen for data source status updates
  document.addEventListener('dataSourceStatusUpdate', (event) => {
    updateDataSourceIndicator(event.detail);
  });

  function updateDataSourceIndicator(status) {
    const colors = {
      connected: '#4CAF50',
      degraded: '#FF9800', 
      error: '#F44336',
      unknown: '#9E9E9E'
    };

    const labels = {
      postgres: 'DB',
      server: 'API', 
      jsonFiles: 'Files',
      cache: 'Cache'
    };

    dataSourceIndicator.style.backgroundColor = colors[status.status] || colors.unknown;
    dataSourceIndicator.textContent = `${labels[status.source] || status.source}: ${status.status.toUpperCase()}`;
    dataSourceIndicator.style.display = 'block';

    // Show details on click
    dataSourceIndicator.onclick = () => {
      const loaderStatus = dataLoader.getStatus();
      console.log('Data Loader Status:', loaderStatus);
      
      const details = `
Data Sources Status:
• PostgreSQL: ${loaderStatus.connectionStatus.postgres}
• Server API: ${loaderStatus.connectionStatus.server}  
• JSON Files: ${loaderStatus.connectionStatus.jsonFiles}

Usage Statistics:
• Total Requests: ${loaderStatus.metrics.totalRequests}
• Success Rate: ${Math.round((loaderStatus.metrics.successfulRequests / loaderStatus.metrics.totalRequests) * 100)}%
• Avg Response Time: ${Math.round(loaderStatus.metrics.avgResponseTime)}ms

Cache: ${loaderStatus.cacheSize} items stored
      `.trim();
      
      alert(details);
    };
  }

  let currentFilter = 'all'; // Possible values: 'all', 'active', 'inactive', 'watched', 'ergo'
  let hasWatchedData = false;
  let hasCompletedData = false;
  let hasSeasonalData = false;
  let hasErgoContent = false; // Track if ERGO content exists

  // Create or get sidebar for the Collapse All button
  let sidebar = document.getElementById('sidebar');
  if (!sidebar) {
    sidebar = document.createElement('div');
    sidebar.id = 'sidebar';
    sidebar.style.position = 'fixed';
    sidebar.style.right = '10px';
    sidebar.style.top = '50%';
    sidebar.style.transform = 'translateY(-50%)';
    sidebar.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    sidebar.style.padding = '10px';
    sidebar.style.borderRadius = '10px';
    sidebar.style.zIndex = '999';
    sidebar.style.display = 'flex';
    sidebar.style.flexDirection = 'column';
    sidebar.style.gap = '10px';
    document.body.appendChild(sidebar);
  }

  // Add Collapse All button to sidebar
  const collapseAllBtn = document.createElement('button');
  collapseAllBtn.className = 'filter-btn collapse-all-btn';
  collapseAllBtn.textContent = 'Collapse All';
  collapseAllBtn.style.display = 'none'; // Initially hidden
  sidebar.appendChild(collapseAllBtn);

  // Event listener for Collapse All button
  collapseAllBtn.addEventListener('click', () => {
    const expandedItems = document.querySelectorAll('.item-row.expanded:not(.in-multi-container)');
    expandedItems.forEach(item => {
      // Use the collapseItem function defined in the processItem scope
      // Since we can't access it directly, we'll simulate its behavior
      item.classList.remove('expanded');
      item.classList.remove('multi-expanded-2');
      item.classList.remove('multi-expanded-3');
      item.classList.remove('multi-expanded-4');
      
      // Remove collapse corner
      const collapseCorner = item.querySelector('.collapse-corner');
      if (collapseCorner) {
        collapseCorner.remove();
      }
      
      // Reset link and styling
      const currentLink = item.querySelector('a.item-title-link');
      if (currentLink) {
        currentLink.removeAttribute('href');
        currentLink.style.color = '';
      }
      
      // Reset background and styling
      item.style.backgroundImage = '';
      item.style.color = '';
      item.style.textShadow = '';
        // Restore original details view
      const detailsDiv = item.querySelector('.item-details');
      if (detailsDiv && typeof item._originalDetailsHTML === 'string') {
        detailsDiv.innerHTML = item._originalDetailsHTML;
      }
      
      // Remove wheel event listener
      item.onwheel = null;
    });
    
    // Hide the multi-expanded container
    const multiContainer = document.getElementById('multi-expanded-container');
    if (multiContainer) {
      multiContainer.style.display = 'none';
      multiContainer.innerHTML = '';
    }
    
    // Hide the Collapse All button since nothing is expanded now
    collapseAllBtn.style.display = 'none';
  });
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!genreFilter.contains(e.target)) {
      genreDropdown.classList.remove('show');
    }
    if (!sortFilter.contains(e.target)) {
      sortDropdown.classList.remove('show');
    }
  });

  // Prevent dropdown from closing when clicking inside it
  genreDropdown.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  });
  genreDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  sortDropdown.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  });
  sortDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Toggle dropdown
  genreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    genreDropdown.classList.toggle('show');
  });

  sortBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sortDropdown.classList.toggle('show');
  });
  function populateGenreDropdown(data) {
    // Genre filtering disabled - always hide genre button
    genreBtn.style.display = 'none';
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
    };    items.sort((a, b) => {
      const aTitle = a.querySelector('.item-title').textContent;
      const bTitle = b.querySelector('.item-title').textContent;
      const aDetails = a.querySelector('.item-details').textContent;
      const bDetails = b.querySelector('.item-details').textContent;
      const aFullText = aTitle + " " + aDetails;
      const bFullText = bTitle + " " + bDetails;
      
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

      // Check for ERGOarena or ERGOvillians content
      const titleElement = item.querySelector('.item-title');
      const detailsElement = item.querySelector('.item-details');
      const titleText = titleElement?.textContent || '';
      const detailsText = detailsElement?.textContent || '';
      
      const hasErgoContent = 
        detailsText.includes('ERGOarena') || 
        detailsText.includes('ERGOvillians') ||
        titleText.includes('ERGO') ||
        detailsText.includes('ERGO');
      
      // Apply status filter
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
      const hasOwnedStatus = detailsElement?.textContent.includes('Physical') || 
                             detailsElement?.textContent.includes('Movies Anywhere') || 
                             detailsElement?.textContent.includes('Owned');

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
        case 'owned':
          shouldShow = shouldShow && hasOwnedStatus;
          break;
        case 'ergo':
          shouldShow = shouldShow && hasErgoContent;
          break;
        case 'all':
          // For 'all' filter, hide ERGO content by default
          shouldShow = shouldShow && !hasErgoContent;
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
    
    // Check if we have ERGO content in this page
    hasErgoContent = items.some(item => {
      const detailsText = item.querySelector('.item-details')?.textContent || '';
      const titleText = item.querySelector('.item-title')?.textContent || '';
      return detailsText.includes('ERGOarena') || 
             detailsText.includes('ERGOvillians') ||
             titleText.includes('ERGO') ||
             detailsText.includes('ERGO');
    });

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
        // Check if we have ERGO content, add it to the cycle
        if (hasErgoContent) {
          currentFilter = 'ergo';
          filterBtn.textContent = 'Status: Villians 😈';
        } else if (hasWatchedData) {
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
      case 'ergo':
        // If we have watched data, go there next
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
        } else if (items.some(item => item.querySelector('.item-details')?.textContent.includes('Physical') || 
                                       item.querySelector('.item-details')?.textContent.includes('Movies Anywhere') || 
                                       item.querySelector('.item-details')?.textContent.includes('Owned'))) {
          currentFilter = 'owned';
          filterBtn.textContent = 'Status: Owned 💲';
        } else {
          currentFilter = 'all';
          filterBtn.textContent = 'Status: All';
        }
        break;
      case 'completed':
        if (items.some(item => item.querySelector('.item-details')?.textContent.includes('Physical') || 
                               item.querySelector('.item-details')?.textContent.includes('Movies Anywhere') || 
                               item.querySelector('.item-details')?.textContent.includes('Owned'))) {
          currentFilter = 'owned';
          filterBtn.textContent = 'Status: Owned 💲';
        } else {
          currentFilter = 'all';
          filterBtn.textContent = 'Status: All';
        }
        break;
      case 'owned':
        currentFilter = 'all';
        filterBtn.textContent = 'Status: All';
        break;
      default:
        currentFilter = 'all';
        filterBtn.textContent = 'Status: All';
    }

    applyAllFilters();
  });

  // Improved search filter logic: always filter from all items, not just visible ones
  let allItemRows = [];

  function refreshAllItemRows() {
    // Always get the full set of .item-row elements from the DOM
    allItemRows = Array.from(document.querySelectorAll('.item-row'));
  }

  function refreshSearchFilter() {
    try {
      const query = searchInput.value.trim().toLowerCase();
      const container = document.getElementById('data-container');
      
      // Make sure we have all items to filter from
      if (allItemRows.length === 0) {
        refreshAllItemRows();
      }
      
      // Always filter from the full set
      const items = allItemRows;
      
      if (!query) {
        // If search is empty, restore original order in alphabetical order
        
        // First, show all items
        items.forEach(item => {
          item.style.display = '';
        });
        
        // Sort items alphabetically by their title text
        const sortedItems = [...items].sort((a, b) => {
          const aTitle = a.querySelector('.item-title')?.textContent.toLowerCase() || '';
          const bTitle = b.querySelector('.item-title')?.textContent.toLowerCase() || '';
          return aTitle.localeCompare(bTitle);
        });
        
        // Remove all items and add them back in sorted order
        items.forEach(item => {
          try {
            if (container.contains(item)) {
              container.removeChild(item);
            }
          } catch (err) {
            console.log('Error removing item:', err);
          }
        });
        
        // Re-append in alphabetical order
        sortedItems.forEach(item => {
          container.appendChild(item);
        });
        
        // Apply any active filters
        applyAllFilters();
        return;
      }
      
      // Separate items into title matches and detail matches
      const titleMatches = [];
      const detailMatches = [];
      const noMatches = [];
      
      items.forEach(item => {
        const title = item.querySelector('.item-title')?.textContent.toLowerCase() || '';
        const details = item.querySelector('.item-details')?.textContent.toLowerCase() || '';
        
        if (title.includes(query)) {
          titleMatches.push(item);
        } else if (details.includes(query)) {
          detailMatches.push(item);
        } else {
          noMatches.push(item);
        }
      });
      
      // Clone the DOM elements before manipulation to prevent issues
      // when removing and re-adding elements
      const allMatchingItems = [...titleMatches, ...detailMatches];
      const allFilteredItems = [...titleMatches, ...detailMatches, ...noMatches];
      
      // First make sure all items are properly hidden/shown
      allFilteredItems.forEach(item => {
        if (allMatchingItems.includes(item)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
      
      // Now reorder the visible items
      titleMatches.forEach(item => container.appendChild(item));
      detailMatches.forEach(item => container.appendChild(item));
      
    } catch (err) {
      console.error('Error in refreshSearchFilter:', err);
    }
  }

  // Add event listener for input to refresh filter on every keystroke
  searchInput.addEventListener('input', function() {
    refreshAllItemRows();
    refreshSearchFilter();
  });
  
  // Add event listeners for keyup and keydown to catch all keyboard interactions
  searchInput.addEventListener('keyup', function() {
    refreshAllItemRows();
    refreshSearchFilter();
  });
  
  searchInput.addEventListener('keydown', function() {
    // Use setTimeout to allow the input value to update before filtering
    setTimeout(() => {
      refreshAllItemRows();
      refreshSearchFilter();
    }, 0);
  });
  
  const dataFile = getDataFile();
  const containerId = 'data-container';

  loadItems(dataFile, containerId);

  function getDataFile() {
    const path = window.location.pathname;
    const category = path.split('/').pop().replace('.html', '');
    // Use API endpoint instead of direct file access
    return `/api/data/${category}`;
  }
  function loadItems(file, containerId) {
    // Get category from the file path for robust loading
    const category = file.split('/').pop().replace('.json', '').split('?')[0];
    
    // Use robust data loader instead of direct fetch
    dataLoader.loadData(category, {
      timeout: 15000,
      retryOnFailure: true,
      preferredSource: 'postgres'
    })
      .then(data => {
        console.log(`Successfully loaded data with ${Array.isArray(data) ? data.length : 0} items`);
        
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
            const channel = item.channel || item.CHANNEL || 'Unknown Channel';
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

          // Extract YouTube video ID and thumbnail URL if available
          let backgroundImage = '';
          
          if (item.imageUrl && item.imageUrl.trim() !== '') {
            // Use existing image URL if present
            backgroundImage = item.imageUrl;
          } else if (item.image) {
            // Handle both URLs and relative paths in the image key
            let imageSource = '';
            if (Array.isArray(item.image)) {
              imageSource = item.image[0];
            } else {
              imageSource = item.image;
            }
            
            if (imageSource) {
              if (imageSource.startsWith('http')) {
                backgroundImage = imageSource; // It's a URL
              } else {
                backgroundImage = '../' + imageSource; // It's a relative path
              }
            }
          } else {
            // Check for YouTube link and generate thumbnail
            const linkVal = item.link || item.LINK || item.Link || '';
            if (linkVal && linkVal.includes('youtube.com') || linkVal.includes('youtu.be')) {
              // Extract video ID from YouTube URL
              let videoId = '';
              if (linkVal.includes('youtube.com/watch?v=')) {
                videoId = linkVal.split('youtube.com/watch?v=')[1].split('&')[0];
              } else if (linkVal.includes('youtu.be/')) {
                videoId = linkVal.split('youtu.be/')[1].split('?')[0];
              }
              
              if (videoId) {
                // Use high quality YouTube thumbnail
                backgroundImage = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }
            }
          }

          // Add mouseover event to show background image
          itemDiv.addEventListener('mouseover', function() {
            if (!this.classList.contains('expanded') && backgroundImage) {
              this.style.backgroundImage = `url('${backgroundImage}')`;
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
          
          // Handle TIMES SEEN for YouTube videos and other items
          if (item['TIMES SEEN']) {
            // If TIMES SEEN already contains 👀 emoji, use it directly
            if (item['TIMES SEEN'].includes('👀')) {
              // Count how many 👀 are in the string
              const emojiCount = (item['TIMES SEEN'].match(/👀/g) || []).length;
              indicator += ' ' + '👀'.repeat(emojiCount);
            } else {
              // Try to extract a number from TIMES SEEN
              const match = item['TIMES SEEN'].match(/\d+/);
              if (match) {
                const timesSeenCount = parseInt(match[0], 10);
                indicator += ' ' + '👀'.repeat(timesSeenCount);
              } else if (item['TIMES SEEN'].trim() !== '') {
                // If there's a value but no number, add a single 👀
                indicator += ' 👀';
              }
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
              // Special handling for descriptions to preserve paragraphs
              if (label.toLowerCase() === 'description') {
                detailsHTML += `<p class="description-text"><strong>${label}:</strong> ${value}</p>`;
              } else {
                detailsHTML += `<p><strong>${label}:</strong> ${value}</p>`;
              }
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
          addDetail('Details', item.details); // Add this line
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
            <div class="item-details"></div>
          `;

          // Store the background image URL as a data attribute for later use
          if (backgroundImage) {
            itemDiv.setAttribute('data-bg-image', backgroundImage);
          }

          // Store the original item data for editing
          itemDiv._itemData = item;

          // Store the original details HTML for restoration
          const detailsDiv = itemDiv.querySelector('.item-details');
          detailsDiv.innerHTML = detailsHTML;
          itemDiv._originalDetailsHTML = detailsHTML;

          container.appendChild(itemDiv);

          // Updated click event: allow multiple expanded items
          itemDiv.addEventListener('click', function(event) {
            // If click is on the collapse corner, process it
            if (event.target.closest('.collapse-corner')) {
              event.stopPropagation();
              
              // Get the original item if this is a clone in the multi-container
              const multiContainer = document.getElementById('multi-expanded-container');
              if (multiContainer && multiContainer.contains(this)) {
                // Find the original item by matching data attributes
                const originalItemTitle = this.querySelector('.item-title').textContent;
                const originalItem = document.querySelector(`.item-row:not(.in-multi-container) .item-title`);
                let foundOriginalItem = null;
                
                document.querySelectorAll('.item-row:not(.in-multi-container)').forEach(item => {
                  if (item.querySelector('.item-title').textContent === originalItemTitle) {
                    foundOriginalItem = item;
                  }
                });
                
                // If found the original, collapse it instead
                if (foundOriginalItem) {
                  collapseItem(foundOriginalItem);
                  updateExpandedItemsLayout();
                  return;
                }
              }
              
              // Normal collapse for the clicked item
              collapseItem(this);
              updateExpandedItemsLayout();
              return;
            }
            
            // If item is already expanded, don't collapse it when clicking anywhere else on it
            if (this.classList.contains('expanded')) {
              return;
            }
            
            event.stopPropagation();
            
            // Get currently expanded items
            const expandedItems = container.querySelectorAll('.item-row.expanded');
            
            // Check if we already have 4 expanded items
            if (expandedItems.length >= 4) {
              // Optionally show a message or close the oldest item
              alert('Please close one of the expanded items first (using the ↕ button)');
              return;
            }
            
            // Now expand this item
            expandItem(this);
            
            // Add appropriate class based on number of expanded items
            updateExpandedItemsLayout();
          });
          
          // Helper function to collapse an item
          function collapseItem(item) {
            item.classList.remove('expanded');
            item.classList.remove('multi-expanded-2');
            item.classList.remove('multi-expanded-3');
            item.classList.remove('multi-expanded-4');
            
            // Remove collapse corner
            const collapseCorner = item.querySelector('.collapse-corner');
            if (collapseCorner) {
              collapseCorner.remove();
            }
            
            // Reset link and styling
            const currentLink = item.querySelector('a.item-title-link');
            if (currentLink) {
              currentLink.removeAttribute('href');
              currentLink.style.color = '';
            }
            
            // Reset background and styling
            item.style.backgroundImage = '';
            item.style.color = '';
            item.style.textShadow = '';
            
            // Restore original details view
            const detailsDiv = item.querySelector('.item-details');
            if (detailsDiv && typeof item._originalDetailsHTML === 'string') {
              detailsDiv.innerHTML = item._originalDetailsHTML;
            }            // Remove any wheel event listeners
            item.onwheel = null;
          }
          
          // Helper function to expand an item
          function expandItem(item) {
            item.classList.add('expanded');
            
            // Add collapse corner
            const collapseCorner = document.createElement('div');
            collapseCorner.className = 'collapse-corner';
            collapseCorner.innerHTML = '↕';
            collapseCorner.title = 'Click to collapse';
            
            // Insert the button right after the item-title div to ensure it's at the top
            const titleDiv = item.querySelector('.item-title');
            if (titleDiv && titleDiv.nextSibling) {
              item.insertBefore(collapseCorner, titleDiv.nextSibling);
            } else {
              // Fallback - just append it
              item.appendChild(collapseCorner);
            }
            
            // Make sure the button is positioned properly
            collapseCorner.style.position = 'absolute';
            collapseCorner.style.top = '10px';
            collapseCorner.style.right = '10px';
            collapseCorner.style.zIndex = '1000';
            
            // Add event listener to the collapse corner
            collapseCorner.addEventListener('click', function(e) {
              e.stopPropagation();
              collapseItem(item);
              updateExpandedItemsLayout();
            });
            
            // Enable link
            const currentLink = item.querySelector('a.item-title-link');
            if (currentLink) {
              currentLink.setAttribute('href', currentLink.dataset.href);
              currentLink.style.color = 'lightgreen';
            }
            
            // Set background image from data attribute
            let bgImage = item.getAttribute('data-bg-image') || '';

            if (bgImage) {
              item.style.backgroundImage = `url('${bgImage}')`;
              item.style.backgroundSize = 'cover';
              item.style.backgroundPosition = 'center';
              item.style.backgroundRepeat = 'no-repeat';
              item.style.color = 'white';
              item.style.textShadow = '2px 2px 4px #000000';
            }

            // Add scroll listener for expanded div
            let bgPos = 0;
            
            const handleScroll = (e) => {
              const delta = e.deltaY;
              bgPos = Math.max(0, Math.min(100, bgPos + (delta / 10)));
              item.style.backgroundPosition = `center ${bgPos}%`;
              e.preventDefault();
            };
              item.addEventListener('wheel', handleScroll, { passive: false });

            // Simply restore original details view without edit button
            const detailsDiv = item.querySelector('.item-details');
            if (detailsDiv) {
              detailsDiv.innerHTML = item._originalDetailsHTML;
            }
          }
          
          // Function to update layout based on number of expanded items
          function updateExpandedItemsLayout() {
            const expandedItems = container.querySelectorAll('.item-row.expanded');
            
            // Show or hide Collapse All button based on expanded items
            collapseAllBtn.style.display = expandedItems.length > 0 ? 'block' : 'none';
            
            // Show or hide the sidebar based on if there are expanded items
            sidebar.style.display = expandedItems.length > 0 ? 'flex' : 'none';
            
            // Remove all multi-expanded classes first
            expandedItems.forEach(item => {
              item.classList.remove('multi-expanded-2');
              item.classList.remove('multi-expanded-3');
              item.classList.remove('multi-expanded-4');
            });
            
            // Add appropriate class based on count
            if (expandedItems.length > 1) {
              expandedItems.forEach(item => {
                if (expandedItems.length === 2) {
                  item.classList.add('multi-expanded-2');
                } else if (expandedItems.length === 3) {
                  item.classList.add('multi-expanded-3');
                } else if (expandedItems.length === 4) {
                  item.classList.add('multi-expanded-4');
                }
              });
            }
            
            // Create or update the multi-expanded container
            let multiContainer = document.getElementById('multi-expanded-container');
            
            if (expandedItems.length > 1) {
              if (!multiContainer) {
                multiContainer = document.createElement('div');
                multiContainer.id = 'multi-expanded-container';
                document.body.appendChild(multiContainer);
              }
              
              // Clear the container
              multiContainer.innerHTML = '';
              
              // Clone and add all expanded items to the container
              expandedItems.forEach(item => {
                const clone = item.cloneNode(true);
                clone.classList.add('in-multi-container'); // Add class to mark as being in container
                
                // Ensure the background image is applied correctly to the clone
                const bgImage = item.getAttribute('data-bg-image');
                if (bgImage) {
                  clone.style.backgroundImage = `url('${bgImage}')`;
                  clone.style.backgroundSize = 'cover';
                  clone.style.backgroundPosition = 'center';
                  clone.style.backgroundRepeat = 'no-repeat';
                  clone.style.color = 'white';
                  clone.style.textShadow = '2px 2px 4px #000000';
                }
                
                // Add click handler for collapse button in the clone
                const collapseCorner = clone.querySelector('.collapse-corner');
                if (collapseCorner) {
                  collapseCorner.addEventListener('click', function(e) {
                    e.stopPropagation();
                    // Find and collapse the original item
                    const originalItemTitle = clone.querySelector('.item-title').textContent;
                    document.querySelectorAll('.item-row.expanded:not(.in-multi-container)').forEach(originalItem => {
                      if (originalItem.querySelector('.item-title').textContent === originalItemTitle) {
                        collapseItem(originalItem);
                        updateExpandedItemsLayout();
                      }
                    });
                  });
                }
                
                multiContainer.appendChild(clone);
              });
              
              multiContainer.style.display = 'flex';
            } else if (multiContainer) {
              multiContainer.style.display = 'none';
              multiContainer.innerHTML = '';
            }
          }
          
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
        }        // Populate genre dropdown
        populateGenreDropdown(data);
        
        // Populate sort options dropdown
        populateSortOptions(data);

        // Apply initial filters and sort
        applyAllFilters();
        if (searchInput) searchInput.value = '';
        refreshAllItemRows();})
      .catch(error => {
        console.error('Error loading data:', error);
        const container = document.getElementById(containerId);
        container.innerHTML = `
          <div class="error-message" style="padding: 20px; text-align: center; color: red;">
            <h3>Error Loading Data</h3>
            <p>${error.message || 'Failed to load data. Please try again or contact support.'}</p>
            <button onclick="location.reload()">Retry</button>
          </div>
        `;
      });
  }

  
});
