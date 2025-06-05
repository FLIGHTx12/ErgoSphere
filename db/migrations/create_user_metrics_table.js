const pool = require('../../db');

async function createUserMetricsTable() {
  try {
    // First check if the table already exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_metrics'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('User metrics table already exists, skipping creation');
      return true;
    }
    
    // Create the table if it doesn't exist
    await pool.query(`
      CREATE TABLE user_metrics (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        week_key DATE NOT NULL,
        total_spent INTEGER NOT NULL DEFAULT 0,
        total_calories INTEGER NOT NULL DEFAULT 0,
        snack_count INTEGER NOT NULL DEFAULT 0,
        concoction_count INTEGER NOT NULL DEFAULT 0,
        alcohol_count INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(username, week_key)
      );
      
      -- Create index on username and week_key for faster lookups
      CREATE INDEX idx_user_metrics_username_week ON user_metrics(username, week_key);
    `);
    
    console.log('User metrics table created successfully with indexes');
    return true;
  } catch (error) {
    console.error('Error in user metrics table migration:', error.message);
    return false;
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  createUserMetricsTable()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = createUserMetricsTable;
