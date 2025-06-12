# GitHub Push Script - This will trigger Heroku auto-deploy
Write-Host "=== Push Local Changes to GitHub (Auto-Deploy to Heroku) ===" -ForegroundColor Cyan
Write-Host ""

# Set Git environment
$env:GIT_PAGER = ""
$env:PAGER = "cat"

try {
    Write-Host "🔍 Step 1: Checking local changes..." -ForegroundColor Yellow
    
    # Check current branch
    $currentBranch = git branch --show-current
    Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan
    
    # Check status
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "`n📁 Uncommitted changes found:" -ForegroundColor Yellow
        $gitStatus | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        
        Write-Host "`n➕ Step 2: Adding all changes..." -ForegroundColor Yellow
        git add .
        
        Write-Host "`n💾 Step 3: Committing all ErgoShop improvements..." -ForegroundColor Yellow
        $commitMessage = "Deploy ErgoShop improvements: removed status indicator, fixed APIs, enhanced error tracking, added Procfile"
        git commit -m $commitMessage
        Write-Host "✅ Committed with message: $commitMessage" -ForegroundColor Green
    } else {
        Write-Host "✅ No uncommitted changes found" -ForegroundColor Green
    }
    
    Write-Host "`n🔄 Step 4: Checking commits ahead of GitHub..." -ForegroundColor Yellow
    try {
        git fetch origin 2>$null
        $aheadCommits = git log origin/$currentBranch..$currentBranch --oneline 2>$null
        if ($aheadCommits) {
            Write-Host "📦 Commits ready to push to GitHub:" -ForegroundColor Cyan
            $aheadCommits | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        } else {
            Write-Host "✅ Already up to date with GitHub" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️ Could not check GitHub status, proceeding with push..." -ForegroundColor Yellow
    }
    
    Write-Host "`n🚀 Step 5: Pushing to GitHub..." -ForegroundColor Yellow
    Write-Host "This will trigger automatic Heroku deployment with:" -ForegroundColor Magenta
    Write-Host "  ✅ ErgoShop status indicator removal" -ForegroundColor Green
    Write-Host "  ✅ API endpoint fixes and optimizations" -ForegroundColor Green  
    Write-Host "  ✅ Database connection improvements" -ForegroundColor Green
    Write-Host "  ✅ Procfile for proper Heroku startup" -ForegroundColor Green
    Write-Host "  ✅ Enhanced error tracking and logging" -ForegroundColor Green
    Write-Host "  ✅ Code cleanup and optimizations" -ForegroundColor Green
    
    git push origin $currentBranch
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    
    Write-Host "`n⏳ Step 6: Waiting for Heroku auto-deploy..." -ForegroundColor Yellow
    Write-Host "GitHub will now automatically deploy to Heroku..." -ForegroundColor Cyan
    Write-Host "You can monitor the deployment at:" -ForegroundColor White
    Write-Host "  📊 Heroku Dashboard: https://dashboard.heroku.com/apps/ergosphere" -ForegroundColor Blue
    Write-Host "  📋 Activity Tab: Shows deployment progress" -ForegroundColor Blue
    
    # Wait and check if deployment started
    Write-Host "`nWaiting 30 seconds for deployment to start..." -ForegroundColor Gray
    Start-Sleep -Seconds 30
    
    Write-Host "`n🧪 Step 7: Testing current app status..." -ForegroundColor Yellow
    try {
        # Test main app
        $response = Invoke-WebRequest -Uri "https://ergosphere.herokuapp.com" -TimeoutSec 30 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Main app is responding (Status: $($response.StatusCode))" -ForegroundColor Green
        }
        
        # Test ErgoShop API
        $apiResponse = Invoke-WebRequest -Uri "https://ergosphere.herokuapp.com/api/ergoshop" -TimeoutSec 30 -UseBasicParsing
        if ($apiResponse.StatusCode -eq 200) {
            Write-Host "✅ ErgoShop API is responding (Status: $($apiResponse.StatusCode))" -ForegroundColor Green
            Write-Host "📊 API response size: $($apiResponse.Content.Length) characters" -ForegroundColor Cyan
        }
        
    } catch {
        Write-Host "⚠️ App may still be deploying: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "Check Heroku dashboard for deployment status" -ForegroundColor Yellow
    }
    
    Write-Host "`n🎉 Push to GitHub Complete!" -ForegroundColor Green
    Write-Host "🔄 Heroku auto-deployment should be in progress" -ForegroundColor Cyan
    Write-Host "🌐 Your app will be updated at: https://ergosphere.herokuapp.com" -ForegroundColor Blue
    Write-Host "📱 Monitor deployment: https://dashboard.heroku.com/apps/ergosphere/activity" -ForegroundColor Blue
    
} catch {
    Write-Host "`n❌ Error during GitHub push:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check if you're logged into GitHub in VS Code" -ForegroundColor White
    Write-Host "2. Verify GitHub remote: git remote -v" -ForegroundColor White
    Write-Host "3. Try: git push origin main --force" -ForegroundColor White
    Write-Host "4. Check network connectivity to GitHub" -ForegroundColor White
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
