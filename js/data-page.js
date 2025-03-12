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

          // Add copies indicators
          if (item.copies !== undefined) {
            indicator += ' 🟢'.repeat(item.copies);
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

          function addDetail(label, value) {
            if (value && value.trim() !== '') {
              detailsHTML += `<p><strong>${label}:</strong> ${value}</p>`;
            }
          }

          addDetail('Details', item.details);
          addDetail('Reward', item.reward);
          addDetail('Punishment', item.punishment);
          addDetail('Genre', item.genre || item.GENRE);
          addDetail('Mode', item.mode);
          addDetail('Time per match', item['Time per match']);
          addDetail('Playability', item.playability);
          addDetail('Console', item.console || item.CONSOLE);
          addDetail('Time to beat', item['time to beat'] || item["TIME TO BEAT"]);
          addDetail('Completed', item.completed || item["COMPLETED?"]);
          if ((item.description && item.description.trim() !== '') || (item.DESCRIPTION && item.DESCRIPTION.trim() !== '')) {
            const desc = item.description || item.DESCRIPTION;
            addDetail('Description', desc);
          }
          addDetail('Cost', item.cost);
          addDetail('After Spin', item['after spin']);
          addDetail('Series Length', item['Series Length']);
          addDetail('Last Watched', item['LAST WATCHED']);
          addDetail('Ownership', item['OwnerShip']);
          addDetail('Runtime', item['RUNTIME']);
          addDetail('Max Episodes', item['Max Episodes']);
          addDetail('Game', item.game);
          addDetail('Watched', item.WATCHED);
          addDetail('Channel', item.CHANNEL);
          addDetail('Times Seen', item['TIMES SEEN']);
          addDetail('Episodes', item.EPISODES);
          addDetail('Console', item.CONSOLE);
          addDetail('Platform', item.PLATFORM);

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
                      el.style.backgroundImage = ''; // Remove background image from other items
                      // Disable links in closed items and reset styling
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
              // Set background image
              let imageUrl = item.imageUrl || '';
              if (item.image) {
                  if (Array.isArray(item.image)) {
                      imageUrl = item.image[0] || ''; // Use the first image from the array
                  } else {
                      imageUrl = item.image;
                  }
              }
              if (imageUrl) {
                  this.style.backgroundImage = `url('${imageUrl}')`;
                  this.style.backgroundSize = 'cover';
                  this.style.backgroundRepeat = 'no-repeat';
                  this.style.color = 'white'; // Ensure text is visible
                  this.style.textShadow = '2px 2px 4px #000000'; // Add text shadow for readability
                  this.style.position = 'relative'; // Add position relative
              } else {
                  this.style.backgroundImage = ''; // Remove background image
                  this.style.color = ''; // Reset text color
                  this.style.textShadow = ''; // Remove text shadow
                  this.style.position = ''; // Remove position relative
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
          // Check if data is an object with container keys
          if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
            // Iterate through each container in the data object
            Object.keys(data).forEach(containerKey => {
              const containerData = data[containerKey];
              if (Array.isArray(containerData)) {
                containerData.forEach(item => {
                  processItem(item);
                });
              } else {
                console.error('Container data is not an array:', containerData);
              }
            });
          } else if (Array.isArray(data)) {
            // If data is an array, process each item directly
            data.forEach(item => {
              processItem(item);
            });
          } else {
            console.error('Data is not an array or object:', data);
          }
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
