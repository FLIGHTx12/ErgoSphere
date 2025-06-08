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

async function syncCoopData() {
  try {
    console.log('🔄 Syncing CO-OP data from JSON file to database...');
    
    // Read the CO-OP data from JSON file
    const coopFilePath = path.join(__dirname, 'data', 'coop.json');
    const coopData = JSON.parse(fs.readFileSync(coopFilePath, 'utf8'));
    
    console.log(`📊 Found ${coopData.length} CO-OP games in JSON file`);
    
    // Update the database with the JSON data
    const result = await pool.query(
      'UPDATE json_data SET data = $1, updated_at = NOW() WHERE category = $2',
      [JSON.stringify(coopData), 'coop']
    );
    
    if (result.rowCount === 0) {
      // If no existing record, insert new one
      await pool.query(
        'INSERT INTO json_data (category, data) VALUES ($1, $2)',
        ['coop', JSON.stringify(coopData)]
      );
      console.log('✅ Inserted new CO-OP data into database');
    } else {
      console.log('✅ Updated existing CO-OP data in database');
    }
    
    // Verify the sync
    const verifyResult = await pool.query(
      'SELECT jsonb_array_length(data) as count FROM json_data WHERE category = $1',
      ['coop']
    );
    
    console.log(`🎯 Verification: Database now contains ${verifyResult.rows[0].count} CO-OP games`);
    
    console.log('✨ CO-OP data sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Error syncing CO-OP data:', error);
  } finally {
    await pool.end();
  }
}

// Run the sync
syncCoopData();
