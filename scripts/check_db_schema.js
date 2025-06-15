// Script to verify database schema
const { Pool } = require('pg');

// Use DATABASE_URL environment variable if available, otherwise use the Heroku connection details
const connectionString = process.env.DATABASE_URL || 
  'postgres://u4g8i73g8n411i:pe1e6c500adc040cb7e7258a1e379628c5629a9289aabc73ec65a4fdcaa5c76e0@ccpa7stkruda3o.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/db9op7pb0ol2v4';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Heroku PostgreSQL connections
  }
});

async function checkSchema() {
  console.log('Checking database schema...');
  
  try {
    const client = await pool.connect();
    
    // Check if the weekly_selections table exists
    console.log('\nChecking weekly_selections table...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'weekly_selections'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('weekly_selections table does not exist!');
      return;
    }
    
    console.log('✅ weekly_selections table exists');
    
    // Get all columns from the weekly_selections table
    console.log('\nGetting columns for weekly_selections table...');
    const columnResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'weekly_selections';
    `);
    
    console.log('Columns in weekly_selections table:');
    columnResult.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });
    
    // Check for specific columns we need
    const requiredColumns = [
      'anime', 'anime_end_date', 
      'sunday_morning', 'sunday_morning_end_date',
      'sunday_night', 'sunday_night_end_date'
    ];
    
    console.log('\nChecking for required columns...');
    const missingColumns = [];
    
    for (const col of requiredColumns) {
      const found = columnResult.rows.some(dbCol => dbCol.column_name === col);
      if (found) {
        console.log(`✅ Column '${col}' exists`);
      } else {
        console.log(`❌ Column '${col}' is MISSING`);
        missingColumns.push(col);
      }
    }
    
    if (missingColumns.length > 0) {
      console.error('\nMissing required columns:', missingColumns);
      console.log('\nGenerating SQL to add missing columns:');
      for (const col of missingColumns) {
        let dataType = 'VARCHAR(255)';
        if (col.endsWith('_end_date')) {
          dataType = 'DATE';
        }
        console.log(`ALTER TABLE weekly_selections ADD COLUMN ${col} ${dataType};`);
      }
    } else {
      console.log('\n✅ All required columns exist!');
    }
    
    // Check existing data
    console.log('\nChecking existing data...');
    const dataResult = await client.query(`
      SELECT 
        id, bingwa_champion, anime, anime_end_date,
        sunday_morning, sunday_morning_end_date,
        sunday_night, sunday_night_end_date,
        updated_at
      FROM weekly_selections
      ORDER BY id DESC
      LIMIT 5;
    `);
    
    if (dataResult.rowCount === 0) {
      console.log('No data in weekly_selections table');
    } else {
      console.log(`Found ${dataResult.rowCount} rows in weekly_selections table`);
      console.log('Latest row:', dataResult.rows[0]);
    }
    
    client.release();
    console.log('\nSchema check completed!');
  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    await pool.end();
  }
}

checkSchema();
