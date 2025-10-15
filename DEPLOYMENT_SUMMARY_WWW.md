# 🚀 智投简历 - 域名部署完成总结

## ✅ 已完成的配置

### 1. Nginx配置更新

✅ 已更新 `nginx-production.conf`，添加了以下功能：

- 主站域名支持：`www.zhitoujianli.com`
- Blog子域名支持：`blog.zhitoujianli.com`
- Blog路径访问：`/blog/`
- Docker网络内部服务代理
- HTTPS和SSL支持
- 安全头部配置
- Gzip压缩
- 静态文件缓存

### 2. Docker Compose配置更新

✅ 已更新 `docker-compose.production.yml`，添加了：

- Blog服务容器配置
- Nginx依赖Blog服务
- 资源限制配置
- 健康检查

### 3. Blog配置更新

✅ 已更新 `blog/zhitoujianli-blog/nginx.conf`，添加了：

- 域名支持：`blog.zhitoujianli.com`
- 端口监听：4321

### 4. 部署脚本

✅ 已创建完整的部署工具：

- `deploy-www.sh` - 完整部署脚本
- `quick-start-production.sh` - 快速启动脚本
- `PRODUCTION_DEPLOYMENT_WWW.md` - 详细部署文档

---

## 🎯 域名访问方式

您的网站现在支持以下访问方式：

### 主站

```
https://www.zhitoujianli.com          ← 主站首页
https://www.zhitoujianli.com/blog/    ← Blog (通过路径)
```

### Blog独立子域名

```
https://blog.zhitoujianli.com         ← Blog独立访问
```

### HTTP自动重定向

所有HTTP请求会自动重定向到HTTPS：

```
http://www.zhitoujianli.com    → https://www.zhitoujianli.com
http://blog.zhitoujianli.com   → https://blog.zhitoujianli.com
```

---

## 🚀 快速部署步骤

### 方法一：使用快速启动脚本（推荐）

```bash
cd /root/zhitoujianli
sudo ./quick-start-production.sh
```

这个脚本会：

1. 停止现有服务
2. 清理旧容器
3. 检查SSL证书（如没有则生成自签名证书）
4. 检查环境变量
5. 启动所有Docker服务
6. 执行健康检查

### 方法二：使用完整部署脚本

```bash
cd /root/zhitoujianli
sudo ./deploy-www.sh
```

这个脚本会执行完整的构建和部署流程。

### 方法三：手动启动

```bash
cd /root/zhitoujianli

# 启动所有服务
docker-compose -f docker-compose.production.yml up -d --build

# 查看启动日志
docker-compose -f docker-compose.production.yml logs -f
```

---

## 📋 部署前检查清单

在部署之前，请确保：

### 1. DNS解析配置 ✓

```bash
# 验证域名解析
nslookup www.zhitoujianli.com
nslookup blog.zhitoujianli.com

# 应该返回您的服务器IP
```

### 2. SSL证书配置

将SSL证书放到 `ssl/` 目录：

```
ssl/
├── zhitoujianli.com.crt
└── zhitoujianli.com.key
```

如果没有证书，脚本会自动生成自签名证书（测试用）。

**生产环境建议使用Let's Encrypt获取免费证书**：

```bash
# 安装certbot
apt-get install certbot python3-certbot-nginx -y

# 获取证书（需要域名已解析到服务器）
certbot certonly --standalone -d www.zhitoujianli.com -d blog.zhitoujianli.com

# 复制证书
cp /etc/letsencrypt/live/www.zhitoujianli.com/fullchain.pem ssl/zhitoujianli.com.crt
cp /etc/letsencrypt/live/www.zhitoujianli.com/privkey.pem ssl/zhitoujianli.com.key
```

### 3. 环境变量配置

编辑 `backend/get_jobs/.env.production`，修改：

