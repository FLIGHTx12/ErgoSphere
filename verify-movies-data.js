/**
 * Verify that movies data has been correctly restored
 */
const pool = require('./db');

async function verifyMoviesData() {
  try {
    console.log('🔍 Verifying movies data in PostgreSQL database...');
    
    // Query the database
    const result = await pool.query(
      'SELECT data FROM json_data WHERE category = $1',
      ['movies']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ No movies data found in the database!');
      return;
    }
    
    const data = result.rows[0].data;
    
    if (!data || !Array.isArray(data)) {
      console.log('❌ Invalid data format: Expected array but got', typeof data);
      return;
    }
    
    console.log(`✅ Found ${data.length} movies in the database!`);
    console.log('📝 Sample of first 5 movies:');
    for (let i = 0; i < Math.min(5, data.length); i++) {
      console.log(`  - ${data[i].Title}`);
    }
    
  } catch (error) {
    console.error('❌ Error verifying movies data:', error);
  } finally {
    await pool.end();
  }
}

verifyMoviesData();
