const fs = require('fs').promises;
const path = require('path');
const pool = require('../db');

async function runCasinoBetsMigration() {
  try {
    console.log('Running migration to create casino_bets table...');
    
    // Read migration file
    const sqlFile = path.join(__dirname, '../db/migrations/create_casino_bets_table.sql');
    const sql = await fs.readFile(sqlFile, 'utf8');
    
    // Execute SQL
    await pool.query(sql);
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runCasinoBetsMigration();
