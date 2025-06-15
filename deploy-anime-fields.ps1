# Deploy script for Heroku with anime fields migration
Write-Host "Deploying to Heroku with anime fields migration..." -ForegroundColor Cyan

# Ensure we're logged in to Heroku
$loggedIn = $false
try {
    $herokuAcct = heroku whoami
    if ($herokuAcct) {
        Write-Host "✅ Logged in to Heroku as: $herokuAcct" -ForegroundColor Green
        $loggedIn = $true
    }
} catch {
    Write-Host "❌ Not logged in to Heroku" -ForegroundColor Red
}

if (-not $loggedIn) {
    Write-Host "⚠️ Please log in to Heroku first with 'heroku login'" -ForegroundColor Yellow
    exit 1
}

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check Git status
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️ You have uncommitted changes. Commit them first:" -ForegroundColor Yellow
    git status
    
    $commitAnswer = Read-Host "Do you want to commit all changes now? (y/n)"
    if ($commitAnswer -eq "y") {
        $commitMessage = Read-Host "Enter commit message"
        git add .
        git commit -m $commitMessage
        Write-Host "✅ Changes committed" -ForegroundColor Green
    } else {
        Write-Host "❌ Deployment aborted. Please commit your changes manually." -ForegroundColor Red
        exit 1
    }
}

# Push to Heroku
Write-Host "🚀 Pushing to Heroku master..." -ForegroundColor Cyan
git push heroku main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to Heroku" -ForegroundColor Green
    
    # Check if migration was successful
    Write-Host "🔍 Checking Heroku logs for migration results..." -ForegroundColor Cyan
    heroku logs --tail --source app --lines 50
    
    Write-Host "✅ Deployment completed!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to push to Heroku" -ForegroundColor Red
    exit 1
}
