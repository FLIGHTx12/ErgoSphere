const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const http = require('http');
const WebSocket = require('ws');
const { syncCategoryToJSON, syncLootToJSON, syncAllToJSON, createDatabaseBackup, broadcastSyncStatus } = require('./utils/jsonSync');
const app = express();
const port = process.env.PORT || 3000;

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected WebSocket clients
const connectedClients = new Set();

// Pool setup and connection test
const pool = require('./db');
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Postgres connection error:', err);
  } else {
    console.log('Postgres connected:', result.rows[0]);
  }
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection established');
  connectedClients.add(ws);

  // Send initial connection confirmation
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    timestamp: new Date().toISOString()
  }));

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('WebSocket message received:', data);
      
      // Handle ping/pong for connection health
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });

  // Handle connection close
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    connectedClients.delete(ws);
  });

  // Handle connection errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    connectedClients.delete(ws);
  });
});

// Function to broadcast messages to all connected clients
function broadcastToClients(message) {
  const messageString = JSON.stringify(message);
  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });
}

// Make broadcast function available to routes
app.locals.broadcastToClients = broadcastToClients;

app.use(express.static(__dirname)); // This serves the "data" folder if it exists in the project root
app.use(express.json()); // For parsing application/json

// Add more detailed logging for API requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Add proper caching headers for JSON files
app.use((req, res, next) => {
  // For static JSON files
  if (req.method === 'GET' && req.path.endsWith('.json')) {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Add Last-Modified header for auto-sync feature
    if (!res.getHeader('Last-Modified')) {
      res.setHeader('Last-Modified', new Date().toUTCString());
    }
  }  next();
});

