const http = require('http');

function testLootAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/loot',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const lootItems = JSON.parse(data);
        console.log(`✅ API Response received: ${lootItems.length} items`);
        
        // Check for duplicates in the API response
        const textCounts = {};
        lootItems.forEach(item => {
          textCounts[item.text] = (textCounts[item.text] || 0) + 1;
        });
        
        const duplicates = Object.entries(textCounts).filter(([text, count]) => count > 1);
        
        if (duplicates.length === 0) {
          console.log('✅ No duplicates found in API response!');
        } else {
          console.log(`❌ Found ${duplicates.length} duplicates in API response:`);
          duplicates.forEach(([text, count]) => {
            console.log(`  - "${text}" appears ${count} times`);
          });
        }
        
        // Show first few items for verification
        console.log('\nFirst 5 items from API:');
        lootItems.slice(0, 5).forEach((item, index) => {
          console.log(`${index + 1}. ID: ${item.id}, Text: "${item.text}"`);
        });
        
      } catch (error) {
        console.error('❌ Error parsing API response:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ API request failed:', error);
  });

  req.end();
}

console.log('🔍 Testing /api/loot endpoint...');
setTimeout(testLootAPI, 1000); // Wait 1 second for server to fully start
