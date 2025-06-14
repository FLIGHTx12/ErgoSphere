/**
 * Robust Sync Script for JSON <-> PostgreSQL
 * Features:
 * - Validation before sync
 * - Backup before overwrite
 * - Atomic DB updates
 * - Logging and error reporting
 * - Dry run mode
 *
 * Usage:
 *   node robust-sync.js direction category [--dry-run]
 *   direction: json-to-db | db-to-json
 *   category: e.g. movies
 *   --dry-run: (optional) preview changes only
 */
const fs = require('fs').promises;
const path = require('path');
const pool = require('./db');

const args = process.argv.slice(2);
const direction = args[0];
const category = args[1];
const dryRun = args.includes('--dry-run');

if (!direction || !category || !['json-to-db', 'db-to-json'].includes(direction)) {
  console.log('Usage: node robust-sync.js <json-to-db|db-to-json> <category> [--dry-run]');
  process.exit(1);
}

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

async function validateDataArray(data, label) {
  if (category === 'weekly-errands' || category === 'bingwa-challenges' || category === 'atletico-workouts') {
    if (!Array.isArray(data) || data.some(item => typeof item !== 'string')) {
      throw new Error(`${label} must be an array of strings`);
    }
    return;
  }
  if (category === 'meals') {
    if (!Array.isArray(data)) throw new Error(`${label} is not an array`);
    let seen = new Set();
    let errors = 0;
    data.forEach((item, idx) => {
      if (!item.meal || typeof item.meal !== 'string') {
        log(`❌ [${label}] Entry ${idx} missing or invalid meal`);
        errors++;
      }
      if (seen.has(item.meal)) {
        log(`⚠️ [${label}] Duplicate meal: ${item.meal}`);
      } else {
        seen.add(item.meal);
      }
    });
    if (errors > 0) throw new Error(`${label} has ${errors} critical errors`);
    return;
  }
  if (category === 'workouts') {
    if (!Array.isArray(data)) throw new Error(`${label} is not an array`);
    let seen = new Set();
    let errors = 0;
    data.forEach((item, idx) => {
      if (!item.title || typeof item.title !== 'string') {
        log(`❌ [${label}] Entry ${idx} missing or invalid title`);
        errors++;
      }
      if (seen.has(item.title)) {
        log(`⚠️ [${label}] Duplicate title: ${item.title}`);
      } else {
        seen.add(item.title);
      }
    });
    if (errors > 0) throw new Error(`${label} has ${errors} critical errors`);
    return;
  }
  if (category === 'pvp' || category === 'coop') {
    if (!Array.isArray(data)) throw new Error(`${label} is not an array`);
    let seen = new Set();
    let errors = 0;
    data.forEach((item, idx) => {
      if (!item.text || typeof item.text !== 'string') {
        log(`❌ [${label}] Entry ${idx} missing or invalid text`);
        errors++;
      }
      if (seen.has(item.text)) {
        log(`⚠️ [${label}] Duplicate text: ${item.text}`);
      } else {
        seen.add(item.text);
      }
    });
    if (errors > 0) throw new Error(`${label} has ${errors} critical errors`);
    return;
  }
  if (category === 'singleplayer') {
    if (!Array.isArray(data)) throw new Error(`${label} is not an array`);
    let seen = new Set();
    let errors = 0;
    data.forEach((item, idx) => {
      if (!item.TITLE || typeof item.TITLE !== 'string') {
        log(`❌ [${label}] Entry ${idx} missing or invalid TITLE`);
        errors++;
      }
      if (seen.has(item.TITLE)) {
        log(`⚠️ [${label}] Duplicate TITLE: ${item.TITLE}`);
      } else {
        seen.add(item.TITLE);
      }
    });
    if (errors > 0) throw new Error(`${label} has ${errors} critical errors`);
    return;
  }
  if (category === 'anime' || category === 'youtube') {
    if (!Array.isArray(data)) throw new Error(`${label} is not an array`);
    let seen = new Set();
    let errors = 0;
    data.forEach((item, idx) => {
      if (!item.TITLE || typeof item.TITLE !== 'string') {
        log(`❌ [${label}] Entry ${idx} missing or invalid TITLE`);
        errors++;
      }
      if (seen.has(item.TITLE)) {
        log(`⚠️ [${label}] Duplicate TITLE: ${item.TITLE}`);
      } else {
        seen.add(item.TITLE);
      }
    });
    if (errors > 0) throw new Error(`${label} has ${errors} critical errors`);
    return;
  }
  if (category === 'loot') {
    if (!Array.isArray(data)) throw new Error(`${label} is not an array`);
    let seen = new Set();
    let errors = 0;
    data.forEach((item, idx) => {
      if (!item.text || typeof item.text !== 'string' || !item.text.trim()) {
        log(`❌ [${label}] Entry ${idx} missing or invalid text`);
        errors++;
      }
      if (seen.has(item.text)) {
        log(`⚠️ [${label}] Duplicate text: ${item.text}`);
      } else {
        seen.add(item.text);
      }
    });
    if (errors > 0) throw new Error(`${label} has ${errors} critical errors`);
    return;
  }
  if (category === 'movies') {
    if (!Array.isArray(data)) throw new Error(`${label} is not an array`);
    let seen = new Set();
    let errors = 0;
    data.forEach((item, idx) => {
      if (!item.Title || typeof item.Title !== 'string') {
        log(`❌ [${label}] Entry ${idx} missing or invalid Title`);
        errors++;
      }
      if (seen.has(item.Title)) {
        log(`⚠️ [${label}] Duplicate Title: ${item.Title}`);
      } else {
        seen.add(item.Title);
      }
    });
    if (errors > 0) throw new Error(`${label} has ${errors} critical errors`);
    return;
  }
  // For all other categories, just log and skip validation
  log(`[${label}] No validation rule for this category, skipping validation.`);
}

