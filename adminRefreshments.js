document.addEventListener('DOMContentLoaded', () => {
  const categorySelect = document.getElementById('categorySelect');
  const optionInput = document.getElementById('optionInput');
  const optionCost = document.getElementById('optionCost'); // new cost input
  const addBtn = document.getElementById('addOptionBtn');
  const removeBtn = document.getElementById('removeOptionBtn');
  const allOptionsDiv = document.getElementById('allCurrentOptions');

  let refreshmentsData = {};

  // Load current refreshment options
  function loadOptions() {
    fetch('/api/refreshments')
      .then(res => res.json())
      .then(data => {
        refreshmentsData = data;
        displayAllOptions();
      })
      .catch(err => console.error('Error loading options:', err));
  }

  // Display all categories grouped
  function displayAllOptions() {
    allOptionsDiv.innerHTML = '';
    Object.keys(refreshmentsData).forEach(category => {
      const options = refreshmentsData[category];
      let section = document.createElement('div');
      section.innerHTML = `<h3>${category}</h3>`;
      if (options && options.length) {
        let list = document.createElement('ul');
        options.forEach((opt, idx) => {
          // Delete button now includes category and index.
          let li = document.createElement('li');
          li.innerHTML = `${opt} <button data-category="${category}" data-idx="${idx}" class="deleteOptionBtn">X</button>`;
          list.appendChild(li);
        });
        section.appendChild(list);
      } else {
        section.innerHTML += `<p>No options available.</p>`;
      }
      allOptionsDiv.appendChild(section);
    });
    // Add event listeners for delete buttons
    document.querySelectorAll('.deleteOptionBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = e.target.getAttribute('data-category');
        const idx = e.target.getAttribute('data-idx');
        removeOption(cat, idx);
      });
    });
  }

  // Save updated options back to server
  function saveOptions() {
    fetch('/api/refreshments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(refreshmentsData)
    })
    .then(res => res.json())
    .then(() => loadOptions())
    .catch(err => console.error('Error saving options:', err));
  }

  // Add option using both text and cost
  function addOption() {
    console.log("Add Option button pressed");  // Debug log
    const category = categorySelect.value;
    const text = optionInput.value.trim();
    const cost = optionCost.value.trim();
    console.log("Inputs:", { category, text, cost }); // Debug log
    if (!text || !cost) return alert('Please enter both option text and cost.');
    const newItem = `${text} - ${cost}💷`;
    if (!refreshmentsData[category]) refreshmentsData[category] = [];
    refreshmentsData[category].push(newItem);
    optionInput.value = '';
    optionCost.value = '';
    saveOptions();
  }

  // Remove option given a category and index
  function removeOption(category, index) {
    refreshmentsData[category].splice(index, 1);
    saveOptions();
  }

  // Remove last option of current selected category
  removeBtn.addEventListener('click', () => {
    const category = categorySelect.value;
    if (refreshmentsData[category] && refreshmentsData[category].length) {
      refreshmentsData[category].pop();
      saveOptions();
    } else {
      alert('No options to remove in this category.');
    }
  });

  addBtn.addEventListener('click', addOption);

  // Reload options when category selection changes to highlight adding (optional)
  categorySelect.addEventListener('change', displayAllOptions);

  loadOptions();
});
