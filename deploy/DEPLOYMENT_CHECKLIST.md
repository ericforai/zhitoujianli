# 🚀 智投简历 - 部署执行清单

**开始时间：** ********\_********

**执行人：** ********\_********

---

## 📋 部署前准备（预计 5 分钟）

### ✅ 信息收集

请先准备好以下信息：

- [ ] **服务器信息**
  - 服务器 IP 地址：`___________________`
  - SSH 用户名：`___________________`
  - SSH 端口：`___________________`（默认 22）

- [ ] **域名信息**
  - 主域名：`zhitoujianli.com`
  - WWW 域名：`www.zhitoujianli.com`
  - DNS 已解析到服务器 IP：是 ☐ / 否 ☐

- [ ] **联系方式**
  - 邮箱地址（用于 SSL 证书）：`___________________`

---

## 🖥️ 步骤 1：服务器准备（预计 5 分钟）

### 1.1 SSH 登录服务器

```bash
# 使用以下命令登录服务器（替换实际的 IP 和用户名）
ssh your-user@your-server-ip
```

**状态：** 成功登录 ☐ / 失败（记录错误）☐

**如果失败：**

- 检查服务器 IP 是否正确
- 检查用户名是否正确
- 检查是否有网络连接
- 尝试：`ping your-server-ip`

---

### 1.2 安装必需软件

**复制并执行以下命令：**

```bash
# 更新软件包列表
sudo apt update

# 安装所需软件（一次性安装所有）
sudo apt install -y nginx certbot python3-certbot-nginx curl rsync git
```

**执行结果：**

- [ ] ✅ 命令执行成功，没有错误
- [ ] ⚠️ 有警告但继续（记录警告信息）
- [ ] ❌ 执行失败（记录错误信息）

**验证安装：**

```bash
# 验证各软件是否安装成功
nginx -v          # 应显示 nginx 版本
certbot --version # 应显示 certbot 版本
curl --version    # 应显示 curl 版本
rsync --version   # 应显示 rsync 版本
```

**版本信息记录：**

- Nginx 版本：`___________________`
- Certbot 版本：`___________________`

---

### 1.3 创建部署目录

**复制并执行以下命令：**

```bash
# 创建项目目录
sudo mkdir -p /var/www/zhitoujianli/releases
sudo mkdir -p /var/www/letsencrypt

# 设置目录权限（将 ubuntu 替换为你的实际用户名）
sudo chown -R $USER:$USER /var/www/zhitoujianli
sudo chown -R www-data:www-data /var/www/letsencrypt

# 验证目录创建成功
ls -la /var/www/ | grep zhitoujianli
ls -la /var/www/ | grep letsencrypt
```

**执行结果：**

- [ ] ✅ 目录创建成功
- [ ] ❌ 创建失败（记录错误）

---

### 1.4 配置防火墙

**复制并执行以下命令：**

```bash
# 允许 HTTP 和 HTTPS 流量
sudo ufw allow 'Nginx Full'

# 允许 SSH（非常重要！防止被锁在外面）
sudo ufw allow OpenSSH

# 启用防火墙
sudo ufw enable

# 查看防火墙状态
sudo ufw status
```

**执行结果：**

- [ ] ✅ 防火墙配置成功
- [ ] ❌ 配置失败（记录错误）

**防火墙状态应显示：**

```
Status: active

To                         Action      From
--                         ------      ----
Nginx Full                 ALLOW       Anywhere
OpenSSH                    ALLOW       Anywhere
```

---

## 🔐 步骤 2：申请 SSL 证书（预计 3 分钟）

### 2.1 验证域名解析

**在本地电脑执行：**

```bash
# 检查域名解析
nslookup zhitoujianli.com
nslookup www.zhitoujianli.com
```

**解析结果：**

- [ ] ✅ 两个域名都解析到正确的服务器 IP
- [ ] ❌ 域名未解析或解析错误

**如果解析错误，请先到域名服务商配置 DNS：**

- A 记录：`zhitoujianli.com` → `你的服务器 IP`
- A 记录：`www.zhitoujianli.com` → `你的服务器 IP`
- 等待 DNS 生效（可能需要 5-30 分钟）

---

### 2.2 申请 Let's Encrypt 证书

**在服务器上执行：**

```bash
# 临时停止 Nginx
sudo systemctl stop nginx

# 申请证书（请替换邮箱地址为你的真实邮箱）
sudo certbot certonly --standalone \
  -d zhitoujianli.com \
  -d www.zhitoujianli.com \
  --agree-tos \
  --email your-email@example.com \
  --non-interactive

# 启动 Nginx
sudo systemctl start nginx
```

**邮箱地址：** `___________________`（请填写并在上面命令中替换）

**执行结果：**

- [ ] ✅ 证书申请成功
- [ ] ❌ 申请失败（记录错误信息）

