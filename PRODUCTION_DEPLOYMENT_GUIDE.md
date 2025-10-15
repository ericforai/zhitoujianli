# 📚 智投简历 - 生产环境部署完整指南

**文档版本**: v1.0  
**最后更新**: 2025-10-10  
**适用版本**: v1.0.0及以上

---

## 📋 目录

1. [部署准备](#部署准备)
2. [环境配置](#环境配置)
3. [Docker部署](#docker部署)
4. [Nginx配置](#nginx配置)
5. [SSL证书](#ssl证书)
6. [部署执行](#部署执行)
7. [验证测试](#验证测试)
8. [监控维护](#监控维护)
9. [故障处理](#故障处理)

---

## 🎯 部署准备

### 服务器要求

#### 最低配置
- **CPU**: 2核心
- **内存**: 4GB
- **磁盘**: 20GB可用空间
- **操作系统**: Ubuntu 20.04+ / CentOS 7+
- **网络**: 公网IP，开放80、443、8080端口

#### 推荐配置
- **CPU**: 4核心
- **内存**: 8GB
- **磁盘**: 50GB SSD
- **带宽**: 5Mbps+

### 软件要求

```bash
# 必需软件
- Docker 20.10+
- Docker Compose 1.29+
- Git 2.0+
- OpenSSL 1.1+

# 可选软件
- Nginx 1.18+（如不使用Docker Nginx）
- MySQL 8.0+（如不使用Docker MySQL）
- Redis 6.0+（如需要）
```

### 域名准备

- [x] 已注册域名: zhitoujianli.com
- [ ] DNS A记录指向服务器IP
- [ ] DNS CNAME记录: www → @
- [ ] 域名已备案（中国大陆）

---

## ⚙️ 环境配置

### 1. 安装Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 2. 配置防火墙

```bash
# Ubuntu (ufw)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp  # 如果后端需要直接访问
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

### 3. 创建工作目录

```bash
# 创建项目目录
sudo mkdir -p /var/www/zhitoujianli
sudo chown $USER:$USER /var/www/zhitoujianli

# 创建日志目录
mkdir -p /var/www/zhitoujianli/logs/nginx
mkdir -p /var/www/zhitoujianli/logs/backend

# 创建SSL目录
mkdir -p /var/www/zhitoujianli/ssl

# 创建备份目录
mkdir -p /var/www/zhitoujianli/backup
```

---

## 🔑 配置环境变量

### 1. 生成JWT密钥

```bash
# 生成48字节强随机密钥
openssl rand -base64 48

# 输出示例:
# 0DL+Oi0E02Opk4EtSbxYFTJyz/hoiZ4pEfcuF6JKwoKgWQB4uYJsXjtOzjkxWxLF
```

### 2. 配置后端环境变量

```bash
cd /var/www/zhitoujianli
vim backend/get_jobs/.env

# 填写以下配置:
JWT_SECRET=<刚才生成的密钥>
JWT_EXPIRATION=7200000
AUTHING_USER_POOL_ID=<您的UserPoolID>
AUTHING_APP_ID=<您的AppID>
AUTHING_APP_SECRET=<您的AppSecret>
AUTHING_APP_HOST=https://<您的域名>.authing.cn
SECURITY_ENABLED=true
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=https://zhitoujianli.com,https://www.zhitoujianli.com
SPRING_PROFILES_ACTIVE=production
```

### 3. 配置前端环境变量

```bash
vim frontend/.env

# 填写以下配置:
REACT_APP_ENV=production
REACT_APP_API_URL=https://api.zhitoujianli.com
REACT_APP_DEBUG=false
```

### 4. 验证配置

```bash
# 检查JWT密钥长度
echo -n "您的JWT密钥" | wc -c
# 应该≥48

# 检查配置文件语法
grep "=" backend/get_jobs/.env | grep -v "^#" | grep -v "=$"
```

---

## 🐳 Docker部署

### 方案一：使用Docker Compose（推荐）

#### 1. 准备Docker Compose文件

已创建 `docker-compose.production.yml`，包含：
- 后端服务
- 前端服务
- Nginx反向代理
- Certbot（SSL证书）

#### 2. 构建镜像

```bash
# 构建所有服务
docker-compose -f docker-compose.production.yml build

# 或分别构建
docker-compose -f docker-compose.production.yml build backend
docker-compose -f docker-compose.production.yml build frontend
```

#### 3. 启动服务

```bash
# 启动所有服务
docker-compose -f docker-compose.production.yml up -d

# 查看启动日志
docker-compose -f docker-compose.production.yml logs -f
```

#### 4. 验证服务

```bash
# 查看服务状态
docker-compose -f docker-compose.production.yml ps

# 预期输出:
# NAME                      STATUS              PORTS
# zhitoujianli-backend      Up (healthy)        0.0.0.0:8080->8080/tcp
# zhitoujianli-frontend     Up                  0.0.0.0:3000->80/tcp
# zhitoujianli-nginx        Up                  0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### 方案二：手动部署（不使用Docker）

#### 后端部署

```bash
# 1. 构建JAR包
cd backend/get_jobs
mvn clean package -DskipTests -Pprod

# 2. 创建systemd服务
sudo cat > /etc/systemd/system/zhitoujianli-backend.service << 'SERVICE'
[Unit]
Description=ZhiTouJianLi Backend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/zhitoujianli/backend/get_jobs
ExecStart=/usr/bin/java -Xms512m -Xmx2g -jar target/get_jobs-v2.0.1.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

# 3. 启动服务
sudo systemctl daemon-reload
sudo systemctl enable zhitoujianli-backend
sudo systemctl start zhitoujianli-backend
sudo systemctl status zhitoujianli-backend
```

#### 前端部署

```bash
# 1. 构建前端
cd frontend
npm install
npm run build

# 2. 复制到Nginx目录
sudo cp -r build/* /var/www/zhitoujianli/frontend/build/

# 3. 设置权限
sudo chown -R www-data:www-data /var/www/zhitoujianli/frontend/build
```

---

## 🌐 Nginx配置

### 1. 安装Nginx（如需要）

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS
sudo yum install nginx
```

### 2. 配置Nginx

```bash
# 复制配置文件
sudo cp nginx-production.conf /etc/nginx/sites-available/zhitoujianli.conf
sudo ln -s /etc/nginx/sites-available/zhitoujianli.conf /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 3. 配置日志轮转

```bash
sudo cat > /etc/logrotate.d/zhitoujianli << 'LOGROTATE'
/var/log/nginx/zhitoujianli_*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
LOGROTATE
```

---

## 🔒 SSL证书配置

### 使用Let's Encrypt（推荐）

```bash
# 1. 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 2. 获取证书
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d zhitoujianli.com \
  -d www.zhitoujianli.com \
  --email your-email@example.com \
  --agree-tos

# 3. 自动续期
sudo certbot renew --dry-run

# 4. 配置自动续期任务
sudo crontab -e
# 添加以下行:
0 3 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx
```

### 使用已有证书

```bash
# 上传证书文件
scp your-domain.crt user@server:/etc/nginx/ssl/
scp your-domain.key user@server:/etc/nginx/ssl/

# 设置权限
sudo chmod 600 /etc/nginx/ssl/your-domain.key
sudo chmod 644 /etc/nginx/ssl/your-domain.crt
```

---

## 🚀 部署执行

### 一键部署（推荐）

```bash
# 执行部署脚本
cd /var/www/zhitoujianli
./deploy-production.sh
```

### 手动部署步骤

#### 步骤1: 拉取最新代码

```bash
cd /var/www/zhitoujianli
git pull origin main
```

#### 步骤2: 构建前端

```bash
cd frontend
npm install
npm run build
cd ..
```

#### 步骤3: 构建后端

```bash
cd backend/get_jobs
mvn clean package -DskipTests -Pprod
cd ../..
```

#### 步骤4: 启动Docker服务

```bash
docker-compose -f docker-compose.production.yml up -d --build
```

#### 步骤5: 检查服务状态

```bash
# 查看容器状态
docker-compose -f docker-compose.production.yml ps

# 查看日志
docker-compose -f docker-compose.production.yml logs -f
```

---

## ✅ 验证测试

### 1. 健康检查

```bash
# 后端健康检查
curl https://zhitoujianli.com/api/auth/health

# 预期响应:
# {"success":true,"authingConfigured":true,...}

# 前端页面检查
curl -I https://zhitoujianli.com

# 预期: HTTP/2 200
```

### 2. 功能测试

```bash
# 测试登录API
curl -X POST https://zhitoujianli.com/api/auth/login/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# 测试HTTPS重定向
curl -I http://zhitoujianli.com
# 预期: 301 Moved Permanently
```

### 3. 性能测试

```bash
# 使用ab进行压力测试
ab -n 1000 -c 100 https://zhitoujianli.com/

# 使用wrk测试
wrk -t12 -c400 -d30s https://zhitoujianli.com/
```

### 4. 安全测试

```bash
# SSL检查
openssl s_client -connect zhitoujianli.com:443 -servername zhitoujianli.com

# 安全头检查
curl -I https://zhitoujianli.com | grep -E "X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security"
```

---

## 📊 监控维护

### 1. 日志查看

```bash
# Docker日志
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f frontend

# Nginx日志
tail -f /var/log/nginx/zhitoujianli_access.log
tail -f /var/log/nginx/zhitoujianli_error.log

# 应用日志
tail -f logs/backend/application.log
```

### 2. 性能监控

```bash
# Docker容器资源使用
docker stats

# 系统资源
htop
free -h
df -h
```

### 3. 服务管理

```bash
# 重启服务
docker-compose -f docker-compose.production.yml restart

# 停止服务
docker-compose -f docker-compose.production.yml stop

# 启动服务
docker-compose -f docker-compose.production.yml start

# 完全停止并删除容器
docker-compose -f docker-compose.production.yml down
```

---

## 🔄 更新部署

### 零停机更新

```bash
# 1. 拉取新代码
git pull origin main

# 2. 构建新镜像
docker-compose -f docker-compose.production.yml build

# 3. 滚动更新
docker-compose -f docker-compose.production.yml up -d --no-deps --build backend
docker-compose -f docker-compose.production.yml up -d --no-deps --build frontend

# 4. 验证新版本
curl https://zhitoujianli.com/api/auth/health
```

---

## ⚠️ 故障处理

### 常见问题

#### 问题1: 服务无法启动

**症状**: Docker容器启动后立即退出

**排查**:
```bash
# 查看容器日志
docker-compose -f docker-compose.production.yml logs backend

# 检查配置文件
cat backend/get_jobs/.env | grep -v "^#"

# 检查端口占用
sudo netstat -tlnp | grep :8080
```

**解决**: 检查配置文件、端口冲突、权限问题

---

#### 问题2: 无法访问页面

**症状**: 浏览器无法打开网站

**排查**:
```bash
# 检查Nginx状态
sudo systemctl status nginx

# 检查DNS解析
nslookup zhitoujianli.com

# 检查防火墙
sudo ufw status
```

**解决**: 检查DNS、防火墙、Nginx配置

---

#### 问题3: API 502错误

**症状**: 前端可访问，API返回502

**排查**:
```bash
# 检查后端服务
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml logs backend

# 检查后端健康
curl http://localhost:8080/api/auth/health
```

**解决**: 重启后端服务、检查后端日志

---

#### 问题4: JWT验证失败

**症状**: 用户无法登录，提示Token无效

**排查**:
```bash
# 检查JWT配置
grep JWT_SECRET backend/get_jobs/.env

# 查看后端日志
docker-compose -f docker-compose.production.yml logs backend | grep JWT
```

**解决**: 检查JWT_SECRET配置、重启服务

---

## 🔙 回滚操作

### 快速回滚

```bash
# 1. 停止当前服务
docker-compose -f docker-compose.production.yml down

# 2. 恢复备份配置
cp backup/backup_YYYYMMDD_HHMMSS/.env backend/get_jobs/.env

# 3. 启动旧版本
docker-compose -f backup/backup_YYYYMMDD_HHMMSS/docker-compose.yml up -d

# 4. 验证
curl https://zhitoujianli.com/api/auth/health
```

---

## 📈 性能优化

### 1. Nginx优化

```nginx
# 启用HTTP/2
listen 443 ssl http2;

# 启用Gzip
gzip on;
gzip_comp_level 6;

# 静态文件缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
}
```

### 2. Docker优化

```yaml
# 资源限制
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

### 3. Java优化

```bash
# JVM参数优化
JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

---

## 🔐 安全加固

### 1. 系统安全

```bash
# 关闭不必要的服务
sudo systemctl disable cups
sudo systemctl disable bluetooth

# 配置自动更新
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 2. Docker安全

```bash
# 使用非root用户运行容器（已在Dockerfile中配置）
USER spring:spring

# 限制容器资源
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

### 3. 应用安全

- ✅ JWT密钥定期更换（每季度）
- ✅ 启用HTTPS
- ✅ 配置安全头
- ✅ 限制API请求频率
- ✅ 敏感操作记录审计日志

---

## 📞 部署支持

### 相关文档

| 文档 | 说明 |
|------|------|
| [PRODUCTION_DEPLOYMENT_CHECKLIST.md](./PRODUCTION_DEPLOYMENT_CHECKLIST.md) | 部署检查清单 |
| [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) | 环境配置指南 |
| [CODE_REVIEW_REPORT.md](./CODE_REVIEW_REPORT.md) | 代码审查报告 |
| [DEPLOYMENT_TEST_REPORT.md](./DEPLOYMENT_TEST_REPORT.md) | 测试报告 |

### 快速命令

```bash
# 查看服务状态
docker-compose -f docker-compose.production.yml ps

# 查看日志
docker-compose -f docker-compose.production.yml logs -f

# 重启服务
docker-compose -f docker-compose.production.yml restart

# 停止服务
docker-compose -f docker-compose.production.yml down
```

---

## 🎉 部署完成

部署完成后，请：

1. ✅ 填写部署检查清单
2. ✅ 进行完整功能测试
3. ✅ 配置监控告警
4. ✅ 通知团队成员
5. ✅ 更新运维文档

---

**祝部署顺利！** 🚀

如遇问题，请查看故障处理章节或联系技术支持团队。
