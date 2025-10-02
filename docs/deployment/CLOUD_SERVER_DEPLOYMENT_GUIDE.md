# 智投简历云服务器部署完整指南

## 🎯 部署架构

```
用户访问
    ↓
EdgeOne CDN (zhitoujianli.com)
    ├── 前端静态资源 (/)
    └── API代理 (/api/*) → 云服务器后端
                            ↓
                    Spring Boot Application
                            ↓
                        MySQL + Redis
```

## 🛒 云服务器选择推荐

### 腾讯云轻量应用服务器 (推荐)
- **配置**: 2核4G 5M带宽 50GB SSD
- **价格**: 月付 60元，年付 588元
- **优势**: 
  - 预装宝塔面板，操作简单
  - 包含基础安全防护
  - 香港节点访问速度快

### 阿里云ECS服务器
- **配置**: 2核4G 3M带宽 40GB ESSD
- **价格**: 月付 80元，年付 768元
- **优势**: 
  - 稳定性好
  - 技术文档完善
  - 云产品生态丰富

### 华为云弹性云服务器
- **配置**: 2核4G 5M带宽 40GB SSD
- **价格**: 月付 55元，年付 528元
- **优势**: 
  - 性价比高
  - 国产云服务
  - 技术支持响应快

## 📋 部署准备清单

### 1. 域名解析配置
```
类型    主机记录    解析值
A       api        云服务器公网IP
CNAME   @          zhitoujianli-*.edgeone.app (保持不变)
```

### 2. 服务器环境要求
- **操作系统**: Ubuntu 20.04 LTS 或 CentOS 7/8
- **Java运行环境**: OpenJDK 17+
- **数据库**: MySQL 8.0
- **缓存**: Redis 6.0+ (可选)
- **反向代理**: Nginx
- **进程管理**: systemd
- **SSL证书**: Let's Encrypt (免费)

## 🚀 完整部署流程

### 第一步：购买和配置云服务器

#### 1.1 购买腾讯云轻量服务器
```bash
# 选择配置
地域: 中国香港 (境外访问友好) 或 广州 (国内访问快)
镜像: Ubuntu 20.04 LTS
套餐: 2核4G 5M带宽 50GB SSD
应用: 宝塔Linux面板 (推荐) 或 纯净版系统
```

#### 1.2 基础安全配置
```bash
# SSH登录服务器
ssh root@your-server-ip

# 更新系统
apt update && apt upgrade -y

# 配置防火墙
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw allow 8080/tcp   # 应用端口 (临时)
ufw enable

# 创建应用用户
useradd -m -s /bin/bash zhitoujianli
usermod -aG sudo zhitoujianli
```

### 第二步：安装运行环境

#### 2.1 安装 Java 17
```bash
# Ubuntu/Debian
apt install openjdk-17-jdk -y

# 验证安装
java -version
javac -version

# 配置JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> /etc/profile
echo 'export PATH=$PATH:$JAVA_HOME/bin' >> /etc/profile
source /etc/profile
```

#### 2.2 安装 MySQL 8.0
```bash
# 安装 MySQL
apt install mysql-server -y

# 安全配置
mysql_secure_installation

# 创建应用数据库
mysql -u root -p << 'EOF'
CREATE DATABASE zhitoujianli DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'zhitoujianli'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON zhitoujianli.* TO 'zhitoujianli'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF
```

#### 2.3 安装 Redis (可选)
```bash
# 安装 Redis
apt install redis-server -y

# 启动并设置开机自启
systemctl start redis-server
systemctl enable redis-server

# 测试连接
redis-cli ping
```

#### 2.4 安装 Nginx
```bash
# 安装 Nginx
apt install nginx -y

# 启动并设置开机自启
systemctl start nginx
systemctl enable nginx
```

### 第三步：部署应用

#### 3.1 准备应用文件
```bash
# 在本地构建应用
cd /Users/user/autoresume/backend/get_jobs
./mvnw clean package -DskipTests

# 创建部署目录
mkdir -p /opt/zhitoujianli/{app,config,logs}
chown -R zhitoujianli:zhitoujianli /opt/zhitoujianli

# 上传JAR文件 (在本地执行)
scp target/get_jobs-0.0.1-SNAPSHOT.jar root@your-server-ip:/opt/zhitoujianli/app/
```

#### 3.2 配置环境变量
```bash
# 创建生产环境配置
cat > /opt/zhitoujianli/config/.env << 'EOF'
# ========== 基础配置 ==========
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=production

# ========== 数据库配置 ==========
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/zhitoujianli?useSSL=true&serverTimezone=Asia/Shanghai
SPRING_DATASOURCE_USERNAME=zhitoujianli
SPRING_DATASOURCE_PASSWORD=your_strong_password

# ========== Redis配置 ==========
SPRING_REDIS_HOST=localhost
SPRING_REDIS_PORT=6379
SPRING_REDIS_PASSWORD=

# ========== JWT配置 ==========
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars_random_string
JWT_EXPIRATION=86400000

# ========== Authing配置 ==========
AUTHING_USER_POOL_ID=68db6e4c4f248dd866413bc2
AUTHING_APP_ID=68db6e4e85de9cb8daf2b3d2
AUTHING_APP_SECRET=your_authing_app_secret
AUTHING_APP_HOST=https://zhitoujianli.authing.cn

# ========== 安全配置 ==========
SECURITY_ENABLED=true

# ========== 应用配置 ==========
HOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your_key_here
BASE_URL=https://api.deepseek.com
API_KEY=sk-your-deepseek-api-key
MODEL=deepseek-chat
EOF

# 设置文件权限
chown zhitoujianli:zhitoujianli /opt/zhitoujianli/config/.env
chmod 600 /opt/zhitoujianli/config/.env
```

