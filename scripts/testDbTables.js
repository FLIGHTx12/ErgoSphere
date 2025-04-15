const pool = require('../db');

async function testDbTables() {
  try {
    console.log('Testing database connection and tables...');
    
    // Test connection
    const connResult = await pool.query('SELECT NOW() as time');
    console.log(`Database connection successful! Time: ${connResult.rows[0].time}`);
    
    // Check if json_data table exists and is accessible
    try {
      const jsonDataTable = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'json_data'
        )
      `);
      
      console.log(`json_data table exists: ${jsonDataTable.rows[0].exists}`);
      
      if (jsonDataTable.rows[0].exists) {
        // Check table structure
        const tableColumns = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'json_data'
          ORDER BY ordinal_position
        `);
        
        console.log('json_data table structure:');
        tableColumns.rows.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type}`);
        });
        
        // Test inserting a simple JSON object
        console.log('Testing JSON insertion...');
        try {
          await pool.query(`
            INSERT INTO json_data (category, data) 
            VALUES ('test', '{"message":"This is a test"}')
            ON CONFLICT (category) 
            DO UPDATE SET data = '{"message":"Test updated"}', updated_at = NOW()
            WHERE json_data.category = 'test'
          `);
          console.log('Test JSON insertion successful');
          
          // Select the test row
          const testData = await pool.query(`
            SELECT * FROM json_data WHERE category = 'test'
          `);
          console.log('Retrieved test data:', testData.rows[0].data);
        } catch (insertErr) {
          console.error('Error testing JSON insertion:', insertErr);
        }
      }
    } catch (tableErr) {
      console.error('Error checking json_data table:', tableErr);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Database test error:', err);
    process.exit(1);
  }
}

testDbTables();
