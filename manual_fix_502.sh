# 智投简历登录502错误紧急修复
# 问题: Nginx配置中缺少upstream backend定义

# 1. 创建upstream配置
cat > /etc/nginx/conf.d/zhitoujianli-backend.conf << 'EOF'
# 智投简历后端upstream配置
upstream backend {
    server 127.0.0.1:8080;
    keepalive 32;
}
EOF

# 2. 测试Nginx配置
nginx -t

# 3. 重新加载Nginx
systemctl reload nginx

# 4. 验证修复结果
echo "修复完成！请访问 https://zhitoujianli.com 测试登录功能"

