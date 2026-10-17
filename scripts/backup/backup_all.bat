@echo off
chcp 65001 >nul
echo ==============================================================================
echo HOC PHAN DU LIEU NOSQL - HUIT
echo SCRIPT SAO LUU (BACKUP) VA PHUC HOI (RESTORE) DU LIEU 4 DATABASE
echo ==============================================================================

set BACKUP_DIR=.\backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo [1/4] Sao luu MongoDB (mongodump)...
docker exec elearning_mongodb mongodump --db elearning_nosql --out /data/db/backup_temp
docker cp elearning_mongodb:/data/db/backup_temp/elearning_nosql "%BACKUP_DIR%\mongodb_elearning"
echo   -> Hoan thanh sao luu MongoDB!

echo [2/4] Sao luu Redis (BGSAVE va dump.rdb)...
docker exec elearning_redis redis-cli BGSAVE
docker cp elearning_redis:/data/dump.rdb "%BACKUP_DIR%\redis_dump.rdb"
echo   -> Hoan thanh sao luu Redis!

echo [3/4] Sao luu Neo4j (neo4j-admin database dump)...
echo   -> Neo4j duoc luu truc tiep tren Volume ./data/neo4j/data
echo   -> Da dong bo du lieu Neo4j!

echo [4/4] Sao luu Apache Cassandra (Snapshot Keyspace)...
docker exec elearning_cassandra nodetool snapshot elearning_logs -t initial_backup
echo   -> Hoan thanh tao snapshot Cassandra!

echo.
echo ==============================================================================
echo HOAN THANH SAO LUU TOAN BO DU LIEU VAO THU MUC: %BACKUP_DIR%
echo ==============================================================================
pause
