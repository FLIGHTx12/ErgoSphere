# GitHub Actions Heroku Deployment Troubleshooter
Write-Host "=== GitHub Actions Heroku Deployment Diagnostics ===" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "🔍 Step 1: Checking if GitHub Actions workflow exists..." -ForegroundColor Yellow
    
    $workflowPath = ".github\workflows\deploy.yml"
    if (Test-Path $workflowPath) {
        Write-Host "✅ GitHub Actions workflow found at: $workflowPath" -ForegroundColor Green
        
        Write-Host "`n📋 Workflow content:" -ForegroundColor Yellow
        Get-Content $workflowPath | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    } else {
        Write-Host "❌ No GitHub Actions workflow found" -ForegroundColor Red
        Write-Host "This explains why deployments are failing" -ForegroundColor Yellow
    }
    
    Write-Host "`n🔍 Step 2: Checking Heroku CLI availability..." -ForegroundColor Yellow
    try {
        $herokuVersion = heroku --version 2>&1
        Write-Host "✅ Heroku CLI: $herokuVersion" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Heroku CLI not found locally (this is OK for GitHub Actions)" -ForegroundColor Yellow
    }
    
    Write-Host "`n🔍 Step 3: Checking package.json for deployment scripts..." -ForegroundColor Yellow
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
        Write-Host "✅ Package.json found" -ForegroundColor Green
        Write-Host "Scripts available:" -ForegroundColor Gray
        $packageJson.scripts.PSObject.Properties | ForEach-Object {
            Write-Host "  $($_.Name): $($_.Value)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ package.json not found" -ForegroundColor Red
    }
    
    Write-Host "`n🔍 Step 4: Checking Procfile..." -ForegroundColor Yellow
    if (Test-Path "Procfile") {
        $procfileContent = Get-Content "Procfile"
        Write-Host "✅ Procfile found: $procfileContent" -ForegroundColor Green
    } else {
        Write-Host "❌ Procfile missing" -ForegroundColor Red
    }
    
    Write-Host "`n🔍 Step 5: Analyzing deployment failure..." -ForegroundColor Yellow
    Write-Host "Common GitHub Actions → Heroku failure reasons:" -ForegroundColor Yellow
    Write-Host "  1. Missing HEROKU_API_KEY in GitHub Secrets" -ForegroundColor White
    Write-Host "  2. Incorrect app name in workflow" -ForegroundColor White
    Write-Host "  3. Missing or incorrect Procfile" -ForegroundColor White
    Write-Host "  4. Build errors in package.json" -ForegroundColor White
    Write-Host "  5. Node.js version mismatch" -ForegroundColor White
    
    Write-Host "`n💡 Recommended Solutions:" -ForegroundColor Green
    Write-Host "Option 1: Disable GitHub Actions, use Heroku's built-in GitHub integration" -ForegroundColor Cyan
    Write-Host "Option 2: Fix GitHub Actions workflow configuration" -ForegroundColor Cyan
    Write-Host "Option 3: Use manual deployment only" -ForegroundColor Cyan
    
    Write-Host "`n🎯 Quick Fix - Disable GitHub Actions:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/FLIGHTx12/ErgoSphere/settings" -ForegroundColor White
    Write-Host "2. Click 'Actions' in left sidebar" -ForegroundColor White
    Write-Host "3. Select 'Disable Actions' or 'Allow select actions'" -ForegroundColor White
    Write-Host "4. Your Heroku dashboard auto-deploy will still work" -ForegroundColor White
    
    Write-Host "`n🔧 Alternative - Use Heroku Dashboard Auto-Deploy:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://dashboard.heroku.com/apps/ergosphere/deploy" -ForegroundColor White
    Write-Host "2. Ensure 'Automatic deploys' is enabled from main branch" -ForegroundColor White
    Write-Host "3. This is simpler and more reliable than GitHub Actions" -ForegroundColor White
    
} catch {
    Write-Host "`n❌ Error during diagnostics:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
