# Fix Git Branch Issue - VS Code Push Problem
Write-Host "=== Fixing Git Branch for VS Code Push ===" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "🔍 Step 1: Checking current Git status..." -ForegroundColor Yellow
    
    # Check current branch
    $currentBranch = git branch --show-current
    if ($currentBranch) {
        Write-Host "Current branch: $currentBranch" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Not on any branch (detached HEAD state)" -ForegroundColor Red
    }
    
    # Check all branches
    Write-Host "`n📋 Available branches:" -ForegroundColor Yellow
    git branch -a
    
    Write-Host "`n🔧 Step 2: Checking out main branch..." -ForegroundColor Yellow
    
    # First, let's see if main branch exists
    $branches = git branch -a
    if ($branches -match "main") {
        Write-Host "Switching to main branch..." -ForegroundColor Cyan
        git checkout main
    } elseif ($branches -match "master") {
        Write-Host "Switching to master branch..." -ForegroundColor Cyan
        git checkout master
    } else {
        Write-Host "Creating and switching to main branch..." -ForegroundColor Cyan
        git checkout -b main
    }
    
    Write-Host "`n✅ Step 3: Verifying branch status..." -ForegroundColor Yellow
    $newBranch = git branch --show-current
    Write-Host "Now on branch: $newBranch" -ForegroundColor Green
    
    Write-Host "`n📦 Step 4: Checking for uncommitted changes..." -ForegroundColor Yellow
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "Uncommitted changes found:" -ForegroundColor Yellow
        $gitStatus | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        
        Write-Host "`n➕ Adding all changes..." -ForegroundColor Yellow
        git add .
        
        Write-Host "`n💾 Committing changes..." -ForegroundColor Yellow
        git commit -m "Fix branch setup and deploy ErgoShop improvements"
        Write-Host "✅ Changes committed" -ForegroundColor Green
    } else {
        Write-Host "✅ No uncommitted changes" -ForegroundColor Green
    }
    
    Write-Host "`n🔗 Step 5: Setting upstream branch..." -ForegroundColor Yellow
    try {
        # Set upstream to GitHub
        git push -u origin $newBranch
        Write-Host "✅ Upstream set to origin/$newBranch" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Could not set upstream, trying to create branch on remote..." -ForegroundColor Yellow
        git push origin $newBranch
    }
    
    Write-Host "`n🎉 Branch Setup Complete!" -ForegroundColor Green
    Write-Host "📋 Summary:" -ForegroundColor Cyan
    Write-Host "  ✅ On branch: $newBranch" -ForegroundColor White
    Write-Host "  ✅ Upstream configured" -ForegroundColor White
    Write-Host "  ✅ Ready for VS Code push" -ForegroundColor White
    
    Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Go back to VS Code" -ForegroundColor White
    Write-Host "2. Refresh the Source Control panel (Ctrl+Shift+G)" -ForegroundColor White
    Write-Host "3. Try pushing again - it should work now!" -ForegroundColor White
    Write-Host "4. This will trigger automatic Heroku deployment" -ForegroundColor White
    
} catch {
    Write-Host "`n❌ Error fixing branch:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    Write-Host "`nManual fix options:" -ForegroundColor Yellow
    Write-Host "1. git checkout main" -ForegroundColor White
    Write-Host "2. git checkout -b main (if main doesn't exist)" -ForegroundColor White
    Write-Host "3. git push -u origin main" -ForegroundColor White
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
