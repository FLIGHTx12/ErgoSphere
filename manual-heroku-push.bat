@echo off
echo === Manual Heroku Deployment Fix ===
echo.

echo 1. Checking Git status...
git status --porcelain
if %ERRORLEVEL% NEQ 0 (
    echo Error checking git status
    pause
    exit /b 1
)

echo.
echo 2. Adding any uncommitted changes...
git add .

echo.
echo 3. Committing changes...
git commit -m "Deploy ErgoShop improvements and Procfile to Heroku"

echo.
echo 4. Checking remotes...
git remote -v

echo.
echo 5. Current branch:
git branch --show-current

echo.
echo 6. Pushing to Heroku (with force)...
echo Running: git push heroku main --force
git push heroku main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Push successful!
    echo.
    echo 7. Checking app status...
    heroku ps --app ergosphere
    echo.
    echo ✅ Deployment complete!
    echo 🌐 Your app is available at: https://ergosphere.herokuapp.com
) else (
    echo.
    echo ❌ Push failed. Trying alternative methods...
    echo.
    echo Trying: git push heroku HEAD:main --force
    git push heroku HEAD:main --force
)

echo.
pause
