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

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully. Server time:', res.rows[0].now);
  }
});

module.exports = pool;
