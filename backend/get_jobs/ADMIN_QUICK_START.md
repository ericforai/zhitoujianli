# 后台管理系统快速开始指南

## 🚀 5分钟快速上手

### 第一步：确认管理员账号

1. **检查用户是否已存在**

```bash
# 访问数据库或通过API查询
# 假设您的邮箱是 admin@example.com
```

2. **确认用户ID格式**

系统使用以下两种ID格式：
- 数据库自增ID（如：`12345`）
- 字符串ID（如：`user_12345` 或 `68dba0e3d9c27ebb0d93aa42`）

### 第二步：初始化超级管理员

#### 方法A：使用预设超级管理员（最简单）

如果您使用的是以下用户ID之一，系统会自动识别为超级管理员：

- `super_admin_001`
- `admin@autoresume.com`
- `68dba0e3d9c27ebb0d93aa42`

**操作步骤**：
1. 使用上述任一邮箱/ID注册或登录
2. 系统自动创建超级管理员账号
3. 完成！

#### 方法B：通过API初始化

**前提条件**：
- 您已有一个注册用户
- 知道用户的邮箱或ID

**操作步骤**：

```bash
# 1. 先登录获取Token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_email@example.com",
    "password": "your_password"
  }'

# 2. 使用返回的Token初始化超级管理员
curl -X POST http://localhost:8080/api/admin/init-super-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_FROM_STEP_1>" \
  -d '{
    "userId": "your_email@example.com",
    "remarks": "初始化超级管理员"
  }'
```

**响应示例**：

```json
{
  "success": true,
  "message": "超级管理员初始化成功",
  "data": {
    "userId": "your_email@example.com",
    "adminType": "SUPER_ADMIN",
    "permissions": {...},
    "createdAt": "2025-10-29T10:00:00"
  }
}
```

### 第三步：登录并访问后台

1. **重新登录**（如果Token已过期）

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_email@example.com",
    "password": "your_password"
  }'
```

2. **访问仪表板**

```bash
curl -X GET http://localhost:8080/api/admin/dashboard \
  -H "Authorization: Bearer <NEW_TOKEN>"
```

如果返回数据而不是错误，说明您已成功访问后台！

### 第四步：验证权限

```bash
curl -X GET http://localhost:8080/api/admin/check-blog-access \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

期望返回：

```json
{
  "success": true,
  "hasAccess": true,
  "userRole": "SUPER_ADMIN",
  "userId": "your_email@example.com"
}
```

---

## 📝 常见场景操作

### 场景1：查看用户列表

```bash
curl -X GET "http://localhost:8080/api/admin/users?page=0&size=20" \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 场景2：升级用户套餐

```bash
curl -X PUT http://localhost:8080/api/admin/users/12345/plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "planType": "PROFESSIONAL"
  }'
```

### 场景3：查看登录日志

```bash
curl -X GET "http://localhost:8080/api/admin/login-logs?page=0&size=20" \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 场景4：查看统计数据

```bash
# 用户统计
curl -X GET http://localhost:8080/api/admin/statistics/users \
  -H "Authorization: Bearer <YOUR_TOKEN>"

# 登录统计
curl -X GET http://localhost:8080/api/admin/statistics/logins \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

## ⚠️ 常见问题快速解决

### 问题1：提示"需要管理员权限"

**原因**：账号还不是管理员

**解决**：
1. 确认您已初始化超级管理员（见第二步）
2. 检查用户ID是否正确
3. 联系现有超级管理员为您添加权限

### 问题2：Token过期

**原因**：Token有效期24小时

**解决**：重新登录获取新Token

### 问题3：401 Unauthorized

**原因**：Token无效或未提供

**解决**：
1. 检查Header中是否正确添加了 `Authorization: Bearer <token>`
2. 确保Token没有过期
3. 重新登录获取新Token

### 问题4：403 Forbidden

**原因**：没有相应权限

**解决**：
1. 确认您是管理员
2. 检查您是否有相应操作权限
3. 联系超级管理员添加权限

---

## 🔑 权限速查表

| 权限名称 | 说明 | 适用范围 |
|---------|------|---------|
| `user_management_read` | 查看用户列表 | 平台管理员、超级管理员 |
| `user_management_update` | 更新用户信息 | 平台管理员、超级管理员 |
| `user_management_delete` | 删除用户 | 仅超级管理员 |
| `quota_management_update` | 重置配额 | 平台管理员、超级管理员 |
| `analytics_read` | 查看统计数据 | 平台管理员、超级管理员 |
| `audit_logs_read` | 查看登录日志 | 平台管理员、超级管理员 |
| `system_config_read` | 查看系统配置 | 平台管理员、超级管理员 |
| `system_config_update` | 修改系统配置 | 仅超级管理员 |

---

## 📞 需要帮助？

如果遇到问题：
1. 查看完整文档：`ADMIN_SYSTEM_GUIDE.md`
2. 检查服务器日志：`logs/zhitoujianli.log`
3. 联系技术支持

---

**快速开始版本**: v1.0
**最后更新**: 2025-10-29

