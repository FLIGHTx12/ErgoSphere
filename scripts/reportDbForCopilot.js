const pool = require('../db');
const path = require('path');
const fs = require('fs').promises;

async function reportDbForCopilot() {
  try {
    console.log('Gathering database information for Copilot Agent review...');
    
    // Test connection and basic info
    const connResult = await pool.query('SELECT current_database(), current_user, version()');
    console.log('Database connection successful!');
    console.log(`Database: ${connResult.rows[0].current_database}`);
    console.log(`User: ${connResult.rows[0].current_user}`);
    console.log(`PostgreSQL Version: ${connResult.rows[0].version}`);
    
    // Get list of tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\nDatabase Tables:');
    const tables = tablesResult.rows.map(row => row.table_name);
    tables.forEach(table => console.log(` - ${table}`));
    
    // Generate structure report for each table
    console.log('\nTable Structures:');
    for (const table of tables) {
      const structureResult = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      
      console.log(`\nTable: ${table}`);
      console.log('Columns:');
      structureResult.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? 'DEFAULT ' + col.column_default : ''}`);
      });
    }
    
    // Generate report file
    const reportData = {
      connection: {
        database: connResult.rows[0].current_database,
        user: connResult.rows[0].current_user,
        version: connResult.rows[0].version
      },
      tables: {}
    };
    
    // Add table structure data to report
    for (const table of tables) {
      const structureResult = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      
      reportData.tables[table] = structureResult.rows.map(col => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === 'YES',
        default: col.column_default
      }));
    }
    
    // Write report to file
    const reportPath = path.join(__dirname, '..', 'db_report_for_copilot.json');
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\nDatabase report written to ${reportPath}`);
    
    console.log('\nTo review your database with Copilot Agent, include this file in your next question.');
    
    process.exit(0);
  } catch (err) {
    console.error('Error generating database report:', err);
    process.exit(1);
  }
}

reportDbForCopilot();