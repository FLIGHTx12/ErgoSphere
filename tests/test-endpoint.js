const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/ergoshop',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  console.log(`headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response body:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('Parsed JSON keys:', Object.keys(parsed));
    } catch (err) {
      console.log('Could not parse as JSON:', err.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();
