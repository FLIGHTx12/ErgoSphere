const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const pool = require('../db');

async function runMigration() {
  try {
    console.log('Running Weekly Choices migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../db/migrations/add_weekly_choices_to_weekly_selections.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('Weekly Choices migration completed successfully');
    
    // Close the pool
    pool.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
