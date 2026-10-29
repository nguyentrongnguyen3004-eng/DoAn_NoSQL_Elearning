@echo off
chcp 65001 >nul
title EduPro - Khởi Động Giao Diện 4 Phần Mềm NoSQL
color 0b

:MENU
cls
echo ===============================================================================
echo        EDUPRO - TRÌNH KHỞI ĐỘNG NHANH 4 PHẦN MỀM GIAO DIỆN NoSQL
echo ===============================================================================
echo.
echo   [1] Mở MongoDB Compass      (Xem Database elearning_nosql, Collections)
echo   [2] Mở Redis Insight         (Xem Cache, Leaderboard ZSET, Token, Blacklist)
echo   [3] Mở DBeaver              (Giao diện GUI quản lý Apache Cassandra)
echo   [4] Mở Neo4j Desktop 2       (Giao diện quản lý Neo4j Graph Database)
echo   [5] Mở Neo4j Web Browser     (Mở http://localhost:7474 trên trình duyệt)
echo   -----------------------------------------------------------------------------
echo   [A] MỞ TẤT CẢ 4 PHẦN MỀM CÙNG LÚC (Sẵn sàng trước giờ báo cáo)
echo   [0] Thoát
echo ===============================================================================
echo.
set /p choice="Nhập lựa chọn của bạn (1-5, A, 0): "

if /i "%choice%"=="1" goto MONGODB
if /i "%choice%"=="2" goto REDIS
if /i "%choice%"=="3" goto DBEAVER
if /i "%choice%"=="4" goto NEO4J
if /i "%choice%"=="5" goto NEO4J_WEB
if /i "%choice%"=="A" goto OPEN_ALL
if /i "%choice%"=="0" goto EXIT
goto MENU

:MONGODB
echo.
echo Đang mở MongoDB Compass...
start "" "C:\Users\ACER\AppData\Local\MongoDBCompass\MongoDBCompass.exe"
pause
goto MENU

:REDIS
echo.
echo Đang mở Redis Insight...
start "" "C:\Users\ACER\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Redis Insight.lnk"
pause
goto MENU

:DBEAVER
echo.
echo Đang mở DBeaver (Giao diện Apache Cassandra)...
start "" "C:\Users\ACER\AppData\Local\DBeaver\dbeaver.exe"
pause
goto MENU

:NEO4J
echo.
echo Đang mở Neo4j Desktop 2...
start "" "C:\Users\ACER\AppData\Local\Programs\Neo4j Desktop 2\Neo4j Desktop 2.exe"
pause
goto MENU

:NEO4J_WEB
echo.
echo Đang mở Neo4j Web Browser (http://localhost:7474)...
start http://localhost:7474
pause
goto MENU

:OPEN_ALL
echo.
echo =======================================================
echo   ĐANG KHỞI CHẠY TẤT CẢ 4 PHẦN MỀM GIAO DIỆN...
echo =======================================================
start "" "C:\Users\ACER\AppData\Local\MongoDBCompass\MongoDBCompass.exe"
start "" "C:\Users\ACER\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Redis Insight.lnk"
start "" "C:\Users\ACER\AppData\Local\DBeaver\dbeaver.exe"
start "" "C:\Users\ACER\AppData\Local\Programs\Neo4j Desktop 2\Neo4j Desktop 2.exe"
echo Đã khởi chạy xong cả 4 phần mềm!
pause
goto MENU

:EXIT
exit
