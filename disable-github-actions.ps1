# Disable GitHub Actions - Fix Deployment Conflicts
Write-Host "=== Disabling GitHub Actions to Fix Deployment ===" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "🔍 Current situation:" -ForegroundColor Yellow
    Write-Host "  ❌ GitHub Actions workflow failing (4 failures shown)" -ForegroundColor Red
    Write-Host "  ✅ Heroku dashboard auto-deploy working" -ForegroundColor Green
    Write-Host "  ⚠️ Both are trying to deploy = conflicts" -ForegroundColor Yellow
    
    Write-Host "`n🎯 Solution: Disable GitHub Actions workflow" -ForegroundColor Green
    
    $workflowPath = ".github\workflows\deploy.yml"
    if (Test-Path $workflowPath) {
        Write-Host "`n📋 Found GitHub Actions workflow at: $workflowPath" -ForegroundColor Yellow
        
        # Rename the file to disable it
        $disabledPath = ".github\workflows\deploy.yml.disabled"
        Move-Item $workflowPath $disabledPath -Force
        Write-Host "✅ Disabled workflow by renaming to: deploy.yml.disabled" -ForegroundColor Green
        
        Write-Host "`n💾 Committing the change..." -ForegroundColor Yellow
        git add .github/workflows/
        git commit -m "Disable GitHub Actions workflow to prevent deployment conflicts - use Heroku dashboard auto-deploy instead"
        
        Write-Host "`n🚀 Pushing to GitHub..." -ForegroundColor Yellow
        git push origin main
        
        Write-Host "`n✅ GitHub Actions workflow disabled!" -ForegroundColor Green
        Write-Host "This will stop the deployment failures you're seeing in notifications" -ForegroundColor White
        
    } else {
        Write-Host "⚠️ No workflow file found to disable" -ForegroundColor Yellow
    }
    
    Write-Host "`n🎉 Deployment Setup Now:" -ForegroundColor Cyan
    Write-Host "✅ Heroku Dashboard Auto-Deploy: ENABLED" -ForegroundColor Green
    Write-Host "❌ GitHub Actions Workflow: DISABLED" -ForegroundColor Red
    Write-Host "🔄 Flow: VS Code → GitHub → Heroku (auto)" -ForegroundColor White
    
    Write-Host "`n📱 What this fixes:" -ForegroundColor Yellow
    Write-Host "  ✅ No more GitHub notification failures" -ForegroundColor Green
    Write-Host "  ✅ Heroku auto-deploy continues working" -ForegroundColor Green
    Write-Host "  ✅ VS Code push → GitHub → Heroku (seamless)" -ForegroundColor Green
    Write-Host "  ✅ No deployment conflicts" -ForegroundColor Green
    
    Write-Host "`n📊 Monitor deployments at:" -ForegroundColor Cyan
    Write-Host "  Heroku Activity: https://dashboard.heroku.com/apps/ergosphere/activity" -ForegroundColor Blue
    Write-Host "  Live App: https://ergosphere.herokuapp.com" -ForegroundColor Blue
    
} catch {
    Write-Host "`n❌ Error disabling workflow:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    Write-Host "`nManual steps:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/FLIGHTx12/ErgoSphere" -ForegroundColor White
    Write-Host "2. Navigate to: .github/workflows/deploy.yml" -ForegroundColor White
    Write-Host "3. Delete or rename the file" -ForegroundColor White
    Write-Host "4. Commit the change" -ForegroundColor White
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
