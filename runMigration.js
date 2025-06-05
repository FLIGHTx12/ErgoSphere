const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function runMigration() {
  try {
    console.log('Starting database migration process...');
    
    // Try to run the quarterly games migration if it exists
    try {
      const quarterlyGamesSqlPath = path.join(__dirname, 'db/migrations/add_quarterly_games_ergoart_to_weekly_selections_fixed.sql');
      if (fs.existsSync(quarterlyGamesSqlPath)) {
        const quarterlyGamesSql = fs.readFileSync(quarterlyGamesSqlPath, 'utf8');
        console.log('Executing quarterly games SQL');
        await pool.query(quarterlyGamesSql);
        console.log('✅ Quarterly games migration completed successfully');
      } else {
        console.log('📝 Quarterly games migration file not found (this may be expected)');
      }
    } catch (quarterlyError) {
      console.error('❌ Quarterly games migration failed:', quarterlyError.message);
    }
    
    // Run the weekly choices migration
    try {
      const weeklyChoicesSqlPath = path.join(__dirname, 'db/migrations/add_weekly_choices_to_weekly_selections.sql');
      if (fs.existsSync(weeklyChoicesSqlPath)) {
        const weeklyChoicesSql = fs.readFileSync(weeklyChoicesSqlPath, 'utf8');
        console.log('Executing weekly choices SQL');
        await pool.query(weeklyChoicesSql);
        console.log('✅ Weekly choices migration completed successfully');
      } else {
        console.log('📝 Weekly choices migration file not found (this may be expected)');
      }
    } catch (weeklyChoicesError) {
      console.error('❌ Weekly choices migration failed:', weeklyChoicesError.message);
    }
    
    // Run purchases table migration for weekly purchase tracker
    try {
      console.log('Creating purchases table for weekly purchase tracker...');
      const createPurchasesTable = require('./db/migrations/create_purchases_table');
      const purchasesResult = await createPurchasesTable();
      if (purchasesResult) {
        console.log('✅ Purchases table migration completed successfully');
      } else {
        console.log('⚠️ Purchases table migration returned false');
      }
    } catch (purchasesError) {
      console.error('❌ Purchases table migration failed:', purchasesError.message);
    }
    
    // Run user metrics table migration for weekly purchase tracker
    try {
      console.log('Creating user metrics table for weekly purchase tracker...');
      const createUserMetricsTable = require('./db/migrations/create_user_metrics_table');
      const metricsResult = await createUserMetricsTable();
      if (metricsResult) {
        console.log('✅ User metrics table migration completed successfully');
      } else {
        console.log('⚠️ User metrics table migration returned false');
      }
    } catch (metricsError) {
      console.error('❌ User metrics table migration failed:', metricsError.message);
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
