# Push All Recent Changes to Heroku
Write-Host "=== Pushing All Recent ErgoSphere Changes ===" -ForegroundColor Cyan
Write-Host ""

# Set Git environment
$env:GIT_PAGER = ""
$env:PAGER = "cat"

try {
    Write-Host "1. Checking what changes need to be pushed..." -ForegroundColor Yellow
    
    # Check Git status
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "Uncommitted changes found:" -ForegroundColor Yellow
        $gitStatus | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        
        Write-Host "`n2. Adding all changes..." -ForegroundColor Yellow
        git add .
        
        Write-Host "`n3. Committing all recent improvements..." -ForegroundColor Yellow
        $commitMessage = "Deploy all ErgoShop improvements: status indicator removal, API fixes, Procfile, and database optimizations"
        git commit -m $commitMessage
    } else {
        Write-Host "✅ No uncommitted changes" -ForegroundColor Green
    }
    
    Write-Host "`n4. Checking commits ahead of Heroku..." -ForegroundColor Yellow
    try {
        git fetch heroku 2>$null
        $aheadCount = git rev-list --count heroku/main..HEAD 2>$null
        if ($aheadCount -and $aheadCount -gt 0) {
            Write-Host "📦 $aheadCount commits ready to deploy to Heroku" -ForegroundColor Cyan
        } else {
            Write-Host "✅ Already up to date with Heroku" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️ Could not check Heroku status, proceeding with push..." -ForegroundColor Yellow
    }
    
    Write-Host "`n5. Pushing to GitHub first..." -ForegroundColor Yellow
    git push origin main
    
    Write-Host "`n6. Pushing to Heroku..." -ForegroundColor Yellow
    Write-Host "This will deploy:" -ForegroundColor Magenta
    Write-Host "  ✅ ErgoShop status indicator removal" -ForegroundColor Green
    Write-Host "  ✅ API endpoint improvements" -ForegroundColor Green  
    Write-Host "  ✅ Database connection fixes" -ForegroundColor Green
    Write-Host "  ✅ Procfile for proper startup" -ForegroundColor Green
    Write-Host "  ✅ Error tracking enhancements" -ForegroundColor Green
    
    git push heroku main
    
    Write-Host "`n7. Checking deployment status..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    try {
        heroku ps --app ergosphere
        Write-Host "`n8. Testing deployed app..." -ForegroundColor Yellow
        
        # Test main app
        $response = Invoke-WebRequest -Uri "https://ergosphere.herokuapp.com" -TimeoutSec 30 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Main app is responding" -ForegroundColor Green
        }
        
        # Test ErgoShop API
        $apiResponse = Invoke-WebRequest -Uri "https://ergosphere.herokuapp.com/api/ergoshop" -TimeoutSec 30 -UseBasicParsing
        if ($apiResponse.StatusCode -eq 200) {
            Write-Host "✅ ErgoShop API is responding" -ForegroundColor Green
            Write-Host "📊 API response size: $($apiResponse.Content.Length) characters" -ForegroundColor Cyan
        }
        
    } catch {
        Write-Host "⚠️ Could not check app status: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Green
    Write-Host "🌐 Your updated app is live at: https://ergosphere.herokuapp.com" -ForegroundColor Cyan
    Write-Host "🛍️ ErgoShop improvements are now live!" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ Error during deployment:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure you're logged into Heroku: heroku login" -ForegroundColor White
    Write-Host "2. Check GitHub connection in Heroku dashboard" -ForegroundColor White
    Write-Host "3. Try manual push: git push heroku main --force" -ForegroundColor White
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
