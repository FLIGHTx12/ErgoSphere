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
            
            // Set crossOrigin attribute if it's a remote URL (not a data URL)
            if (!bgUrl.startsWith('data:')) {
                img.crossOrigin = 'anonymous';
            }
        }
    }
    
    // Store original dimensions and styles
    const originalStyles = {
        height: element.style.height,
        maxHeight: element.style.maxHeight,
        overflow: element.style.overflow
    };
    
    // Make sure element shows all content
    element.style.height = 'auto';
    element.style.maxHeight = 'none';
    element.style.overflow = 'visible';
    
    // Add slight delay to ensure background is rendered
    return new Promise(resolve => {
        setTimeout(() => {
            html2canvas(element, {
                allowTaint: true,
                useCORS: true,
                backgroundColor: null, // Keep background transparent to preserve the element's background
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
                        
                        // Add custom styling to enhance visibility of content
                        if (element.classList.contains('receipt') || element.id === 'receipt') {
                            // Add special styling for receipt elements
                            clonedElement.querySelectorAll('.matchup, .bet-line, .wager-total').forEach(el => {
                                el.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                                el.style.textShadow = '1px 1px 3px black';
                                el.style.padding = '5px';
                                el.style.borderRadius = '5px';
                                el.style.margin = '5px 0';
                            });
                        }
                    }
                }            }).then(canvas => {
                // Restore original styles
                element.style.height = originalStyles.height;
                element.style.maxHeight = originalStyles.maxHeight;
                element.style.overflow = originalStyles.overflow;
                
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
                }, 'image/png', 1.0); // Use highest quality PNG
            }).catch(err => {
                // Restore original styles even if capture fails
                element.style.height = originalStyles.height;
                element.style.maxHeight = originalStyles.maxHeight;
                element.style.overflow = originalStyles.overflow;
                
                console.error('Failed to capture screenshot:', err);
                resolve();
            });
        }, 250); // Longer delay to ensure complete rendering
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
    // Add screenshot buttons to each contract div
    const elementsToScreenshot = document.querySelectorAll('.contract'); // Changed selector

    elementsToScreenshot.forEach((element, index) => {
        // Set unique ID if not already set
        if (!element.id) {
            // Simplified ID generation since we are only targeting .contract
            element.id = `contract-screenshotable-${index}`; 
        }

        // Create screenshot button
        const screenshotBtn = document.createElement('button');
        screenshotBtn.className = 'screenshot-btn'; // Use existing class for styling
        screenshotBtn.innerHTML = '📸';
        screenshotBtn.setAttribute('title', 'Copy to clipboard');

        // Add click event listener
        screenshotBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent any parent click events

            // Temporarily hide the button for cleaner screenshot
            this.style.display = 'none';

            // Capture the screenshot of the current element
            captureScreenshot(element).then(() => {
                // Show the button again after capturing
                this.style.display = 'block';
            });
        });

        // Append button to the element
        element.appendChild(screenshotBtn);
    });
});
