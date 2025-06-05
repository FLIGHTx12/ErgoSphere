// This file adds CSS debugging tools to help solve display issues
document.addEventListener('DOMContentLoaded', () => {
  // Wait for all elements to load
  setTimeout(debugUserSectionsVisibility, 1000);
});

/**
 * Debug the visibility of user purchase sections
 */
function debugUserSectionsVisibility() {
  // Check if we're on the right page
  const weeklyPurchases = document.getElementById('weekly-purchases');
  if (!weeklyPurchases) {
    console.log('Weekly purchases container not found - not on ErgoShop page');
    return;
  }
  
  console.log('=== User Sections Debug ===');
  
  // Get current user
  const currentUser = window.currentUser || localStorage.getItem('ergoShopCurrentUser') || "FLIGHTx12";
  console.log(`Current user: ${currentUser}`);
  
  // Log the CSS classes for each user section
  const users = window.users || ["FLIGHTx12", "Jaybers8"];
  users.forEach(user => {
    const userSection = document.querySelector(`#${user}-purchases`);
    if (userSection) {
      const styles = window.getComputedStyle(userSection);
      console.log(`User ${user} section:`);
      console.log(`- Display: ${styles.display}`);
      console.log(`- Visibility: ${styles.visibility}`);
      console.log(`- Has 'active' class: ${userSection.classList.contains('active')}`);
      
      // Check for any CSS conflicts by logging all styles that might affect visibility
      console.log(`- Position: ${styles.position}`);
      console.log(`- Height: ${styles.height}`);
      console.log(`- Opacity: ${styles.opacity}`);
      console.log(`- Z-index: ${styles.zIndex}`);
      console.log(`- Transform: ${styles.transform}`);
    } else {
      console.warn(`User section #${user}-purchases not found in DOM`);
    }
  });
  
  // Apply a fix - ensure the correct section is visible
  console.log('Applying CSS fix...');
  users.forEach(user => {
    const userSection = document.querySelector(`#${user}-purchases`);
    if (userSection) {
      if (user === currentUser) {
        userSection.classList.add('active');
        userSection.style.display = 'block';
        console.log(`Force-set display: block for ${user}`);
      } else {
        userSection.classList.remove('active');
        userSection.style.display = 'none';
        console.log(`Force-set display: none for ${user}`);
      }
    }
  });
  
  console.log('=== End Debug ===');
}
