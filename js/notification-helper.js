/**
 * Notification Helper for ErgoSphere
 * 
 * This script provides functions for showing temporary notifications to users.
 */

/**
 * Show a notification banner at the top of the screen
 * @param {string} message - The message to display
 * @param {string} type - The type of notification: 'info', 'success', 'warning', 'error'
 * @param {number} duration - How long to show the notification (in milliseconds)
 */
function showNotification(message, type = 'info', duration = 3000) {
  // Create notification element if it doesn't already exist
  let notification = document.getElementById('notification-banner');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification-banner';
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    notification.style.zIndex = '10001'; // Above other UI elements
    notification.style.textAlign = 'center';
    notification.style.transition = 'opacity 0.3s ease-in-out';
    notification.style.maxWidth = '80%';
    
    document.body.appendChild(notification);
  }
  
  // Set style based on notification type
  switch (type) {
    case 'success':
      notification.style.backgroundColor = '#4caf50';
      notification.style.color = 'white';
      notification.style.border = '1px solid #388e3c';
      break;
    case 'warning':
      notification.style.backgroundColor = '#ff9800';
      notification.style.color = 'white';
      notification.style.border = '1px solid #f57c00';
      break;
    case 'error':
      notification.style.backgroundColor = '#f44336';
      notification.style.color = 'white';
      notification.style.border = '1px solid #d32f2f';
      break;
    case 'info':
    default:
      notification.style.backgroundColor = '#2196f3';
      notification.style.color = 'white';
      notification.style.border = '1px solid #1976d2';
      break;
  }
  
  // Set message
  notification.textContent = message;
  notification.style.opacity = '1';
  
  // Clear any existing timeout
  if (notification.timeoutId) {
    clearTimeout(notification.timeoutId);
  }
  
  // Hide after duration
  notification.timeoutId = setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300); // Wait for fade out animation to complete
  }, duration);
}

// Make function available globally
window.showNotification = showNotification;
