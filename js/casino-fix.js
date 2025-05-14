// Visual feedback for clicked buttons
document.addEventListener('DOMContentLoaded', function() {
  // Function to add visual feedback to bet status buttons
  const enhanceBetStatusButtons = function() {
    const buttons = document.querySelectorAll('.bet-won-btn, .bet-lost-btn');
    buttons.forEach(btn => {
      // Store original background color
      const originalColor = btn.classList.contains('bet-won-btn') 
        ? 'rgba(0, 180, 0, 0.8)' 
        : 'rgba(180, 0, 0, 0.8)';
      
      // Replace onclick with addEventListener
      const originalOnClick = btn.onclick;
      if (originalOnClick) {
        btn.onclick = null;
        btn.addEventListener('click', async function(e) {
          // Visual feedback
          const originalText = this.innerText;
          const originalBgColor = this.style.backgroundColor;
          
          this.innerText = '...';
          this.disabled = true;
          this.style.backgroundColor = 'rgba(100, 100, 100, 0.5)';
          
          try {
            // Call the original onclick handler
            await originalOnClick.call(this, e);
          } catch (err) {
            console.error('Error processing button click:', err);
            // Restore button state if there's an error
            this.innerText = originalText;
            this.disabled = false;
            this.style.backgroundColor = originalBgColor;
            alert('Failed to update bet status. Please try again.');
          }
        });
      }
    });
  };

  // Initial enhancement
  enhanceBetStatusButtons();

  // Create a MutationObserver to detect when new bet entries are added
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any of the added nodes contain bet buttons
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && (node.classList?.contains('bet-log-list') || 
             node.querySelector?.('.bet-won-btn, .bet-lost-btn'))) {
            enhanceBetStatusButtons();
          }
        });
      }
    });
  });

  // Watch for changes in the bet-log element
  const betLog = document.getElementById('bet-log');
  if (betLog) {
    observer.observe(betLog, { childList: true, subtree: true });
  }
});
