#!/bin/bash

# Boss投递程序AI服务修复部署脚本
# 生成时间: 2025-10-21
# 修复内容: Dotenv依赖问题 + DeepSeek API密钥配置

set -e  # 遇到错误立即退出

echo "========================================="
echo "Boss投递程序AI服务修复部署"
echo "========================================="
echo ""

# 1. 停止当前服务
echo "[1/8] 停止当前Boss投递程序..."
pkill -f "IsolatedBossRunner" || true
sleep 2

echo "[2/8] 停止后端服务..."
systemctl stop zhitoujianli-backend || true
sleep 2

# 2. 备份当前JAR
echo "[3/8] 备份当前JAR文件..."
BACKUP_FILE="/opt/zhitoujianli/backend/get_jobs-v2.0.1.jar.backup.$(date +%Y%m%d_%H%M%S)"
cp /opt/zhitoujianli/backend/get_jobs-v2.0.1.jar "$BACKUP_FILE"
echo "   备份保存到: $BACKUP_FILE"

# 3. 清理并重新编译
echo "[4/8] 清理Maven缓存..."
cd /root/zhitoujianli/backend/get_jobs
mvn clean -q

echo "[5/8] 重新编译项目..."
mvn package -DskipTests -q
if [ $? -ne 0 ]; then
    echo "❌ 编译失败！恢复备份..."
    cp "$BACKUP_FILE" /opt/zhitoujianli/backend/get_jobs-v2.0.1.jar
    systemctl start zhitoujianli-backend
    exit 1
fi

echo "   ✅ 编译成功"

# 4. 部署新JAR
echo "[6/8] 部署新版本..."
cp target/get_jobs-v2.0.1.jar /opt/zhitoujianli/backend/
echo "   ✅ JAR文件已更新"

# 5. 重新加载systemd配置并启动服务
echo "[7/8] 重新加载systemd配置..."
systemctl daemon-reload

echo "[8/8] 启动后端服务..."
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

# 检查日志中是否还有Dotenv错误
echo ""
echo "[检查3] 检查Dotenv错误(最近50行日志):"
DOTENV_ERRORS=$(tail -50 /tmp/boss_login.log 2>/dev/null | grep -i "dotenv\|NoClassDefFoundError" | wc -l)
if [ "$DOTENV_ERRORS" -eq 0 ]; then
    echo "   ✅ 未发现Dotenv相关错误"
else
    echo "   ⚠️ 发现 $DOTENV_ERRORS 个Dotenv错误"
fi

# 检查AI服务是否可用
echo ""
echo "[检查4] AI服务状态(启动新的投递测试):"
echo "   请在Web界面点击\"开始投递\"来测试AI智能打招呼语功能"

echo ""
echo "========================================="
echo "部署完成！"
echo "========================================="
echo ""
echo "📝 重要提示:"
echo "1. 如果看到401认证错误,请更新DeepSeek API密钥"
echo "2. 备份文件: $BACKUP_FILE"
echo "3. 如有问题可回滚: cp $BACKUP_FILE /opt/zhitoujianli/backend/get_jobs-v2.0.1.jar"
echo ""


