#!/bin/bash

# 三层访问权限控制系统 - 停止服务脚本
# 使用方法: ./stop_dev.sh

echo "=========================================="
echo "三层访问权限控制系统 - 停止服务"
echo "=========================================="

# 停止通过PID文件记录的服务
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "🛑 停止前端服务 (PID: $FRONTEND_PID)"
        kill $FRONTEND_PID
    fi
    rm -f logs/frontend.pid
fi

if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "🛑 停止后端服务 (PID: $BACKEND_PID)"
        kill $BACKEND_PID
    fi
    rm -f logs/backend.pid
fi

# 强制停止占用端口的进程
echo "🔍 检查并停止占用端口的进程..."

# 停止占用3000端口的进程
FRONTEND_PIDS=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "停止占用3000端口的进程: $FRONTEND_PIDS"
    echo $FRONTEND_PIDS | xargs kill -9 2>/dev/null
fi

# 停止占用8080端口的进程
BACKEND_PIDS=$(lsof -ti:8080 2>/dev/null)
if [ ! -z "$BACKEND_PIDS" ]; then
    echo "停止占用8080端口的进程: $BACKEND_PIDS"
    echo $BACKEND_PIDS | xargs kill -9 2>/dev/null
fi

# 等待进程完全停止
sleep 2

# 验证端口是否已释放
if ! lsof -ti:3000 >/dev/null 2>&1; then
    echo "✅ 端口3000已释放"
else
    echo "⚠️  端口3000仍被占用"
fi

if ! lsof -ti:8080 >/dev/null 2>&1; then
    echo "✅ 端口8080已释放"
else
    echo "⚠️  端口8080仍被占用"
fi

echo ""
echo "=========================================="
echo "🏁 服务停止完成"
echo "=========================================="