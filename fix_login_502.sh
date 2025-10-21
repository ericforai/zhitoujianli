#!/bin/bash

# 登录502错误紧急修复脚本
# 问题: Nginx配置中缺少upstream backend定义

echo "========================================="
echo "智投简历登录502错误紧急修复"
echo "========================================="
echo ""

# 1. 检查当前服务状态
echo "[1/6] 检查后端服务状态..."
if systemctl is-active --quiet zhitoujianli-backend; then
    echo "   ✅ 后端服务运行中"
else
    echo "   ❌ 后端服务未运行，正在启动..."
    systemctl start zhitoujianli-backend
    sleep 5
fi

# 2. 检查8080端口
echo "[2/6] 检查8080端口..."
if netstat -tlnp | grep -q ":8080"; then
    echo "   ✅ 8080端口被占用"
    netstat -tlnp | grep ":8080"
else
    echo "   ❌ 8080端口未被占用"
fi

# 3. 测试后端API
echo "[3/6] 测试后端API..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/auth/login/email -X POST -H "Content-Type: application/json" -d '{"email":"test","password":"test"}')
echo "   API响应状态码: $API_RESPONSE"

if [ "$API_RESPONSE" = "400" ] || [ "$API_RESPONSE" = "401" ]; then
    echo "   ✅ 后端API正常响应"
elif [ "$API_RESPONSE" = "000" ]; then
    echo "   ❌ 后端API无响应"
else
    echo "   ⚠️ 后端API响应异常: $API_RESPONSE"
fi

# 4. 修复Nginx配置
echo "[4/6] 修复Nginx配置..."

# 创建upstream配置
cat > /etc/nginx/conf.d/zhitoujianli-backend.conf << 'EOF'
# 智投简历后端upstream配置
upstream backend {
    server 127.0.0.1:8080;
    keepalive 32;
}
EOF

echo "   ✅ 已创建upstream配置"

# 5. 测试Nginx配置
echo "[5/6] 测试Nginx配置..."
nginx -t
if [ $? -eq 0 ]; then
    echo "   ✅ Nginx配置正确"
else
    echo "   ❌ Nginx配置有误"
    exit 1
fi

# 6. 重启Nginx
echo "[6/6] 重启Nginx服务..."
systemctl reload nginx
if [ $? -eq 0 ]; then
    echo "   ✅ Nginx已重新加载"
else
    echo "   ❌ Nginx重新加载失败"
    exit 1
fi

echo ""
echo "========================================="
echo "修复完成！"
echo "========================================="
echo ""
echo "📝 修复内容:"
echo "1. ✅ 检查并确保后端服务运行"
echo "2. ✅ 创建Nginx upstream backend配置"
echo "3. ✅ 重新加载Nginx配置"
echo ""
echo "🔍 验证步骤:"
echo "1. 访问 https://zhitoujianli.com"
echo "2. 尝试登录功能"
echo "3. 检查浏览器控制台是否还有502错误"
echo ""
echo "📊 如果仍有问题，请检查:"
echo "- 后端服务日志: journalctl -u zhitoujianli-backend -f"
echo "- Nginx错误日志: tail -f /var/log/nginx/zhitoujianli_error.log"
echo ""


