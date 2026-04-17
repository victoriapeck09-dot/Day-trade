@echo off
echo Starting server...
cd /d "%~dp0"
set PATH=C:\Program Files\nodejs;%PATH%
start "Day Trade Server" cmd /k "npx -y serve -l 3000"
echo.
echo Once you see "Accepting connections at http://localhost:3000"
echo Open your browser to: http://localhost:3000
echo.
pause