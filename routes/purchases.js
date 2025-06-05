const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get user metrics for a specific week
// ROUTE ORDER FIX: Specific routes need to come before generic routes
router.get('/metrics/:weekKey', async (req, res) => {
  try {
    const { weekKey } = req.params;
    console.log(`Fetching metrics for week: ${weekKey}`);
    
    // Validate weekKey format (YYYY-MM-DD)
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(weekKey) && !isNaN(Date.parse(weekKey));
    if (!isValidDate) {
      console.warn(`Invalid weekKey format: ${weekKey}`);
      return res.json([]); // Return empty array for invalid date format
    }
    
    // First check if user_metrics table exists
    try {
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'user_metrics'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log('User metrics table does not exist, creating it now');
        // Create the table if it doesn't exist
        await pool.query(`
          CREATE TABLE IF NOT EXISTS user_metrics (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            week_key DATE NOT NULL,
            total_spent INTEGER NOT NULL DEFAULT 0,
            total_calories INTEGER NOT NULL DEFAULT 0,
            snack_count INTEGER NOT NULL DEFAULT 0,
            concoction_count INTEGER NOT NULL DEFAULT 0,
            alcohol_count INTEGER NOT NULL DEFAULT 0,
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            
            UNIQUE(username, week_key)
          );
          
          -- Create index on username and week_key for faster lookups
          CREATE INDEX IF NOT EXISTS idx_user_metrics_username_week ON user_metrics(username, week_key);
        `);
        console.log('User metrics table created successfully');
      }
    } catch (tableError) {
      console.error('Error checking/creating user_metrics table:', tableError);
      // Continue execution - we'll try to query anyway
    }
      try {
      // Query metrics
      const result = await pool.query(
        'SELECT * FROM user_metrics WHERE week_key = $1',
        [weekKey]
      );
      console.log(`Found ${result.rows.length} metrics for week ${weekKey}`);
      
      // If no metrics found for this week, generate empty ones
      if (result.rows.length === 0) {
        // Check if the requested date is before the app's inception (June 4, 2025)
        const weekDate = new Date(weekKey);
        const inceptionDate = new Date('2025-06-04');
        
        if (weekDate < inceptionDate) {
          console.log(`No metrics available for week ${weekKey} (before app inception date)`);
        } else {
          console.log(`No metrics found for week ${weekKey}, generating empty metrics`);
        }
        
        // Generate empty metrics for known users
        const defaultUsers = ['FLIGHTx12', 'Jaybers8'];
        const emptyMetrics = defaultUsers.map(username => ({
          username,
          week_key: weekKey,
          total_spent: 0,
          total_calories: 0,
          snack_count: 0,
          concoction_count: 0,
          alcohol_count: 0,
          last_updated: new Date().toISOString()
        }));
        
        return res.json(emptyMetrics);
      }
      
      return res.json(result.rows);
    } catch (queryError) {
      console.error('Error querying user metrics:', queryError);
      
      // If table doesn't exist or another query error, generate empty metrics for known users
      const defaultUsers = ['FLIGHTx12', 'Jaybers8'];
      const emptyMetrics = defaultUsers.map(username => ({
        username,
        week_key: weekKey,
        total_spent: 0,
        total_calories: 0,
        snack_count: 0,
        concoction_count: 0,
        alcohol_count: 0,
        last_updated: new Date().toISOString()
      }));
      
      return res.json(emptyMetrics);
    }
  } catch (error) {
    console.error('Unexpected error retrieving user metrics:', error);
    // Return an empty array instead of an error to make the client more resilient
    res.json([]);
  }
});

// Get all purchases for a specific week 
// Moved after specific routes to prevent route conflicts
router.get('/:weekKey', async (req, res) => {
  try {
    const { weekKey } = req.params;
    
    // Validate weekKey format (YYYY-MM-DD)
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(weekKey) && !isNaN(Date.parse(weekKey));
    if (!isValidDate) {
      console.warn(`Invalid weekKey format: ${weekKey}`);
      return res.json([]); // Return empty array for invalid date format
    }
    
    // First check if purchases table exists to avoid SQL errors
    try {
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'purchases'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log('Purchases table does not exist, creating it now');
        await pool.query(`
          CREATE TABLE IF NOT EXISTS purchases (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            week_key DATE NOT NULL,
            items JSONB NOT NULL,
            total_value INTEGER NOT NULL,
            total_calories INTEGER DEFAULT 0,
            purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          
          -- Create indexes for performance
          CREATE INDEX IF NOT EXISTS idx_purchases_week_key ON purchases(week_key);
          CREATE INDEX IF NOT EXISTS idx_purchases_username ON purchases(username);
        `);
        console.log('Purchases table created successfully');
        return res.json([]); // Return empty array since table was just created
      }
    } catch (tableError) {
      console.error('Error checking/creating purchases table:', tableError);
      return res.json([]); // Return empty array on error
    }
      const result = await pool.query(
      'SELECT * FROM purchases WHERE week_key = $1 ORDER BY purchase_date DESC',
      [weekKey]
    );
    
    // Check if the requested date is before the app's inception (June 4, 2025)
    // and log appropriate message
    if (result.rows.length === 0) {
      const weekDate = new Date(weekKey);
      const inceptionDate = new Date('2025-06-04');
      
      if (weekDate < inceptionDate) {
        console.log(`No purchases available for week ${weekKey} (before app inception date)`);
      } else {
        console.log(`No purchases found for week ${weekKey}`);
      }
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving purchases:', error);
    // Return empty array instead of error for better resilience
    res.json([]);
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
    res.json(result.rows);  } catch (error) {
    console.error('Error retrieving user purchases:', error);
    res.status(500).json({ error: 'Failed to retrieve user purchases' });
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
    
    console.log(`Recording purchase for ${username} in week ${weekKey} with ${items.length} items`);
    
    // Make sure purchases table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        week_key DATE NOT NULL,
        items JSONB NOT NULL,
        total_value INTEGER NOT NULL,
        total_calories INTEGER DEFAULT 0,
        purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create indexes for performance if they don't exist
      CREATE INDEX IF NOT EXISTS idx_purchases_week_key ON purchases(week_key);
      CREATE INDEX IF NOT EXISTS idx_purchases_username ON purchases(username);
    `);
    
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
      // Make sure user_metrics table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_metrics (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        week_key DATE NOT NULL,
        total_spent INTEGER NOT NULL DEFAULT 0,
        total_calories INTEGER NOT NULL DEFAULT 0,
        snack_count INTEGER NOT NULL DEFAULT 0,
        concoction_count INTEGER NOT NULL DEFAULT 0,
        alcohol_count INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(username, week_key)
      );
      
      -- Create index on username and week_key for faster lookups
      CREATE INDEX IF NOT EXISTS idx_user_metrics_username_week ON user_metrics(username, week_key);
    `);
    
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
