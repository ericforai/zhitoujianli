# 智投简历 - 生产环境部署指南 (www.zhitoujianli.com)

## 📋 部署前检查清单

### 1. 域名配置

确保以下域名已正确解析到服务器IP：

- ✅ `www.zhitoujianli.com` → 服务器IP
- ✅ `zhitoujianli.com` → 服务器IP
- ✅ `blog.zhitoujianli.com` → 服务器IP

验证方法：

```bash
# 检查域名解析
nslookup www.zhitoujianli.com
nslookup blog.zhitoujianli.com
ping www.zhitoujianli.com
```

### 2. SSL证书配置

将SSL证书放置到 `ssl/` 目录：

```
ssl/
├── zhitoujianli.com.crt  # SSL证书
└── zhitoujianli.com.key  # 私钥
```

如果没有SSL证书，可以使用Let's Encrypt获取免费证书：

```bash
# 安装certbot
apt-get install certbot python3-certbot-nginx -y

# 获取证书
certbot certonly --nginx -d www.zhitoujianli.com -d blog.zhitoujianli.com

# 复制证书到项目目录
cp /etc/letsencrypt/live/www.zhitoujianli.com/fullchain.pem ssl/zhitoujianli.com.crt
cp /etc/letsencrypt/live/www.zhitoujianli.com/privkey.pem ssl/zhitoujianli.com.key
```

### 3. 环境变量配置

编辑后端环境变量文件：

```bash
nano backend/get_jobs/.env.production
```

必须配置的参数：

```env
# 数据库配置
MYSQL_HOST=your_mysql_host
MYSQL_PORT=3306
MYSQL_DATABASE=zhitoujianli
MYSQL_USERNAME=your_username
MYSQL_PASSWORD=your_password

# JWT密钥（必须修改）
JWT_SECRET=your_secure_random_jwt_secret_key

# Authing配置
AUTHING_APP_ID=your_authing_app_id
AUTHING_APP_SECRET=your_authing_app_secret
AUTHING_USER_POOL_ID=your_user_pool_id

# DeepSeek API
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 4. Docker环境检查

```bash
# 检查Docker版本
docker --version
docker-compose --version

# 确保Docker服务运行
systemctl status docker
```

---

## 🚀 快速部署

### 方式一：使用一键部署脚本（推荐）

```bash
# 确保在项目根目录
cd /root/zhitoujianli

# 使用root权限运行部署脚本
sudo ./deploy-www.sh
```

脚本会自动完成：

1. ✅ 停止现有服务
2. ✅ 创建必要目录
3. ✅ 检查SSL证书
4. ✅ 构建前端、后端、Blog
5. ✅ 启动Docker服务
6. ✅ 执行健康检查

### 方式二：手动部署

#### 步骤1：停止现有服务

```bash
# 停止Docker容器
docker-compose -f docker-compose.production.yml down

# 清理旧容器
docker container prune -f
docker image prune -f
```

#### 步骤2：构建前端

```bash
cd frontend
npm ci
REACT_APP_API_URL=https://www.zhitoujianli.com npm run build
cd ..
```

#### 步骤3：构建后端

```bash
cd backend/get_jobs
mvn clean package -DskipTests
cd ../..
```

#### 步骤4：构建Blog

```bash
cd blog/zhitoujianli-blog
npm ci
npm run build
cd ../..
```

#### 步骤5：创建必要目录

```bash
mkdir -p logs/nginx ssl certbot/conf certbot/www backend/get_jobs/data
```

#### 步骤6：启动所有服务

```bash
# 使用Docker Compose启动
docker-compose -f docker-compose.production.yml up -d --build

# 查看启动日志
docker-compose -f docker-compose.production.yml logs -f
```

---

## 🔍 健康检查

### 检查服务状态

```bash
# 查看所有容器状态
docker-compose -f docker-compose.production.yml ps

# 检查后端健康
curl http://localhost:8080/api/auth/health

# 检查前端
curl http://localhost:3000

# 检查Blog
curl http://localhost:4321

