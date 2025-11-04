# 🌐 智投简历 - IP地址临时部署指南

**场景**: 域名审核期间，使用IP地址临时部署  
**IP地址**: 115.190.182.95  
**协议**: HTTP（域名审核通过后升级HTTPS）  
**时间**: 约1小时

---

## 📋 当前情况说明

✅ **已完成**:
- 代码审查和修复
- 测试环境验证
- 生产环境准备
- IP临时部署配置

⏳ **等待中**:
- 域名审核（zhitoujianli.com）
- SSL证书（需要域名）

🎯 **现在可做**:
- 配置Authing
- 部署到IP地址
- 功能测试

---

## 🚀 快速部署（三步完成）

### 步骤1: 配置Authing（30分钟）⏱️

**详细指南**: 查看 `AUTHING_CONFIGURATION_GUIDE.md`

**快速步骤**:
```bash
1. 访问 https://console.authing.cn/
2. 注册/登录账号
3. 创建用户池 → 记录 User Pool ID
4. 创建应用 → 记录 App ID、App Secret、App Host
5. 配置回调URL: http://115.190.182.95/
6. 启用邮件服务
7. 填写配置到 backend/get_jobs/.env
```

**配置示例**:
```bash
cd /root/zhitoujianli
cp backend/get_jobs/.env.ip backend/get_jobs/.env
vim backend/get_jobs/.env

# 填写以下内容:
AUTHING_USER_POOL_ID=您的用户池ID
AUTHING_APP_ID=您的应用ID
AUTHING_APP_SECRET=您的应用密钥
AUTHING_APP_HOST=https://您的域名.authing.cn
```

---

### 步骤2: 执行部署（20分钟）⏱️

#### 方式1: 使用部署脚本（推荐）

```bash
cd /root/zhitoujianli

# 执行IP部署脚本
chmod +x deploy-ip.sh
./deploy-ip.sh
```

**脚本会自动**:
- ✅ 检查配置文件
- ✅ 停止旧服务
- ✅ 编译后端
- ✅ 构建前端
- ✅ 配置Nginx
- ✅ 启动服务
- ✅ 健康检查

#### 方式2: 手动部署

```bash
# 1. 编译后端
cd backend/get_jobs
mvn clean package -DskipTests
cd ../..

# 2. 构建前端
cd frontend
cp .env.ip .env
npm install
npm run build
cd ..

# 3. 启动后端
cd backend/get_jobs
mvn spring-boot:run > /tmp/backend_ip.log 2>&1 &
echo $! > /tmp/backend.pid
cd ../..

# 4. 配置Nginx（如有）
sudo cp nginx-ip.conf /etc/nginx/sites-available/zhitoujianli-ip.conf
sudo ln -sf /etc/nginx/sites-available/zhitoujianli-ip.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 步骤3: 验证部署（10分钟）⏱️

#### 3.1 检查服务状态

```bash
# 检查后端
curl http://115.190.182.95:8080/api/auth/health

# 检查前端（如果配置了Nginx）
curl -I http://115.190.182.95

# 检查Authing配置
curl http://115.190.182.95:8080/api/auth/health | jq .authingConfigured
# 应该返回: true（如果配置了Authing）
```

#### 3.2 浏览器测试

```
访问以下地址测试:

1. 首页: http://115.190.182.95
2. 登录页: http://115.190.182.95/login
3. 注册页: http://115.190.182.95/register
4. API健康: http://115.190.182.95:8080/api/auth/health
```

#### 3.3 功能测试

- [ ] 首页可正常访问
- [ ] 登录页显示正常
- [ ] 注册页显示正常
- [ ] API健康检查返回200
- [ ] 可以注册新用户（如配置了Authing）
- [ ] 可以邮箱登录（如配置了Authing）
- [ ] 路由保护正常工作

---

## 📁 IP部署相关文件

### 配置文件
```
✅ backend/get_jobs/.env.ip         - 后端IP配置模板
✅ frontend/.env.ip                 - 前端IP配置模板
✅ nginx-ip.conf                    - Nginx HTTP配置
```

### 部署脚本
```
✅ deploy-ip.sh                     - IP临时部署脚本
```

### 文档
```
✅ IP_DEPLOYMENT_GUIDE.md           - 本文档
✅ AUTHING_CONFIGURATION_GUIDE.md   - Authing配置指南
```

---

## 🔧 服务管理

### 启动服务

```bash
# 后端
cd backend/get_jobs
mvn spring-boot:run > /tmp/backend_ip.log 2>&1 &
echo $! > /tmp/backend.pid