**常见错误及解决方案：**

1. **端口 80 被占用** → 确保已执行 `sudo systemctl stop nginx`
2. **域名解析失败** → 检查 DNS 配置并等待生效
3. **防火墙阻止** → 确保已执行步骤 1.4

---

### 2.3 验证证书

**在服务器上执行：**

```bash
# 查看证书信息
sudo certbot certificates

# 检查证书文件
sudo ls -la /etc/letsencrypt/live/zhitoujianli.com/
```

**验证清单：**

- [ ] 证书名称显示为 `zhitoujianli.com`
- [ ] 包含两个域名：`zhitoujianli.com` 和 `www.zhitoujianli.com`
- [ ] 有效期显示为 89-90 天
- [ ] 证书文件存在：`fullchain.pem`、`privkey.pem`

**证书到期时间：** `___________________`

---

## 🔑 步骤 3：配置 SSH 密钥（预计 3 分钟）

### 3.1 生成 SSH 密钥对

**在本地电脑执行：**

```bash
# 生成新的 SSH 密钥对（如果已有可跳过）
ssh-keygen -t rsa -b 4096 -C "deploy@zhitoujianli.com" -f ~/.ssh/zhitoujianli_deploy

# 按提示操作：
# 1. Enter passphrase：可以直接回车（不设密码）或设置密码
# 2. 确认密码
```

**执行结果：**

- [ ] ✅ 密钥对生成成功
- [ ] ☐ 使用现有密钥（路径：`___________________`）

**密钥文件位置：**

- 私钥：`~/.ssh/zhitoujianli_deploy`
- 公钥：`~/.ssh/zhitoujianli_deploy.pub`

---

### 3.2 将公钥添加到服务器

**在本地电脑执行：**

```bash
# 方式 1：使用 ssh-copy-id（推荐）
ssh-copy-id -i ~/.ssh/zhitoujianli_deploy.pub your-user@your-server-ip

# 方式 2：手动复制（如果方式 1 失败）
# 先查看公钥内容
cat ~/.ssh/zhitoujianli_deploy.pub
# 然后 SSH 登录服务器，将内容添加到 ~/.ssh/authorized_keys
```

**执行结果：**

- [ ] ✅ 公钥添加成功

---

### 3.3 测试 SSH 连接

**在本地电脑执行：**

```bash
# 使用新密钥测试连接
ssh -i ~/.ssh/zhitoujianli_deploy your-user@your-server-ip

# 如果成功登录，输入 exit 退出
exit
```

**测试结果：**

- [ ] ✅ 可以使用密钥登录
- [ ] ❌ 连接失败（记录错误）

---

### 3.4 获取私钥内容

**在本地电脑执行：**

```bash
# 查看私钥内容
cat ~/.ssh/zhitoujianli_deploy

# 或复制到剪贴板（macOS）
cat ~/.ssh/zhitoujianli_deploy | pbcopy

# Linux（需要 xclip）
cat ~/.ssh/zhitoujianli_deploy | xclip -selection clipboard
```

**重要提示：**

- [ ] 已复制完整的私钥内容
- [ ] 包含 `-----BEGIN RSA PRIVATE KEY-----`
- [ ] 包含 `-----END RSA PRIVATE KEY-----`
- [ ] 保持所有换行符不变

---

## 🔧 步骤 4：配置 GitHub Secrets（预计 5 分钟）

### 4.1 进入 GitHub 仓库设置

1. 打开浏览器，访问：`https://github.com/ericforai/zhitoujianli`
2. 点击 `Settings` 标签
3. 左侧菜单选择 `Secrets and variables` → `Actions`
4. 点击 `New repository secret` 按钮

**状态：** 已进入配置页面 ☐

---

### 4.2 添加 6 个必需的 Secrets

**逐个添加以下 Secrets：**

#### Secret 1: SSH_HOST

- **Name:** `SSH_HOST`
- **Secret:** `___________________`（填写服务器 IP 或域名）
- **状态:** 已添加 ☐

#### Secret 2: SSH_USER

- **Name:** `SSH_USER`
- **Secret:** `___________________`（填写 SSH 用户名，如 ubuntu）
- **状态:** 已添加 ☐

#### Secret 3: SSH_PORT

- **Name:** `SSH_PORT`
- **Secret:** `22`
- **状态:** 已添加 ☐

#### Secret 4: SSH_KEY

- **Name:** `SSH_KEY`
- **Secret:** `___________________`（粘贴步骤 3.4 中复制的完整私钥）
- **重要:** 确保包含 BEGIN 和 END 标记
- **状态:** 已添加 ☐

#### Secret 5: REMOTE_DEPLOY_DIR

- **Name:** `REMOTE_DEPLOY_DIR`
- **Secret:** `/var/www/zhitoujianli`
- **状态:** 已添加 ☐

