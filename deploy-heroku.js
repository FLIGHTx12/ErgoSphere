const { execSync } = require('child_process');
const fs = require('fs');

console.log('=== ErgoSphere Heroku Deployment ===\n');

// Set environment to disable pager
process.env.GIT_PAGER = '';
process.env.PAGER = '';

try {
  console.log('1. Checking Git status...');
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('Changes found:');
      console.log(status);
    } else {
      console.log('✅ No uncommitted changes');
    }
  } catch (e) {
    console.log('Error checking git status:', e.message);
  }

  console.log('\n2. Adding all changes...');
  execSync('git add .', { stdio: 'inherit' });

  console.log('\n3. Committing changes...');
  try {
    execSync('git commit -m "Add Procfile and deploy ErgoShop improvements to Heroku"', { stdio: 'inherit' });
  } catch (e) {
    console.log('No changes to commit or commit failed:', e.message);
  }

  console.log('\n4. Pushing to Heroku...');
  execSync('git push heroku main', { stdio: 'inherit' });

  console.log('\n5. Checking Heroku app status...');
  try {
    execSync('heroku ps --app ergosphere', { stdio: 'inherit' });
  } catch (e) {
    console.log('Could not check Heroku status:', e.message);
  }

  console.log('\n✅ Deployment complete!');
  console.log('🌐 Your app should be available at: https://ergosphere.herokuapp.com');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.log('\nTroubleshooting steps:');
  console.log('1. Make sure you are logged into Heroku: heroku login');
  console.log('2. Check if the Heroku remote is correct: git remote -v');
  console.log('3. Verify the app name: heroku apps');
}
