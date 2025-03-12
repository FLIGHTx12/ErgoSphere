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
        const isYoutubePage = window.location.pathname.includes('youtube.html');

        // Helper to get the title from either key
        function getTitle(item) {
          return item.text || item.TITLE || item.Title || 'No Title';
        }

        let processedData = data;
        if (isYoutubePage) {
          // Group items by channel
          processedData = data.reduce((acc, item) => {
            const channel = item.CHANNEL || 'Unknown Channel';
            if (!acc[channel]) {
              acc[channel] = [];
            }
            acc[channel].push(item);
            return acc;
          }, {});
        }

        // Function to handle each item, including those within arrays
        function processItem(item) {
          const itemDiv = document.createElement('div');
          itemDiv.classList.add('item-row');

          // Use getTitle() to set the title text interchangeably
          let itemText = getTitle(item);
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
          if (item['Series Length'] && item['Series Length'].trim() !== '') {
              detailsHTML += `<p><strong>Series Length:</strong> ${item['Series Length']}</p>`;
          }
          if (item['LAST WATCHED'] && item['LAST WATCHED'].trim() !== '') {
              detailsHTML += `<p><strong>Last Watched:</strong> ${item['LAST WATCHED']}</p>`;
          }
          if (item['OwnerShip'] && item['OwnerShip'].trim() !== '') {
              detailsHTML += `<p><strong>Ownership:</strong> ${item['OwnerShip']}</p>`;
          }
          if (item.GENRE && item.GENRE.trim() !== '') {
              detailsHTML += `<p><strong>Genre:</strong> ${item.GENRE}</p>`;
          }
          if (item.RUNTIME && item.RUNTIME.trim() !== '') {
              detailsHTML += `<p><strong>Runtime:</strong> ${item.RUNTIME}</p>`;
          }
          if (item['Max Episodes'] && item['Max Episodes'].trim() !== '') {
              detailsHTML += `<p><strong>Max Episodes:</strong> ${item['Max Episodes']}</p>`;
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
          return itemDiv;
        }

        // Iterate through the data and process each item
        if (isYoutubePage) {
          // Sort channels alphabetically
          const sortedChannels = Object.keys(processedData).sort();

          sortedChannels.forEach(channel => {
            const channelItems = processedData[channel];

            const channelDiv = document.createElement('div');
            channelDiv.classList.add('channel-section');
            channelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

            // Add collapsible functionality
            const channelHeader = document.createElement('h2');
            channelHeader.textContent = channel;
            channelHeader.classList.add('collapsible');
            channelDiv.appendChild(channelHeader);

            const channelContent = document.createElement('div');
            channelContent.classList.add('content');
            channelContent.style.display = 'none'; // Initially hide the content

            channelItems.forEach(item => {
              const itemDiv = processItem(item);
              channelContent.appendChild(itemDiv);
            });

            channelDiv.appendChild(channelContent);
            container.appendChild(channelDiv);

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
        } else {
          data.forEach(item => {
            processItem(item);
          });
        }
          
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
