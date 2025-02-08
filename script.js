document.addEventListener('DOMContentLoaded', (event) => {
  setDateAndTimeInputs();
  
  document.querySelectorAll('.mod.take-screenshot').forEach(button => {
      button.addEventListener('click', handleScreenshotButtonClick);
  });

  addGlobalEventListeners();
});

function setDateAndTimeInputs() {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().substr(0, 10);
  const formattedTime = currentDate.toTimeString().substr(0, 5);

  document.querySelectorAll('input[type="date"]').forEach(dateInput => {
      dateInput.value = formattedDate;
  });

  document.querySelectorAll('input[type="time"]').forEach(timeInput => {
      timeInput.value = formattedTime;
  });
}

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

function animateClick(element) {
  element.classList.add('clicked');
  setTimeout(() => {
      element.classList.remove('clicked');
  }, 300);
}

function captureScreenshot(element) {
  return html2canvas(element).then(canvas => {
      return canvas.toBlob(blob => {
          return navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
          ]);
      });
  }).then(() => {
      alert('Selected options screenshot copied to clipboard!');
  }).catch(err => {
      console.error('Failed to capture screenshot:', err);
  });
}

function addGlobalEventListeners() {
  let lastScrollTop = 0;
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', function () {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop) {
          navbar.classList.add('hidden');
      } else {
          navbar.classList.remove('hidden');
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  });

  const pages = [
      "index.html", "refreshments.html", "MODS.html",
      "casino.html", "contracts.html"
  ];

  let touchstartX = 0;
  let touchstartY = 0;
  let touchendX = 0;
  let touchendY = 0;
  const minSwipeDistance = 100;

  function handleGesture() {
      const horizontalSwipe = Math.abs(touchendX - touchstartX) > Math.abs(touchendY - touchstartY);
      const swipeDistance = Math.abs(touchendX - touchstartX);
      if (!horizontalSwipe || swipeDistance < minSwipeDistance) return;

      document.body.classList.add('page-transition');
      const currentPage = window.location.pathname.split("/").pop();
      const currentIndex = pages.indexOf(currentPage);

      setTimeout(() => {
          if (touchendX < touchstartX) {
              window.location.href = pages[(currentIndex + 1) % pages.length];
          } else if (touchendX > touchstartX) {
              window.location.href = pages[(currentIndex - 1 + pages.length) % pages.length];
          }
      }, 300);
  }

  document.addEventListener('touchstart', e => {
      touchstartX = e.changedTouches[0].screenX;
      touchstartY = e.changedTouches[0].screenY;
  });

  document.addEventListener('touchend', e => {
      touchendX = e.changedTouches[0].screenX;
      touchendY = e.changedTouches[0].screenY;
      handleGesture();
  });
}