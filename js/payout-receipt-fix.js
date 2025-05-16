// Fixed version of createPayoutReceipt function to fix background image issues

// Override the original createPayoutReceipt function
document.addEventListener('DOMContentLoaded', function() {
  if (typeof window.createPayoutReceipt === 'function') {
    const originalCreatePayoutReceipt = window.createPayoutReceipt;
    
    window.createPayoutReceipt = function(bet) {
      // Remove any existing payout receipt
      const existingReceipt = document.querySelector('.payout-receipt');
      if (existingReceipt) {
        existingReceipt.remove();
      }
        
      // Handle different data formats for local vs. database bets
      const isLocal = bet.id && typeof bet.id === 'string' ? bet.id.startsWith('local-') : false;
      const betData = isLocal ? bet.bet_data : bet.bet_data;
      const betStatus = bet.bet_status || {};
      const payoutData = bet.payout_data || {};
      
      // Create payout receipt element
      const receiptDiv = document.createElement('div');
      receiptDiv.className = 'payout-receipt';
      
      // Determine which user's styling to use
      let userClass = '';
      if (bet.user_name === "FLIGHTx12!") {
        userClass = 'user-flight';
      } else if (bet.user_name === "Jaybers8") {
        userClass = 'user-jaybers';
      }
      
      // Add user class
      if (userClass) {
        receiptDiv.classList.add(userClass);
      }
      
      // Format date nicely
      const betDate = new Date(bet.bet_date).toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'short', // Use short month name to save space
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Count wins and calculate payout
      let winsCount = 0;
      let totalWager = 0;
      let totalWinnings = 0;
      
      betData.bets.forEach((b, idx) => {
        totalWager += b.betAmount;
        if (betStatus[idx] === 'won') {
          winsCount++;
          totalWinnings += b.potentialWin;
        }
      });

      // Create receipt HTML with improved structure for mobile visibility
      receiptDiv.innerHTML = `
        <button class="payout-receipt-close">&times;</button>
        <h2>Payout Receipt</h2>
        <div class="receipt-content-wrapper">
          <div class="receipt-info">
            <div class="receipt-user-date"><b>${bet.user_name}</b> | ${betDate}</div>
            <div class="matchup">${betData.awayTeam} @ ${betData.homeTeam}</div>
            
            <div class="bet-details">
              <h3>Bet Results:</h3>
              <ul>
                ${betData.bets.map((b, idx) => {
                  const status = betStatus[idx] || 'pending';
                  const statusClass = status === 'won' ? 'bet-won' : status === 'lost' ? 'bet-lost' : '';
                  
                  // Format player name to be shorter if needed
                  let playerName = b.player;
                  if (playerName && playerName.length > 15) {
                    playerName = playerName.substring(0, 13) + '...';
                  }
                  
                  return `
                    <li class="${statusClass}">
                      ${b.betText.trim()} ${playerName ? ': ' + playerName : ''} 
                      <br><b>${status.toUpperCase()}</b> 
                      ${status === 'won' ? `<span>(+${b.potentialWin} 💷)</span>` : ''}
                    </li>
                  `;
                }).join('')}
              </ul>
            </div>
            
            <div class="payout-summary">
              <div class="payout-summary-details">
                <span>Total Wager: ${totalWager} 💷</span>
                <span>Bets Won: ${winsCount} of ${betData.bets.length}</span>
              </div>
              <div class="payout-value">TOTAL PAYOUT: ${totalWinnings} 💷</div>
            </div>
            
            <button id="copy-payout-receipt" class="copy-receipt-btn">Copy Receipt</button>
          </div>
        </div>
      `;
      
      // Add to document
      document.body.appendChild(receiptDiv);
      
      // Apply background image AFTER the element is in the DOM with delay for proper rendering
      setTimeout(() => {
        if (bet.user_name === "FLIGHTx12!") {
          receiptDiv.style.backgroundImage = "url('../assets/img/backgrounds/betdivbackgroundgreen.jpg')";
        } else if (bet.user_name === "Jaybers8") {
          receiptDiv.style.backgroundImage = "url('../assets/img/backgrounds/betdivbackgroundpurp.jpg')";
        }
      }, 10);
      
      // Add event listeners
      receiptDiv.querySelector('.payout-receipt-close').addEventListener('click', () => {
        receiptDiv.remove();
      });
      
      receiptDiv.querySelector('#copy-payout-receipt').addEventListener('click', () => {
        capturePayoutReceiptScreenshot(receiptDiv);
      });
    };
      // Replace the original capturePayoutReceiptScreenshot function with improved version
    window.capturePayoutReceiptScreenshot = function(receiptElement) {
      // First prepare the receipt for capture
      prepareForCapture(receiptElement).then(() => {
        // Add capturing class for special styling
        receiptElement.classList.add('capturing');
        
        // Ensure background image is properly set for the user
        const userName = receiptElement.querySelector('.receipt-user')?.textContent || 
                         document.getElementById('user')?.value || '';
        
        let bgImageUrl = receiptElement.style.backgroundImage;
        
        // If no background is set or it's 'none', apply user-specific background
        if (!bgImageUrl || bgImageUrl === 'none') {
          if (userName.includes('FLIGHT')) {
            bgImageUrl = "url('../assets/img/backgrounds/betdivbackgroundgreen.jpg')";
          } else if (userName.includes('Jaybers')) {
            bgImageUrl = "url('../assets/img/backgrounds/betdivbackgroundpurp.jpg')";
          } else {
            // Default background if user not recognized
            bgImageUrl = "url('../assets/img/backgrounds/betdivbackgroundgreen.jpg')";
          }
          receiptElement.style.backgroundImage = bgImageUrl;
          receiptElement.style.backgroundSize = 'cover';
          receiptElement.style.backgroundPosition = 'center';
        }
        
        // Preload background image to ensure it's fully loaded before capture
        const bgUrl = bgImageUrl.replace(/url\(['"]?(.*?)['"]?\)/i, '$1').replace(/["']/g, '');
        const preloadImage = new Image();
        preloadImage.crossOrigin = "anonymous"; // Enable CORS
        preloadImage.src = bgUrl;
        
        // Function to continue with capture after ensuring background is loaded
        const continueCapture = () => {
          // Calculate ideal dimensions based on content
          const contentWrapper = receiptElement.querySelector('.receipt-content-wrapper');
          const contentHeight = contentWrapper ? contentWrapper.scrollHeight : receiptElement.scrollHeight;
          const contentWidth = receiptElement.clientWidth;
          
          // Set temporary fixed height to ensure all content is captured
          const originalHeight = receiptElement.style.height;
          const originalMaxHeight = receiptElement.style.maxHeight;
          const originalOverflow = receiptElement.style.overflow;
          
          receiptElement.style.height = contentHeight + 'px';
          receiptElement.style.maxHeight = 'none';
          receiptElement.style.overflow = 'visible';
          
          // Configure html2canvas options for better mobile capture
          html2canvas(receiptElement, { 
            useCORS: true, 
            allowTaint: true,
            backgroundColor: null, // Use element's own background
            scale: window.devicePixelRatio || 2, // Use device pixel ratio for better quality
            width: contentWidth,
            height: contentHeight,
            scrollX: 0,
            scrollY: -window.scrollY, // Adjust for page scroll
            logging: false,
            onclone: function(clonedDoc, clonedElement) {
              // Copy background properties explicitly
              const styles = getComputedStyle(receiptElement);
              clonedElement.style.backgroundImage = styles.backgroundImage;
              clonedElement.style.backgroundSize = styles.backgroundSize;
              clonedElement.style.backgroundPosition = styles.backgroundPosition;
              clonedElement.style.backgroundRepeat = styles.backgroundRepeat;
              
              // Further enhance the clone for better visibility
              clonedElement.querySelectorAll('.bet-details, .payout-summary, .matchup').forEach(el => {
                el.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                el.style.color = 'white';
                el.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 1)';
                el.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                el.style.borderRadius = '5px';
                el.style.padding = '8px';
                el.style.margin = '8px 0';
              });
            }        }).then(canvas => {
          // Restore original styles
          receiptElement.classList.remove('capturing');
          receiptElement.style.height = originalHeight;
          receiptElement.style.maxHeight = originalMaxHeight;
          receiptElement.style.overflow = originalOverflow;
          
          canvas.toBlob(blob => {
            navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]).then(() => {
              alert('Receipt screenshot copied to clipboard!');
            }).catch(err => {
              console.error('Failed to copy screenshot:', err);
              // Fallback - offer direct download if clipboard fails
              const link = document.createElement('a');
              link.download = 'payout-receipt.png';
              link.href = canvas.toDataURL('image/png');
              link.click();
              alert('Receipt saved as image (clipboard access failed).');
            });
          }, 'image/png', 1.0); // Use highest quality PNG
        }).catch(err => {
          console.error('Failed to capture screenshot:', err);
          receiptElement.classList.remove('capturing');
          alert('Failed to capture screenshot. Please try again or use a browser screenshot tool.');
          
          // Restore original styles
          receiptElement.style.height = originalHeight;
          receiptElement.style.maxHeight = originalMaxHeight;
          receiptElement.style.overflow = originalOverflow;
        });
        };
        
        // Check if background image needs to be preloaded
        if (bgUrl && bgUrl !== "none") {
          // Wait for image to load or timeout after 2 seconds
          const timeout = setTimeout(() => {
            console.log('Background image load timed out, continuing with capture');
            continueCapture();
          }, 2000);
          
          preloadImage.onload = () => {
            clearTimeout(timeout);
            console.log('Background image loaded successfully');
            setTimeout(continueCapture, 100); // Small delay after load
          };
          
          preloadImage.onerror = () => {
            clearTimeout(timeout);
            console.error('Failed to load background image');
            continueCapture(); // Continue anyway
          };
        } else {
          // No background to preload, continue directly
          continueCapture();
        }
      }).catch(err => {
        console.error('Failed to prepare for capture:', err);
        alert('Failed to prepare for screenshot. Please try again.');
      });
    };
    
    // Helper function to prepare the receipt for capture
    function prepareForCapture(element) {
      return new Promise((resolve, reject) => {
        try {
          // Store original background-image
          const originalBgImage = element.style.backgroundImage;
          
          // Force dark background for better text visibility during capture
          element.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
          // Do NOT hide the element's background image, allow ::before to inherit it
          
          // Ensure all content is visible
          element.querySelectorAll('.bet-details, .payout-summary, .matchup').forEach(el => {
            el.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
            el.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            el.style.textShadow = '1px 1px 3px black';
          });
          
          // Ensure text colors are bold and visible
          element.querySelectorAll('.payout-value').forEach(el => {
            el.style.textShadow = '1px 1px 3px black';
            el.style.fontWeight = 'bold';
          });
          
          // Make sure the copy button is hidden during capture
          const copyButton = element.querySelector('#copy-payout-receipt');
          if (copyButton) {
            copyButton.style.display = 'none';
          }
          
          // Wait a small amount of time for styles to apply
          setTimeout(() => {
            resolve();
          }, 50);
        } catch (error) {
          reject(error);
        }
      });
    }
    
    console.log("✅ Payout receipt display fix installed");
  } else {
    console.error("⚠️ createPayoutReceipt function not found, fix not applied");
  }
});