// Enhanced health check endpoint with detailed system status
app.get('/api/health', async (req, res) => {
  let dbStatus = 'unknown';
  let dbResponseTime = null;
  let dbTableStatus = {};
  
  // Check database connectivity
  const dbStartTime = Date.now();
  try {
    // Try a simple query to test database connection
    const dbResult = await pool.query('SELECT NOW()');
    dbStatus = 'connected';
    dbResponseTime = Date.now() - dbStartTime;
    
    // Check for critical tables
    try {
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('purchases', 'user_metrics')
      `);
      
      const existingTables = tablesResult.rows.map(row => row.table_name);
      
      dbTableStatus = {
        purchases: existingTables.includes('purchases'),
        user_metrics: existingTables.includes('user_metrics')
      };
    } catch (tableError) {
      console.error('Health check - Table check error:', tableError);
      dbTableStatus = { error: tableError.message };
    }
  } catch (error) {
    console.error('Health check - Database error:', error);
    dbStatus = 'error';
  }
    // Get system info
  const systemInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };
  
  // Build the detailed health response
  res.json({ 
    status: dbStatus === 'connected' ? 'ok' : 'degraded', 
    timestamp: new Date().toISOString(),
    version: '1.0.2',
    database: {
      status: dbStatus,
      responseTime: dbResponseTime,
      tables: dbTableStatus
    },
    system: systemInfo
  });
});

// Import selection routes
const selectionsRoute = require('./routes/selections');
app.use('/api/selections', selectionsRoute);

// Security middleware to validate pool names
const validatePoolName = (req, res, next) => {
  const validPools = ['loot', 'pvp', 'coop'];
  if (!validPools.includes(req.body.pool)) {
    return res.status(400).json({ error: 'Invalid pool name' });
  }
  next();
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve refreshment options from database instead of JSON files
app.get('/api/options/:category', async (req, res) => {
  const category = req.params.category;
  try {
    // Try to get from database first
    const result = await pool.query(
      'SELECT data FROM json_data WHERE category = $1',
      [category]
    );
    
    if (result.rows.length > 0) {
      return res.json(result.rows[0].data);
    }
    
    // Fallback to JSON file if not in database yet
    const filePath = path.join(__dirname, 'data', `${category}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error retrieving options:', err);
    res.status(500).json({ error: 'Error retrieving options' });
  }
});

// New endpoint for admin dashboard to load data from json_data table
app.get('/api/data/:category', async (req, res) => {
  const category = req.params.category;
  console.log(`📊 Loading data for category: ${category}`);
  try {
    // Try to get from database first
    const result = await pool.query(
      'SELECT data FROM json_data WHERE category = $1',
      [category]
    );
    
    if (result.rows.length > 0) {
      console.log(`✅ Found data in database for ${category}`);
      return res.json(result.rows[0].data);
    }
    
    console.log(`📁 No database data found, trying JSON file for ${category}`);
    // Fallback to JSON file if not in database yet
    const filePath = path.join(__dirname, 'data', `${category}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    console.log(`✅ Successfully loaded JSON file for ${category}`);
    res.json(JSON.parse(data));
  } catch (err) {
    console.error(`❌ Error retrieving data for ${category}:`, err);
    res.status(500).json({ error: 'Error retrieving data' });
  }
});

// Enhanced PUT endpoint with auto-sync functionality
app.put('/api/data/:category', async (req, res) => {
  const category = req.params.category;
  const data = req.body;
  
  try {
    console.log(`🔄 Updating data for category: ${category}`);
    
    // Create database backup
    await createDatabaseBackup(category, data);
    
    // Check if this category exists in the database
    const existingResult = await pool.query(
      'SELECT id FROM json_data WHERE category = $1',
      [category]
    );
    
    if (existingResult.rows.length > 0) {
      // Update existing entry
      await pool.query(
        'UPDATE json_data SET data = $1, updated_at = NOW() WHERE category = $2',
        [JSON.stringify(data), category]
      );
      console.log(`✅ Updated existing ${category} data in database`);
    } else {
      // Insert new entry
      await pool.query(
        'INSERT INTO json_data (category, data) VALUES ($1, $2)',
        [category, JSON.stringify(data)]
      );
      console.log(`✅ Inserted new ${category} data in database`);
    }
    
    // Auto-sync to JSON file
    const syncSuccess = await syncCategoryToJSON(category);
    
    // Broadcast update to connected WebSocket clients
    broadcastSyncStatus(wss, {
      action: 'data_updated',
      category: category,
      syncSuccess: syncSuccess,
      timestamp: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: `${category} data updated successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

/* Updated API endpoints for ErgoShop using database */
app.get('/api/ErgoShop', (req, res) => {
  // Query the database for the ErgoShop JSON stored for id=1
  pool.query("SELECT data FROM ErgoShop WHERE id = 1", (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error.' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No ErgoShop data found.' });
    }
    // Log the keys to confirm structure matches containerMapping
    console.log('Fetched ErgoShop data keys:', Object.keys(result.rows[0].data));
    res.json(result.rows[0].data);
  });
});
  
app.post('/api/ErgoShop', (req, res) => {
  const newData = req.body;
  // Update the single row in the "ErgoShop" table.
  pool.query("UPDATE ErgoShop SET data = $1", [newData], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update data.' });
    res.json({ success: true });
  });
});

// New endpoint to fetch all dropdown options
app.get('/api/options', (req, res) => {
  pool.query('SELECT * FROM dropdown_options ORDER BY category', (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json(result.rows);
  });
});

// Endpoint to add a new option to a category dropdown
app.post('/api/options/:category/add', (req, res) => {
  const { category } = req.params;
  const { newOption } = req.body;
  pool.query('SELECT options FROM dropdown_options WHERE category = $1', [category], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found.' });
    const currentOptions = result.rows[0].options;
    if (currentOptions.includes(newOption)) {
      return res.status(400).json({ error: 'Option already exists.' });
    }
    currentOptions.push(newOption);
    pool.query('UPDATE dropdown_options SET options = $1 WHERE category = $2', [JSON.stringify(currentOptions), category], (updErr) => {
      if (updErr) return res.status(500).json({ error: 'Database error.' });
      res.json({ success: true, options: currentOptions });
    });
  });
});

