# ErgoSphere Deployment Script
Write-Host "=== ErgoSphere Deployment Fix ===" -ForegroundColor Green
Write-Host ""

# Set environment to avoid pager issues
$env:GIT_PAGER = ""
$env:PAGER = ""

Write-Host "Checking Git status..." -ForegroundColor Yellow
git status --porcelain

Write-Host ""
Write-Host "Adding all changes..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Fix ErgoShop status indicator removal and API improvements - deployment ready"

Write-Host ""
Write-Host "Pushing to Heroku main branch..." -ForegroundColor Yellow
git push heroku main

Write-Host ""
Write-Host "Checking Heroku app status..." -ForegroundColor Yellow
heroku ps -a ergosphere

Write-Host ""
Write-Host "Deployment complete! Check https://ergosphere.herokuapp.com" -ForegroundColor Green
