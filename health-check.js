/**
 * Automated Health Check Script
 * Validates all categories in both JSON and DB for structure and consistency
 * Usage: node health-check.js [category1 category2 ...]
 */
const fs = require('fs').promises;
const path = require('path');
const pool = require('./db');

const defaultCategories = ['movies', 'anime', 'coop', 'pvp', 'loot', 'youtube', 'singleplayer', 'sundaymorning', 'sundaynight', 'mods'];
const categories = process.argv.length > 2 ? process.argv.slice(2) : defaultCategories;

async function validateDataArray(data, label) {
  if (!Array.isArray(data)) throw new Error(`${label} is not an array`);
  let seen = new Set();
  let errors = 0;
  data.forEach((item, idx) => {
    if (!item.Title || typeof item.Title !== 'string') {
      console.log(`❌ [${label}] Entry ${idx} missing or invalid Title`);
      errors++;
    }
    if (seen.has(item.Title)) {
      console.log(`⚠️ [${label}] Duplicate Title: ${item.Title}`);
    } else {
      seen.add(item.Title);
    }
  });
  if (errors > 0) throw new Error(`${label} has ${errors} critical errors`);
}

async function checkCategory(category) {
  // Check JSON
  try {
    const jsonPath = path.join(__dirname, 'data', `${category}.json`);
    const jsonData = await fs.readFile(jsonPath, 'utf8');
    const data = JSON.parse(jsonData);
    await validateDataArray(data, `JSON:${category}`);
    console.log(`✅ JSON for ${category} is valid.`);
  } catch (e) {
    console.log(`❌ JSON for ${category} error: ${e.message}`);
  }
  // Check DB
  try {
    const res = await pool.query('SELECT data FROM json_data WHERE category = $1', [category]);
    if (res.rows.length === 0) throw new Error('No DB data');
    const data = res.rows[0].data;
    await validateDataArray(data, `DB:${category}`);
    console.log(`✅ DB for ${category} is valid.`);
  } catch (e) {
    console.log(`❌ DB for ${category} error: ${e.message}`);
  }
}

async function main() {
  for (const category of categories) {
    await checkCategory(category);
  }
  await pool.end();
}

main();