```env
# 数据库配置（必须修改）
MYSQL_HOST=your_mysql_host
MYSQL_USERNAME=your_username
MYSQL_PASSWORD=your_password

# JWT密钥（必须修改）
JWT_SECRET=your_secure_jwt_secret

# Authing配置（如使用）
AUTHING_APP_ID=your_app_id
AUTHING_APP_SECRET=your_app_secret

# DeepSeek API（如使用）
DEEPSEEK_API_KEY=your_api_key
```

### 4. 防火墙配置

确保开放必要端口：

```bash
# 开放HTTP和HTTPS端口
ufw allow 80/tcp
ufw allow 443/tcp

# 查看防火墙状态
ufw status
```

---

## 🔍 健康检查

部署完成后，执行以下检查：

### 1. 检查Docker容器状态

```bash
docker-compose -f docker-compose.production.yml ps
```

应该看到4个容器都在运行：

- `zhitoujianli-backend` - 后端服务
- `zhitoujianli-frontend` - 前端服务
- `zhitoujianli-blog` - Blog服务
- `zhitoujianli-nginx` - Nginx代理

### 2. 检查服务健康

```bash
# 后端健康检查
curl http://localhost:8080/api/auth/health

# 前端检查
curl http://localhost:3000

# Blog检查
curl http://localhost:4321

# Nginx检查
curl http://localhost
```

### 3. 检查域名访问

在浏览器中访问：

- ✅ `https://www.zhitoujianli.com` - 应该看到主站首页
- ✅ `https://blog.zhitoujianli.com` - 应该看到Blog页面
- ✅ `https://www.zhitoujianli.com/blog/` - 应该看到Blog页面

### 4. 查看日志

```bash
# 查看所有服务日志
docker-compose -f docker-compose.production.yml logs -f

# 查看Nginx日志
tail -f logs/nginx/zhitoujianli_access.log
tail -f logs/nginx/blog_access.log

# 查看特定服务日志
docker logs zhitoujianli-blog
docker logs zhitoujianli-nginx
```

---

## 🛠️ 常用管理命令

### 服务管理

```bash
# 查看服务状态
docker-compose -f docker-compose.production.yml ps

# 查看日志
docker-compose -f docker-compose.production.yml logs -f

# 重启所有服务
docker-compose -f docker-compose.production.yml restart

# 重启单个服务
docker-compose -f docker-compose.production.yml restart blog
docker-compose -f docker-compose.production.yml restart nginx

# 停止所有服务
docker-compose -f docker-compose.production.yml down

# 查看资源占用
docker stats
```

### 更新服务

```bash
# 更新前端代码后
cd frontend && npm run build && cd ..
docker-compose -f docker-compose.production.yml restart frontend nginx

# 更新后端代码后
cd backend/get_jobs && mvn clean package -DskipTests && cd ../..
docker-compose -f docker-compose.production.yml up -d --build backend

# 更新Blog代码后
cd blog/zhitoujianli-blog && npm run build && cd ../..
docker-compose -f docker-compose.production.yml up -d --build blog
docker-compose -f docker-compose.production.yml restart nginx
```

---

## 🐛 故障排查

### Blog无法访问

#### 问题1：`blog.zhitoujianli.com` 无法访问

```bash
# 1. 检查域名解析
nslookup blog.zhitoujianli.com

# 2. 检查blog容器状态
docker ps | grep blog

# 3. 查看blog日志
docker logs zhitoujianli-blog

# 4. 测试blog端口
curl http://localhost:4321

# 5. 重启blog服务
docker-compose -f docker-compose.production.yml restart blog nginx
```

#### 问题2：返回502/504错误

```bash
# 1. 检查nginx配置
docker exec -it zhitoujianli-nginx nginx -t

# 2. 查看nginx错误日志
tail -f logs/nginx/blog_error.log

# 3. 检查blog容器是否健康
docker exec -it zhitoujianli-blog wget -O- http://localhost:4321

# 4. 重启服务
docker-compose -f docker-compose.production.yml restart blog nginx
```

### SSL证书问题

#### 使用Let's Encrypt获取免费证书

