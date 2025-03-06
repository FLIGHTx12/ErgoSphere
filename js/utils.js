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

function animateClick(element) {
    element.classList.add('clicked');
    setTimeout(() => {
        element.classList.remove('clicked');
    }, 300);
}

function captureScreenshot(element) {
    return html2canvas(element).then(canvas => {
        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                if (navigator.clipboard && navigator.clipboard.write) {
                    navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]).then(() => {
                        alert('Screenshot copied to clipboard!');
                        resolve();
                    }).catch(err => {
                        console.error('Clipboard API failed:', err);
                        fallbackDownload(blob);
                        resolve();
                    });
                } else {
                    fallbackDownload(blob);
                    resolve();
                }
            });
        });
    }).catch(err => {
        console.error('Failed to capture screenshot:', err);
    });
}

function fallbackDownload(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'screenshot.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Screenshot downloaded as "screenshot.png".');
}

function addGlobalEventListeners() {
    let lastScrollTop = 0;
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        navbar.classList.toggle('hidden', scrollTop > lastScrollTop);
        lastScrollTop = Math.max(scrollTop, 0);
    });

    const pages = [
        "index.html", "ErgoShop.html", "MODS.html",
        "pages/casino.html", "contracts.html"
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