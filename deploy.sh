#!/bin/bash

echo "Setting up environment..."
export DATABASE_URL="postgres://u4g8i73g8n411i:pe1e6c500adc040cb7e7258a1e379628c5629a9289aabc73ec65a4fdcaa5c76e0@ccpa7stkruda3o.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/db9op7pb0ol2v4"

echo "Starting database initialization..."
node db/init.js

# Import data
echo "Migrating JSON files..."
node scripts/migrateJsonFiles.js

echo "Database setup completed successfully!"
