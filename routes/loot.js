const express = require('express');
const router = express.Router();
const pool = require('../db');
const { syncLootToJSON, createDatabaseBackup } = require('../utils/jsonSync');

// Get all loot items, optionally filtered by type
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM loot_items';
    const params = [];
    
    if (type) {
      query += ' WHERE type = $1';
      params.push(type);
    }
    
    query += ' ORDER BY id';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting loot items:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get a single loot item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM loot_items WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting loot item:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new loot item with auto-sync
router.post('/', async (req, res) => {
  try {
    const { text, image, copies, details, genre, type, cost, after_spin, link } = req.body;
    const imageArray = Array.isArray(image) ? image : [image];
    
    const result = await pool.query(
      `INSERT INTO loot_items (text, image, copies, details, genre, type, cost, after_spin, link)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [text, JSON.stringify(imageArray), copies || 1, details, genre, type, cost, after_spin, link]
    );
    
    // Auto-sync to JSON file
    const syncSuccess = await syncLootToJSON();
    console.log(`✅ Created new loot item with auto-sync: ${syncSuccess}`);
    
    res.status(201).json({
      ...result.rows[0],
      syncStatus: syncSuccess
    });
  } catch (err) {
    console.error('Error creating loot item:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update an existing loot item with auto-sync
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, image, copies, details, genre, type, cost, after_spin, link } = req.body;
    const imageArray = Array.isArray(image) ? image : [image];
    
    // Create backup before updating
    const backupResult = await pool.query('SELECT * FROM loot_items WHERE id = $1', [id]);
    if (backupResult.rows.length > 0) {
      await createDatabaseBackup('loot_item', backupResult.rows[0]);
    }
    
    const result = await pool.query(
      `UPDATE loot_items SET 
       text = $1, image = $2, copies = $3, details = $4, genre = $5, 
       type = $6, cost = $7, after_spin = $8, link = $9
       WHERE id = $10 RETURNING *`,
      [text, JSON.stringify(imageArray), copies, details, genre, type, cost, after_spin, link, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Auto-sync to JSON file
    const syncSuccess = await syncLootToJSON();
    console.log(`✅ Updated loot item ${id} with auto-sync: ${syncSuccess}`);
    
    res.json({
      ...result.rows[0],
      syncStatus: syncSuccess
    });
  } catch (err) {
    console.error('Error updating loot item:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a loot item with auto-sync
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Create backup before deleting
    const backupResult = await pool.query('SELECT * FROM loot_items WHERE id = $1', [id]);
    if (backupResult.rows.length > 0) {
      await createDatabaseBackup('loot_item_deleted', backupResult.rows[0]);
    }
    
    const result = await pool.query('DELETE FROM loot_items WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
      // Auto-sync to JSON file
    const syncSuccess = await syncLootToJSON();
    console.log(`✅ Deleted loot item ${id} with auto-sync: ${syncSuccess}`);
    
    res.json({ 
      message: 'Item deleted successfully', 
      item: result.rows[0],
      syncStatus: syncSuccess
    });
  } catch (err) {
    console.error('Error deleting loot item:', err);
    res.status(500).json({ error: err.message });
  }
});

// Bulk update all loot items (for admin dashboard)
router.put('/', async (req, res) => {
  try {
    const lootItems = req.body;
    
    if (!Array.isArray(lootItems)) {
      return res.status(400).json({ error: 'Request body must be an array of loot items' });
    }
    
    console.log(`📦 Bulk update: Received ${lootItems.length} loot items`);
    
    // Create backup before bulk update
    const backupResult = await pool.query('SELECT * FROM loot_items ORDER BY id');
    if (backupResult.rows.length > 0) {
      await createDatabaseBackup('loot_bulk_update_before', backupResult.rows);
    }
    
    // Clear existing loot items
    await pool.query('DELETE FROM loot_items');
    console.log('🗑️ Cleared existing loot items');
    
    // Insert all updated loot items
    let successCount = 0;
    for (const item of lootItems) {
      try {
        const imageArray = Array.isArray(item.image) ? item.image : [item.image || ''];
        
        await pool.query(
          `INSERT INTO loot_items (id, text, image, copies, details, genre, type, cost, after_spin, link)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
           text = EXCLUDED.text,
           image = EXCLUDED.image,
           copies = EXCLUDED.copies,
           details = EXCLUDED.details,
           genre = EXCLUDED.genre,
           type = EXCLUDED.type,
           cost = EXCLUDED.cost,
           after_spin = EXCLUDED.after_spin,
           link = EXCLUDED.link`,
          [
            item.id,
            item.text || '',
            JSON.stringify(imageArray),
            item.copies || 0,
            item.details || '',
            item.genre || '',
            item.type || 'loot',
            item.cost || 0,
            item.after_spin || '',
            item.link || ''
          ]
        );
        successCount++;
      } catch (itemError) {
        console.error(`⚠️ Error updating loot item ${item.id}:`, itemError.message);
      }
    }
    
    // Auto-sync to JSON file
    const syncSuccess = await syncLootToJSON();
    console.log(`✅ Bulk updated ${successCount}/${lootItems.length} loot items with auto-sync: ${syncSuccess}`);
    
    res.json({
      message: `Successfully updated ${successCount}/${lootItems.length} loot items`,
      successCount,
      totalCount: lootItems.length,
      syncStatus: syncSuccess
    });
    
  } catch (err) {
    console.error('Error in bulk loot update:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
