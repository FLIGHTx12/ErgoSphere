const pool = require('./db');
const { syncLootToJSON, createDatabaseBackup } = require('./utils/jsonSync');

async function removeDatabaseDuplicates() {
  try {
    console.log('Creating database backup before cleanup...');
    await createDatabaseBackup();
    
    console.log('Finding and removing duplicate entries from loot_items table...');
    
    // Find duplicates (keeping the one with the lowest ID)
    const duplicateQuery = `
      WITH duplicates AS (
        SELECT text, 
               array_agg(id ORDER BY id) as ids,
               COUNT(*) as count
        FROM loot_items 
        GROUP BY text 
        HAVING COUNT(*) > 1
      )
      SELECT text, ids, count FROM duplicates ORDER BY count DESC
    `;
    
    const duplicateResult = await pool.query(duplicateQuery);
    
    if (duplicateResult.rows.length === 0) {
      console.log('✅ No duplicates found to remove.');
      return;
    }
    
    console.log(`Found ${duplicateResult.rows.length} sets of duplicates:`);
    
    let totalRemoved = 0;
    
    for (const duplicate of duplicateResult.rows) {
      const { text, ids, count } = duplicate;
      console.log(`\n📋 Processing "${text}" (${count} copies)`);
      
      // Keep the first ID (lowest), remove the rest
      const idsToKeep = [ids[0]];
      const idsToRemove = ids.slice(1);
      
      console.log(`   Keeping ID: ${idsToKeep[0]}`);
      console.log(`   Removing IDs: ${idsToRemove.join(', ')}`);
      
      // Remove duplicates
      if (idsToRemove.length > 0) {
        const deleteQuery = 'DELETE FROM loot_items WHERE id = ANY($1)';
        const deleteResult = await pool.query(deleteQuery, [idsToRemove]);
        totalRemoved += deleteResult.rowCount;
        console.log(`   ✅ Removed ${deleteResult.rowCount} duplicate entries`);
      }
    }
    
    console.log(`\n🎉 Successfully removed ${totalRemoved} duplicate entries!`);
    
    // Verify the cleanup
    const finalCountResult = await pool.query('SELECT COUNT(*) as total FROM loot_items');
    console.log(`Final count in database: ${finalCountResult.rows[0].total}`);
    
    // Check if any duplicates remain
    const remainingDuplicates = await pool.query(`
      SELECT text, COUNT(*) as count
      FROM loot_items 
      GROUP BY text 
      HAVING COUNT(*) > 1
    `);
    
    if (remainingDuplicates.rows.length === 0) {
      console.log('✅ All duplicates successfully removed!');
    } else {
      console.log(`⚠️  ${remainingDuplicates.rows.length} duplicates still remain`);
    }
    
    // Sync the cleaned database back to JSON
    console.log('\n🔄 Syncing cleaned database to JSON file...');
    await syncLootToJSON();
    console.log('✅ JSON file updated with clean data');
    
  } catch (error) {
    console.error('❌ Error during duplicate removal:', error);
    throw error;
  }
}

// Run the cleanup
removeDatabaseDuplicates()
  .then(() => {
    console.log('\n✅ Database cleanup completed successfully!');
    console.log('🔍 You can now check the admin dashboard to verify duplicates are gone.');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });
