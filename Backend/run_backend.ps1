Set-Location $PSScriptRoot
Write-Host "Starting Cropling Backend Server..." -ForegroundColor Green
& ".\.venv\Scripts\python.exe" "app.py"