# 检查Nginx
curl http://localhost
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose -f docker-compose.production.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f frontend
docker-compose -f docker-compose.production.yml logs -f blog
docker-compose -f docker-compose.production.yml logs -f nginx

# 查看Nginx日志
tail -f logs/nginx/zhitoujianli_access.log
tail -f logs/nginx/zhitoujianli_error.log
tail -f logs/nginx/blog_access.log
tail -f logs/nginx/blog_error.log
```

---

## 🌐 访问地址

部署成功后，可以通过以下地址访问：

### 主要服务

- **主站首页**: https://www.zhitoujianli.com
- **Blog首页**: https://blog.zhitoujianli.com
- **Blog路径访问**: https://www.zhitoujianli.com/blog/

### 内部服务（仅服务器本地访问）

- **后端API**: http://localhost:8080/api
- **前端开发**: http://localhost:3000
- **Blog开发**: http://localhost:4321

---

## 🛠️ 常用管理命令

### 服务管理

```bash
# 启动所有服务
docker-compose -f docker-compose.production.yml up -d

# 停止所有服务
docker-compose -f docker-compose.production.yml down

# 重启所有服务
docker-compose -f docker-compose.production.yml restart

# 重启单个服务
docker-compose -f docker-compose.production.yml restart backend
docker-compose -f docker-compose.production.yml restart frontend
docker-compose -f docker-compose.production.yml restart blog
docker-compose -f docker-compose.production.yml restart nginx

# 查看服务状态
docker-compose -f docker-compose.production.yml ps

# 查看资源占用
docker stats
```

### 重新构建服务

```bash
# 重新构建所有服务
docker-compose -f docker-compose.production.yml up -d --build

# 重新构建特定服务
docker-compose -f docker-compose.production.yml up -d --build backend
docker-compose -f docker-compose.production.yml up -d --build frontend
docker-compose -f docker-compose.production.yml up -d --build blog
```

### 数据库管理

```bash
# 进入后端容器
docker exec -it zhitoujianli-backend bash

# 查看数据库连接
docker exec -it zhitoujianli-backend curl localhost:8080/api/auth/health
```

### 清理与维护

```bash
# 清理未使用的容器
docker container prune -f

# 清理未使用的镜像
docker image prune -f

# 清理未使用的卷
docker volume prune -f

# 清理所有未使用资源
docker system prune -af --volumes
```

---

## 🐛 常见问题排查

### 1. Blog无法访问

**问题现象**：

- `https://blog.zhitoujianli.com` 无法访问
- 或 `https://www.zhitoujianli.com/blog/` 返回502/504

**排查步骤**：

```bash
# 1. 检查blog容器是否运行
docker ps | grep blog

# 2. 检查blog容器日志
docker logs zhitoujianli-blog

# 3. 检查blog服务端口
curl http://localhost:4321

# 4. 检查Nginx配置
docker exec -it zhitoujianli-nginx nginx -t

# 5. 重启blog服务
docker-compose -f docker-compose.production.yml restart blog
```

### 2. SSL证书问题

**问题现象**：

- 浏览器提示"证书不安全"
- 或无法建立HTTPS连接

**解决方案**：

```bash
# 检查证书文件
ls -la ssl/

# 检查证书有效期
openssl x509 -in ssl/zhitoujianli.com.crt -noout -dates

# 重新获取Let's Encrypt证书
certbot renew --force-renewal

# 重启Nginx
docker-compose -f docker-compose.production.yml restart nginx
```

### 3. 后端API无响应

**问题现象**：

- API请求超时或返回502

**排查步骤**：

```bash
# 1. 检查后端容器状态
docker ps | grep backend

# 2. 查看后端日志
docker logs zhitoujianli-backend

# 3. 检查后端健康接口
curl http://localhost:8080/api/auth/health

# 4. 检查环境变量
docker exec -it zhitoujianli-backend env | grep -E "(MYSQL|JWT|AUTHING)"

# 5. 重启后端服务
docker-compose -f docker-compose.production.yml restart backend
```

### 4. 前端静态资源404

