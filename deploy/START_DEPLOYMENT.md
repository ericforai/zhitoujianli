# 🎯 立即开始部署 - 智投简历生产环境

## 📌 您现在的位置

✅ 所有部署配置文件已创建完成
⏭️ 下一步：执行实际部署

---

## 🚦 部署路线图（总计约 25 分钟）

```
步骤 1: 服务器准备        [⏱️ 5分钟] → 安装软件、创建目录
步骤 2: SSL 证书申请      [⏱️ 3分钟] → Let's Encrypt
步骤 3: SSH 密钥配置      [⏱️ 3分钟] → 生成并配置密钥
步骤 4: GitHub Secrets    [⏱️ 5分钟] → 配置 6 个 Secrets
步骤 5: 触发首次部署      [⏱️ 5分钟] → 执行并验证
步骤 6: 验证和测试        [⏱️ 4分钟] → 全面检查
```

---

## 📋 您需要准备的信息

在开始之前，请准备好以下信息：

### 必需信息

1. **服务器信息**
   - [ ] 服务器 IP 地址：`___________________`
   - [ ] SSH 用户名（如 ubuntu/root）：`___________________`
   - [ ] SSH 端口（默认 22）：`___________________`
   - [ ] 服务器 root 或 sudo 权限：是 ☐

2. **域名信息**
   - [ ] 域名已注册：`zhitoujianli.com`
   - [ ] DNS 已配置（A 记录指向服务器 IP）
   - [ ] WWW 子域名已配置

3. **联系方式**
   - [ ] 邮箱地址（用于 SSL 证书通知）：`___________________`

4. **GitHub 访问**
   - [ ] 可以访问 GitHub 仓库
   - [ ] 有仓库的管理员权限
   - [ ] GitHub 账号：`___________________`

### 可选信息

- [ ] 现有 SSH 密钥路径：`___________________`
- [ ] 备份联系方式：`___________________`

---

## 🎯 三种部署方式（选择一种）

### 方式 1：完整交互式部署（推荐新手）⭐

**适合：** 首次部署，想要详细指导

**文档：** `deploy/DEPLOYMENT_CHECKLIST.md`

**特点：**

- ✅ 逐步详细指导
- ✅ 每步都有验证
- ✅ 包含故障排查
- ✅ 可以打印或保存为 PDF

**开始：**

```bash
# 打开检查清单
cat deploy/DEPLOYMENT_CHECKLIST.md

# 或在编辑器中打开
code deploy/DEPLOYMENT_CHECKLIST.md
```

**预计时间：** 30-40 分钟（含验证）

---

### 方式 2：快速部署（推荐有经验者）⚡

**适合：** 熟悉部署流程，想快速完成

**文档：** `deploy/QUICK_START.md`

**特点：**

- ✅ 简洁明了
- ✅ 一键命令
- ✅ 快速验证

**开始：**

```bash
# 阅读快速指南
cat deploy/QUICK_START.md
```

**预计时间：** 15-20 分钟

---

### 方式 3：深入理解部署（推荐技术人员）📚

**适合：** 想要深入了解每个配置细节

**文档：** `deploy/README.md`

**特点：**

- ✅ 详细的技术说明
- ✅ 完整的配置选项
- ✅ 安全和性能优化
- ✅ 故障排查指南

**开始：**

```bash
# 阅读完整文档
cat deploy/README.md
```

**预计时间：** 阅读 20 分钟 + 部署 25 分钟

---

## 🚀 快速命令速查表

### 本地电脑（您的开发机）

```bash
# 1. 生成 SSH 密钥
ssh-keygen -t rsa -b 4096 -C "deploy@zhitoujianli.com" -f ~/.ssh/zhitoujianli_deploy

# 2. 添加公钥到服务器
ssh-copy-id -i ~/.ssh/zhitoujianli_deploy.pub your-user@your-server-ip

# 3. 测试连接
ssh -i ~/.ssh/zhitoujianli_deploy your-user@your-server-ip

# 4. 查看私钥（用于 GitHub Secrets）
cat ~/.ssh/zhitoujianli_deploy

# 5. 运行健康检查
./deploy/scripts/post-deploy-check.sh
```

---

### 服务器端（远程服务器）

```bash
# 1. 一键安装所有软件
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx curl rsync

# 2. 创建部署目录
sudo mkdir -p /var/www/zhitoujianli/releases /var/www/letsencrypt
sudo chown -R $USER:$USER /var/www/zhitoujianli
sudo chown -R www-data:www-data /var/www/letsencrypt

# 3. 配置防火墙
sudo ufw allow 'Nginx Full' && sudo ufw allow OpenSSH && sudo ufw enable

# 4. 申请 SSL 证书（替换邮箱）
sudo systemctl stop nginx
sudo certbot certonly --standalone \
  -d zhitoujianli.com -d www.zhitoujianli.com \
  --agree-tos --email your-email@example.com --non-interactive
sudo systemctl start nginx

# 5. 验证证书
sudo certbot certificates
```

---

## ⚙️ GitHub Secrets 配置（重要！）

**位置：** GitHub 仓库 → Settings → Secrets and variables → Actions

**需要添加的 6 个 Secrets：**

| Name                | Value 示例                            | 说明               |
| ------------------- | ------------------------------------- | ------------------ |
| `SSH_HOST`          | `123.456.789.012` 或域名              | 服务器地址         |
| `SSH_USER`          | `ubuntu`                              | SSH 用户名         |
| `SSH_PORT`          | `22`                                  | SSH 端口           |
| `SSH_KEY`           | `-----BEGIN RSA PRIVATE KEY-----…`    | 完整的 SSH 私钥    |
| `REMOTE_DEPLOY_DIR` | `/var/www/zhitoujianli`               | 部署目录           |
| `REMOTE_NGINX_CONF` | `/etc/nginx/conf.d/zhitoujianli.conf` | Nginx 配置文件路径 |

