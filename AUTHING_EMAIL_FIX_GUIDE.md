# 🔧 Authing邮件服务配置完整指南

**参考文档**: [Authing官方文档 - 配置邮件服务和模板](https://docs.authing.cn/)

---

## 📋 问题诊断

根据Authing官方文档，邮件发送失败的主要原因：

### 常见错误代码
- **2021**: 无法获取邮件模板
- **2025**: 使用默认邮件服务商出错
- **3013**: 发送邮件错误，未知错误
- **3014**: 邮件发送失败，原因：无法获取 transporter

---

## ✅ 完整解决方案（按官方文档）

### 步骤1: 登录Authing控制台

访问: https://console.authing.cn/

登录您的账号，进入用户池: `68db6e4c4f248dd866413bc2`

---

### 步骤2: 配置邮件服务 ⭐

#### 2.1 进入邮件服务设置
```
路径: 设置 → 消息服务 → 邮件服务
```

#### 2.2 选择邮件服务商
根据Authing文档，有两种方式：

**方式A: 使用Authing内置邮件服务（默认）**
- 优点: 无需配置，开箱即用
- 限制: 
  - 可能需要实名认证
  - 有免费额度限制（1000封/月）
  - 发件人显示为 `noreply@authing.cn`

**方式B: 配置第三方SMTP（推荐）**
- 优点: 自定义发件人，无限制
- 需要: SMTP服务器信息

**配置SMTP示例**:
```
SMTP服务器: smtp.qq.com
端口: 465 (SSL) 或 587 (TLS)
发件人邮箱: your-email@qq.com
密码/授权码: 您的SMTP密码
```

常用SMTP服务器:
- QQ邮箱: smtp.qq.com:465
- 163邮箱: smtp.163.com:465
- Gmail: smtp.gmail.com:587
- 阿里云企业邮箱: smtp.qiye.aliyun.com:465

---

### 步骤3: 配置邮件模板 ⭐⭐⭐

这是关键步骤！根据Authing文档，必须配置以下邮件模板：

#### 3.1 进入邮件模板管理
```
路径: 设置 → 消息服务 → 邮件服务 → 邮件模板
```

#### 3.2 必须配置的模板

Authing提供6种邮件模板类型：

1. **欢迎邮件** - 用户注册成功后发送
2. **验证邮件** ⭐ - **注册时发送验证码（必须配置）**
3. **重置密码** - 用户忘记密码时
4. **重置密码确认** - 密码重置成功确认
5. **修改绑定邮箱** - 更换邮箱验证
6. **修改密码** - 密码修改通知

#### 3.3 配置"验证邮件"模板

这是注册流程必需的！

**模板示例**:
```html
主题: 【智投简历】邮箱验证码

正文:
您好，

您正在注册智投简历账号，验证码为：

{{code}}

验证码有效期为5分钟，请尽快完成验证。

如果这不是您本人的操作，请忽略此邮件。

---
智投简历团队
```

**可用变量** (根据Authing文档):
- `{{app_name}}` - 应用名称
- `{{user_email}}` - 用户邮箱
- `{{code}}` - 验证码
- `{{user_name}}` - 用户名

#### 3.4 启用模板

- ✅ 确保"验证邮件"模板状态为"启用"
- ✅ 点击"保存"按钮

---

### 步骤4: 测试邮件发送 🧪

#### 4.1 控制台测试
在邮件服务页面找到"测试邮件发送"功能：

```
1. 输入一个真实邮箱（如您自己的邮箱）
2. 选择"验证邮件"模板
3. 点击"发送测试邮件"
4. 检查邮箱收件箱（包括垃圾邮件箱）
```

#### 4.2 API测试
测试通过后，重新测试我们的API：

```bash
curl -X POST http://localhost:8080/api/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

**预期成功响应**:
```json
{
  "success": true,
  "message": "验证码已发送到邮箱，请查看邮件",
  "expiresIn": 300,
  "authingConfigured": true,
  "productionReady": true,
  "requestId": "xxxxx"
}
```

---

### 步骤5: 完整注册流程测试 🎯

```bash
# 使用测试脚本
cd /root/zhitoujianli
./test-registration.sh
```

或手动测试：

```bash
# 1. 发送验证码
curl -X POST http://localhost:8080/api/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 2. 查收邮件，获取验证码

# 3. 验证验证码
curl -X POST http://localhost:8080/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"收到的验证码"}'

# 4. 注册用户
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test123456",
    "username":"测试用户",
    "verificationCode":"收到的验证码"
  }'
```

---

## ⚠️ 常见问题排查

### 问题1: 控制台测试邮件也发不出去

**可能原因**:
- 邮件服务未真正启用
- 需要实名认证（Authing内置服务）
- SMTP配置错误（自定义SMTP）
- 邮箱被封禁（使用了临时邮箱）

**解决方案**:
1. 检查账号是否需要实名认证
2. 使用自定义SMTP（推荐）
3. 联系Authing技术支持

---

### 问题2: 邮件发送到垃圾箱

**解决方案**:
- 配置自定义SMTP，使用企业邮箱
- 在邮件模板中添加退订链接
- 避免邮件内容包含敏感词

---

### 问题3: 邮件延迟

Authing内置服务可能有延迟，建议：
- 使用自定义SMTP
- 选择国内邮件服务商（阿里云、腾讯云）

---

## 📖 推荐配置（生产环境）

### 使用阿里云企业邮箱

```
SMTP服务器: smtp.qiye.aliyun.com
端口: 465 (SSL)
发件人: noreply@zhitoujianli.com
密码: 您的邮箱密码或授权码
```

### 使用腾讯企业邮箱

```
SMTP服务器: smtp.exmail.qq.com
端口: 465 (SSL)
发件人: noreply@zhitoujianli.com
密码: 您的邮箱密码或授权码
```

---

## 🎯 配置检查清单

完成以下检查后，邮件服务应该可以正常工作：

- [ ] 已登录Authing控制台
- [ ] 进入用户池 `68db6e4c4f248dd866413bc2`
- [ ] 邮件服务已启用（设置→消息服务→邮件服务）
- [ ] 选择了邮件服务商（Authing内置或自定义SMTP）
- [ ] **"验证邮件"模板已配置并启用**
- [ ] 在控制台成功发送测试邮件
- [ ] 测试邮箱成功收到邮件
- [ ] 后端API测试成功发送验证码
- [ ] 完整注册流程测试通过

---

## 📞 获取帮助

### Authing官方支持
- 📖 文档中心: https://docs.authing.cn/
- 📖 邮件服务配置: https://docs.authing.cn/v2/guides/userpool-config/email/
- 💬 在线客服: 控制台右下角
- 📧 技术支持: support@authing.cn
- ☎️ 电话: 400 888 2106

### 项目文档
- `AUTHING_TEST_REPORT.md` - 测试报告
- `AUTHING_FINAL_STATUS.md` - 当前状态
- `test-registration.sh` - 测试脚本

---

## 🎉 配置成功标准

当以下测试全部通过时，配置成功：

1. ✅ Authing控制台测试邮件发送成功
2. ✅ 后端API `/send-verification-code` 返回success: true
3. ✅ 邮箱成功收到验证码
4. ✅ 验证码验证成功
5. ✅ 用户注册成功
6. ✅ 用户登录成功

---

**关键提示**: 根据Authing官方文档，**邮件模板配置是必须的**！这是很多人忽略的步骤。请确保"验证邮件"模板已正确配置并启用。

**配置完成时间**: 约15-30分钟

祝配置顺利！🚀
