@echo off
chcp 65001 >nul
echo ==============================================================================
echo   KHOI DONG REDIS SERVER NATIVE (PORT 6379)
echo ==============================================================================
cd /d "D:\RedisLab"
call start-redis.bat
