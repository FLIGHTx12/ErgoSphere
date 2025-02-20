const express = require('express');
const path = require('path');
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
  
app.use(express.static(__dirname)); // Serve static assets
app.use(express.json()); // For parsing application/json
  
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
  
/* Updated API endpoints for refreshments using database */
app.get('/api/refreshments', (req, res) => {
  // Query the database for the refreshments JSON stored for id=1
  pool.query("SELECT data FROM refreshments WHERE id = 1", (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error.' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No refreshments data found.' });
    }
    // Log the keys to confirm structure matches containerMapping
    console.log('Fetched refreshments data keys:', Object.keys(result.rows[0].data));
    res.json(result.rows[0].data);
  });
});
  
app.post('/api/refreshments', (req, res) => {
  const newData = req.body;
  // Update the single row in the "refreshments" table.
  pool.query("UPDATE refreshments SET data = $1", [newData], (err) => {
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
  
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
