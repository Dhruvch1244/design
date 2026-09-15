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

rem One-time migration: older releases kept the H2 database next to the jar, so upgrading to a
rem new extracted folder looked like data loss. The database now lives in %USERPROFILE%\.devtools-suite
rem regardless of which release folder you're running from — copy an old next-to-the-jar db over
rem on first run of a fresh version, then leave it alone (never overwrite an existing new-location db).
set NEWDB=%USERPROFILE%\.devtools-suite
if exist "devtools-history.mv.db" if not exist "%NEWDB%\devtools-history.mv.db" (
    echo Migrating existing history to %NEWDB% ...
    if not exist "%NEWDB%" mkdir "%NEWDB%"
    copy /y "devtools-history.mv.db" "%NEWDB%\devtools-history.mv.db" >nul
)

echo Starting Dev Tools Suite...
start "Dev Tools Suite" /min java -jar "%JAR%"

timeout /t 3 /nobreak >nul
start "" "%URL%"

echo Dev Tools Suite is running at %URL%
echo Close the "Dev Tools Suite" window to stop the server.
