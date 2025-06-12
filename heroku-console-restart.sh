#!/bin/bash
# Heroku Console Restart Script
# Run these commands one by one in the Heroku Run Console

echo "=== Heroku Console Restart Procedure ==="
echo ""

echo "1. Check current process status:"
echo "ps aux | grep node"
echo ""

echo "2. Check app files:"
echo "ls -la"
echo "cat Procfile"
echo ""

echo "3. Test server startup:"
echo "timeout 10s node server.js"
echo ""

echo "4. Check environment:"
echo "printenv | grep -E '(PORT|DATABASE_URL|NODE_ENV)'"
echo ""

echo "5. Manual restart (if needed):"
echo "killall node"
echo "nohup node server.js &"
echo ""

echo "6. Check if restart worked:"
echo "ps aux | grep node"
echo "curl -I http://localhost:\$PORT/"
echo ""

echo "=== After running these, exit console and restart dynos from dashboard ==="
