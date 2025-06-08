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

async function restoreLootData() {
  try {
    console.log('🔄 Starting LOOT data restoration...');
    
    // Read the loot data from JSON file
    const lootFilePath = path.join(__dirname, 'data', 'loot.json');
    const lootData = JSON.parse(fs.readFileSync(lootFilePath, 'utf8'));
    
    console.log(`📊 Found ${lootData.length} LOOT items in JSON file`);
    
    // Show first item to verify data
    if (lootData.length > 0) {
      console.log(`🔍 First item: ${lootData[0].text || lootData[0].name || 'No name'}`);
    }    // Clear existing loot_items table and insert all data
    console.log('🗑️ Clearing existing loot_items table...');
    await pool.query('DELETE FROM loot_items');
    
    console.log('📥 Inserting all loot items...');
    for (let i = 0; i < lootData.length; i++) {
      const item = lootData[i];
      console.log(`📦 Inserting item ${i + 1}/${lootData.length}: ${item.text || item.name || 'No name'}`);      await pool.query(`
        INSERT INTO loot_items (id, text, image, copies, details, genre, type, cost, after_spin, link)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        item.id || i + 1,
        item.text || '',
        JSON.stringify(Array.isArray(item.image) ? item.image : [item.image || '']),
        item.copies || 0,
        item.details || '',
        item.genre || '',
        item.type || 'loot',
        item.cost || 0,
        item.after_spin || '',
        item.link || ''
      ]);
    }
    
    console.log('✅ All loot items inserted successfully');
    
    // Verify the restoration
    const verifyResponse = await fetch('http://localhost:3000/api/loot');
    const verifyData = await verifyResponse.json();
    
    console.log(`🎯 Verification: API now returns ${verifyData.length} LOOT items`);
    
    if (verifyData.length > 0) {
      console.log(`🔍 First restored item: ${verifyData[0].text || verifyData[0].name || 'No name'}`);
    }
    
    console.log('✨ LOOT data restoration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error restoring LOOT data:', error);
  } finally {
    await pool.end();
  }
}

// Run the restoration
restoreLootData();
