/**
 * Script to validate movies.json for malformed entries and duplicate titles
 */
const fs = require('fs').promises;
const path = require('path');

async function validateMoviesJson() {
  try {
    const jsonPath = path.join(__dirname, 'data', 'movies.json');
    const jsonData = await fs.readFile(jsonPath, 'utf8');
    let data;
    try {
      data = JSON.parse(jsonData);
    } catch (e) {
      console.error('❌ JSON parse error:', e.message);
      return;
    }
    if (!Array.isArray(data)) {
      console.error('❌ movies.json is not an array!');
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
      // Check for required fields
      if (!item.imageUrl || typeof item.imageUrl !== 'string') {
        console.warn(`⚠️ Entry ${idx} missing or invalid imageUrl:`, item.Title);
      }
    });
    if (duplicates.length > 0) {
      console.warn('⚠️ Duplicate titles found:', duplicates);
    }
    if (errors === 0) {
      console.log('✅ movies.json validation passed.');
    } else {
      console.log(`❌ Found ${errors} critical errors in movies.json.`);
    }
  } catch (error) {
    console.error('❌ Error validating movies.json:', error);
  }
}

validateMoviesJson();
