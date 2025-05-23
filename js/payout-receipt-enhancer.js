/**
 * Enhanced Payout Receipt Styling and Interactions
 * This script adds enhanced UI behaviors to the payout receipt for improved user experience
 */

document.addEventListener('DOMContentLoaded', () => {
  // Audio feedback for interactions (optional)
  const clickSound = new Audio('../assets/audio/mouse-click-normal.mp3');
  clickSound.volume = 0.3;
  
  // Monitor for dynamically created payout receipts
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && (
              node.classList.contains('payout-receipt') ||
              node.querySelector && node.querySelector('.payout-receipt')
          )) {
            enhancePayoutReceipt(node.classList.contains('payout-receipt') ? node : node.querySelector('.payout-receipt'));
          }
        });
      }
    });
  });

  // Start observing the body for dynamically added payout receipts
  observer.observe(document.body, { childList: true, subtree: true });
    // Function to enhance the payout receipt UI
  function enhancePayoutReceipt(receiptElement) {
    if (!receiptElement) return;
    
    console.log('Enhancing payout receipt UI');
    
    // Add subtle animation for the background
    const wrapper = receiptElement.querySelector('.receipt-content-wrapper');
    if (wrapper) {
      // Add scale-in animation
      receiptElement.style.animation = 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      
      // Add keyframes if they don't exist yet
      if (!document.querySelector('#payout-receipt-animations')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'payout-receipt-animations';
        styleSheet.textContent = `
          @keyframes scaleIn {
            from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
            to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
          
          @keyframes glowPulse {
            0% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.6); }
            50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.8); }
            100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.6); }
          }
          
          @keyframes shimmerGold {
            0% { background-position: -100% 0; }
            100% { background-position: 200% 0; }
          }
          
          @keyframes floatAnimation {
            0% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
            100% { transform: translateY(0); }
          }
          
          @keyframes winPulse {
            0% { opacity: 0.9; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
            100% { opacity: 0.9; transform: scale(1); }
          }
        `;
        document.head.appendChild(styleSheet);
      }
      
      // Add subtle glow animation
      receiptElement.style.animation = 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), glowPulse 2s infinite';
      
      // Make sure the wrapper background image is visible
      if (!wrapper.style.backgroundImage && receiptElement.style.backgroundImage) {
        wrapper.style.backgroundImage = receiptElement.style.backgroundImage;
      }
    }
    
    // Make the close button more interactive
    const closeBtn = receiptElement.querySelector('.payout-receipt-close');
    if (closeBtn) {
      closeBtn.addEventListener('mouseover', () => {
        closeBtn.style.transform = 'scale(1.1)';
        closeBtn.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
      });
      closeBtn.addEventListener('mouseout', () => {
        closeBtn.style.transform = '';
        closeBtn.style.backgroundColor = 'transparent';
      });
      // Optional click sound
      closeBtn.addEventListener('click', () => {
        if (window.clickSound) {
          window.clickSound.play().catch(() => {});
        }
      });
    }
    
    // Enhance the header with gold shimmer effect
    const header = receiptElement.querySelector('h2');
    if (header) {
      header.style.backgroundSize = '200% 100%';
      header.style.animation = 'shimmerGold 3s infinite linear';
    }
    
    // Make payout value pop with enhanced styling
    const payoutValue = receiptElement.querySelector('.payout-value');
    if (payoutValue) {
      payoutValue.style.transition = 'all 0.5s ease';
      setTimeout(() => {
        payoutValue.style.transform = 'scale(1.05)';
        payoutValue.style.textShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
        
        // Add floating animation for higher visual impact
        if (parseInt(payoutValue.textContent.match(/\d+/)[0]) > 500) {
          // For big wins, add extra emphasis
          payoutValue.style.animation = 'winPulse 2s infinite ease-in-out';
          payoutValue.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
        } else {
          payoutValue.style.animation = 'floatAnimation 3s infinite ease-in-out';
        }
      }, 500);
    }
    
    // Enhance winning bet items with subtle animations
    const winningBets = receiptElement.querySelectorAll('.bet-won');
    winningBets.forEach((bet, index) => {
      // Stagger the animations slightly
      setTimeout(() => {
        bet.style.transition = 'all 0.3s ease';
        bet.style.animation = 'floatAnimation 3s infinite ease-in-out';
        bet.style.animationDelay = `${index * 0.2}s`;
      }, 300 + (index * 100));
    });
    
    // Make the matchup more prominent
    const matchup = receiptElement.querySelector('.matchup');
    if (matchup) {
      matchup.style.fontWeight = 'bold';
      matchup.style.transition = 'all 0.3s ease';
      
      // Add hover effect
      matchup.addEventListener('mouseover', () => {
        matchup.style.transform = 'scale(1.02)';
        matchup.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.5)';
      });
      
      matchup.addEventListener('mouseout', () => {
        matchup.style.transform = '';
        matchup.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.5)';
      });
    }
      // Make copy button more interactive
  const copyBtn = receiptElement.querySelector('.copy-receipt-btn');
  if (copyBtn) {
    try {
      // Add compact mode toggle button
      const compactToggle = document.createElement('button');
      compactToggle.textContent = '📏 Compact Mode';
      compactToggle.className = 'compact-mode-toggle';
      compactToggle.style.position = 'absolute';
      compactToggle.style.right = '10px';
      compactToggle.style.bottom = '10px';
      compactToggle.style.backgroundColor = 'rgba(0,0,0,0.7)';
      compactToggle.style.color = '#ddd';
      compactToggle.style.border = '1px solid #444';
      compactToggle.style.borderRadius = '4px';
      compactToggle.style.padding = '4px 8px';
      compactToggle.style.fontSize = '0.8em';
      compactToggle.style.cursor = 'pointer';
      compactToggle.style.zIndex = '5';
      
      compactToggle.addEventListener('mouseover', () => {
        compactToggle.style.backgroundColor = 'rgba(30,30,30,0.9)';
      });
      
      compactToggle.addEventListener('mouseout', () => {
        compactToggle.style.backgroundColor = 'rgba(0,0,0,0.7)';
      });
      
      // Toggle compact mode
      compactToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the click from bubbling up
        receiptElement.classList.toggle('compact-mode');
        if (receiptElement.classList.contains('compact-mode')) {
          compactToggle.textContent = '🔍 Full Mode';
        } else {
          compactToggle.textContent = '📏 Compact Mode';
        }
      });
      
      // Add the toggle button to the receipt
      const wrapper = receiptElement.querySelector('.receipt-content-wrapper');
      if (wrapper) {
        wrapper.appendChild(compactToggle);
      }
      
      // Handle click on copy button
      copyBtn.addEventListener('click', () => {
        if (window.clickSound) {
          try {
            window.clickSound.play().catch(() => {});
          } catch (e) {
            console.log('Error playing sound:', e);
          }
        }
        copyBtn.textContent = 'Creating Receipt Image...';
        copyBtn.disabled = true;
        
        // Reset button text after screenshot is taken
        setTimeout(() => {
          copyBtn.textContent = 'Copy Receipt';
          copyBtn.disabled = false;
        }, 2000);
      });
    } catch (error) {
      console.error('Error setting up compact mode toggle:', error);
    }
  }
  }  // Add share capabilities for the payout receipt
  function addShareCapabilities(receiptElement) {
    // Check if Share API is supported
    if (navigator.share) {
      const copyBtn = receiptElement.querySelector('.copy-receipt-btn');
      
      if (copyBtn) {
        // Create a share button next to the copy button
        const shareBtn = document.createElement('button');
        shareBtn.textContent = '📱 Share';
        shareBtn.className = 'share-receipt-btn';
        shareBtn.style.display = 'block';
        shareBtn.style.margin = '10px auto';
        shareBtn.style.padding = '8px 15px';
        shareBtn.style.background = 'linear-gradient(to bottom, #1a237e, #0d47a1)';
        shareBtn.style.color = 'white';
        shareBtn.style.border = '1px solid #0d47a1';
        shareBtn.style.borderRadius = '6px';
        shareBtn.style.cursor = 'pointer';
        shareBtn.style.fontWeight = 'bold';
        shareBtn.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.5)';
        shareBtn.style.transition = 'all 0.2s ease';
        
        // Add hover effects
        shareBtn.addEventListener('mouseover', () => {
          shareBtn.style.background = 'linear-gradient(to bottom, #283593, #1565c0)';
          shareBtn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
          shareBtn.style.transform = 'translateY(-2px)';
        });
        
        shareBtn.addEventListener('mouseout', () => {
          shareBtn.style.background = 'linear-gradient(to bottom, #1a237e, #0d47a1)';
          shareBtn.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.5)';
          shareBtn.style.transform = '';
        });
        
        shareBtn.addEventListener('click', async () => {
          try {
            // First generate the image
            const imageDataUrl = await captureReceiptToDataURL(receiptElement);
            
            // Convert data URL to Blob
            const response = await fetch(imageDataUrl);
            const blob = await response.blob();
            
            // Create a file from the blob
            const file = new File([blob], 'ergosphere-receipt.png', { type: 'image/png' });
            
            // Share the image
            await navigator.share({
              title: 'ErgoSphere Casino Receipt',
              text: 'Check out my casino results!',
              files: [file]
            });
          } catch (error) {
            console.error('Error sharing:', error);
            alert('Sorry, sharing failed. You can still use the copy button.');
          }
        });
        
        // Insert the share button after the copy button
        copyBtn.parentNode.insertBefore(shareBtn, copyBtn.nextSibling);
      }
    }
  }
  
  // Helper function to capture receipt as data URL
  async function captureReceiptToDataURL(receiptElement) {
    return new Promise((resolve, reject) => {
      try {
        // Add capturing class
        receiptElement.classList.add('capturing');
        
        // Hide copy button during capture
        const copyBtn = receiptElement.querySelector('.copy-receipt-btn');
        const shareBtn = receiptElement.querySelector('.share-receipt-btn');
        if (copyBtn) copyBtn.style.display = 'none';
        if (shareBtn) shareBtn.style.display = 'none';
        
        // Use html2canvas to capture the receipt
        html2canvas(receiptElement, {
          scale: 3,
          backgroundColor: null,
          logging: false
        }).then(canvas => {
          // Convert canvas to data URL
          const dataUrl = canvas.toDataURL('image/png');
          
          // Restore the buttons
          if (copyBtn) copyBtn.style.display = 'block';
          if (shareBtn) shareBtn.style.display = 'block';
          
          // Remove capturing class
          receiptElement.classList.remove('capturing');
          
          resolve(dataUrl);
        }).catch(err => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  
  // Make click sound available globally
  window.clickSound = clickSound;
  
  // Add to window for other scripts to access
  window.enhancePayoutReceipt = enhancePayoutReceipt;
});
