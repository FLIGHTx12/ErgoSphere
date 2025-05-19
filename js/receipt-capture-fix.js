/**
 * Bet Receipt Screenshot Fix
 * This script fixes issues with capturing the full receipt element
 */

document.addEventListener('DOMContentLoaded', () => {
  // Only run if we have the receipt element and html2canvas is available
  if (document.getElementById('receipt') && window.html2canvas) {
    installReceiptScreenshotFix();
  }
});

function installReceiptScreenshotFix() {
  console.log('📸 Installing receipt screenshot fix...');
  
  // Get reference to receipt element
  const receiptElement = document.getElementById('receipt');
  
  // Remove any existing click handlers
  const clone = receiptElement.cloneNode(true);
  clone.addEventListener('click', enhancedCaptureReceipt);
  receiptElement.parentNode.replaceChild(clone, receiptElement);
  
  console.log('✅ Receipt screenshot fix installed');
}

function enhancedCaptureReceipt() {
  const receipt = document.getElementById('receipt');
  const receiptContent = document.getElementById('receipt-content');
  
  if (!receipt || !receiptContent) {
    console.error('Receipt or receipt-content element not found');
    return;
  }
  
  // Store original styles
  const originalStyles = {
    receipt: {
      height: receipt.style.height,
      maxHeight: receipt.style.maxHeight,
      minHeight: receipt.style.minHeight,
      overflow: receipt.style.overflow,
      position: receipt.style.position,
      zIndex: receipt.style.zIndex,
      display: receipt.style.display,
      border: receipt.style.border,
      boxShadow: receipt.style.boxShadow
    }
  };
  
  // Add visual feedback
  receipt.style.border = '3px solid lime';
  receipt.style.boxShadow = '0 0 20px rgba(0,255,0,0.5)';
  
  // Force layout recalculation to get accurate heights
  void receipt.offsetHeight; 
  
  // Step 1: Prepare the element for capture
  // Force background image if missing
  let backgroundSet = false;
  const currentUser = document.getElementById('user')?.value;
  
  if (getComputedStyle(receipt).backgroundImage === 'none' || !receipt.style.backgroundImage) {
    if (currentUser === "FLIGHTx12!") {
      receipt.style.backgroundImage = "url('../assets/img/backgrounds/betdivbackgroundgreen.jpg')";
    } else if (currentUser === "Jaybers8") {
      receipt.style.backgroundImage = "url('../assets/img/backgrounds/betdivbackgroundpurp.jpg')";
    }
    backgroundSet = true;
  }
  
  // Add capturing class to apply special CSS
  receipt.classList.add('capturing');
  
  // Set explicit dimensions that will contain all content
  receipt.style.height = 'auto';
  receipt.style.maxHeight = 'none';
  receipt.style.minHeight = '0';
  receipt.style.overflow = 'visible';
  receipt.style.position = 'relative';
  receipt.style.zIndex = '9999';
  
  // Force full height calculation based on content
  const fullHeight = Math.max(
    receipt.scrollHeight,
    receiptContent.scrollHeight + 80 // Add padding
  );
  
  // Set explicit height for capturing
  receipt.style.height = fullHeight + 'px';
  
  // Step 2: Preload background image if needed
  function captureScreenshot() {
    console.log(`Capturing receipt with dimensions: ${receipt.offsetWidth}x${fullHeight}`);
    
    // Configure html2canvas for optimal capture
    html2canvas(receipt, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null, // Keep transparent to preserve background
      scale: 2, // Higher quality
      height: fullHeight,
      windowHeight: fullHeight,
      scrollY: -window.scrollY, // Adjust for page scroll
      logging: false,
      onclone: function(clonedDoc) {
        const clonedReceipt = clonedDoc.getElementById('receipt');
        if (clonedReceipt) {
          // Copy all computed styles to ensure visual fidelity
          const styles = getComputedStyle(receipt);
          
          // Most important styles that affect appearance
          clonedReceipt.style.backgroundImage = styles.backgroundImage;
          clonedReceipt.style.backgroundSize = 'cover';
          clonedReceipt.style.backgroundPosition = 'center';
          clonedReceipt.style.height = fullHeight + 'px';
          clonedReceipt.style.width = receipt.offsetWidth + 'px';
          
          // Ensure all children are visible too
          Array.from(clonedReceipt.querySelectorAll('*')).forEach(el => {
            el.style.visibility = 'visible';
            el.style.display = el.tagName === 'DIV' ? 'block' : getComputedStyle(el).display;
          });
          
          // Enhance text visibility
          clonedReceipt.querySelectorAll('.matchup, .bet-line, .wager-total, .potential-winnings, .actual-winnings').forEach(el => {
            el.style.backgroundColor = 'rgba(0,0,0,0.8)';
            el.style.padding = '10px';
            el.style.margin = '8px 0';
            el.style.borderRadius = '5px';
            el.style.textShadow = '1px 1px 3px #000';
            el.style.border = '1px solid rgba(0,255,0,0.2)';
          });
        }
      }
    }).then(canvas => {
      // Remove capturing class and restore original styles
      receipt.classList.remove('capturing');
      
      // Restore original styles
      Object.entries(originalStyles.receipt).forEach(([prop, value]) => {
        receipt.style[prop] = value;
      });
      
      // Clean up background if we set it
      if (backgroundSet) {
        receipt.style.backgroundImage = originalStyles.receipt.backgroundImage;
      }
      
      // Convert to blob and copy to clipboard
      canvas.toBlob(blob => {
        if (navigator.clipboard && navigator.clipboard.write) {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]).then(() => {
            showSuccess('Receipt screenshot copied to clipboard!');
          }).catch(err => {
            console.error('Failed to copy screenshot:', err);
            downloadImage(blob, 'bet-receipt.png');
          });
        } else {
          downloadImage(blob, 'bet-receipt.png');
        }
      }, 'image/png', 1.0);
    }).catch(err => {
      console.error('Failed to capture screenshot:', err);
      
      // Restore original state
      receipt.classList.remove('capturing');
      Object.entries(originalStyles.receipt).forEach(([prop, value]) => {
        receipt.style[prop] = value;
      });
      
      if (backgroundSet) {
        receipt.style.backgroundImage = originalStyles.receipt.backgroundImage;
      }
      
      alert('Failed to capture screenshot. Please try again.');
    });
  }
  
  // If we have a background image, preload it first
  if (receipt.style.backgroundImage && receipt.style.backgroundImage !== 'none') {
    const bgUrl = receipt.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1').replace(/["']/g, '');
    
    if (bgUrl && bgUrl !== 'none') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Short timeout for render
        setTimeout(captureScreenshot, 50);
      };
      img.onerror = () => {
        console.warn('Failed to preload background image, capturing anyway');
        captureScreenshot();
      };
      img.src = bgUrl;
    } else {
      captureScreenshot();
    }
  } else {
    captureScreenshot();
  }
  
  // Helper functions
  function downloadImage(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Receipt saved as image (clipboard access failed)');
  }
  
  function showSuccess(message) {
    // Create a temporary success message
    const successMsg = document.createElement('div');
    successMsg.textContent = message;
    successMsg.style.position = 'fixed';
    successMsg.style.top = '20px';
    successMsg.style.left = '50%';
    successMsg.style.transform = 'translateX(-50%)';
    successMsg.style.backgroundColor = 'rgba(0,128,0,0.9)';
    successMsg.style.color = 'white';
    successMsg.style.padding = '10px 20px';
    successMsg.style.borderRadius = '5px';
    successMsg.style.zIndex = '10000';
    
    document.body.appendChild(successMsg);
    
    // Remove after 3 seconds
    setTimeout(() => {
      document.body.removeChild(successMsg);
    }, 3000);
  }
}
