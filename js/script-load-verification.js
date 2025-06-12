/**
 * Script Load Verification
 * This script helps verify that all required scripts are loading properly
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔍 Verifying ErgoShop script dependencies...');
  
  const requiredScripts = [
    'utils.js',
    'script.js', 
    'week-tracker.js',
    'data-page-robust-loader.js',
    'ErgoShop.js',
    'weekly-tracker-addon.js',
    'weekly-tracker-enhancements-clean.js',
    'css-debug-helper.js'
  ];
  
  const requiredGlobals = [
    'jQuery',
    'React',
    'ReactDOM'
  ];
  
  // Check if critical functions exist
  setTimeout(() => {
    let allGood = true;
    
    console.group('📋 Script Load Status');
    
    // Check globals
    requiredGlobals.forEach(global => {
      if (window[global]) {
        console.log(`✅ ${global} loaded`);
      } else {
        console.warn(`⚠️ ${global} not found`);
        allGood = false;
      }
    });
    
    // Check if key functions exist
    const keyFunctions = [
      'submitSelection',
      'screenshotDiv',
      'switchToPreviousWeek',
      'switchToNextWeek'
    ];
    
    keyFunctions.forEach(func => {
      if (typeof window[func] === 'function') {
        console.log(`✅ Function ${func} available`);
      } else {
        console.warn(`⚠️ Function ${func} not found`);
        allGood = false;
      }
    });
    
    // Check if key objects exist
    const keyObjects = [
      'cssDebugHelper',
      'ApiErrorTracker',
      'WebSocketReconnector'
    ];
    
    keyObjects.forEach(obj => {
      if (window[obj]) {
        console.log(`✅ Object ${obj} available`);
      } else {
        console.warn(`⚠️ Object ${obj} not found`);
      }
    });
    
    console.groupEnd();
    
    if (allGood) {
      console.log('🎉 All critical dependencies loaded successfully!');
    } else {
      console.warn('⚠️ Some dependencies may be missing. Check console warnings above.');
    }
  }, 1000);
});

console.log('✅ Script load verification helper loaded');
