document.addEventListener('DOMContentLoaded', () => {
  setDateAndTimeInputs();
  
  document.querySelectorAll('.mod.take-screenshot').forEach(button => {
    button.addEventListener('click', handleScreenshotButtonClick);
  });

  addGlobalEventListeners();

  const clickSound = new Audio('../../assets/audio/mouse-click-deep.mp3');
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      clickSound.play();
    });
  });
  
  // Restore site state
  restoreSiteState();

  // Add event listeners to save state on input changes
  document.querySelectorAll('input, select, textarea').forEach(element => {
    element.addEventListener('input', saveSiteState);
  });

  // Removed expandable card event listeners
});

function handleScreenshotButtonClick(event) {
  const modDiv = event.target.closest('.mod');
  if (modDiv) {
    const selectedOptions = modDiv.querySelectorAll('.custom-select');

    selectedOptions.forEach(select => {
      Array.from(select.options).forEach(option => {
        if (!option.selected && option.value !== '0') {
          option.style.display = 'none';
        }
      });
    });

    animateClick(modDiv);

    captureScreenshot(modDiv).finally(() => {
      selectedOptions.forEach(select => {
        Array.from(select.options).forEach(option => {
          option.style.display = '';
        });
      });
    });
  }
}

// Save site state to localStorage
function saveSiteState() {
  const state = {};

  // Example: Save form inputs
  document.querySelectorAll('input, select, textarea').forEach(element => {
    state[element.id || element.name] = element.value;
  });

  // Save the state object to localStorage
  localStorage.setItem('siteState', JSON.stringify(state));
}

// Restore site state from localStorage
function restoreSiteState() {
  const state = JSON.parse(localStorage.getItem('siteState')) || {};

  // Example: Restore form inputs
  Object.keys(state).forEach(key => {
    const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
    if (element) {
      element.value = state[key];
    }
  });
}

// Add this logic to movies.html via script injection if hash is present
if (window.location.pathname.endsWith('movies.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    const hash = window.location.hash;
    if (hash) {
      const targetId = hash.replace('#', '');
      // Try both id and data-title attributes for flexibility
      let target = document.getElementById(targetId);
      if (!target) {
        target = document.querySelector(`[data-title="${targetId}"]`);
      }
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (target.classList.contains('collapsed')) {
          target.classList.remove('collapsed');
        }
        if (target.tagName.toLowerCase() === 'details') {
          target.open = true;
        }
        target.style.boxShadow = '0 0 20px 5px #0ff';
        setTimeout(() => { target.style.boxShadow = ''; }, 2000);
      }
    }
  });
}