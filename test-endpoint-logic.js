const pool = require('./db');

async function testEndpoint() {
  try {
    console.log('Testing /api/ergoshop endpoint logic...');
    
    // Simulate the exact query from the endpoint
    console.log('🛍️ ErgoShop data requested');
    
    const result = await pool.query(
      'SELECT data FROM json_data WHERE category = $1',
      ['ErgoShop']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ ErgoShop data loaded from PostgreSQL');
      console.log('Data type:', typeof result.rows[0].data);
      console.log('Data keys:', Object.keys(result.rows[0].data || {}));
      console.log('Sample data:', JSON.stringify(result.rows[0].data, null, 2).substring(0, 200) + '...');
      
      // Simulate the response
      console.log('Response would be:', JSON.stringify(result.rows[0].data).substring(0, 100) + '...');
    } else {
      console.log('No data found in PostgreSQL, would try fallback to JSON file');
      
      // Test JSON file fallback
      const fs = require('fs').promises;
      const path = require('path');
      const filePath = path.join(__dirname, 'data', 'ErgoShop.json');
      
      try {
        const data = await fs.readFile(filePath, 'utf8');
        console.log('✅ ErgoShop data loaded from JSON file');
        const parsed = JSON.parse(data);
        console.log('JSON file keys:', Object.keys(parsed));
        console.log('Response would be:', JSON.stringify(parsed).substring(0, 100) + '...');
      } catch (fileErr) {
        console.error('❌ Error reading JSON file:', fileErr.message);
      }
    }
    
  } catch (err) {
    console.error('❌ ErgoShop data loading error:', err);
  } finally {
    pool.end();
  }
}

testEndpoint();
