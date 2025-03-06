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