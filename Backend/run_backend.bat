@echo off
echo Starting Smart Crop Advisory Platform Backend Server...
cd /d "%~dp0"
.venv\Scripts\python.exe app.py
pause