// Endpoint to remove an option from a category dropdown
app.post('/api/options/:category/remove', (req, res) => {
  const { category } = req.params;
  const { optionToRemove } = req.body;
  pool.query('SELECT options FROM dropdown_options WHERE category = $1', [category], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found.' });
    let currentOptions = result.rows[0].options;
    if (!currentOptions.includes(optionToRemove)) {
      return res.status(400).json({ error: 'Option does not exist.' });
    }
    currentOptions = currentOptions.filter(opt => opt !== optionToRemove);
    pool.query('UPDATE dropdown_options SET options = $1 WHERE category = $2', [JSON.stringify(currentOptions), category], (updErr) => {
      if (updErr) return res.status(500).json({ error: 'Database error.' });
      res.json({ success: true, options: currentOptions });
    });
  });
});

// Endpoint to fetch all refreshment options
app.get('/api/admin/ErgoShop', (req, res) => {
  pool.query('SELECT * FROM refreshment_options ORDER BY category', (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json(result.rows);
  });
});

// Endpoint to add a new refreshment option
app.post('/api/admin/ErgoShop/add', (req, res) => {
  const { category, option, cost } = req.body;
  pool.query('INSERT INTO refreshment_options (category, option, cost) VALUES ($1, $2, $3)', [category, option, cost], (err) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json({ success: true });
  });
});

// Endpoint to remove a refreshment option
app.post('/api/admin/ErgoShop/remove', (req, res) => {
  const { category, option } = req.body;
  pool.query('DELETE FROM refreshment_options WHERE category = $1 AND option = $2', [category, option], (err) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json({ success: true });
  });
});

// Update savePool endpoint to save to database
app.post('/api/savePool', validatePoolName, async (req, res) => {
  try {
    const { pool: poolName, data } = req.body;
    
    // First create a backup in the database
    await pool.query(
      'INSERT INTO json_backups (category, data) VALUES ($1, $2)',
      [poolName, data]
    );
    
    // Check if this pool exists in the database
    const existingResult = await pool.query(
      'SELECT id FROM json_data WHERE category = $1',
      [poolName]
    );
    
    if (existingResult.rows.length > 0) {
      // Update existing entry
      await pool.query(
        'UPDATE json_data SET data = $1, updated_at = NOW() WHERE category = $2',
        [data, poolName]
      );
    } else {
      // Insert new entry
      await pool.query(
        'INSERT INTO json_data (category, data) VALUES ($1, $2)',
        [poolName, data]
      );
    }
    
    // Also save to file as a fallback
    const filePath = path.join(__dirname, 'data', `${poolName}.json`);
    const backupDir = path.join(__dirname, 'data/backups');
    
    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });
    
    // Create backup of current file if it exists
    try {
      const currentData = await fs.readFile(filePath, 'utf8');
      const backupPath = path.join(backupDir, `${poolName}_${Date.now()}.json`);
      await fs.writeFile(backupPath, currentData);
    } catch (err) {
      console.log('No existing file to backup');
    }

    // Write new data to file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving pool:', error);
    res.status(500).json({ error: 'Failed to save pool' });
  }
});

// Update backups endpoint to retrieve from database
app.get('/api/backups/:pool', async (req, res) => {
  try {
    const poolName = req.params.pool;
    
    // Get backups from database
    const result = await pool.query(
      'SELECT id, backup_date FROM json_backups WHERE category = $1 ORDER BY backup_date DESC',
      [poolName]
    );
    
    const backups = result.rows.map(row => ({
      id: row.id,
      date: new Date(row.backup_date).toLocaleString(),
      filename: `${poolName}_${row.id}`
    }));
    
    res.json(backups);
  } catch (error) {
    console.error('Error retrieving backups:', error);
    res.status(500).json({ error: 'Failed to load backups' });
  }
});

