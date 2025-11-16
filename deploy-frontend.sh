#!/bin/bash

################################################################################
# 智投简历前端部署快捷脚本
# 源代码目录：/root/zhitoujianli/frontend
# 功能：完整SaaS应用（Router + Dashboard + Boss投递 + 用户隔离）
# 更新时间：2025-11-04
################################################################################

echo "🚀 启动前端部署..."
echo ""
echo "📦 源代码目录: /root/zhitoujianli/frontend"
echo "✨ 功能: 完整应用（登录/注册 + Dashboard + Boss投递 + 配置管理）"
echo ""
echo "🔎 进行部署前一致性检查..."

# 防御性检查：禁止存在会导致混乱的旧目录或误用目录
if [ -d "/root/zhitoujianli/frontend/build_backup" ] || [ -d "/root/zhitoujianli/frontend/backup" ] || [ -d "/root/zhitoujianli/PRODUCTION_FRONTEND" ] || [ -d "/root/zhitoujianli/website" ]; then
    echo "🚫 检测到以下可能导致版本回退/模板混乱的目录："
    [ -d "/root/zhitoujianli/frontend/build_backup" ] && echo " - /root/zhitoujianli/frontend/build_backup"
    [ -d "/root/zhitoujianli/frontend/backup" ] && echo " - /root/zhitoujianli/frontend/backup"
    [ -d "/root/zhitoujianli/PRODUCTION_FRONTEND" ] && echo " - /root/zhitoujianli/PRODUCTION_FRONTEND"
    [ -d "/root/zhitoujianli/website" ] && echo " - /root/zhitoujianli/website"
    echo ""
    echo "❗ 请按计划进行清理/封存后再部署。为避免错误部署，本次部署已被阻止。"
    echo "👉 参考 /frontend.plan.md 的 Step 1 和 Step 2。"
    exit 1
fi

echo "是否继续部署？(输入YES继续，其他键取消)"
read -r CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo "❌ 已取消部署"
    exit 1
fi

# 调用实际的部署脚本
/opt/zhitoujianli/scripts/build-and-deploy-frontend.sh

echo ""
echo "✅ 部署完成！请清除浏览器缓存（Ctrl + Shift + R）"
