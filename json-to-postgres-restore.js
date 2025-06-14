/**
 * Emergency Data Restoration Script
 * This script restores data from JSON files back to the PostgreSQL database
 * Useful when database data has been accidentally removed or corrupted
 */

const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

// Create a new pool connection using the same settings from db.js
const connectionString = process.env.DATABASE_URL || 
  'postgres://u4g8i73g8n411i:pe1e6c500adc040cb7e7258a1e379628c5629a9289aabc73ec65a4fdcaa5c76e0@ccpa7stkruda3o.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/db9op7pb0ol2v4';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Heroku PostgreSQL connections
  }
});

// Categories to restore
const categories = ['movies']; // Focus only on movies

async function restoreJsonToPostgres(category) {
  try {
    console.log(`🔄 Starting restoration of ${category} from JSON to PostgreSQL...`);
    
    // Read JSON file
    const jsonPath = path.join(__dirname, 'data', `${category}.json`);
    const jsonData = await fs.readFile(jsonPath, 'utf8');
    const data = JSON.parse(jsonData);
    
    if (!data || !Array.isArray(data)) {
      console.error(`❌ Error: Invalid data format in ${category}.json. Expected array.`);
      return false;
    }
      console.log(`📊 Found ${data.length} items in ${category}.json`);
    
    // Validate WATCHED field for movies
    if (category === 'movies') {
      let watchedFieldCount = 0;
      for (const movie of data) {
        if (movie.WATCHED || movie.watched) {
          watchedFieldCount++;
          // Make sure both lowercase and uppercase keys exist for compatibility
          if (movie.WATCHED) {
            movie.watched = movie.WATCHED;
          } else if (movie.watched) {
            movie.WATCHED = movie.watched;
          }
          
          // Validate that the WATCHED field contains proper eye emoji
          const watchedStr = movie.WATCHED || '';
          if (!watchedStr.includes('👀') && watchedStr.trim() !== '') {
            console.warn(`⚠️ Warning: Movie "${movie.Title}" has WATCHED value without eye emoji: "${watchedStr}"`);
          }
        }
      }
      console.log(`👀 Verified ${watchedFieldCount} movies with WATCHED field`);
    }
    
    // Check if record exists in json_data table
    const existingResult = await pool.query(
      'SELECT id FROM json_data WHERE category = $1',
      [category]
    );
    
    let result;    if (existingResult.rows.length > 0) {
      // Update existing record
      console.log(`🔄 Updating existing record for ${category} in PostgreSQL...`);
      result = await pool.query(
        'UPDATE json_data SET data = $1::jsonb, updated_at = NOW() WHERE category = $2 RETURNING id',
        [JSON.stringify(data), category]
      );
      console.log(`✅ Updated ${category} data in PostgreSQL. Record ID: ${result.rows[0].id}`);
    } else {
      // Insert new record
      console.log(`🔄 Creating new record for ${category} in PostgreSQL...`);
      result = await pool.query(
        'INSERT INTO json_data (category, data, created_at, updated_at) VALUES ($1, $2::jsonb, NOW(), NOW()) RETURNING id',
        [category, JSON.stringify(data)]
      );
      console.log(`✅ Inserted ${category} data into PostgreSQL. Record ID: ${result.rows[0].id}`);
    }    // Create a backup record in json_backups table
    await pool.query(
      'INSERT INTO json_backups (category, data) VALUES ($1, $2::jsonb)',
      [category, JSON.stringify(data)]
    );
    console.log(`📦 Created backup for ${category} in json_backups table`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error restoring ${category} from JSON to PostgreSQL:`, error);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Starting JSON to PostgreSQL restoration...');
    
    // Test database connection
    const connectionTest = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully. Server time:', connectionTest.rows[0].now);
    
    let successCount = 0;
    
    // Process each category
    for (const category of categories) {
      const success = await restoreJsonToPostgres(category);
      if (success) {
        successCount++;
      }
    }
    
    console.log(`
    ===================================
    🏁 Restoration process completed:
    ✅ ${successCount}/${categories.length} categories restored successfully
    ===================================
    `);
    
  } catch (error) {
    console.error('❌ Fatal error during restoration process:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the script
main().catch(err => {
  console.error('❌ Unhandled error:', err);
  process.exit(1);
});
