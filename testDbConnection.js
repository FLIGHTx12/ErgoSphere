const pool = require('./db');

pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  } else {
    console.log('Database connection is working. Time:', result.rows[0].now);
    process.exit(0);
  }
});
