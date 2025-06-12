@echo off
echo === Simple Git Remote Check and Fix ===
echo.

echo 1. Checking current remotes...
git remote

echo.
echo 2. Detailed remote URLs...
git remote get-url origin
git remote get-url heroku

echo.
echo 3. Current branch...
git branch --show-current

echo.
echo 4. Branch tracking status...
git status -b --porcelain

echo.
echo 5. Testing if VS Code can push...
echo If this works, VS Code should be able to push too:
git push --dry-run origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SUCCESS! VS Code should now be able to push
    echo.
    echo Instructions for VS Code:
    echo 1. Press Ctrl+Shift+P
    echo 2. Type "Git: Reload" and press Enter
    echo 3. Go to Source Control (Ctrl+Shift+G)
    echo 4. Try pushing - it should work now!
) else (
    echo.
    echo ❌ There's still an issue. Let's force fix it:
    echo Running: git push -u origin main --force
    git push -u origin main --force
)

echo.
pause
