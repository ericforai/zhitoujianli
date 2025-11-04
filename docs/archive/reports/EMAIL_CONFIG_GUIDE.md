# 📧 邮箱配置指南

## 当前状态

### ❌ 邮件服务未配置

后端日志显示：

```
⚠️ 邮件服务未配置，某些功能将不可用
⚠️ 请在.env文件中配置MAIL_USERNAME和MAIL_PASSWORD
```

**影响**：

- ✅ 注册功能可用（数据库已正常存储用户）
- ❌ 邮箱验证码无法发送
- ❌ 密码重置功能不可用

---

## 📝 配置说明

### 邮件服务配置项

后端从 `.env` 文件读取以下配置（位置：`/root/zhitoujianli/backend/get_jobs/src/main/resources/.env`）：

| 配置项           | 说明           | 默认值          | 必填  |
| ---------------- | -------------- | --------------- | ----- |
| `MAIL_HOST`      | SMTP服务器地址 | smtp.qq.com     | 否    |
| `MAIL_PORT`      | SMTP端口       | 465             | 否    |
| `MAIL_USERNAME`  | 发件邮箱账号   | -               | ✅ 是 |
| `MAIL_PASSWORD`  | SMTP授权码     | -               | ✅ 是 |
| `MAIL_FROM`      | 发件人地址     | 同MAIL_USERNAME | 否    |
| `MAIL_FROM_NAME` | 发件人名称     | 智投简历        | 否    |

---

## 🔧 快速配置步骤

### 方案一：使用QQ邮箱（推荐）

#### 1. 开启QQ邮箱SMTP服务

