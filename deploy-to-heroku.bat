@echo off
echo === ErgoSphere Deployment Fix ===
echo.

echo Checking Git status...
git --no-pager status

echo.
echo Adding all changes...
git add .

echo.
echo Committing changes...
git commit -m "Fix ErgoShop status indicator removal and API improvements - deployment ready"

echo.
echo Pushing to Heroku...
git push heroku main

echo.
echo Checking Heroku app status...
heroku ps -a ergosphere

echo.
echo Deployment complete! Check https://ergosphere.herokuapp.com
pause
