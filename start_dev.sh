#!/bin/bash

# 三层访问权限控制系统 - 开发环境启动脚本
# 使用方法: ./start_dev.sh

echo "=========================================="
echo "三层访问权限控制系统 - 开发环境启动"
echo "=========================================="

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js 18+"
    exit 1
fi

# 检查Java环境
if ! command -v java &> /dev/null; then
    echo "❌ Java未安装，请先安装Java 17+"
    exit 1
fi

# 检查Maven环境
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven未安装，请先安装Maven 3.8+"
    exit 1
fi

echo "✅ 环境检查通过"

# 创建日志目录
mkdir -p logs

# 启动后端服务
echo "🚀 启动后端服务 (Spring Boot)..."
cd get_jobs
nohup mvn spring-boot:run > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "后端服务 PID: $BACKEND_PID"

# 等待后端服务启动
echo "⏳ 等待后端服务启动..."
for i in {1..30}; do
    if curl -s http://localhost:8080 > /dev/null 2>&1; then
        echo "✅ 后端服务启动成功 (http://localhost:8080)"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ 后端服务启动超时"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    sleep 2
done

# 返回根目录
cd ..

# 启动前端服务
echo "🚀 启动前端服务 (React)..."
nohup npm start > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端服务 PID: $FRONTEND_PID"

# 等待前端服务启动
echo "⏳ 等待前端服务启动..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ 前端服务启动成功 (http://localhost:3000)"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ 前端服务启动超时"
        kill $FRONTEND_PID 2>/dev/null
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    sleep 2
done

# 保存PID到文件
echo $BACKEND_PID > logs/backend.pid
echo $FRONTEND_PID > logs/frontend.pid

echo ""
echo "=========================================="
echo "🎉 系统启动完成！"
echo "=========================================="
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:8080"
echo ""
echo "访问层级："
echo "1. 首页 (公开): http://localhost:3000/"
echo "2. 博客 (公开): http://localhost:4321/blog/"
echo "3. 后台管理 (需要登录): http://localhost:8080/"
echo ""
echo "日志文件："
echo "- 前端日志: logs/frontend.log"
echo "- 后端日志: logs/backend.log"
echo ""
echo "停止服务: ./stop_dev.sh"
echo "=========================================="

# 等待用户输入以保持脚本运行
echo "按 Ctrl+C 停止所有服务"
trap 'echo "停止服务..."; kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; exit' INT
wait