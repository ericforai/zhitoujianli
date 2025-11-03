# 智投简历后台管理系统使用指南

## 📋 目录

1. [系统概述](#系统概述)
2. [管理员账号管理](#管理员账号管理)
3. [登录系统](#登录系统)
4. [功能模块说明](#功能模块说明)
5. [常见问题](#常见问题)
6. [安全注意事项](#安全注意事项)

---

## 系统概述

### 后台管理系统功能

智投简历后台管理系统提供以下核心功能：

1. **用户管理** - 查看、管理、编辑用户信息，更新用户套餐
2. **登录日志** - 查看用户登录历史，分析登录趋势
3. **统计数据** - 用户统计、套餐分布、登录统计等
4. **功能控制** - 管理功能开关，控制功能对不同套餐的可用性
5. **系统配置** - 管理系统级配置参数

### 访问地址

- **开发环境**: `http://localhost:8080/api/admin/dashboard`
- **生产环境**: `https://zhitoujianli.com/api/admin/dashboard`

### 技术要求

- 需要使用管理员账号登录
- 浏览器支持 JavaScript
- 需要有效的 JWT Token（通过登录获取）

---

## 管理员账号管理

### 管理员类型

系统支持三种管理员类型：

1. **超级管理员 (SUPER_ADMIN)**
   - 拥有所有权限
   - 可以管理所有类型的管理员
   - 可以修改系统核心配置

2. **平台管理员 (PLATFORM_ADMIN)**
   - 可以管理普通用户
   - 可以查看统计数据
   - 可以管理用户套餐和配额
   - 不能管理其他管理员

3. **普通管理员**
   - 根据权限配置决定可访问的功能

### 初始化超级管理员

#### 方法一：通过预设用户ID（开发环境）

系统预设了以下超级管理员用户ID：

```java
- "super_admin_001"
- "admin@autoresume.com"
- "68dba0e3d9c27ebb0d93aa42"  // Authing用户ID
```

如果使用这些用户ID登录，系统会自动创建超级管理员账号。

#### 方法二：通过API初始化（推荐）

```bash
# 初始化超级管理员
curl -X POST http://localhost:8080/api/admin/init-super-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "userId": "your_user_id_here",
    "remarks": "系统初始化超级管理员"
  }'
```

**注意**:

- `userId` 需要是已注册用户的ID
- 如果是邮箱格式，系统会查找对应的用户
- 初始化后，该用户将拥有所有权限

#### 方法三：直接数据库插入

如果系统已有用户，可以直接在数据库中插入管理员记录：

```sql
INSERT INTO admin_users (
    user_id,
    admin_type,
    permissions,
    is_active,
    created_by,
    remarks,
    created_at,
    updated_at
) VALUES (
    'user_12345',  -- 替换为实际用户ID
    'SUPER_ADMIN',
    '{"user_management_create": true, "user_management_read": true, ...}',
    true,
    'system',
    '系统初始化超级管理员',
    NOW(),
    NOW()
);
```

### 创建平台管理员

超级管理员可以通过以下方式创建平台管理员：

```bash
curl -X POST http://localhost:8080/api/admin/admins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>" \
  -d '{
    "userId": "user_id_to_make_admin",
    "adminType": "PLATFORM_ADMIN",
    "permissions": {
      "user_management_read": true,
      "user_management_update": true,
      "analytics_read": true
    }
  }'
```

### 检查管理员权限

```bash
# 检查是否是管理员
curl -X GET http://localhost:8080/api/admin/check-blog-access \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

## 登录系统

### ⚠️ 重要提示

**`https://zhitoujianli.com/api/admin/dashboard` 不能直接访问！**

该API需要：

1. 先登录获取JWT Token
2. 在请求头中携带Token
3. 用户必须是管理员

**系统没有预设的账号密码！** 您需要先注册用户，然后将其设置为管理员。

### 第一步：注册管理员账号

首先，您需要注册一个用户账号。建议使用预设的超级管理员邮箱：

```bash
curl -X POST https://zhitoujianli.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@autoresume.com",
    "password": "YourStrongPassword123!",
    "username": "管理员"
  }'
```

**推荐使用的管理员邮箱**（系统会自动识别为超级管理员）：

- `admin@autoresume.com`
- 其他邮箱也可以，但需要手动设置管理员权限

### 第二步：用户登录

使用注册的账号登录系统：

```bash
# 用户登录
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'
```

**响应示例**:

```json
{
  "success": true,
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 12345,
    "email": "admin@example.com",
    "username": "admin",
    "emailVerified": true
  }
}
```

### 第二步：保存Token

登录成功后，保存返回的 `token`，后续所有API请求都需要在Header中携带：

```
Authorization: Bearer <token>
```

### 第三步：访问后台管理

使用保存的Token访问后台管理API：

```bash
# 访问仪表板
curl -X GET http://localhost:8080/api/admin/dashboard \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 浏览器访问（前端界面）

如果前端已部署，可以直接访问：

1. 打开浏览器，访问登录页面
2. 使用管理员账号登录
3. 登录成功后，访问 `/admin/dashboard` 路由

---

## 功能模块说明

### 1. 仪表板（Dashboard）

**API端点**: `GET /api/admin/dashboard`

**功能**: 查看系统总体概况

**返回数据**:

- 用户统计（总数、活跃数、新用户）
- 套餐分布统计
- 登录统计（今日、本周、本月）
- 趋势数据（最近7天）

**示例请求**:

```bash
curl -X GET http://localhost:8080/api/admin/dashboard \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**权限要求**: 需要管理员权限

---

### 2. 用户管理

#### 2.1 获取用户列表

**API端点**: `GET /api/admin/users`

**查询参数**:

- `page`: 页码（默认0）
- `size`: 每页数量（默认20）
- `search`: 搜索关键词（邮箱、用户名）
- `planType`: 套餐类型筛选（FREE/BASIC/PROFESSIONAL/FLAGSHIP）
- `active`: 是否激活（true/false）

**示例请求**:

```bash
curl -X GET "http://localhost:8080/api/admin/users?page=0&size=20&planType=BASIC" \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": 12345,
        "email": "user@example.com",
        "username": "username",
        "emailVerified": true,
        "active": true,
        "createdAt": "2025-10-01T10:00:00",
        "lastLoginAt": "2025-10-29T15:30:00",
        "lastLoginIp": "192.168.1.100",
        "deleted": false
      }
    ],
    "total": 1250,
    "page": 0,
    "size": 20,
    "totalPages": 63
  }
}
```

#### 2.2 获取用户详情

**API端点**: `GET /api/admin/users/{userId}`

**示例请求**:

```bash
curl -X GET http://localhost:8080/api/admin/users/12345 \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

#### 2.3 更新用户套餐

**API端点**: `PUT /api/admin/users/{userId}/plan`

**请求体**:

```json
{
  "planType": "PROFESSIONAL",
  "endDate": "2026-10-29" // 可选，null表示永不过期
}
```

**示例请求**:

```bash
curl -X PUT http://localhost:8080/api/admin/users/12345/plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "planType": "PROFESSIONAL",
    "endDate": "2026-10-29"
  }'
```

#### 2.4 更新用户状态

**API端点**: `PUT /api/admin/users/{userId}/status`

**请求体**:

```json
{
  "active": false // true=激活, false=禁用
}
```

#### 2.5 删除用户（软删除）

**API端点**: `DELETE /api/admin/users/{userId}`

**请求体**:

```json
{
  "reason": "用户违规操作" // 可选
}
```

**示例请求**:

```bash
curl -X DELETE http://localhost:8080/api/admin/users/12345 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "reason": "用户违规操作"
  }'
```

#### 2.6 重置用户配额

**API端点**: `POST /api/admin/users/{userId}/quota/reset`

**请求体**:

```json
{
  "quotaKey": "resume_generation", // 可选，不填则重置所有配额
  "reason": "管理员手动重置"
}
```

**示例请求**:

```bash
curl -X POST http://localhost:8080/api/admin/users/12345/quota/reset \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "quotaKey": "resume_generation"
  }'
```

**权限要求**: 需要 `user_management_read`、`user_management_update`、`user_management_delete` 等权限

---

### 3. 登录日志

#### 3.1 获取登录日志列表

**API端点**: `GET /api/admin/login-logs`

**查询参数**:

- `page`: 页码（默认0）
- `size`: 每页数量（默认20）
- `email`: 按邮箱筛选
- `userId`: 按用户ID筛选
- `loginStatus`: 登录状态（SUCCESS/FAILED）
- `startTime`: 开始时间（ISO 8601格式）
- `endTime`: 结束时间（ISO 8601格式）

**示例请求**:

```bash
curl -X GET "http://localhost:8080/api/admin/login-logs?page=0&size=20&loginStatus=SUCCESS" \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "userId": 12345,
        "email": "user@example.com",
        "loginType": "EMAIL",
        "loginStatus": "SUCCESS",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "deviceInfo": "Desktop Windows",
        "location": null,
        "failureReason": null,
        "createdAt": "2025-10-29T15:30:00"
      }
    ],
    "total": 5000,
    "page": 0,
    "size": 20,
    "totalPages": 250
  }
}
```

#### 3.2 获取登录统计

**API端点**: `GET /api/admin/login-logs/statistics`

**查询参数**:

- `startTime`: 开始时间（可选，默认最近30天）
- `endTime`: 结束时间（可选，默认当前时间）

**示例请求**:

```bash
curl -X GET "http://localhost:8080/api/admin/login-logs/statistics?startTime=2025-10-01T00:00:00&endTime=2025-10-29T23:59:59" \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "total": 5000,
    "successful": 4800,
    "failed": 200,
    "successRate": 96.0
  }
}
```

#### 3.3 清理过期日志

**API端点**: `DELETE /api/admin/login-logs/cleanup`

**查询参数**:

- `monthsToKeep`: 保留月数（默认3个月）

**示例请求**:

```bash
curl -X DELETE "http://localhost:8080/api/admin/login-logs/cleanup?monthsToKeep=3" \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**响应示例**:

