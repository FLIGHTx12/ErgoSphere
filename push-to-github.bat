@echo off
echo === Push to GitHub (Auto-Deploy to Heroku) ===
echo.

echo 1. Checking Git status...
git status --short

echo.
echo 2. Adding all changes...
git add .

echo.
echo 3. Committing ErgoShop improvements...
git commit -m "Deploy ErgoShop improvements: removed status indicator, fixed APIs, enhanced error tracking, added Procfile"

echo.
echo 4. Pushing to GitHub (this will trigger Heroku auto-deploy)...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Successfully pushed to GitHub!
    echo 🔄 Heroku auto-deployment should start now
    echo.
    echo Monitor deployment at:
    echo 📊 https://dashboard.heroku.com/apps/ergosphere/activity
    echo.
    echo Testing app in 30 seconds...
    timeout /t 30 /nobreak
    
    echo Testing app status...
    curl -I https://ergosphere.herokuapp.com
    echo.
    echo Your app will be updated at: https://ergosphere.herokuapp.com
) else (
    echo.
    echo ❌ Push failed. Check your GitHub connection.
    echo Troubleshooting:
    echo 1. Make sure you're logged into GitHub
    echo 2. Check internet connection
    echo 3. Verify Git remote: git remote -v
)

echo.
pause
