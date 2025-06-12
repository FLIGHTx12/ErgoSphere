const pool = require('./db');

async function testErgoShopEndpoint() {
  try {
    console.log('Testing ErgoShop endpoint logic...');
    
    // Test the exact query the server uses
    console.log('🔍 Querying PostgreSQL for ErgoShop data...');
    const result = await pool.query(
      'SELECT data FROM json_data WHERE category = $1',
      ['ErgoShop']
    );
    
    console.log('🔍 Query result rows:', result.rows.length);
    
    if (result.rows.length > 0) {
      console.log('✅ Data found in PostgreSQL');
      console.log('🔍 Data type:', typeof result.rows[0].data);
      console.log('🔍 Data keys:', Object.keys(result.rows[0].data || {}));
      console.log('🔍 Data sample (first 200 chars):', JSON.stringify(result.rows[0].data).substring(0, 200) + '...');
      
      // Test JSON serialization
      const jsonString = JSON.stringify(result.rows[0].data);
      console.log('🔍 JSON string length:', jsonString.length);
      
      return result.rows[0].data;
    } else {
      console.log('❌ No data found in PostgreSQL');
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

testErgoShopEndpoint();
