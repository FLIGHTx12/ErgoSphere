const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const port = process.env.PORT || 3000;

// Pool setup and connection test
const pool = require('./db');
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Postgres connection error:', err);
  } else {
    console.log('Postgres connected:', result.rows[0]);
  }
});

app.use(express.static(__dirname)); // This serves the "data" folder if it exists in the project root
app.use(express.json()); // For parsing application/json

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

// Serve refreshment options from JSON files
app.get('/api/options/:category', (req, res) => {
  const category = req.params.category;
  const filePath = path.join(__dirname, 'data', `${category}.json`);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('File read error:', err);
      return res.status(500).json({ error: 'File read error.' });
    }
    res.json(JSON.parse(data));
  });
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

// Save pool endpoint
app.post('/api/savePool', validatePoolName, async (req, res) => {
  try {
    const { pool, data } = req.body;
    const filePath = path.join(__dirname, 'data', `${pool}.json`);
    const backupDir = path.join(__dirname, 'data/backups');
    
    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });
    
    // Create backup of current file if it exists
    try {
      const currentData = await fs.readFile(filePath, 'utf8');
      const backupPath = path.join(backupDir, `${pool}_${Date.now()}.json`);
      await fs.writeFile(backupPath, currentData);
    } catch (err) {
      console.log('No existing file to backup');
    }

    // Write new data
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving pool:', error);
    res.status(500).json({ error: 'Failed to save pool' });
  }
});

// Add backup management endpoints
app.get('/api/backups/:pool', async (req, res) => {
  try {
    const backupDir = path.join(__dirname, 'data/backups');
    const files = await fs.readdir(backupDir);
    const poolBackups = files
      .filter(f => f.startsWith(req.params.pool))
      .map(f => ({
        id: f.split('_')[1].replace('.json', ''),
        date: new Date(parseInt(f.split('_')[1].replace('.json', ''))).toLocaleString(),
        filename: f
      }))
      .sort((a, b) => b.id - a.id);
    res.json(poolBackups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load backups' });
  }
});

app.get('/api/restore/:pool/:backupId', async (req, res) => {
  try {
    const backupFile = path.join(__dirname, 'data/backups', 
      `${req.params.pool}_${req.params.backupId}.json`);
    const data = await fs.readFile(backupFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
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

// Import and use the new items API routes
const itemsRouter = require('./routes/items');
app.use('/api/items', itemsRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
  
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
