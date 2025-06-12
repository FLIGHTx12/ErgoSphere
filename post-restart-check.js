const { execSync } = require('child_process');

console.log('=== Post-Restart App Health Check ===\n');

try {
    console.log('1. Checking dyno status...');
    const dynoStatus = execSync('heroku ps --app ergosphere', { encoding: 'utf8' });
    console.log(dynoStatus);
    
    console.log('\n2. Checking recent logs for errors...');
    const logs = execSync('heroku logs --num 50 --app ergosphere', { encoding: 'utf8' });
    
    // Filter for error patterns
    const errorLines = logs.split('\n').filter(line => 
        line.toLowerCase().includes('error') || 
        line.toLowerCase().includes('critical') ||
        line.toLowerCase().includes('warn') ||
        line.toLowerCase().includes('fail')
    );
    
    if (errorLines.length > 0) {
        console.log('\n⚠️ Recent errors/warnings found:');
        errorLines.slice(-10).forEach(line => console.log(line));
    } else {
        console.log('✅ No recent errors found in logs');
    }
    
    console.log('\n3. Testing API endpoints...');
    
    // Test main app
    console.log('Testing main app...');
    try {
        const { execSync: exec } = require('child_process');
        const curlResult = exec('curl -s -o /dev/null -w "%{http_code}" https://ergosphere.herokuapp.com', { encoding: 'utf8' });
        console.log(`Main app HTTP status: ${curlResult}`);
    } catch (e) {
        console.log('Could not test main app via curl');
    }
    
    // Test ErgoShop API
    console.log('Testing ErgoShop API...');
    try {
        const curlResult = exec('curl -s -o /dev/null -w "%{http_code}" https://ergosphere.herokuapp.com/api/ergoshop', { encoding: 'utf8' });
        console.log(`ErgoShop API HTTP status: ${curlResult}`);
    } catch (e) {
        console.log('Could not test ErgoShop API via curl');
    }
    
    console.log('\n✅ Post-restart health check complete!');
    console.log('🌐 Your app is available at: https://ergosphere.herokuapp.com');
    
} catch (error) {
    console.error('Error during health check:', error.message);
}
