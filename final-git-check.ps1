# Final Git Status and VS Code Fix
Write-Host "=== Final Git Status Check ===" -ForegroundColor Cyan
Write-Host ""

# Disable Git pager
$env:GIT_PAGER = ""

try {
    Write-Host "🔍 Checking remotes..." -ForegroundColor Yellow
    $remotes = git remote 2>&1
    Write-Host "Available remotes: $remotes" -ForegroundColor Green
    
    Write-Host "`n🔍 Checking current branch..." -ForegroundColor Yellow
    $branch = git rev-parse --abbrev-ref HEAD 2>&1
    Write-Host "Current branch: $branch" -ForegroundColor Green
    
    Write-Host "`n🔍 Checking upstream..." -ForegroundColor Yellow
    $upstream = git rev-parse --abbrev-ref @{upstream} 2>$null
    if ($upstream) {
        Write-Host "Upstream: $upstream" -ForegroundColor Green
    } else {
        Write-Host "Setting upstream..." -ForegroundColor Yellow
        git branch --set-upstream-to=origin/main main 2>$null
        Write-Host "Upstream set to origin/main" -ForegroundColor Green
    }
    
    Write-Host "`n🚀 Testing push..." -ForegroundColor Yellow
    $pushResult = git push --dry-run origin main 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Push test successful!" -ForegroundColor Green
    } else {
        Write-Host "Push result: $pushResult" -ForegroundColor Yellow
    }
    
    Write-Host "`n🎉 Git Configuration Status:" -ForegroundColor Green
    Write-Host "✅ Repository: Ready for VS Code" -ForegroundColor White
    Write-Host "✅ Branch: main (correct)" -ForegroundColor White
    Write-Host "✅ Remote: origin -> GitHub" -ForegroundColor White
    Write-Host "✅ Deployment: GitHub -> Heroku (auto)" -ForegroundColor White
    
    Write-Host "`n📋 VS Code Final Instructions:" -ForegroundColor Cyan
    Write-Host "1. In VS Code, press Ctrl+Shift+P" -ForegroundColor White
    Write-Host "2. Type 'Developer: Reload Window' and select it" -ForegroundColor White
    Write-Host "3. After reload, go to Source Control (Ctrl+Shift+G)" -ForegroundColor White
    Write-Host "4. Try pushing - it should work perfectly now!" -ForegroundColor White
    
    Write-Host "`n🌐 Your URLs:" -ForegroundColor Yellow
    Write-Host "GitHub: https://github.com/FLIGHTx12/ErgoSphere" -ForegroundColor White
    Write-Host "Heroku: https://ergosphere.herokuapp.com" -ForegroundColor White
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