```bash
# 1. 停止nginx（避免端口冲突）
docker-compose -f docker-compose.production.yml stop nginx

# 2. 获取证书
certbot certonly --standalone \
  -d www.zhitoujianli.com \
  -d blog.zhitoujianli.com \
  --agree-tos \
  --email your-email@example.com

# 3. 复制证书到项目目录
cp /etc/letsencrypt/live/www.zhitoujianli.com/fullchain.pem ssl/zhitoujianli.com.crt
cp /etc/letsencrypt/live/www.zhitoujianli.com/privkey.pem ssl/zhitoujianli.com.key

# 4. 设置权限
chmod 644 ssl/zhitoujianli.com.crt
chmod 600 ssl/zhitoujianli.com.key

# 5. 重启nginx
docker-compose -f docker-compose.production.yml start nginx
```

#### 自动续期证书

```bash
# 添加定时任务
echo "0 0 * * * certbot renew --quiet --deploy-hook 'docker-compose -f /root/zhitoujianli/docker-compose.production.yml restart nginx'" | crontab -

# 测试续期
certbot renew --dry-run
```

### 性能问题

#### 查看资源使用

```bash
# 查看容器资源
docker stats

# 查看系统资源
htop

# 查看磁盘空间
df -h
```

#### 清理Docker资源

```bash
# 清理未使用的容器
docker container prune -f

# 清理未使用的镜像
docker image prune -f

# 清理所有未使用资源
docker system prune -af
```

---

## 📊 监控和日志

### 日志位置

```
logs/
├── nginx/
│   ├── zhitoujianli_access.log    # 主站访问日志
│   ├── zhitoujianli_error.log     # 主站错误日志
│   ├── blog_access.log             # Blog访问日志
│   └── blog_error.log              # Blog错误日志
└── backend/                        # 后端日志
```

### 实时监控日志

```bash
# 监控所有Nginx访问
tail -f logs/nginx/*_access.log

# 监控所有错误
tail -f logs/nginx/*_error.log

# 监控特定服务
docker-compose -f docker-compose.production.yml logs -f blog
```

### 分析访问日志

```bash
# 统计访问IP
cat logs/nginx/zhitoujianli_access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head -10

# 统计访问URL
cat logs/nginx/zhitoujianli_access.log | awk '{print $7}' | sort | uniq -c | sort -nr | head -10

# 统计状态码
cat logs/nginx/zhitoujianli_access.log | awk '{print $9}' | sort | uniq -c | sort -nr
```

---

## 📝 下一步操作

### 1. 测试所有功能

- [ ] 访问主站首页
- [ ] 访问Blog独立域名
- [ ] 访问Blog路径
- [ ] 测试用户注册/登录
- [ ] 测试简历上传
- [ ] 测试职位匹配
- [ ] 测试API接口

### 2. 性能优化

- [ ] 配置CDN（如需要）
- [ ] 启用Redis缓存
- [ ] 数据库优化
- [ ] 静态资源压缩

### 3. 安全加固

- [ ] 配置防火墙
- [ ] 设置SSL证书自动续期
- [ ] 配置备份策略
- [ ] 设置监控告警

### 4. 持续监控

- [ ] 设置日志轮转
- [ ] 配置性能监控
- [ ] 设置错误告警
- [ ] 定期备份数据

---

## 🎉 总结

✅ 配置已全部完成！

现在您的网站支持：

- ✅ 主站：`https://www.zhitoujianli.com`
- ✅ Blog独立域名：`https://blog.zhitoujianli.com`
- ✅ Blog路径访问：`https://www.zhitoujianli.com/blog/`
- ✅ HTTPS加密
- ✅ Docker容器化部署
- ✅ Nginx反向代理
- ✅ 自动健康检查

**立即开始部署：**

```bash
cd /root/zhitoujianli
sudo ./quick-start-production.sh
```

**查看详细文档：**

```bash
cat PRODUCTION_DEPLOYMENT_WWW.md
```

---

**祝您部署顺利！如有问题，请查看日志或参考故障排查部分。** 🚀

