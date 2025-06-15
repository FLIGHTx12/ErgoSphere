// Script to test the weeks remaining calculation with future dates
const { Pool } = require('pg');
const util = require('util');

// Use DATABASE_URL environment variable if available, otherwise use the Heroku connection details
const connectionString = process.env.DATABASE_URL || 
  'postgres://u4g8i73g8n411i:pe1e6c500adc040cb7e7258a1e379628c5629a9289aabc73ec65a4fdcaa5c76e0@ccpa7stkruda3o.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/db9op7pb0ol2v4';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Heroku PostgreSQL connections
  }
});

async function testFutureDates() {
  console.log('Testing the weeks remaining calculation with future dates...');
  
  // Test dates
  const today = new Date();
  
  // Create a date 1 week in the future (should show "1 week left")
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(today.getDate() + 7);
  
  // Create a date 4 weeks in the future (should show "4 weeks left")
  const fourWeeksFromNow = new Date();
  fourWeeksFromNow.setDate(today.getDate() + 28);
  
  // Create a date in the past (should show "Ended")
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);
  
  try {
    const client = await pool.connect();
    
    console.log('Connected to database successfully.');
    console.log('Current database date format for reference:');
    const timeResult = await client.query('SELECT NOW()');
    console.log('Database NOW():', timeResult.rows[0].now);
    
    console.log('\n=== Test Calculations ===');
    
    // Format dates for console display
    console.log('Today:', today.toISOString().split('T')[0]);
    console.log('1 week from now:', oneWeekFromNow.toISOString().split('T')[0]);
    console.log('4 weeks from now:', fourWeeksFromNow.toISOString().split('T')[0]);
    console.log('Last week:', lastWeek.toISOString().split('T')[0]);
    
    // Calculate weeks remaining for each test date
    function getWeeksRemaining(targetDate) {
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.ceil(diffDays / 7);
    }
    
    console.log('\n=== Weeks Remaining ===');
    console.log('1 week from now:', getWeeksRemaining(oneWeekFromNow), 'weeks');
    console.log('4 weeks from now:', getWeeksRemaining(fourWeeksFromNow), 'weeks');
    console.log('Last week:', getWeeksRemaining(lastWeek), 'weeks');
    
    console.log('\n=== Updating Database for Testing ===');
    
    // Format dates for database insertion
    const formatDateForDB = (date) => date.toISOString().split('T')[0];
    
    // Update the selections in the database
    const updateResult = await client.query(`
      INSERT INTO weekly_selections 
      (bingwa_champion, atletico_champ, movie_night, banquet_meal, brunch_meal,
       anime, anime_end_date, sunday_morning, sunday_morning_end_date, sunday_night, sunday_night_end_date)
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      'JAYBERS8', 'FLIGHTx12!', 'Test Movie', 'Test Banquet', 'Test Brunch',
      'Test Anime', formatDateForDB(oneWeekFromNow),  // 1 week left (should glow)
      'Test Sunday Morning', formatDateForDB(fourWeeksFromNow),  // 4 weeks left
      'Test Sunday Night', formatDateForDB(lastWeek)  // Ended
    ]);
    
    console.log('Database updated with test dates.');
    console.log('Check the frontend to verify the weeks formatting and glow effect for "Test Anime".');
    
    client.release();
  } catch (err) {
    console.error('Error testing future dates:', err);
  } finally {
    await pool.end();
  }
}

testFutureDates();