1. 登录 [QQ邮箱](https://mail.qq.com)
2. 点击 **设置** → **账户** → **POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务**
3. 开启 **SMTP服务**
4. 点击 **生成授权码**（短信验证）
5. **保存授权码**（这个就是MAIL_PASSWORD）

#### 2. 创建配置文件

```bash
cat > /root/zhitoujianli/backend/get_jobs/src/main/resources/.env << 'EOF'
# QQ邮箱配置
MAIL_HOST=smtp.qq.com
MAIL_PORT=465
MAIL_USERNAME=你的QQ邮箱@qq.com
MAIL_PASSWORD=刚才生成的16位授权码
MAIL_FROM=你的QQ邮箱@qq.com
MAIL_FROM_NAME=智投简历
EOF
```

#### 3. 重启后端服务

```bash
# 停止现有服务
pkill -f "get_jobs-v2.0.1.jar"

# 启动服务
cd /root/zhitoujianli/backend/get_jobs
nohup java -jar target/get_jobs-v2.0.1.jar --spring.profiles.active=production > backend.log 2>&1 &

# 等待启动
sleep 20

# 检查日志
tail -30 backend.log | grep -i mail
```

#### 4. 测试邮件发送

```bash
# 测试发送验证码
curl -X POST http://localhost:8080/api/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

### 方案二：使用163邮箱

#### 1. 开启163邮箱SMTP服务

1. 登录 [163邮箱](https://mail.163.com)
2. 点击 **设置** → **POP3/SMTP/IMAP**
3. 开启 **SMTP服务**
4. 设置 **客户端授权密码**
5. **保存授权密码**

#### 2. 配置文件

```bash
cat > /root/zhitoujianli/backend/get_jobs/src/main/resources/.env << 'EOF'
# 163邮箱配置
MAIL_HOST=smtp.163.com
MAIL_PORT=465
MAIL_USERNAME=你的163邮箱@163.com
MAIL_PASSWORD=客户端授权密码
MAIL_FROM=你的163邮箱@163.com
MAIL_FROM_NAME=智投简历
EOF
```

---

### 方案三：使用阿里云企业邮箱

```bash
cat > /root/zhitoujianli/backend/get_jobs/src/main/resources/.env << 'EOF'
# 阿里云企业邮箱配置
MAIL_HOST=smtp.qiye.aliyun.com
MAIL_PORT=465
MAIL_USERNAME=你的企业邮箱@yourdomain.com
MAIL_PASSWORD=邮箱密码
MAIL_FROM=你的企业邮箱@yourdomain.com
MAIL_FROM_NAME=智投简历
EOF
```

---

### 方案四：使用Gmail（需科学上网）

```bash
cat > /root/zhitoujianli/backend/get_jobs/src/main/resources/.env << 'EOF'
# Gmail配置
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=应用专用密码
MAIL_FROM=your-email@gmail.com
MAIL_FROM_NAME=智投简历
EOF
```

**注意**：Gmail需要开启"两步验证"并生成"应用专用密码"

---

## ✅ 验证配置

### 1. 检查日志

配置成功后，日志应显示：

```
✅ 邮件配置加载成功
📧 SMTP服务器: smtp.qq.com:465
📧 发件人: zhitoujianli@qq.com
```

### 2. 测试发送

```bash
# 本地测试
curl -X POST http://localhost:8080/api/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@example.com"}'

# 公网测试
curl -X POST http://115.190.182.95/api/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@example.com"}'
```

成功响应：

```json
{
  "success": true,
  "message": "验证码已发送到邮箱，请查看邮件",
  "expiresIn": 300
}
```

---

## 📊 邮件功能说明

### 当前已实现的邮件功能

1. **验证码邮件** ✅
   - 用于用户注册验证
   - 用于密码重置验证
   - 有效期：5分钟

2. **密码重置邮件** ✅
   - 包含重置链接
   - 有效期：30分钟

3. **欢迎邮件** ✅
   - 注册成功后发送
   - 介绍平台功能

### 邮件模板

所有邮件都使用精美的HTML模板，包含：

- 响应式设计
- 渐变色头部
- 清晰的操作指引
- 品牌标识

---

## 🚨 常见问题

### Q1: 邮件发送失败

**原因**：

- SMTP授权码错误
- 端口被防火墙拦截
- 邮箱未开启SMTP服务

**解决**：

1. 检查授权码是否正确（不是邮箱密码）
2. 确认防火墙允许465/587端口
3. 重新生成授权码

### Q2: 配置后仍然提示未配置

**原因**：

- .env文件位置错误
- 未重启后端服务
- 配置格式错误

**解决**：

```bash
# 检查文件位置
ls -l /root/zhitoujianli/backend/get_jobs/src/main/resources/.env

# 检查文件内容
cat /root/zhitoujianli/backend/get_jobs/src/main/resources/.env

# 重启服务
pkill -f "get_jobs-v2.0.1.jar"
cd /root/zhitoujianli/backend/get_jobs
nohup java -jar target/get_jobs-v2.0.1.jar --spring.profiles.active=production > backend.log 2>&1 &
```

### Q3: 邮件进入垃圾箱

**解决**：

1. 使用企业邮箱（更高信誉）
2. 配置SPF/DKIM记录
3. 降低发送频率

---

## 🎯 推荐配置

### 开发/测试环境

- **QQ邮箱**：免费、稳定、配置简单
- **163邮箱**：备选方案

### 生产环境

- **阿里云企业邮箱**：专业、高送达率
- **腾讯企业邮箱**：稳定可靠

---

## 📞 快速配置命令

### 一键配置QQ邮箱（示例）

```bash
# 替换为你的实际信息
MAIL_USERNAME="zhitoujianli@qq.com"
MAIL_PASSWORD="你的16位授权码"

cat > /root/zhitoujianli/backend/get_jobs/src/main/resources/.env << EOF
MAIL_HOST=smtp.qq.com
MAIL_PORT=465
MAIL_USERNAME=$MAIL_USERNAME
MAIL_PASSWORD=$MAIL_PASSWORD
MAIL_FROM=$MAIL_USERNAME
MAIL_FROM_NAME=智投简历
EOF

echo "✅ 邮件配置已创建"
echo "📝 请重启后端服务使配置生效"
```

---

## 🔐 安全建议

1. **.env文件不要提交到Git**

   ```bash
   echo ".env" >> .gitignore
   ```

2. **定期更换授权码**

3. **使用专门的邮箱账号**（不要用个人主邮箱）

4. **监控发送量**（避免被标记为垃圾邮件）

---

**配置完成后，注册流程将完全可用！** 🎉