```json
{
  "success": true,
  "message": "清理完成，删除了 1500 条过期日志",
  "deletedCount": 1500
}
```

**权限要求**: 需要 `audit_logs_read`、`analytics_read` 权限

---

### 4. 统计数据

#### 4.1 获取用户统计

**API端点**: `GET /api/admin/statistics/users`

**示例请求**:

```bash
curl -X GET http://localhost:8080/api/admin/statistics/users \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "activeUsers": 856,
    "inactiveUsers": 394,
    "todayNewUsers": 23,
    "weekNewUsers": 156,
    "monthNewUsers": 450
  }
}
```

#### 4.2 获取登录统计

**API端点**: `GET /api/admin/statistics/logins`

**响应示例**:

```json
{
  "success": true,
  "data": {
    "today": {
      "total": 500,
      "successful": 480,
      "failed": 20,
      "successRate": 96.0
    },
    "week": {
      "total": 3500,
      "successful": 3360,
      "failed": 140,
      "successRate": 96.0
    },
    "month": {
      "total": 15000,
      "successful": 14400,
      "failed": 600,
      "successRate": 96.0
    }
  }
}
```

#### 4.3 获取套餐分布统计

**API端点**: `GET /api/admin/statistics/plans`

**响应示例**:

```json
{
  "success": true,
  "data": {
    "distribution": {
      "FREE": 800,
      "BASIC": 300,
      "PROFESSIONAL": 120,
      "FLAGSHIP": 30
    },
    "total": 1250,
    "percentages": {
      "FREE": 64.0,
      "BASIC": 24.0,
      "PROFESSIONAL": 9.6,
      "FLAGSHIP": 2.4
    }
  }
}
```

