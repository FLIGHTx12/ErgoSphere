document.addEventListener('DOMContentLoaded', () => {
  // Add style for short inputs at the beginning of the script
  const style = document.createElement('style');
  style.textContent = `
    .short-input {
      width: 60px !important; /* Override any existing width */
      padding-right: 5px !important;
      text-align: center;
    }
    
    /* Hide spinner buttons on number inputs for cleaner look */
    .short-input::-webkit-inner-spin-button, 
    .short-input::-webkit-outer-spin-button { 
      -webkit-appearance: none;
      margin: 0;
    }
    
    /* Firefox */
    .short-input[type=number] {
      -moz-appearance: textfield;
    }
  `;
  document.head.appendChild(style);

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
  const isMobile = () => window.innerWidth < 768;
  
  // Disable body scroll when item is expanded on any screen size
  function toggleBodyScroll(disable) {
    if (disable) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
  
  // Add special handling for mobile scrolling when a div is expanded
  if (isMobile()) {
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
              ${item.mode ? `<p><strong>Mode:</strong> ${item.mode}</p>` : ''}
              ${item['Time per match'] ? `<p><strong>Time per match:</strong> ${item['Time per match']}</p>` : ''}
              ${item.playability ? `<p><strong>Playability:</strong> ${item.playability}</p>` : ''}
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
              // Enable scrolling again
              toggleBodyScroll(false);
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
            
            // Toggle this item's expanded state
            if (!this.classList.contains('expanded')) {
              this.classList.add('expanded');
              
              // Disable scrolling on the body - works for both mobile and desktop
              toggleBodyScroll(true);
              
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
                
                // Enable scrolling again
                toggleBodyScroll(false);
                
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
                } else if (gameName === 'Apex Legends') {
                  scoreForm.innerHTML = createApexLegendsForm();
                } else if (gameName === 'Destiny 2 Crucible') {
                  scoreForm.innerHTML = createDestiny2Form();
                } else if (gameName === 'VALORANT') {
                  scoreForm.innerHTML = createValorantForm();
                } else if (gameName === 'Predecessor') {
                  scoreForm.innerHTML = createPredecessorForm();
                } else if (gameName === 'Splitgate') {
                  scoreForm.innerHTML = createSplitgateForm();
                } else if (gameName === 'Overwatch 2') {
                  scoreForm.innerHTML = createOverwatch2Form();
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
                    } else if (gameName === 'Apex Legends') {
                      calculateApexLegendsScore(scoreForm);
                    } else if (gameName === 'Destiny 2 Crucible') {
                      calculateDestiny2Score(scoreForm);
                    } else if (gameName === 'VALORANT') {
                      calculateValorantScore(scoreForm);
                    } else if (gameName === 'Predecessor') {
                      calculatePredecessorScore(scoreForm);
                    } else if (gameName === 'Splitgate') {
                      calculateSplitgateScore(scoreForm);
                    } else if (gameName === 'Overwatch 2') {
                      calculateOverwatch2Score(scoreForm);
                    } else {
                      calculateGenericScore(scoreForm);
                    }
                  
                    // Scroll to the score-result div at the bottom after calculation
                    const scoreResult = scoreForm.querySelector('.score-result');
                    if (scoreResult) {
                      scoreResult.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
                    container.style.backgroundColor = '#121212'; // Dark background as fallback
                    
                    // Check if scoreForm has a score-result with show class
                    const scoreResult = scoreForm.querySelector('.score-result.show');
                    if (!scoreResult) {
                      alert('Please calculate a score first before taking a screenshot.');
                      return;
                    }
                    
                    // Create a deep clone of the score form to ensure all content is copied
                    const scoreFormClone = scoreForm.cloneNode(true);
                    
                    // Ensure all form fields show their values in the screenshot
                    const inputs = scoreForm.querySelectorAll('input, select');
                    const cloneInputs = scoreFormClone.querySelectorAll('input, select');
                    
                    inputs.forEach((input, index) => {
                      if (cloneInputs[index]) {
                        // For selects, set the selected option
                        if (input.tagName === 'SELECT') {
                          const selectedIndex = input.selectedIndex;
                          if (selectedIndex >= 0) {
                            cloneInputs[index].selectedIndex = selectedIndex;
                          }
                        } else {
                          // For inputs, directly copy the value
                          cloneInputs[index].value = input.value;
                        }
                      }
                    });
                    
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
                    
                    // Make sure the score-result is visible in the clone
                    const cloneScoreResult = scoreFormClone.querySelector('.score-result');
                    if (cloneScoreResult) {
                      cloneScoreResult.classList.add('show');
                      cloneScoreResult.style.display = 'block';
                      
                      // Set correct color for the payout value
                      const payoutValue = cloneScoreResult.querySelector('.payout-value');
                      if (payoutValue) {
                        const scoreValue = parseInt(payoutValue.textContent) || 0;
                        if (scoreValue > 0) {
                          payoutValue.className = 'payout-value win';
                          cloneScoreResult.classList.add('positive-result');
                        } else if (scoreValue < 0) {
                          payoutValue.className = 'payout-value loss';
                          cloneScoreResult.classList.add('negative-result');
                        }
                      }
                    }
                    
                    // Add everything to container
                    container.appendChild(header);
                    container.appendChild(scoreFormClone);
                    document.body.appendChild(container);
                    
                    console.log('Screenshot container created with content:', container.innerHTML);
                    
                    // Hide the original button for cleaner screenshot
                    this.style.display = 'none';
                    
                    // Try to load the background image first to avoid CORS issues
                    const bgImage = parentItem.getAttribute('data-bg-image');
                    
                    if (bgImage) {
                      // Preload image to check if it can be accessed
                      const img = new Image();
                      img.crossOrigin = "anonymous"; // Try to request CORS access
                      
                      img.onload = function() {
                        // If image loads successfully, use it as background
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Size canvas to match desired screenshot dimensions
                        canvas.width = 800;
                        canvas.height = 500; // Approximate height
                        
                        // Draw image on canvas (this converts it to same-origin)
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        
                        try {
                          // Try to use the canvas as background
                          container.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`;
                          container.style.backgroundSize = 'cover';
                          container.style.backgroundPosition = 'center';
                          
                          // Add a dark overlay for better text readability
                          container.style.boxShadow = "inset 0 0 0 2000px rgba(0, 0, 0, 0.7)";
                          
                          // Now take the screenshot
                          prepareAndTakeScreenshot();
                        } catch (e) {
                          console.error("Failed to convert image:", e);
                          // Fallback to solid background
                          applyFallbackBackground();
                          prepareAndTakeScreenshot();
                        }
                      };
                      
                      img.onerror = function() {
                        console.warn("Background image couldn't be loaded. Using fallback background.");
                        applyFallbackBackground();
                        prepareAndTakeScreenshot();
                      };
                      
                      // Start loading the image
                      img.src = bgImage;
                      
                      // If the image is already cached, the onload event might not fire
                      // so we need this timeout as a fallback
                      setTimeout(() => {
                        if (!img.complete) {
                          img.src = ""; // Cancel the pending request
                          applyFallbackBackground();
                          prepareAndTakeScreenshot();
                        }
                      }, 3000); // 3 second timeout
                      
                    } else {
                      // No background image specified, use fallback
                      applyFallbackBackground();
                      prepareAndTakeScreenshot();
                    }
                    
                    // Apply a fallback background with local image or generated gradient
                    function applyFallbackBackground() {
                      // Try multiple possible paths for the purpspace.jpg image
                      const possiblePaths = [
                        '/assets/img/backgrounds/purpspace.jpg',
                        '../assets/img/backgrounds/purpspace.jpg',
                        '../../assets/img/backgrounds/purpspace.jpg',
                        '/ErgoSphere/assets/img/backgrounds/purpspace.jpg',
                        'https://raw.githubusercontent.com/yourgithubusername/ErgoSphere/main/assets/img/backgrounds/purpspace.jpg'
                      ];
                      
                      // Try the first path
                      tryNextPath(0);
                      
                      function tryNextPath(index) {
                        if (index >= possiblePaths.length) {
                          // All paths failed, use embedded image or gradient
                          useEmbeddedBackgroundOrGradient();
                          return;
                        }
                        
                        const path = possiblePaths[index];
                        console.log(`Trying background path: ${path}`);
                        
                        const img = new Image();
                        img.onload = function() {
                          // Image loaded successfully
                          console.log(`Successfully loaded background from: ${path}`);
                          container.style.backgroundImage = `url('${path}')`;
                          container.style.backgroundSize = 'cover';
                          container.style.backgroundPosition = 'center';
                          container.style.boxShadow = "inset 0 0 0 2000px rgba(0, 0, 0, 0.7)";
                        };
                        
                        img.onerror = function() {
                          // Failed to load this path, try next one
                          console.log(`Failed to load background from: ${path}`);
                          tryNextPath(index + 1);
                        };
                        
                        img.src = path;
                      }
                      
                      function useEmbeddedBackgroundOrGradient() {
                        // Try using a base64 embedded small dark purple pattern
                        const base64BG = getEmbeddedBackground();
                        
                        if (base64BG) {
                          console.log("Using embedded background image as fallback");
                          container.style.backgroundImage = `url(${base64BG})`;
                          container.style.backgroundSize = 'cover';
                          container.style.backgroundPosition = 'center';
                          container.style.boxShadow = "inset 0 0 0 2000px rgba(0, 0, 0, 0.7)";
                        } else {
                          // Last resort: Use gradient based on game name
                          console.log("Using gradient as final fallback");
                          const hash = simpleHash(gameName);
                          const hue1 = hash % 360;
                          const hue2 = (hash + 120) % 360;
                          
                          container.style.background = `linear-gradient(135deg, 
                            hsla(${hue1}, 70%, 20%, 1) 0%, 
                            hsla(${hue2}, 90%, 10%, 1) 100%)`;
                        }
                      }
                      
                      // Improve the aesthetics regardless of which background gets used
                      container.style.boxShadow = "inset 0 0 100px rgba(0, 0, 0, 0.8)";
                      container.style.border = "1px solid rgba(255, 255, 255, 0.1)";
                    }
                    
                    // Function to get a base64 encoded background image as last resort
                    function getEmbeddedBackground() {
                      // This is a small, dark purple background pattern encoded in base64
                      // It's compressed and optimized for size while still providing a nice background
                      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AkEBDEWZBO2lwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAABb0lEQVRo3u2awQ2DMAxFfwYYgVVYhdE6CmwCozDKKIzCKF0lu3SQkDgBHFMioZZDG9fx9+dLFItFVdXMzFQEW111+Q6BL8IIg2BKbuQvakmgPqPYlnlKWVV300rBO0TNrCxL0+X7c0ZU9TLQq6WlT3M6xLZtQJIEjdPikhDJBe0MQltnhMIlaZLdUukwQjiEzslkBnIJkxnMQsJyWJ7vj5YeN0hKnCBG8MEk2Gq1UkDpgTzBOGMZZAqMN4ZBpsJ4QQ4g1mxFKiADwNg+bbEOWSNNIGawS9jjVZDVKpBg/kjkPQWZPI/0Tt6UGSl/REKuFofIS0iulRVdkCWDGcNgxjKQMQ1jrAEMNSZvxpqAd4MZwjRmCBkC8mG6MeRCYAxkeYNBAgwiGERGILJtJnsnr3zbdlNK6ZBSil57iRZBa7NWvOkLAO89QgjPMcdYMdZIpZRQVXjvsd/vr0dMWxBAzjmcc4gxvvxX/JvV07K1vYkCkiVpmvFoAAAAAElFTkSuQmCC";
                    }

                    function enhanceScreenshotContainer(container) {
                      // Detect mobile/high-DPR and adjust overlay opacity for readability
                      const isMobileOrHighDPR = window.innerWidth < 768 || window.devicePixelRatio > 1.5;

                      // Use lighter backgrounds/overlays on mobile/high-DPR
                      const bgAlpha = isMobileOrHighDPR ? 0.7 : 0.95;
                      const overlayAlpha = isMobileOrHighDPR ? 0.5 : 0.85;

                      container.style.backgroundColor = `rgba(0, 0, 0, ${overlayAlpha})`;

                      const payoutContainer = container.querySelector('.payout-container');
                      if (payoutContainer) {
                        payoutContainer.style.padding = '20px';
                        payoutContainer.style.backgroundColor = `rgba(20, 20, 20, ${bgAlpha})`;
                        payoutContainer.style.border = '2px solid rgba(255, 255, 255, 0.2)';
                        payoutContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
                      }

                      const statBreakdown = container.querySelector('.stat-breakdown');
                      if (statBreakdown) {
                        statBreakdown.style.backgroundColor = `rgba(30, 30, 30, ${bgAlpha})`;
                        statBreakdown.style.padding = '15px';
                        statBreakdown.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                      }

                      const scoreResult = container.querySelector('.score-result');
                      if (scoreResult) {
                        scoreResult.style.backgroundColor = `rgba(0, 0, 0, ${bgAlpha})`;
                        scoreResult.style.padding = '30px';
                        scoreResult.style.border = '4px solid rgba(255, 255, 255, 0.8)';
                        scoreResult.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.6)';
                        scoreResult.style.zIndex = '10';
                        scoreResult.style.position = 'relative';

                        const totalScoreElement = container.querySelector('#total-score');
                        const scoreValue = parseInt(totalScoreElement?.textContent) || 0;

                        if (scoreValue > 0) {
                          scoreResult.style.border = '4px solid rgba(76, 175, 80, 0.9)';
                          scoreResult.style.boxShadow = '0 0 40px rgba(76, 175, 80, 0.8)';
                        } else if (scoreValue < 0) {
                          scoreResult.style.border = '4px solid rgba(244, 67, 54, 0.9)';
                          scoreResult.style.boxShadow = '0 0 40px rgba(244, 67, 54, 0.8)';
                        }
                      }

                      const totalScoreElement = container.querySelector('#total-score');
                      const scoreValue = parseInt(totalScoreElement?.textContent) || 0;

                      if (scoreValue > 0) {
                        container.style.border = '3px solid rgba(76, 175, 80, 0.7)';
                        container.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.5)';
                      } else if (scoreValue < 0) {
                        container.style.border = '3px solid rgba(244, 67, 54, 0.7)';
                        container.style.boxShadow = '0 0 15px rgba(244, 67, 54, 0.5)';
                      }

                      return container;
                    }
                    
                    // Prepare and take the screenshot
                    function prepareAndTakeScreenshot() {
                      // Apply extra styling to ensure visibility of results
                      enhanceScreenshotContainer(container);
                      
                      // Make sure computed styles are applied before taking screenshot
                      setTimeout(() => {
                        console.log('Taking screenshot, container ready:', container.innerHTML);
                        
                        // Force all form values to be visible
                        const allInputs = container.querySelectorAll('input[type="number"]');
                        allInputs.forEach(input => {
                          if (input.value) {
                            // Apply visible styling to inputs with values
                            input.style.backgroundColor = 'rgba(100, 65, 165, 0.2)';
                            input.style.borderColor = '#6441a5';
                          }
                        });
                        
                        // Force score result to be visible
                        const resultElement = container.querySelector('.score-result');
                        if (resultElement) {
                          resultElement.style.display = 'block';
                        }
                        
                        // Load html2canvas if needed and take screenshot
                        if (!window.html2canvas) {
                          const script = document.createElement('script');
                          script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
                          script.onload = () => takeScreenshot();
                          document.head.appendChild(script);
                        } else {
                          takeScreenshot();
                        }
                      }, 200);
                    }
                    
                    function takeScreenshot() {
                      html2canvas(container, {
                        allowTaint: true,
                        useCORS: true,
                        backgroundColor: null,
                        scale: 2,
                        logging: false
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
                      }).catch(error => {
                        console.error("Screenshot failed:", error);
                        alert("Screenshot failed. Please try again or use a screen capture tool instead.");
                        document.body.removeChild(container);
                        screenshotBtn.style.display = 'block';
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
              // When collapsing
              this.classList.remove('expanded');
              // Enable scrolling again
              toggleBodyScroll(false);
              // Remove collapse corner
              const collapseCorner = this.querySelector('.collapse-corner');
              if (collapseCorner) {
                collapseCorner.remove();
              }
              // Reset background
              this.style.backgroundImage = '';
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
            
            // Enable scrolling again
            toggleBodyScroll(false);
          });
        }
      })
      .catch(error => console.error('Error loading data:', error));
  }

  // Add window resize handler to adjust expanded items on screen size change
  window.addEventListener('resize', function() {
    const expandedItem = document.querySelector('.item-row.expanded');
    
    if (expandedItem) {
      // If width changes between mobile/desktop breakpoints,
      // adjust the modal appearance accordingly
      if (isMobile()) {
        expandedItem.style.transform = '';
        if (window.scrollY > 0) {
          window.scrollTo(0, 0);
        }
      } else {
        // For desktop, ensure it stays centered
        expandedItem.style.transform = 'translate(-50%, -50%)';
      }
    }
  });

  // Function to create the 3ON3 FREESTYLE score form
  function create3on3FreestyleForm() {
    const matches = 4;
    let formHTML = `
      <h3>3ON3 FREESTYLE Scoreboard</h3>
      <p>Statistical Categories & Scoring Weights:</p>
      <ul style="margin-top: 6px; margin-bottom: 6px; padding-left: 20px;">
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
              <input type="number" id="points-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="rebounds-${i}">Rebounds <span class="stat-weight">(+1)</span></label>
              <input type="number" id="rebounds-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="assists-${i}">Assists <span class="stat-weight">(+2)</span></label>
              <input type="number" id="assists-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="steals-${i}">Steals <span class="stat-weight">(+2)</span></label>
              <input type="number" id="steals-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="blocks-${i}">Blocks <span class="stat-weight">(+2)</span></label>
              <input type="number" id="blocks-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="turnovers-${i}">Turn Overs <span class="stat-weight">(-5)</span></label>
              <input type="number" id="turnovers-${i}" min="0" class="short-input">
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
        <div class="payout-container">
          <div class="payout-label">PAYOUT</div>
          <div class="payout-value" id="total-score">0</div>
        </div>
        <div class="stat-breakdown"></div>
      </div>
      <button class="screenshot-btn" title="Copy scoreboard to clipboard">Take Screenshot</button>
    `;
    
    // Add additional event listeners after form is created
    setTimeout(() => {
      const formInputs = document.querySelectorAll('.stat-input input, .stat-input select');
      
      formInputs.forEach(input => {
        // Add input event listener to detect changes
        input.addEventListener('input', function() {
          if (this.value) {
            this.classList.add('input-has-value');
          } else {
            this.classList.remove('input-has-value');
          }
        });
        
        // Check initial state (for cases where input might already have a value)
        if (input.value) {
          input.classList.add('input-has-value');
        }
      });
    }, 100);
    
    return formHTML;
  }

  // Function to create the Splitgate score form
  function createSplitgateForm() {
    const matches = 4;
    let formHTML = `
      <h3>Splitgate Scoreboard</h3>
      <p>Match Results & Scoring Weights:</p>
      <ul style="margin-top: 6px; margin-bottom: 6px; padding-left: 20px;">
        <li>Score: +1 per point</li>
        <li>Kills: +2 per kill</li>
        <li>Deaths: -3 per death</li>
        <li>Win: +10 / Loss: -5</li>
      </ul>
    `;
    
    for (let i = 1; i <= matches; i++) {
      formHTML += `
        <div class="match-container" data-match="${i}">
          <div class="match-title">Match ${i}</div>
          <div class="stats-container">
            <div class="stat-input">
              <label for="score-${i}">Score <span class="stat-weight">(+1)</span></label>
              <input type="number" id="score-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="kills-${i}">Kills <span class="stat-weight">(+2)</span></label>
              <input type="number" id="kills-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="deaths-${i}">Deaths <span class="stat-weight">(-3)</span></label>
              <input type="number" id="deaths-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="winloss-${i}">Win/Loss <span class="stat-weight">(+10/-5)</span></label>
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
        <div class="payout-container">
          <div class="payout-label">PAYOUT</div>
          <div class="payout-value" id="total-score">0</div>
        </div>
        <div class="stat-breakdown"></div>
      </div>
      <button class="screenshot-btn" title="Copy scoreboard to clipboard">Take Screenshot</button>
    `;
    
    // Add additional event listeners after form is created
    setTimeout(() => {
      const formInputs = document.querySelectorAll('.stat-input input, .stat-input select');
      
      formInputs.forEach(input => {
        // Add input event listener to detect changes
        input.addEventListener('input', function() {
          if (this.value) {
            this.classList.add('input-has-value');
          } else {
            this.classList.remove('input-has-value');
          }
        });
        
        // Check initial state (for cases where input might already have a value)
        if (input.value) {
          input.classList.add('input-has-value');
        }
      });
    }, 100);
    
    return formHTML;
  }

  // Function to calculate the score for Splitgate
  function calculateSplitgateScore(formElement) {
    const matches = 4;
    let totalScore = 0;
    let breakdown = '';
    
    // Define weights
    const weights = {
      score: 1,
      kills: 2,
      deaths: -3,
      win: 10,
      loss: -5
    };
    
    // Calculate score for each match
    for (let i = 1; i <= matches; i++) {
      let matchScore = 0;
      let matchBreakdown = `<strong>Match ${i}:</strong> `;
      
      // Score
      const score = parseInt(formElement.querySelector(`#score-${i}`).value) || 0;
      const scoreTotal = score * weights.score;
      matchScore += scoreTotal;
      if (score > 0) {
        matchBreakdown += `Score: ${score} × ${weights.score} = ${scoreTotal}, `;
      }
      
      // Kills
      const kills = parseInt(formElement.querySelector(`#kills-${i}`).value) || 0;
      const killsTotal = kills * weights.kills;
      matchScore += killsTotal;
      if (kills > 0) {
        matchBreakdown += `Kills: ${kills} × ${weights.kills} = ${killsTotal}, `;
      }
      
      // Deaths
      const deaths = parseInt(formElement.querySelector(`#deaths-${i}`).value) || 0;
      const deathsTotal = deaths * weights.deaths;
      matchScore += deathsTotal;
      if (deaths > 0) {
        matchBreakdown += `Deaths: ${deaths} × ${weights.deaths} = ${deathsTotal}, `;
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
      
      // Add match score to total if any selections were made
      if (score > 0 || kills > 0 || deaths > 0 || winLoss) {
        totalScore += matchScore;
        breakdown += `<div>${matchBreakdown} = <strong>${matchScore}</strong></div>`;
      }
    }
    
    // Display the result
    const resultElement = formElement.querySelector('.score-result');
    const totalScoreElement = formElement.querySelector('#total-score');
    const breakdownElement = formElement.querySelector('.stat-breakdown');
    
    // First set to zero, then animate to final score
    totalScoreElement.textContent = '0';
    breakdownElement.innerHTML = breakdown || '<div>No scores entered yet</div>';
    
    // Show result before animation
    resultElement.classList.add('show');
    
    // Add win/loss class based on total score
    if (totalScore > 0) {
      totalScoreElement.className = 'payout-value win';
      resultElement.classList.add('positive-result');
      resultElement.classList.remove('negative-result');
    } else if (totalScore < 0) {
      totalScoreElement.className = 'payout-value loss';
      resultElement.classList.add('negative-result');
      resultElement.classList.remove('positive-result');
    } else {
      totalScoreElement.className = 'payout-value';
      resultElement.classList.remove('positive-result', 'negative-result');
    }
    
    // Animate to final score
    setTimeout(() => {
      animateScoreCalculation(totalScoreElement, totalScore);
    }, 100);
  }

  // Function to create a generic score form for other games
  function createGenericScoreForm(gameName) {
    return `
      <div class="empty-form-message">
        <p>Generic scoreboard for ${gameName}</p>
        <p>Custom scoring form not yet implemented.</p>
        <button class="calculate-btn">Calculate Score</button>
        <button class="screenshot-btn" title="Copy scoreboard to clipboard">Take Screenshot</button>
      </div>
    `;
  }

  // Function to create the Sonic All-Star Racing score form
  function createSonicRacingForm() {
    const races = 2; // Changed from 1 to 2 races
    
    let formHTML = `
      <h3>Sonic All-Star Racing Scoreboard</h3>
      <p>Race Position & Scoring Weights:</p>
      <ul style="margin-top: 6px; margin-bottom: 6px; padding-left: 20px;">
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
          <div class="match-title">GRAND PRIX ${i}</div>
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
              <input type="number" id="points-${i}" min="0" class="short-input">
            </div>
          </div>
        </div>
      `;
    }
    
    formHTML += `
      <button class="calculate-btn">Calculate Score</button>
      <div class="score-result">
        <div class="payout-container">
          <div class="payout-label">PAYOUT</div>
          <div class="payout-value" id="total-score">0</div>
        </div>
        <div class="stat-breakdown"></div>
      </div>
      <button class="screenshot-btn" title="Copy scoreboard to clipboard">Take Screenshot</button>
    `;
    
    // Add additional event listeners after form is created
    setTimeout(() => {
      const formInputs = document.querySelectorAll('.stat-input input, .stat-input select');
      
      formInputs.forEach(input => {
        // Add input event listener to detect changes
        input.addEventListener('input', function() {
          if (this.value) {
            this.classList.add('input-has-value');
          } else {
            this.classList.remove('input-has-value');
          }
        });
        
        // Check initial state
        if (input.value) {
          input.classList.add('input-has-value');
        }
      });
    }, 100);
    
    return formHTML;
  }
  
  // Function to create the Apex Legends score form
  function createApexLegendsForm() {
    const matches = 4;
    let formHTML = `
      <h3>Apex Legends Scoreboard</h3>
      <p>Match Results & Scoring Weights:</p>
      <ul style="margin-top: 6px; margin-bottom: 6px; padding-left: 20px;">
        <li>1st place: +50</li>
        <li>Top 5: +10</li>
        <li>Top 10: +5</li>
        <li>Top 20: +2</li>
        <li>Below 20: -20</li>
        <li>Kills: +5 each</li>
      </ul>
    `;
    
    for (let i = 1; i <= matches; i++) {
      formHTML += `
        <div class="match-container" data-match="${i}">
          <div class="match-title">Match ${i}</div>
          <div class="stats-container">
            <div class="stat-input">
              <label for="placement-${i}">Placement</label>
              <select id="placement-${i}">
                <option value="">Select...</option>
                <option value="first">1st place (+50)</option>
                <option value="top5">Top 5 (+10)</option>
                <option value="top10">Top 10 (+5)</option>
                <option value="top20">Top 20 (+2)</option>
                <option value="below20">Below 20 (-20)</option>
              </select>
            </div>
            <div class="stat-input">
              <label for="kills-${i}">Kills <span class="stat-weight">(+5 each)</span></label>
              <input type="number" id="kills-${i}" min="0" class="short-input">
            </div>
          </div>
        </div>
      `;
    }
    
    formHTML += `
      <button class="calculate-btn">Calculate Score</button>
      <div class="score-result">
        <div class="payout-container">
          <div class="payout-label">PAYOUT</div>
          <div class="payout-value" id="total-score">0</div>
        </div>
        <div class="stat-breakdown"></div>
      </div>
      <button class="screenshot-btn" title="Copy scoreboard to clipboard">Take Screenshot</button>
    `;
    
    // Add additional event listeners after form is created
    setTimeout(() => {
      const formInputs = document.querySelectorAll('.stat-input input, .stat-input select');
      
      formInputs.forEach(input => {
        // Add input event listener to detect changes
        input.addEventListener('input', function() {
          if (this.value) {
            this.classList.add('input-has-value');
          } else {
            this.classList.remove('input-has-value');
          }
        });
        
        // Check initial state (for cases where input might already have a value)
        if (input.value) {
          input.classList.add('input-has-value');
        }
      });
    }, 100);
    
    return formHTML;
  }

  // Function to create the Destiny 2 score form
  function createDestiny2Form() {
    const matches = 4;
    let formHTML = `
      <h3>Destiny 2 Crucible Scoreboard</h3>
      <p>Match Results & Scoring Weights:</p>
      <ul style="margin-top: 6px; margin-bottom: 6px; padding-left: 20px;">
        <li>Player Score: +0.50 per point</li>
        <li>Opponents Defeated: +0.50 per defeat</li>
        <li>Objective Final Blows: +1 per blow</li>
        <li>Advantage Points: +1 per point</li>
        <li>Zones Captured: +1 per zone</li>
        <li>Win: +5 / Loss: -20</li>
      </ul>
    `;
    
    for (let i = 1; i <= matches; i++) {
      formHTML += `
        <div class="match-container" data-match="${i}">
          <div class="match-title">Match ${i}</div>
          <div class="stats-container">
            <div class="stat-input">
              <label for="player-score-${i}">Player Score <span class="stat-weight">(+0.50)</span></label>
              <input type="number" id="player-score-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="opponents-defeated-${i}">Opponents Defeated <span class="stat-weight">(+0.50)</span></label>
              <input type="number" id="opponents-defeated-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="objective-blows-${i}">Objective Final Blows <span class="stat-weight">(+1)</span></label>
              <input type="number" id="objective-blows-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="advantage-points-${i}">Advantage Points <span class="stat-weight">(+1)</span></label>
              <input type="number" id="advantage-points-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="zones-captured-${i}">Zones Captured <span class="stat-weight">(+1)</span></label>
              <input type="number" id="zones-captured-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="winloss-${i}">Win/Loss <span class="stat-weight">(+5/-20)</span></label>
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
        <div class="payout-container">
          <div class="payout-label">PAYOUT</div>
          <div class="payout-value" id="total-score">0</div>
        </div>
        <div class="stat-breakdown"></div>
      </div>
      <button class="screenshot-btn" title="Copy scoreboard to clipboard">Take Screenshot</button>
    `;
    
    // Add additional event listeners after form is created
    setTimeout(() => {
      const formInputs = document.querySelectorAll('.stat-input input, .stat-input select');
      
      formInputs.forEach(input => {
        // Add input event listener to detect changes
        input.addEventListener('input', function() {
          if (this.value) {
            this.classList.add('input-has-value');
          } else {
            this.classList.remove('input-has-value');
          }
        });
        
        // Check initial state (for cases where input might already have a value)
        if (input.value) {
          input.classList.add('input-has-value');
        }
      });
    }, 100);
    
    return formHTML;
  }

  // Function to create the VALORANT score form
  function createValorantForm() {
    const matches = 4;
    let formHTML = `
      <h3>VALORANT Scoreboard</h3>
      <p>Match Results & Scoring Weights:</p>
      <ul style="margin-top: 6px; margin-bottom: 6px; padding-left: 20px;">
        <li>Kills: +5 each</li>
        <li>Deaths: -2 each</li>
        <li>Assists: +2 each</li>
        <li>First Blood: +5</li>
        <li>Plants: +2 each</li>
        <li>Defuses: +10 each</li>
        <li>Win: +10 / Loss: -10</li>
      </ul>
    `;
    
    for (let i = 1; i <= matches; i++) {
      formHTML += `
        <div class="match-container" data-match="${i}">
          <div class="match-title">Match ${i}</div>
          <div class="stats-container">
            <div class="stat-input">
              <label for="kills-${i}">Kills <span class="stat-weight">(+5)</span></label>
              <input type="number" id="kills-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="deaths-${i}">Deaths <span class="stat-weight">(-2)</span></label>
              <input type="number" id="deaths-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="assists-${i}">Assists <span class="stat-weight">(+2)</span></label>
              <input type="number" id="assists-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="first-blood-${i}">First Blood</label>
              <select id="first-blood-${i}">
                <option value="">No</option>
                <option value="yes">Yes (+5)</option>
              </select>
            </div>
            <div class="stat-input">
              <label for="plants-${i}">Plants <span class="stat-weight">(+2)</span></label>
              <input type="number" id="plants-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="defuses-${i}">Defuses <span class="stat-weight">(+10)</span></label>
              <input type="number" id="defuses-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="winloss-${i}">Win/Loss <span class="stat-weight">(+10/-10)</span></label>
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
        <div class="payout-container">
          <div class="payout-label">PAYOUT</div>
          <div class="payout-value" id="total-score">0</div>
        </div>
        <div class="stat-breakdown"></div>
      </div>
      <button class="screenshot-btn" title="Copy scoreboard to clipboard">Take Screenshot</button>
    `;
    
    // Add additional event listeners after form is created
    setTimeout(() => {
      const formInputs = document.querySelectorAll('.stat-input input, .stat-input select');
      
      formInputs.forEach(input => {
        // Add input event listener to detect changes
        input.addEventListener('input', function() {
          if (this.value) {
            this.classList.add('input-has-value');
          } else {
            this.classList.remove('input-has-value');
          }
        });
        
        // Check initial state (for cases where input might already have a value)
        if (input.value) {
          input.classList.add('input-has-value');
        }
      });
    }, 100);
    
    return formHTML;
  }

  // Function to create the Predecessor score form
  function createPredecessorForm() {
    const matches = 2;
    let formHTML = `
      <h3>Predecessor Scoreboard</h3>
      <p>Match Results & Scoring Weights:</p>
      <ul style="margin-top: 6px; margin-bottom: 6px; padding-left: 20px;">
        <li>Level: +2 per level</li>
        <li>Kills: +30 each</li>
        <li>Deaths: -15 each</li>
        <li>Assists: +5 each</li>
        <li>Minions: +0.50 each</li>
        <li>Gold Earned: +0.003 per gold</li>
        <li>Win: +10 / Loss: -20</li>
      </ul>
    `;
    
    for (let i = 1; i <= matches; i++) {
      formHTML += `
        <div class="match-container" data-match="${i}">
          <div class="match-title">Match ${i}</div>
          <div class="stats-container">
            <div class="stat-input">
              <label for="level-${i}">Level <span class="stat-weight">(+2)</span></label>
              <input type="number" id="level-${i}" min="0" max="20" class="short-input">
            </div>
            <div class="stat-input">
              <label for="kills-${i}">Kills <span class="stat-weight">(+30)</span></label>
              <input type="number" id="kills-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="deaths-${i}">Deaths <span class="stat-weight">(-15)</span></label>
              <input type="number" id="deaths-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="assists-${i}">Assists <span class="stat-weight">(+5)</span></label>
              <input type="number" id="assists-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="minions-${i}">Minions <span class="stat-weight">(+0.50)</span></label>
              <input type="number" id="minions-${i}" min="0" class="short-input">
            </div>
            <div class="stat-input">
              <label for="gold-${i}">Gold Earned <span class="stat-weight">(+0.003)</span></label>
              <input type="number" id="gold-${i}" min="0" class="short-input">
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
        <div class="payout-container">
          <div class="payout-label">PAYOUT</div>
          <div class="payout-value" id="total-score">0</div>
        </div>
        <div class="stat-breakdown"></div>
      </div>
      <button class="screenshot-btn" title="Copy scoreboard to clipboard">Take Screenshot</button>
    `;
    
    // Add additional event listeners after form is created
    setTimeout(() => {
      const formInputs = document.querySelectorAll('.stat-input input, .stat-input select');
      
      formInputs.forEach(input => {
        // Add input event listener to detect changes
        input.addEventListener('input', function() {
          if (this.value) {
            this.classList.add('input-has-value');
          } else {
            this.classList.remove('input-has-value');
          }
        });
        
        // Check initial state (for cases where input might already have a value)
        if (input.value) {
          input.classList.add('input-has-value');
        }
      });
    }, 100);
    
    return formHTML;
  }

  // Function to calculate the score for Sonic All-Star Racing
  function calculateSonicRacingScore(formElement) {
    const races = 2; // Changed from 1 to 2 races
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
      let raceBreakdown = `<strong>GRAND PRIX ${i}:</strong> `;
      
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
    
    // First set to zero, then animate to final score
    totalScoreElement.textContent = '0';
    breakdownElement.innerHTML = breakdown || '<div>No scores entered yet</div>';
    
    // Show result before animation
    resultElement.classList.add('show');
    
    // Add win/loss class based on total score
    if (totalScore > 0) {
      totalScoreElement.className = 'payout-value win';
      resultElement.classList.add('positive-result');
      resultElement.classList.remove('negative-result');
    } else if (totalScore < 0) {
      totalScoreElement.className = 'payout-value loss';
      resultElement.classList.add('negative-result');
      resultElement.classList.remove('positive-result');
    } else {
      totalScoreElement.className = 'payout-value';
      resultElement.classList.remove('positive-result', 'negative-result');
    }
    
    // Animate to final score
    setTimeout(() => {
      animateScoreCalculation(totalScoreElement, totalScore);
    }, 100);
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
    
    // First set to zero, then animate to final score
    totalScoreElement.textContent = '0';
    breakdownElement.innerHTML = breakdown;
    
    // Show result before animation
    resultElement.classList.add('show');
    
    // Add win/loss class based on total score
    if (totalScore > 0) {
      totalScoreElement.className = 'payout-value win';
      resultElement.classList.add('positive-result');
      resultElement.classList.remove('negative-result');
    } else if (totalScore < 0) {
      totalScoreElement.className = 'payout-value loss';
      resultElement.classList.add('negative-result');
      resultElement.classList.remove('positive-result');
    } else {
      totalScoreElement.className = 'payout-value';
      resultElement.classList.remove('positive-result', 'negative-result');
    }
    
    // Animate to final score
    setTimeout(() => {
      animateScoreCalculation(totalScoreElement, totalScore);
    }, 100);
  }
  
  // Function to calculate the score for Apex Legends
  function calculateApexLegendsScore(formElement) {
    const matches = 4;
    let totalScore = 0;
    let breakdown = '';
    
    // Define weights for placements
    const placementWeights = {
      first: 50,
      top5: 10,
      top10: 5,
      top20: 2,
      below20: -20
    };
    
    const killWeight = 5;
    
    // Calculate score for each match
    for (let i = 1; i <= matches; i++) {
      let matchScore = 0;
      let matchBreakdown = `<strong>Match ${i}:</strong> `;
      
      // Placement score
      const placement = formElement.querySelector(`#placement-${i}`).value;
      if (placement) {
        const placementScore = placementWeights[placement];
        matchScore += placementScore;
        
        // Get placement display name
        let placementName = "Unknown";
        switch(placement) {
          case "first": placementName = "1st place"; break;
          case "top5": placementName = "Top 5"; break;
          case "top10": placementName = "Top 10"; break;
          case "top20": placementName = "Top 20"; break;
          case "below20": placementName = "Below 20"; break;
        }
        
        const scorePrefix = placementScore >= 0 ? '+' : '';
        matchBreakdown += `${placementName}: ${scorePrefix}${placementScore}, `;
      }
      
      // Kills score
      const kills = parseInt(formElement.querySelector(`#kills-${i}`).value) || 0;
      const killsScore = kills * killWeight;
      matchScore += killsScore;
      if (kills > 0) {
        matchBreakdown += `Kills: ${kills} × ${killWeight} = +${killsScore}, `;
      }
      
      // Remove trailing comma and space
      matchBreakdown = matchBreakdown.replace(/, $/, '');
      
      // Add match score to total if any selections were made
      if (placement || kills > 0) {
        totalScore += matchScore;
        breakdown += `<div>${matchBreakdown} = <strong>${matchScore}</strong></div>`;
      }
    }
    
    // Display the result
    const resultElement = formElement.querySelector('.score-result');
    const totalScoreElement = formElement.querySelector('#total-score');
    const breakdownElement = formElement.querySelector('.stat-breakdown');
    
    // First set to zero, then animate to final score
    totalScoreElement.textContent = '0';
    breakdownElement.innerHTML = breakdown || '<div>No scores entered yet</div>';
    
    // Show result before animation
    resultElement.classList.add('show');
    
    // Add win/loss class based on total score
    if (totalScore > 0) {
      totalScoreElement.className = 'payout-value win';
      resultElement.classList.add('positive-result');
      resultElement.classList.remove('negative-result');
    } else if (totalScore < 0) {
      totalScoreElement.className = 'payout-value loss';
      resultElement.classList.add('negative-result');
      resultElement.classList.remove('positive-result');
    } else {
      totalScoreElement.className = 'payout-value';
      resultElement.classList.remove('positive-result', 'negative-result');
    }
    
    // Animate to final score
    setTimeout(() => {
      animateScoreCalculation(totalScoreElement, totalScore);
    }, 100);
  }

  // Function to calculate the score for Destiny 2
  function calculateDestiny2Score(formElement) {
    const matches = 4;
    let totalScore = 0;
    let breakdown = '';
    
    // Define weights
    const weights = {
      playerScore: 0.5,
      opponentsDefeated: 0.5,
      objectiveBlows: 1,
      advantagePoints: 1,
      zonesCaptured: 1,
      win: 5,
      loss: -20
    };
    
    // Calculate score for each match
    for (let i = 1; i <= matches; i++) {
      let matchScore = 0;
      let matchBreakdown = `<strong>Match ${i}:</strong> `;
      
      // Player Score
      const playerScore = parseInt(formElement.querySelector(`#player-score-${i}`).value) || 0;
      const playerScoreTotal = playerScore * weights.playerScore;
      matchScore += playerScoreTotal;
      if (playerScore > 0) {
        matchBreakdown += `Player Score: ${playerScore} × ${weights.playerScore} = ${playerScoreTotal.toFixed(1)}, `;
      }
      
      // Opponents Defeated
      const opponentsDefeated = parseInt(formElement.querySelector(`#opponents-defeated-${i}`).value) || 0;
      const opponentsDefeatedTotal = opponentsDefeated * weights.opponentsDefeated;
      matchScore += opponentsDefeatedTotal;
      if (opponentsDefeated > 0) {
        matchBreakdown += `Opponents Defeated: ${opponentsDefeated} × ${weights.opponentsDefeated} = ${opponentsDefeatedTotal.toFixed(1)}, `;
      }
      
      // Objective Final Blows
      const objectiveBlows = parseInt(formElement.querySelector(`#objective-blows-${i}`).value) || 0;
      const objectiveBlowsTotal = objectiveBlows * weights.objectiveBlows;
      matchScore += objectiveBlowsTotal;
      if (objectiveBlows > 0) {
        matchBreakdown += `Objective Final Blows: ${objectiveBlows} × ${weights.objectiveBlows} = ${objectiveBlowsTotal}, `;
      }
      
      // Advantage Points
      const advantagePoints = parseInt(formElement.querySelector(`#advantage-points-${i}`).value) || 0;
      const advantagePointsTotal = advantagePoints * weights.advantagePoints;
      matchScore += advantagePointsTotal;
      if (advantagePoints > 0) {
        matchBreakdown += `Advantage Points: ${advantagePoints} × ${weights.advantagePoints} = ${advantagePointsTotal}, `;
      }
      
      // Zones Captured
      const zonesCaptured = parseInt(formElement.querySelector(`#zones-captured-${i}`).value) || 0;
      const zonesCapturedTotal = zonesCaptured * weights.zonesCaptured;
      matchScore += zonesCapturedTotal;
      if (zonesCaptured > 0) {
        matchBreakdown += `Zones Captured: ${zonesCaptured} × ${weights.zonesCaptured} = ${zonesCapturedTotal}, `;
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
      
      // Add match score to total if any selections were made
      if (playerScore > 0 || opponentsDefeated > 0 || objectiveBlows > 0 || 
          advantagePoints > 0 || zonesCaptured > 0 || winLoss) {
        totalScore += matchScore;
        breakdown += `<div>${matchBreakdown} = <strong>${matchScore.toFixed(1)}</strong></div>`;
      }
    }
    
    // Display the result
    const resultElement = formElement.querySelector('.score-result');
    const totalScoreElement = formElement.querySelector('#total-score');
    const breakdownElement = formElement.querySelector('.stat-breakdown');
    
    // First set to zero, then animate to final score
    totalScoreElement.textContent = '0';
    breakdownElement.innerHTML = breakdown || '<div>No scores entered yet</div>';
    
    // Show result before animation
    resultElement.classList.add('show');
    
    // Add win/loss class based on total score
    if (totalScore > 0) {
      totalScoreElement.className = 'payout-value win';
      resultElement.classList.add('positive-result');
      resultElement.classList.remove('negative-result');
    } else if (totalScore < 0) {
      totalScoreElement.className = 'payout-value loss';
      resultElement.classList.add('negative-result');
      resultElement.classList.remove('positive-result');
    } else {
      totalScoreElement.className = 'payout-value';
      resultElement.classList.remove('positive-result', 'negative-result');
    }
    
    // Animate to final score
    setTimeout(() => {
      animateScoreCalculation(totalScoreElement, Math.round(totalScore));
    }, 100);
  }

  // Function to calculate the score for VALORANT
  function calculateValorantScore(formElement) {
    const matches = 4;
    let totalScore = 0;
    let breakdown = '';
    
    // Define weights
    const weights = {
      kills: 5,
      deaths: -2,
      assists: 2,
      firstBlood: 5,
      plants: 2,
      defuses: 10,
      win: 10,
      loss: -10
    };
    
    // Calculate score for each match
    for (let i = 1; i <= matches; i++) {
      let matchScore = 0;
      let matchBreakdown = `<strong>Match ${i}:</strong> `;
      
      // Kills
      const kills = parseInt(formElement.querySelector(`#kills-${i}`).value) || 0;
      const killsTotal = kills * weights.kills;
      matchScore += killsTotal;
      if (kills > 0) {
        matchBreakdown += `Kills: ${kills} × ${weights.kills} = ${killsTotal}, `;
      }
      
      // Deaths
      const deaths = parseInt(formElement.querySelector(`#deaths-${i}`).value) || 0;
      const deathsTotal = deaths * weights.deaths;
      matchScore += deathsTotal;
      if (deaths > 0) {
        matchBreakdown += `Deaths: ${deaths} × ${weights.deaths} = ${deathsTotal}, `;
      }
      
      // Assists
      const assists = parseInt(formElement.querySelector(`#assists-${i}`).value) || 0;
      const assistsTotal = assists * weights.assists;
      matchScore += assistsTotal;
      if (assists > 0) {
        matchBreakdown += `Assists: ${assists} × ${weights.assists} = ${assistsTotal}, `;
      }
      
      // First Blood
      const firstBlood = formElement.querySelector(`#first-blood-${i}`).value;
      if (firstBlood === 'yes') {
        matchScore += weights.firstBlood;
        matchBreakdown += `First Blood: +${weights.firstBlood}, `;
      }
      
      // Plants
      const plants = parseInt(formElement.querySelector(`#plants-${i}`).value) || 0;
      const plantsTotal = plants * weights.plants;
      matchScore += plantsTotal;
      if (plants > 0) {
        matchBreakdown += `Plants: ${plants} × ${weights.plants} = ${plantsTotal}, `;
      }
      
      // Defuses
      const defuses = parseInt(formElement.querySelector(`#defuses-${i}`).value) || 0;
      const defusesTotal = defuses * weights.defuses;
      matchScore += defusesTotal;
      if (defuses > 0) {
        matchBreakdown += `Defuses: ${defuses} × ${weights.defuses} = ${defusesTotal}, `;
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
      
      // Add match score to total if any selections were made
      if (kills > 0 || deaths > 0 || assists > 0 || firstBlood === 'yes' || 
          plants > 0 || defuses > 0 || winLoss) {
        totalScore += matchScore;
        breakdown += `<div>${matchBreakdown} = <strong>${matchScore}</strong></div>`;
      }
    }
    
    // Display the result
    const resultElement = formElement.querySelector('.score-result');
    const totalScoreElement = formElement.querySelector('#total-score');
    const breakdownElement = formElement.querySelector('.stat-breakdown');
    
    // First set to zero, then animate to final score
    totalScoreElement.textContent = '0';
    breakdownElement.innerHTML = breakdown || '<div>No scores entered yet</div>';
    
    // Show result before animation
    resultElement.classList.add('show');
    
    // Add win/loss class based on total score
    if (totalScore > 0) {
      totalScoreElement.className = 'payout-value win';
      resultElement.classList.add('positive-result');
      resultElement.classList.remove('negative-result');
    } else if (totalScore < 0) {
      totalScoreElement.className = 'payout-value loss';
      resultElement.classList.add('negative-result');
      resultElement.classList.remove('positive-result');
    } else {
      totalScoreElement.className = 'payout-value';
      resultElement.classList.remove('positive-result', 'negative-result');
    }
    
    // Animate to final score
    setTimeout(() => {
      animateScoreCalculation(totalScoreElement, totalScore);
    }, 100);
  }

  // Function to calculate the score for Predecessor
  function calculatePredecessorScore(formElement) {
    const matches = 2;
    let totalScore = 0;
    let breakdown = '';
    
    // Define weights
    const weights = {
      level: 2,
      kills: 30,
      deaths: -15,
      assists: 5,
      minions: 0.5,
      gold: 0.003,
      win: 10,
      loss: -20
    };
    
    // Calculate score for each match
    for (let i = 1; i <= matches; i++) {
      let matchScore = 0;
      let matchBreakdown = `<strong>Match ${i}:</strong> `;
      
      // Level
      const level = parseInt(formElement.querySelector(`#level-${i}`).value) || 0;
      const levelTotal = level * weights.level;
      matchScore += levelTotal;
      if (level > 0) {
        matchBreakdown += `Level: ${level} × ${weights.level} = ${levelTotal}, `;
      }
      
      // Kills
      const kills = parseInt(formElement.querySelector(`#kills-${i}`).value) || 0;
      const killsTotal = kills * weights.kills;
      matchScore += killsTotal;
      if (kills > 0) {
        matchBreakdown += `Kills: ${kills} × ${weights.kills} = ${killsTotal}, `;
      }
      
      // Deaths
      const deaths = parseInt(formElement.querySelector(`#deaths-${i}`).value) || 0;
      const deathsTotal = deaths * weights.deaths;
      matchScore += deathsTotal;
      if (deaths > 0) {
        matchBreakdown += `Deaths: ${deaths} × ${weights.deaths} = ${deathsTotal}, `;
      }
      
      // Assists
      const assists = parseInt(formElement.querySelector(`#assists-${i}`).value) || 0;
      const assistsTotal = assists * weights.assists;
      matchScore += assistsTotal;
      if (assists > 0) {
        matchBreakdown += `Assists: ${assists} × ${weights.assists} = ${assistsTotal}, `;
      }
      
      // Minions
      const minions = parseInt(formElement.querySelector(`#minions-${i}`).value) || 0;
      const minionsTotal = minions * weights.minions;
      matchScore += minionsTotal;
      if (minions > 0) {
        matchBreakdown += `Minions: ${minions} × ${weights.minions} = ${minionsTotal.toFixed(1)}, `;
      }
      
      // Gold Earned
      const gold = parseInt(formElement.querySelector(`#gold-${i}`).value) || 0;
      const goldTotal = gold * weights.gold;
      matchScore += goldTotal;
      if (gold > 0) {
        matchBreakdown += `Gold: ${gold} × ${weights.gold} = ${goldTotal.toFixed(1)}, `;
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
      
      // Add match score to total if any selections were made
      if (kills > 0 || deaths > 0 || assists > 0 || minions > 0 || gold > 0 || winLoss) {
        totalScore += matchScore;
        breakdown += `<div>${matchBreakdown} = <strong>${matchScore.toFixed(1)}</strong></div>`;
      }
    }
    
    // Display the result
    const resultElement = formElement.querySelector('.score-result');
    const totalScoreElement = formElement.querySelector('#total-score');
    const breakdownElement = formElement.querySelector('.stat-breakdown');
    
    // First set to zero, then animate to final score
    totalScoreElement.textContent = '0';
    breakdownElement.innerHTML = breakdown || '<div>No scores entered yet</div>';
    
    // Show result before animation
    resultElement.classList.add('show');
    
    // Add win/loss class based on total score
    if (totalScore > 0) {
      totalScoreElement.className = 'payout-value win';
      resultElement.classList.add('positive-result');
      resultElement.classList.remove('negative-result');
    } else if (totalScore < 0) {
      totalScoreElement.className = 'payout-value loss';
      resultElement.classList.add('negative-result');
      resultElement.classList.remove('positive-result');
    } else {
      totalScoreElement.className = 'payout-value';
      resultElement.classList.remove('positive-result', 'negative-result');
    }
    
    // Animate to final score
    setTimeout(() => {
      animateScoreCalculation(totalScoreElement, Math.round(totalScore));
    }, 100);
  }

  // Function to calculate score for generic forms
  function calculateGenericScore(formElement) {
    // Create a basic score result display for generic forms
    let scoreResult = formElement.querySelector('.score-result');
    
    if (!scoreResult) {
      scoreResult = document.createElement('div');
      scoreResult.className = 'score-result';
      scoreResult.innerHTML = `
        <div class="payout-container">
          <div class="payout-label">PAYOUT</div>
          <div class="payout-value">Not Available</div>
        </div>
      `;
      formElement.appendChild(scoreResult);
    }
    
    // Show result with animation
    scoreResult.classList.add('show');
    
    // For generic forms where we don't have a specific score,
    // just add a random animation for effect
    const totalScoreElement = scoreResult.querySelector('.payout-value');
    animateScoreCalculation(totalScoreElement, 0, 800);
    
    // This would be implemented later for other games
    console.log('Generic score calculation not yet implemented');
  }

  // Modify screenshot generation to ensure better visibility
  function enhanceScreenshotContainer(container) {
    // Detect mobile/high-DPR and adjust overlay opacity for readability
    const isMobileOrHighDPR = window.innerWidth < 768 || window.devicePixelRatio > 1.5;

    // Use lighter backgrounds/overlays on mobile/high-DPR
    const bgAlpha = isMobileOrHighDPR ? 0.7 : 0.95;
    const overlayAlpha = isMobileOrHighDPR ? 0.5 : 0.85;

    container.style.backgroundColor = `rgba(0, 0, 0, ${overlayAlpha})`;

    const payoutContainer = container.querySelector('.payout-container');
    if (payoutContainer) {
      payoutContainer.style.padding = '20px';
      payoutContainer.style.backgroundColor = `rgba(20, 20, 20, ${bgAlpha})`;
      payoutContainer.style.border = '2px solid rgba(255, 255, 255, 0.2)';
      payoutContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    }

    const statBreakdown = container.querySelector('.stat-breakdown');
    if (statBreakdown) {
      statBreakdown.style.backgroundColor = `rgba(30, 30, 30, ${bgAlpha})`;
      statBreakdown.style.padding = '15px';
      statBreakdown.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    }

    const scoreResult = container.querySelector('.score-result');
    if (scoreResult) {
      scoreResult.style.backgroundColor = `rgba(0, 0, 0, ${bgAlpha})`;
      scoreResult.style.padding = '30px';
      scoreResult.style.border = '4px solid rgba(255, 255, 255, 0.8)';
      scoreResult.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.6)';
      scoreResult.style.zIndex = '10';
      scoreResult.style.position = 'relative';

      const totalScoreElement = container.querySelector('#total-score');
      const scoreValue = parseInt(totalScoreElement?.textContent) || 0;

      if (scoreValue > 0) {
        scoreResult.style.border = '4px solid rgba(76, 175, 80, 0.9)';
        scoreResult.style.boxShadow = '0 0 40px rgba(76, 175, 80, 0.8)';
      } else if (scoreValue < 0) {
        scoreResult.style.border = '4px solid rgba(244, 67, 54, 0.9)';
        scoreResult.style.boxShadow = '0 0 40px rgba(244, 67, 54, 0.8)';
      }
    }

    const totalScoreElement = container.querySelector('#total-score');
    const scoreValue = parseInt(totalScoreElement?.textContent) || 0;

    if (scoreValue > 0) {
      container.style.border = '3px solid rgba(76, 175, 80, 0.7)';
      container.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.5)';
    } else if (scoreValue < 0) {
      container.style.border = '3px solid rgba(244, 67, 54, 0.7)';
      container.style.boxShadow = '0 0 15px rgba(244, 67, 54, 0.5)';
    }

    return container;
  }
});

// Function to animate score calculation with number cycling effect
function animateScoreCalculation(element, finalScore, duration = 1000) {
  // Create flash elements if they don't exist
  if (!document.getElementById('green-flash')) {
    const greenFlash = document.createElement('div');
    greenFlash.id = 'green-flash';
    greenFlash.className = 'screen-flash green-flash';
    document.body.appendChild(greenFlash);
    
    const redFlash = document.createElement('div');
    redFlash.id = 'red-flash';
    redFlash.className = 'screen-flash red-flash';
    document.body.appendChild(redFlash);
  }
  
  // Clear any existing classes that might indicate result type
  const scoreResult = element.closest('.score-result');
  if (scoreResult) {
    scoreResult.classList.remove('positive-result', 'negative-result');
    // Set initial neutral border
    scoreResult.style.transition = 'border-color 0.3s';
    scoreResult.style.border = '2px solid #444';
  }
  
  // Number of steps in the animation
  const steps = 550;
  const stepDuration = duration / steps;
  
  // Generate random numbers that converge toward the final score
  let currentStep = 0;
  
  // Function to update the display with a random number
  function updateDisplay() {
    // As we progress, make numbers closer to the final score
    const progressFactor = currentStep / steps;
    const randomRange = Math.max(5, Math.abs(finalScore) * (1 - progressFactor) * 2);
    
    // Generate a random number that gets closer to the finalScore as the animation progresses
    let randomScore;
    if (currentStep < steps - 1) {
      const min = Math.max(-999, finalScore - randomRange);
      const max = Math.min(999, finalScore + randomRange);
      randomScore = Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
      randomScore = finalScore; // Last step shows the actual score
    }
    
    // Update the display
    element.textContent = randomScore;
    element.classList.add('cycling-number');
    
    // Remove animation class after a short delay
    setTimeout(() => {
      element.classList.remove('cycling-number');
    }, 50);
    
    // Cycle through colors during animation
    const colors = ['#6441a5', '#4caf50', '#f44336', '#ff9800', '#03a9f4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    element.style.color = randomColor;
    
    // Cycle border color of score-result container
    if (scoreResult) {
      scoreResult.style.borderColor = randomColor;
      scoreResult.style.boxShadow = `0 0 10px ${randomColor}40`;
    }
    
    // Continue animation or finish
    currentStep++;
    
    if (currentStep <= steps) {
      setTimeout(updateDisplay, stepDuration);
    } else {
      // Animation complete - show flash effect
      const flashElement = finalScore >= 0 ? 
        document.getElementById('green-flash') : 
        document.getElementById('red-flash');
        
      // Flash the screen
      flashElement.style.opacity = '1';
      setTimeout(() => {
        flashElement.style.opacity = '0';
      }, 300);
      
      // Set final color based on score
      element.style.color = finalScore >= 0 ? '#4caf50' : '#f44336';
      
      // Set final border color
      if (scoreResult) {
        scoreResult.style.borderColor = finalScore >= 0 ? '#4caf50' : '#f44336';
        scoreResult.style.boxShadow = finalScore >= 0 
          ? '0 0 15px rgba(76, 175, 80, 0.5)' 
          : '0 0 15px rgba(244, 67, 54, 0.5)';
      }
      
      // Add confetti if score is positive
      if (finalScore > 0) {
        startConfetti();
      }
    }
  }
  
  // Start the animation
  updateDisplay();
}

// Function to start confetti animation with better script loading handling
let confettiLoaded = false; // Flag to track if confetti script is loaded
let confettiLoadingPromise = null; // Promise to track loading state

function startConfetti() {
  if (typeof confetti === 'function') {
    // Confetti script is already available
    launchConfetti();
    return;
  }
  
  // If we're already loading the script, wait for it
  if (confettiLoadingPromise) {
    confettiLoadingPromise.then(() => launchConfetti()).catch(() => {
      console.log('Failed to load confetti script');
    });
    return;
  }

  // Start loading the script
  confettiLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    
    script.onload = () => {
      confettiLoaded = true;
      console.log('Confetti script loaded successfully');
      resolve();
    };
    
    script.onerror = () => {
      console.error('Failed to load confetti script');
      reject();
    };
    
    document.head.appendChild(script);
  });

  // Launch confetti when script is loaded
  confettiLoadingPromise.then(() => launchConfetti()).catch(() => {
    console.log('Unable to show confetti animation');
  });
}

// Separate function to launch the actual confetti
function launchConfetti() {
  if (typeof confetti !== 'function') {
    console.error('Confetti function not available');
    return;
  }
  
  // Brighter confetti with larger particles and more vibrant colors
  const canvasOptions = {
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#FF3F8E', '#4CC9F0', '#4EF037', '#F3F51D', '#FFFFFF'],
    disableForReducedMotion: true,
    scalar: 1.5, // Larger particles
  };
  
  // Center shot - big burst
  confetti({
    ...canvasOptions,
    origin: { y: 0.6, x: 0.5 },
    gravity: 0.8, // Slower fall
    startVelocity: 35,
  });
  
  // Left side shot
  setTimeout(() => {
    confetti({
      ...canvasOptions,
      origin: { y: 0.7, x: 0.1 },
      angle: 60,
    });
  }, 150);
  
  // Right side shot
  setTimeout(() => {
    confetti({
      ...canvasOptions,
      origin: { y: 0.7, x: 0.9 },
      angle: 120,
    });
  }, 300);
  
  // Additional shots for more festive effect
  setTimeout(() => {
    confetti({
      ...canvasOptions,
      particleCount: 80,
      origin: { y: 0.8, x: 0.3 },
      colors: ['#FF9999', '#88FF88', '#9999FF', '#FFFF77'],
    });
  }, 450);
  
  setTimeout(() => {
    confetti({
      ...canvasOptions,
      particleCount: 80,
      origin: { y: 0.8, x: 0.7 },
      colors: ['#FF9999', '#88FF88', '#9999FF', '#FFFF77'],
    });
  }, 600);
}

// Add placeholder attributes to number inputs
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    document.querySelectorAll('input[type="number"]').forEach(input => {
      if (!input.hasAttribute('placeholder')) {
        input.setAttribute('placeholder', '');
      }
    });
  }, 1000);
});

// Add a general listener for all form inputs
document.addEventListener('DOMContentLoaded', function() {
  // Add event delegation to listen for input events on any form inputs
  document.addEventListener('input', function(e) {
    if ((e.target.tagName === 'INPUT' && e.target.type === 'number') || 
        e.target.tagName === 'SELECT') {
      
      if (e.target.value) {
        e.target.classList.add('input-has-value');
      } else {
        e.target.classList.remove('input-has-value');
      }
    }
  });
});

// Simple hash function for generating gradient colors
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Function to create the Overwatch 2 score form
function createOverwatch2Form() {
  const matches = 4;
  let formHTML = `
    <h3>Overwatch 2 Scoreboard</h3>
    <p>Match Results & Scoring Weights:</p>
    <ul style="margin-top: 6px; margin-bottom: 6px; padding-left: 20px;">
      <li>Eliminations: +1 each</li>
      <li>Assists: +1 each</li>
      <li>Deaths: -2 each</li>
      <li>Damage: +0.10%</li>
      <li>Healing: +0.10%</li>
      <li>Mitigation: +0.10%</li>
      <li>Win: +10 / Loss: -5</li>
    </ul>
  `;
  
  for (let i = 1; i <= matches; i++) {
    formHTML += `
      <div class="match-container" data-match="${i}">
        <div class="match-title">Match ${i}</div>
        <div class="stats-container">
          <div class="stat-input">
            <label for="eliminations-${i}">Eliminations <span class="stat-weight">(+1)</span></label>
            <input type="number" id="eliminations-${i}" min="0" class="short-input">
          </div>
          <div class="stat-input">
            <label for="assists-${i}">Assists <span class="stat-weight">(+1)</span></label>
            <input type="number" id="assists-${i}" min="0" class="short-input">
          </div>
          <div class="stat-input">
            <label for="deaths-${i}">Deaths <span class="stat-weight">(-2)</span></label>
            <input type="number" id="deaths-${i}" min="0" class="short-input">
          </div>
          <div class="stat-input">
            <label for="damage-${i}">Damage <span class="stat-weight">(+0.10%)</span></label>
            <input type="number" id="damage-${i}" min="0" class="short-input">
          </div>
          <div class="stat-input">
            <label for="healing-${i}">Healing <span class="stat-weight">(+0.10%)</span></label>
            <input type="number" id="healing-${i}" min="0" class="short-input">
          </div>
          <div class="stat-input">
            <label for="mitigation-${i}">Mitigation <span class="stat-weight">(+0.10%)</span></label>
            <input type="number" id="mitigation-${i}" min="0" class="short-input">
          </div>
          <div class="stat-input">
            <label for="winloss-${i}">Win/Loss <span class="stat-weight">(+10/-5)</span></label>
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
      <div class="payout-container">
        <div class="payout-label">PAYOUT</div>
        <div class="payout-value" id="total-score">0</div>
      </div>
      <div class="stat-breakdown"></div>
    </div>
    <button class="screenshot-btn" title="Copy scoreboard to clipboard">Take Screenshot</button>
  `;
  
  // Add additional event listeners after form is created
  setTimeout(() => {
    const formInputs = document.querySelectorAll('.stat-input input, .stat-input select');
    
    formInputs.forEach(input => {
      // Add input event listener to detect changes
      input.addEventListener('input', function() {
        if (this.value) {
          this.classList.add('input-has-value');
        } else {
          this.classList.remove('input-has-value');
        }
      });
      
      // Check initial state (for cases where input might already have a value)
      if (input.value) {
        input.classList.add('input-has-value');
      }
    });
  }, 100);
  
  return formHTML;
}

// Function to calculate the score for Overwatch 2
function calculateOverwatch2Score(formElement) {
  const matches = 4;
  let totalScore = 0;
  let breakdown = '';
  
  // Define weights
  const weights = {
    eliminations: 1,
    assists: 1,
    deaths: -2,
    damage: 0.001,
    healing: 0.001,
    mitigation: 0.001,
    win: 10,
    loss: -5
  };
  
  // Calculate score for each match
  for (let i = 1; i <= matches; i++) {
    let matchScore = 0;
    let matchBreakdown = `<strong>Match ${i}:</strong> `;
    
    // Eliminations
    const eliminations = parseInt(formElement.querySelector(`#eliminations-${i}`).value) || 0;
    const eliminationsTotal = eliminations * weights.eliminations;
    matchScore += eliminationsTotal;
    if (eliminations > 0) {
      matchBreakdown += `Eliminations: ${eliminations} × ${weights.eliminations} = ${eliminationsTotal}, `;
    }
    
    // Assists
    const assists = parseInt(formElement.querySelector(`#assists-${i}`).value) || 0;
    const assistsTotal = assists * weights.assists;
    matchScore += assistsTotal;
    if (assists > 0) {
      matchBreakdown += `Assists: ${assists} × ${weights.assists} = ${assistsTotal}, `;
    }
    
    // Deaths
    const deaths = parseInt(formElement.querySelector(`#deaths-${i}`).value) || 0;
    const deathsTotal = deaths * weights.deaths;
    matchScore += deathsTotal;
    if (deaths > 0) {
      matchBreakdown += `Deaths: ${deaths} × ${weights.deaths} = ${deathsTotal}, `;
    }
    
    // Damage
    const damage = parseInt(formElement.querySelector(`#damage-${i}`).value) || 0;
    const damageTotal = damage * weights.damage;
    matchScore += damageTotal;
    if (damage > 0) {
      matchBreakdown += `Damage: ${damage} × ${weights.damage} = ${damageTotal.toFixed(1)}, `;
    }
    
    // Healing
    const healing = parseInt(formElement.querySelector(`#healing-${i}`).value) || 0;
    const healingTotal = healing * weights.healing;
    matchScore += healingTotal;
    if (healing > 0) {
      matchBreakdown += `Healing: ${healing} × ${weights.healing} = ${healingTotal.toFixed(1)}, `;
    }
    
    // Mitigation
    const mitigation = parseInt(formElement.querySelector(`#mitigation-${i}`).value) || 0;
    const mitigationTotal = mitigation * weights.mitigation;
    matchScore += mitigationTotal;
    if (mitigation > 0) {
      matchBreakdown += `Mitigation: ${mitigation} × ${weights.mitigation} = ${mitigationTotal.toFixed(1)}, `;
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
    
    // Add match score to total if any selections were made
    if (eliminations > 0 || assists > 0 || deaths > 0 || damage > 0 || healing > 0 || mitigation > 0 || winLoss) {
      totalScore += matchScore;
      breakdown += `<div>${matchBreakdown} = <strong>${matchScore.toFixed(1)}</strong></div>`;
    }
  }
  
  // Display the result
  const resultElement = formElement.querySelector('.score-result');
  const totalScoreElement = formElement.querySelector('#total-score');
  const breakdownElement = formElement.querySelector('.stat-breakdown');
  
  // First set to zero, then animate to final score
  totalScoreElement.textContent = '0';
  breakdownElement.innerHTML = breakdown || '<div>No scores entered yet</div>';
  
  // Show result before animation
  resultElement.classList.add('show');
  
  // Add win/loss class based on total score
  if (totalScore > 0) {
    totalScoreElement.className = 'payout-value win';
    resultElement.classList.add('positive-result');
    resultElement.classList.remove('negative-result');
  } else if (totalScore < 0) {
    totalScoreElement.className = 'payout-value loss';
    resultElement.classList.add('negative-result');
    resultElement.classList.remove('positive-result');
  } else {
    totalScoreElement.className = 'payout-value';
    resultElement.classList.remove('positive-result', 'negative-result');
  }
  
  // Animate to final score
  setTimeout(() => {
    animateScoreCalculation(totalScoreElement, Math.round(totalScore));
  }, 100);
}