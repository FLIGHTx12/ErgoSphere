const pool = require('./db');

async function checkDatabaseDuplicates() {
  try {
    console.log('Checking for duplicate entries in loot_items table...');
    
    // Check for duplicate entries based on text field (most likely identifier)
    const duplicateQuery = `
      SELECT text, COUNT(*) as count, array_agg(id) as ids
      FROM loot_items 
      GROUP BY text 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;
    
    const duplicateResult = await pool.query(duplicateQuery);
    
    if (duplicateResult.rows.length === 0) {
      console.log('✅ No duplicates found in loot_items table based on text field.');
    } else {
      console.log(`❌ Found ${duplicateResult.rows.length} duplicate text entries:`);
      duplicateResult.rows.forEach(row => {
        console.log(`- "${row.text}" appears ${row.count} times (IDs: ${row.ids.join(', ')})`);
      });
    }
    
    // Get total count of items
    const countResult = await pool.query('SELECT COUNT(*) as total FROM loot_items');
    console.log(`\nTotal items in database: ${countResult.rows[0].total}`);
    
    // Show a sample of items to verify content
    const sampleResult = await pool.query('SELECT id, text FROM loot_items ORDER BY id LIMIT 10');
    console.log('\nSample of first 10 items:');
    sampleResult.rows.forEach(row => {
      console.log(`ID ${row.id}: "${row.text}"`);
    });
    
    return duplicateResult.rows;
    
  } catch (error) {
    console.error('Error checking database duplicates:', error);
    throw error;
  }
}

// Run the check
checkDatabaseDuplicates()
  .then(duplicates => {
    if (duplicates.length > 0) {
      console.log('\n⚠️  Duplicates found! You may want to run a cleanup script.');
    } else {
      console.log('\n✅ Database appears clean. The duplicate issue might be elsewhere.');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
