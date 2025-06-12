const { execSync } = require('child_process');

console.log('=== ErgoSphere Deployment Status Check ===\n');

try {
    // Check if we're in a git repository
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    console.log('Git Repository Status:');
    if (gitStatus.trim()) {
        console.log('Uncommitted changes found:');
        console.log(gitStatus);
    } else {
        console.log('✅ Working directory clean - no uncommitted changes');
    }
    
    // Get current branch
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`Current branch: ${currentBranch}`);
    
    // Check last few commits
    const lastCommits = execSync('git log --oneline -3', { encoding: 'utf8' });
    console.log('\nLast 3 commits:');
    console.log(lastCommits);
    
    // Check remote status
    try {
        const remoteStatus = execSync('git status -b --porcelain', { encoding: 'utf8' });
        console.log('Remote sync status:');
        console.log(remoteStatus || 'In sync with remote');
    } catch (e) {
        console.log('Could not check remote status:', e.message);
    }
    
    // Check Heroku auth
    try {
        const herokuUser = execSync('heroku auth:whoami', { encoding: 'utf8' }).trim();
        console.log(`\n✅ Logged into Heroku as: ${herokuUser}`);
    } catch (e) {
        console.log('\n❌ Not logged into Heroku CLI or Heroku CLI not found');
        console.log('Please run: heroku login');
    }
    
    // Check Heroku app info
    try {
        const herokuInfo = execSync('heroku apps:info ergosphere', { encoding: 'utf8' });
        console.log('\nHeroku App Info:');
        console.log(herokuInfo);
    } catch (e) {
        console.log('\n❌ Could not get Heroku app info:', e.message);
    }
    
} catch (error) {
    console.error('Error checking status:', error.message);
}
