#!/bin/bash

echo "========================================"
echo "🔄 强制刷新前端代码"
echo "========================================"
echo ""

# 停止前端服务
echo "🛑 停止前端服务..."
pkill -f "npm.*start" 2>/dev/null || echo "前端服务已停止"
pkill -f "react-scripts" 2>/dev/null || echo "React服务已停止"
sleep 3

# 清理缓存
echo "🧹 清理前端缓存..."
cd /root/zhitoujianli/frontend
rm -rf node_modules/.cache 2>/dev/null || echo "缓存已清理"
rm -rf build 2>/dev/null || echo "构建目录已清理"

# 重新安装依赖（如果需要）
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "重新安装依赖..."
    npm install
fi

# 重新启动前端服务
echo "🚀 重新启动前端服务..."
cd /root/zhitoujianli/frontend
npm start &
FRONTEND_PID=$!

# 等待服务启动
echo "⏳ 等待前端服务启动..."
sleep 15

# 检查服务状态
echo "🔍 检查服务状态..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://115.190.182.95:3000/ 2>/dev/null || echo "000")
ROUTE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://115.190.182.95:3000/resume 2>/dev/null || echo "000")

echo ""
echo "========================================"
echo "📊 服务状态检查"
echo "========================================"
echo "前端服务: HTTP $FRONTEND_STATUS"
echo "新路由: HTTP $ROUTE_STATUS"
echo ""

if [ "$FRONTEND_STATUS" = "200" ] && [ "$ROUTE_STATUS" = "200" ]; then
    echo "✅ 服务启动成功！"
    echo ""
    echo "🎯 请按以下步骤操作："
    echo "1. 在浏览器中访问: http://115.190.182.95:3000/resume"
    echo "2. 按 Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac) 强制刷新"
    echo "3. 如果还有问题，请清除浏览器缓存"
    echo ""
    echo "🔧 清除浏览器缓存的方法："
    echo "   - 按 F12 打开开发者工具"
    echo "   - 右键点击刷新按钮"
    echo "   - 选择'清空缓存并硬性重新加载'"
else
    echo "❌ 服务启动失败，请检查错误信息"
fi

echo ""
echo "========================================"
