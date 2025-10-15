# 📧 邮件服务配置完整指南

## 🎯 三种邮箱配置方案

### 方案1: QQ邮箱（推荐，最常用）

**获取授权码步骤**:
1. 访问 https://mail.qq.com/
2. 登录QQ邮箱
3. 【设置】→【账户】
4. 找到【POP3/IMAP/SMTP服务】
5. 开启【POP3/SMTP服务】
6. 点击【生成授权码】
7. 手机QQ扫码验证
8. 复制16位授权码

**配置参数**:
```bash
MAIL_HOST=smtp.qq.com
MAIL_PORT=465
MAIL_USERNAME=您的QQ号@qq.com
MAIL_PASSWORD=16位授权码（去掉空格）
MAIL_FROM=您的QQ号@qq.com
MAIL_FROM_NAME=智投简历
```

---

### 方案2: 163邮箱

**获取授权码步骤**:
1. 访问 https://mail.163.com/
2. 登录163邮箱
3. 【设置】→【POP3/SMTP/IMAP】
4. 开启【SMTP服务】
5. 点击【客户端授权密码】
6. 通过手机验证
7. 复制授权码

**配置参数**:
```bash
MAIL_HOST=smtp.163.com
MAIL_PORT=465
MAIL_USERNAME=您的163邮箱@163.com
MAIL_PASSWORD=授权码
MAIL_FROM=您的163邮箱@163.com
MAIL_FROM_NAME=智投简历
```

---

### 方案3: Gmail（国外用户）

**配置参数**:
```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=应用专用密码
MAIL_FROM=your-email@gmail.com
MAIL_FROM_NAME=ZhiTouJianLi
```

---

## 🧪 配置后测试步骤

### 1. 配置.env文件
```bash
vim /root/zhitoujianli/backend/get_jobs/.env
```

### 2. 重启服务
```bash
kill $(cat /tmp/backend.pid)
cd /root/zhitoujianli/backend/get_jobs
mvn spring-boot:run > /tmp/backend_mvp.log 2>&1 &
echo $! > /tmp/backend.pid
sleep 20
```

### 3. 测试邮件发送
```bash
# 发送到您自己的邮箱测试
curl -X POST http://localhost:8080/api/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@qq.com"}'
```

### 4. 检查邮箱
- 打开您的邮箱收件箱
- 查找来自"智投简历"的邮件
- 如果没收到，检查垃圾邮件箱

---

## ⚠️ 常见问题

### Q1: 授权码错误？
- 确认16位授权码没有空格
- 重新生成授权码试试
- 确认SMTP服务已开启

### Q2: 连接超时？
- 检查防火墙
- 确认端口465可访问
- 尝试使用端口587（TLS）

### Q3: 邮件进垃圾箱？
- 正常现象，第一次可能被标记
- 在邮箱中标记为"非垃圾邮件"

---

## 📝 配置示例

```bash
# QQ邮箱配置示例
MAIL_HOST=smtp.qq.com
MAIL_PORT=465
MAIL_USERNAME=123456789@qq.com
MAIL_PASSWORD=abcdefghijklmnop
MAIL_FROM=123456789@qq.com
MAIL_FROM_NAME=智投简历
```

配置完成后立即测试！