**问题现象**：

- 前端页面加载但样式丢失
- 或JS/CSS文件404

**排查步骤**：

```bash
# 1. 检查前端构建产物
ls -la frontend/build/

# 2. 检查Nginx挂载
docker exec -it zhitoujianli-nginx ls -la /var/www/zhitoujianli/frontend/build/

# 3. 重新构建前端
cd frontend && npm run build && cd ..

# 4. 重启服务
docker-compose -f docker-compose.production.yml restart frontend nginx
```

### 5. 域名解析问题

**问题现象**：

- 域名无法访问
- 或DNS解析失败

**排查步骤**：

```bash
# 检查域名解析
nslookup www.zhitoujianli.com
nslookup blog.zhitoujianli.com

# 检查服务器端口监听
netstat -tulpn | grep -E "(80|443)"

# 检查防火墙
ufw status
iptables -L -n

# 开放必要端口
ufw allow 80/tcp
ufw allow 443/tcp
```

---

## 📊 性能监控

### 实时监控

```bash
# 查看容器资源使用
docker stats

# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看网络连接
netstat -tupln
```

### 日志监控

```bash
# 监控Nginx访问日志
tail -f logs/nginx/zhitoujianli_access.log

# 监控Nginx错误日志
tail -f logs/nginx/zhitoujianli_error.log

# 监控Blog访问日志
tail -f logs/nginx/blog_access.log

# 分析访问日志
cat logs/nginx/zhitoujianli_access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head -10
```

---

## 🔐 安全加固

### 1. 防火墙配置

```bash
# 启用UFW防火墙
ufw enable

# 仅开放必要端口
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS

# 查看防火墙状态
ufw status verbose
```

### 2. 定期更新证书

```bash
# 设置自动续期
echo "0 0 * * * certbot renew --quiet && docker-compose -f /root/zhitoujianli/docker-compose.production.yml restart nginx" | crontab -
```

### 3. 备份数据

```bash
# 备份数据库
docker exec zhitoujianli-backend bash -c "mysqldump -h \$MYSQL_HOST -u \$MYSQL_USERNAME -p\$MYSQL_PASSWORD \$MYSQL_DATABASE > /app/data/backup_$(date +%Y%m%d).sql"

# 备份配置文件
tar -czf backup_config_$(date +%Y%m%d).tar.gz \
  docker-compose.production.yml \
  nginx-production.conf \
  backend/get_jobs/.env.production \
  ssl/
```

---

## 📝 部署检查清单

完成以下检查，确保部署正确：

- [ ] 域名DNS解析正确
- [ ] SSL证书已配置
- [ ] 环境变量已设置
- [ ] 后端服务正常 (curl http://localhost:8080/api/auth/health)
- [ ] 前端服务正常 (curl http://localhost:3000)
- [ ] Blog服务正常 (curl http://localhost:4321)
- [ ] Nginx服务正常 (curl http://localhost)
- [ ] 主站可访问 (https://www.zhitoujianli.com)
- [ ] Blog可访问 (https://blog.zhitoujianli.com)
- [ ] Blog路径可访问 (https://www.zhitoujianli.com/blog/)
- [ ] API接口正常
- [ ] 防火墙已配置
- [ ] 日志正常输出
- [ ] 备份机制已设置

---

## 🆘 紧急回滚

如果部署出现严重问题，可以快速回滚：

```bash
# 1. 停止新版本服务
docker-compose -f docker-compose.production.yml down

# 2. 恢复备份的配置文件
tar -xzf backup_config_YYYYMMDD.tar.gz

# 3. 使用旧版本镜像启动
docker-compose -f docker-compose.production.yml up -d

# 4. 检查服务状态
docker-compose -f docker-compose.production.yml ps
```

---

## 📞 技术支持

如遇到无法解决的问题：

1. 查看详细日志：`docker-compose logs -f`
2. 检查系统资源：`docker stats`
3. 查阅项目文档：`README.md`
4. 提交Issue：GitHub Issues

---

**部署完成后，建议进行一次完整的功能测试！**

