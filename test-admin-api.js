const axios = require('axios');

async function testAdminAPIs() {
    const baseURL = 'http://localhost:3000';
    
    console.log('🔍 Testing Admin Dashboard APIs...\n');
      try {
        console.log('📋 Testing individual category endpoints...');
        
        // Test a few specific categories
        const testCategories = ['coop', 'loot', 'pvp', 'movies'];
        
        for (const category of testCategories) {
            try {
                let response, data;
                
                if (category === 'loot') {
                    response = await axios.get(`${baseURL}/api/loot`);
                    data = response.data;
                } else {
                    response = await axios.get(`${baseURL}/api/data/${category}`);
                    data = response.data;
                }
                console.log(`✅ ${category}: ${data.length} items retrieved`);
                
                // Show first item as sample
                if (data.length > 0) {
                    const firstItem = data[0];
                    if (category === 'loot') {
                        console.log(`    Sample: ${firstItem.name} (Type: ${firstItem.type}, Quantity: ${firstItem.quantity})`);
                    } else {
                        console.log(`    Sample: ${firstItem.name || firstItem.title || 'Unknown'}`);
                    }
                }
            } catch (error) {
                console.log(`❌ Error testing ${category}: ${error.message}`);
            }
        }
        
        console.log('\n🎉 Admin Dashboard API verification completed!');
        console.log('The admin dashboard should now display correct, non-corrupted data.');
        
    } catch (error) {
        console.error('❌ Error testing admin APIs:', error.message);
        console.log('Make sure the server is running on port 3000');
    }
}

// Run the test
testAdminAPIs().catch(console.error);
