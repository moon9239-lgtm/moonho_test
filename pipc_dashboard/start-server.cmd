@echo off
cd /d "%~dp0"
if "%PORT%"=="" set PORT=5190
npm.cmd run serve
pause
