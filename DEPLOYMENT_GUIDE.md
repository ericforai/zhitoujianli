# 智投简历 - 部署指南

> **环境**: 火山云服务器 (115.190.182.95)
> **更新时间**: 2025-10-16
> **状态**: 生产环境

---

## 📋 目录

- [环境配置](#环境配置)
- [快速部署](#快速部署)
- [详细部署步骤](#详细部署步骤)
- [环境验证](#环境验证)
- [常见问题](#常见问题)
- [服务管理](#服务管理)

---

## 🔧 环境配置

### 1. 环境变量文件

项目已统一配置以下环境变量文件：

#### 前端环境变量

- **生产环境**: `/root/zhitoujianli/frontend/.env.production`

  ```bash
  REACT_APP_API_URL=/api
  REACT_APP_BACKEND_URL=https://www.zhitoujianli.com
  NODE_ENV=production
  REACT_APP_ENV=production
  REACT_APP_DEBUG=false
  GENERATE_SOURCEMAP=false
  ```

- **开发环境**: `/root/zhitoujianli/frontend/.env.development`
  ```bash
  REACT_APP_API_URL=/api
  REACT_APP_BACKEND_URL=http://115.190.182.95:8080
  NODE_ENV=development
  REACT_APP_ENV=development
  REACT_APP_DEBUG=true
  ```

#### 后端环境变量

- **配置文件**: `/root/zhitoujianli/backend/get_jobs/.env`

  **⚠️ 重要**: 请修改以下默认值：
  - `JWT_SECRET`: JWT 密钥（至少32字符）
  - `DB_PASSWORD`: 数据库密码
  - `AUTHING_APP_ID`, `AUTHING_APP_SECRET`: Authing 认证配置
  - `DEEPSEEK_API_KEY`: DeepSeek AI API 密钥

### 2. Nginx 配置

- **项目配置**: `/root/zhitoujianli/zhitoujianli.conf`
- **系统配置**: `/etc/nginx/sites-available/zhitoujianli`
- **已启用**: `/etc/nginx/sites-enabled/zhitoujianli` (软链接)

**配置要点**:

- ✅ HTTP 自动重定向到 HTTPS
- ✅ API 反向代理到后端 (8080端口)
- ✅ 前端 SPA 路由支持
- ✅ WebSocket 支持
- ✅ Gzip 压缩
- ✅ SSL 证书配置
- ✅ 安全响应头

---

## 🚀 快速部署

### 方式一：使用部署脚本（推荐）

```bash
# 进入项目目录
cd /root/zhitoujianli

# 部署所有服务（前端 + 后端 + Nginx）
sudo bash scripts/deploy.sh all

# 或者单独部署
sudo bash scripts/deploy.sh frontend   # 仅部署前端
sudo bash scripts/deploy.sh backend    # 仅部署后端
sudo bash scripts/deploy.sh nginx      # 仅更新Nginx配置
```

### 方式二：手动部署

详见 [详细部署步骤](#详细部署步骤)

---

## 📖 详细部署步骤

### 1. 前端部署

```bash
# 进入前端目录
cd /root/zhitoujianli/frontend

# 确保环境变量文件存在
ls -la .env.production

# 安装依赖（首次部署或依赖更新时）
npm install

# 构建生产版本
npm run build

# 验证构建产物
ls -la build/
```

**构建产物位置**: `/root/zhitoujianli/frontend/build/`

### 2. 后端部署

```bash
# 进入后端目录
cd /root/zhitoujianli/backend/get_jobs

# 确保环境变量文件存在并已配置
cat .env | grep -E "(JWT_SECRET|DB_PASSWORD|AUTHING)"

# Maven 构建（跳过测试）
mvn clean package -DskipTests

# 停止旧的后端服务
pkill -f "get_jobs-v2.0.1.jar" || true

# 启动新的后端服务
nohup java -jar target/get_jobs-v2.0.1.jar > logs/backend.log 2>&1 &

# 保存进程ID
echo $! > backend.pid

# 验证服务启动
tail -f logs/backend.log
```

**JAR 文件位置**: `/root/zhitoujianli/backend/get_jobs/target/get_jobs-v2.0.1.jar`

### 3. Nginx 配置更新

```bash
# 复制配置到系统目录
sudo cp /root/zhitoujianli/zhitoujianli.conf /etc/nginx/sites-available/zhitoujianli

# 创建软链接（如果不存在）
sudo ln -sf /etc/nginx/sites-available/zhitoujianli /etc/nginx/sites-enabled/zhitoujianli

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx

# 检查状态
sudo systemctl status nginx
```

---

## ✅ 环境验证

### 使用验证脚本

```bash
# 运行环境验证脚本
bash /root/zhitoujianli/scripts/verify-env.sh
```

验证脚本会检查：

- ✓ 环境变量文件
- ✓ Nginx 配置
- ✓ SSL 证书
- ✓ 服务状态
- ✓ 端口监听
- ✓ 构建产物
- ✓ 系统依赖

### 手动验证

```bash
# 1. 检查 Nginx 状态
sudo systemctl status nginx

# 2. 检查后端服务
ps aux | grep get_jobs-v2.0.1.jar

# 3. 检查端口监听
netstat -tlnp | grep -E ':(80|443|8080)'

# 4. 测试 API 访问
curl -I https://www.zhitoujianli.com
curl -I https://www.zhitoujianli.com/api/health

# 5. 查看日志
tail -f /var/log/nginx/zhitoujianli_access.log
tail -f /var/log/nginx/zhitoujianli_error.log
tail -f /root/zhitoujianli/backend/get_jobs/logs/backend.log
```

---

## 🔍 常见问题

### Q1: 部署后前端页面显示空白

**解决方案**:

```bash
# 检查前端构建目录
ls -la /root/zhitoujianli/frontend/build/

# 检查 Nginx 配置中的 root 路径
grep "root" /etc/nginx/sites-enabled/zhitoujianli

# 确保路径为: /root/zhitoujianli/frontend/build
```

### Q2: API 请求 404 错误

**解决方案**:

```bash
# 检查后端服务是否运行
ps aux | grep get_jobs-v2.0.1.jar

# 检查后端端口
netstat -tlnp | grep 8080

# 查看后端日志
tail -f /root/zhitoujianli/backend/get_jobs/logs/backend.log
```

### Q3: CORS 跨域错误

**解决方案**:

- 检查后端 `.env` 文件中的 `ALLOWED_ORIGINS` 配置
- 确保包含所有需要的域名
- 重启后端服务使配置生效

### Q4: SSL 证书错误

**解决方案**:

```bash
# 检查证书文件
ls -la /etc/letsencrypt/live/zhitoujianli.com/

# 检查证书有效期
openssl x509 -enddate -noout -in /etc/letsencrypt/live/zhitoujianli.com/fullchain.pem

# 如需续签证书
sudo certbot renew
```

### Q5: 数据库连接失败

**解决方案**:

```bash
# 检查 PostgreSQL 服务
sudo systemctl status postgresql

# 测试数据库连接
psql -U postgres -d zhitoujianli

# 检查后端 .env 配置
cat /root/zhitoujianli/backend/get_jobs/.env | grep DB_
```

---

## 🛠️ 服务管理

### Nginx 服务

```bash
# 启动
sudo systemctl start nginx

# 停止
sudo systemctl stop nginx

# 重启
sudo systemctl restart nginx

# 重载配置（不中断服务）
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx

# 查看日志
tail -f /var/log/nginx/zhitoujianli_access.log
tail -f /var/log/nginx/zhitoujianli_error.log
```

### 后端服务

```bash
# 启动（后台运行）
cd /root/zhitoujianli/backend/get_jobs
nohup java -jar target/get_jobs-v2.0.1.jar > logs/backend.log 2>&1 &
echo $! > backend.pid

# 停止
kill $(cat backend.pid)
# 或强制停止
pkill -f "get_jobs-v2.0.1.jar"

# 重启
pkill -f "get_jobs-v2.0.1.jar"
sleep 2
nohup java -jar target/get_jobs-v2.0.1.jar > logs/backend.log 2>&1 &
echo $! > backend.pid

# 查看日志
tail -f logs/backend.log

# 查看进程
ps aux | grep get_jobs-v2.0.1.jar
```

### 开发服务器（仅开发环境）

```bash
# 前端开发服务器
cd /root/zhitoujianli/frontend
npm start
# 访问: http://115.190.182.95:3000

# 后端开发模式
cd /root/zhitoujianli/backend/get_jobs
mvn spring-boot:run
```

---

## 📝 部署检查清单

部署前请确认：

- [ ] 所有环境变量文件已创建并配置
- [ ] 敏感信息（密钥、密码）已修改为安全值
- [ ] 前端代码已提交并推送
- [ ] 后端代码已提交并推送
- [ ] 数据库已备份（如有重要数据）
- [ ] SSL 证书有效且未过期

部署后请验证：

- [ ] 前端页面可以正常访问
- [ ] API 请求正常响应
- [ ] 用户登录功能正常
- [ ] WebSocket 连接正常（如有）
- [ ] 文件上传功能正常
- [ ] 所有服务正常运行
- [ ] 日志中无严重错误

---

## 🔗 相关链接

- **生产环境**: https://www.zhitoujianli.com
- **API 文档**: https://www.zhitoujianli.com/api/docs
- **服务器**: 火山云 115.190.182.95
- **监控面板**: （待配置）

---

## 📞 技术支持

如遇到部署问题，请：

1. 运行验证脚本获取详细信息
2. 查看相关日志文件
3. 检查服务状态和端口监听
4. 参考本文档的常见问题部分

---

**最后更新**: 2025-10-16
**维护者**: 智投简历技术团队

