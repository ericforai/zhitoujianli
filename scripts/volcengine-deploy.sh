#!/bin/bash

# 智投简历火山云服务器自动部署脚本

echo "🚀 智投简历火山云服务器自动部署"
echo "=================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    log_error "请使用root用户运行此脚本"
    exit 1
fi

# 获取用户输入
echo "请提供以下信息："
read -p "火山云服务器公网IP: " SERVER_IP
read -p "数据库密码 (默认: ZhiTou2025!@#): " DB_PASSWORD
DB_PASSWORD=${DB_PASSWORD:-"ZhiTou2025!@#"}
read -p "域名 (默认: api.zhitoujianli.com): " DOMAIN
DOMAIN=${DOMAIN:-"api.zhitoujianli.com"}

log_info "开始部署配置..."
log_info "服务器IP: $SERVER_IP"
log_info "域名: $DOMAIN"

# 1. 系统更新
log_info "更新系统包..."
yum update -y

# 2. 安装基础软件
log_info "安装基础软件..."
yum install -y wget curl vim git firewalld

# 3. 配置防火墙
log_info "配置防火墙..."
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --permanent --add-port=8080/tcp
firewall-cmd --reload

# 4. 创建应用用户
log_info "创建应用用户..."
useradd -m -s /bin/bash zhitoujianli
echo "zhitoujianli ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
mkdir -p /opt/zhitoujianli/{app,config,logs,backups}
chown -R zhitoujianli:zhitoujianli /opt/zhitoujianli

# 5. 安装Java 17
log_info "安装Java 17..."
yum install -y java-17-openjdk java-17-openjdk-devel
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk' >> /etc/profile
echo 'export PATH=$PATH:$JAVA_HOME/bin' >> /etc/profile
source /etc/profile

# 6. 安装MySQL 8.0
log_info "安装MySQL 8.0..."
if ! command -v mysql &> /dev/null; then
    wget https://dev.mysql.com/get/mysql80-community-release-el8-1.noarch.rpm
    rpm -Uvh mysql80-community-release-el8-1.noarch.rpm
    yum install -y mysql-server
    systemctl start mysqld
    systemctl enable mysqld
    
    # 获取临时密码
    TEMP_PASSWORD=$(grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}')
    log_info "MySQL临时密码: $TEMP_PASSWORD"
    
    # 创建MySQL配置脚本
    cat > /tmp/mysql_setup.sql << EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
CREATE DATABASE zhitoujianli DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'zhitoujianli'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON zhitoujianli.* TO 'zhitoujianli'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    log_warn "请手动执行MySQL安全配置："
    log_warn "mysql -u root -p'$TEMP_PASSWORD' --connect-expired-password < /tmp/mysql_setup.sql"
else
    log_info "MySQL已安装"
fi

# 7. 安装Redis
log_info "安装Redis..."
yum install -y redis
systemctl start redis
systemctl enable redis

# 8. 安装Nginx
log_info "安装Nginx..."
yum install -y nginx
systemctl start nginx
systemctl enable nginx

# 9. 创建Nginx配置
log_info "配置Nginx..."
cat > /etc/nginx/conf.d/zhitoujianli.conf << EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /health {
        proxy_pass http://127.0.0.1:8080/api/auth/health;
        access_log off;
    }

    access_log /var/log/nginx/zhitoujianli_access.log;
    error_log /var/log/nginx/zhitoujianli_error.log;
}
EOF

# 10. 安装Certbot
log_info "安装SSL证书工具..."
yum install -y epel-release
yum install -y certbot python3-certbot-nginx

# 11. 创建应用配置
log_info "创建应用配置..."
cat > /opt/zhitoujianli/config/.env << EOF
# ========== 基础配置 ==========
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=production

# ========== 数据库配置 ==========
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/zhitoujianli?useSSL=true&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=zhitoujianli
SPRING_DATASOURCE_PASSWORD=$DB_PASSWORD

# ========== Redis配置 ==========
SPRING_REDIS_HOST=localhost
SPRING_REDIS_PORT=6379
SPRING_REDIS_PASSWORD=

# ========== JWT配置 ==========
JWT_SECRET=zhitoujianli_production_secret_key_2025_very_secure_random_string_32_chars
JWT_EXPIRATION=86400000

# ========== Authing配置 ==========
AUTHING_USER_POOL_ID=68db6e4c4f248dd866413bc2
AUTHING_APP_ID=68db6e4e85de9cb8daf2b3d2
AUTHING_APP_SECRET=请填入你的Authing密钥
AUTHING_APP_HOST=https://zhitoujianli.authing.cn

