const pool = require('../../db');

async function createPurchasesTable() {
  try {
    // First check if the table already exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'purchases'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('Purchases table already exists, skipping creation');
      
      // Check if the indexes exist and create them if they don't
      await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_purchases_week_key') THEN
            CREATE INDEX idx_purchases_week_key ON purchases(week_key);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_purchases_username') THEN
            CREATE INDEX idx_purchases_username ON purchases(username);
          END IF;
        END
        $$;
      `);
      
      return true;
    }
    
    // Create the table if it doesn't exist
    await pool.query(`
      CREATE TABLE purchases (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        week_key DATE NOT NULL,
        items JSONB NOT NULL,
        total_value INTEGER NOT NULL,
        total_calories INTEGER DEFAULT 0,
        purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create indexes for performance
      CREATE INDEX idx_purchases_week_key ON purchases(week_key);
      CREATE INDEX idx_purchases_username ON purchases(username);
    `);
    
    console.log('Purchases table created successfully with indexes');
    return true;
  } catch (error) {
    console.error('Error in purchases table migration:', error.message);
    return false;
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  createPurchasesTable()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = createPurchasesTable;
