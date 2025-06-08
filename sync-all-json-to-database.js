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

async function syncAllJSONToDatabase() {
  try {
    console.log('🚀 Starting comprehensive JSON to Database sync...');
    console.log('📝 This will update the PostgreSQL Heroku server with current JSON files');
    
    const dataDir = path.join(__dirname, 'data');
    
    // List of categories to sync (excluding backup files)
    const categories = [
      'coop',
      'loot', 
      'pvp',
      'anime',
      'movies',
      'sundaymorning',
      'sundaynight',
      'singleplayer',
      'youtube'
    ];
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const category of categories) {
      try {
        const filePath = path.join(dataDir, `${category}.json`);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  File not found: ${category}.json - skipping`);
          continue;
        }
        
        console.log(`\n🔄 Processing ${category}.json...`);
        
        // Read and parse JSON file
        const rawData = fs.readFileSync(filePath, 'utf8');
        let jsonData;
        
        try {
          jsonData = JSON.parse(rawData);
          console.log(`✅ Successfully parsed ${category}.json`);
        } catch (parseError) {
          console.error(`❌ Error parsing ${category}.json:`, parseError.message);
          
          // Try to clean the JSON (remove comments, trailing commas, etc.)
          console.log(`🔧 Attempting to fix JSON format for ${category}...`);
          let cleanedData = rawData
            .replace(/\/\/.*$/gm, '') // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
            .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
          
          try {
            jsonData = JSON.parse(cleanedData);
            console.log(`✅ Successfully parsed ${category}.json after cleaning`);
          } catch (secondParseError) {
            console.error(`❌ Failed to parse ${category}.json even after cleaning:`, secondParseError.message);
            errorCount++;
            continue;
          }
        }
        
        // Validate the data structure
        if (!Array.isArray(jsonData) && typeof jsonData !== 'object') {
          console.error(`❌ Invalid data format for ${category}: must be array or object`);
          errorCount++;
          continue;
        }
        
        console.log(`📊 Data contains ${Array.isArray(jsonData) ? jsonData.length : Object.keys(jsonData).length} items`);
        
        // Create a backup first
        console.log(`📦 Creating backup for ${category}...`);
        await pool.query(
          'INSERT INTO json_backups (category, data, backup_date) VALUES ($1, $2, NOW())',
          [category, JSON.stringify(jsonData)]
        );
        
        // Check if category already exists in database
        const existingResult = await pool.query(
          'SELECT id FROM json_data WHERE category = $1',
          [category]
        );
        
        if (existingResult.rows.length > 0) {
          // Update existing entry
          await pool.query(
            'UPDATE json_data SET data = $1, updated_at = NOW() WHERE category = $2',
            [JSON.stringify(jsonData), category]
          );
          console.log(`✅ Updated existing ${category} data in database`);
        } else {
          // Insert new entry
          await pool.query(
            'INSERT INTO json_data (category, data, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
            [category, JSON.stringify(jsonData)]
          );
          console.log(`✅ Inserted new ${category} data into database`);
        }
        
        // Verify the update
        const verifyResult = await pool.query(
          'SELECT jsonb_array_length(data) as count FROM json_data WHERE category = $1 AND jsonb_typeof(data) = \'array\'',
          [category]
        );
        
        if (verifyResult.rows.length > 0 && verifyResult.rows[0].count !== null) {
          console.log(`🎯 Verification: Database now contains ${verifyResult.rows[0].count} items for ${category}`);
        } else {
          // For object-type data, just confirm it exists
          const objectVerifyResult = await pool.query(
            'SELECT data FROM json_data WHERE category = $1',
            [category]
          );
          if (objectVerifyResult.rows.length > 0) {
            console.log(`🎯 Verification: ${category} data successfully stored in database`);
          }
        }
        
        successCount++;
        
      } catch (categoryError) {
        console.error(`❌ Error processing ${category}:`, categoryError.message);
        errorCount++;
      }
    }
    
    // Handle loot data specially (separate table)
    try {
      console.log(`\n🔄 Processing loot items (special handling)...`);
      const lootFilePath = path.join(dataDir, 'loot.json');
      
      if (fs.existsSync(lootFilePath)) {
        const lootData = JSON.parse(fs.readFileSync(lootFilePath, 'utf8'));
        
        // Clear existing loot items
        await pool.query('DELETE FROM loot_items');
        console.log('🗑️ Cleared existing loot items from database');
        
        // Insert each loot item
        for (let i = 0; i < lootData.length; i++) {
          const item = lootData[i];
          
          // Skip empty items
          if (!item.text && !item.id) {
            continue;
          }
          
          try {
            await pool.query(
              `INSERT INTO loot_items (text, image, copies, details, genre, type, cost, after_spin, link)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                item.text || '',
                JSON.stringify(item.image || []),
                item.copies || 1,
                item.details || '',
                item.genre || '',
                item.type || '',
                item.cost || '',
                item.after_spin || item["after spin"] || '',
                item.link || ''
              ]
            );
          } catch (itemError) {
            console.error(`⚠️ Error inserting loot item ${i}:`, itemError.message);
          }
        }
        
        // Verify loot items
        const lootCount = await pool.query('SELECT COUNT(*) as count FROM loot_items');
        console.log(`🎯 Verification: ${lootCount.rows[0].count} loot items in database`);
      }
    } catch (lootError) {
      console.error(`❌ Error processing loot items:`, lootError.message);
      errorCount++;
    }
    
    // Summary
    console.log('\n📊 SYNC SUMMARY');
    console.log('================');
    console.log(`✅ Successful: ${successCount} categories`);
    console.log(`❌ Errors: ${errorCount} categories`);
    console.log(`🗄️ Database: PostgreSQL Heroku server updated`);
    
    if (errorCount === 0) {
      console.log('\n🎉 All JSON files successfully synced to database!');
      console.log('🔗 The admin dashboard should now show correct data');
    } else {
      console.log('\n⚠️ Some errors occurred during sync. Check the logs above.');
    }
    
  } catch (error) {
    console.error('❌ Critical error during sync:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Show a warning about backup files
console.log('⚠️  IMPORTANT NOTICE');
console.log('==================');
console.log('This script will sync the CURRENT JSON files to the database.');
console.log('Backup files (with timestamps) will be ignored.');
console.log('This will overwrite any database data with the current JSON files.');
console.log('');

// Run the sync
syncAllJSONToDatabase();
