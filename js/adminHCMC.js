let currentPool = [];
let currentPoolName = 'loot';

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadPool('loot');
    initializeAdmin();
});

function initializeEventListeners() {
    document.getElementById('load-pool').addEventListener('click', () => {
        const pool = document.getElementById('pool-select').value;
        loadPool(pool);
    });

    document.getElementById('option-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveOption();
    });

    document.getElementById('search').addEventListener('input', filterOptions);
    document.getElementById('filter').addEventListener('change', filterOptions);
}

async function loadPool(poolName) {
    try {
        const response = await fetch(`../../data/${poolName}.json`);
        currentPool = await response.json();
        currentPoolName = poolName;
        displayOptions();
    } catch (error) {
        console.error('Error loading pool:', error);
        alert('Error loading pool data');
    }
}

async function savePool() {
    try {
        // Show confirmation dialog before saving
        if (!confirm('Are you sure you want to save changes to the pool? This will update the existing data.')) {
            return;
        }

        const response = await fetch('/api/savePool', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pool: currentPoolName,
                data: currentPool
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to save pool');
        }
        
        showToast('Pool saved successfully', 'success');
    } catch (error) {
        console.error('Error saving pool:', error);
        showToast(`Error saving pool: ${error.message}`, 'error');
    }
}

// Add new backup management functions
async function loadBackups() {
    try {
        const response = await fetch(`/api/backups/${currentPoolName}`);
        const backups = await response.json();
        return backups;
    } catch (error) {
        console.error('Error loading backups:', error);
        return [];
    }
}

async function restoreBackup(backupId) {
    try {
        const response = await fetch(`/api/restore/${currentPoolName}/${backupId}`);
        const restoredData = await response.json();
        currentPool = restoredData;
        displayOptions();
        showToast('Backup restored successfully', 'success');
    } catch (error) {
        console.error('Error restoring backup:', error);
        showToast('Error restoring backup', 'error');
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function saveOption() {
    const form = document.getElementById('option-form');
    const newOption = {
        text: form.text.value,
        image: form.image.value.includes(',') ? 
            form.image.value.split(',').map(url => url.trim()) : 
            form.image.value,
        copies: parseInt(form.copies.value),
        genre: form.genre.value,
        details: form.details.value,
        cost: form.cost.value,
        'after spin': form['after-spin'].value,
        link: form.link.value,
        type: 'loot'
    };

    currentPool.push(newOption);
    savePool();
    displayOptions();
    form.reset();
}

function displayOptions() {
    const optionsList = document.getElementById('options');
    optionsList.innerHTML = '';

    currentPool.forEach((option, index) => {
        const li = document.createElement('li');
        li.className = 'option-item';
        li.innerHTML = `
            <div class="option-info">
                <strong>${option.text || 'Unnamed Option'}</strong>
                <span>Copies: ${option.copies}</span>
                <span>Genre: ${option.genre || 'None'}</span>
            </div>
            <div class="option-controls">
                <button onclick="editOption(${index})">Edit</button>
                <button onclick="deleteOption(${index})">Delete</button>
                <button onclick="adjustCopies(${index}, 1)">+</button>
                <button onclick="adjustCopies(${index}, -1)">-</button>
            </div>
        `;
        optionsList.appendChild(li);
    });
}

function filterOptions() {
    const search = document.getElementById('search').value.toLowerCase();
    const filter = document.getElementById('filter').value;
    const items = document.querySelectorAll('.option-item');

    items.forEach(item => {
        const text = item.querySelector('strong').textContent.toLowerCase();
        const copies = parseInt(item.querySelector('span').textContent.split(': ')[1]);
        
        const matchesSearch = text.includes(search);
        const matchesFilter = 
            filter === 'all' || 
            (filter === 'active' && copies > 0) || 
            (filter === 'inactive' && copies === 0);

        item.style.display = matchesSearch && matchesFilter ? 'flex' : 'none';
    });
}

function editOption(index) {
    const option = currentPool[index];
    const form = document.getElementById('option-form');
    
    form.text.value = option.text || '';
    form.image.value = Array.isArray(option.image) ? option.image.join(', ') : option.image;
    form.copies.value = option.copies || 0;
    form.genre.value = option.genre || '';
    form.details.value = option.details || '';
    form.cost.value = option.cost || '';
    form['after-spin'].value = option['after spin'] || '';
    form.link.value = option.link || '';

    currentPool.splice(index, 1);
    savePool();
    displayOptions();
}

function deleteOption(index) {
    if (confirm('Are you sure you want to delete this option?')) {
        currentPool.splice(index, 1);
        savePool();
        displayOptions();
    }
}

function adjustCopies(index, amount) {
    currentPool[index].copies = Math.max(0, (currentPool[index].copies || 0) + amount);
    savePool();
    displayOptions();
}

function initializeAdmin() {
    // Mode selection handlers
    document.getElementById('add-mode').addEventListener('click', () => showSection('pool-selection', 'add'));
    document.getElementById('edit-mode').addEventListener('click', () => showSection('pool-selection', 'edit'));

    // Pool selection handlers
    document.querySelectorAll('#pool-selection button[data-pool]').forEach(button => {
        button.addEventListener('click', () => handlePoolSelection(button.dataset.pool));
    });

    // Back button handlers
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', handleBack);
    });
}

