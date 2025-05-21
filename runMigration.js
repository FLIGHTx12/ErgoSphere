const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function runMigration() {
  try {    // Read the migration SQL file
    const sqlPath = path.join(__dirname, 'db/migrations/add_quarterly_games_ergoart_to_weekly_selections_fixed.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Log the SQL being executed (to help debug)
    console.log('Executing SQL:\n', sql);
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('Quarterly games migration completed successfully');
    
    return { success: true, message: 'Migration completed successfully' };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error: error.message };
  }
}

// For use in server.js
module.exports = runMigration;

// Direct execution
if (require.main === module) {
  runMigration().then(result => {
    console.log(result);
    if (!result.success) {
      process.exit(1);
    }
    // Do not exit process if successful, to keep connection pool open for server
  });
}