**权限要求**: 需要 `analytics_read` 权限

---

### 5. 功能控制

#### 5.1 获取功能列表

**API端点**: `GET /api/admin/features`

**示例请求**:

```bash
curl -X GET http://localhost:8080/api/admin/features \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "featureKey": "ai_resume_optimization",
      "featureName": "AI简历优化",
      "description": "使用AI技术优化简历内容",
      "enabled": true,
      "targetPlans": ["PROFESSIONAL", "FLAGSHIP"],
      "targetUsers": null,
      "config": {
        "maxOptimizations": 10
      },
      "createdAt": "2025-10-01T10:00:00",
      "updatedAt": "2025-10-29T15:00:00"
    }
  ]
}
```

#### 5.2 创建功能开关

**API端点**: `POST /api/admin/features`

**请求体**:

```json
{
  "featureKey": "new_feature_key",
  "featureName": "新功能名称",
  "description": "功能描述",
  "enabled": true,
  "targetPlans": ["BASIC", "PROFESSIONAL", "FLAGSHIP"], // 允许使用的套餐类型
  "targetUsers": null, // 可选，指定用户ID列表
  "config": {
    "key": "value"
  }
}
```

**示例请求**:

```bash
curl -X POST http://localhost:8080/api/admin/features \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "featureKey": "advanced_search",
    "featureName": "高级搜索功能",
    "description": "提供高级搜索功能",
    "enabled": true,
    "targetPlans": ["PROFESSIONAL", "FLAGSHIP"]
  }'
```

