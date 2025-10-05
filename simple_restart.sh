#!/bin/bash
cd /root/zhitoujianli/backend/get_jobs
pkill -f java
sleep 2
mvn clean package -DskipTests -q
nohup java -jar target/get_jobs-1.0-SNAPSHOT.jar > ../../logs/backend.log 2>&1 &
echo "后端重启完成，请等待几秒钟后测试"

