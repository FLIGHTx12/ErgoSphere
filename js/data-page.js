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
          // If status is 🟢 then add a 🟢 indicator
          if (item.status === '🟢' || item.STATUS === '🟢') {
            indicator += ' 🟢';
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
          // Preserve copies behavior
          if (item.copies !== undefined && item.copies > 0) {
            indicator += ' 🟢'.repeat(item.copies);
          }
          
          // Use "link", "LINK", or "Link" property to generate the anchor
          let linkVal = item.link || item.LINK || item.Link || '';
          let itemLink = linkVal 
            ? `<a class="item-title-link" data-href="${linkVal}" target="_blank">${itemText}${indicator}</a>` 
            : `${itemText}${indicator}`;

          // Replace detailsHTML construction with conditional checks
          let detailsHTML = '';
          if (item.status && item.status.trim() !== '') {
              detailsHTML += `<p><strong>Status:</strong> ${item.status}</p>`;
          }
          if (item.copies !== undefined) {
              detailsHTML += `<p><strong>Copies:</strong> ${item.copies}</p>`;
          }
          if (item['Series Length'] && item['Series Length'].trim() !== '') {
              detailsHTML += `<p><strong>Series Length:</strong> ${item['Series Length']}</p>`;
          }
          if (item['LAST WATCHED'] && item['LAST WATCHED'].trim() !== '') {
              detailsHTML += `<p><strong>Last Watched:</strong> ${item['LAST WATCHED']}</p>`;
          }
          if (item['OwnerShip'] && item['OwnerShip'].trim() !== '') {
              detailsHTML += `<p><strong>Ownership:</strong> ${item['OwnerShip']}</p>`;
          }
          if (item.RUNTIME && item.RUNTIME.trim() !== '') {
              detailsHTML += `<p><strong>Runtime:</strong> ${item.RUNTIME}</p>`;
          }
          if (item['Max Episodes'] && item['Max Episodes'].trim() !== '') {
              detailsHTML += `<p><strong>Max Episodes:</strong> ${item['Max Episodes']}</p>`;
          }
          if (item.console && item.console.trim() !== '') {
              detailsHTML += `<p><strong>Console:</strong> ${item.console}</p>`;
          }
          if (item.genre && item.genre.trim() !== '') {
              detailsHTML += `<p><strong>Genre:</strong> ${item.genre}</p>`;
          }
          if (item.cost && item.cost.trim() !== '') {
              detailsHTML += `<p><strong>Cost:</strong> ${item.cost}</p>`;
          }
          if (item.mode && item.mode.trim() !== '') {
              detailsHTML += `<p><strong>Mode:</strong> ${item.mode}</p>`;
          }
          if (item['after spin'] && item['after spin'].trim() !== '') {
              detailsHTML += `<p><strong>After Spin:</strong> ${item['after spin']}</p>`;
          }
          if (item['time per match'] && item['time per match'].trim() !== '') {
              detailsHTML += `<p><strong>Time Per Match:</strong> ${item['time per match']}</p>`;
          }
          if (item['TIME TO BEAT'] && item['TIME TO BEAT'].trim() !== '') {
              detailsHTML += `<p><strong>Time to Beat:</strong> ${item['TIME TO BEAT']}</p>`;
          }
          if (item.playability && item.playability.trim() !== '') {
              detailsHTML += `<p><strong>Playability:</strong> ${item.playability}</p>`;
          }
          if (item['COMPLETED?'] && item['COMPLETED?'].trim() !== '') {
              detailsHTML += `<p><strong>Completed:</strong> ${item['COMPLETED?']}</p>`;
          }
          if ((item.description && item.description.trim() !== '') || (item.DESCRIPTION && item.DESCRIPTION.trim() !== '')) {
            const desc = item.description || item.DESCRIPTION;
            detailsHTML += `<p><strong>Description:</strong> ${desc}</p>`;
          }

          itemDiv.innerHTML = `
            <div class="item-title">${itemLink}</div>
            <div class="item-details">${detailsHTML}</div>
          `;

          container.appendChild(itemDiv);

          // Updated click event: collapse other items and toggle expansion.
          itemDiv.addEventListener('click', function(event) {
              event.stopPropagation();
              const allItems = container.querySelectorAll('.item-row');
              allItems.forEach(el => {
                  if (el !== this) {
                      el.classList.remove('expanded');
                      // Ensure link in closed items is disabled and styling reset
                      const link = el.querySelector('a.item-title-link');
                      if (link) {
                          link.removeAttribute('href');
                          link.style.color = '';
                      }
                  }
              });
              this.classList.toggle('expanded');
              // If expanded, enable the link and style it; otherwise, disable it.
              const currentLink = this.querySelector('a.item-title-link');
              if (currentLink) {
                if (this.classList.contains('expanded')) {
                  currentLink.setAttribute('href', currentLink.dataset.href);
                  currentLink.style.color = 'lightgreen';
                } else {
                  currentLink.removeAttribute('href');
                  currentLink.style.color = '';
                }
              }
          });
        });
          
          // Add Collapse All functionality if the button exists
          const collapseAll = document.getElementById('collapse-all');
          if (collapseAll) {
              collapseAll.addEventListener('click', function() {
                  const items = container.querySelectorAll('.item-row');
                  items.forEach(el => {
                      el.classList.remove('expanded');
                      // Disable links in closed items and reset styling
                      const link = el.querySelector('a.item-title-link');
                      if (link) {
                          link.removeAttribute('href');
                          link.style.color = '';
                      }
                  });
              });
          }
          
      })
      .catch(error => console.error('Error loading data:', error));
  }
});
