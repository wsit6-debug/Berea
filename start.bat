@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ============================================================
echo           Launching Berea Theological Workspace
echo ============================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js not detected. Running installer...
    call install.bat
)

if not exist "node_modules\" (
    echo [*] First-time setup detected. Installing dependencies...
    call npm install
)

start "" http://localhost:5173

call npm run dev
pause