# ========== 安全配置 ==========
SECURITY_ENABLED=false

# ========== 应用配置 ==========
HOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your_key_here
BASE_URL=https://api.deepseek.com
API_KEY=sk-your-deepseek-api-key
MODEL=deepseek-chat

# ========== 日志配置 ==========
LOG_LEVEL=INFO
LOG_FILE=/opt/zhitoujianli/logs/application.log
EOF

chown zhitoujianli:zhitoujianli /opt/zhitoujianli/config/.env
chmod 600 /opt/zhitoujianli/config/.env

# 12. 创建systemd服务
log_info "创建应用服务..."
cat > /etc/systemd/system/zhitoujianli.service << EOF
[Unit]
Description=智投简历后端服务
After=network.target mysql.service redis.service

[Service]
Type=simple
User=zhitoujianli
Group=zhitoujianli
WorkingDirectory=/opt/zhitoujianli/app
ExecStart=/usr/bin/java -jar -Dspring.config.additional-location=file:/opt/zhitoujianli/config/ -Xms512m -Xmx1024m get_jobs-2.0.1.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=zhitoujianli

Environment=JAVA_HOME=/usr/lib/jvm/java-17-openjdk
Environment=SPRING_PROFILES_ACTIVE=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload

# 13. 创建备份脚本
log_info "创建备份脚本..."
cat > /opt/zhitoujianli/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/zhitoujianli/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u zhitoujianli -pZhiTou2025!@# zhitoujianli > $BACKUP_DIR/db_$DATE.sql

# 备份应用配置
cp -r /opt/zhitoujianli/config $BACKUP_DIR/config_$DATE

# 备份应用JAR
cp /opt/zhitoujianli/app/*.jar $BACKUP_DIR/app_$DATE.jar 2>/dev/null || true

# 清理30天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "config_*" -mtime +30 -exec rm -rf {} \;
find $BACKUP_DIR -name "app_*.jar" -mtime +30 -delete

echo "$(date): 备份完成" >> /var/log/zhitoujianli_backup.log
EOF

chmod +x /opt/zhitoujianli/backup.sh

# 设置定时备份
echo "0 2 * * * /opt/zhitoujianli/backup.sh" | crontab -

# 14. 创建部署后检查脚本
cat > /opt/zhitoujianli/check_deployment.sh << 'EOF'
#!/bin/bash

echo "🔍 部署状态检查"
echo "=========================="

# 检查各服务状态
echo "📋 服务状态检查:"
services=("mysqld" "redis" "nginx" "zhitoujianli")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        echo "✅ $service: 运行中"
    else
        echo "❌ $service: 未运行"
    fi
done

echo ""
echo "🌐 网络检查:"

# 检查端口监听
if netstat -tlnp | grep -q ":8080"; then
    echo "✅ 应用端口8080: 正常监听"
else
    echo "❌ 应用端口8080: 未监听"
fi

if netstat -tlnp | grep -q ":80"; then
    echo "✅ HTTP端口80: 正常监听"
else
    echo "❌ HTTP端口80: 未监听"
fi

# 检查API健康状态
if curl -f -s http://localhost:8080/health > /dev/null; then
    echo "✅ API健康检查: 通过"
else
    echo "❌ API健康检查: 失败"
fi

echo ""
echo "📊 资源使用:"
echo "内存使用: $(free -h | awk 'NR==2{printf "%.1f%%\n", $3*100/$2 }')"
echo "磁盘使用: $(df -h / | awk 'NR==2{print $5}')"

echo ""
echo "📝 近期日志:"
echo "应用日志 (最近5行):"
journalctl -u zhitoujianli --lines=5 --no-pager
EOF

chmod +x /opt/zhitoujianli/check_deployment.sh

log_info "基础环境配置完成！"
echo ""
echo "📋 接下来的手动步骤："
echo "=================================="
echo "1. 完成MySQL安全配置:"
echo "   mysql -u root -p --connect-expired-password < /tmp/mysql_setup.sql"
echo ""
echo "2. 申请SSL证书 (确保域名已解析):"
echo "   certbot --nginx -d $DOMAIN"
echo ""
echo "3. 上传应用JAR文件到 /opt/zhitoujianli/app/"
echo ""
echo "4. 启动应用服务:"
echo "   systemctl start zhitoujianli"
echo "   systemctl enable zhitoujianli"
echo ""
echo "5. 检查部署状态:"
echo "   /opt/zhitoujianli/check_deployment.sh"
echo ""
echo "🎯 部署完成后访问: https://$DOMAIN"

log_info "自动部署脚本执行完成！"