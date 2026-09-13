@echo off
setlocal
cd /d "%~dp0"

echo === Building frontend ===
cd frontend
call npm install || goto :error
call npm run build || goto :error
cd ..

echo === Copying frontend into backend static resources ===
if exist backend\src\main\resources\static rmdir /s /q backend\src\main\resources\static
mkdir backend\src\main\resources\static
xcopy /E /I /Y frontend\dist\* backend\src\main\resources\static\ >nul || goto :error

echo === Building backend jar ===
cd backend
call mvn -q clean package || goto :error
cd ..

echo.
echo Build complete: backend\target\devtools-suite.jar
echo Run it with run.bat
goto :eof

:error
echo.
echo Build failed.
exit /b 1
