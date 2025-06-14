/**
 * ErgoSphere Admin Dashboard JavaScript
 * Modern admin interface for managing STATUS, copies, WATCHED, and TIMES SEEN data
 */

class AdminDashboard {
    constructor() {
        this.currentCategory = 'coop';
        this.currentData = [];
        this.modifiedItems = new Set();
        this.selectedItems = new Set();
        this.isConnected = false;
        this.websocket = null;
        this.editingIndex = null;
        this.editingItem = null;
        this.searchValue = ''; // Add property to track search value
        // Category-specific field configurations
        this.categoryConfigs = {
            movies: {
                fields: ['STATUS', 'WATCHED'],
                timesSeenField: 'WATCHED',
                watchedField: 'WATCHED',
                showCopies: false
            },
            anime: {
                fields: ['STATUS', 'LAST WATCHED'],
                lastWatchedField: 'LAST WATCHED',
                showCopies: false
            },
            youtube: {
                fields: ['STATUS', 'WATCHED'],
                timesSeenField: 'WATCHED',
                watchedField: 'WATCHED',
                showCopies: false
            },
            singleplayer: {
                fields: ['STATUS', 'COMPLETED?'],
                completedField: 'COMPLETED?',
                showCopies: false
            },
            coop: {
                fields: ['COMPLETED?', 'copies'],
                completedField: 'COMPLETED?',
                showCopies: true
            },
            pvp: {
                fields: ['COMPLETED?', 'copies'],
                completedField: 'COMPLETED?',
                showCopies: true
            },
            loot: {
                fields: ['copies', 'cost'],
                copiesField: 'copies',
                costField: 'cost',
                showCopies: true
            },
            sundaymorning: {
                fields: ['STATUS', 'LAST WATCHED'],
                lastWatchedField: 'LAST WATCHED',
                showCopies: false
            },
            sundaynight: {
                fields: ['STATUS', 'LAST WATCHED'],
                lastWatchedField: 'LAST WATCHED',
                showCopies: false
            },
            mods: {
                fields: ['copies'],
                showCopies: true
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.establishConnection();
        this.loadCategoryData('coop');
        this.updateConnectionStatus();
    }

    setupEventListeners() {
        // Category selection
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.switchCategory(category);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterData(e.target.value);
            });
        }

