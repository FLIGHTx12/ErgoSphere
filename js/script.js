document.addEventListener('DOMContentLoaded', (event) => {
  setDateAndTimeInputs();
  
  document.querySelectorAll('.mod.take-screenshot').forEach(button => {
      button.addEventListener('click', handleScreenshotButtonClick);
  });

  addGlobalEventListeners();
});

function handleScreenshotButtonClick(event) {
  const modDiv = event.target.closest('.mod');
  if (modDiv) {
      const selectedOptions = modDiv.querySelectorAll('.custom-select');

      // Temporarily hide non-selected options
      selectedOptions.forEach(select => {
          Array.from(select.options).forEach(option => {
              if (!option.selected && option.value !== '0') {
                  option.style.display = 'none';
              }
          });
      });

      animateClick(modDiv);

      captureScreenshot(modDiv).finally(() => {
          // Restore all options
          selectedOptions.forEach(select => {
              Array.from(select.options).forEach(option => {
                  option.style.display = '';
              });
          });
      });
  }
}