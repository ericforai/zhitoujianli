#!/bin/bash

# 简历管理功能前后端分离重构 - 部署脚本
#
# @author ZhiTouJianLi Team
# @since 2025-01-03

set -e

echo "🚀 开始部署简历管理功能前后端分离重构..."

# 检查Node.js版本
echo "📋 检查Node.js版本..."
node_version=$(node --version)
echo "Node.js版本: $node_version"

# 检查Java版本
echo "📋 检查Java版本..."
java_version=$(java --version 2>&1 | head -n 1)
echo "Java版本: $java_version"

# 进入前端目录
echo "📦 安装前端依赖..."
cd /root/zhitoujianli/frontend

# 安装前端依赖
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖包..."
    npm install
else
    echo "前端依赖已存在，跳过安装"
fi

# 安装新的依赖包
echo "安装react-dropzone..."
npm install react-dropzone@^14.2.3

# 构建前端
echo "🔨 构建前端项目..."
npm run build

# 进入后端目录
echo "📦 编译后端项目..."
cd /root/zhitoujianli/backend/get_jobs

# 编译后端项目
echo "使用Maven编译后端项目..."
mvn clean compile

# 检查编译结果
if [ $? -eq 0 ]; then
    echo "✅ 后端编译成功"
else
    echo "❌ 后端编译失败"
    exit 1
fi

# 启动后端服务
echo "🚀 启动后端服务..."
cd /root/zhitoujianli/backend/get_jobs
nohup mvn spring-boot:run > /root/zhitoujianli/logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "后端服务PID: $BACKEND_PID"

# 等待后端服务启动
echo "⏳ 等待后端服务启动..."
sleep 10

# 检查后端服务状态
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ 后端服务启动成功"
else
    echo "⚠️ 后端服务可能未完全启动，请检查日志"
fi

# 启动前端服务
echo "🚀 启动前端服务..."
cd /root/zhitoujianli/frontend
nohup npm start > /root/zhitoujianli/logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端服务PID: $FRONTEND_PID"

# 等待前端服务启动
echo "⏳ 等待前端服务启动..."
sleep 15

# 检查前端服务状态
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 前端服务启动成功"
else
    echo "⚠️ 前端服务可能未完全启动，请检查日志"
fi

# 保存PID到文件
echo "$BACKEND_PID" > /root/zhitoujianli/logs/backend.pid
echo "$FRONTEND_PID" > /root/zhitoujianli/logs/frontend.pid

echo ""
echo "🎉 部署完成！"
echo ""
echo "📊 服务状态："
echo "  后端服务: http://localhost:8080 (PID: $BACKEND_PID)"
echo "  前端服务: http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "📋 访问地址："
echo "  主页: http://localhost:3000"
echo "  简历投递: http://localhost:3000/resume-delivery"
echo "  后端API: http://localhost:8080/api"
echo ""
echo "📝 日志文件："
echo "  后端日志: /root/zhitoujianli/logs/backend.log"
echo "  前端日志: /root/zhitoujianli/logs/frontend.log"
echo ""
echo "🛠️ 管理命令："
echo "  停止服务: ./stop-services.sh"
echo "  重启服务: ./restart-services.sh"
echo "  查看日志: tail -f /root/zhitoujianli/logs/backend.log"
echo ""
echo "✨ 新功能特性："
echo "  ✅ 前后端分离架构"
echo "  ✅ RESTful API接口"
echo "  ✅ 实时WebSocket通信"
echo "  ✅ 完整的错误处理"
echo "  ✅ 文件上传安全验证"
echo "  ✅ 响应式UI设计"
echo "  ✅ TypeScript类型安全"
echo ""
echo "🔧 使用说明："
echo "  1. 访问 http://localhost:3000/resume-delivery"
echo "  2. 在'简历管理'标签页上传简历"
echo "  3. 在'投递配置'标签页配置参数"
echo "  4. 在'自动投递'标签页启动投递"
echo "  5. 实时监控投递状态和结果"
echo ""
echo "🎯 项目重构完成！现在可以享受全新的前后端分离体验了！"




