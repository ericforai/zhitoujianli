#!/bin/bash
# QQ邮箱快速配置脚本

echo "=========================================="
echo "  QQ邮箱SMTP快速配置脚本"
echo "=========================================="
echo ""

# 请在这里填写您的信息
QQ_EMAIL="请填写您的QQ邮箱"           # 例如：123456789@qq.com
SMTP_CODE="请填写您的16位授权码"      # 例如：abcdefghijklmnop

echo "当前配置："
echo "邮箱: $QQ_EMAIL"
echo "授权码: ${SMTP_CODE:0:4}****${SMTP_CODE: -4}"
echo ""

# 确认是否继续
read -p "确认配置信息正确？(y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "❌ 已取消配置"
    exit 1
fi

# 执行配置
echo "🔄 正在配置邮件服务..."
sed -i "s/请填写您的QQ邮箱/$QQ_EMAIL/g" /root/zhitoujianli/backend/get_jobs/src/main/resources/.env
sed -i "s/请填写QQ邮箱SMTP授权码/$SMTP_CODE/g" /root/zhitoujianli/backend/get_jobs/src/main/resources/.env

echo "✅ 配置已完成"
echo ""
echo "📝 验证配置..."
cat /root/zhitoujianli/backend/get_jobs/src/main/resources/.env | grep MAIL | sed 's/PASSWORD=.*/PASSWORD=***/'
echo ""
echo "⚠️ 请重启后端服务使配置生效："
echo "   pkill -f 'get_jobs-v2.0.1.jar'"
echo "   cd /root/zhitoujianli/backend/get_jobs"
echo "   nohup java -jar target/get_jobs-v2.0.1.jar --spring.profiles.active=production > backend.log 2>&1 &"


