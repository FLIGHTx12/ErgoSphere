@echo off
echo === Heroku App Recovery After Outage ===
echo.

echo 1. Checking Heroku authentication...
heroku auth:whoami
if errorlevel 1 (
    echo ERROR: Not logged into Heroku. Please run: heroku login
    pause
    exit /b 1
)

echo.
echo 2. Checking current app status...
heroku ps --app ergosphere

echo.
echo 3. Restarting all dynos...
heroku restart --app ergosphere

echo.
echo 4. Waiting 5 seconds for restart...
timeout /t 5 /nobreak

echo.
echo 5. Checking app status after restart...
heroku ps --app ergosphere

echo.
echo 6. Checking recent logs...
heroku logs --num 20 --app ergosphere

echo.
echo 7. Testing app URL...
echo Opening https://ergosphere.herokuapp.com in browser...
start https://ergosphere.herokuapp.com

echo.
echo Recovery attempt complete!
echo Your app should be available at: https://ergosphere.herokuapp.com
pause
