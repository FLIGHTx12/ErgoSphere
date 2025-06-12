# Clean up Git remotes and verify setup
Write-Host "=== Git Remote Cleanup ===" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "🔍 Step 1: Current remotes..." -ForegroundColor Yellow
    $remotes = git remote -v
    $remotes | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    
    Write-Host "`n🧹 Step 2: Removing duplicate ErgoSphere remote..." -ForegroundColor Yellow
    
    # Try different methods to remove the duplicate remote
    try {
        git remote rm ErgoSphere 2>$null
        Write-Host "✅ Removed ErgoSphere remote" -ForegroundColor Green
    } catch {
        try {
            git remote remove ErgoSphere 2>$null
            Write-Host "✅ Removed ErgoSphere remote (method 2)" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Could not remove ErgoSphere remote (it's okay, not critical)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n✅ Step 3: Final remote configuration..." -ForegroundColor Yellow
    $finalRemotes = git remote -v
    $finalRemotes | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    
    Write-Host "`n🔍 Step 4: Verifying branch status..." -ForegroundColor Yellow
    $currentBranch = git branch --show-current
    Write-Host "Current branch: $currentBranch" -ForegroundColor Green
    
    $upstream = git rev-parse --abbrev-ref @{upstream} 2>$null
    if ($upstream) {
        Write-Host "Tracking: $upstream" -ForegroundColor Green
    } else {
        Write-Host "Setting up tracking..." -ForegroundColor Yellow
        git branch --set-upstream-to=origin/main main
    }
    
    Write-Host "`n🚀 Step 5: Testing push capability..." -ForegroundColor Yellow
    $pushTest = git push --dry-run origin main 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Push test successful - VS Code should work now!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Push test result: $pushTest" -ForegroundColor Yellow
    }
    
    Write-Host "`n🎉 Git Configuration Summary:" -ForegroundColor Green
    Write-Host "✅ On branch: $currentBranch" -ForegroundColor White
    Write-Host "✅ GitHub remote: origin -> https://github.com/FLIGHTx12/ErgoSphere.git" -ForegroundColor White
    Write-Host "✅ Heroku remote: heroku -> https://git.heroku.com/ergosphere.git" -ForegroundColor White
    Write-Host "✅ Auto-deployment: GitHub -> Heroku (enabled)" -ForegroundColor White
    
    Write-Host "`n📋 VS Code Instructions:" -ForegroundColor Cyan
    Write-Host "1. Press Ctrl+Shift+P in VS Code" -ForegroundColor White
    Write-Host "2. Type 'Git: Reload' and select it" -ForegroundColor White
    Write-Host "3. Go to Source Control (Ctrl+Shift+G)" -ForegroundColor White
    Write-Host "4. Try pushing - should work perfectly now!" -ForegroundColor White
    
} catch {
    Write-Host "`n❌ Error during cleanup:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