# 前端（开发模式）
cd frontend
npm start > /tmp/frontend_ip.log 2>&1 &
echo $! > /tmp/frontend.pid
```

### 停止服务

```bash
# 停止后端
kill $(cat /tmp/backend.pid)

# 停止前端
kill $(cat /tmp/frontend.pid)
```

### 查看日志

```bash
# 后端日志
tail -f /tmp/backend_ip.log

# 前端日志
tail -f /tmp/frontend_ip.log

# 查看Authing相关日志
grep "Authing" /tmp/backend_ip.log
```

### 重启服务

```bash
# 快速重启
kill $(cat /tmp/backend.pid /tmp/frontend.pid)
./deploy-ip.sh
```

---

## ⚠️ 重要提醒

### IP临时部署的限制

1. **HTTP不安全**: 数据传输未加密
   - ⚠️ 不要在公网传输敏感信息
   - ⚠️ 建议仅用于功能测试

2. **SECURITY_ENABLED=false**: 认证可选
   - ⚠️ 任何人都可访问API
   - ⚠️ 域名部署后必须启用

3. **CORS开放**: 允许多个源
   - ⚠️ 存在安全风险
   - ⚠️ 域名部署后必须限制

### 域名审核通过后立即执行

1. **更新配置为域名**
   ```bash
   # 使用生产配置
   cp .env.production .env
   ```

2. **配置SSL证书**
   ```bash
   sudo certbot certonly --webroot -w /var/www/certbot \
     -d zhitoujianli.com -d www.zhitoujianli.com
   ```

3. **使用生产部署脚本**
   ```bash
   ./deploy-production.sh
   ```

4. **启用安全认证**
   ```bash
   # 在.env中设置
   SECURITY_ENABLED=true
   ```

---

## 🧪 测试checklist

### 基本功能测试

- [ ] **首页访问**: http://115.190.182.95
- [ ] **登录页面**: http://115.190.182.95/login  
- [ ] **注册页面**: http://115.190.182.95/register
- [ ] **API健康检查**: http://115.190.182.95:8080/api/auth/health

### Authing功能测试（配置后）

- [ ] **发送验证码**: 注册页面发送验证码
- [ ] **接收邮件**: 检查邮箱收到验证码
- [ ] **用户注册**: 完成注册流程
- [ ] **用户登录**: 邮箱密码登录
- [ ] **Token生成**: 登录后获取Token
- [ ] **Token验证**: Token可正常验证

### 路由保护测试

- [ ] **未登录访问**: http://115.190.182.95/resume-delivery
  - 应跳转到登录页
- [ ] **登录后访问**: 登录后访问受保护页面
  - 应正常显示

---

## 🔍 故障排查

### 问题1: 无法访问 http://115.190.182.95

**排查**:
```bash
# 检查防火墙
sudo ufw status
sudo ufw allow 80/tcp

# 检查Nginx状态
sudo systemctl status nginx

# 检查端口监听
sudo netstat -tlnp | grep :80
```

### 问题2: API返回502错误

**排查**:
```bash
# 检查后端服务
ps aux | grep java | grep spring-boot

# 查看后端日志
tail -50 /tmp/backend_ip.log

# 检查后端端口
curl http://localhost:8080/api/auth/health
```

### 问题3: Authing配置不生效

**排查**:
```bash
# 检查配置
grep "AUTHING" backend/get_jobs/.env

# 查看启动日志
grep "Authing" /tmp/backend_ip.log

