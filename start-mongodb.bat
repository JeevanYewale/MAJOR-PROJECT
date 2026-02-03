@echo off
echo Starting MongoDB...
net start MongoDB
if %errorlevel% neq 0 (
    echo MongoDB service not found. Trying to start mongod directly...
    mongod --dbpath "C:\data\db"
)
pause