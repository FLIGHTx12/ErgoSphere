// Function to load and display items from a JSON file
function loadItems(file, containerId) {
  fetch(file)
    .then(response => response.json())
    .then(data => {
      console.log('Data:', data); // Debug: log parsed JSON data
      const container = document.getElementById(containerId);
      data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        itemDiv.innerHTML = `
          <p>${item.text}</p>
          <span class="copies-count">${item.copies}</span>
          <div class="buttons">
            <button class="decrease-button">-</button>
            <button class="increase-button">+</button>
          </div>
        `;

        // Add event listeners for buttons
        const decreaseButton = itemDiv.querySelector('.decrease-button');
        const increaseButton = itemDiv.querySelector('.increase-button');
        const copiesCountSpan = itemDiv.querySelector('.copies-count');

        decreaseButton.addEventListener('click', () => {
          if (item.copies > 0) {
            item.copies--;
            copiesCountSpan.textContent = item.copies;
            // Save the updated JSON data back to the file (implementation below)
            saveItems(file, data);
          }
        });

        increaseButton.addEventListener('click', () => {
          item.copies++;
          copiesCountSpan.textContent = item.copies;
          // Save the updated JSON data back to the file (implementation below)
          saveItems(file, data);
        });

        container.appendChild(itemDiv);
      });
    })
    .catch(error => {
      console.error('Error loading or parsing JSON:', error); // Error handling
    });
}

// Function to save the updated JSON data back to the file
function saveItems(file, data) {
  fetch(file, {
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