const ErgoSyncManager = require('../utils/ergoSyncManager');

// Start the sync manager
const syncManager = new ErgoSyncManager({
  serverUrl: process.env.HEROKU_URL || 'https://ergosphere.herokuapp.com'
});

syncManager.init().catch(err => {
  console.error('Error initializing sync manager:', err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down sync manager...');
  syncManager.stop();
  process.exit(0);
});
