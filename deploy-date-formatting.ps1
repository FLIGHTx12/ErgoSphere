# Deploy script for updating the date formatting
Write-Host "Deploying date formatting changes to Heroku..." -ForegroundColor Cyan

# Check current Git status
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️ You have uncommitted changes. Committing them now..." -ForegroundColor Yellow
    
    git add .
    git commit -m "Update anime, Sunday Morning, and Sunday Night date display to show MM/DD format with weeks remaining and glowing effect for the final week"
    Write-Host "✅ Changes committed" -ForegroundColor Green
}

# Push to Heroku
Write-Host "🚀 Pushing to Heroku main..." -ForegroundColor Cyan
git push heroku main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to Heroku" -ForegroundColor Green
    
    # Give Heroku a moment to update
    Write-Host "🕒 Waiting for Heroku deployment to complete..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    Write-Host "✅ Deployment completed!" -ForegroundColor Green
    Write-Host "   The anime, Sunday Morning, and Sunday Night shows will now display:" -ForegroundColor Cyan
    Write-Host "   - Date in MM/DD format" -ForegroundColor Cyan 
    Write-Host "   - Number of weeks remaining instead of days" -ForegroundColor Cyan
    Write-Host "   - A glowing effect when only 1 week is left" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to push to Heroku" -ForegroundColor Red
    exit 1
}
