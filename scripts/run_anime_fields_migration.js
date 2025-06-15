// Script to run the add_anime_sunday_fields migration
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('Running the add_anime_sunday_fields migration...');

// Use DATABASE_URL environment variable if available, otherwise use the Heroku connection details
const connectionString = process.env.DATABASE_URL || 
  'postgres://u4g8i73g8n411i:pe1e6c500adc040cb7e7258a1e379628c5629a9289aabc73ec65a4fdcaa5c76e0@ccpa7stkruda3o.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/db9op7pb0ol2v4';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Heroku PostgreSQL connections
  }
});

async function runMigration() {
  // Read the migration file
  const migrationPath = path.join(__dirname, '../db/migrations/add_weekly_choices_to_weekly_selections.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  try {
    console.log('Connecting to database...');
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
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
