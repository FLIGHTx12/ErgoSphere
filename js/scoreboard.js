document.addEventListener('DOMContentLoaded', () => {
  // Add navbar scroll behavior
  let lastScrollTop = 0;
  const navbar = document.getElementById('navbar');
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }
    lastScrollTop = scrollTop;
  });

  // Check if device is mobile
  const isMobile = window.innerWidth < 768;
  
  // Add special handling for mobile scrolling when a div is expanded
  if (isMobile) {
    document.body.addEventListener('touchmove', function(e) {
      const expandedItem = document.querySelector('.item-row.expanded');
      if (expandedItem && !expandedItem.contains(e.target)) {
        // Prevent scrolling of body when touching outside expanded item
        e.preventDefault();
      }
    }, { passive: false });
  }

  // Load game data from pvp.json
  const dataFile = '../data/pvp.json';
  const containerId = 'data-container';

  loadItems(dataFile, containerId);

  function loadItems(file, containerId) {
    fetch(file)
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById(containerId);
        
        // Filter out ERGOarena games and sort data alphabetically by game name
        data = data.filter(item => {
          // Skip items with ERGOarena in mode or game fields
          return !(item.mode === 'ERGOarena' || item.game === 'ERGOarena');
        }).sort((a, b) => {
          const gameA = a.game || a.text || '';
          const gameB = b.game || b.text || '';
          return gameA.localeCompare(gameB);
        });

        // Process each item
        data.forEach(item => {
          // Skip items without game property
          if (!item.game && !item.text) return;
          
          const itemDiv = document.createElement('div');
          itemDiv.classList.add('item-row');

          // Get background image if available
          let backgroundImage = '';
          if (item.imageUrl && item.imageUrl.trim() !== '') {
            backgroundImage = item.imageUrl;
          } else if (item.image) {
            if (Array.isArray(item.image)) {
              backgroundImage = item.image[0];
            } else {
              backgroundImage = item.image;
            }
          }

          // Add mouseover event to show background image
          itemDiv.addEventListener('mouseover', function() {
            if (!this.classList.contains('expanded') && backgroundImage) {
              this.style.backgroundImage = `url('${backgroundImage}')`;
            }
          });

          // Add mouseout event to remove background image
          itemDiv.addEventListener('mouseout', function() {
            if (!this.classList.contains('expanded')) {
              this.style.backgroundImage = '';
            }
          });

          // Get game name from either game property or text property
          const gameName = item.game || item.text || 'Unknown Game';
          
          // Create the item title and details elements
          itemDiv.innerHTML = `
            <div class="item-title">${gameName}</div>
            <div class="item-details">
              ${item.details ? `<p>${item.details}</p>` : ''}
              ${item.genre ? `<p><strong>Genre:</strong> ${item.genre}</p>` : ''}
              ${item.console ? `<p><strong>Console:</strong> ${item.console}</p>` : ''}
              ${item.mode ? `<p><strong>Mode:</strong> ${item.mode}</p>` : ''}
              ${item['Time per match'] ? `<p><strong>Time per match:</strong> ${item['Time per match']}</p>` : ''}
              ${item.playability ? `<p><strong>Playability:</strong> ${item.playability}</p>` : ''}
              ${item.description ? `<p><strong>Description:</strong> ${item.description}</p>` : ''}
            </div>
          `;

          // Store the background image URL as a data attribute for later use
          if (backgroundImage) {
            itemDiv.setAttribute('data-bg-image', backgroundImage);
          }

          container.appendChild(itemDiv);

          // Add click event to toggle expansion and show score form
          itemDiv.addEventListener('click', function(event) {
            // Don't handle click events for form elements or their children
            if (event.target.closest('.score-form') || 
                event.target.closest('input') || 
                event.target.closest('select') || 
                event.target.closest('button') || 
                event.target.closest('label') ||
                event.target.closest('.stat-input')) {
              // Just stop propagation but don't do anything else
              event.stopPropagation();
              return;
            }
            
            // Don't expand when clicking on links or details
            if (event.target.closest('.item-details a')) {
              event.stopPropagation();
              return;
            }
            
            // Handle collapse corner click separately
            if (event.target.closest('.collapse-corner')) {
              event.stopPropagation();
              this.classList.remove('expanded');
              const collapseCorner = this.querySelector('.collapse-corner');
              if (collapseCorner) {
                collapseCorner.remove();
              }
              // Reset background
              this.style.backgroundImage = '';
              return;
            }
            
            event.stopPropagation();
            const allItems = container.querySelectorAll('.item-row');
            
            // Remove collapse corner from all items except this one
            allItems.forEach(el => {
              if (el !== this && el.classList.contains('expanded')) {
                el.classList.remove('expanded');
                el.style.backgroundImage = ''; // Remove background image from other items
                const corner = el.querySelector('.collapse-corner');
                if (corner) corner.remove();
              }
            });
            
            // Toggle this item if not already expanded
            if (!this.classList.contains('expanded')) {
              this.classList.add('expanded');
              
              // For mobile: scroll to top and prevent body scrolling
              if (window.innerWidth < 768) {
                window.scrollTo(0, 0);
                document.body.style.overflow = 'hidden';
              }
              
              // Add collapse corner
              const collapseCorner = document.createElement('div');
              collapseCorner.className = 'collapse-corner';
              collapseCorner.innerHTML = '↕';
              collapseCorner.title = 'Click to collapse';
              
              // Insert the button right after the item-title div
              const titleDiv = this.querySelector('.item-title');
              if (titleDiv && titleDiv.nextSibling) {
                this.insertBefore(collapseCorner, titleDiv.nextSibling);
              } else {
                this.appendChild(collapseCorner);
              }
              
              // Position the button properly
              collapseCorner.style.position = 'absolute';
              collapseCorner.style.top = '10px';
              collapseCorner.style.right = '10px';
              collapseCorner.style.zIndex = '1000';
              
              // Set background image
              let bgImage = this.getAttribute('data-bg-image') || '';
              if (bgImage) {
                this.style.backgroundImage = `url('${bgImage}')`;
                this.style.backgroundSize = 'cover';
                this.style.backgroundPosition = 'center';
                this.style.backgroundRepeat = 'no-repeat';
              }

              // Add click handler to the collapse corner
              collapseCorner.addEventListener('click', function(e) {
                e.stopPropagation();
                const parentItem = this.closest('.item-row');
                parentItem.classList.remove('expanded');
                this.remove();
                
                // For mobile: restore body scrolling
                if (window.innerWidth < 768) {
                  document.body.style.overflow = '';
                }
                
                // Reset background
                parentItem.style.backgroundImage = '';
                return false;
              });

              // Add or update score form
              let scoreForm = this.querySelector('.score-form');
              if (!scoreForm) {
                scoreForm = document.createElement('div');
                scoreForm.className = 'score-form';
                
                // Create custom form based on game name
                if (gameName === '3ON3 FREESTYLE') {
                  scoreForm.innerHTML = create3on3FreestyleForm();
                } else if (gameName === 'Sonic all-star racing') {
                  scoreForm.innerHTML = createSonicRacingForm();
                } else {
                  // Create generic score form for other games
                  scoreForm.innerHTML = createGenericScoreForm(gameName);
                }
                
                // Append form after item details
                const detailsDiv = this.querySelector('.item-details');
                if (detailsDiv) {
                  detailsDiv.appendChild(scoreForm);
                } else {
                  this.appendChild(scoreForm);
                }
                
                // Add event listeners for calculation buttons
                const calculateBtn = scoreForm.querySelector('.calculate-btn');
                if (calculateBtn) {
                  calculateBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent bubbling
                    if (gameName === '3ON3 FREESTYLE') {
                      calculate3on3FreestyleScore(scoreForm);
                    } else if (gameName === 'Sonic all-star racing') {
                      calculateSonicRacingScore(scoreForm);
                    } else {
                      calculateGenericScore(scoreForm);
                    }
                  });
                }

                // Add event listener for screenshot button
                const screenshotBtn = scoreForm.querySelector('.screenshot-btn');
                if (screenshotBtn) {
                  screenshotBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent any parent click events
                    
                    // Get parent item-row which has the background image
                    const parentItem = this.closest('.item-row');
                    
                    // Create container with parent's background for screenshot
                    const container = document.createElement('div');
                    container.id = `score-screenshot-${Date.now()}`;
                    container.style.position = 'fixed';
                    container.style.left = '-9999px';
                    container.style.top = '-9999px';
                    container.style.width = '800px';
                    container.style.padding = '20px';
                    container.style.borderRadius = '10px';
                    
                    // Copy background from the parent item
                    const bgImage = parentItem.getAttribute('data-bg-image');
                    if (bgImage) {
                      container.style.backgroundImage = `url('${bgImage}')`;
                      container.style.backgroundSize = 'cover';
                      container.style.backgroundPosition = 'center';
                    } else {
                      container.style.backgroundColor = '#000';
                    }
                    
                    // Create a clone of the score form
                    const scoreFormClone = scoreForm.cloneNode(true);
                    
                    // Add timestamp and game title
                    const header = document.createElement('div');
                    header.innerHTML = `<h3>${gameName} Score</h3>
                      <p>Generated: ${new Date().toLocaleString()}</p>`;
                    header.style.marginBottom = '15px';
                    header.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                    header.style.padding = '10px';
                    header.style.borderRadius = '5px';
                    
                    // Hide screenshot button in the clone
                    const cloneBtn = scoreFormClone.querySelector('.screenshot-btn');
                    if (cloneBtn) {
                      cloneBtn.style.display = 'none';
                    }
                    
                    // Add everything to container
                    container.appendChild(header);
                    container.appendChild(scoreFormClone);
                    document.body.appendChild(container);
                    
                    // Hide the original button for cleaner screenshot
                    this.style.display = 'none';
                    
                    // Load html2canvas and take screenshot
                    if (!window.html2canvas) {
                      const script = document.createElement('script');
                      script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
                      script.onload = () => takeScreenshot();
                      document.head.appendChild(script);
                    } else {
                      takeScreenshot();
                    }
                    
                    function takeScreenshot() {
                      html2canvas(container, {
                        allowTaint: true,
                        useCORS: true,
                        backgroundColor: null,
                        scale: 2
                      }).then(canvas => {
                        // Convert to blob
                        canvas.toBlob(blob => {
                          if (navigator.clipboard && navigator.clipboard.write) {
                            navigator.clipboard.write([
                              new ClipboardItem({ 'image/png': blob })
                            ]).then(() => {
                              alert('Screenshot copied to clipboard!');
                            }).catch(() => {
                              downloadImage(blob);
                            });
                          } else {
                            downloadImage(blob);
                          }
                          
                          // Clean up
                          document.body.removeChild(container);
                          screenshotBtn.style.display = 'block';
                        });
                      });
                    }
                    
                    function downloadImage(blob) {
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${gameName.replace(/\s+/g, '-')}-score.png`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      alert('Screenshot downloaded!');
                    }
                  });
                }
              }
            } else {
              // When collapsing, restore body scrolling on mobile
              if (window.innerWidth < 768) {
                document.body.style.overflow = '';
              }
            }
          });
        });

        // Enhance collapse all button for mobile
        const collapseAllButton = document.getElementById('collapse-all');
        if (collapseAllButton) {
          collapseAllButton.addEventListener('click', function() {
            const expandedItems = container.querySelectorAll('.item-row.expanded');
            expandedItems.forEach(item => {
              item.classList.remove('expanded');
              item.style.backgroundImage = '';
              const collapseCorner = item.querySelector('.collapse-corner');
              if (collapseCorner) {
                collapseCorner.remove();
              }
            });
            
            // For mobile: restore body scrolling
            if (window.innerWidth < 768) {
              document.body.style.overflow = '';
            }
          });
        }
      })
      .catch(error => console.error('Error loading data:', error));
  }

  // Add window resize handler to adjust expanded items on screen size change
  window.addEventListener('resize', function() {
    const expandedItem = document.querySelector('.item-row.expanded');
    const isMobileNow = window.innerWidth < 768;
    
    if (expandedItem) {
      if (isMobileNow) {
        // Apply mobile styles
        document.body.style.overflow = 'hidden';
        window.scrollTo(0, 0);
      } else {
        // Apply desktop styles
        document.body.style.overflow = '';
      }
    }
  });

  // Function to create the 3ON3 FREESTYLE score form
  function create3on3FreestyleForm() {
    const matches = 4;
    let formHTML = `
      <h3>3ON3 FREESTYLE Scoreboard</h3>
      <p>Statistical Categories & Scoring Weights:</p>
      <ul>
        <li>Points: +1</li>
        <li>Rebounds: +1</li>
        <li>Assists: +2</li>
        <li>Steals: +2</li>
        <li>Blocks: +2</li>
        <li>Turn Overs: -5</li>
        <li>Win: +10 / Loss: -20</li>
      </ul>
    `;
    
    for (let i = 1; i <= matches; i++) {
      formHTML += `
        <div class="match-container" data-match="${i}">
          <div class="match-title">Match ${i}</div>
          <div class="stats-container">
            <div class="stat-input">
              <label for="points-${i}">Points <span class="stat-weight">(+1)</span></label>
              <input type="number" id="points-${i}" min="0" value="0">
            </div>
            <div class="stat-input">
              <label for="rebounds-${i}">Rebounds <span class="stat-weight">(+1)</span></label>
              <input type="number" id="rebounds-${i}" min="0" value="0">
            </div>
            <div class="stat-input">
              <label for="assists-${i}">Assists <span class="stat-weight">(+2)</span></label>
              <input type="number" id="assists-${i}" min="0" value="0">
            </div>
            <div class="stat-input">
              <label for="steals-${i}">Steals <span class="stat-weight">(+2)</span></label>
              <input type="number" id="steals-${i}" min="0" value="0">
            </div>
            <div class="stat-input">
              <label for="blocks-${i}">Blocks <span class="stat-weight">(+2)</span></label>
              <input type="number" id="blocks-${i}" min="0" value="0">
            </div>
            <div class="stat-input">
              <label for="turnovers-${i}">Turn Overs <span class="stat-weight">(-5)</span></label>
              <input type="number" id="turnovers-${i}" min="0" value="0">
            </div>
            <div class="stat-input">
              <label for="winloss-${i}">Win/Loss <span class="stat-weight">(+10/-20)</span></label>
              <select id="winloss-${i}">
                <option value="">Select...</option>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }
    
    formHTML += `
      <button class="calculate-btn">Calculate Score</button>
      <div class="score-result">
        <div class="total-score">Total Score: <span id="total-score">0</span></div>
        <div class="stat-breakdown"></div>
      </div>
      <button class="screenshot-btn" title="Copy scoreboard to clipboard">📸 Take Screenshot</button>
    `;
    
    return formHTML;
  }

  // Function to create a generic score form for other games
  function createGenericScoreForm(gameName) {
    return `
      <div class="empty-form-message">
        <p>Generic scoreboard for ${gameName}</p>
        <p>Custom scoring form not yet implemented.</p>
        <button class="calculate-btn">Calculate Score</button>
        <button class="screenshot-btn" title="Copy scoreboard to clipboard">📸 Take Screenshot</button>
      </div>
    `;
  }

  // Function to create the Sonic All-Star Racing score form
  function createSonicRacingForm() {
    const races = 1; // Changed from 4 to 1 race
    
    let formHTML = `
      <h3>Sonic All-Star Racing Scoreboard</h3>
      <p>Race Position & Scoring Weights:</p>
      <ul>
        <li>1st place: +50</li>
        <li>2nd place: +40</li>
        <li>3rd place: +30</li>
        <li>4th - 6th place: -10</li>
        <li>5th - 10th place: -20</li>
      </ul>
    `;
    
    for (let i = 1; i <= races; i++) {
      formHTML += `
        <div class="match-container" data-race="${i}">
          <div class="match-title">Race ${i}</div>
          <div class="stats-container">
            <div class="stat-input">
              <label for="position-${i}">Position</label>
              <select id="position-${i}">
                <option value="">Select...</option>
                <option value="first">1st place (+50)</option>
                <option value="second">2nd place (+40)</option>
                <option value="third">3rd place (+30)</option>
                <option value="fourth-sixth">4th - 6th place (-10)</option>
                <option value="fifth-tenth">5th - 10th place (-20)</option>
              </select>
            </div>
            <div class="stat-input">
              <label for="points-${i}">Points Earned</label>
              <input type="number" id="points-${i}" min="0" value="0">
            </div>
          </div>
        </div>
      `;
    }
    
    formHTML += `
      <button class="calculate-btn">Calculate Score</button>
      <div class="score-result">
        <div class="total-score">Total Score: <span id="total-score">0</span></div>
        <div class="stat-breakdown"></div>
      </div>
      <button class="screenshot-btn" title="Copy scoreboard to clipboard">📸 Take Screenshot</button>
    `;
    
    return formHTML;
  }

  // Function to calculate the score for Sonic All-Star Racing
  function calculateSonicRacingScore(formElement) {
    const races = 1; // Changed from 4 to 1 race
    let totalScore = 0;
    let breakdown = '';
    
    // Define weights for positions
    const positionWeights = {
      first: 50,
      second: 40,
      third: 30,
      "fourth-sixth": -10,
      "fifth-tenth": -20
    };
    
    // Calculate score for each race
    for (let i = 1; i <= races; i++) {
      let raceScore = 0;
      let raceBreakdown = `<strong>Race ${i}:</strong> `;
      
      // Position score
      const position = formElement.querySelector(`#position-${i}`).value;
      if (position) {
        const positionScore = positionWeights[position];
        raceScore += positionScore;
        
        // Get position display name
        let positionName = "Unknown";
        switch(position) {
          case "first": positionName = "1st place"; break;
          case "second": positionName = "2nd place"; break;
          case "third": positionName = "3rd place"; break;
          case "fourth-sixth": positionName = "4th - 6th place"; break;
          case "fifth-tenth": positionName = "5th - 10th place"; break;
        }
        
        const scorePrefix = positionScore >= 0 ? '+' : '';
        raceBreakdown += `${positionName}: ${scorePrefix}${positionScore}, `;
      }
      
      // Additional points
      const points = parseInt(formElement.querySelector(`#points-${i}`).value) || 0;
      raceScore += points;
      if (points !== 0) {
        const pointsPrefix = points >= 0 ? '+' : '';
        raceBreakdown += `Additional Points: ${pointsPrefix}${points}, `;
      }
      
      // Remove trailing comma and space
      raceBreakdown = raceBreakdown.replace(/, $/, '');
      
      // Add race score to total if any selections were made
      if (position || points !== 0) {
        totalScore += raceScore;
        breakdown += `<div>${raceBreakdown} = <strong>${raceScore}</strong></div>`;
      }
    }
    
    // Display the result
    const resultElement = formElement.querySelector('.score-result');
    const totalScoreElement = formElement.querySelector('#total-score');
    const breakdownElement = formElement.querySelector('.stat-breakdown');
    
    totalScoreElement.textContent = totalScore;
    breakdownElement.innerHTML = breakdown || '<div>No scores entered yet</div>';
    
    // Add win/loss class based on total score
    if (totalScore > 0) {
      totalScoreElement.className = 'win';
    } else if (totalScore < 0) {
      totalScoreElement.className = 'loss';
    } else {
      totalScoreElement.className = '';
    }
    
    // Show result
    resultElement.classList.add('show');
  }

  // Function to calculate the score for 3ON3 FREESTYLE
  function calculate3on3FreestyleScore(formElement) {
    const matches = 4;
    let totalScore = 0;
    let breakdown = '';
    
    // Define weights
    const weights = {
      points: 1,
      rebounds: 1,
      assists: 2,
      steals: 2,
      blocks: 2,
      turnovers: -5,
      win: 10,
      loss: -20
    };
    
    // Calculate score for each match
    for (let i = 1; i <= matches; i++) {
      let matchScore = 0;
      let matchBreakdown = `<strong>Match ${i}:</strong> `;
      
      // Points
      const points = parseInt(formElement.querySelector(`#points-${i}`).value) || 0;
      const pointsScore = points * weights.points;
      matchScore += pointsScore;
      if (points > 0) {
        matchBreakdown += `Points: ${points} × ${weights.points} = ${pointsScore}, `;
      }
      
      // Rebounds
      const rebounds = parseInt(formElement.querySelector(`#rebounds-${i}`).value) || 0;
      const reboundsScore = rebounds * weights.rebounds;
      matchScore += reboundsScore;
      if (rebounds > 0) {
        matchBreakdown += `Rebounds: ${rebounds} × ${weights.rebounds} = ${reboundsScore}, `;
      }
      
      // Assists
      const assists = parseInt(formElement.querySelector(`#assists-${i}`).value) || 0;
      const assistsScore = assists * weights.assists;
      matchScore += assistsScore;
      if (assists > 0) {
        matchBreakdown += `Assists: ${assists} × ${weights.assists} = ${assistsScore}, `;
      }
      
      // Steals
      const steals = parseInt(formElement.querySelector(`#steals-${i}`).value) || 0;
      const stealsScore = steals * weights.steals;
      matchScore += stealsScore;
      if (steals > 0) {
        matchBreakdown += `Steals: ${steals} × ${weights.steals} = ${stealsScore}, `;
      }
      
      // Blocks
      const blocks = parseInt(formElement.querySelector(`#blocks-${i}`).value) || 0;
      const blocksScore = blocks * weights.blocks;
      matchScore += blocksScore;
      if (blocks > 0) {
        matchBreakdown += `Blocks: ${blocks} × ${weights.blocks} = ${blocksScore}, `;
      }
      
      // Turnovers
      const turnovers = parseInt(formElement.querySelector(`#turnovers-${i}`).value) || 0;
      const turnoversScore = turnovers * weights.turnovers;
      matchScore += turnoversScore;
      if (turnovers > 0) {
        matchBreakdown += `Turnovers: ${turnovers} × ${weights.turnovers} = ${turnoversScore}, `;
      }
      
      // Win/Loss
      const winLoss = formElement.querySelector(`#winloss-${i}`).value;
      if (winLoss === 'win') {
        matchScore += weights.win;
        matchBreakdown += `Win: +${weights.win}, `;
      } else if (winLoss === 'loss') {
        matchScore += weights.loss;
        matchBreakdown += `Loss: ${weights.loss}, `;
      }
      
      // Remove trailing comma and space
      matchBreakdown = matchBreakdown.replace(/, $/, '');
      
      // Add match score to total
      totalScore += matchScore;
      breakdown += `<div>${matchBreakdown} = <strong>${matchScore}</strong></div>`;
    }
    
    // Display the result
    const resultElement = formElement.querySelector('.score-result');
    const totalScoreElement = formElement.querySelector('#total-score');
    const breakdownElement = formElement.querySelector('.stat-breakdown');
    
    totalScoreElement.textContent = totalScore;
    breakdownElement.innerHTML = breakdown;
    
    // Add win/loss class based on total score
    if (totalScore > 0) {
      totalScoreElement.className = 'win';
    } else if (totalScore < 0) {
      totalScoreElement.className = 'loss';
    } else {
      totalScoreElement.className = '';
    }
    
    // Show result
    resultElement.classList.add('show');
  }

  // Function to calculate score for generic forms
  function calculateGenericScore(formElement) {
    // Create a basic score result display for generic forms
    let scoreResult = formElement.querySelector('.score-result');
    
    if (!scoreResult) {
      scoreResult = document.createElement('div');
      scoreResult.className = 'score-result';
      scoreResult.innerHTML = `
        <div class="total-score">No scoring system implemented yet.</div>
      `;
      formElement.appendChild(scoreResult);
    }
    
    // Show result
    scoreResult.classList.add('show');
    
    // This would be implemented later for other games
    console.log('Generic score calculation not yet implemented');
  }
});