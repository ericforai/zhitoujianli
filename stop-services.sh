#!/bin/bash

# 停止简历管理服务脚本
#
# @author ZhiTouJianLi Team
# @since 2025-01-03

set -e

echo "🛑 停止简历管理服务..."

# 停止后端服务
if [ -f "/root/zhitoujianli/logs/backend.pid" ]; then
    BACKEND_PID=$(cat /root/zhitoujianli/logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        echo "停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        sleep 3
        if ps -p $BACKEND_PID > /dev/null; then
            echo "强制停止后端服务..."
            kill -9 $BACKEND_PID
        fi
        echo "✅ 后端服务已停止"
    else
        echo "⚠️ 后端服务进程不存在"
    fi
    rm -f /root/zhitoujianli/logs/backend.pid
else
    echo "⚠️ 后端服务PID文件不存在"
fi

# 停止前端服务
if [ -f "/root/zhitoujianli/logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat /root/zhitoujianli/logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null; then
        echo "停止前端服务 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        sleep 3
        if ps -p $FRONTEND_PID > /dev/null; then
            echo "强制停止前端服务..."
            kill -9 $FRONTEND_PID
        fi
        echo "✅ 前端服务已停止"
    else
        echo "⚠️ 前端服务进程不存在"
    fi
    rm -f /root/zhitoujianli/logs/frontend.pid
else
    echo "⚠️ 前端服务PID文件不存在"
fi

# 清理端口占用
echo "🧹 清理端口占用..."
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo ""
echo "🎉 所有服务已停止！"
echo ""
echo "📝 如需重新启动，请运行："
echo "  ./deploy-resume-management.sh"




