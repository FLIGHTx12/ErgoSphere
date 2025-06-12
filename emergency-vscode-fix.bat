@echo off
echo === Emergency VS Code Push Fix ===
echo.

echo 1. Force checkout main branch...
git checkout -B main

echo.
echo 2. Set upstream and force push...
git push -u origin main --force

echo.
echo 3. Refresh git status...
git status

echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ Emergency fix complete!
    echo.
    echo Next steps in VS Code:
    echo 1. Press Ctrl+Shift+P
    echo 2. Type "Git: Reload" and select it
    echo 3. Go to Source Control (Ctrl+Shift+G)
    echo 4. Click refresh icon
    echo 5. Try pushing again
    echo.
    echo If still not working, restart VS Code completely.
) else (
    echo ❌ Emergency fix failed
    echo Try restarting VS Code and run this again
)

pause
