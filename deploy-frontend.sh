#!/bin/bash

################################################################################
# 智投简历前端部署快捷脚本
# 放置在项目根目录，方便快速调用
# 更新时间：2025-11-04
################################################################################

echo "🚀 启动前端部署..."
echo ""

# ⚠️  警告检查
echo "⚠️  警告：即将部署【老UI】版本！"
echo ""
echo "当前线上是【新UI】：纸飞机Logo + 机器人Banner"
echo "源代码中是【老UI】：SVG图标 + 纯文字Banner"
echo ""
echo "是否继续部署老UI？(输入YES继续，其他键取消)"
read -r CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo "❌ 已取消部署"
    echo ""
    echo "💡 如需恢复或检查新UI，请运行："
    echo "   /opt/zhitoujianli/scripts/protect-ui.sh"
    exit 1
fi

# 调用实际的部署脚本
/opt/zhitoujianli/scripts/build-and-deploy-frontend.sh

echo ""
echo "✅ 部署完成！请清除浏览器缓存（Ctrl + Shift + R）"

