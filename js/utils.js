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

    // Removed gesture controls
}