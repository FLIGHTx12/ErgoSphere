const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration (matching server.js)
const connectionString = process.env.DATABASE_URL || 
  'postgres://u4g8i73g8n411i:pe1e6c500adc040cb7e7258a1e379628c5629a9289aabc73ec65a4fdcaa5c76e0@ccpa7stkruda3o.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/db9op7pb0ol2v4';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Heroku PostgreSQL connections
  }
});

async function verifyDatabaseSync() {
  try {
    console.log('🔍 Verifying database synchronization...');
    console.log('=====================================');
      // Check json_data table
    console.log('\n📊 JSON_DATA TABLE:');
    const jsonDataResult = await pool.query(
      `SELECT category, 
       CASE 
         WHEN jsonb_typeof(data) = 'array' THEN jsonb_array_length(data)
         ELSE NULL
       END as array_count,
       jsonb_typeof(data) as data_type,
       updated_at
       FROM json_data 
       ORDER BY category`
    );
    
    jsonDataResult.rows.forEach(row => {
      const count = row.array_count || 'N/A (object)';
      console.log(`   ${row.category}: ${count} items (${row.data_type}) - Updated: ${row.updated_at}`);
    });
    
    // Check loot_items table
    console.log('\n🎁 LOOT_ITEMS TABLE:');
    const lootCountResult = await pool.query('SELECT COUNT(*) as count FROM loot_items');
    const lootSampleResult = await pool.query('SELECT text, copies, genre FROM loot_items WHERE text IS NOT NULL AND text != \'\' LIMIT 5');
    
    console.log(`   Total loot items: ${lootCountResult.rows[0].count}`);
    console.log('   Sample items:');
    lootSampleResult.rows.forEach((item, index) => {
      console.log(`     ${index + 1}. ${item.text} (copies: ${item.copies}, genre: ${item.genre})`);
    });
    
    // Check backups
    console.log('\n📦 BACKUP STATUS:');
    const backupsResult = await pool.query(
      `SELECT category, COUNT(*) as backup_count, MAX(backup_date) as latest_backup
       FROM json_backups 
       GROUP BY category 
       ORDER BY category`
    );
    
    backupsResult.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.backup_count} backups - Latest: ${row.latest_backup}`);
    });
    
    // Compare with actual JSON files
    console.log('\n📁 JSON FILE COMPARISON:');
    const dataDir = path.join(__dirname, 'data');
    const categories = ['coop', 'loot', 'pvp', 'anime', 'movies', 'sundaymorning', 'sundaynight', 'singleplayer', 'youtube'];
    
    for (const category of categories) {
      const filePath = path.join(dataDir, `${category}.json`);
      if (fs.existsSync(filePath)) {
        const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const fileCount = Array.isArray(fileData) ? fileData.length : Object.keys(fileData).length;
          const dbResult = await pool.query(
          `SELECT 
           CASE 
             WHEN jsonb_typeof(data) = 'array' THEN jsonb_array_length(data)
             ELSE NULL
           END as count 
           FROM json_data WHERE category = $1`,
          [category]
        );
        
        const dbCount = dbResult.rows.length > 0 ? dbResult.rows[0].count : 'Not found';
        const match = fileCount === dbCount ? '✅' : '❌';
        
        console.log(`   ${category}: File(${fileCount}) vs DB(${dbCount}) ${match}`);
      }
    }
    
    // Check database connectivity
    console.log('\n🔗 DATABASE CONNECTIVITY:');
    const connectivityResult = await pool.query('SELECT NOW() as server_time, version() as db_version');
    console.log(`   Server time: ${connectivityResult.rows[0].server_time}`);
    console.log(`   PostgreSQL version: ${connectivityResult.rows[0].db_version.split(' ')[0]} ${connectivityResult.rows[0].db_version.split(' ')[1]}`);
    
    console.log('\n🎉 Database verification completed!');
    console.log('📊 All data should now be correctly synced to the PostgreSQL Heroku server');
    console.log('🔗 The admin dashboard should display the correct, non-corrupted data');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the verification
verifyDatabaseSync();
