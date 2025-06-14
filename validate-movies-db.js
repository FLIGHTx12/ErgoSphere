/**
 * Script to validate movies data in PostgreSQL for structure and consistency
 */
const pool = require('./db');

async function validateMoviesDb() {
  try {
    const result = await pool.query('SELECT data FROM json_data WHERE category = $1', ['movies']);
    if (result.rows.length === 0) {
      console.error('❌ No movies data found in the database!');
      return;
    }
    const data = result.rows[0].data;
    if (!Array.isArray(data)) {
      console.error('❌ movies data in database is not an array!');
      return;
    }
    let errors = 0;
    let seenTitles = new Set();
    let duplicates = [];
    data.forEach((item, idx) => {
      if (!item.Title || typeof item.Title !== 'string') {
        console.error(`❌ Entry ${idx} missing or invalid Title:`, item);
        errors++;
      }
      if (seenTitles.has(item.Title)) {
        duplicates.push(item.Title);
      } else {
        seenTitles.add(item.Title);
      }
      if (!item.imageUrl || typeof item.imageUrl !== 'string') {
        console.warn(`⚠️ Entry ${idx} missing or invalid imageUrl:`, item.Title);
      }
    });
    if (duplicates.length > 0) {
      console.warn('⚠️ Duplicate titles found in DB:', duplicates);
    }
    if (errors === 0) {
      console.log('✅ movies data in database validation passed.');
    } else {
      console.log(`❌ Found ${errors} critical errors in movies data in database.`);
    }
  } catch (error) {
    console.error('❌ Error validating movies data in database:', error);
  } finally {
    await pool.end();
  }
}

validateMoviesDb();