function showSection(sectionId, mode = null) {
    // Hide all sections first
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show the requested section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
    }
    
    // Store the current mode if provided
    if (mode) {
        localStorage.setItem('currentMode', mode);
    }

    // Log for debugging
    console.log(`Showing section: ${sectionId}, Mode: ${mode}`);
}

function handlePoolSelection(poolName) {
    console.log(`Pool selected: ${poolName}`); // Debug log
    const mode = localStorage.getItem('currentMode');
    console.log(`Current mode: ${mode}`); // Debug log

    try {
        await loadPool(poolName);
        if (mode === 'add') {
            await loadAddForm(poolName);
        } else {
            await loadEditView(poolName);
        }
    } catch (error) {
        console.error('Error handling pool selection:', error);
        showToast('Error loading pool data', 'error');
    }
}

async function loadImageOptions(poolName) {
    try {
        const response = await fetch(`/api/images/${poolName}`);
        if (!response.ok) throw new Error('Failed to load images');
        return await response.json();
    } catch (error) {
        console.error('Error loading images:', error);
        showToast('Error loading images', 'error');
        return [];
    }
}

async function loadAddForm(poolName) {
    showLoading(true);
    try {
        const form = document.getElementById('option-form');
        const imageOptions = await loadImageOptions(poolName);
        
        form.innerHTML = `
            <div class="form-group">
                <label for="text">Text:</label>
                <input type="text" id="text" required>
            </div>
            <div class="form-group">
                <label for="image">Image:</label>
                <select id="image" required>
                    <option value="">Select an image...</option>
                    ${imageOptions.map(img => 
                        `<option value="${img.path}">${img.name}</option>`
                    ).join('')}
                    <option value="multiple">Multiple Images...</option>
                </select>
                <div id="multiple-images" class="hidden">
                    <div class="image-grid">
                        ${imageOptions.map(img => `
                            <div class="image-option">
                                <input type="checkbox" id="${img.name}" value="${img.path}">
                                <label for="${img.name}">
                                    <img src="${img.path}" alt="${img.name}">
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label for="genre">Genre:</label>
                <select id="genre" required>
                    <option value="hazzard">Hazzard</option>
                    <option value="helper">Helper</option>
                    <option value="week modifiers">Week Modifiers</option>
                    <option value="want">Want</option>
                </select>
            </div>
            <div class="form-group">
                <label for="copies">Copies:</label>
                <input type="number" id="copies" min="0" value="0">
            </div>
            <div class="form-group">
                <label for="details">Details:</label>
                <textarea id="details"></textarea>
            </div>
            <div class="form-group">
                <label for="cost">Cost:</label>
                <input type="text" id="cost">
            </div>
            <div class="form-group">
                <label for="after-spin">After Spin:</label>
                <input type="text" id="after-spin">
            </div>
            <div class="form-group">
                <label for="link">Link:</label>
                <input type="url" id="link">
            </div>
            <div class="button-group">
                <button type="submit">Save Option</button>
                <button type="reset">Clear Form</button>
            </div>
        `;

        // Add image selection handler
        form.querySelector('#image').addEventListener('change', (e) => {
            const multipleImages = document.getElementById('multiple-images');
            multipleImages.classList.toggle('hidden', e.target.value !== 'multiple');
        });

        showSection('add-form');
    } catch (error) {
        console.error('Error setting up form:', error);
        showToast('Error setting up form', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadEditView(poolName) {
    const container = document.getElementById('options-container');
    const data = await loadPoolData(poolName);
    
    // Group by genre and sort alphabetically
    const groupedOptions = groupAndSortOptions(data);
    
    container.innerHTML = Object.entries(groupedOptions)
        .map(([genre, options]) => `
            <div class="genre-section">
                <h4>${genre}</h4>
                <div class="option-list">
                    ${options.map(option => createOptionCard(option)).join('')}
                </div>
            </div>
        `).join('');

    showSection('edit-view');
}

function groupAndSortOptions(data) {
    const grouped = data.reduce((acc, option) => {
        const genre = option.genre || 'Uncategorized';
        if (!acc[genre]) acc[genre] = [];
        acc[genre].push(option);
        return acc;
    }, {});

    // Sort within each genre
    Object.keys(grouped).forEach(genre => {
        grouped[genre].sort((a, b) => a.text.localeCompare(b.text));
    });

    return grouped;
}

function createOptionCard(option) {
    return `
        <div class="option-card" data-id="${option.id}">
            <div class="option-info">
                <strong>${option.text}</strong>
                <span>Copies: ${option.copies}</span>
            </div>
            <div class="option-controls">
                <button onclick="adjustCopies(${option.id}, 1)">+</button>
                <button onclick="adjustCopies(${option.id}, -1)">-</button>
                <button onclick="editOption(${option.id})">Edit</button>
                <button onclick="deleteOption(${option.id})">Delete</button>
            </div>
        </div>
    `;
}

// Add loading state management
function showLoading(show) {
    const loader = document.getElementById('loader') || createLoader();
    loader.style.display = show ? 'flex' : 'none';
}

function createLoader() {
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.innerHTML = `
        <div class="spinner"></div>
        <p>Loading...</p>
    `;
    document.body.appendChild(loader);
    return loader;
}

function handleBack() {
    const currentMode = localStorage.getItem('currentMode');
    if (document.getElementById('add-form').classList.contains('hidden') === false ||
        document.getElementById('edit-view').classList.contains('hidden') === false) {
        showSection('pool-selection', currentMode);
    } else {
        showSection('mode-selection');
        localStorage.removeItem('currentMode');
    }
}
