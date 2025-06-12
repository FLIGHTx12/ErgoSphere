#!/bin/bash

echo "=== ErgoSphere Heroku Deployment ==="
echo ""

# Set Git environment to avoid pager issues
export GIT_PAGER=""
export PAGER=""

echo "1. Checking current Git status..."
git status --short

echo ""
echo "2. Adding all changes..."
git add .

echo ""
echo "3. Committing changes..."
git commit -m "Add Procfile and deploy ErgoShop improvements to Heroku" || echo "No changes to commit"

echo ""
echo "4. Pushing to Heroku..."
git push heroku main

echo ""
echo "5. Checking Heroku app status..."
heroku ps --app ergosphere

echo ""
echo "Deployment complete! App should be available at: https://ergosphere.herokuapp.com"