#### 5.3 更新功能开关

**API端点**: `PUT /api/admin/features/{featureKey}`

**请求体**:

```json
{
  "featureName": "更新后的功能名称",
  "description": "更新后的描述",
  "enabled": false,
  "targetPlans": ["FLAGSHIP"],
  "config": {}
}
```

#### 5.4 切换功能状态

**API端点**: `PUT /api/admin/features/{featureKey}/toggle`

**示例请求**:

```bash
curl -X PUT http://localhost:8080/api/admin/features/ai_resume_optimization/toggle \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

#### 5.5 检查功能是否可用

**API端点**: `GET /api/admin/features/check/{featureKey}`

**查询参数**:

- `userId`: 用户ID（可选）
- `planType`: 套餐类型（可选）

**示例请求**:

```bash
curl -X GET "http://localhost:8080/api/admin/features/check/ai_resume_optimization?userId=user_12345&planType=PROFESSIONAL" \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "featureKey": "ai_resume_optimization",
    "enabled": true,
    "available": true
  }
}
```

**权限要求**: 需要 `system_config_read`、`system_config_update` 权限

---

### 6. 系统配置

#### 6.1 获取系统配置列表

**API端点**: `GET /api/admin/system/configs`

**示例请求**:

```bash
curl -X GET http://localhost:8080/api/admin/system/configs \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

#### 6.2 获取配置值

**API端点**: `GET /api/admin/system/configs/{configKey}`

**示例请求**:

```bash
curl -X GET http://localhost:8080/api/admin/system/configs/max_file_size \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "configKey": "max_file_size",
    "configValue": "10485760",
    "configType": "NUMBER",
    "description": "最大文件大小（字节）",
    "updatedBy": "admin@example.com",
    "updatedAt": "2025-10-29T15:00:00",
    "valueAsType": 10485760
  }
}
```

#### 6.3 更新配置值

**API端点**: `PUT /api/admin/system/configs/{configKey}`

**请求体**:

```json
{
  "configValue": "20971520",
  "configType": "NUMBER",
  "description": "更新后的描述"
}
```

**示例请求**:

```bash
curl -X PUT http://localhost:8080/api/admin/system/configs/max_file_size \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "configValue": "20971520",
    "configType": "NUMBER",
    "description": "最大文件大小（字节）"
  }'
```

#### 6.4 删除配置

**API端点**: `DELETE /api/admin/system/configs/{configKey}`

**示例请求**:

```bash
curl -X DELETE http://localhost:8080/api/admin/system/configs/old_config_key \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**权限要求**: 需要 `system_config_read`、`system_config_update` 权限

---

## 常见问题

### Q1: 如何确认我是否有管理员权限？

**A**: 调用以下API检查：

```bash
curl -X GET http://localhost:8080/api/admin/check-blog-access \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

如果返回 `"hasAccess": true`，说明您有管理员权限。

### Q2: 登录后无法访问后台管理，提示"需要管理员权限"？

**可能原因**:

1. 您的账号还不是管理员
2. 管理员账号被禁用
3. Token过期或无效

**解决方法**:

1. 联系超级管理员为您添加管理员权限
2. 检查管理员账号状态是否为激活
3. 重新登录获取新的Token

