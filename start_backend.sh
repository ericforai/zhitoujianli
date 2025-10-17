#!/bin/bash
set -e

echo "正在重启后端服务..."

# 停止现有的Java进程
echo "停止现有后端服务..."
pkill -f get_jobs || true
pkill -f WebApplication || true

# 等待进程完全停止
sleep 3

# 进入后端目录
cd /root/zhitoujianli/backend/get_jobs

# 检查JAR文件
if [ -f "target/get_jobs-v2.0.1.jar" ]; then
    echo "使用现有JAR文件: get_jobs-v2.0.1.jar"
    JAR_FILE="target/get_jobs-v2.0.1.jar"
elif [ -f "target/get_jobs-1.0-SNAPSHOT.jar" ]; then
    echo "使用现有JAR文件: get_jobs-1.0-SNAPSHOT.jar"
    JAR_FILE="target/get_jobs-1.0-SNAPSHOT.jar"
else
    echo "重新编译项目..."
    mvn clean package -DskipTests -q
    JAR_FILE="target/get_jobs-1.0-SNAPSHOT.jar"
fi

# 启动后端服务
echo "启动后端服务..."
nohup java -jar "$JAR_FILE" > ../../logs/backend.log 2>&1 &
BACKEND_PID=$!

echo "后端服务已启动，PID: $BACKEND_PID"
echo "日志文件: /root/zhitoujianli/logs/backend.log"
echo "服务状态: http://localhost:8080/status"

# 等待服务启动
sleep 8

# 检查服务是否启动成功
echo "检查服务状态..."
if curl -s http://localhost:8080/status > /dev/null; then
    echo "✅ 后端服务启动成功！"
else
    echo "❌ 后端服务启动失败，请检查日志"
    echo "最后10行日志："
    tail -10 /root/zhitoujianli/logs/backend.log
fi

