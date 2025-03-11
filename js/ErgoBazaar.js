// Define the mapping of categories to their respective JSON file paths
const categoryFileMap = {
  "Single Player Games": "data/singleplayer.json",
  "Spin the wheel PVP Games": "data/pvp.json",
  "Spin the wheel Co-op Games": "data/coop.json",
  "Spin the wheel Loot Boxes": "data/loot.json",
  "Bingwa Movie Night": "data/movies.json",
  "YouTube Theater": "data/youtube.json",
  "Anime Shows": "data/anime.json",
  "Sunday Morning Shows": "data/sundaymorning.json",
  "Sunday Night Shows": "data/sundaynight.json"
};

// Set default user type
let userType = "KUSHINDWA";

document.addEventListener('DOMContentLoaded', () => {
  
  // Function to fetch options from JSON file
  const fetchOptions = async (filePath) => {
    try {
      const response = await fetch(`../${filePath}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching data from ${filePath}:`, error);
      return [];
    }
  };

  // Populate each category's select boxes with options from the corresponding JSON file.
  document.querySelectorAll('#entertainment .category').forEach(async cat => {
    const catName = cat.getAttribute('data-category');
    const filePath = categoryFileMap[catName];

    if (filePath) {
      const optionsArray = await fetchOptions(filePath);
      cat.querySelectorAll('.ent-select').forEach(select => {
        select.innerHTML = '<option value="0">Select</option>'; // Clear existing options
        optionsArray.forEach(item => {
          // Extract relevant information from the item
          const title = item.Title || item.TITLE || item.text || 'No Title';
          let status = item.STATUS || '';
          const watched = item["TIMES SEEN"] || item.WATCHED || '';
          let copies = item.copies !== undefined ? `(${item.copies})` : '';

          // Represent copies with green circles
          if (item.copies > 0) {
            copies = '🟢'.repeat(item.copies);
          } else {
            copies = ''; // Or any other default representation if no copies
          }

          // Represent status with green circle
          if (status === "🟢") {
            status = '🟢';
          } else {
            status = '';
          }

          const optionText = `${title} ${status} ${watched} ${copies}`.trim();
          const opt = document.createElement('option');
          opt.value = title; // Use title as value
          opt.text = optionText;
          select.appendChild(opt);
        });
        // Add change listener to update this category's total when option changes
        select.addEventListener('change', () => {
          updateCategoryTotal(cat);
        });
      });
    } else {
      console.warn(`No file mapping found for category: ${catName}`);
    }
  });
  
  // Add dropdown-based user type listener.
  const userTypeDropdown = document.getElementById('user-type');
  if (userTypeDropdown) {
    userTypeDropdown.addEventListener('change', (e) => {
      userType = e.target.value;
      if (userType === "BINGWA") {
        document.body.classList.add('bingwa-theme');
      } else {
        document.body.classList.remove('bingwa-theme');
      }
      // Update all category totals after multiplier change.
      document.querySelectorAll('#entertainment .category').forEach(cat => {
        updateCategoryTotal(cat);
      });
    });
  }
  
  // Helper function to update a category's total cost.
  function updateCategoryTotal(categoryDiv) {
    // Determine cost multiplier based on user type.
    const multiplier = (userType === "KUSHINDWA") ? 30 : 20;
    let count = 0;
    categoryDiv.querySelectorAll('.ent-select').forEach(select => {
      if (select.selectedIndex > 0) {
        count++;
      }
    });
    // Update the visible total inside the category div.
    const totalElem = categoryDiv.querySelector('.category-total');
    if (totalElem) {
      totalElem.textContent = `${count * multiplier} 💷`;
    }
  }
  
  const submitBtn = document.getElementById('ent-submit');
  const summaryDiv = document.getElementById('ent-summary');
  
  submitBtn.addEventListener('click', () => {
    console.log('Submit button clicked');
    try {
      let summaryHTML = '<hr><h2>ErgoBazaar Summary:</h2><ul>';
      let overallTotal = 0;
      
      // Process each category and accumulate totals.
      document.querySelectorAll('.category').forEach(cat => {
        const catName = cat.getAttribute('data-category');
        const selects = cat.querySelectorAll('.ent-select');
        let selections = [];
        let catCount = 0;
        selects.forEach(select => {
          if (select.selectedIndex > 0) {
            selections.push(select.options[select.selectedIndex].text);
            catCount++;
          }
        });
        // Determine cost multiplier based on user type.
        const multiplier = (userType === "KUSHINDWA") ? 30 : 20;
        const catTotal = catCount * multiplier;
        overallTotal += catTotal;
        if (selections.length > 0) {
          // Use <u> tags to underline the category and <br> for each option.
          summaryHTML += `<li><strong><u>${catName}:</u></strong><br>${selections.join('<br>')} - <em>${catTotal} 💷</em></li><br>`;
        }
      });
      
      const cashout = document.getElementById('cashout-input').value;
      summaryHTML += '</ul>';
      summaryHTML += `<p><hr><strong> TOTAL:</strong><span style="color: gold; font-weight: bold;"> ${overallTotal}💷</span> </p>`;
      summaryHTML += `<p><strong>Cashout Request:</strong> <span style="color: gold; font-weight: bold;">${cashout} 💷</span></p>`;
      summaryHTML += '<hr>';
      
      summaryDiv.innerHTML = summaryHTML;
      summaryDiv.style.display = 'block';
      console.log('Submit processing complete');
    } catch(err) {
      console.error('Error during submit processing:', err);
    }
  });
  
  // New: When summary is clicked, capture its screenshot.
  summaryDiv.addEventListener('click', () => {
    captureScreenshot(summaryDiv);
  });

});