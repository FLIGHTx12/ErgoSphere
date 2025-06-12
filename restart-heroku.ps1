# Heroku App Restart and Status Check Script
Write-Host "=== Heroku App Recovery After Outage ===" -ForegroundColor Cyan
Write-Host ""

# Check if logged into Heroku
Write-Host "1. Checking Heroku authentication..." -ForegroundColor Yellow
try {
    $herokuUser = heroku auth:whoami 2>$null
    if ($herokuUser) {
        Write-Host "✅ Logged in as: $herokuUser" -ForegroundColor Green
    } else {
        Write-Host "❌ Not logged into Heroku. Please run: heroku login" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Heroku CLI not found or not logged in" -ForegroundColor Red
    Write-Host "Please install Heroku CLI and run: heroku login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "2. Checking current app status..." -ForegroundColor Yellow
heroku ps --app ergosphere

Write-Host ""
Write-Host "3. Restarting all dynos..." -ForegroundColor Yellow
heroku restart --app ergosphere

Write-Host ""
Write-Host "4. Checking app status after restart..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
heroku ps --app ergosphere

Write-Host ""
Write-Host "5. Checking recent logs..." -ForegroundColor Yellow
heroku logs --tail --num 20 --app ergosphere

Write-Host ""
Write-Host "6. Testing app URL..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://ergosphere.herokuapp.com" -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ App is responding successfully!" -ForegroundColor Green
        Write-Host "🌐 Your app is live at: https://ergosphere.herokuapp.com" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ App responded with status code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ App is not responding: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Check logs above for more details" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Recovery attempt complete!" -ForegroundColor Green
