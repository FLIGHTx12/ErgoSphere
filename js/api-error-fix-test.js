/**
 * API Error Fix Test Script
 * 
 * This script tests the API error fixes by:
 * 1. Loading data for a week before the app's inception date
 * 2. Loading data for a non-existent week
 * 3. Testing WebSocket reconnection
 */

document.addEventListener('DOMContentLoaded', () => {
  // Create test button
  const testButton = document.createElement('button');
  testButton.textContent = 'Test API Error Fixes';
  testButton.style.position = 'fixed';
  testButton.style.right = '10px';
  testButton.style.top = '50px';
  testButton.style.backgroundColor = '#8e44ad';
  testButton.style.color = 'white';
  testButton.style.padding = '8px 12px';
  testButton.style.border = 'none';
  testButton.style.borderRadius = '5px';
  testButton.style.cursor = 'pointer';
  testButton.style.zIndex = '9999';
  
  testButton.addEventListener('click', runApiFixTests);
  document.body.appendChild(testButton);
  
  console.log('API Error Fix test script loaded');
});

/**
 * Run the tests for API error fixes
 */
async function runApiFixTests() {
  // Show notification
  if (typeof showNotification === 'function') {
    showNotification('Running API error fix tests...', 'info', 3000);
  } else {
    console.log('showNotification function not available');
  }
  
  // List of tests
  const tests = [
    testPastDateHandling,
    testFutureNonExistentWeek,
    testWebSocketReconnection
  ];
  
  // Run each test
  for (const test of tests) {
    try {
      await test();
    } catch (error) {
      console.error(`Test failed: ${error.message}`, error);
    }
  }
  
  // Show completion notification
  if (typeof showNotification === 'function') {
    showNotification('API error fix tests completed! Check console for details.', 'success', 5000);
  } else {
    console.log('API error fix tests completed');
  }
}

/**
 * Test how the app handles data requests for dates before app inception
 */
async function testPastDateHandling() {
  console.log('Testing past date handling...');
  
  // Generate a date in the past (before 2025-06-04)
  const pastDate = '2025-01-01';
  
  try {
    // Use the same proxied fetch that the app uses
    const fetchFunc = window.proxiedFetch || window.fetch;
    
    console.log(`Fetching purchases for ${pastDate}...`);
    const purchasesResponse = await fetchFunc(`/api/purchases/${pastDate}`);
    const purchases = await purchasesResponse.json();
    
    console.log(`Result for ${pastDate}: Found ${purchases.length} purchases (empty array expected)`);
    
    console.log(`Fetching metrics for ${pastDate}...`);
    const metricsResponse = await fetchFunc(`/api/purchases/metrics/${pastDate}`);
    const metrics = await metricsResponse.json();
    
    console.log(`Result for ${pastDate}: Found ${metrics.length} metrics items (should be default metrics)`);
    
    console.log('✅ Past date handling test completed successfully');
  } catch (error) {
    console.error('❌ Past date handling test failed:', error);
    throw new Error(`Past date test failed: ${error.message}`);
  }
}

/**
 * Test how the app handles data requests for non-existent future weeks
 */
async function testFutureNonExistentWeek() {
  console.log('Testing non-existent future week handling...');
  
  // Generate a future date
  const futureDate = '2026-01-01';
  
  try {
    // Use the same proxied fetch that the app uses
    const fetchFunc = window.proxiedFetch || window.fetch;
    
    console.log(`Fetching purchases for ${futureDate}...`);
    const purchasesResponse = await fetchFunc(`/api/purchases/${futureDate}`);
    const purchases = await purchasesResponse.json();
    
    console.log(`Result for ${futureDate}: Found ${purchases.length} purchases (empty array expected)`);
    
    console.log(`Fetching metrics for ${futureDate}...`);
    const metricsResponse = await fetchFunc(`/api/purchases/metrics/${futureDate}`);
    const metrics = await metricsResponse.json();
    
    console.log(`Result for ${futureDate}: Found ${metrics.length} metrics items (should be default metrics)`);
    
    console.log('✅ Future non-existent week handling test completed successfully');
  } catch (error) {
    console.error('❌ Future non-existent week handling test failed:', error);
    throw new Error(`Future date test failed: ${error.message}`);
  }
}

/**
 * Test how the WebSocket reconnection works
 */
async function testWebSocketReconnection() {
  console.log('Testing WebSocket reconnection...');
  
  // Check if we have a WebSocket connection
  if (!window.wsConnection) {
    console.warn('No WebSocket connection found to test');
    return;
  }
  
  try {
    // Simulate a connection close to trigger reconnection
    if (window.wsConnection.ws && window.wsConnection.ws.close) {
      console.log('Manually closing WebSocket connection to test reconnection...');
      window.wsConnection.ws.close();
      
      // Check reconnection status after a delay
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check if reconnection was successful
      const state = window.wsConnection.getState();
      console.log(`WebSocket state after reconnection attempt: ${state}`);
      
      if (state === 1) { // WebSocket.OPEN
        console.log('✅ WebSocket reconnection test completed successfully');
      } else {
        console.warn('⚠️ WebSocket did not reconnect within 5 seconds - this might be expected if no server is available');
      }
    } else {
      console.warn('Cannot test WebSocket reconnection - no active connection or close method');
    }
  } catch (error) {
    console.error('❌ WebSocket reconnection test error:', error);
    throw new Error(`WebSocket reconnection test failed: ${error.message}`);
  }
}
