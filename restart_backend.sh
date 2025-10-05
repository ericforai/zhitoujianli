#!/bin/bash

echo "正在重启后端服务..."

# 停止现有的Java进程
echo "停止现有后端服务..."
pkill -f "java.*get_jobs"
pkill -f "WebApplication"

# 等待进程完全停止
sleep 3

# 进入后端目录
cd /root/zhitoujianli/backend/get_jobs

# 重新编译项目
echo "重新编译项目..."
mvn clean compile -q

# 打包项目
echo "打包项目..."
mvn package -DskipTests -q

# 重启后端服务
echo "启动后端服务..."
nohup java -jar target/get_jobs-1.0-SNAPSHOT.jar > ../../logs/backend.log 2>&1 &

# 等待服务启动
sleep 8

echo "后端服务重启完成！"
echo "日志文件: /root/zhitoujianli/logs/backend.log"
echo "服务状态: http://localhost:8080/status"

# 检查服务是否启动成功
sleep 2
curl -s http://localhost:8080/status > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ 后端服务启动成功！"
else
    echo "❌ 后端服务启动失败，请检查日志"
fi
