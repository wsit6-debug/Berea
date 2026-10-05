@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ============================================================
echo           Berea - One-Click Automatic Installer
echo ============================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js was not detected. Installing Node.js via winget...
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    if %errorlevel% neq 0 (
        echo [X] Winget installation failed. Please install Node.js manually from: https://nodejs.org/
        pause
        exit /b 1
    )
    echo [*] Refreshing environment variables...
    call refreshenv >nul 2>nul
)

echo [*] Installing project dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [X] npm install encountered an error.
    pause
    exit /b 1
)

echo.
echo [*] Setting up Ollama and local AI model...
call node scripts\ensure-ollama.mjs

echo.
echo ============================================================
echo [OK] Berea has been installed successfully!
echo Run start.bat anytime to launch Berea.
echo ============================================================
pause
