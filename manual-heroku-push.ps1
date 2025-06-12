# Manual Git Push to Heroku Script
Write-Host "=== Manual Heroku Deployment Fix ===" -ForegroundColor Cyan
Write-Host ""

# Set Git environment to avoid pager issues
$env:GIT_PAGER = ""
$env:PAGER = "cat"

try {
    Write-Host "1. Checking current Git status..." -ForegroundColor Yellow
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "Uncommitted changes found:" -ForegroundColor Red
        $gitStatus
        
        Write-Host "`n2. Adding all changes..." -ForegroundColor Yellow
        git add .
        
        Write-Host "`n3. Committing changes..." -ForegroundColor Yellow
        git commit -m "Deploy ErgoShop improvements and Procfile to Heroku"
    } else {
        Write-Host "✅ No uncommitted changes" -ForegroundColor Green
    }
    
    Write-Host "`n4. Checking Git remotes..." -ForegroundColor Yellow
    $remotes = git remote -v
    Write-Host $remotes
    
    Write-Host "`n5. Checking current branch..." -ForegroundColor Yellow
    $currentBranch = git branch --show-current
    Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan
    
    Write-Host "`n6. Fetching latest from Heroku..." -ForegroundColor Yellow
    git fetch heroku
    
    Write-Host "`n7. Pushing to Heroku main..." -ForegroundColor Yellow
    Write-Host "Running: git push heroku main --force" -ForegroundColor Magenta
    git push heroku main --force
    
    Write-Host "`n8. Checking deployment status..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    heroku ps --app ergosphere
    
    Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
    Write-Host "🌐 Your app should be updated at: https://ergosphere.herokuapp.com" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ Error during deployment:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    Write-Host "`nTroubleshooting options:" -ForegroundColor Yellow
    Write-Host "1. Make sure you're logged into Heroku: heroku login" -ForegroundColor White
    Write-Host "2. Check if main branch exists: git branch -a" -ForegroundColor White
    Write-Host "3. Try force push: git push heroku HEAD:main --force" -ForegroundColor White
    Write-Host "4. Check Heroku app exists: heroku apps:info ergosphere" -ForegroundColor White
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
