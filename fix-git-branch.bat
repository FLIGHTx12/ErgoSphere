@echo off
echo === Fixing Git Branch for VS Code Push ===
echo.

echo 1. Checking current branch...
git branch --show-current

echo.
echo 2. Checking all branches...
git branch -a

echo.
echo 3. Switching to main branch...
git checkout main
if %ERRORLEVEL% NEQ 0 (
    echo Main branch doesn't exist, creating it...
    git checkout -b main
)

echo.
echo 4. Adding any uncommitted changes...
git add .

echo.
echo 5. Committing changes...
git commit -m "Fix branch setup and deploy ErgoShop improvements"

echo.
echo 6. Setting upstream and pushing...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Branch setup complete!
    echo.
    echo Next steps:
    echo 1. Go back to VS Code
    echo 2. Refresh Source Control (Ctrl+Shift+G)
    echo 3. Try pushing again
    echo 4. This will trigger Heroku auto-deployment
) else (
    echo.
    echo ❌ Error setting upstream. Try:
    echo git push origin main
)

echo.
pause
