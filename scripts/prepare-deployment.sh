#!/bin/bash

# 智投简历云服务器部署准备脚本

echo "🚀 智投简历云服务器部署准备"
echo "=================================="

# 检查必要工具
echo "📋 检查部署前置条件..."

# 检查Maven
if ! command -v mvn &> /dev/null && ! [[ -f "./mvnw" ]]; then
    echo "❌ Maven 未找到，请确保项目包含 mvnw 脚本"
    exit 1
fi
echo "✅ Maven 构建工具已准备"

# 检查Java
if ! command -v java &> /dev/null; then
    echo "❌ Java 未安装，请安装 OpenJDK 17+"
    exit 1
fi
echo "✅ Java 运行环境已准备"

# 创建部署目录
mkdir -p deployment/{packages,configs,scripts}
mkdir -p logs

echo ""
echo "🔧 准备部署包..."

# 构建后端应用
echo "构建 Spring Boot 应用..."
cd backend/get_jobs

if [[ -f "./mvnw" ]]; then
    ./mvnw clean package -DskipTests
else
    mvn clean package -DskipTests
fi

if [[ $? -ne 0 ]]; then
    echo "❌ 后端构建失败"
    exit 1
fi

# 复制JAR文件到部署目录
cp target/get_jobs-*.jar ../../deployment/packages/
echo "✅ 后端应用包已准备: deployment/packages/"

cd ../../

# 创建生产环境配置模板
echo ""
echo "📝 生成配置模板..."

cat > deployment/configs/.env.production << 'EOF'
# ========== 基础配置 ==========
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=production

# ========== 数据库配置 ==========
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/zhitoujianli?useSSL=true&serverTimezone=Asia/Shanghai
SPRING_DATASOURCE_USERNAME=zhitoujianli
SPRING_DATASOURCE_PASSWORD=CHANGE_THIS_PASSWORD

# ========== Redis配置 ==========
SPRING_REDIS_HOST=localhost
SPRING_REDIS_PORT=6379
SPRING_REDIS_PASSWORD=

# ========== JWT配置 ==========
JWT_SECRET=CHANGE_THIS_TO_RANDOM_32_CHARS_STRING
JWT_EXPIRATION=86400000

# ========== Authing配置 ==========
AUTHING_USER_POOL_ID=68db6e4c4f248dd866413bc2
AUTHING_APP_ID=68db6e4e85de9cb8daf2b3d2
AUTHING_APP_SECRET=CHANGE_THIS_TO_YOUR_AUTHING_SECRET
AUTHING_APP_HOST=https://zhitoujianli.authing.cn

# ========== 安全配置 ==========
SECURITY_ENABLED=true

# ========== 应用配置 ==========
HOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your_key_here
BASE_URL=https://api.deepseek.com
API_KEY=sk-your-deepseek-api-key
MODEL=deepseek-chat
EOF

# 创建部署脚本
cat > deployment/scripts/deploy-to-server.sh << 'EOF'
#!/bin/bash

# 云服务器部署脚本
# 使用方法: ./deploy-to-server.sh <server-ip> <ssh-user>

if [ $# -ne 2 ]; then
    echo "使用方法: $0 <server-ip> <ssh-user>"
    echo "示例: $0 192.168.1.100 root"
    exit 1
fi

SERVER_IP=$1
SSH_USER=$2

echo "🚀 开始部署到云服务器: $SERVER_IP"

# 上传应用包
echo "📦 上传应用包..."
scp ../packages/*.jar $SSH_USER@$SERVER_IP:/opt/zhitoujianli/app/

# 上传配置文件
echo "📝 上传配置文件..."
scp ../configs/.env.production $SSH_USER@$SERVER_IP:/opt/zhitoujianli/config/.env

# 重启应用服务
echo "🔄 重启应用服务..."
ssh $SSH_USER@$SERVER_IP "systemctl restart zhitoujianli"

# 检查服务状态
echo "✅ 检查服务状态..."
ssh $SSH_USER@$SERVER_IP "systemctl status zhitoujianli --no-pager"

echo "🎉 部署完成!"
EOF

chmod +x deployment/scripts/deploy-to-server.sh

# 创建快速部署文档
cat > deployment/QUICK_DEPLOY.md << 'EOF'
# 快速部署指南

## 1. 部署前准备
- 已购买并配置好云服务器
- 已安装 Java 17、MySQL、Nginx
- 已配置域名解析
- 已申请 SSL 证书

## 2. 部署步骤

### 上传并部署
```bash
# 进入部署目录
cd deployment/scripts

# 部署到服务器 (替换为你的服务器IP和用户)
./deploy-to-server.sh YOUR_SERVER_IP root
```

### 修改配置
1. 编辑 `configs/.env.production`
2. 修改数据库密码、JWT密钥等敏感信息
3. 重新上传配置: `scp configs/.env.production root@YOUR_SERVER_IP:/opt/zhitoujianli/config/.env`

## 3. 验证部署
```bash
# 测试API接口
curl https://api.zhitoujianli.com/api/auth/health

# 测试登录接口
curl -X POST https://api.zhitoujianli.com/api/auth/login/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 4. 更新前端配置
在 EdgeOne 控制台更新环境变量:
```
REACT_APP_API_URL = https://api.zhitoujianli.com/api
```

## 5. 故障排除
- 查看应用日志: `journalctl -u zhitoujianli -f`
- 查看Nginx日志: `tail -f /var/log/nginx/zhitoujianli_error.log`
- 检查服务状态: `systemctl status zhitoujianli`
EOF

echo ""
echo "✅ 部署准备完成!"
echo ""
echo "📁 生成的文件:"
echo "- deployment/packages/          # 应用JAR包"
echo "- deployment/configs/           # 配置文件模板"
echo "- deployment/scripts/           # 部署脚本"
echo "- deployment/QUICK_DEPLOY.md    # 快速部署文档"
echo ""
echo "📖 下一步:"
echo "1. 按照 docs/deployment/CLOUD_SERVER_DEPLOYMENT_GUIDE.md 购买和配置云服务器"
echo "2. 修改 deployment/configs/.env.production 中的配置"
echo "3. 运行 deployment/scripts/deploy-to-server.sh 部署到服务器"
echo ""
echo "💡 提示: 部署前请仔细阅读完整部署指南"