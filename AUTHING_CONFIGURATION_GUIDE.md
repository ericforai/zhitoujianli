# 🔑 Authing配置完整指南

**目的**: 配置身份认证服务，实现用户注册、登录功能
**时间**: 约30分钟
**难度**: 简单

---

## 📋 准备工作

- [ ] 准备一个邮箱（用于注册Authing账号）
- [ ] 准备您的应用域名或IP地址
- [ ] 记录本服务的回调URL

---

## 🚀 步骤1: 注册Authing账号（5分钟）

### 1.1 访问Authing官网

```
https://www.authing.cn/
```

点击右上角"**注册/登录**"按钮

### 1.2 注册账号

- 使用邮箱注册
- 验证邮箱
- 设置密码

✅ **完成标志**: 成功登录到Authing控制台

---

## 📦 步骤2: 创建用户池（5分钟）

### 2.1 创建用户池

1. 登录后，点击"**创建用户池**"
2. 填写用户池信息：
   - **用户池名称**: 智投简历
   - **用户池域名**: 自定义（如：zhitoujianli）
   - **描述**: 智投简历用户认证系统
3. 点击"**创建**"

### 2.2 记录用户池ID

创建成功后，在用户池概览页面找到：

```
用户池ID (User Pool ID): 68db6e4c4f248dd866413bc2
```

**📝 记录此ID**，68db6e4c4f248dd866413bc2

✅ **完成标志**: 用户池创建成功，已记录User Pool ID

---

## 🎯 步骤3: 创建应用（10分钟）

### 3.1 创建标准Web应用

1. 在用户池中，点击左侧"**应用**"
2. 点击"**创建应用**"
3. 选择"**标准Web应用**"
4. 填写应用信息：
   - **应用名称**: 智投简历Web
   - **认证地址**: 使用默认
   - **应用Logo**: 可选

### 3.2 配置回调地址

在应用配置页面，找到"**登录回调URL**"，添加：

```
# IP临时部署阶段
http://115.190.182.95/
http://115.190.182.95:3000/
http://115.190.182.95:8080/

# 本地开发
http://localhost:3000/
http://localhost:8080/

# 域名审核通过后添加
https://zhitoujianli.com/
https://www.zhitoujianli.com/
```

点击"**保存**"

### 3.3 配置登出回调URL

同样在配置页面，找到"**登出回调URL**"，添加相同的地址

### 3.4 记录应用配置

在应用详情页面，记录以下信息：

```
应用ID (App ID): 64xxxxxxxxxxxxx
应用密钥 (App Secret): xxxxxxxxxxxxxxxxxxx（点击"显示"查看）
认证地址 (App Host): https://zhitoujianli.authing.cn
```

**📝 记录这3个值**，稍后填入配置文件

✅ **完成标志**: 应用创建成功，已记录App ID、App Secret、App Host

---

## 📧 步骤4: 配置邮件服务（5分钟）

### 4.1 启用邮件服务

1. 在左侧菜单找到"**设置**" → "**消息服务**"
2. 点击"**邮件**"标签
3. 选择"**使用Authing邮件服务**"（免费）
4. 或配置自己的SMTP服务器（高级）

### 4.2 配置邮件模板（可选）

1. 在"**邮件模板**"中可以自定义：
   - 注册验证邮件
   - 登录验证码邮件
   - 密码重置邮件
2. 使用默认模板即可

✅ **完成标志**: 邮件服务已启用

---

## 🔐 步骤5: 配置安全设置（5分钟）

### 5.1 密码策略

1. 进入"**设置**" → "**安全设置**" → "**密码策略**"
2. 建议配置：
   - ✅ 最小长度: 6位
   - ✅ 包含数字
   - ✅ 包含字母
   - ⚠️ 暂不要求特殊字符（避免用户抱怨）

### 5.2 频率限制

1. 进入"**安全设置**" → "**频率限制**"
2. 建议配置：
   - 登录失败5次后锁定15分钟
   - 发送验证码间隔60秒
   - 验证码有效期5分钟

✅ **完成标志**: 安全策略已配置

---

## ⚙️ 步骤6: 填写项目配置（5分钟）

### 6.1 更新后端配置

编辑 `backend/get_jobs/.env` 文件：

```bash
cd /root/zhitoujianli
cp backend/get_jobs/.env.ip backend/get_jobs/.env
vim backend/get_jobs/.env
```

