const pool = require('../db');

async function verifyDbConnection() {
  try {
    console.log('Testing database connection...');
    
    const result = await pool.query('SELECT NOW() as current_time');
    console.log(`Database connection successful! Current time: ${result.rows[0].current_time}`);
    
    console.log("Connection details used:");
    const connectionString = process.env.DATABASE_URL || 
      'postgres://u4g8i73g8n411i:pe1e6c500adc040cb7e7258a1e379628c5629a9289aabc73ec65a4fdcaa5c76e0@ccpa7stkruda3o.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/db9op7pb0ol2v4';
    
    console.log(`Using connection string: ${connectionString.replace(/:[^:]*@/, ':***@')}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
}

verifyDbConnection();
