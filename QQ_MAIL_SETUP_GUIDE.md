# 🚀 QQ邮箱SMTP配置指南（5分钟完成）

## 📋 当前状态

✅ **配置模板已添加** - 现在需要您填写实际的QQ邮箱信息

---

## 🔑 步骤1: 获取QQ邮箱SMTP授权码（2分钟）

### 1.1 登录QQ邮箱

打开浏览器访问：**https://mail.qq.com**

使用您的QQ号和密码登录

### 1.2 进入设置

1. 点击页面上方的 **设置** 图标（⚙️）
2. 选择 **账户** 选项卡

### 1.3 开启SMTP服务

1. 向下滚动找到 **POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务**
2. 找到 **SMTP服务**，点击 **开启**
3. 系统会要求发送短信验证
4. 按提示发送短信（发送配置到指定号码）

### 1.4 生成授权码

1. 短信发送成功后，点击 **生成授权码**
2. 再次发送短信验证
3. 系统会显示一个 **16位的授权码**（例如：abcdefghijklmnop）
4. **⚠️ 重要：立即复制并保存这个授权码！**

> 💡 **提示**：授权码只显示一次，如果丢失需要重新生成

---

## ✏️ 步骤2: 填写配置信息（1分钟）

### 2.1 编辑.env文件

```bash
# 使用vim编辑器
vim /root/zhitoujianli/backend/get_jobs/src/main/resources/.env

# 或使用nano编辑器
nano /root/zhitoujianli/backend/get_jobs/src/main/resources/.env
```

### 2.2 修改以下三处

找到文件末尾的邮件配置部分，替换以下内容：

```env
# ========== 邮件服务配置 ==========
# QQ邮箱SMTP配置
MAIL_HOST=smtp.qq.com
MAIL_PORT=465
MAIL_USERNAME=您的QQ号@qq.com        # 👈 改这里，例如：123456789@qq.com
MAIL_PASSWORD=您的16位授权码           # 👈 改这里，粘贴刚才获取的授权码
MAIL_FROM=您的QQ号@qq.com            # 👈 改这里，与MAIL_USERNAME相同
MAIL_FROM_NAME=智投简历
```

### 2.3 保存文件

**使用vim**：按 `Esc`，输入 `:wq`，按 `Enter`

**使用nano**：按 `Ctrl+O` 保存，按 `Ctrl+X` 退出

---

## 📝 配置示例

**假设您的QQ号是：123456789，授权码是：abcdefghijklmnop**

```env
# ========== 邮件服务配置 ==========
# QQ邮箱SMTP配置
MAIL_HOST=smtp.qq.com
MAIL_PORT=465
MAIL_USERNAME=123456789@qq.com
MAIL_PASSWORD=abcdefghijklmnop
MAIL_FROM=123456789@qq.com
MAIL_FROM_NAME=智投简历
```

---

## 🔄 步骤3: 重启后端服务（1分钟）

### 3.1 停止现有服务

```bash
pkill -f "get_jobs-v2.0.1.jar"
```

### 3.2 等待进程停止

```bash
sleep 3
```

### 3.3 启动服务

```bash
cd /root/zhitoujianli/backend/get_jobs
nohup java -jar target/get_jobs-v2.0.1.jar --spring.profiles.active=production > backend.log 2>&1 &
```

### 3.4 等待服务启动

```bash
sleep 25
echo "服务启动中，请稍候..."
```

---

## ✅ 步骤4: 验证配置（1分钟）

### 4.1 检查日志

```bash
tail -30 /root/zhitoujianli/backend/get_jobs/backend.log | grep -A 3 "邮件配置"
```

**期望看到**：

```
✅ 邮件配置加载成功
📧 SMTP服务器: smtp.qq.com:465
📧 发件人: 您的QQ邮箱@qq.com
```

### 4.2 测试发送验证码

```bash
curl -X POST http://localhost:8080/api/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"email":"您的测试邮箱@example.com"}'
```

**成功响应**：

```json
{
  "success": true,
  "message": "验证码已发送到邮箱，请查看邮件",
  "expiresIn": 300
}
```

### 4.3 检查邮箱

登录您的测试邮箱，应该收到一封包含验证码的邮件。

---

## 🎯 快速命令脚本

如果您已经有QQ邮箱和授权码，可以使用以下一键配置脚本：

```bash
#!/bin/bash
# 快速配置脚本

# ⚠️ 请先修改这两行为您的实际信息
QQ_EMAIL="您的QQ号@qq.com"           # 例如：123456789@qq.com
SMTP_PASSWORD="您的16位授权码"        # 例如：abcdefghijklmnop

# 以下无需修改
sed -i "s/请填写您的QQ邮箱/$QQ_EMAIL/g" /root/zhitoujianli/backend/get_jobs/src/main/resources/.env
sed -i "s/请填写QQ邮箱SMTP授权码/$SMTP_PASSWORD/g" /root/zhitoujianli/backend/get_jobs/src/main/resources/.env

echo "✅ 配置已更新"
echo "📝 请重启后端服务使配置生效"
```

---

## 🚨 常见问题

### Q1: 授权码在哪里查看？

**A**: 授权码生成后只显示一次，无法查看历史授权码。如果忘记，需要：

1. 进入QQ邮箱设置
2. 关闭SMTP服务
3. 重新开启并生成新的授权码

### Q2: 提示"535 Login Fail"怎么办？

**A**: 这表示授权码错误，请：

1. 确认使用的是授权码（不是QQ密码）
2. 检查授权码是否有空格或换行
3. 重新生成授权码

### Q3: 邮件发送失败怎么办？

**A**: 检查以下几点：

```bash
# 1. 查看详细错误日志
tail -100 /root/zhitoujianli/backend/get_jobs/backend.log | grep -i error

# 2. 测试网络连接
telnet smtp.qq.com 465

# 3. 检查配置是否正确
cat /root/zhitoujianli/backend/get_jobs/src/main/resources/.env | grep MAIL
```

### Q4: 邮件进入垃圾箱怎么办？

**A**:

1. 第一次发送可能会进入垃圾箱
2. 将发件人添加到通讯录
3. 标记为"非垃圾邮件"
4. 后续邮件就会正常到达

---

## 📞 需要帮助？

如果配置过程中遇到问题，请提供以下信息：

1. **日志内容**：

   ```bash
   tail -50 /root/zhitoujianli/backend/get_jobs/backend.log
   ```

2. **配置内容**（隐藏密码）：

   ```bash
   cat /root/zhitoujianli/backend/get_jobs/src/main/resources/.env | grep MAIL | sed 's/PASSWORD=.*/PASSWORD=***/'
   ```

3. **错误提示**：具体的错误信息

---

## ✨ 配置完成后的效果

配置成功后，用户注册时将：

1. ✅ 输入邮箱和密码
2. ✅ 点击"发送验证码"
3. ✅ 收到包含6位数字验证码的邮件
4. ✅ 输入验证码完成注册
5. ✅ 收到欢迎邮件

**邮件模板预览**：

- 精美的渐变色头部
- 清晰的验证码显示
- 5分钟有效期提示
- 响应式设计（手机/电脑都适配）

---

**预计总耗时：5分钟** ⏱️

**配置完成后立即生效！** 🚀