将之前记录的配置填入：

```bash
AUTHING_USER_POOL_ID=您记录的用户池ID
AUTHING_APP_ID=您记录的应用ID
AUTHING_APP_SECRET=您记录的应用密钥
AUTHING_APP_HOST=https://您的域名.authing.cn
```

### 6.2 验证配置

```bash
# 检查配置是否正确（不应该有"填写"字样）
grep "AUTHING_" backend/get_jobs/.env | grep -v "^#"

# 应该看到：
# AUTHING_USER_POOL_ID=64xxxxxxxxxxxxx
# AUTHING_APP_ID=64xxxxxxxxxxxxx
# AUTHING_APP_SECRET=xxxxxxxxxxxxxxxxxxx
# AUTHING_APP_HOST=https://zhitoujianli.authing.cn
```

✅ **完成标志**: 配置已填写，无占位符

---

## 🧪 步骤7: 测试Authing配置（5分钟）

### 7.1 重启后端服务

```bash
cd /root/zhitoujianli/backend/get_jobs

# 停止旧服务
kill $(cat /tmp/backend.pid) 2>/dev/null

# 启动新服务
mvn spring-boot:run > /tmp/backend_authing.log 2>&1 &
echo $! > /tmp/backend.pid

# 等待启动
sleep 10
```

### 7.2 检查Authing配置

```bash
# 查看启动日志中的Authing相关信息
grep "Authing" /tmp/backend_authing.log

# 应该看到：
# ✅ Authing配置正常
# ✅ Authing AuthenticationClient V3初始化成功
# ✅ Authing ManagementClient V3初始化成功
```

### 7.3 测试健康检查接口

```bash
curl http://localhost:8080/api/auth/health | jq
```

**预期响应**:
```json
{
  "success": true,
  "authingConfigured": true,  // ✅ 应该是true
  "appId": "64xxxxxxxxxxxxx",
  "userPoolId": "64xxxxxxxxxxxxx",
  "appHost": "https://zhitoujianli.authing.cn",
  "message": "✅ Authing配置正常"
}
```

✅ **完成标志**: `authingConfigured: true`，配置成功！

---

## 📝 配置示例

### 完整的.env文件示例

```bash
# JWT配置
JWT_SECRET=0DL+Oi0E02Opk4EtSbxYFTJyz/hoiZ4pEfcuF6JKwoKgWQB4uYJsXjtOzjkxWxLF
JWT_EXPIRATION=7200000

# Authing配置（示例，请替换为您的真实配置）
AUTHING_USER_POOL_ID=64a1234567890abcdef
AUTHING_APP_ID=64b9876543210fedcba
AUTHING_APP_SECRET=1a2b3c4d5e6f7g8h9i0j
AUTHING_APP_HOST=https://zhitoujianli.authing.cn

# 安全配置
SECURITY_ENABLED=false

# 服务器配置
SERVER_PORT=8080

# CORS配置（IP临时部署）
CORS_ALLOWED_ORIGINS=http://115.190.182.95,http://115.190.182.95:3000,http://115.190.182.95:8080

# 环境标识
SPRING_PROFILES_ACTIVE=staging
```

---

## ⚠️ 常见问题

### Q1: 找不到用户池ID？

**A**:
1. 登录Authing控制台
2. 点击左上角用户池名称
3. 在概览页面查看"用户池ID"

### Q2: 找不到应用密钥？

**A**:
1. 进入应用详情
2. 在"应用配置"中找到"应用密钥"
3. 点击"显示"即可看到

### Q3: 认证地址是什么格式？

**A**:
格式: `https://您的域名.authing.cn`
示例: `https://zhitoujianli.authing.cn`

### Q4: 配置后显示"Authing配置不完整"？

**A**:
检查以下几点：
1. 所有配置项都已填写（没有"填写"、"your-"等占位符）
2. User Pool ID和App ID格式正确（通常是64开头的长字符串）
3. App Secret没有多余的空格
4. App Host以https://开头，以.authing.cn结尾

### Q5: 如何测试配置是否成功？

**A**:
```bash
# 方法1: 查看健康检查接口
curl http://localhost:8080/api/auth/health | jq .authingConfigured

# 应该返回: true

# 方法2: 查看启动日志
grep "Authing" /tmp/backend_authing.log | grep "✅"

# 应该看到成功信息
```

