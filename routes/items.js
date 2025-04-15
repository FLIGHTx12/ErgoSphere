const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM loot_items ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting items:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM loot_items WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new item
router.post('/', async (req, res) => {
  try {
    const { name, description, type, category } = req.body;
    
    const result = await pool.query(
      'INSERT INTO loot_items (name, description, type, category) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, type, category]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an existing item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, category } = req.body;
    
    const result = await pool.query(
      'UPDATE loot_items SET name = $1, description = $2, type = $3, category = $4 WHERE id = $5 RETURNING *',
      [name, description, type, category, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM loot_items WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
