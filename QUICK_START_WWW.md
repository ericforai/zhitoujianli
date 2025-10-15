# 🚀 智投简历 - 快速部署指南 (www.zhitoujianli.com)

## ⚡ 5分钟快速部署

### 前提条件

✅ 域名已解析：`www.zhitoujianli.com` 和 `blog.zhitoujianli.com`
✅ 服务器已安装：Docker 和 Docker Compose
✅ 服务器开放端口：80 和 443

### 一键部署命令

```bash
cd /root/zhitoujianli
sudo ./quick-start-production.sh
```

**就这么简单！** 脚本会自动完成所有配置和启动。

---

## 📋 部署前准备（可选）

### 1. 配置SSL证书（推荐）

如果您有SSL证书：

```bash
# 将证书文件放到 ssl/ 目录
cp your-certificate.crt ssl/zhitoujianli.com.crt
cp your-private-key.key ssl/zhitoujianli.com.key
```

使用Let's Encrypt免费证书：

```bash
# 安装certbot
apt-get install certbot -y

# 获取证书（确保域名已解析）
certbot certonly --standalone \
  -d www.zhitoujianli.com \
  -d blog.zhitoujianli.com

# 复制证书
cp /etc/letsencrypt/live/www.zhitoujianli.com/fullchain.pem ssl/zhitoujianli.com.crt
cp /etc/letsencrypt/live/www.zhitoujianli.com/privkey.pem ssl/zhitoujianli.com.key
```

**没有证书？** 脚本会自动生成自签名证书（用于测试）。

### 2. 配置环境变量（推荐）

编辑后端配置：

```bash
nano backend/get_jobs/.env.production
```

修改以下重要配置：

```env
# 数据库配置
MYSQL_HOST=your_database_host
MYSQL_USERNAME=your_username
MYSQL_PASSWORD=your_secure_password

# JWT密钥（重要！必须修改）
JWT_SECRET=your_random_secure_jwt_secret_key_at_least_32_characters

# API密钥（如需要）
DEEPSEEK_API_KEY=your_deepseek_api_key
```

**没有配置？** 脚本会创建默认配置，之后可以修改。

---

## 🎯 访问您的网站

部署完成后，访问以下地址：

### 主站

```
https://www.zhitoujianli.com
```

### Blog（两种访问方式）

```
https://blog.zhitoujianli.com           ← 独立子域名
https://www.zhitoujianli.com/blog/      ← 主站路径
```

---

## ✅ 验证部署

### 1. 检查服务状态

```bash
docker-compose -f docker-compose.production.yml ps
```

应该看到4个服务都在运行：

- ✅ `zhitoujianli-backend` - 后端
- ✅ `zhitoujianli-frontend` - 前端
- ✅ `zhitoujianli-blog` - Blog
- ✅ `zhitoujianli-nginx` - Nginx

### 2. 快速健康检查

```bash
# 后端
curl http://localhost:8080/api/auth/health

# 前端
curl http://localhost:3000

# Blog
curl http://localhost:4321

# Nginx
curl http://localhost
```

全部返回正常响应即可！

---

## 🛠️ 常用命令

### 查看日志

```bash
# 实时查看所有日志
docker-compose -f docker-compose.production.yml logs -f

# 查看特定服务
docker-compose -f docker-compose.production.yml logs -f blog
docker-compose -f docker-compose.production.yml logs -f nginx
```

### 重启服务

```bash
# 重启所有
docker-compose -f docker-compose.production.yml restart

# 重启blog
docker-compose -f docker-compose.production.yml restart blog nginx
```

### 停止服务

```bash
docker-compose -f docker-compose.production.yml down
```

---

## 🐛 常见问题

### Blog无法访问？

#### 快速修复

```bash
# 重启blog和nginx
docker-compose -f docker-compose.production.yml restart blog nginx

# 查看blog日志
docker logs zhitoujianli-blog

# 测试blog端口
curl http://localhost:4321
```

#### 检查域名解析

```bash
# 确认域名已解析
nslookup blog.zhitoujianli.com

# 应该返回您的服务器IP
```

### SSL证书错误？

#### 使用Let's Encrypt

```bash
# 停止nginx
docker-compose -f docker-compose.production.yml stop nginx

# 获取证书
certbot certonly --standalone -d www.zhitoujianli.com -d blog.zhitoujianli.com

# 复制证书
cp /etc/letsencrypt/live/www.zhitoujianli.com/fullchain.pem ssl/zhitoujianli.com.crt
cp /etc/letsencrypt/live/www.zhitoujianli.com/privkey.pem ssl/zhitoujianli.com.key

# 重启nginx
docker-compose -f docker-compose.production.yml start nginx
```

### 端口冲突？

#### 检查端口占用

```bash
# 查看端口占用
netstat -tulpn | grep -E "(80|443|8080|3000|4321)"

# 停止占用端口的进程
kill -9 <PID>
```

### 防火墙问题？

#### 开放必要端口

```bash
# 开放HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 查看防火墙状态
ufw status
```

---

## 📊 监控和维护

### 查看资源使用

```bash
# 查看容器资源
docker stats

# 查看磁盘空间
df -h
```

### 查看访问日志

```bash
# 主站访问日志
tail -f logs/nginx/zhitoujianli_access.log

# Blog访问日志
tail -f logs/nginx/blog_access.log

# 错误日志
tail -f logs/nginx/*_error.log
```

### 定期清理

```bash
# 清理Docker缓存
docker system prune -f

# 清理日志（保留最近7天）
find logs/ -name "*.log" -mtime +7 -delete
```

---

## 🔄 更新代码

### 更新前端

```bash
cd frontend
npm run build
cd ..
docker-compose -f docker-compose.production.yml restart frontend nginx
```

### 更新后端

```bash
cd backend/get_jobs
mvn clean package -DskipTests
cd ../..
docker-compose -f docker-compose.production.yml up -d --build backend
```

### 更新Blog

```bash
cd blog/zhitoujianli-blog
npm run build
cd ../..
docker-compose -f docker-compose.production.yml up -d --build blog
docker-compose -f docker-compose.production.yml restart nginx
```

---

## 📚 更多文档

- **详细部署文档**: `PRODUCTION_DEPLOYMENT_WWW.md`
- **部署总结**: `DEPLOYMENT_SUMMARY_WWW.md`
- **完整部署脚本**: `deploy-www.sh`
- **快速启动脚本**: `quick-start-production.sh`

---

## 🎉 完成！

恭喜您完成部署！您的网站现在可以通过以下地址访问：

- 🌐 **主站**: https://www.zhitoujianli.com
- 📝 **Blog**: https://blog.zhitoujianli.com
- 📝 **Blog路径**: https://www.zhitoujianli.com/blog/

如有问题，请查看日志：

```bash
docker-compose -f docker-compose.production.yml logs -f
```

**祝您使用愉快！** 🚀

