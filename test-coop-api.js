const https = require('https');
const http = require('http');

// Function to make an HTTP request to the local server
function testApiEndpoint() {
  // Determine which protocol to use (http for local, https for production)
  const isLocal = process.env.NODE_ENV !== 'production';
  const protocol = isLocal ? http : https;
  
  const options = {
    hostname: isLocal ? 'localhost' : 'ergosphere-02b692b18f50.herokuapp.com',
    port: isLocal ? 3000 : 443,
    path: '/api/data/coop',
    method: 'GET',
  };

  console.log(`🔍 Testing ${isLocal ? 'local' : 'production'} API endpoint: ${options.hostname}:${options.port}${options.path}`);

  const req = protocol.request(options, (res) => {
    console.log(`🔄 Status Code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log(`✅ Successfully retrieved data`);
        console.log(`📊 Data contains ${Array.isArray(jsonData) ? jsonData.length : 'unknown number of'} items`);
        
        // Print the first item as a sample
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          console.log(`📝 Sample item: ${JSON.stringify(jsonData[0].text || jsonData[0].title || jsonData[0].name || 'Unknown')}`);
        }
      } catch (error) {
        console.error(`❌ Error parsing JSON: ${error.message}`);
        console.log(`🔍 Raw response: ${data.substring(0, 200)}...`);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error(`❌ Request error: ${error.message}`);
  });
  
  req.end();
}

// Run the test
testApiEndpoint();
