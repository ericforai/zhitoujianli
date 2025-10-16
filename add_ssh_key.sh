#!/bin/bash

# 自动添加SSH公钥到服务器
echo "🔑 自动添加SSH公钥到服务器..."

# 服务器信息
SERVER_HOST="115.190.182.95"
SERVER_USER="root"
SSH_PORT="22"

# 公钥内容
PUBLIC_KEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPOW+55P+OHEbV1SnRI7ONIs6FleYOwbB0Ak4q+aXzXg zhitoujianli-deploy"

echo "服务器: $SERVER_USER@$SERVER_HOST:$SSH_PORT"
echo "公钥: $PUBLIC_KEY"
echo ""

# 尝试使用密码登录添加公钥
echo "尝试添加公钥到服务器..."

# 使用sshpass或expect来自动化密码输入
# 这里我们使用一个更简单的方法：直接使用ssh-copy-id
if command -v ssh-copy-id &> /dev/null; then
    echo "使用ssh-copy-id添加公钥..."
    ssh-copy-id -i /root/.ssh/id_ed25519.pub $SERVER_USER@$SERVER_HOST
else
    echo "ssh-copy-id不可用，尝试手动方法..."

    # 手动添加公钥
    ssh $SERVER_USER@$SERVER_HOST "mkdir -p ~/.ssh && echo '$PUBLIC_KEY' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh"
fi

echo ""
echo "公钥添加完成！"
echo "现在测试SSH连接..."

# 测试SSH连接
ssh -i /root/.ssh/id_ed25519 -o ConnectTimeout=10 $SERVER_USER@$SERVER_HOST "echo 'SSH连接成功！'; whoami; pwd"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSH连接测试成功！"
    echo "可以继续使用GitHub Actions进行部署"
else
    echo ""
    echo "❌ SSH连接仍然失败"
    echo "可能需要手动添加公钥到服务器"
    echo ""
    echo "手动添加步骤："
    echo "1. 登录服务器: ssh $SERVER_USER@$SERVER_HOST"
    echo "2. 添加公钥: echo '$PUBLIC_KEY' >> ~/.ssh/authorized_keys"
    echo "3. 设置权限: chmod 600 ~/.ssh/authorized_keys"
fi

