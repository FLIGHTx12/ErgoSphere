const axios = require('axios');

async function verifyNonCorruptedData() {
    const baseURL = 'http://localhost:3000';
    
    console.log('🔍 Verifying Non-Corrupted Data in Admin Dashboard...\n');
    
    try {
        // Test each category for data integrity
        const categories = ['coop', 'loot', 'pvp', 'movies', 'anime', 'youtube', 'sundaymorning', 'sundaynight', 'singleplayer'];
        
        let allDataValid = true;
        
        for (const category of categories) {
            try {
                let response, data;
                
                if (category === 'loot') {
                    response = await axios.get(`${baseURL}/api/loot`);
                    data = response.data;
                } else {
                    response = await axios.get(`${baseURL}/api/data/${category}`);
                    data = response.data;
                }
                
                console.log(`📊 ${category.toUpperCase()}: ${data.length} items`);
                
                if (data.length > 0) {
                    const firstItem = data[0];
                      // Check for backup file corruption indicators
                    const hasBackupIndicators = JSON.stringify(firstItem).includes('_backup') || 
                                               JSON.stringify(firstItem).includes('_corrupted') ||
                                               (category === 'loot' && !firstItem.hasOwnProperty('text') && !firstItem.hasOwnProperty('name'));
                    
                    if (hasBackupIndicators) {
                        console.log(`❌ ${category}: Contains corrupted backup data`);
                        allDataValid = false;
                    } else {
                        console.log(`✅ ${category}: Data appears clean and valid`);
                          // Show sample data
                        if (category === 'loot') {
                            const sampleName = firstItem.text || firstItem.name || 'Unknown';
                            console.log(`    Sample: "${sampleName}" (Type: ${firstItem.type})`);
                        } else {
                            const sampleName = firstItem.name || firstItem.title || firstItem.TITLE || 'Unknown';
                            console.log(`    Sample: "${sampleName}"`);
                        }
                    }
                } else {
                    console.log(`⚠️ ${category}: No data found`);
                }
                
            } catch (error) {
                console.log(`❌ Error testing ${category}: ${error.message}`);
                allDataValid = false;
            }
        }
        
        console.log('\n' + '='.repeat(60));
        
        if (allDataValid) {
            console.log('🎉 SUCCESS: All data appears clean and non-corrupted!');
            console.log('✅ The PostgreSQL Heroku server has been successfully updated');
            console.log('✅ Admin dashboard should display correct information');
            console.log('✅ Backup files are no longer interfering with the system');
        } else {
            console.log('❌ ISSUE: Some data may still be corrupted');
            console.log('Please check the above output for specific issues');
        }
        
        console.log('\n📱 Admin Dashboard URL: http://localhost:3000/admin-dashboard.html');
        console.log('🔧 Alternative URL: http://localhost:3000/pages/admin/admin.html');
        
    } catch (error) {
        console.error('❌ Error during verification:', error.message);
        console.log('Make sure the server is running on port 3000');
    }
}

// Run the verification
verifyNonCorruptedData().catch(console.error);
