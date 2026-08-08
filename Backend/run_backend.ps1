Set-Location $PSScriptRoot
Write-Host "Starting Smart Crop Advisory Platform Backend Server..." -ForegroundColor Green
& ".\.venv\Scripts\python.exe" "app.py"
