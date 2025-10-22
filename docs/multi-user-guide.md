# 多用户模式使用指南

## 概述

智投简历系统支持两种运行模式：

1. **单用户模式（默认）**：无需注册登录，所有数据存储在`default_user`
2. **多用户模式**：需要注册登录，每个用户独立配置和数据

## 模式切换

### 启用多用户模式

**管理员操作：**

1. 编辑后端配置文件 `backend/get_jobs/.env`：

```properties
# 修改前
SECURITY_ENABLED=false

# 修改后
SECURITY_ENABLED=true
```

2. 重启后端服务：

```bash
systemctl restart get_jobs
# 或
ps aux | grep java | grep get_jobs | awk '{print $2}' | xargs kill
cd /opt/zhitoujianli/backend && java -jar get_jobs-v2.0.1.jar &
```

### 关闭多用户模式（回退到单用户）

修改`.env`文件中的`SECURITY_ENABLED=false`，重启服务即可。

## 用户操作指南

### 单用户模式（SECURITY_ENABLED=false）

**特点**：
- ✅ 无需注册登录
- ✅ 直接访问所有功能
- ✅ 数据存储在`user_data/default_user/`

**使用步骤**：

1. 访问 `https://zhitoujianli.com/config`
2. 直接设置配置和上传简历
3. 开始投递

### 多用户模式（SECURITY_ENABLED=true）

**特点**：
- 🔐 需要注册登录
- 🔐 每个用户独立配置和简历
- 🔐 Cookie和登录状态隔离
- 🔐 可多人同时使用系统

**使用步骤**：

#### 1. 注册账号

访问 `https://zhitoujianli.com/register`（如果有注册页面）

或通过API注册：

```bash
curl -X POST https://zhitoujianli.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password",
    "username": "Your Name"
  }'
```

**响应示例**：

```json
{
  "success": true,
  "message": "注册成功",
  "token": "eyJhbGc...",
  "user": {
    "userId": 1,
    "email": "your-email@example.com",
    "username": "Your Name"
  }
}
```

**重要提示**：
- 首个注册用户将自动继承`default_user`的配置和简历
- 后续用户需要重新配置

#### 2. 登录

访问登录页面或通过API：

```bash
curl -X POST https://zhitoujianli.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

#### 3. 使用Token访问系统

将返回的`token`保存到浏览器`localStorage`：

```javascript
localStorage.setItem('authToken', 'eyJhbGc...');
```

或在API请求中携带：

```bash
curl https://zhitoujianli.com/api/config \
  -H "Authorization: Bearer eyJhbGc..."
```

#### 4. 管理个人配置

访问 `https://zhitoujianli.com/config`，您的配置将保存到：

```
user_data/user_{您的ID}/config.json
```

## 数据迁移说明

### 首个用户的特殊处理

**场景**：从单用户模式切换到多用户模式时

**自动操作**：
1. 第一个注册的用户会自动继承`default_user`的所有数据
2. 包括：配置文件、简历、Cookie等
3. 原`default_user`数据会备份到`user_data/default_user.backup/`

**验证迁移成功**：

```bash
# 检查数据目录
ls -la /opt/zhitoujianli/backend/user_data/

# 预期结果：
# - default_user/        （原数据保留）
# - default_user.backup/ （自动备份）
# - user_1/              （首个用户，继承自default_user）
```

### 数据回滚

如果迁移出现问题，管理员可以回滚：

```bash
# 删除当前default_user
rm -rf /opt/zhitoujianli/backend/user_data/default_user

# 从备份恢复
cp -r /opt/zhitoujianli/backend/user_data/default_user.backup \
     /opt/zhitoujianli/backend/user_data/default_user

# 关闭多用户模式
sed -i 's/SECURITY_ENABLED=true/SECURITY_ENABLED=false/' /opt/zhitoujianli/backend/.env

# 重启服务
systemctl restart get_jobs
```

## 多用户并发限制

### 系统限制

- **最大并发投递用户数**：5（可在`.env`中配置`MAX_CONCURRENT_DELIVERIES`）
- **每用户一次只能一个登录流程**
- **登录超时时间**：10分钟

### 超出限制时的处理

**当系统繁忙时**：

```json
{
  "success": false,
  "message": "系统繁忙，当前投递用户过多，请稍后再试",
  "currentDeliveries": 5
}
```

**建议**：等待5-10分钟后重试

## 常见问题

### Q1: 切换到多用户模式后，原来的配置还在吗？

**答**：在！您的配置仍然在`user_data/default_user/`目录，且首个注册用户会自动继承这些数据。

### Q2: 多个用户可以同时投递吗？

**答**：可以！每个用户有独立的Browser实例和Cookie，互不干扰。但系统最多支持5个用户同时投递（可配置）。

### Q3: 如何查看我的用户ID？

**答**：登录后访问配置页面，页面顶部会显示您的用户ID和邮箱。

### Q4: 忘记密码怎么办？

**答**：目前需要联系管理员重置。后续版本将支持邮箱找回密码。

### Q5: 可以删除账号吗？

**答**：系统支持软删除。联系管理员处理。

### Q6: 多用户模式下性能会下降吗？

**答**：单个用户使用时性能无差异。多用户并发投递时，每个用户占用约500MB内存。

## 安全建议

### 密码安全

- ✅ 使用强密码（至少6位，包含字母和数字）
- ✅ 不要与其他网站共用密码
- ✅ 定期更换密码

### Token管理

- ✅ Token有效期为24小时
- ✅ 不要将Token分享给他人
- ✅ 退出登录时清除Token

### 数据安全

- ✅ 简历和配置仅您本人可访问
- ✅ 系统使用文件系统隔离
- ✅ Cookie文件按用户ID隔离

## 技术支持

遇到问题请联系：
- 邮箱：support@zhitoujianli.com
- 文档：https://docs.zhitoujianli.com
- GitHub：https://github.com/your-org/zhitoujianli