---

## 🔧 故障排查

### 问题：启动时提示"Authing认证失败"

**可能原因**:
1. App Secret错误
2. User Pool ID和App ID不匹配
3. 网络无法访问authing.cn

**解决方案**:
```bash
# 1. 检查配置是否正确
cat backend/get_jobs/.env | grep AUTHING

# 2. 测试网络连接
curl -I https://api.authing.cn

# 3. 重新获取配置并填写
```

### 问题：用户注册时收不到验证码邮件

**可能原因**:
1. 邮件服务未启用
2. 邮箱地址错误
3. 邮件被拦截到垃圾箱

**解决方案**:
1. 检查Authing控制台的邮件服务是否启用
2. 查看Authing控制台的"日志" → "邮件发送记录"
3. 检查用户的垃圾邮件箱

---

## ✅ 配置完成检查清单

配置Authing完成后，请检查：

- [ ] User Pool ID已填写（64开头）
- [ ] App ID已填写（64开头）
- [ ] App Secret已填写
- [ ] App Host已填写（https://xxx.authing.cn格式）
- [ ] 回调URL已在Authing控制台配置
- [ ] 邮件服务已启用
- [ ] 密码策略已配置
- [ ] 后端服务已重启
- [ ] 健康检查接口返回authingConfigured: true
- [ ] 可以正常注册和登录

---

## 🎯 配置成功标准

当满足以下条件时，Authing配置成功：

1. ✅ 健康检查接口返回：
   ```json
   {
     "success": true,
     "authingConfigured": true,
     "message": "✅ Authing配置正常"
   }
   ```

2. ✅ 启动日志显示：
   ```
   ✅ Authing AuthenticationClient V3初始化成功
   ✅ Authing ManagementClient V3初始化成功
   ```

3. ✅ 可以通过前端页面注册新用户

4. ✅ 可以使用邮箱密码登录

---

## 📞 获取帮助

### Authing官方资源

- 文档中心: https://docs.authing.cn/
- 快速开始: https://docs.authing.cn/v2/quickstarts/
- SDK文档: https://docs.authing.cn/v2/reference/sdk-for-java/
- 在线客服: Authing控制台右下角

### 智投简历项目文档

- 环境配置: [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)
- 部署指南: [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)

---

## 🎓 Authing配置截图说明

### 1. 控制台首页
```
┌─────────────────────────────────────────┐
│  Authing 控制台                          │
├─────────────────────────────────────────┤
│                                         │
│  [用户池]  智投简历                      │
│    └─ 用户池ID: 64xxxxxxxxxxxxx        │
│                                         │
│  [应用]                                 │
│    └─ 智投简历Web                       │
│       └─ 应用ID: 64xxxxxxxxxxxxx       │
│                                         │
└─────────────────────────────────────────┘
```

### 2. 应用配置页面
```
┌─────────────────────────────────────────┐
│  应用详情 - 智投简历Web                  │
├─────────────────────────────────────────┤
│                                         │
│  基本信息:                              │
│    应用ID: 64xxxxxxxxxxxxx             │
│    应用密钥: [显示] xxxxxxxxxxx        │
│    认证地址: https://xxx.authing.cn     │
│                                         │
│  认证配置:                              │
│    登录回调URL:                         │
│      - http://115.190.182.95/          │
│      - http://115.190.182.95:3000/     │
│      - http://localhost:3000/          │
│                                         │
│    登出回调URL:                         │
│      - http://115.190.182.95/          │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔄 下一步

配置完成Authing后：

1. **重启后端服务**
   ```bash
   cd /root/zhitoujianli/backend/get_jobs
   # 重新编译和启动
   mvn clean package -DskipTests
   mvn spring-boot:run
   ```

2. **验证配置**
   ```bash
   curl http://localhost:8080/api/auth/health | jq .authingConfigured
   # 应该返回: true
   ```

3. **测试注册功能**
   - 访问: http://115.190.182.95:3000/register
   - 尝试注册新用户
   - 检查是否收到验证码邮件

4. **测试登录功能**
   - 访问: http://115.190.182.95:3000/login
   - 使用注册的账号登录
   - 验证是否成功跳转

---

**配置完成时间**: 约30分钟
**难度等级**: ⭐⭐☆☆☆（简单）

祝配置顺利！🎉
