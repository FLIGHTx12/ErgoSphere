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

async function fixLootDatabase() {
  try {
    console.log('🔧 Fixing loot items in database...');
    
    const lootFilePath = path.join(__dirname, 'data', 'loot.json');
    const lootData = JSON.parse(fs.readFileSync(lootFilePath, 'utf8'));
    
    console.log(`📊 Found ${lootData.length} loot items in JSON file`);
    
    // Clear existing loot items
    await pool.query('DELETE FROM loot_items');
    console.log('🗑️ Cleared existing loot items from database');
    
    let successCount = 0;
    let skipCount = 0;
    
    // Insert each loot item with proper data handling
    for (let i = 0; i < lootData.length; i++) {
      const item = lootData[i];
      
      // Skip items that only have a link field or are completely empty
      if (!item.text && !item.id && Object.keys(item).length <= 1) {
        skipCount++;
        continue;
      }
      
      try {
        // Handle copies field - ensure it's a valid integer
        let copies = 1; // default value
        if (item.copies !== undefined) {
          if (typeof item.copies === 'number') {
            copies = item.copies;
          } else if (typeof item.copies === 'string' && item.copies !== '') {
            const parsedCopies = parseInt(item.copies);
            if (!isNaN(parsedCopies)) {
              copies = parsedCopies;
            }
          }
        }
        
        // Handle cost field - ensure it's a string
        let cost = '';
        if (item.cost !== undefined) {
          if (typeof item.cost === 'string') {
            cost = item.cost;
          } else if (typeof item.cost === 'number') {
            cost = item.cost.toString();
          }
        }
        
        await pool.query(
          `INSERT INTO loot_items (text, image, copies, details, genre, type, cost, after_spin, link)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            item.text || '',
            JSON.stringify(item.image || []),
            copies,
            item.details || '',
            item.genre || '',
            item.type || '',
            cost,
            item.after_spin || item["after spin"] || '',
            item.link || ''
          ]
        );
        
        successCount++;
        
      } catch (itemError) {
        console.error(`⚠️ Error inserting loot item ${i}:`, itemError.message);
        console.log(`   Item data:`, JSON.stringify(item, null, 2));
      }
    }
    
    // Verify loot items
    const lootCount = await pool.query('SELECT COUNT(*) as count FROM loot_items');
    console.log(`🎯 Successfully inserted: ${successCount} loot items`);
    console.log(`⏭️ Skipped empty items: ${skipCount}`);
    console.log(`🗄️ Total in database: ${lootCount.rows[0].count} loot items`);
    
    console.log('✅ Loot database fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing loot database:', error);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the fix
fixLootDatabase();