// Update restore endpoint to retrieve from database
app.get('/api/restore/:pool/:backupId', async (req, res) => {
  try {
    const backupId = req.params.backupId;
    
    const result = await pool.query(
      'SELECT data FROM json_backups WHERE id = $1',
      [backupId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Backup not found' });
    }
    
    res.json(result.rows[0].data);
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

// Add image directory scanning endpoint
app.get('/api/images/:pool', async (req, res) => {
  try {
    const poolName = req.params.pool.toLowerCase();
    const validPools = ['loot', 'pvp', 'coop'];
    
    if (!validPools.includes(poolName)) {
      return res.status(400).json({ error: 'Invalid pool name' });
    }

    const imagePath = path.join(__dirname, 'assets', 'img', 'Spin The Wheel Photos', poolName);
    const files = await fs.readdir(imagePath);
    
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => ({
        name: file,
        path: `../assets/img/Spin The Wheel Photos/${poolName}/${file}`
      }));

    res.json(images);
  } catch (error) {
    console.error('Error scanning images:', error);
    res.status(500).json({ error: 'Failed to scan images directory' });
  }
});

// Update option update endpoint to use database
app.post('/api/options/update', async (req, res) => {
  const { pool: poolName, text, copies } = req.body;
  try {
    // Get current data from database
    const result = await pool.query(
      'SELECT data FROM json_data WHERE category = $1',
      [poolName]
    );
    
    if (result.rows.length === 0) {
      // Fallback to file if not in database yet
      const filePath = path.join(__dirname, 'data', `${poolName}.json`);
      let data = JSON.parse(await fs.readFile(filePath, 'utf8'));
      
      let updated = false;
      Object.keys(data).forEach(container => {
        data[container] = data[container].map(option => {
          if (option.text === text) {
            option.copies = copies;
            updated = true;
          }
          return option;
        });
      });
      
      if (!updated) {
        return res.status(404).json({ error: 'Option not found' });
      }
      
      // Save updated data to database
      await pool.query(
        'INSERT INTO json_data (category, data) VALUES ($1, $2)',
        [poolName, data]
      );
      
      // Also update file
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      
      return res.json({ success: true });
    }
    
    // Update in database
    let data = result.rows[0].data;
    let updated = false;
    
    Object.keys(data).forEach(container => {
      data[container] = data[container].map(option => {
        if (option.text === text) {
          option.copies = copies;
          updated = true;
        }
        return option;
      });
    });
    
    if (!updated) {
      return res.status(404).json({ error: 'Option not found' });
    }
    
    // Save updated data
    await pool.query(
      'UPDATE json_data SET data = $1, updated_at = NOW() WHERE category = $2',
      [data, poolName]
    );
      // Also update file as fallback
    const filePath = path.join(__dirname, 'data', `${poolName}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`Saved file: ${filePath}`);
    
    res.json({ success: true, message: `${poolName} updated successfully` });
  } catch (error) {
    console.error("Error updating option:", error);
    res.status(500).json({ error: 'Failed to update option' });
  }
});

// Update PUT route for JSON data files to use database
app.put('/data/:filename', async (req, res) => {
  const filename = req.params.filename;
  const data = req.body;

  // --- Validation & Security Enhancements ---
  // Only allow .json files in the data directory
  if (!/^[\w-]+\.json$/.test(filename)) {
    console.error(`Invalid filename format: ${filename}`);
    return res.status(400).json({ error: 'Invalid filename. Only alphanumeric, dash, underscore, and .json allowed.' });
  }

  // Prevent directory traversal
  if (filename.includes('..') || path.isAbsolute(filename)) {
    console.error(`Directory traversal attempt: ${filename}`);
    return res.status(400).json({ error: 'Invalid filename.' });
  }

  // Validate JSON body is not empty and is an object or array
  if (!data || (typeof data !== 'object')) {
    console.error(`Invalid JSON body for ${filename}`);
    return res.status(400).json({ error: 'Request body must be valid JSON.' });  }
  
  const category = filename.replace('.json', '');
  try {    // Save to database
    const existingResult = await pool.query(
      'SELECT id FROM json_data WHERE category = $1',
      [category]    );

    if (existingResult.rows.length > 0) {
      await pool.query(
        'UPDATE json_data SET data = $1, updated_at = NOW() WHERE category = $2',
        [data, category]
      );
    } else {
      await pool.query(
        'INSERT INTO json_data (category, data) VALUES ($1, $2)',
        [category, data]
      );
    }    // Also update file as fallback
    const filePath = path.join(__dirname, 'data', filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    res.json({
      success: true, 
      message: `Data saved successfully to ${filename}`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error updating data:', err, err.stack); // Added err.stack for more details
    // Create a detailed error response
    res.status(500).json({ 
      error: 'Error saving data', 
      details: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// Import and use the new items API routes
const itemsRouter = require('./routes/items');
app.use('/api/items', itemsRouter);

// Import and use the loot API routes
const lootRouter = require('./routes/loot');
app.use('/api/loot', lootRouter);

// Import and use the casino bets routes
const betsRouter = require('./routes/bets');
app.use('/api/bets', betsRouter);

// Import and use the purchases routes
const purchasesRouter = require('./routes/purchases');
app.use('/api/purchases', purchasesRouter);

// Import and use the health check routes
const healthRouter = require('./routes/health');
app.use('/api/health', healthRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error('!!!!!! GLOBAL ERROR HANDLER HIT !!!!!!', err, err.stack); // Made log more prominent and detailed
  res.status(500).json({ error: 'Internal server error' });
});
  
// Run database migrations
const runMigration = require('./runMigration');

// Start the server after running all database migrations
const startServer = async () => {
  try {
    // Run all database migrations
    console.log('Running database migrations...');
    const migrationResult = await runMigration();
    if (migrationResult.success) {
      console.log('All database migrations completed successfully');
    } else {
      console.error('Database migrations failed:', migrationResult.error);
    }
  } catch (err) {
    console.error('Error running database migrations:', err);
  }
    
  // Start the server regardless of migration result
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`WebSocket server is running on ws://localhost:${port}`);
  });
};

startServer();

// Auto-sync and manual sync endpoints
app.get('/api/sync/status', async (req, res) => {
  try {
    const syncResults = await syncAllToJSON();
    res.json({
      status: 'success',
      message: 'Sync status retrieved successfully',
      data: syncResults
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to get sync status',
      error: error.message 
    });
  }
});

// Manual sync endpoint - Database to JSON files
app.post('/api/sync/database-to-json', async (req, res) => {
  try {
    console.log('🔄 Manual sync initiated - Database to JSON files');
    const syncResults = await syncAllToJSON();
    
    // Broadcast sync completion to connected WebSocket clients
    broadcastSyncStatus(wss, {
      action: 'manual_sync_completed',
      results: syncResults,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      status: 'success',
      message: 'Manual sync completed successfully',
      data: syncResults
    });
  } catch (error) {
    console.error('❌ Manual sync failed:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Manual sync failed',
      error: error.message 
    });
  }
});

// Sync specific category endpoint
app.post('/api/sync/:category', async (req, res) => {
  const category = req.params.category;
  try {
    console.log(`🔄 Manual sync initiated for category: ${category}`);
    
    let syncSuccess;
    if (category === 'loot') {
      syncSuccess = await syncLootToJSON();
    } else {
      syncSuccess = await syncCategoryToJSON(category);
    }
    
    // Broadcast sync completion to connected WebSocket clients
    broadcastSyncStatus(wss, {
      action: 'category_sync_completed',
      category: category,
      success: syncSuccess,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      status: 'success',
      message: `${category} sync completed successfully`,
      category: category,
      syncSuccess: syncSuccess
    });
  } catch (error) {
    console.error(`❌ Category sync failed for ${category}:`, error);
    res.status(500).json({ 
      status: 'error',
      message: `${category} sync failed`,
      error: error.message 
    });
  }
});
