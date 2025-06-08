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
        }

        // Filter and sort
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }

        const sortOptions = document.getElementById('sort-options');
        if (sortOptions) {
            sortOptions.addEventListener('change', (e) => {
                this.sortData(e.target.value);
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshCurrentCategory();
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
    }

    updateConnectionStatus() {
        const indicator = document.getElementById('connection-indicator');
        const text = document.getElementById('connection-text');
        
        if (indicator && text) {
            if (this.isConnected) {
                indicator.textContent = '🟢';
                text.textContent = 'Connected';
            } else {
                indicator.textContent = '🔴';
                text.textContent = 'Disconnected';
            }
        }
    }

    async loadCategoryData(category) {
        this.showLoading();
        
        try {
            let data;
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
                        // Fallback to JSON file
                        const jsonResponse = await fetch(`/data/${category}.json`);
                        data = await jsonResponse.json();
                    }
                } catch (error) {
                    // Fallback to JSON file
                    const jsonResponse = await fetch(`/data/${category}.json`);
                    data = await jsonResponse.json();
                }
            }
            
            this.currentData = Array.isArray(data) ? data : [];
            this.renderTable();
            this.updateStats();
            
        } catch (error) {
            console.error('Failed to load category data:', error);
            this.showError('Failed to load data. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    renderTable() {
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
    }

    updateTableHeaders() {
        const headersRow = document.getElementById('table-headers');
        if (!headersRow) return;
        
        const config = this.categoryConfigs[this.currentCategory] || this.categoryConfigs.movies;
        const isLoot = this.currentCategory === 'loot';
        
        let headersHTML = `
            <th class="col-checkbox">
                <input type="checkbox" id="select-all">
            </th>
            <th class="col-name">Name</th>`;
        
        // Only include STATUS column for categories that don't have copies determining status
        if (!config.showCopies) {
            headersHTML += `<th class="col-status">Status</th>`;
        }
        
        // Add category-specific headers
        if (config.showCopies) {
            headersHTML += `<th class="col-copies">Copies</th>`;
        }
          if (config.completedField) {
            headersHTML += `<th class="col-completed">Completed?</th>`;
        }
        
        if (config.activeField) {
            headersHTML += `<th class="col-active">Active</th>`;
        }
        
        if (config.timesSeenField) {
            headersHTML += `<th class="col-watched">Times Seen 👀</th>`;
        }
        
        if (config.lastWatchedField) {
            headersHTML += `<th class="col-last-watched">Last Watched</th>`;
        }
        
        if (config.seriesLengthField) {
            headersHTML += `<th class="col-series-length">Series Length</th>`;
        }
        
        if (config.timeField && this.currentCategory === 'singleplayer') {
            headersHTML += `<th class="col-time">Time to Beat</th>`;
        }
          if (config.costField && isLoot) {
            headersHTML += `<th class="col-cost">Cost 💰</th>`;
        }
        
        headersRow.innerHTML = headersHTML;
          // Re-setup select all functionality
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
        
        // Only include STATUS column for categories that don't have copies determining status
        if (!config.showCopies) {
            rowContent += `
            <td class="status-cell">
                <button class="status-toggle" data-index="${index}">${status}</button>
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
            const timesSeen = item[config.timesSeenField] || item.watched || 0;
            const eyeDisplay = timesSeen > 0 ? ` 👀` : '';
            rowContent += `
            <td class="watched-cell">
                <div class="number-control">
                    <button class="control-btn minus" data-action="watched-minus" data-index="${index}">-</button>
                    <span class="watched-count">${timesSeen}${eyeDisplay}</span>
                    <button class="control-btn plus" data-action="watched-plus" data-index="${index}">+</button>
                </div>
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
          // Add cost field for loot
        if (config.costField && isLoot) {
            const cost = item[config.costField] || 0;
            rowContent += `
            <td class="cost-cell">
                <span class="cost-value">${cost} 💰</span>
            </td>`;
        }
        
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
        }

        // Number controls
        row.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleNumberControl(action, index);
            });
        });
        
        // Editable fields (for Last Watched and Series Length)
        row.querySelectorAll('.editable-field').forEach(field => {
            field.addEventListener('change', (e) => {
                const fieldName = e.target.dataset.field;
                const newValue = e.target.value;
                this.updateItemField(index, fieldName, newValue);
                e.target.classList.add('modified');
            });
        });
    }

    getCopiesClass(copies) {
        if (copies === 0) return 'zero';
        if (copies <= 2) return 'low';
        if (copies <= 5) return 'medium';
        return 'high';
    }

    toggleItemStatus(index) {
        const item = this.currentData[index];
        const config = this.categoryConfigs[this.currentCategory] || this.categoryConfigs.movies;
        
        if (config.showCopies) {
            // For categories with copies (coop, pvp, loot), toggle between 0 and 1 copies
            item.copies = item.copies > 0 ? 0 : 1;
        } else {
            // For other categories, cycle through status options
            const statuses = ['⚪', '🟢', '🟡', '🔴'];
            const currentIndex = statuses.indexOf(item.STATUS || '⚪');
            item.STATUS = statuses[(currentIndex + 1) % statuses.length];
        }
        
        this.markAsModified(index);
        this.renderTable();
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
        this.renderTable();
    }

    toggleItemActive(index) {
        const item = this.currentData[index];
        const config = this.categoryConfigs[this.currentCategory] || this.categoryConfigs.movies;
        
        if (config.activeField) {
            // Cycle through active statuses for movies
            const statuses = ['', '🟢', '🔴'];
            const currentIndex = statuses.indexOf(item[config.activeField] || '');
            item[config.activeField] = statuses[(currentIndex + 1) % statuses.length];
        }
        
        this.markAsModified(index);
        this.renderTable();
    }

    handleNumberControl(action, index) {
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
        this.renderTable();
    }markAsModified(index) {
        console.log('DEBUG: markAsModified called with index =', index);
        this.modifiedItems.add(index);
        console.log('DEBUG: modifiedItems.size after add =', this.modifiedItems.size);
        // Add visual indicator
        const row = document.querySelector(`tr[data-index="${index}"]`);
        if (row) {
            row.classList.add('modified');
            console.log('DEBUG: Added modified class to row');
        } else {
            console.log('DEBUG: Row not found for index', index);
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
    }

    filterData(searchTerm) {
        const rows = document.querySelectorAll('#table-body tr');
        rows.forEach(row => {
            const name = row.querySelector('.item-name').textContent.toLowerCase();
            const matches = name.includes(searchTerm.toLowerCase());
            row.style.display = matches ? '' : 'none';
        });
    }

    applyFilters() {
        const statusFilter = document.getElementById('status-filter');
        const filterValue = statusFilter ? statusFilter.value : 'all';
        
        const rows = document.querySelectorAll('#table-body tr');
        rows.forEach(row => {
            const statusButton = row.querySelector('.status-toggle');
            const status = statusButton ? statusButton.textContent : '';
            
            let show = true;
            if (filterValue !== 'all') {
                show = status === filterValue;
            }
            
            row.style.display = show ? '' : 'none';
        });
    }

    sortData(sortBy) {
        // Implementation for sorting data
        console.log('Sorting by:', sortBy);
        // TODO: Implement sorting logic
    }

    async refreshCurrentCategory() {
        await this.loadCategoryData(this.currentCategory);
    }

    async saveAllChanges() {
        console.log('DEBUG: saveAllChanges called');
        console.log('DEBUG: modifiedItems.size =', this.modifiedItems.size);
        console.log('DEBUG: modifiedItems contents =', Array.from(this.modifiedItems));
        console.log('DEBUG: currentData =', this.currentData);
        
        if (this.modifiedItems.size === 0) {
            console.log('DEBUG: No changes to save, showing message');
            this.showMessage('No changes to save');
            return;
        }

        try {
            this.showSyncIndicator();
            
            const categoryBtn = document.querySelector(`[data-category="${this.currentCategory}"]`);
            const table = categoryBtn ? categoryBtn.dataset.table : null;
            
            if (table === 'loot_items') {
                // Save to loot_items table
                const response = await fetch('/api/loot', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.currentData)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to save loot data');
                }
            } else {
                // Save to json_data table
                const response = await fetch(`/api/data/${this.currentCategory}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.currentData)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to save data');
                }
            }
            
            this.modifiedItems.clear();
            this.broadcastUpdate();
            this.showMessage('✅ Changes saved successfully');
            
            // Remove modified styling
            document.querySelectorAll('.modified').forEach(row => {
                row.classList.remove('modified');
            });
            
        } catch (error) {
            console.error('Save failed:', error);
            this.showError(`Failed to save changes: ${error.message}`);
        } finally {
            this.hideSyncIndicator();
        }
    }

    broadcastUpdate() {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
                type: 'update',
                category: this.currentCategory,
                timestamp: Date.now()
            }));
        }
    }

    toggleSelectAll(checked) {
        this.selectedItems.clear();
        
        document.querySelectorAll('.item-checkbox').forEach((checkbox, index) => {
            checkbox.checked = checked;
            if (checked) {
                this.selectedItems.add(index);
            }
        });
    }

    updateSelectAllState() {
        const selectAll = document.getElementById('select-all');
        const checkboxes = document.querySelectorAll('.item-checkbox');
        const checkedBoxes = document.querySelectorAll('.item-checkbox:checked');
        
        if (selectAll) {
            selectAll.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < checkboxes.length;
            selectAll.checked = checkedBoxes.length === checkboxes.length && checkboxes.length > 0;
        }
    }

    showBulkModal() {
        const modal = document.getElementById('bulk-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideBulkModal() {
        const modal = document.getElementById('bulk-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async executeBulkAction(action) {
        if (this.selectedItems.size === 0) {
            this.showError('No items selected');
            return;
        }

        try {
            this.selectedItems.forEach(index => {
                const item = this.currentData[index];
                  switch (action) {
                    case 'activate':
                        if (this.currentCategory === 'loot') {
                            item.copies = Math.max(1, item.copies || 0);
                        } else {
                            item.STATUS = '🟢';
                        }
                        break;
                    case 'deactivate':
                        if (this.currentCategory === 'loot') {
                            item.copies = 0;
                        } else {
                            item.STATUS = '🔴';
                        }
                        break;
                    case 'reset-copies':
                        item.copies = 0;
                        break;                    case 'reset-watched':
                        if (this.currentCategory === 'loot') {
                            item.times_seen = 0;
                        } else {
                            item.WATCHED = 0;
                        }
                        break;
                    case 'mark-completed':
                        const config = this.categoryConfigs[this.currentCategory];
                        if (config && config.completedField) {
                            item[config.completedField] = '✅';
                        }
                        break;
                    case 'mark-incomplete':
                        const configIncomplete = this.categoryConfigs[this.currentCategory];
                        if (configIncomplete && configIncomplete.completedField) {
                            item[configIncomplete.completedField] = '⏳';
                        }
                        break;
                }
                
                this.markAsModified(index);
            });
            
            this.renderTable();
            this.hideBulkModal();
            this.showMessage(`✅ Bulk action applied to ${this.selectedItems.size} items`);
            
        } catch (error) {
            console.error('Bulk action failed:', error);
            this.showError(`Bulk action failed: ${error.message}`);
        }
    }

    editItem(index) {
        // Implementation for editing individual items
        console.log('Editing item:', index);
        // TODO: Implement item editing modal
    }

    handleRealTimeUpdate(data) {
        if (data.type === 'update' && data.category === this.currentCategory) {
            // Refresh current category data
            this.loadCategoryData(this.currentCategory);
        } else if (data.type === 'sync-status') {
            this.handleSyncStatusUpdate(data);
        }
    }

    handleSyncStatusUpdate(syncData) {
        this.updateSyncStatus(syncData);
    }

    showLoading() {
        const loading = document.getElementById('loading-state');
        if (loading) {
            loading.classList.remove('hidden');
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading-state');
        if (loading) {
            loading.classList.add('hidden');
        }
    }

    showEmpty() {
        const empty = document.getElementById('empty-state');
        if (empty) {
            empty.classList.remove('hidden');
        }
    }

    hideEmpty() {
        const empty = document.getElementById('empty-state');
        if (empty) {
            empty.classList.add('hidden');
        }
    }

    showSyncIndicator() {
        const indicator = document.getElementById('sync-indicator');
        if (indicator) {
            indicator.classList.remove('hidden');
        }
    }

    hideSyncIndicator() {
        const indicator = document.getElementById('sync-indicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }

    async performManualSync() {
        try {
            console.log('🔄 Initiating manual sync - Database to JSON files');
            this.showSyncIndicator();
            
            const response = await fetch('/api/sync/database-to-json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Sync failed: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ Manual sync completed:', result);
            
            this.showMessage(`✅ Sync completed: ${result.message}`);
            this.updateSyncStatus(result.data);
            
        } catch (error) {
            console.error('❌ Manual sync failed:', error);
            this.showError(`Manual sync failed: ${error.message}`);
        } finally {
            this.hideSyncIndicator();
        }
    }

    updateSyncStatus(syncData) {
        // Update any sync status indicators in the UI
        const timestamp = new Date(syncData.timestamp).toLocaleTimeString();
        console.log(`📊 Sync status updated at ${timestamp}:`, syncData);
        
        // Could add visual indicators here if needed
        if (syncData.categories) {
            Object.entries(syncData.categories).forEach(([category, success]) => {
                const categoryBtn = document.querySelector(`[data-category="${category}"]`);
                if (categoryBtn && success) {
                    // Add visual indicator for successful sync
                    categoryBtn.classList.add('sync-success');
                    setTimeout(() => categoryBtn.classList.remove('sync-success'), 2000);
                }
            });
        }
    }

    showMessage(message) {
        console.log(message);
        const toast = document.getElementById('status-toast');
        const toastMessage = document.getElementById('toast-message');
        const toastIcon = document.getElementById('toast-icon');
        
        if (toast && toastMessage && toastIcon) {
            toastMessage.textContent = message;
            toastIcon.textContent = '✅';
            toast.classList.remove('hidden');
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    }

    showError(message) {
        console.error(message);
        const toast = document.getElementById('status-toast');
        const toastMessage = document.getElementById('toast-message');
        const toastIcon = document.getElementById('toast-icon');
        
        if (toast && toastMessage && toastIcon) {
            toastMessage.textContent = message;
            toastIcon.textContent = '❌';
            toast.classList.remove('hidden');
            
            // Auto-hide after 5 seconds for errors (longer to ensure user sees it)
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 5000);
        }
    }    // Mobile Category Navigation Methods
    toggleMobileCategoryNav() {
        const categoryNav = document.getElementById('mobile-category-nav');
        const mobileToggle = document.getElementById('mobile-category-toggle');
        
        if (categoryNav && mobileToggle) {
            const isExpanded = categoryNav.classList.contains('expanded');
            
            if (isExpanded) {
                this.closeMobileCategoryNav();
            } else {
                this.openMobileCategoryNav();
            }
        }
    }

    openMobileCategoryNav() {
        const categoryNav = document.getElementById('mobile-category-nav');
        const mobileToggle = document.getElementById('mobile-category-toggle');
        
        if (categoryNav && mobileToggle) {
            categoryNav.classList.add('expanded');
            mobileToggle.classList.add('expanded');
            
            // Update aria attributes for accessibility
            mobileToggle.setAttribute('aria-expanded', 'true');
            categoryNav.setAttribute('aria-hidden', 'false');
        }
    }

    closeMobileCategoryNav() {
        const categoryNav = document.getElementById('mobile-category-nav');
        const mobileToggle = document.getElementById('mobile-category-toggle');
        
        if (categoryNav && mobileToggle) {
            categoryNav.classList.remove('expanded');
            mobileToggle.classList.remove('expanded');
            
            // Update aria attributes for accessibility
            mobileToggle.setAttribute('aria-expanded', 'false');
            categoryNav.setAttribute('aria-hidden', 'true');
        }
    }

    // Enhanced category switching for mobile
    async switchCategory(category) {
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-category="${category}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.currentCategory = category;
        
        // Close mobile nav after selection
        if (window.innerWidth <= 1024) {
            this.closeMobileCategoryNav();
        }
        
        // Load category data
        await this.loadCategoryData(category);
        
        // Update title
        const titles = {
            coop: '🎮 CO-OP Games',
            loot: '📦 LOOT Boxes',
            pvp: '⚔️ PVP Games',
            movies: '🎬 Movies',
            anime: '🎌 Anime',
            youtube: '📺 YouTube',
            sundaymorning: '🌅 Sunday Morning',
            sundaynight: '🌙 Sunday Night',
            singleplayer: '🎯 Single Player'
        };
        const categoryTitle = document.getElementById('category-title');
        if (categoryTitle) {
            categoryTitle.textContent = titles[category] || category;
        }
    }
}

// Initialize the admin dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});
