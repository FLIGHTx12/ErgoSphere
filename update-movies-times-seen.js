// update-movies-times-seen.js
// This script updates the WATCHED field in your movies.json to be a number (count of 👀),
// then updates the PostgreSQL 'json_data' table for the 'movies' category.

const fs = require('fs');
const { Pool } = require('pg');

// Load movies.json
const moviesPath = './data/movies.json';
const movies = JSON.parse(fs.readFileSync(moviesPath, 'utf8'));

// Convert WATCHED to a number for each movie
for (const movie of movies) {
  const watchedStr = movie.WATCHED || movie.watched || '';
  const timesSeen = (watchedStr.match(/👀/g) || []).length;
  movie.WATCHED = timesSeen;
  movie.watched = timesSeen; // keep both keys in sync
}

// Save the updated movies.json (optional, for backup)
fs.writeFileSync('./data/movies_times_seen.json', JSON.stringify(movies, null, 2));

// PostgreSQL connection config (edit as needed)
const pool = new Pool({
  user: 'your_db_user',
  host: 'localhost',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 5432,
});

async function updateMoviesCategory() {
  try {
    // Update the entire movies category in json_data
    await pool.query(
      'UPDATE json_data SET data = $1 WHERE category = $2',
      [JSON.stringify(movies), 'movies']
    );
    console.log('PostgreSQL movies category updated with correct Times Seen!');
  } catch (err) {
    console.error('Error updating PostgreSQL:', err);
  } finally {
    await pool.end();
  }
}

updateMoviesCategory();
