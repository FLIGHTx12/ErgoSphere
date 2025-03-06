const fs = require('fs').promises;
const path = require('path');
const pool = require('../db');

async function migrateLoot() {
  try {
    const filePath = path.join(__dirname, '..', 'data', 'loot.json');
    const data = await fs.readFile(filePath, 'utf8');
    const lootItems = JSON.parse(data);
    
    for (const item of lootItems) {
      const imageVal = Array.isArray(item.image) ? item.image : [item.image];
      await pool.query(
        `INSERT INTO loot_items (text, image, copies, details, genre, type, cost, after_spin, link)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          item.text,
          JSON.stringify(imageVal),
          item.copies,
          item.details,
          item.genre,
          item.type,
          item.cost,
          item["after spin"] || item.after_spin,
          item.link
        ]
      );
    }
    console.log('Loot data imported successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrateLoot();
