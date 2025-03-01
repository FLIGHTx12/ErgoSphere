let currentPool = [];
let currentPoolName = 'loot';

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadPool('loot');
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
