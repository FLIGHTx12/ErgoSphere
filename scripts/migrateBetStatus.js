// Script to migrate bet status fields
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function migrateBetStatusFields() {
  try {
    console.log('Adding bet status fields to casino_bets table...');
    
    // Read and execute SQL file
    const sqlFile = path.join(__dirname, '../db/migrations/add_bet_status_fields.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await pool.query(sql);
    
    console.log('Migration completed successfully.');  } catch (err) {
    console.error('Migration failed:', err);
  }
}

migrateBetStatusFields();
