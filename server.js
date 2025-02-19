const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

const pool = require('./db');

pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Postgres connection error:', err);
  } else {
    console.log('Postgres connected:', result.rows[0]);
  }
});

app.use(express.static(__dirname));
app.use(express.json()); // For parsing application/json

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* New API endpoints for refreshments using database */
app.get('/api/refreshments', (req, res) => {
  pool.query("SELECT data FROM refreshments LIMIT 1", (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (result.rows.length === 0) return res.json({});
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