#### Secret 6: REMOTE_NGINX_CONF

- **Name:** `REMOTE_NGINX_CONF`
- **Secret:** `/etc/nginx/conf.d/zhitoujianli.conf`
- **状态:** 已添加 ☐

---

### 4.3 验证 Secrets 配置

**检查清单：**

- [ ] 总共添加了 6 个 Secrets
- [ ] 所有 Secret 名称大小写正确
- [ ] SSH_KEY 包含完整的私钥内容
- [ ] 没有多余的空格或换行

**截图保存：** 建议截图保存配置页面（不要包含私钥内容）☐

---

## 🚀 步骤 5：首次部署（预计 5 分钟）

### 5.1 手动触发部署

1. 在 GitHub 仓库页面，点击 `Actions` 标签
2. 左侧选择 `Deploy to Production` 工作流
3. 点击右上角 `Run workflow` 按钮
4. 确认环境选择为 `production`
5. 点击绿色的 `Run workflow` 按钮

**状态：** 工作流已启动 ☐

**启动时间：** `___________________`

---

### 5.2 观察部署日志

**关键步骤检查：**

等待以下步骤全部变成绿色 ✅：

1. [ ] 📦 检出代码
2. [ ] 📦 设置 Node.js
3. [ ] 📦 安装依赖
4. [ ] 🔍 代码质量检查
5. [ ] 🔨 构建前端
6. [ ] 📦 准备部署包
7. [ ] 🚀 上传前端到服务器
8. [ ] 📤 上传 Nginx 配置
9. [ ] 🎯 执行远程部署
10. [ ] 📊 生成部署报告

**如果某个步骤失败（红色 ✗）：**

- 点击该步骤查看详细日志
- 记录错误信息：`___________________`
- 参考故障排查部分

**部署完成时间：** `___________________`

**总耗时：** `___________________`

---

## ✅ 步骤 6：验证部署（预计 5 分钟）

### 6.1 访问网站

**在浏览器中依次访问：**

1. [ ] http://zhitoujianli.com （应自动跳转到 HTTPS）
2. [ ] https://zhitoujianli.com （应正常显示）
3. [ ] https://www.zhitoujianli.com （应正常显示）
4. [ ] https://www.zhitoujianli.com/register （注册页面）
5. [ ] https://www.zhitoujianli.com/login （登录页面）

**验证清单：**

- [ ] 网站可以正常访问
- [ ] 浏览器地址栏显示锁图标 🔒
- [ ] 页面内容正确显示（不是空白页）
- [ ] 没有显示 Nginx 默认页面

---

### 6.2 检查 SSL 证书

**在浏览器中：**

1. 点击地址栏的锁图标
2. 查看证书信息

**验证清单：**

- [ ] 证书由 Let's Encrypt 签发
- [ ] 证书包含两个域名
- [ ] 证书在有效期内
- [ ] 没有证书警告

---

### 6.3 检查 CORS 配置

**打开浏览器开发者工具（F12）：**

1. 切换到 `Console` 标签
2. 刷新页面
3. 查看是否有 CORS 错误

**验证清单：**

- [ ] 控制台没有 CORS 错误
- [ ] 控制台没有红色错误信息
- [ ] 可以看到 API 请求（Network 标签）

---

### 6.4 测试 API 端点

**在浏览器或命令行测试：**

```bash
# 测试主页
curl -I https://www.zhitoujianli.com/

# 测试 API（应返回响应，即使是错误码也说明连接正常）
curl -I https://zhitoujianli.com/api/auth/send-verification-code

# 检查 CORS 头
curl -H "Origin: https://www.zhitoujianli.com" -I https://zhitoujianli.com/api/
```

**验证清单：**

- [ ] 主页返回 200 状态码
- [ ] API 端点有响应（200/401/405 都可以）
- [ ] 响应头包含 `Access-Control-Allow-Origin`

---

### 6.5 运行健康检查脚本

**方式 1：在服务器上运行**

```bash
# SSH 登录服务器
ssh -i ~/.ssh/zhitoujianli_deploy your-user@your-server-ip

# 进入项目目录
cd /var/www/zhitoujianli

# 运行健康检查（如果脚本存在）
./scripts/post-deploy-check.sh || echo "脚本需要先上传"
```

**方式 2：在本地运行**

```bash
# 在项目根目录执行
./deploy/scripts/post-deploy-check.sh
```

**健康检查结果：**

- 总检查项：`_____`
- 通过：`_____`
- 警告：`_____`
- 失败：`_____`
- 成功率：`_____%`

**状态：**

- [ ] ✅ 所有检查通过
- [ ] ⚠️ 有警告但可接受
- [ ] ❌ 有严重错误需要修复

---

## 📊 部署总结

### 部署信息

