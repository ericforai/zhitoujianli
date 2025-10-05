# Authing 配置指南

## 严格按照官方文档配置Authing

### 1. 获取Authing配置信息

1. 登录 [Authing控制台](https://zhitoujianli.authing.cn)
2. 进入"应用管理" -> 选择应用
3. 获取以下配置信息：
   - **应用ID (APP_ID)**: 在应用详情页面获取
   - **用户池ID (USER_POOL_ID)**: 在用户池设置中获取
   - **应用密钥 (APP_SECRET)**: 在应用设置中获取
   - **应用域名 (APP_HOST)**: 通常是 `https://zhitoujianli.authing.cn`

### 2. 配置邮件服务

1. 在Authing控制台中进入"消息服务"
2. 配置邮件服务提供商（如阿里云邮件推送、腾讯云邮件服务等）
3. 设置邮件模板
4. 测试邮件发送功能

### 3. 更新.env配置文件

将获取的真实配置信息更新到 `.env` 文件中：

```bash
# Authing 身份认证配置
AUTHING_APP_ID=你的真实应用ID
AUTHING_USER_POOL_ID=你的真实用户池ID
AUTHING_APP_SECRET=你的真实应用密钥
AUTHING_APP_HOST=https://zhitoujianli.authing.cn

# 其他配置保持不变
JWT_SECRET=zhitoujianli_jwt_secret_key_2025_at_least_32_characters_long_for_security
SECURITY_ENABLED=false
SERVER_PORT=8080
BASE_URL=https://api.deepseek.com
API_KEY=sk-8fa02bf43d054abe9468e27e24a5e642
MODEL=deepseek-chat
```

### 4. 验证配置

配置完成后，重启后端服务：

```bash
pkill -f "spring-boot:run"
nohup mvn spring-boot:run > backend.log 2>&1 &
```

### 5. 测试完整流程

1. 发送验证码
2. 验证邮箱验证码
3. 用户注册

### 重要提醒

- **必须使用真实的Authing配置**，不能使用占位符
- **必须配置邮件服务**，确保验证码能正常发送
- **严格按照官方文档**，不使用简化方案
- **测试完整流程**，确保每个环节都正常

### 当前配置状态

- ✅ Authing Java SDK 3.1.19 已集成
- ✅ 验证码发送功能已实现
- ✅ 验证码验证功能已实现（使用官方API）
- ✅ 用户注册功能已实现（使用官方API）
- ⚠️ 需要配置真实的Authing信息
- ⚠️ 需要配置邮件服务

### 下一步操作

1. 获取真实的Authing配置信息
2. 更新.env文件
3. 配置邮件服务
4. 重启后端服务
5. 测试完整注册流程

