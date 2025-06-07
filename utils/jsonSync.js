const fs = require('fs').promises;
const path = require('path');
const pool = require('../db');

/**
 * Auto-sync utility for synchronizing database data to JSON files
 * Provides failsafe backup functionality for the admin dashboard
 */

/**
 * Sync data from database to JSON file for a specific category
 * @param {string} category - The category to sync (e.g., 'movies', 'anime', 'coop')
 * @returns {Promise<boolean>} - Success status
 */
async function syncCategoryToJSON(category) {
  try {
    console.log(`🔄 Auto-sync: Starting sync for category ${category}`);
    
    // Get data from database
    const result = await pool.query(
      'SELECT data FROM json_data WHERE category = $1',
      [category]
    );
    
    if (result.rows.length === 0) {
      console.log(`⚠️ Auto-sync: No data found in database for category ${category}`);
      return false;
    }
    
    const data = result.rows[0].data;
    
    // Ensure data directory exists
    const dataDir = path.join(__dirname, '..', 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Write to JSON file
    const filePath = path.join(dataDir, `${category}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`✅ Auto-sync: Successfully synced ${category} to JSON file`);
    return true;
  } catch (error) {
    console.error(`❌ Auto-sync: Error syncing ${category} to JSON:`, error);
    return false;
  }
}

/**
 * Sync loot items from database to JSON file
 * @returns {Promise<boolean>} - Success status
 */
async function syncLootToJSON() {
  try {
    console.log('🔄 Auto-sync: Starting loot sync to JSON');
    
    // Get all loot items from database
    const result = await pool.query('SELECT * FROM loot_items ORDER BY id');
    
    if (result.rows.length === 0) {
      console.log('⚠️ Auto-sync: No loot items found in database');
      return false;
    }
    
    // Transform database rows to match JSON format
    const lootData = result.rows.map(item => ({
      id: item.id,
      text: item.text,
      image: typeof item.image === 'string' ? JSON.parse(item.image) : item.image,
      copies: item.copies || 1,
      details: item.details,
      genre: item.genre,
      type: item.type,
      cost: item.cost,
      after_spin: item.after_spin,
      link: item.link
    }));
    
    // Ensure data directory exists
    const dataDir = path.join(__dirname, '..', 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Write to JSON file
    const filePath = path.join(dataDir, 'loot.json');
    await fs.writeFile(filePath, JSON.stringify(lootData, null, 2), 'utf8');
    
    console.log(`✅ Auto-sync: Successfully synced ${lootData.length} loot items to JSON file`);
    return true;
  } catch (error) {
    console.error('❌ Auto-sync: Error syncing loot to JSON:', error);
    return false;
  }
}

/**
 * Sync all data from database to JSON files
 * @returns {Promise<Object>} - Status report for all categories
 */
async function syncAllToJSON() {
  try {
    console.log('🔄 Auto-sync: Starting full database to JSON sync');
    
    const syncResults = {
      timestamp: new Date().toISOString(),
      categories: {},
      loot: false,
      totalSuccess: 0,
      totalAttempted: 0
    };
    
    // Get all categories from json_data table
    const categoriesResult = await pool.query('SELECT DISTINCT category FROM json_data');
    const categories = categoriesResult.rows.map(row => row.category);
    
    // Sync each category
    for (const category of categories) {
      syncResults.totalAttempted++;
      const success = await syncCategoryToJSON(category);
      syncResults.categories[category] = success;
      if (success) syncResults.totalSuccess++;
    }
    
    // Sync loot items
    syncResults.totalAttempted++;
    syncResults.loot = await syncLootToJSON();
    if (syncResults.loot) syncResults.totalSuccess++;
    
    console.log(`✅ Auto-sync: Completed full sync - ${syncResults.totalSuccess}/${syncResults.totalAttempted} successful`);
    return syncResults;
  } catch (error) {
    console.error('❌ Auto-sync: Error in full sync:', error);
    throw error;
  }
}

/**
 * Create a timestamped backup in the json_backups table
 * @param {string} category - The category being backed up
 * @param {Object} data - The data to backup
 * @returns {Promise<boolean>} - Success status
 */
async function createDatabaseBackup(category, data) {
  try {
    await pool.query(
      'INSERT INTO json_backups (category, data, created_at) VALUES ($1, $2, NOW())',
      [category, JSON.stringify(data)]
    );
    console.log(`📦 Auto-sync: Created database backup for ${category}`);
    return true;
  } catch (error) {
    console.error(`❌ Auto-sync: Error creating backup for ${category}:`, error);
    return false;
  }
}

/**
 * Broadcast sync status to connected WebSocket clients
 * @param {WebSocket.Server} wss - WebSocket server instance
 * @param {Object} syncData - Sync status data to broadcast
 */
function broadcastSyncStatus(wss, syncData) {
  try {
    const message = JSON.stringify({
      type: 'sync_status',
      data: syncData,
      timestamp: new Date().toISOString()
    });
    
    wss.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
    
    console.log('📡 Auto-sync: Broadcasted sync status to connected clients');
  } catch (error) {
    console.error('❌ Auto-sync: Error broadcasting sync status:', error);
  }
}

module.exports = {
  syncCategoryToJSON,
  syncLootToJSON,
  syncAllToJSON,
  createDatabaseBackup,
  broadcastSyncStatus
};
