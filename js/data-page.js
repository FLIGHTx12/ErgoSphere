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
          itemDiv.classList.add('collapsible-item');

          // If the item has a link, make the div clickable
          if (item.Link) {
            itemDiv.style.cursor = 'pointer';
            itemDiv.addEventListener('click', () => {
              window.location.href = item.Link;
            });
          }

          let itemDetails = '';
          for (const key in item) {
            if (item.hasOwnProperty(key) && key !== 'Link' && !key.toLowerCase().includes('image')) {
              itemDetails += `<p><strong style="color: purple;">${key}:</strong> <span style="color: green;">${item[key]}</span></p>`;
            }
          }

          itemDiv.innerHTML = `
            <button class="collapsible">${item.TITLE || item.Title || item.text || 'No Title'}</button>
            <div class="content">
              ${itemDetails}
            </div>
          `;

          container.appendChild(itemDiv);
        });

        // Add collapsible functionality
        const coll = document.getElementsByClassName("collapsible");
        for (let i = 0; i < coll.length; i++) {
          coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            const content = this.nextElementSibling;
            if (content.style.display === "block") {
              content.style.display = "none";
            } else {
              content.style.display = "block";
            }
          });
        }
      })
      .catch(error => console.error('Error loading data:', error));
  }
});