**详细配置指南：** `deploy/github-secrets-template.md`

---

## 🎬 立即开始（3 步快速启动）

### 第 1 步：选择您的方式

```bash
# 新手推荐：完整交互式部署
open deploy/DEPLOYMENT_CHECKLIST.md

# 或者：快速部署
open deploy/QUICK_START.md

# 或者：深入学习
open deploy/README.md
```

---

### 第 2 步：执行服务器准备

**打开终端，SSH 登录服务器：**

```bash
ssh your-user@your-server-ip
```

**然后复制执行以下命令（一次性）：**

```bash
# 安装软件
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx curl rsync

# 创建目录
sudo mkdir -p /var/www/zhitoujianli/releases /var/www/letsencrypt
sudo chown -R $USER:$USER /var/www/zhitoujianli
sudo chown -R www-data:www-data /var/www/letsencrypt

# 配置防火墙
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo "✅ 服务器准备完成！"
```

---

### 第 3 步：申请 SSL 证书

**在服务器上执行（记得替换邮箱）：**

```bash
# 停止 Nginx
sudo systemctl stop nginx

# 申请证书（替换 your-email@example.com 为真实邮箱）
sudo certbot certonly --standalone \
  -d zhitoujianli.com \
  -d www.zhitoujianli.com \
  --agree-tos \
  --email your-email@example.com \
  --non-interactive

# 启动 Nginx
sudo systemctl start nginx

# 验证证书
sudo certbot certificates

echo "✅ SSL 证书申请完成！"
```

**看到类似输出表示成功：**

```
Certificate Name: zhitoujianli.com
  Domains: zhitoujianli.com www.zhitoujianli.com
  Expiry Date: 2025-XX-XX (VALID: 89 days)
```

---

## ✅ 完成后的验证

### 部署成功的标志

1. **GitHub Actions**
   - 进入 GitHub → Actions
   - 看到绿色 ✅ "Deploy to Production"

2. **网站访问**
   - 打开 https://www.zhitoujianli.com/
   - 看到您的网站内容
   - 浏览器显示锁图标 🔒

3. **健康检查**
   ```bash
   ./deploy/scripts/post-deploy-check.sh
   ```

   - 显示成功率 > 90%

---

## 🐛 遇到问题？

### 快速诊断

**步骤 1：检查服务器**

```bash
# SSH 登录
ssh your-user@your-server-ip

# 检查 Nginx
sudo systemctl status nginx
sudo nginx -t

# 检查证书
sudo certbot certificates

# 查看日志
sudo tail -50 /var/log/nginx/error.log
```

**步骤 2：检查 GitHub Actions**

- 进入 Actions 页面
- 查看失败步骤的详细日志
- 常见问题：SSH 连接失败、权限不足

**步骤 3：查阅文档**

- [故障排查指南](./README.md#故障排查)
- [常见问题](./QUICK_START.md#常见问题)
- [检查清单](./DEPLOYMENT_CHECKLIST.md#故障排查)

---

## 📞 获取帮助

### 文档资源

1. **快速开始** → `deploy/QUICK_START.md`
2. **完整文档** → `deploy/README.md`
3. **配置模板** → `deploy/github-secrets-template.md`
4. **检查清单** → `deploy/DEPLOYMENT_CHECKLIST.md`
5. **系统总览** → `DEPLOYMENT.md`

### 在线支持

- **GitHub Issues**: 在仓库创建 Issue
- **文档搜索**: 在文档中搜索关键词
- **健康检查**: 运行 `./deploy/scripts/post-deploy-check.sh`

---

## 🎯 下一步行动

### 现在就开始！

**选择适合您的方式：**

1. **我是新手** → 阅读 `deploy/DEPLOYMENT_CHECKLIST.md`
2. **我有经验** → 阅读 `deploy/QUICK_START.md`
3. **我想深入了解** → 阅读 `deploy/README.md`

**或者，直接开始 3 步快速部署：**

```bash
# 1. SSH 登录服务器
ssh your-user@your-server-ip

# 2. 执行准备脚本（见上方"第 2 步"）

# 3. 申请 SSL 证书（见上方"第 3 步"）

# 4. 配置 GitHub Secrets（见上方表格）

# 5. 触发部署（GitHub Actions 界面）

# 6. 验证结果
./deploy/scripts/post-deploy-check.sh
```

---

## 📊 部署时间线

**建议安排：**

```
09:00 - 09:05  阅读文档，准备信息
09:05 - 09:10  服务器准备（安装软件）
09:10 - 09:13  申请 SSL 证书
09:13 - 09:16  配置 SSH 密钥
09:16 - 09:21  配置 GitHub Secrets
09:21 - 09:26  触发首次部署
09:26 - 09:30  验证和测试
09:30 - 09:35  完善文档和记录

总计：约 30-35 分钟
```

---

## ✨ 部署成功后

您将拥有：

- ✅ 自动化 CI/CD 部署系统
- ✅ HTTPS 安全访问
- ✅ SSL 证书自动续签
- ✅ 完整的健康检查
- ✅ 自动回滚机制
- ✅ 版本管理（保留 3 个版本）
- ✅ 零停机部署

**未来只需：**

```bash
git add .
git commit -m "feat: 新功能"
git push origin main
```

GitHub Actions 会自动完成构建和部署！

---

**准备好了吗？让我们开始吧！** 🚀

选择您的部署方式，然后按照文档一步步执行。祝您部署顺利！

有任何问题，请参考文档或提交 Issue。
