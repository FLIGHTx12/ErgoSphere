/**
 * Automated Maintenance Script
 * - Runs health check for each category
 * - If valid, runs sync (configurable direction) for each
 * - Logs results to a file
 * - Designed for scheduling (Task Scheduler, cron, etc.)
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// CONFIGURATION
const categories = ['movies', 'anime', 'coop', 'pvp', 'loot', 'youtube', 'singleplayer', 'sundaymorning', 'sundaynight', 'mods']; // Add/remove as needed
const syncDirection = 'json-to-db'; // or 'db-to-json'
const logFile = path.join(__dirname, 'auto-maintenance.log');
const dryRun = false; // Set true for preview only

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
  console.log(line.trim());
}

function runScript(command, label) {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        log(`❌ ${label} error: ${error.message}`);
        resolve(false);
      } else if (stderr) {
        log(`⚠️ ${label} stderr: ${stderr}`);
        resolve(false);
      } else {
        log(`✅ ${label} success.`);
        log(stdout.trim());
        resolve(true);
      }
    });
  });
}

async function main() {
  log('🚀 Automated maintenance started');
  for (const category of categories) {
    log(`\n=== Processing category: ${category} ===`);
    // 1. Health check
    const healthOk = await runScript(`node health-check.js ${category}`, `Health Check (${category})`);
    if (!healthOk) {
      log(`❌ Health check failed for ${category}. Skipping sync.`);
      continue;
    }
    // 2. Sync
    const syncCmd = `node robust-sync.js ${syncDirection} ${category} ${dryRun ? '--dry-run' : ''}`;
    const syncOk = await runScript(syncCmd, `Sync (${syncDirection}, ${category})`);
    if (!syncOk) {
      log(`❌ Sync failed for ${category}.`);
    } else {
      log(`🏁 Maintenance complete for ${category}.`);
    }
  }
  log('=== All categories processed ===');
}

main();