### Q3: 如何重置用户配额？

**A**: 使用以下API：

```bash
curl -X POST http://localhost:8080/api/admin/users/{userId}/quota/reset \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{"quotaKey": "resume_generation"}'
```

### Q4: 登录日志太多，如何清理？

**A**: 使用清理API：

```bash
curl -X DELETE "http://localhost:8080/api/admin/login-logs/cleanup?monthsToKeep=3" \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

这将删除3个月之前的登录日志。

### Q5: 如何为特定套餐启用某个功能？

**A**: 创建或更新功能开关：

```bash
curl -X POST http://localhost:8080/api/admin/features \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "featureKey": "advanced_feature",
    "featureName": "高级功能",
    "enabled": true,
    "targetPlans": ["PROFESSIONAL", "FLAGSHIP"]
  }'
```

### Q6: Token过期怎么办？

**A**: Token默认有效期为24小时（86400000毫秒）。如果过期：

1. 重新登录获取新Token
2. 或者修改JWT配置延长有效期（不推荐）

### Q7: 忘记管理员密码怎么办？

**A**: 管理员使用普通用户账号登录，如果忘记密码：

1. 使用密码重置功能（如果已实现）
2. 联系数据库管理员重置密码
3. 或创建新的管理员账号

### Q8: 如何查看某个用户的所有登录记录？

**A**: 使用登录日志查询API：

```bash
curl -X GET "http://localhost:8080/api/admin/login-logs?userId=12345&page=0&size=50" \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### Q9: 系统配置支持哪些类型？

**A**: 支持以下类型：

- `STRING`: 字符串
- `NUMBER`: 数字（整数或浮点数）
- `BOOLEAN`: 布尔值（true/false）
- `JSON`: JSON对象（字符串格式存储）

### Q10: 如何批量更新用户套餐？

**A**: 目前需要逐个更新。可以编写脚本循环调用更新API：

```bash
#!/bin/bash
USER_IDS=(12345 12346 12347)
TOKEN="your_token_here"

for USER_ID in "${USER_IDS[@]}"; do
  curl -X PUT "http://localhost:8080/api/admin/users/${USER_ID}/plan" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d '{"planType": "PROFESSIONAL"}'
done
```

---

## 安全注意事项

### 1. Token安全

- **不要**在前端代码中硬编码Token
- **不要**将Token提交到版本控制系统
- Token应该存储在安全的地方（如HttpOnly Cookie）
- 定期更换Token（建议每月）

### 2. 管理员账号安全

- 为超级管理员账号设置强密码
- 限制超级管理员账号数量
- 定期审查管理员权限
- 及时禁用不再需要的管理员账号

### 3. API访问安全

- 所有管理员API都需要认证
- 使用HTTPS在生产环境
- 限制API访问频率（防止暴力破解）
- 记录所有管理员操作日志

### 4. 权限管理

- 遵循最小权限原则
- 只授予必要的权限
- 定期审查权限配置
- 删除不必要的管理员账号

### 5. 数据安全

- 敏感数据不要记录在日志中
- 定期备份数据库
- 使用软删除而不是物理删除（用户数据）
- 保护用户隐私信息

---

## API错误码说明

| HTTP状态码 | 说明         | 解决方法                 |
| ---------- | ------------ | ------------------------ |
| 200        | 请求成功     | -                        |
| 400        | 请求参数错误 | 检查请求参数格式         |
| 401        | 未授权       | 检查Token是否有效        |
| 403        | 禁止访问     | 检查是否有管理员权限     |
| 404        | 资源不存在   | 检查请求的资源ID是否正确 |
| 429        | 请求过于频繁 | 稍后重试                 |
| 500        | 服务器错误   | 查看服务器日志           |

---

## 联系方式

如有问题，请联系：

- 技术支持：tech@zhitoujianli.com
- 系统管理员：admin@zhitoujianli.com

---

## 更新日志

- **2025-10-29**: 初始版本，包含所有后台管理功能
- 后续更新将在此记录

---

**文档版本**: v1.0
**最后更新**: 2025-10-29
**维护者**: 智投简历开发团队
