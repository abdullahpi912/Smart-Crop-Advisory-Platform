@echo off
echo Starting Cropling Backend Server...
cd /d "%~dp0"
.venv\Scripts\python.exe app.py
pause
