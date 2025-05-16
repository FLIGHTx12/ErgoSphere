function setDateAndTimeInputs() {
    const currentDate = new Date();

    // Format date as MM/DD/YYYY
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = currentDate.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;

    // Format time as HH:MM AM/PM
    let hours = currentDate.getHours();
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

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
    // Force any background images to load completely before capture
    if (element.style.backgroundImage || 
        getComputedStyle(element).backgroundImage !== 'none') {
        
        // Create temp image to ensure background is loaded
        const bgUrl = getComputedStyle(element).backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
        if (bgUrl) {
            const img = new Image();
            img.src = bgUrl;
        }
    }
    
    // Add slight delay to ensure background is rendered
    return new Promise(resolve => {
        setTimeout(() => {
            html2canvas(element, {
                allowTaint: true,
                useCORS: true,
                backgroundColor: null,
                logging: false,
                scale: 2, // Higher quality
                onclone: function(clonedDoc) {
                    // Ensure background image is preserved in the clone
                    const clonedElement = clonedDoc.querySelector('#' + element.id);
                    if (clonedElement) {
                        // Copy computed styles to ensure background is properly captured
                        const styles = getComputedStyle(element);
                        clonedElement.style.backgroundImage = styles.backgroundImage;
                        clonedElement.style.backgroundSize = styles.backgroundSize;
                        clonedElement.style.backgroundPosition = styles.backgroundPosition;
                        clonedElement.style.backgroundRepeat = styles.backgroundRepeat;
                        clonedElement.style.backgroundColor = styles.backgroundColor;
                    }
                }
            }).then(canvas => {
                canvas.toBlob(blob => {
                    if (!blob) {
                        console.error('Canvas is empty');
                        resolve();
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
            }).catch(err => {
                console.error('Failed to capture screenshot:', err);
                resolve();
            });
        }, 100); // Short delay to ensure rendering
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