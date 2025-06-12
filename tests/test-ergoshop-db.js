const pool = require('./db');

async function testErgoShopData() {
  try {
    console.log('Testing ErgoShop data in database...');
    
    const result = await pool.query('SELECT category, data FROM json_data WHERE category = $1', ['ErgoShop']);
    
    if (result.rows.length > 0) {
      console.log('ErgoShop data found in database:');
      console.log('Category:', result.rows[0].category);
      console.log('Data keys:', Object.keys(result.rows[0].data || {}));
      console.log('Data sample:', JSON.stringify(result.rows[0].data, null, 2).substring(0, 500) + '...');
    } else {
      console.log('No ErgoShop data found in database');
    }
    
    // Also check if it's under a different name
    const allRows = await pool.query('SELECT category FROM json_data ORDER BY category');
    console.log('All categories in json_data table:', allRows.rows.map(r => r.category));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    pool.end();
  }
}

testErgoShopData();
