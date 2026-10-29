@echo off
chcp 65001 >nul
echo ==============================================================================
echo   KHOI DONG APACHE CASSANDRA SERVER NATIVE (PORT 9042)
echo   Java 8 Runtime: C:\Program Files\Eclipse Adoptium\jre-8.0.504.1-hotspot
echo ==============================================================================
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jre-8.0.504.1-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "D:\TRONGNGUYEN_HK7\NoSQL\Chuong2_Cassandra\apache-cassandra-3.11.17\bin"
cassandra.bat -f
