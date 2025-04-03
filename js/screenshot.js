// Screenshot functionality for MOD divs

// Function to capture screenshot of an element
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

// Fallback download function when clipboard API is not available
function fallbackDownload(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mod-screenshot.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Screenshot downloaded!');
}

// Initialize screenshot buttons when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add screenshot buttons to each mod div
    const modDivs = document.querySelectorAll('.mod');
    
    modDivs.forEach((modDiv, index) => {
        // Set unique ID if not already set
        if (!modDiv.id) {
            modDiv.id = `mod-${index}`;
        }
        
        // Create screenshot button
        const screenshotBtn = document.createElement('button');
        screenshotBtn.className = 'screenshot-btn';
        screenshotBtn.innerHTML = '📸';
        screenshotBtn.setAttribute('title', 'Copy to clipboard');
        
        // Add click event listener
        screenshotBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent any parent click events
            
            // Temporarily hide the button for cleaner screenshot
            this.style.display = 'none';
            
            // Capture the screenshot
            captureScreenshot(modDiv).then(() => {
                // Show the button again after capturing
                this.style.display = 'block';
            });
        });
        
        // Append button to mod div
        modDiv.appendChild(screenshotBtn);
    });
});
