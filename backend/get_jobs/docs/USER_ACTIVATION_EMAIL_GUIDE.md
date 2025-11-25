# 用户激活邮件功能使用指南

## 📧 功能概述

用户激活邮件功能用于向已注册但未使用的用户发送激活邮件，帮助提升用户活跃度。

### 功能特点

- ✅ **智能识别未使用用户**：自动识别从未登录或未上传简历的用户
- ✅ **批量发送支持**：支持批量发送，带延迟控制，防止触发邮件服务限流
- ✅ **发送结果统计**：详细的发送结果统计，包括成功/失败列表
- ✅ **安全控制**：需要管理员权限，单次最多发送200封邮件

---

## 🎯 邮件模板特点

邮件模板设计遵循以下原则：

1. **简洁**：3-4段内容，重点突出
2. **友好**：使用"您"，语气温和专业
3. **行动号召强烈**：明确的按钮和链接，引导用户立即使用
4. **价值点清晰**：快速说明产品核心价值

### 邮件内容结构

- **标题**：🚀 您的智能求职助手已就绪
- **问候语**：个性化称呼
- **核心功能**：4个核心功能点（智能匹配、个性化打招呼、批量投递、进度追踪）
- **行动按钮**：醒目的"立即开始使用"按钮
- **价值证明**：已帮助数千名求职者、提升面试率3-5倍

---

## 🔧 API接口

### 1. 获取未使用用户列表

**接口**：`GET /api/admin/users/inactive`

**权限**：需要管理员登录，且具有 `user_management_read` 权限

**响应示例**：
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": 1,
        "email": "user@example.com",
        "username": "user",
        "createdAt": "2025-01-01T00:00:00",
        "lastLoginAt": null
      }
    ],
    "total": 10
  }
}
```

### 2. 批量发送激活邮件

**接口**：`POST /api/admin/users/send-activation-emails`

**权限**：需要管理员登录，且具有 `user_management_write` 权限

**请求参数**：
- `maxEmails`（可选，默认50）：最大发送数量
- `delaySeconds`（可选，默认2）：每封邮件之间的延迟秒数

**请求示例**：
```bash
POST /api/admin/users/send-activation-emails?maxEmails=50&delaySeconds=2
```

**响应示例**：
```json
{
  "success": true,
  "message": "激活邮件发送完成: 成功 45 封，失败 5 封",
  "data": {
    "totalInactiveUsers": 100,
    "attemptedSend": 50,
    "sentCount": 45,
    "failedCount": 5,
    "sentEmails": ["user1@example.com", "user2@example.com", ...],
    "failedEmails": ["user3@example.com", ...],
    "timestamp": "2025-01-15T10:30:00"
  }
}
```

**限制**：
- 单次最多发送200封邮件（防止误操作）
- 建议分批发送，每批50-100封

### 3. 发送激活邮件给单个用户

**接口**：`POST /api/admin/users/{userId}/send-activation-email`

**权限**：需要管理员登录，且具有 `user_management_write` 权限

**响应示例**：
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "邮件发送成功",
    "email": "user@example.com",
    "timestamp": "2025-01-15T10:30:00"
  }
}
```

---

## 📋 使用流程

### 步骤1：查看未使用用户

```bash
# 使用curl（需要先登录获取JWT Token）
curl -X GET "https://zhitoujianli.com/api/admin/users/inactive" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 步骤2：批量发送激活邮件

```bash
# 发送50封邮件，每封间隔2秒
curl -X POST "https://zhitoujianli.com/api/admin/users/send-activation-emails?maxEmails=50&delaySeconds=2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 步骤3：查看发送结果

根据响应中的 `sentCount` 和 `failedCount` 查看发送结果。

---

## 🛡️ 安全措施

1. **权限控制**：所有接口都需要管理员权限
2. **发送限制**：单次最多发送200封邮件
3. **延迟控制**：支持设置发送延迟，防止触发邮件服务限流
4. **异常处理**：遇到邮件服务异常时自动停止发送

---

## 🔍 未使用用户判断标准

系统通过以下标准判断用户是否使用过系统：

1. **从未登录**：`lastLoginAt` 为 `null`
2. **无数据目录**：用户数据目录不存在或为空
3. **未上传简历**：`resume_profile.json` 文件不存在

满足以上任一条件，即判定为未使用用户。

---

## 📊 最佳实践

### 1. 分批发送

建议分批发送，每批50-100封邮件：
- 第一批：50封，延迟2秒
- 等待5-10分钟
- 第二批：50封，延迟2秒

### 2. 监控发送结果

- 关注 `failedCount`，如果失败率过高，检查邮件服务配置
- 记录 `sentEmails` 和 `failedEmails`，便于后续处理

### 3. 发送时机

- 建议在工作日发送，提高打开率
- 避免在节假日或深夜发送

### 4. 邮件服务配置

确保邮件服务配置正确：
- 检查 `MAIL_HOST`、`MAIL_PORT`、`MAIL_USERNAME`、`MAIL_PASSWORD`
- 确保邮件服务未启用演示模式（生产环境）

---

## 🐛 故障排查

### 问题1：邮件发送失败

**可能原因**：
- 邮件服务未配置
- 邮件服务配置错误
- 邮件服务限流

**解决方法**：
1. 检查邮件服务配置（`env.example` 中的邮件配置）
2. 增加 `delaySeconds` 参数，降低发送频率
3. 检查邮件服务日志

### 问题2：找不到未使用用户

**可能原因**：
- 所有用户都已使用过系统
- 判断逻辑有误

**解决方法**：
1. 检查用户数据目录结构
2. 检查 `lastLoginAt` 字段
3. 查看日志输出

### 问题3：权限不足

**可能原因**：
- 未登录或Token过期
- 用户没有管理员权限
- 用户没有 `user_management_write` 权限

**解决方法**：
1. 重新登录获取Token
2. 确认用户是管理员
3. 检查权限配置

---

## 📝 代码文件

- **邮件服务**：`backend/get_jobs/src/main/java/service/EmailService.java`
- **激活服务**：`backend/get_jobs/src/main/java/service/UserActivationService.java`
- **管理接口**：`backend/get_jobs/src/main/java/controller/AdminUserController.java`

---

## 🎉 总结

用户激活邮件功能已完整实现，包括：

- ✅ 简洁、友好、有强烈行动号召的邮件模板
- ✅ 智能识别未使用用户
- ✅ 批量发送支持，带延迟控制
- ✅ 详细的发送结果统计
- ✅ 完善的安全控制

现在您可以开始使用这个功能来激活未使用的用户了！

