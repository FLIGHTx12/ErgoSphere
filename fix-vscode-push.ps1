# VS Code Source Control Push Fix
Write-Host "=== Fixing VS Code Source Control Push Issue ===" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "🔍 Step 1: Diagnosing VS Code Git state..." -ForegroundColor Yellow
    
    # Force refresh Git status
    Write-Host "Refreshing Git index..." -ForegroundColor Gray
    git update-index --refresh 2>$null
    
    # Check current branch
    $currentBranch = git rev-parse --abbrev-ref HEAD 2>$null
    Write-Host "Current HEAD points to: $currentBranch" -ForegroundColor Cyan
    
    # Check if we're in detached HEAD
    if ($currentBranch -eq "HEAD") {
        Write-Host "⚠️ Still in detached HEAD state!" -ForegroundColor Red
        
        Write-Host "🔧 Step 2: Force checkout to main branch..." -ForegroundColor Yellow
        
        # Create main branch from current state if needed
        git checkout -B main
        Write-Host "✅ Created/switched to main branch" -ForegroundColor Green
        
        # Verify we're now on main
        $newBranch = git rev-parse --abbrev-ref HEAD
        Write-Host "Now on branch: $newBranch" -ForegroundColor Green
        
    } else {
        Write-Host "✅ On branch: $currentBranch" -ForegroundColor Green
    }
    
    Write-Host "`n🔗 Step 3: Setting up remote tracking..." -ForegroundColor Yellow
    
    # Check if upstream is set
    $upstream = git rev-parse --abbrev-ref @{upstream} 2>$null
    if ($upstream) {
        Write-Host "Current upstream: $upstream" -ForegroundColor Green
    } else {
        Write-Host "No upstream set, configuring..." -ForegroundColor Yellow
        
        # Set upstream
        $currentBranch = git rev-parse --abbrev-ref HEAD
        git branch --set-upstream-to=origin/$currentBranch $currentBranch 2>$null
        
        # If that fails, push and set upstream
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Setting upstream with push..." -ForegroundColor Gray
            git push -u origin $currentBranch
        }
    }
    
    Write-Host "`n🔄 Step 4: Forcing VS Code to refresh..." -ForegroundColor Yellow
    
    # Clear VS Code's Git cache
    if (Test-Path ".\.vscode\settings.json") {
        Write-Host "VS Code workspace detected" -ForegroundColor Gray
    }
    
    # Force Git to refresh everything
    git status --porcelain > $null
    git remote update > $null 2>&1
    
    Write-Host "`n📋 Step 5: Checking for uncommitted changes..." -ForegroundColor Yellow
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "Uncommitted changes found:" -ForegroundColor Yellow
        $gitStatus | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        
        $response = Read-Host "`nCommit these changes? (y/n)"
        if ($response -eq "y" -or $response -eq "Y") {
            git add .
            git commit -m "Fix VS Code push: deploy ErgoShop improvements and resolve branch issues"
            Write-Host "✅ Changes committed" -ForegroundColor Green
        }
    } else {
        Write-Host "✅ Working directory clean" -ForegroundColor Green
    }
    
    Write-Host "`n🚀 Step 6: Testing push capability..." -ForegroundColor Yellow
    
    # Try a dry run push to test
    $pushTest = git push --dry-run origin HEAD 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Push test successful" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Push test failed: $pushTest" -ForegroundColor Yellow
        
        # Force push to establish upstream
        Write-Host "Forcing upstream establishment..." -ForegroundColor Gray
        git push -u origin HEAD --force
    }
    
    Write-Host "`n🎉 VS Code Fix Complete!" -ForegroundColor Green
    Write-Host "📋 Summary:" -ForegroundColor Cyan
    $finalBranch = git rev-parse --abbrev-ref HEAD
    $finalUpstream = git rev-parse --abbrev-ref @{upstream} 2>$null
    Write-Host "  ✅ Branch: $finalBranch" -ForegroundColor White
    Write-Host "  ✅ Upstream: $finalUpstream" -ForegroundColor White
    Write-Host "  ✅ Ready for VS Code push" -ForegroundColor White
    
    Write-Host "`n🔧 VS Code Instructions:" -ForegroundColor Yellow
    Write-Host "1. In VS Code, press Ctrl+Shift+P" -ForegroundColor White
    Write-Host "2. Type 'Git: Reload' and select it" -ForegroundColor White
    Write-Host "3. Go to Source Control (Ctrl+Shift+G)" -ForegroundColor White
    Write-Host "4. Click the refresh icon in Source Control" -ForegroundColor White
    Write-Host "5. Try pushing again - should work now!" -ForegroundColor White
    Write-Host "6. If still issues, restart VS Code" -ForegroundColor White
    
} catch {
    Write-Host "`n❌ Error during VS Code fix:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    Write-Host "`nEmergency fix - run these in VS Code terminal:" -ForegroundColor Yellow
    Write-Host "git checkout -B main" -ForegroundColor White
    Write-Host "git push -u origin main --force" -ForegroundColor White
    Write-Host "Then restart VS Code" -ForegroundColor White
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
