@echo off
setlocal
cd /d "%~dp0"

set JAR=backend\target\devtools-suite.jar
set URL=http://localhost:8383

if not exist "%JAR%" (
    echo Could not find %JAR% — run build.bat first.
    pause
    exit /b 1
)

echo Starting Dev Tools Suite...
start "Dev Tools Suite" /min java -jar "%JAR%"

timeout /t 3 /nobreak >nul
start "" "%URL%"

echo Dev Tools Suite is running at %URL%
echo Close the "Dev Tools Suite" window to stop the server.
