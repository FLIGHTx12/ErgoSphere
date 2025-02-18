const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the project folder
app.use(express.static(path.join(__dirname)));

// Parse incoming requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Example route to handle user input (e.g., form submissions)
app.post('/submit', (req, res) => {
  const userData = req.body;
  console.log('Received user data:', userData);
  // Insert database logic here if needed
  res.json({ success: true, data: userData });
});

// Example API endpoint
app.get('/api/data', (req, res) => {
  res.json({ msg: 'Hello from Node.js server!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