# 重启服务
kill $(cat /tmp/backend.pid)
cd backend/get_jobs && mvn spring-boot:run &
```

---

## 📊 部署状态检查

### 快速检查脚本

```bash
#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  智投简历 - IP部署状态检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查后端
echo -n "后端服务: "
curl -s http://localhost:8080/api/auth/health > /dev/null && echo "✅ 运行中" || echo "❌ 未运行"

# 检查前端（通过Nginx）
echo -n "前端服务: "
curl -s -I http://115.190.182.95 | grep "200 OK" > /dev/null && echo "✅ 可访问" || echo "❌ 无法访问"

# 检查Authing
echo -n "Authing配置: "
AUTHING_STATUS=$(curl -s http://localhost:8080/api/auth/health | jq -r .authingConfigured)
if [ "$AUTHING_STATUS" = "true" ]; then
    echo "✅ 已配置"
else
    echo "⚠️ 未配置（功能受限）"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

---

## 📞 快速命令参考

```bash
# 部署
./deploy-ip.sh

# 查看后端日志
tail -f /tmp/backend_ip.log

# 测试API
curl http://115.190.182.95:8080/api/auth/health | jq

# 重启后端
kill $(cat /tmp/backend.pid)
cd backend/get_jobs && mvn spring-boot:run > /tmp/backend_ip.log 2>&1 &

# 查看Authing配置
grep "AUTHING" backend/get_jobs/.env
```

---

## 🎯 成功标准

### IP部署成功的标志

1. ✅ 可以访问 http://115.190.182.95
2. ✅ API健康检查通过
3. ✅ 登录页面正常显示
4. ✅ （如配置Authing）可以注册和登录

### 配置Authing成功的标志

1. ✅ 健康检查返回 `authingConfigured: true`
2. ✅ 可以发送验证码邮件
3. ✅ 可以注册新用户
4. ✅ 可以邮箱登录

---

## 🔄 域名升级路径

### 域名审核通过后（立即执行）

1. **更新配置**
   ```bash
   cp backend/get_jobs/.env.production backend/get_jobs/.env
   cp frontend/.env.production frontend/.env
   vim backend/get_jobs/.env  # 更新CORS为域名
   ```

2. **配置SSL**
   ```bash
   sudo certbot certonly --webroot -w /var/www/certbot \
     -d zhitoujianli.com -d www.zhitoujianli.com
   ```

3. **切换到生产部署**
   ```bash
   ./deploy-production.sh
   ```

4. **启用安全认证**
   ```bash
   # 在.env中设置
   SECURITY_ENABLED=true
   ```

---

## ⚠️ 安全注意事项

### IP临时部署期间

1. **不要处理真实用户数据**
2. **不要存储敏感信息**
3. **使用测试账号进行测试**
4. **限制访问IP（如可能）**
5. **尽快完成域名审核**

### 推荐设置

```bash
# 暂时禁用安全认证（仅用于测试）
SECURITY_ENABLED=false

# 或者启用认证但配置好Authing
SECURITY_ENABLED=true
# + 完整的Authing配置
```

---

## 📚 相关文档

| 文档 | 用途 |
|------|------|
| AUTHING_CONFIGURATION_GUIDE.md | Authing详细配置步骤 |
| IP_DEPLOYMENT_GUIDE.md | 本文档 - IP部署指南 |
| PRODUCTION_DEPLOYMENT_GUIDE.md | 域名部署指南（审核通过后用） |
| ENV_SETUP_GUIDE.md | 环境变量配置说明 |

---

## 🎉 部署完成后

### 立即测试

```
1. 访问首页: http://115.190.182.95
2. 测试注册: http://115.190.182.95/register
3. 测试登录: http://115.190.182.95/login
4. 测试API: http://115.190.182.95:8080/api/auth/health
```

### 通知团队

告知团队成员临时访问地址:
```
前端: http://115.190.182.95
后端API: http://115.190.182.95:8080

⚠️ 注意: 这是临时IP访问，使用HTTP协议
域名审核通过后将升级为HTTPS
```

---

**部署完成！** 🚀

配置Authing后即可开始使用，域名审核通过后立即升级到HTTPS！

需要帮助查看: `cat AUTHING_CONFIGURATION_GUIDE.md`
