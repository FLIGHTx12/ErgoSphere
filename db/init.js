const fs = require('fs').promises;
const path = require('path');
const pool = require('../db');

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Create tables for loot items
    console.log('Creating loot_items table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS loot_items (
        id SERIAL PRIMARY KEY,
        text TEXT,
        image JSONB, -- Store image paths as JSON array
        copies INTEGER DEFAULT 1,
        details TEXT,
        genre TEXT,
        type TEXT,
        cost INTEGER,
        after_spin TEXT,
        link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_loot_type ON loot_items(type);
      CREATE INDEX IF NOT EXISTS idx_loot_genre ON loot_items(genre);
    `);
    
    // Create tables for JSON data storage
    console.log('Creating JSON data storage tables...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS json_data (
        id SERIAL PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_json_data_category ON json_data(category);
      
      CREATE TABLE IF NOT EXISTS json_backups (
        id SERIAL PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        data JSONB NOT NULL,
        backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_json_backups_category ON json_backups(category);
    `);
    
    // Create ErgoShop table if it doesn't exist
    console.log('Creating ErgoShop table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ErgoShop (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Insert a default row if the table is empty
      INSERT INTO ErgoShop (id, data)
      SELECT 1, '{}'::jsonb
      WHERE NOT EXISTS (SELECT 1 FROM ErgoShop WHERE id = 1);
    `);
    
    // Create dropdown_options table
    console.log('Creating dropdown_options table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dropdown_options (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL UNIQUE,
        options JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create refreshment_options table
    console.log('Creating refreshment_options table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refreshment_options (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        option TEXT NOT NULL,
        cost INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(category, option)
      );
    `);
    
    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
}

initializeDatabase();
