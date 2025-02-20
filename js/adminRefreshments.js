document.addEventListener('DOMContentLoaded', () => {
  fetchOptions();

  document.getElementById('addOptionButton').addEventListener('click', () => {
    const category = document.getElementById('categorySelect').value;
    const option = document.getElementById('optionInput').value;
    const cost = document.getElementById('optionCost').value;
    addOption(category, option, cost);
  });
});

function fetchOptions() {
  fetch('/api/admin/refreshments')
    .then(response => response.json())
    .then(data => {
      const optionsList = document.getElementById('optionsList');
      optionsList.innerHTML = '';
      data.forEach(item => {
        const optionDiv = document.createElement('div');
        optionDiv.textContent = `${item.category}: ${item.option} - ${item.cost}💷`;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
          removeOption(item.category, item.option);
        });
        optionDiv.appendChild(removeButton);
        optionsList.appendChild(optionDiv);
      });
    });
}

function addOption(category, option, cost) {
  fetch('/api/admin/refreshments/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ category, option, cost })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        fetchOptions();
      } else {
        alert('Failed to add option.');
      }
    });
}

function removeOption(category, option) {
  fetch('/api/admin/refreshments/remove', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ category, option })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        fetchOptions();
      } else {
        alert('Failed to remove option.');
      }
    });
}
