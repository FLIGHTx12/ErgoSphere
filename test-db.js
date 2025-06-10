const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 
  'postgres://u4g8i73g8n411i:pe1e6c500adc040cb7e7258a1e379628c5629a9289aabc73ec65a4fdcaa5c76e0@ccpa7stkruda3o.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/db9op7pb0ol2v4';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

console.log('Testing database connection...');

pool.query('SELECT COUNT(*) FROM json_data', (err, res) => {
  if(err) {
    console.error('❌ Database Error:', err.message);
  } else {
    console.log('✅ Success! Records in json_data:', res.rows[0].count);
  }
  
  // Test a specific category
  pool.query("SELECT category, jsonb_array_length(data) as item_count FROM json_data WHERE category = 'coop'", (err2, res2) => {
    if(err2) {
      console.error('❌ Error checking coop data:', err2.message);
    } else if (res2.rows.length > 0) {
      console.log('✅ Coop data found:', res2.rows[0].item_count, 'items');
    } else {
      console.log('⚠️ No coop data found in database');
    }
    pool.end();
  });
});
