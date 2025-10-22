#!/bin/bash

# Boss二维码修复部署脚本
# 修复内容: 添加二维码截图逻辑，延长登录超时时间

set -e

echo "========================================="
echo "Boss二维码修复部署"
echo "========================================="
echo ""

# 1. 停止当前服务
echo "[1/6] 停止当前Boss投递程序..."
pkill -f "IsolatedBossRunner" || true
sleep 2

echo "[2/6] 停止后端服务..."
systemctl stop zhitoujianli-backend || true
sleep 2

# 2. 备份当前JAR
echo "[3/6] 备份当前JAR文件..."
BACKUP_FILE="/opt/zhitoujianli/backend/get_jobs-v2.0.1.jar.backup.qrcode.$(date +%Y%m%d_%H%M%S)"
cp /opt/zhitoujianli/backend/get_jobs-v2.0.1.jar "$BACKUP_FILE"
echo "   备份保存到: $BACKUP_FILE"

# 3. 编译项目
echo "[4/6] 编译项目..."
cd /root/zhitoujianli/backend/get_jobs
mvn clean package -DskipTests -q
if [ $? -ne 0 ]; then
    echo "❌ 编译失败！恢复备份..."
    cp "$BACKUP_FILE" /opt/zhitoujianli/backend/get_jobs-v2.0.1.jar
    systemctl start zhitoujianli-backend
    exit 1
fi

echo "   ✅ 编译成功"

# 4. 部署新JAR
echo "[5/6] 部署新版本..."
cp target/get_jobs-v2.0.1.jar /opt/zhitoujianli/backend/
echo "   ✅ JAR文件已更新"

# 5. 启动服务
echo "[6/6] 启动后端服务..."
systemctl start zhitoujianli-backend

# 6. 等待服务启动
echo ""
echo "等待服务启动..."
sleep 15

# 7. 验证服务
echo ""
echo "========================================="
echo "验证服务状态"
echo "========================================="
echo ""

# 检查systemd服务状态
echo "[检查1] Systemd服务状态:"
systemctl status zhitoujianli-backend --no-pager | head -10

# 检查API可用性
echo ""
echo "[检查2] API可用性测试:"
API_STATUS=$(curl -s http://localhost:8080/api/boss/login/status 2>&1 || echo "API调用失败")
echo "$API_STATUS"

echo ""
echo "========================================="
echo "部署完成！"
echo "========================================="
echo ""
echo "📝 修复内容:"
echo "1. ✅ 添加二维码截图逻辑到Boss.scanLogin()方法"
echo "2. ✅ 延长登录超时时间从10分钟到15分钟"
echo "3. ✅ 登录成功后更新状态文件为success"
echo "4. ✅ 添加二维码容器选择器常量"
echo ""
echo "🔍 验证步骤:"
echo "1. 访问 https://zhitoujianli.com"
echo "2. 进入Boss投递页面"
echo "3. 点击\"开始投递\"按钮"
echo "4. 检查是否显示二维码"
echo "5. 使用Boss直聘App扫码登录"
echo ""
echo "📊 备份文件: $BACKUP_FILE"
echo ""



