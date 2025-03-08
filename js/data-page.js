document.addEventListener('DOMContentLoaded', () => {
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
        const container = document.getElementById(containerId);

        data.forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.classList.add('item-row');

          let itemText = item.text || item.TITLE || item.Title || 'No Title';
          let indicator = '';
          if (item.status === '🟢') {
            indicator = ' 🟢';
          }
          if (item.copies !== undefined && item.copies > 0) {
            indicator += ' 🟢'.repeat(item.copies);
          }
          let itemLink = item.link ? `<a href="${item.link}" target="_blank">${itemText}${indicator}</a>` : `${itemText}${indicator}`;

          let detailsHTML = '';
          detailsHTML += item.status !== undefined ? `<p><strong>Status:</strong> ${item.status}</p>` : '';
          detailsHTML += item.copies !== undefined ? `<p><strong>Copies:</strong> ${item.copies}</p>` : '';
          detailsHTML += item['Series Length'] !== undefined ? `<p><strong>Series Length:</strong> ${item['Series Length']}</p>` : '';
          detailsHTML += item['LAST WATCHED'] !== undefined ? `<p><strong>Last Watched:</strong> ${item['LAST WATCHED']}</p>` : '';
          detailsHTML += item['OwnerShip'] !== undefined ? `<p><strong>Ownership:</strong> ${item['OwnerShip']}</p>` : '';
          detailsHTML += item.RUNTIME !== undefined ? `<p><strong>Runtime:</strong> ${item.RUNTIME}</p>` : '';
          detailsHTML += item['Max Episodes'] !== undefined ? `<p><strong>Max Episodes:</strong> ${item['Max Episodes']}</p>` : '';
          detailsHTML += item.console !== undefined ? `<p><strong>Console:</strong> ${item.console}</p>` : '';
          detailsHTML += item.genre !== undefined ? `<p><strong>Genre:</strong> ${item.genre}</p>` : '';
          detailsHTML += item.cost !== undefined ? `<p><strong>Cost:</strong> ${item.cost}</p>` : '';
          detailsHTML += item.mode !== undefined ? `<p><strong>Mode:</strong> ${item.mode}</p>` : '';
          detailsHTML += item['after spin'] !== undefined ? `<p><strong>After Spin:</strong> ${item['after spin']}</p>` : '';
          detailsHTML += item['time per match'] !== undefined ? `<p><strong>Time Per Match:</strong> ${item['time per match']}</p>` : '';
          detailsHTML += item['TIME TO BEAT'] !== undefined ? `<p><strong>Time to Beat:</strong> ${item['TIME TO BEAT']}</p>` : '';
          detailsHTML += item.playability !== undefined ? `<p><strong>Playability:</strong> ${item.playability}</p>` : '';
          detailsHTML += item['COMPLETED?'] !== undefined ? `<p><strong>Completed:</strong> ${item['COMPLETED?']}</p>` : '';
          detailsHTML += item.description !== undefined ? `<p><strong>Description:</strong> ${item.description}</p>` : '';

          itemDiv.innerHTML = `
            <div class="item-title">${itemLink}</div>
            <div class="item-details">${detailsHTML}</div>
          `;

          container.appendChild(itemDiv);

          itemDiv.addEventListener('click', () => {
            itemDiv.classList.toggle('expanded');
          });
        });
      })
      .catch(error => console.error('Error loading data:', error));
  }
});
