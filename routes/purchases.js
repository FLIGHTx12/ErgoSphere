const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all purchases for a specific week
router.get('/:weekKey', async (req, res) => {
  try {
    const { weekKey } = req.params;
    const result = await pool.query(
      'SELECT * FROM purchases WHERE week_key = $1 ORDER BY purchase_date DESC',
      [weekKey]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving purchases:', error);
    res.status(500).json({ error: 'Failed to retrieve purchases' });
  }
});

// Get purchases for a specific user in a specific week
router.get('/:weekKey/:username', async (req, res) => {
  try {
    const { weekKey, username } = req.params;
    const result = await pool.query(
      'SELECT * FROM purchases WHERE week_key = $1 AND username = $2 ORDER BY purchase_date DESC',
      [weekKey, username]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving user purchases:', error);
    res.status(500).json({ error: 'Failed to retrieve user purchases' });
  }
});

// Get user metrics for a specific week
router.get('/metrics/:weekKey', async (req, res) => {
  try {
    const { weekKey } = req.params;
    const result = await pool.query(
      'SELECT * FROM user_metrics WHERE week_key = $1',
      [weekKey]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving user metrics:', error);
    res.status(500).json({ error: 'Failed to retrieve user metrics' });
  }
});

// Record a new purchase
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { username, weekKey, items, totalValue, totalCalories = 0 } = req.body;
    
    // Validate required fields
    if (!username || !weekKey || !items || totalValue === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Insert the purchase
    const purchaseResult = await client.query(
      'INSERT INTO purchases (username, week_key, items, total_value, total_calories) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username, weekKey, JSON.stringify(items), totalValue, totalCalories]
    );
    
    // Calculate category counts
    const snackCount = items.filter(item => 
      item.toLowerCase().includes('snack') || 
      item.includes('🍿') || 
      item.includes('🍫') || 
      item.includes('🥔') || 
      item.includes('🍪')
    ).length;
    
    const concoctionCount = items.filter(item => 
      item.toLowerCase().includes('concoction') || 
      item.includes('🧪') ||
      item.includes('☕')
    ).length;
    
    // Calculate alcohol count
    const alcoholCount = items.filter(item => 
      item.toLowerCase().includes('beer') || 
      item.toLowerCase().includes('wine') || 
      item.toLowerCase().includes('drink') || 
      item.includes('🍺') || 
      item.includes('🍷') || 
      item.includes('🥃') || 
      item.includes('🍾')
    ).length;
    
    // Update user metrics
    await client.query(`
      INSERT INTO user_metrics (username, week_key, total_spent, total_calories, snack_count, concoction_count, alcohol_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (username, week_key) 
      DO UPDATE SET 
        total_spent = user_metrics.total_spent + $3,
        total_calories = user_metrics.total_calories + $4,
        snack_count = user_metrics.snack_count + $5,
        concoction_count = user_metrics.concoction_count + $6,
        alcohol_count = user_metrics.alcohol_count + $7,
        last_updated = CURRENT_TIMESTAMP
    `, [username, weekKey, totalValue, totalCalories, snackCount, concoctionCount, alcoholCount]);
    
    await client.query('COMMIT');
    
    // If using WebSockets, broadcast the new purchase
    if (req.app.locals.broadcastToClients) {
      req.app.locals.broadcastToClients({
        type: 'newPurchase',
        data: purchaseResult.rows[0]
      });
    }
    
    res.status(201).json(purchaseResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error recording purchase:', error);
    res.status(500).json({ error: 'Failed to record purchase' });
  } finally {
    client.release();
  }
});

// Get weekly totals for each user
router.get('/totals/:weekKey', async (req, res) => {
  try {
    const { weekKey } = req.params;
    const result = await pool.query(
      'SELECT username, SUM(total_value) as total FROM purchases WHERE week_key = $1 GROUP BY username',
      [weekKey]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving weekly totals:', error);
    res.status(500).json({ error: 'Failed to retrieve weekly totals' });
  }
});

// Delete a purchase by ID
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // Get the purchase details before deletion
    const purchaseResult = await client.query(
      'SELECT * FROM purchases WHERE id = $1',
      [id]
    );
    
    // If purchase not found, return 404
    if (purchaseResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    const purchase = purchaseResult.rows[0];
    const { username, week_key, total_value, total_calories } = purchase;
    
    // Parse items to calculate category counts
    const items = typeof purchase.items === 'string' ? JSON.parse(purchase.items) : purchase.items;
    
    // Calculate category counts to subtract from metrics
    const snackCount = items.filter(item => 
      (typeof item === 'string' && (
        item.toLowerCase().includes('snack') || 
        item.includes('🍿') || 
        item.includes('🍫') || 
        item.includes('🥔') || 
        item.includes('🍪')
      )) || 
      (typeof item === 'object' && item.name && (
        item.name.toLowerCase().includes('snack') || 
        item.name.includes('🍿') || 
        item.name.includes('🍫') || 
        item.name.includes('🥔') || 
        item.name.includes('🍪')
      ))
    ).length;
    
    const concoctionCount = items.filter(item => 
      (typeof item === 'string' && (
        item.toLowerCase().includes('concoction') || 
        item.includes('🧪') ||
        item.includes('☕')
      )) || 
      (typeof item === 'object' && item.name && (
        item.name.toLowerCase().includes('concoction') || 
        item.name.includes('🧪') ||
        item.name.includes('☕')
      ))
    ).length;
    
    // Calculate alcohol count
    const alcoholCount = items.filter(item => 
      (typeof item === 'string' && (
        item.toLowerCase().includes('beer') || 
        item.toLowerCase().includes('wine') || 
        item.toLowerCase().includes('drink') || 
        item.includes('🍺') || 
        item.includes('🍷') || 
        item.includes('🥃') || 
        item.includes('🍾')
      )) || 
      (typeof item === 'object' && item.name && (
        item.name.toLowerCase().includes('beer') || 
        item.name.toLowerCase().includes('wine') || 
        item.name.toLowerCase().includes('drink') || 
        item.name.includes('🍺') || 
        item.name.includes('🍷') || 
        item.name.includes('🥃') || 
        item.name.includes('🍾')
      ))
    ).length;
    
    // Update user metrics by subtracting the deleted purchase
    await client.query(`
      UPDATE user_metrics
      SET 
        total_spent = GREATEST(0, total_spent - $3),
        total_calories = GREATEST(0, total_calories - $4),
        snack_count = GREATEST(0, snack_count - $5),
        concoction_count = GREATEST(0, concoction_count - $6),
        alcohol_count = GREATEST(0, alcohol_count - $7),
        last_updated = CURRENT_TIMESTAMP
      WHERE username = $1 AND week_key = $2
    `, [username, week_key, total_value, total_calories, snackCount, concoctionCount, alcoholCount]);
    
    // Delete the purchase
    await client.query(
      'DELETE FROM purchases WHERE id = $1',
      [id]
    );
    
    await client.query('COMMIT');
    
    // If using WebSockets, broadcast the deletion
    if (req.app.locals.broadcastToClients) {
      req.app.locals.broadcastToClients({
        type: 'purchaseDeleted',
        data: { id, week_key }
      });
    }
    
    res.status(200).json({ success: true, message: 'Purchase deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting purchase:', error);
    res.status(500).json({ error: 'Failed to delete purchase' });
  } finally {
    client.release();
  }
});

module.exports = router;
