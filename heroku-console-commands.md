# Heroku Run Console Commands Guide

# === RESTART COMMANDS ===
# Restart the app (this restarts all dynos)
heroku restart --app ergosphere

# Check dyno status
heroku ps --app ergosphere

# === DIAGNOSTIC COMMANDS ===
# Check recent logs
heroku logs --tail --num 50 --app ergosphere

# Check app info
heroku apps:info ergosphere

# === DATABASE COMMANDS ===
# Connect to your PostgreSQL database
heroku pg:psql --app ergosphere

# Check database status
heroku pg:info --app ergosphere

# === APP COMMANDS ===
# Run your Node.js health check script
node post-restart-check.js

# Check if your server starts properly
node server.js

# === ENVIRONMENT COMMANDS ===
# Check environment variables
heroku config --app ergosphere

# === GIT COMMANDS ===
# See current deployed commit
heroku releases --app ergosphere

# === FILE SYSTEM COMMANDS ===
# List files in your deployed app
ls -la

# Check if Procfile exists
cat Procfile

# Check package.json
cat package.json
