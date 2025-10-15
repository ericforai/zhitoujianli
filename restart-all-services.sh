#!/bin/bash

echo "========================================="
echo "智投简历服务重启脚本"
echo "========================================="

# 停止所有服务
echo "正在停止服务..."
pkill -f "react-scripts start"
pkill -f "spring-boot:run"
sleep 3

# 启动后端服务
echo "正在启动后端服务..."
cd /root/zhitoujianli/backend/get_jobs
nohup mvn spring-boot:run > /tmp/backend.log 2>&1 &
echo "后端服务启动中...（预计需要 60 秒）"

# 等待后端启动
sleep 60

# 检查后端状态
echo "检查后端服务状态..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/status)
if [ "$BACKEND_STATUS" == "200" ] || [ "$BACKEND_STATUS" == "302" ]; then
    echo "✅ 后端服务启动成功！"
else
    echo "⚠️  后端服务可能还在启动中...（状态码: $BACKEND_STATUS）"
    echo "请查看日志: tail -f /tmp/backend.log"
fi

# 启动前端服务
echo "正在启动前端服务..."
cd /root/zhitoujianli/frontend
nohup npm start > /tmp/frontend.log 2>&1 &
echo "前端服务启动中...（预计需要 20 秒）"

# 等待前端启动
sleep 20

# 检查前端状态
echo "检查前端服务状态..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_STATUS" == "200" ]; then
    echo "✅ 前端服务启动成功！"
else
    echo "⚠️  前端服务可能还在启动中...（状态码: $FRONTEND_STATUS）"
    echo "请查看日志: tail -f /tmp/frontend.log"
fi

echo ""
echo "========================================="
echo "服务启动完成！"
echo "========================================="
echo "前端地址: http://localhost:3000"
echo "前端简历管理: http://localhost:3000/resume-delivery"
echo "后端API: http://localhost:8080"
echo ""
echo "查看日志："
echo "  后端: tail -f /tmp/backend.log"
echo "  前端: tail -f /tmp/frontend.log"
echo ""
echo "检查服务状态："
echo "  后端: curl http://localhost:8080/api/status"
echo "  前端: curl http://localhost:3000"
echo "========================================="



