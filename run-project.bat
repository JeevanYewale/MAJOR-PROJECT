@echo off
echo ========================================
echo    TravelStay - Airbnb Clone Setup
echo ========================================
echo.

echo 1. Installing dependencies...
call npm install

echo.
echo 2. Starting MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB service not running. Please start MongoDB manually.
    echo You can try: mongod --dbpath "C:\data\db"
    echo.
)

echo 3. Initializing database...
node init-db.js

echo.
echo 4. Starting TravelStay server...
echo Server will be available at: http://localhost:8080
echo Default login: admin/admin123
echo.
echo Press Ctrl+C to stop the server
echo.

node app.js
pause