async function backupDb(category) {
  const res = await pool.query('SELECT data FROM json_data WHERE category = $1', [category]);
  if (res.rows.length > 0) {
    await pool.query('INSERT INTO json_backups (category, data) VALUES ($1, $2::jsonb)', [category, JSON.stringify(res.rows[0].data)]);
    log(`📦 DB backup for ${category} created in json_backups`);
  }
}

async function backupJson(category) {
  const jsonPath = path.join(__dirname, 'data', `${category}.json`);
  try {
    const data = await fs.readFile(jsonPath, 'utf8');
    const backupDir = path.join(__dirname, 'data', 'backups');
    await fs.mkdir(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `${category}_${Date.now()}.json`);
    await fs.writeFile(backupPath, data, 'utf8');
    log(`📦 JSON backup for ${category} created at ${backupPath}`);
  } catch (e) {
    log(`⚠️ No JSON file to backup for ${category}`);
  }
}

async function syncJsonToDb(category, dryRun) {
  log(`🔄 Syncing JSON -> DB for ${category}...`);
  const jsonPath = path.join(__dirname, 'data', `${category}.json`);
  const jsonData = await fs.readFile(jsonPath, 'utf8');
  const data = JSON.parse(jsonData);
  await validateDataArray(data, 'JSON');
  if (dryRun) {
    log(`[DRY RUN] Would update DB with ${data.length} items for ${category}`);
    return;
  }
  await backupDb(category);
  await pool.query('BEGIN');
  try {
    const res = await pool.query('SELECT id FROM json_data WHERE category = $1', [category]);
    if (res.rows.length > 0) {
      await pool.query('UPDATE json_data SET data = $1::jsonb, updated_at = NOW() WHERE category = $2', [JSON.stringify(data), category]);
      log(`✅ Updated DB for ${category}`);
    } else {
      await pool.query('INSERT INTO json_data (category, data, created_at, updated_at) VALUES ($1, $2::jsonb, NOW(), NOW())', [category, JSON.stringify(data)]);
      log(`✅ Inserted new DB record for ${category}`);
    }
    await pool.query('COMMIT');
  } catch (e) {
    await pool.query('ROLLBACK');
    throw e;
  }
}

async function syncDbToJson(category, dryRun) {
  log(`🔄 Syncing DB -> JSON for ${category}...`);
  const res = await pool.query('SELECT data FROM json_data WHERE category = $1', [category]);
  if (res.rows.length === 0) throw new Error(`No DB data for ${category}`);
  const data = res.rows[0].data;
  await validateDataArray(data, 'DB');
  if (dryRun) {
    log(`[DRY RUN] Would write ${data.length} items to JSON for ${category}`);
    return;
  }
  await backupJson(category);
  const jsonPath = path.join(__dirname, 'data', `${category}.json`);
  await fs.writeFile(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  log(`✅ Wrote ${data.length} items to ${jsonPath}`);
}

async function main() {
  try {
    log('🚀 Robust Sync Script Started');
    if (direction === 'json-to-db') {
      await syncJsonToDb(category, dryRun);
    } else if (direction === 'db-to-json') {
      await syncDbToJson(category, dryRun);
    }
    log('🏁 Sync complete.');
  } catch (e) {
    log('❌ ERROR: ' + e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