        const clearSearch = document.getElementById('clear-search');
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                this.filterData('');
            });
        }        // Filter and sort dropdowns have been removed
        // Filtering now happens through search box only
        // Sorting now happens through table headers

        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshCurrentCategory();
            });
        }

        // Manual sync button for PostgreSQL→JSON sync
        const manualSyncBtn = document.getElementById('manual-sync-btn');
        if (manualSyncBtn) {
            manualSyncBtn.addEventListener('click', () => {
                // Check if PostgreSQL sync method is available
                if (typeof AdminDashboardDataLoader !== 'undefined' && 
                    typeof AdminDashboardDataLoader.syncPostgresToJson === 'function' &&
                    typeof this.syncPostgresToJson === 'function') {
                    // Use PostgreSQL sync method
                    this.syncPostgresToJson();
                } else {
                    // Fall back to original manual sync method
                    this.performManualSync();
                }
            });
        }

        // Save all changes
        const saveBtn = document.getElementById('save-all-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                console.log('DEBUG: Save All button clicked');
                this.saveAllChanges();
            });
        } else {
            console.log('DEBUG: Save All button not found in DOM');
        }

        // Select all checkbox
        const selectAll = document.getElementById('select-all');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                this.toggleSelectAll(e.target.checked);
            });
        }

        // Bulk actions
        const bulkActionsBtn = document.getElementById('bulk-actions-btn');
        if (bulkActionsBtn) {
            bulkActionsBtn.addEventListener('click', () => {
                this.showBulkModal();
            });
        }

        // Bulk modal buttons
        const closeBulkModal = document.querySelector('.modal-close');
        if (closeBulkModal) {
            closeBulkModal.addEventListener('click', () => {
                this.hideBulkModal();
            });
        }

        const bulkActionButtons = document.querySelectorAll('[data-action]');
        bulkActionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.executeBulkAction(action);
            });
        });

        // Mobile category toggle
        const mobileCategoryToggle = document.getElementById('mobile-category-toggle');
        if (mobileCategoryToggle) {
            mobileCategoryToggle.addEventListener('click', () => {
                this.toggleMobileCategoryNav();
            });
        }        // Close mobile category nav when clicking outside
        document.addEventListener('click', (e) => {
            const categoryNavContainer = document.querySelector('.mobile-category-nav-container');
            const categoryNav = document.getElementById('mobile-category-nav');
            if (categoryNavContainer && !categoryNavContainer.contains(e.target) && categoryNav.classList.contains('expanded')) {
                this.closeMobileCategoryNav();
            }
        });
    }

    async establishConnection() {
        try {
            // Test database connection
            const response = await fetch('/api/options');
            this.isConnected = response.ok;
            
            // Setup WebSocket for real-time updates
            this.setupWebSocket();
            
            this.updateConnectionStatus();
        } catch (error) {
            console.error('Connection failed:', error);
            this.isConnected = false;
            this.updateConnectionStatus();
        }
    }

    setupWebSocket() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
            this.websocket = new WebSocket(`${protocol}//${window.location.hostname}:${port}`);
            
            this.websocket.onopen = () => {
                console.log('WebSocket connected');
            };
            
            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleRealTimeUpdate(data);
            };
            
            this.websocket.onclose = () => {
                console.log('WebSocket disconnected, attempting reconnect...');
                setTimeout(() => this.setupWebSocket(), 5000);
            };
        } catch (error) {
            console.error('WebSocket setup failed:', error);
        }
    }    updateConnectionStatus() {
        const indicator = document.getElementById('connection-indicator');
        const text = document.getElementById('connection-text');
        
        if (indicator && text) {
            // Clear any text content and use CSS classes instead
            indicator.textContent = '';
            
            if (this.isConnected) {
                indicator.className = 'status-indicator connected';
                text.textContent = 'Connected';
            } else {
                indicator.className = 'status-indicator disconnected';
                text.textContent = 'Disconnected';
            }
        }
    }async loadCategoryData(category) {
        this.showLoading();
        
        try {
            let data;
            
            // Check if AdminDashboardDataLoader is available for PostgreSQL loading
            if (typeof AdminDashboardDataLoader !== 'undefined') {
                console.log(`Using AdminDashboardDataLoader for ${category}`);
                
                if (category === 'mods') {
                    // Use specialized mods loader if available
                    data = await AdminDashboardDataLoader.loadModsData();
                } else {
                    // Use PostgreSQL loader for all other categories
                    data = await AdminDashboardDataLoader.loadCategoryData(category);
                }
                
                console.log(`Data loaded from PostgreSQL for ${category}: ${data ? 'success' : 'failed'}`);
            } else {
                // Fall back to original loading method if loader not available
                console.warn("PostgreSQL loader not found. Falling back to original loading method.");
                
                const categoryBtn = document.querySelector(`[data-category="${category}"]`);
                const table = categoryBtn ? categoryBtn.dataset.table : null;
                
                if (table === 'loot_items') {
                    // Load from loot_items table
                    const response = await fetch('/api/loot');
                    data = await response.json();
                } else {
                    // Load from json_data table or fallback to JSON files
                    try {
                        const response = await fetch(`/api/data/${category}`);
                        if (response.ok) {
                            data = await response.json();
                        } else {
                            // Fallback to JSON file - try with and without leading slash
                            try {
                                const jsonResponse = await fetch(`/data/${category}.json`);
                                data = await jsonResponse.json();
                            } catch (innerError) {
                                // Try without leading slash
                                const localJsonResponse = await fetch(`data/${category}.json`);
                                data = await localJsonResponse.json();
                            }
                        }
                    } catch (error) {
                        // Fallback to JSON file - try with and without leading slash
                        try {
                            const jsonResponse = await fetch(`/data/${category}.json`);
                            data = await jsonResponse.json();
                        } catch (innerError) {
                            // Try without leading slash
                            const localJsonResponse = await fetch(`data/${category}.json`);
                            data = await localJsonResponse.json();
                        }
                    }
                }
                
                // Handle the "mods" category by filtering from loot and coop data if not loaded above
                if (category === 'mods' && (!data || data.length === 0)) {
                    try {
                        let coopData, lootData;
                        
                        // Get ERGOvillians from coop.json - try with and without leading slash
                        try {
                            const coopResponse = await fetch(`/data/coop.json`);
                            coopData = await coopResponse.json();
                        } catch (error) {
                            const coopResponse = await fetch(`data/coop.json`);
                            coopData = await coopResponse.json();
                        }
                        const ergoVillains = coopData.filter(item => item.genre === 'ERGOvillians');
                        
                        // Get week modifiers and helper from loot.json - try with and without leading slash
                        try {
                            const lootResponse = await fetch(`/data/loot.json`);
                            lootData = await lootResponse.json();
                        } catch (error) {
                            const lootResponse = await fetch(`data/loot.json`);
                            lootData = await lootResponse.json();
                        }
                        const modItems = lootData.filter(item => 
                            item.genre === 'week modifiers' || 
                            item.genre === 'helper' || 
                            item.genre === 'hazzard');
                        
                        // Combine these items
                        data = [...ergoVillains, ...modItems];
                    } catch (error) {
                        console.error('Failed to load mods data:', error);
                    }
                }
            }
              this.currentData = Array.isArray(data) ? data : [];
            
            // Sort alphabetically by default
            this.sortData('name');
            
            this.renderTable();
            this.updateStats();
            
        } catch (error) {
            console.error('Failed to load category data:', error);
            this.showError('Failed to load data. Please try again.');
        } finally {
            this.hideLoading();
        }
    }    renderTable() {
        const tbody = document.getElementById('table-body');
        if (!tbody) return;
        
        const categoryBtn = document.querySelector(`[data-category="${this.currentCategory}"]`);
        const dataType = categoryBtn ? categoryBtn.dataset.type : null;
        
        // Update table headers based on category
        this.updateTableHeaders();
        
        tbody.innerHTML = '';
        
        if (this.currentData.length === 0) {
            this.showEmpty();
            return;
        }
        
        this.hideEmpty();
        
        this.currentData.forEach((item, index) => {
            const row = this.createTableRow(item, index, dataType);
            tbody.appendChild(row);
        });
        
        // Reapply search filter if one exists
        if (this.searchValue) {
            this.filterData(this.searchValue);
        }
    }updateTableHeaders() {
        const headersRow = document.getElementById('table-headers');
        if (!headersRow) return;
        const config = this.categoryConfigs[this.currentCategory] || this.categoryConfigs.movies;
        let headersHTML = `
            <th class="col-checkbox">
                <input type="checkbox" id="select-all">
            </th>
            <th class="col-name sortable" data-sort="name">Name</th>`;
        if (this.currentCategory === 'mods') {
            headersHTML += `<th class="col-copies sortable" data-sort="copies">Copies</th>`;
        } else {
            if (!config.showCopies) {
                headersHTML += `<th class="col-status sortable" data-sort="status">Status</th>`;
            }
            if (config.showCopies) {
                headersHTML += `<th class="col-copies sortable" data-sort="copies">Copies</th>`;
            }
            if (config.completedField) {
                headersHTML += `<th class="col-completed sortable" data-sort="completed">Progress</th>`;
            }
            if (config.activeField) {
                headersHTML += `<th class="col-active sortable" data-sort="active">Active</th>`;
            }
            if (config.timesSeenField) {
                headersHTML += `<th class="col-watched sortable" data-sort="watched">Times Seen</th>`;
            }
            if (config.lastWatchedField) {
                headersHTML += `<th class="col-last-watched sortable" data-sort="lastWatched">Last Watched</th>`;
            }
            if (config.seriesLengthField) {
                headersHTML += `<th class="col-series-length sortable" data-sort="seriesLength">Series Length</th>`;
            }
            if (config.genreField && this.currentCategory === 'mods') {
                headersHTML += `<th class="col-genre sortable" data-sort="genre">Genre</th>`;
            }
            if (config.timeField && this.currentCategory === 'singleplayer') {
                headersHTML += `<th class="col-time sortable" data-sort="time">Time to Beat</th>`;
            }
        }
        headersHTML += `<th class="col-actions">Actions</th>`;
        headersRow.innerHTML = headersHTML;
        this.setupSelectAllCheckbox();
    }

    setupSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('select-all');
        if (selectAllCheckbox) {
            // Remove existing event listeners
            selectAllCheckbox.replaceWith(selectAllCheckbox.cloneNode(true));
            
            // Re-get the element and add event listener
            const newSelectAllCheckbox = document.getElementById('select-all');
            if (newSelectAllCheckbox) {
                newSelectAllCheckbox.addEventListener('change', (e) => {
                    const checkboxes = document.querySelectorAll('.item-checkbox');
                    checkboxes.forEach((checkbox, index) => {
                        checkbox.checked = e.target.checked;
                        if (e.target.checked) {
                            this.selectedItems.add(index);
                        } else {
                            this.selectedItems.delete(index);
                        }
                    });
                });
            }
        }
        
        // Set up sorting by column header clicks
        const sortableHeaders = document.querySelectorAll('th.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                const sortBy = e.target.dataset.sort;
                if (sortBy) {
                    this.sortData(sortBy);
                }
            });            // Add a visual indicator that the column is clickable
            header.style.cursor = 'pointer';
            if (!header.querySelector('.sort-indicator')) {
                header.innerHTML += ' <span class="sort-indicator"></span>';
            }
        });
    }createTableRow(item, index, dataType) {
        const row = document.createElement('tr');
        row.dataset.index = index;
        
        // Get category configuration
        const config = this.categoryConfigs[this.currentCategory] || this.categoryConfigs.movies;
        
        // Determine item properties based on data structure and category
        const isLoot = this.currentCategory === 'loot';
        const name = isLoot ? item.text : (item.TITLE || item.Title || item.text || 'Unknown');
        const status = isLoot ? (item.copies > 0 ? '🟢' : '🔴') : (item.STATUS || '');
          // Build row content based on category configuration
        let rowContent = `
            <td>
                <input type="checkbox" class="item-checkbox" data-index="${index}">
            </td>
            <td class="item-name">${name}</td>`;
        if (this.currentCategory === 'mods') {
            const copies = item.copies || 0;
            rowContent += `
            <td class="copies-cell">
                <div class="number-control">
                    <button class="control-btn minus" data-action="minus" data-index="${index}">-</button>
                    <span class="copies-count ${this.getCopiesClass(copies)}">${copies}</span>
                    <button class="control-btn plus" data-action="plus" data-index="${index}">+</button>
                </div>
            </td>`;
        } else {
            // Only include STATUS column for categories that don't have copies determining status
            if (!config.showCopies) {
                // Provide a default status indicator when STATUS field is empty - treat as inactive
                const displayStatus = status || '🔴'; // Use red circle (inactive) if status is empty
                
                // Add tooltip to explain status meanings
                let statusTitle = '';
                switch (displayStatus) {
                    case '🔴': statusTitle = 'Inactive / Not Active'; break;
                    case '🟢': statusTitle = 'Active'; break;
                    case '🟡': statusTitle = 'Warning / In Progress'; break;
                    case '⚪': statusTitle = 'Neutral'; break;
                    default: statusTitle = 'Click to change status';
                }
                
                rowContent += `
                <td class="status-cell">
                    <button class="status-toggle" data-index="${index}" title="${statusTitle}">${displayStatus}</button>
                </td>`;
            }
            
            // Add category-specific columns
            if (config.showCopies) {
                const copies = item.copies || 0;
                rowContent += `
                <td class="copies-cell">
                    <div class="number-control">
                        <button class="control-btn minus" data-action="minus" data-index="${index}">-</button>
                        <span class="copies-count ${this.getCopiesClass(copies)}">${copies}</span>
                        <button class="control-btn plus" data-action="plus" data-index="${index}">+</button>
                    </div>
                </td>`;
            }
          // Add completion field for games
          if (config.completedField) {
            const completed = item[config.completedField] || '';
            rowContent += `
            <td class="completed-cell">
                <button class="completed-toggle" data-index="${index}">${completed}</button>
            </td>`;
        }
        
        // Add active field for movies
        if (config.activeField) {
            const active = item[config.activeField] || '';
            rowContent += `
            <td class="active-cell">
                <button class="active-toggle" data-index="${index}">${active}</button>
            </td>`;
        }
          // Add times seen field for movies/anime/youtube
          if (config.timesSeenField) {
            let timesSeen;
            // Explicitly check for undefined to handle 0 correctly
            if (typeof item[config.timesSeenField] !== 'undefined') {
                timesSeen = item[config.timesSeenField];
            } else if (typeof item.watched !== 'undefined') {
                timesSeen = item.watched;
            } else {
                timesSeen = 0;
            }
            const eyeDisplay = this.generateEyeDisplay(timesSeen);
            rowContent += `
            <td class="watched-cell">
                <div class="number-control">
                    <button class="control-btn minus" data-action="watched-minus" data-index="${index}">-</button>
                    ${eyeDisplay}
                    <button class="control-btn plus" data-action="watched-plus" data-index="${index}">+</button>
                </div>
            </td>`;
        }        // Add genre field for mods category
        if (config.genreField && this.currentCategory === 'mods') {
            const genre = item[config.genreField] || '';
            rowContent += `
            <td class="genre-cell">
                <span class="genre-value" data-genre="${genre}">${genre}</span>
            </td>`;
        }
        
        // Add last watched field for anime/Sunday shows
        if (config.lastWatchedField) {
            const lastWatched = item[config.lastWatchedField] || '';
            rowContent += `
            <td class="last-watched-cell">
                <input type="text" class="editable-field" data-field="${config.lastWatchedField}" data-index="${index}" value="${lastWatched}" placeholder="e.g. se1, se2">
            </td>`;
        }
        
        // Add series length field for anime/Sunday shows  
        if (config.seriesLengthField) {
            const seriesLength = item[config.seriesLengthField] || '';
            rowContent += `
            <td class="series-length-cell">
                <input type="text" class="editable-field" data-field="${config.seriesLengthField}" data-index="${index}" value="${seriesLength}" placeholder="e.g. 3 season, 10 episodes">
            </td>`;
        }
          // Add time to beat field for single player games
          if (config.timeField && this.currentCategory === 'singleplayer') {
            const timeValue = item[config.timeField] || '';
            rowContent += `
            <td class="time-cell">
                <span class="time-value">${timeValue}</span>
            </td>`;
        }
    }
    // Add edit button column
    rowContent += `
    <td class="actions-cell">
        <button class="edit-btn" data-index="${index}" title="Edit item">✏️</button>
    </td>`;
    
    row.innerHTML = rowContent;
    this.attachRowEventListeners(row, index);
    return row;
    }

    attachRowEventListeners(row, index) {
        // Checkbox
        const checkbox = row.querySelector('.item-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedItems.add(index);
                } else {
                    this.selectedItems.delete(index);
                }
                this.updateSelectAllState();
            });
        }

        // Status toggle
        const statusToggle = row.querySelector('.status-toggle');
        if (statusToggle) {
            statusToggle.addEventListener('click', () => {
                this.toggleItemStatus(index);
            });
        }

        // Completion toggle (for games)
        const completedToggle = row.querySelector('.completed-toggle');
        if (completedToggle) {
            completedToggle.addEventListener('click', () => {
                this.toggleItemCompletion(index);
            });
        }

        // Active toggle (for movies)
        const activeToggle = row.querySelector('.active-toggle');
        if (activeToggle) {
            activeToggle.addEventListener('click', () => {
                this.toggleItemActive(index);
            });
        }        // Number controls
        row.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleNumberControl(action, index);
            });
        });
        
        // Edit button
        const editBtn = row.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.editItem(index);
            });
        }
        
        // Editable fields (for Last Watched and Series Length)
        row.querySelectorAll('.editable-field').forEach(field => {
            // Store original value for comparison
            field.dataset.originalValue = field.value;
            
            field.addEventListener('focus', (e) => {
                e.target.classList.add('editing');
            });
            
            field.addEventListener('blur', (e) => {
                e.target.classList.remove('editing');
            });
            
            field.addEventListener('input', (e) => {
                const fieldName = e.target.dataset.field;
                const newValue = e.target.value;
                const originalValue = e.target.dataset.originalValue;
                
                // Add or remove staging class based on whether value changed
                if (newValue !== originalValue) {
                    e.target.classList.add('modified', 'staged');
                } else {
                    e.target.classList.remove('modified', 'staged');
                }
            });
            
            field.addEventListener('change', (e) => {
                const fieldName = e.target.dataset.field;
                const newValue = e.target.value;
                const originalValue = e.target.dataset.originalValue;
                
                // Only mark as modified if value actually changed
                if (newValue !== originalValue) {
                    this.updateItemField(index, fieldName, newValue);
                    e.target.classList.add('modified', 'staged');
                } else {
                    e.target.classList.remove('modified', 'staged');
                    // If no changes, remove from modified items
                    this.checkIfRowStillModified(index);
                }
            });
        });
    }    getCopiesClass(copies) {
        if (copies === 0) return 'zero';
        if (copies <= 2) return 'low';
        if (copies <= 5) return 'medium';
        return 'high';
    }

    generateEyeDisplay(count) {
        if (!count || count <= 0) return '';
        // Determine class for sizing
        let sizeClass = 'eye-count-1';
        if (count === 1) sizeClass = 'eye-count-1';
        else if (count === 2) sizeClass = 'eye-count-2';
        else if (count <= 4) sizeClass = 'eye-count-4';
        else if (count <= 7) sizeClass = 'eye-count-7';
        else if (count <= 10) sizeClass = 'eye-count-10';
        else if (count <= 20) sizeClass = 'eye-count-20';
        else sizeClass = 'eye-count-50plus';
        // Render each eye as a span
        let eyes = '';
        for (let i = 0; i < Math.min(count, 50); i++) {
            eyes += '<span class="eye">👀</span>';
        }
        if (count > 50) {
            eyes += `<span class="eye-multiplier">+${count-50}</span>`;
        }
        return `<div class="eye-display ${sizeClass}" title="${count} times seen">${eyes}</div>`;
    }toggleItemStatus(index) {
        const item = this.currentData[index];
        const config = this.categoryConfigs[this.currentCategory] || this.categoryConfigs.movies;
        
        if (config.showCopies) {
            // For categories with copies (coop, pvp, loot), toggle between 0 and 1 copies
            item.copies = item.copies > 0 ? 0 : 1;
        } else {
            // For other categories, cycle through status options
            // Treat empty status as inactive (red)
            const statuses = ['🔴', '🟢', '🟡', '⚪'];
            const currentIndex = statuses.indexOf(item.STATUS || '🔴');
            item.STATUS = statuses[(currentIndex + 1) % statuses.length];
        }
        
        this.markAsModified(index);
        
        // Instead of re-rendering the entire table, just update this specific row
        this.refreshTableRow(index);
        this.updateStats();
    }toggleItemCompletion(index) {
        const item = this.currentData[index];
        const config = this.categoryConfigs[this.currentCategory] || this.categoryConfigs.movies;
        
        if (config.completedField) {
            // Cycle through completion statuses for games
            const statuses = ['', '🏆', 'In Progress', 'Dropped'];
            const currentIndex = statuses.indexOf(item[config.completedField] || '');
            item[config.completedField] = statuses[(currentIndex + 1) % statuses.length];
        }
        
        this.markAsModified(index);
        
        // Just update the specific row instead of re-rendering the entire table
        this.refreshTableRow(index);
        this.updateStats();
    }    toggleItemActive(index) {
        const item = this.currentData[index];
        const config = this.categoryConfigs[this.currentCategory] || this.categoryConfigs.movies;
        
        if (config.activeField) {
            // Cycle through active statuses for movies
            const statuses = ['', '🟢', '🔴'];
            const currentIndex = statuses.indexOf(item[config.activeField] || '');
            item[config.activeField] = statuses[(currentIndex + 1) % statuses.length];
        }
        
        this.markAsModified(index);
        
        // Just update the specific row instead of re-rendering the entire table
        this.refreshTableRow(index);
        this.updateStats();
    }    handleNumberControl(action, index) {
        console.log('DEBUG: handleNumberControl called with action =', action, 'index =', index);
        const item = this.currentData[index];
        const config = this.categoryConfigs[this.currentCategory] || this.categoryConfigs.movies;
        console.log('DEBUG: item before change =', JSON.stringify(item));
        
        switch (action) {
            case 'plus':
                if (config.showCopies) {
                    item.copies = (item.copies || 0) + 1;
                    console.log('DEBUG: Incremented copies to', item.copies);
                }
                break;
            case 'minus':
                if (config.showCopies) {
                    item.copies = Math.max(0, (item.copies || 0) - 1);
                    console.log('DEBUG: Decremented copies to', item.copies);
                }
                break;
            case 'watched-plus':
                if (config.timesSeenField) {
                    const field = config.timesSeenField;
                    item[field] = (item[field] || 0) + 1;
                }
                break;
            case 'watched-minus':
                if (config.timesSeenField) {
                    const field = config.timesSeenField;
                    item[field] = Math.max(0, (item[field] || 0) - 1);
                }
                break;
        }
        
        console.log('DEBUG: item after change =', JSON.stringify(item));
        this.markAsModified(index);
        
        // Just update the specific row instead of re-rendering the entire table
        this.refreshTableRow(index);
        this.updateStats();
    }markAsModified(index) {
        console.log('DEBUG: markAsModified called with index =', index);
        this.modifiedItems.add(index);
        console.log('DEBUG: modifiedItems.size after add =', this.modifiedItems.size);
        
        // Add visual indicators with enhanced staging
        const row = document.querySelector(`tr[data-index="${index}"]`);
        if (row) {
            row.classList.add('modified', 'staged');
            console.log('DEBUG: Added modified and staged classes to row');
            
            // Add staging indicator to any modified fields in this row
            const editableFields = row.querySelectorAll('.editable-field');
            editableFields.forEach(field => {
                if (field.dataset.originalValue !== field.value) {
                    field.classList.add('staged');
                }
            });
            
            // Mark any control buttons and values as modified
            const controlElements = row.querySelectorAll('.status-toggle, .completed-toggle, .active-toggle, .copies-count, .watched-count');
            controlElements.forEach(element => {
                if (element.dataset.modified === 'true') {
                    element.classList.add('modified');
                }
            });
        } else {
            console.log('DEBUG: Row not found for index', index);
        }
        
        // Update save button state
        this.updateSaveButtonState();
        this.updateStagingIndicator();
    }

    checkIfRowStillModified(index) {
        const row = document.querySelector(`tr[data-index="${index}"]`);
        if (!row) return;
        
        // Check if any editable fields in this row are still modified
        const editableFields = row.querySelectorAll('.editable-field');
        let hasModifiedFields = false;
        
        editableFields.forEach(field => {
            if (field.dataset.originalValue !== field.value) {
                hasModifiedFields = true;
            }
        });
        
        // Check if any control buttons are marked as modified
        const controlElements = row.querySelectorAll('.status-toggle.modified, .completed-toggle.modified, .active-toggle.modified, .control-btn.modified');
        const hasModifiedControls = controlElements.length > 0;
        
        // If no modifications remain, remove from modified items and clear styling
        if (!hasModifiedFields && !hasModifiedControls) {
            this.modifiedItems.delete(index);
            row.classList.remove('modified', 'staged');
            
            // Update save button and staging indicator
            this.updateSaveButtonState();
            this.updateStagingIndicator();
        }
    }

    updateItemField(index, fieldName, newValue) {
        const item = this.currentData[index];
        if (item) {
            item[fieldName] = newValue;
            this.markAsModified(index);
            this.updateStats();
        }
    }

    updateSaveButtonState() {
        const saveBtn = document.getElementById('save-all-btn');
        if (saveBtn) {
            if (this.modifiedItems.size > 0) {
                saveBtn.classList.add('has-changes');
                saveBtn.textContent = `💾 Save All (${this.modifiedItems.size})`;
            } else {
                saveBtn.classList.remove('has-changes');
                saveBtn.textContent = '💾 Save All';
            }
        }
    }

    updateStagingIndicator() {
        // Update stats to show staging information
        const modifiedCount = this.modifiedItems.size;
        const modifiedElement = document.getElementById('modified-items');
        
        if (modifiedElement) {
            if (modifiedCount > 0) {
                modifiedElement.innerHTML = `${modifiedCount} staged <span class="staging-indicator">Unsaved</span>`;
            } else {
                modifiedElement.textContent = '0 modified';
            }
        }
    }

    clearAllStagingHighlights() {
        // Remove all staging and modified classes from rows
        document.querySelectorAll('tr.modified, tr.staged').forEach(row => {
            row.classList.remove('modified', 'staged');
        });
        
        // Remove all staging and modified classes from editable fields
        document.querySelectorAll('.editable-field.modified, .editable-field.staged').forEach(field => {
            field.classList.remove('modified', 'staged');
        });
        
        // Remove modified classes from control elements
        document.querySelectorAll('.status-toggle.modified, .completed-toggle.modified, .active-toggle.modified, .control-btn.modified, .copies-count.modified, .watched-count.modified').forEach(element => {
            element.classList.remove('modified');
            // Also remove any dataset flags
            delete element.dataset.modified;
        });
        
        // Update save button state to normal
        this.updateSaveButtonState();
        this.updateStagingIndicator();
        
        console.log('DEBUG: All staging highlights cleared');
    }

    updateStats() {
        const totalItems = this.currentData.length;
        const config = this.categoryConfigs[this.currentCategory] || this.categoryConfigs.movies;
        
        const activeItems = this.currentData.filter(item => {
            if (config.showCopies) {
                // For categories with copies (coop, pvp, loot), active means having copies > 0
                return item.copies > 0;
            } else {
                // For categories without copies, use STATUS field
                return item.STATUS === '🟢';
            }
        }).length;
        
        const modifiedCount = this.modifiedItems.size;
        
        const statsElements = {
            'total-items': `${totalItems} items`,
            'active-items': `${activeItems} active`,
            'modified-items': `${modifiedCount} modified`
        };
        
        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }    filterData(searchTerm) {
        // Save the current search term
        this.searchValue = searchTerm;
        
        const rows = document.querySelectorAll('#table-body tr');
        rows.forEach(row => {
            const name = row.querySelector('.item-name').textContent.toLowerCase();
            const matches = name.includes(searchTerm.toLowerCase());
            row.style.display = matches ? '' : 'none';
        });
    }    applyFilters() {
        // Since status filter has been removed, this method
        // now just applies the search filter (handled by filterData)
        if (this.searchValue) {
            this.filterData(this.searchValue);
        }
    }sortData(sortBy) {
        if (!this.currentData || this.currentData.length === 0) {
            console.log('No data to sort');
            return;
        }

        console.log('Sorting by:', sortBy);
        
        const config = this.categoryConfigs[this.currentCategory] || this.categoryConfigs.movies;
        
        // Create a copy of the data to avoid mutating the original during sort
        const sortedData = [...this.currentData];
        
        sortedData.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    const nameA = (a.TITLE || a.Title || a.text || '').toLowerCase();
                    const nameB = (b.TITLE || b.Title || b.text || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                
                case 'status':
                    if (config.showCopies) {
                        // For categories with copies, sort by copies count
                        const copiesA = a.copies || 0;
                        const copiesB = b.copies || 0;
                        return copiesB - copiesA; // Descending order (highest first)
                    } else {
                        // For status-based categories, sort by status
                        const statusA = a.STATUS || '';
                        const statusB = b.STATUS || '';
                        const statusOrder = { '🟢': 4, '🟡': 3, '⚪': 2, '🔴': 1, '': 0 };
                        return (statusOrder[statusB] || 0) - (statusOrder[statusA] || 0);
                    }
                
                case 'copies':
                    if (config.showCopies) {
                        const copiesA = a.copies || 0;
                        const copiesB = b.copies || 0;
                        return copiesB - copiesA; // Descending order
                    }
                    return 0; // No change if category doesn't have copies
                
                case 'watched':
                    if (config.timesSeenField) {
                        const watchedA = a[config.timesSeenField] || 0;
                        const watchedB = b[config.timesSeenField] || 0;
                        return watchedB - watchedA; // Descending order
                    } else if (config.lastWatchedField) {
                        // Sort by last watched date if available
                        const lastWatchedA = a[config.lastWatchedField] || '';
                        const lastWatchedB = b[config.lastWatchedField] || '';
                        return lastWatchedB.localeCompare(lastWatchedA);
                    }
                    return 0;
                
                case 'completed':
                    if (config.completedField) {
                        const completedA = a[config.completedField] || '';
                        const completedB = b[config.completedField] || '';
                        const completedOrder = { '✅': 2, '⏳': 1, '': 0 };
                        return (completedOrder[completedB] || 0) - (completedOrder[completedA] || 0);
                    }
                    return 0;
                
                default:
                    return 0; // No sorting
            }
        });
        
        // Update the current data with sorted version
        this.currentData = sortedData;
          // Update sorting indicator in the UI
        document.querySelectorAll('th.sortable').forEach(header => {
            const headerSortBy = header.dataset.sort;
            if (headerSortBy === sortBy) {
                header.classList.add('active-sort');
            } else {
                header.classList.remove('active-sort');
            }        });
        
        // Re-render the table with sorted data
        this.renderTable(); // This will automatically reapply search filter via the code in renderTable()
          
        // Only show feedback message when sorting is triggered by user action, not on initial load
        const isUserAction = new Error().stack.includes('HTMLTableCellElement.addEventListener');
        if (isUserAction) {
            this.showMessage(`📊 Sorted by ${sortBy}`);
        }
        
        console.log(`Data sorted by ${sortBy}, ${this.currentData.length} items`);
    }

    async refreshCurrentCategory() {
        await this.loadCategoryData(this.currentCategory);
    }    async saveAllChanges() {
        console.log('DEBUG: saveAllChanges called');
        console.log('DEBUG: modifiedItems.size =', this.modifiedItems.size);
        console.log('DEBUG: modifiedItems contents =', Array.from(this.modifiedItems));
        console.log('DEBUG: currentData =', this.currentData);
        
        if (this.modifiedItems.size === 0) {
            console.log('DEBUG: No changes to save, showing message');
            this.showMessage('No changes to save');
            return;
        }
        if (!this.currentData || this.currentData.length === 0) {
            console.warn('Attempted to save with empty data array. Aborting to prevent data loss.');
            this.showError('❌ Save aborted: No data loaded. Please reload the page and try again.');
            return;
        }

        try {
            this.showSyncIndicator();
            
            // Check if PostgreSQL loader is available
            if (typeof AdminDashboardDataLoader !== 'undefined') {
                console.log('Using PostgreSQL loader to save data');
                
                // Save to PostgreSQL database
                try {
                    const saveResult = await AdminDashboardDataLoader.saveData(this.currentCategory, this.currentData);
                    
                    if (saveResult && saveResult.success) {
                        this.modifiedItems.clear();
                        this.clearAllStagingHighlights();
                        this.showMessage('✅ All changes saved successfully');
                    } else {
                        this.showError('❌ Save failed: Invalid response from server');
                    }
                } catch (saveError) {
                    console.error('PostgreSQL save error:', saveError);
                    this.showError('❌ Save failed: Error saving to database');
                }
            } else {
                // Fall back to original save method if loader not available
                console.warn("AdminDashboardDataLoader not found. Falling back to original save method.");
                
                // Prepare data for saving - only include modified items
                const itemsToSave = this.currentData.filter((item, index) => this.modifiedItems.has(index));
                
                // Send updated data to server
                const response = await fetch('/api/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        category: this.currentCategory,
                        items: itemsToSave
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('Save result:', result);
                    
                    if (result.success) {
                        this.modifiedItems.clear();
                        this.clearAllStagingHighlights();
                        this.showMessage('✅ All changes saved successfully');
                    } else {
                        this.showError('❌ Save failed: ' + (result.message || 'Unknown error'));
                    }
                } else {
                    this.showError('❌ Save failed: Server error ' + response.status);
                }
            }
        } catch (error) {
            console.error('Unexpected error during save:', error);
            this.showError('❌ Save failed: ' + error.message);
        } finally {
            this.hideSyncIndicator();
        }
    }

    showLoading() {
        const loading = document.getElementById('loading-indicator');
        if (loading) loading.style.display = '';
    }
    hideLoading() {
        const loading = document.getElementById('loading-indicator');
        if (loading) loading.style.display = 'none';
    }

    showEmpty() {
        // Show a message or element when there is no data to display
        const emptyElement = document.getElementById('empty-message');
        if (emptyElement) emptyElement.style.display = '';
    }

    hideEmpty() {
        // Hide the empty message or element
        const emptyElement = document.getElementById('empty-message');
        if (emptyElement) emptyElement.style.display = 'none';
    }

    showError(message) {
        // Display an error message to the user
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = '';
        } else {
            alert(message); // fallback if no error element exists
        }
    }

    switchCategory(category) {
        if (category === this.currentCategory) return;

        // Optionally warn if there are unsaved changes
        if (this.modifiedItems.size > 0) {
            if (!confirm('You have unsaved changes. Switch category and discard them?')) {
                return;
            }
            this.modifiedItems.clear();
            this.clearAllStagingHighlights();
        }

        this.currentCategory = category;
        this.selectedItems.clear();
        this.searchValue = '';

        // Update active button UI
        document.querySelectorAll('.category-btn').forEach(btn => {
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update category title if present
        const title = document.getElementById('category-title');
        if (title) {
            title.textContent = btnLabelForCategory(category);
        }

        // Clear search box
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';

        // Load new category data
        this.loadCategoryData(category);
    }

    refreshTableRow(index) {
        const tbody = document.getElementById('table-body');
        if (!tbody) return;
        const oldRow = tbody.querySelector(`tr[data-index="${index}"]`);
        if (!oldRow) return;
        // Create a new row for the updated item
        const categoryBtn = document.querySelector(`[data-category="${this.currentCategory}"]`);
        const dataType = categoryBtn ? categoryBtn.dataset.type : null;
        // Patch: For movies, ensure both WATCHED and watched are considered for Times Seen
        if (this.currentCategory === 'movies') {
            const item = this.currentData[index];
            // If one is missing, copy from the other
            if (item.WATCHED === undefined && item.watched !== undefined) {
                item.WATCHED = item.watched;
            } else if (item.watched === undefined && item.WATCHED !== undefined) {
                item.watched = item.WATCHED;
            }
        }
        const newRow = this.createTableRow(this.currentData[index], index, dataType);
        tbody.replaceChild(newRow, oldRow);
    }
}

// Helper for pretty category names
function btnLabelForCategory(category) {
    const map = {
        coop: 'CO-OP Games',
        loot: 'LOOT Boxes',
        pvp: 'PVP Games',
        movies: 'Movies',
        anime: 'Anime',
        youtube: 'YouTube',
        singleplayer: 'Single Player',
        sundaymorning: 'Sunday Morning',
        sundaynight: 'Sunday Night',
        mods: 'Mods'
    };
    return map[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

// End of AdminDashboard class

// Initialize the admin dashboard when the DOM is loaded

document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});
