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
      receiptDiv.className = 'payout-receipt glass-effect';
      
      // Determine which user's styling to use
      let userClass = '';
      if (bet.user_name === "FLIGHTx12!") {
        userClass = 'user-flight';
        // Only set background-image as a separate style, not direct style
        receiptDiv.dataset.bgImage = "url('../assets/img/backgrounds/betdivbackgroundgreen.jpg')";
      } else if (bet.user_name === "Jaybers8") {
        userClass = 'user-jaybers';
        // Only set background-image as a separate style, not direct style
        receiptDiv.dataset.bgImage = "url('../assets/img/backgrounds/betdivbackgroundpurp.jpg')";
      }
      
      // Add user class
      if (userClass) {
        receiptDiv.classList.add(userClass);
      }
      
      // Format date nicely
      const betDate = new Date(bet.bet_date).toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
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
        // Create receipt HTML with a container for better visibility
      receiptDiv.innerHTML = `
        <button class="payout-receipt-close">&times;</button>
        <h2>Payout Receipt</h2>
        <div class="receipt-info">
          <div><b>${bet.user_name}</b> | ${betDate}</div>
          <div class="matchup">${betData.awayTeam} @ ${betData.homeTeam}</div>
          
          <div class="bet-details">
            <h3>Bet Results:</h3>
            <ul>
              ${betData.bets.map((b, idx) => {
                const status = betStatus[idx] || 'pending';
                const statusClass = status === 'won' ? 'bet-won' : status === 'lost' ? 'bet-lost' : '';
                
                // Format player name to be shorter if needed
                let playerName = b.player;
                if (playerName && playerName.length > 20) {
                  playerName = playerName.substring(0, 18) + '...';
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
            <div>Total Wager: ${totalWager} 💷</div>
            <div>Bets Won: ${winsCount} of ${betData.bets.length}</div>
            <div class="payout-value">TOTAL PAYOUT: ${totalWinnings} 💷</div>
          </div>
          
          <button id="copy-payout-receipt" class="copy-receipt-btn">Copy Receipt</button>
        </div>
      `;
      
      // Add to document
      document.body.appendChild(receiptDiv);
      
      // Apply background image from dataset after element is in the DOM
      if (receiptDiv.dataset.bgImage) {
        // We use getComputedStyle to enforce a re-flow before changing styles
        window.getComputedStyle(receiptDiv).opacity;
        receiptDiv.style.backgroundImage = receiptDiv.dataset.bgImage;
      }
      
      // Add event listeners
      receiptDiv.querySelector('.payout-receipt-close').addEventListener('click', () => {
        receiptDiv.remove();
      });
      
      receiptDiv.querySelector('#copy-payout-receipt').addEventListener('click', () => {
        capturePayoutReceiptScreenshot(receiptDiv);
      });

      // Call the original function to maintain any other behavior
      if (originalCreatePayoutReceipt !== window.createPayoutReceipt) {
        // Call the original function but prevent infinite recursion
        const original = originalCreatePayoutReceipt;
        // Don't actually call it as we've replaced the functionality
        // original(bet);
      }
    };
    
    console.log("✅ Payout receipt display fix installed");
  } else {
    console.error("⚠️ createPayoutReceipt function not found, fix not applied");
  }
});