- **开始时间：** `___________________`
- **完成时间：** `___________________`
- **总耗时：** `___________________`
- **部署版本：** GitHub Run Number `_____`
- **Git Commit：** `___________________`

### 最终状态

- [ ] ✅ 部署完全成功，所有功能正常
- [ ] ⚠️ 部署成功，但有小问题需要关注
- [ ] ❌ 部署失败，需要回滚或修复

### 访问信息

- **生产环境地址：** https://www.zhitoujianli.com
- **管理后台：** https://www.zhitoujianli.com/admin（如有）
- **API 地址：** https://zhitoujianli.com/api

---

## 🔧 故障排查

### 问题 1：GitHub Actions SSH 连接失败

**症状：** 部署日志显示 SSH 连接超时或被拒绝

**检查清单：**

- [ ] SSH_HOST 配置正确
- [ ] SSH_USER 配置正确
- [ ] SSH_PORT 配置正确
- [ ] SSH_KEY 包含完整私钥（含 BEGIN/END 标记）
- [ ] 公钥已添加到服务器 `~/.ssh/authorized_keys`
- [ ] 服务器防火墙允许 SSH 连接

**解决方案：**

```bash
# 在本地测试 SSH 连接
ssh -i ~/.ssh/zhitoujianli_deploy your-user@your-server-ip

# 如果失败，检查服务器 SSH 服务
sudo systemctl status ssh
```

---

### 问题 2：Nginx 配置测试失败

**症状：** 部署日志显示 `nginx -t` 失败

**检查清单：**

- [ ] SSL 证书文件存在
- [ ] 证书路径正确
- [ ] Nginx 配置语法正确

**解决方案：**

```bash
# SSH 登录服务器
ssh -i ~/.ssh/zhitoujianli_deploy your-user@your-server-ip

# 手动测试 Nginx 配置
sudo nginx -t

# 查看详细错误
sudo nginx -T

# 检查证书文件
sudo ls -la /etc/letsencrypt/live/zhitoujianli.com/
```

---

### 问题 3：网站显示 502 Bad Gateway

**症状：** 网站可以访问但显示 502 错误

**可能原因：**

- 后端服务未启动
- 反向代理配置错误
- 防火墙阻止连接

**解决方案：**

```bash
# 检查后端服务（假设后端在 8080 端口）
curl http://115.190.182.95:8080/api/

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/zhitoujianli_error.log

# 检查 Nginx 代理配置
sudo cat /etc/nginx/conf.d/zhitoujianli.conf | grep proxy_pass
```

---

### 问题 4：CORS 错误

**症状：** 浏览器控制台显示 CORS 错误

**检查清单：**

- [ ] Nginx 配置包含 CORS 响应头
- [ ] `Access-Control-Allow-Origin` 设置正确
- [ ] OPTIONS 预检请求返回 204

**解决方案：**

```bash
# 测试 CORS 响应头
curl -H "Origin: https://www.zhitoujianli.com" -I https://zhitoujianli.com/api/

# 应该看到类似输出：
# Access-Control-Allow-Origin: https://www.zhitoujianli.com
# Access-Control-Allow-Credentials: true
```

---

## 📝 下一步操作

### 立即执行

- [ ] 将本检查清单存档（打印或保存为 PDF）
- [ ] 配置监控告警（UptimeRobot、Pingdom 等）
- [ ] 测试所有核心功能（注册、登录、API）
- [ ] 通知团队部署完成

### 本周内完成

- [ ] 配置自动备份
- [ ] 设置日志监控
- [ ] 性能优化（CDN、缓存等）
- [ ] 安全加固（fail2ban、限流等）

### 定期维护

- [ ] 每天检查网站可访问性
- [ ] 每周检查错误日志
- [ ] 每月更新系统软件
- [ ] 每季度审查安全配置

---

## 📞 紧急联系方式

**如遇严重问题：**

1. **回滚到上一版本**

   ```bash
   ssh -i ~/.ssh/zhitoujianli_deploy your-user@your-server-ip
   cd /var/www/zhitoujianli
   sudo rm dist
   sudo cp -P dist_backup dist
   ```

2. **重启 Nginx**

   ```bash
   sudo systemctl restart nginx
   ```

3. **查看日志**

   ```bash
   sudo tail -100 /var/log/nginx/zhitoujianli_error.log
   ```

4. **联系支持**
   - GitHub Issues: 项目 Issues 页面
   - 邮件: zhitoujianli@qq.com

---

## ✅ 签字确认

**部署执行人：** ********\_\_\_********

**签名：** ********\_\_\_********

**日期：** ********\_\_\_********

**备注：**

```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

**恭喜！部署配置完成！** 🎉

现在您的智投简历项目已经成功部署到生产环境，每次 push 到 main 分支都会自动部署更新。