#### 3.3 创建系统服务
```bash
# 创建systemd服务文件
cat > /etc/systemd/system/zhitoujianli.service << 'EOF'
[Unit]
Description=智投简历后端服务
After=network.target mysql.service redis.service

[Service]
Type=simple
User=zhitoujianli
Group=zhitoujianli
WorkingDirectory=/opt/zhitoujianli/app
ExecStart=/usr/bin/java -jar -Dspring.config.additional-location=file:/opt/zhitoujianli/config/ get_jobs-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=zhitoujianli

# 环境变量
Environment=JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
Environment=SPRING_PROFILES_ACTIVE=production

[Install]
WantedBy=multi-user.target
EOF

# 重载systemd配置
systemctl daemon-reload

# 启动应用
systemctl start zhitoujianli
systemctl enable zhitoujianli

# 检查服务状态
systemctl status zhitoujianli
```

### 第四步：配置 Nginx 反向代理

#### 4.1 创建 Nginx 配置
```bash
# 创建站点配置
cat > /etc/nginx/sites-available/zhitoujianli << 'EOF'
server {
    listen 80;
    server_name api.zhitoujianli.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.zhitoujianli.com;

    # SSL配置 (稍后配置证书)
    ssl_certificate /etc/letsencrypt/live/api.zhitoujianli.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.zhitoujianli.com/privkey.pem;
    
    # SSL优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头部
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 代理到Spring Boot应用
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:8080/api/auth/health;
        access_log off;
    }

    # 日志配置
    access_log /var/log/nginx/zhitoujianli_access.log;
    error_log /var/log/nginx/zhitoujianli_error.log;
}
EOF

# 启用站点
ln -s /etc/nginx/sites-available/zhitoujianli /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### 4.2 申请 SSL 证书
```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx -y

# 申请证书
certbot --nginx -d api.zhitoujianli.com

# 测试自动续期
certbot renew --dry-run
```

### 第五步：配置域名解析

在腾讯云 EdgeOne 控制台添加 DNS 记录：
```
类型: A
主机记录: api
解析值: 你的云服务器公网IP
TTL: 600
```

### 第六步：更新前端配置

#### 6.1 修改 EdgeOne 环境变量
在 EdgeOne 控制台更新环境变量：
```json
{
  "env": {
    "REACT_APP_API_URL": "https://api.zhitoujianli.com/api"
  }
}
```

#### 6.2 重新部署前端
EdgeOne 会自动检测 GitHub 提交并重新部署。

## 🔍 部署验证

### 验证后端服务
```bash
# 检查服务状态
systemctl status zhitoujianli

# 检查应用日志
journalctl -u zhitoujianli -f

# 测试API接口
curl https://api.zhitoujianli.com/api/auth/health
```

### 验证前端集成
```bash
# 测试登录接口
curl -X POST https://api.zhitoujianli.com/api/auth/login/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 📊 监控和维护

### 1. 日志监控
```bash
# 应用日志
journalctl -u zhitoujianli -f

# Nginx日志
tail -f /var/log/nginx/zhitoujianli_access.log
tail -f /var/log/nginx/zhitoujianli_error.log

# 系统资源监控
htop
df -h
free -h
```

### 2. 自动备份
```bash
# 创建备份脚本
cat > /opt/zhitoujianli/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/zhitoujianli/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u zhitoujianli -p your_password zhitoujianli > $BACKUP_DIR/db_$DATE.sql

# 备份应用配置
cp -r /opt/zhitoujianli/config $BACKUP_DIR/config_$DATE

# 清理7天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "config_*" -mtime +7 -exec rm -rf {} \;

echo "备份完成: $DATE"
EOF

chmod +x /opt/zhitoujianli/backup.sh

# 添加定时任务
crontab -e
# 添加以下行：每天凌晨2点备份
0 2 * * * /opt/zhitoujianli/backup.sh >> /var/log/zhitoujianli_backup.log 2>&1
```

## 💰 成本预算

### 月度成本预估
- **云服务器**: 60元/月 (腾讯云轻量)
- **域名**: 免费 (已有)
- **SSL证书**: 免费 (Let's Encrypt)
- **带宽**: 包含在服务器费用中
- **总计**: 约 60元/月

### 年度成本预估
- **云服务器**: 588元/年 (年付优惠)
- **数据库**: 免费 (自建MySQL)
- **监控**: 免费 (基础监控)
- **总计**: 约 588元/年

## 🚨 故障排除

### 常见问题

1. **服务启动失败**
```bash
# 检查日志
journalctl -u zhitoujianli --since "1 hour ago"

# 检查端口占用
netstat -tlnp | grep 8080

# 检查Java进程
ps aux | grep java
```

2. **数据库连接问题**
```bash
# 测试数据库连接
mysql -u zhitoujianli -p -h localhost zhitoujianli

# 检查数据库状态
systemctl status mysql
```

3. **SSL证书问题**
```bash
# 检查证书状态
certbot certificates

# 手动续期
certbot renew
```

## 📞 技术支持

- **腾讯云技术支持**: 7x24小时在线客服
- **部署文档**: 详见本指南
- **应急联系**: 确保有备用访问方式

---

**重要提醒**: 
- 首次部署建议在测试环境验证
- 生产部署前务必备份原有数据
- 监控系统运行状态和资源使用情况
- 定期更新系统和应用依赖