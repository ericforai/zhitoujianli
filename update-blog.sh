#!/bin/bash
# 博客内容更新脚本
# 当博客内容更新后，运行此脚本重新构建

set -e

echo "========================================="
echo "  智投简历博客 - 内容更新脚本"
echo "========================================="
echo ""

# 进入博客目录
cd /root/zhitoujianli/blog/zhitoujianli-blog

echo "[1/3] 清理旧的构建文件..."
rm -rf dist/
echo "✓ 清理完成"
echo ""

echo "[2/3] 重新构建博客..."
NODE_ENV=production npm run build
echo "✓ 构建完成"
echo ""

echo "[3/3] 验证构建结果..."
if [ -f "dist/index.html" ]; then
    echo "✓ 构建成功！"
    echo ""

    # 统计页面数量
    PAGE_COUNT=$(find dist -name "*.html" | wc -l)
    echo "📊 构建统计:"
    echo "  - HTML页面: $PAGE_COUNT 个"
    echo "  - 静态文件目录: dist/"
    echo ""

    # 检查Nginx配置
    if nginx -t > /dev/null 2>&1; then
        echo "✓ Nginx配置正常"
    else
        echo "⚠️  Nginx配置有误，请检查"
    fi

    echo ""
    echo "========================================="
    echo "  更新完成！"
    echo "========================================="
    echo ""
    echo "📝 访问地址:"
    echo "  - https://blog.zhitoujianli.com"
    echo "  - https://www.zhitoujianli.com/blog/ (自动重定向)"
    echo ""
    echo "💡 提示:"
    echo "  - Nginx会自动服务新的静态文件"
    echo "  - 无需重启Nginx服务"
    echo "  - 浏览器可能需要清除缓存查看更新"
    echo ""
else
    echo "❌ 构建失败！请检查错误信息"
    exit 1
fi

