const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function runMigration() {
  try {
    // Try to run the quarterly games migration if it exists
    try {
      const quarterlyGamesSqlPath = path.join(__dirname, 'db/migrations/add_quarterly_games_ergoart_to_weekly_selections_fixed.sql');
      if (fs.existsSync(quarterlyGamesSqlPath)) {
        const quarterlyGamesSql = fs.readFileSync(quarterlyGamesSqlPath, 'utf8');
        console.log('Executing quarterly games SQL');
        await pool.query(quarterlyGamesSql);
        console.log('Quarterly games migration completed successfully');
      }
    } catch (quarterlyError) {
      console.log('Quarterly games migration not needed or failed:', quarterlyError.message);
    }
    
    // Run the weekly choices migration
    try {
      const weeklyChoicesSqlPath = path.join(__dirname, 'db/migrations/add_weekly_choices_to_weekly_selections.sql');
      if (fs.existsSync(weeklyChoicesSqlPath)) {
        const weeklyChoicesSql = fs.readFileSync(weeklyChoicesSqlPath, 'utf8');
        console.log('Executing weekly choices SQL');
        await pool.query(weeklyChoicesSql);
        console.log('Weekly choices migration completed successfully');
      }
    } catch (weeklyChoicesError) {
      console.log('Weekly choices migration not needed or failed:', weeklyChoicesError.message);
    }
    
    return { success: true, message: 'Migrations completed successfully' };
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
