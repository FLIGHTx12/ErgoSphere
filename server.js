const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json()); // For parsing application/json

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* New API endpoints for refreshments */
const dataFile = path.join(__dirname, 'data', 'js/refreshments.json');

app.get('/api/refreshments', (req, res) => {
  fs.readFile(dataFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read data.' });
    res.json(JSON.parse(data));
  });
});

app.post('/api/refreshments', (req, res) => {
  // Expect a JSON object with the new options to merge
  const newData = req.body;
  fs.writeFile(dataFile, JSON.stringify(newData, null, 2), err => {
    if (err) return res.status(500).json({ error: 'Failed to save data.' });
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
