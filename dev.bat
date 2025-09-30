@echo off
title Portfolio Dev Manager
color 0A

:MENU
cls
echo ===============================
echo   🚀 Portfolio Project Manager
echo ===============================
echo 1. Start Backend + Frontend
echo 2. Stop Backend + Frontend
echo 3. Exit
echo ===============================
set /p choice="Select an option (1-3): "

if "%choice%"=="1" (
    powershell -ExecutionPolicy Bypass -File "%~dp0dev.ps1" start
    pause
    goto MENU
)

if "%choice%"=="2" (
    powershell -ExecutionPolicy Bypass -File "%~dp0dev.ps1" stop
    pause
    goto MENU
)

if "%choice%"=="3" (
    exit
)

echo Invalid choice, try again.
pause
goto MENU
