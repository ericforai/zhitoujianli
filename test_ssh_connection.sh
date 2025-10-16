#!/bin/bash

# SSH连接测试脚本
# 用于验证GitHub Secrets配置是否正确

echo "🔐 SSH连接测试脚本"
echo "=================="

# 配置变量（请根据实际情况修改）
SSH_HOST="115.190.182.95"
SSH_USER="root"
SSH_PORT="22"
SSH_KEY_PATH="~/.ssh/id_rsa"

echo "测试配置："
echo "SSH_HOST: $SSH_HOST"
echo "SSH_USER: $SSH_USER"
echo "SSH_PORT: $SSH_PORT"
echo "SSH_KEY: $SSH_KEY_PATH"
echo ""

# 1. 检查SSH密钥文件是否存在
echo "1. 检查SSH密钥文件..."
if [ -f "$SSH_KEY_PATH" ]; then
    echo "✅ SSH密钥文件存在: $SSH_KEY_PATH"
else
    echo "❌ SSH密钥文件不存在: $SSH_KEY_PATH"
    echo "请检查SSH密钥路径或生成新的密钥对"
    exit 1
fi

# 2. 检查SSH密钥格式
echo ""
echo "2. 检查SSH密钥格式..."
if grep -q "BEGIN.*PRIVATE KEY" "$SSH_KEY_PATH"; then
    echo "✅ SSH密钥格式正确"
else
    echo "❌ SSH密钥格式错误"
    echo "请确保密钥文件包含正确的私钥格式"
    exit 1
fi

# 3. 测试SSH连接
echo ""
echo "3. 测试SSH连接..."
echo "正在连接到 $SSH_USER@$SSH_HOST:$SSH_PORT ..."

# 使用SSH连接测试
ssh -i "$SSH_KEY_PATH" -p "$SSH_PORT" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "echo 'SSH连接成功！'; whoami; pwd; ls -la" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSH连接测试成功！"
    echo ""
    echo "4. 检查服务器环境..."
    ssh -i "$SSH_KEY_PATH" -p "$SSH_PORT" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'EOF'
        echo "服务器信息："
        echo "用户: $(whoami)"
        echo "目录: $(pwd)"
        echo "时间: $(date)"
        echo ""
        echo "检查部署目录..."
        if [ -d "/var/www/zhitoujianli" ]; then
            echo "✅ 部署目录存在: /var/www/zhitoujianli"
            ls -la /var/www/zhitoujianli/
        else
            echo "❌ 部署目录不存在: /var/www/zhitoujianli"
        fi
        echo ""
        echo "检查Nginx配置目录..."
        if [ -d "/etc/nginx/conf.d" ]; then
            echo "✅ Nginx配置目录存在: /etc/nginx/conf.d"
            ls -la /etc/nginx/conf.d/
        else
            echo "❌ Nginx配置目录不存在: /etc/nginx/conf.d"
        fi
        echo ""
        echo "检查Nginx服务状态..."
        systemctl status nginx --no-pager -l
EOF
else
    echo ""
    echo "❌ SSH连接测试失败！"
    echo ""
    echo "可能的原因："
    echo "1. SSH_HOST配置错误"
    echo "2. SSH_USER配置错误"
    echo "3. SSH_PORT配置错误"
    echo "4. SSH_KEY配置错误"
    echo "5. 服务器SSH服务未启动"
    echo "6. 防火墙阻止SSH连接"
    echo ""
    echo "请检查以上配置并重试"
    exit 1
fi

echo ""
echo "🎉 SSH连接测试完成！"
echo ""
echo "如果测试成功，请将以下信息配置到GitHub Secrets："
echo "SSH_HOST: $SSH_HOST"
echo "SSH_USER: $SSH_USER"
echo "SSH_PORT: $SSH_PORT"
echo "SSH_KEY: [复制以下私钥内容]"
echo ""
echo "私钥内容："
echo "=================="
cat "$SSH_KEY_PATH"
echo "=================="
