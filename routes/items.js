const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET items by type (coop, loot, pvp, shop, etc.)
router.get('/:type', async (req, res) => {
  const { type } = req.params;
  try {
    const result = await pool.query('SELECT * FROM items WHERE type = $1 ORDER BY id', [type]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new item
router.post('/', async (req, res) => {
  const { type, text, image, copies, details, genre, cost, after_spin, link } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO items (type, text, image, copies, details, genre, cost, after_spin, link)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [type, text, image, copies, details, genre, cost, after_spin, link]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an item
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { text, image, copies, details, genre, cost, after_spin, link } = req.body;
  try {
    const result = await pool.query(
      `UPDATE items SET text=$1, image=$2, copies=$3, details=$4, genre=$5, cost=$6,
      after_spin=$7, link=$8 WHERE id=$9 RETURNING *`,
      [text, image, copies, details, genre, cost, after_spin, link, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM items WHERE id=$1', [id]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
