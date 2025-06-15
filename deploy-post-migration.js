// This file will be executed during Heroku's deployment process
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('Running post-deploy database migration for anime fields...');

// Use DATABASE_URL environment variable provided by Heroku
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('No DATABASE_URL environment variable found! Make sure this is set in your Heroku config.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Heroku PostgreSQL connections
  }
});

async function runMigration() {
  // Define our SQL directly here to avoid file system operations on Heroku
  const migrationSql = `
    -- Add anime, sunday morning, and sunday night fields to weekly_selections (Heroku Postgres compatible)
    ALTER TABLE weekly_selections ADD COLUMN anime VARCHAR(255);
    ALTER TABLE weekly_selections ADD COLUMN anime_end_date DATE;
    ALTER TABLE weekly_selections ADD COLUMN sunday_morning VARCHAR(255);
    ALTER TABLE weekly_selections ADD COLUMN sunday_morning_end_date DATE;
    ALTER TABLE weekly_selections ADD COLUMN sunday_night VARCHAR(255);
    ALTER TABLE weekly_selections ADD COLUMN sunday_night_end_date DATE;
  `;

  try {
    console.log('Connecting to Heroku Postgres database...');
    const client = await pool.connect();
    console.log('Connected successfully. Running migration...');
    
    // Run each statement separately to handle errors better
    const statements = migrationSql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log('Executed statement successfully:', statement.substring(0, 50) + '...');
      } catch (err) {
        // If the column already exists, this is fine, continue
        if (err.message.includes('already exists')) {
          console.log('Column already exists, continuing:', err.message);
        } else {
          throw err;
        }
      }
    }
    
    console.log('Migration completed successfully!');
    client.release();
    return { success: true, message: 'Migration completed successfully!' };
  } catch (err) {
    console.error('Migration failed:', err);
    return { success: false, error: err.message };
  } finally {
    await pool.end();
  }
}

// Run the migration and return the result
module.exports = runMigration;
