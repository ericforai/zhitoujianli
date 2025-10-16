# ✅ GitHub Actions 自动部署配置完成

## 🎉 恭喜！部署系统已配置完成

您的智投简历项目现在已经具备完整的 CI/CD 自动化部署能力！

---

## 📦 已创建的文件

### 1. GitHub Actions 工作流

#### `.github/workflows/deploy.yml`

- **功能**：自动部署到生产环境
- **触发方式**：
  - 自动：Push 到 main 分支
  - 手动：GitHub Actions 界面
- **包含步骤**：
  - ✅ 代码检出
  - ✅ 依赖安装
  - ✅ 代码质量检查
  - ✅ 前端构建
  - ✅ 上传到服务器
  - ✅ Nginx 配置更新
  - ✅ 健康检查
  - ✅ 自动回滚（失败时）
  - ✅ 版本清理

#### `.github/workflows/ssl-renew.yml`

- **功能**：SSL 证书自动续签
- **触发方式**：
  - 自动：每周一 UTC 03:00（北京时间 11:00）
  - 手动：GitHub Actions 界面
- **包含步骤**：
  - ✅ 检查证书状态
  - ✅ 执行证书续签
  - ✅ 验证新证书
  - ✅ 自动重载 Nginx
  - ✅ 健康检查

---

### 2. Nginx 配置文件

#### `deploy/nginx/zhitoujianli.conf`

- **功能**：生产环境 Nginx 完整配置
- **包含特性**：
  - ✅ HTTP 强制跳转 HTTPS
  - ✅ SSL/TLS 安全配置
  - ✅ HSTS、OCSP Stapling
  - ✅ SPA 路由支持
  - ✅ 静态资源缓存策略
  - ✅ API 反向代理
  - ✅ CORS 配置（支持 www.zhitoujianli.com）
  - ✅ WebSocket 支持
  - ✅ 安全响应头（CSP、X-Frame-Options 等）
  - ✅ 错误页面配置
  - ✅ 访问和错误日志

---

### 3. 健康检查脚本

#### `deploy/scripts/post-deploy-check.sh`

- **功能**：部署后全面健康检查
- **检查项目**：
  - ✅ HTTP 强制跳转测试
  - ✅ HTTPS 主页访问
  - ✅ 常见页面（注册、登录）
  - ✅ SSL 证书有效性
  - ✅ API 端点响应
  - ✅ CORS 配置验证
  - ✅ 响应时间检测
  - ✅ 安全响应头检查
  - ✅ 页面内容完整性
  - ✅ Nginx 配置验证

**使用方法：**

```bash
./deploy/scripts/post-deploy-check.sh
```

---

### 4. 部署文档

#### `deploy/QUICK_START.md`

- **适合人群**：首次部署用户
- **预计时间**：10 分钟
- **内容**：
  - 5 步快速部署指南
  - 服务器准备命令
  - SSL 证书申请步骤
  - GitHub Secrets 配置
  - 验证清单
  - 常见问题解决

#### `deploy/README.md`

- **适合人群**：需要详细配置的用户
- **内容**：
  - 完整的部署流程说明
  - 详细的配置选项
  - 安全配置建议
  - 故障排查指南
  - 回滚流程
  - 监控和日志管理
  - 维护清单

#### `deploy/github-secrets-template.md`

- **适合人群**：配置 GitHub Secrets 的用户
- **内容**：
  - 每个 Secret 的详细说明
  - 如何获取配置值
  - 配置验证测试
  - 故障排查步骤
  - 安全最佳实践

#### `DEPLOYMENT.md`（根目录）

- **适合人群**：所有用户
- **内容**：
  - 部署系统总览
  - 文件结构说明
  - 快速导航
  - 部署检查清单
  - 学习路径建议

---

## 🚀 下一步操作

### 步骤 1: 选择您的场景

#### 场景 A：首次部署（推荐）

**阅读文档：** `deploy/QUICK_START.md`

这个文档将指导您完成：

1. 服务器软件安装
2. SSL 证书申请
3. SSH 密钥配置
4. GitHub Secrets 设置
5. 首次部署

**预计时间：** 10-15 分钟

---

#### 场景 B：已有服务器，需要配置

**阅读文档：** `deploy/github-secrets-template.md`

这个文档将帮助您：

1. 了解需要配置哪些 GitHub Secrets
2. 如何获取每个配置值
3. 如何验证配置是否正确

**预计时间：** 5 分钟

---

#### 场景 C：深入了解部署系统

**阅读文档：** `deploy/README.md`

这个文档包含：

1. 详细的配置选项
2. 安全加固建议
3. 性能优化技巧
4. 完整的故障排查指南

**预计时间：** 20-30 分钟

---

### 步骤 2: 配置 GitHub Secrets

**必需的 6 个 Secrets：**

前往 GitHub 仓库：`Settings` → `Secrets and variables` → `Actions`

| Secret 名称         | 说明                 | 示例                                  |
| ------------------- | -------------------- | ------------------------------------- |
| `SSH_HOST`          | 服务器域名或 IP      | `zhitoujianli.com`                    |
| `SSH_USER`          | SSH 用户名           | `ubuntu`                              |
| `SSH_PORT`          | SSH 端口             | `22`                                  |
| `SSH_KEY`           | SSH 私钥（完整内容） | `-----BEGIN RSA...`                   |
| `REMOTE_DEPLOY_DIR` | 部署目录             | `/var/www/zhitoujianli`               |
| `REMOTE_NGINX_CONF` | Nginx 配置路径       | `/etc/nginx/conf.d/zhitoujianli.conf` |

**详细配置说明：** 参见 `deploy/github-secrets-template.md`

---

### 步骤 3: 服务器准备

#### 3.1 安装必需软件

```bash
# SSH 登录到服务器
ssh your-user@your-server-ip

# 一键安装
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx curl rsync
```

#### 3.2 创建部署目录

```bash
# 创建目录
sudo mkdir -p /var/www/zhitoujianli/releases
sudo mkdir -p /var/www/letsencrypt

# 设置权限（替换 ubuntu 为你的用户名）
sudo chown -R ubuntu:ubuntu /var/www/zhitoujianli
sudo chown -R www-data:www-data /var/www/letsencrypt
```

#### 3.3 申请 SSL 证书

```bash
# 临时停止 Nginx
sudo systemctl stop nginx

# 申请证书（替换邮箱地址）
sudo certbot certonly --standalone \
  -d zhitoujianli.com \
  -d www.zhitoujianli.com \
  --agree-tos \
  --email your-email@example.com

# 启动 Nginx
sudo systemctl start nginx
```

#### 3.4 配置防火墙

```bash
# 允许 HTTP 和 HTTPS
sudo ufw allow 'Nginx Full'

# 允许 SSH（重要！）
sudo ufw allow OpenSSH

# 启用防火墙
sudo ufw enable
```

#### 3.5 配置 SSH 密钥

```bash
# 在本地生成密钥对（如果还没有）
ssh-keygen -t rsa -b 4096 -C "deploy@zhitoujianli.com"

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/id_rsa.pub your-user@your-server-ip

# 获取私钥内容（用于 GitHub Secrets）
cat ~/.ssh/id_rsa
```

---

### 步骤 4: 首次部署

#### 4.1 手动触发部署

1. 进入 GitHub 仓库
2. 点击 `Actions` 标签
3. 选择 `Deploy to Production` 工作流
4. 点击 `Run workflow` → `Run workflow`
5. 等待部署完成（约 2-3 分钟）

#### 4.2 观察部署日志

关注以下步骤是否都成功（绿色 ✓）：

- ✅ 检出代码
- ✅ 安装依赖
- ✅ 构建前端
- ✅ 上传到服务器
- ✅ 更新 Nginx 配置
- ✅ 测试配置并重载
- ✅ 切换版本
- ✅ 健康检查

---

### 步骤 5: 验证部署

#### 5.1 访问网站

在浏览器中打开：

- https://www.zhitoujianli.com/
- https://www.zhitoujianli.com/register
- https://www.zhitoujianli.com/login

#### 5.2 运行健康检查

**在服务器上：**

```bash
cd /var/www/zhitoujianli
./scripts/post-deploy-check.sh
```

**或本地：**

```bash
./deploy/scripts/post-deploy-check.sh
```

#### 5.3 检查清单

- [ ] 网站可以访问
- [ ] HTTP 自动跳转到 HTTPS
- [ ] SSL 证书有效（浏览器显示锁图标）
- [ ] 注册和登录页面正常
- [ ] 浏览器控制台无 CORS 错误
- [ ] API 请求正常
- [ ] 健康检查脚本通过

---

## 📋 完整检查清单

### 服务器准备

- [ ] Nginx 已安装
- [ ] Certbot 已安装
- [ ] SSL 证书已申请
- [ ] 部署目录已创建
- [ ] 目录权限已设置
- [ ] 防火墙已配置

### SSH 配置

- [ ] SSH 密钥对已生成
- [ ] 公钥已添加到服务器
- [ ] 可以使用私钥登录
- [ ] 私钥内容已复制

### GitHub Secrets

- [ ] SSH_HOST 已配置
- [ ] SSH_USER 已配置
- [ ] SSH_PORT 已配置
- [ ] SSH_KEY 已配置
- [ ] REMOTE_DEPLOY_DIR 已配置
- [ ] REMOTE_NGINX_CONF 已配置

### 部署验证

- [ ] 首次部署已完成
- [ ] 网站可以访问
- [ ] HTTPS 正常工作
- [ ] CORS 配置正确
- [ ] API 请求正常
- [ ] 健康检查通过

---

## 🎯 使用指南

### 日常开发

```bash
# 1. 开发新功能
git checkout -b feature/new-feature

# 2. 提交代码
git add .
git commit -m "feat: 添加新功能"

# 3. 合并到 main（触发自动部署）
git checkout main
git merge feature/new-feature
git push origin main

# 4. 等待自动部署完成
# 在 GitHub Actions 中查看部署进度
```

### 查看部署状态

1. 进入 GitHub 仓库
2. 点击 `Actions` 标签
3. 查看最近的工作流运行记录

### 手动触发部署

1. 进入 `Actions` → `Deploy to Production`
2. 点击 `Run workflow` → `Run workflow`

### SSL 证书续签

**自动续签：** 每周一北京时间 11:00 自动执行

**手动续签：**

1. 进入 `Actions` → `Renew SSL Certificate`
2. 点击 `Run workflow` → `Run workflow`
3. 可选择强制续签（即使未到期）

---

## 🐛 常见问题

### 问题 1: 部署失败

**查看日志：**

- GitHub Actions 日志
- 查找红色 ✗ 标记的步骤

**常见原因：**

- SSH 连接失败 → 检查 SSH\_\* Secrets
- 权限不足 → 检查目录权限
- Nginx 配置错误 → 检查配置语法

**解决方案：** 参见 `deploy/README.md#故障排查`

---

### 问题 2: 网站无法访问

**检查步骤：**

```bash
# 1. 检查 Nginx 状态
sudo systemctl status nginx

# 2. 检查配置
sudo nginx -t

# 3. 查看错误日志
sudo tail -f /var/log/nginx/zhitoujianli_error.log

# 4. 检查部署文件
ls -la /var/www/zhitoujianli/dist/
```

---

### 问题 3: CORS 错误

**症状：** 浏览器控制台显示 CORS 错误

**检查 CORS 响应头：**

```bash
curl -H "Origin: https://www.zhitoujianli.com" -I https://zhitoujianli.com/api/
```

**解决方案：** 参见 `deploy/README.md#问题3-cors错误`

---

## 📚 文档索引

### 快速开始

- [快速开始指南](./QUICK_START.md) - 10 分钟部署
- [GitHub Secrets 配置](./github-secrets-template.md) - 配置指南

### 详细文档

- [完整部署文档](./README.md) - 详细说明
- [部署总览](../DEPLOYMENT.md) - 系统概览

### 配置文件

- [Nginx 配置](./nginx/zhitoujianli.conf) - 生产环境配置
- [部署工作流](../.github/workflows/deploy.yml) - CI/CD 配置
- [SSL 续签工作流](../.github/workflows/ssl-renew.yml) - 证书管理

### 脚本

- [健康检查脚本](./scripts/post-deploy-check.sh) - 部署验证

---

## 🎉 功能特性

### 自动化部署

- ✅ Push 到 main 自动触发
- ✅ 自动构建前端项目
- ✅ 自动上传到服务器
- ✅ 自动配置 Nginx
- ✅ 自动健康检查
- ✅ 失败自动回滚

### 版本管理

- ✅ 保留最近 3 个版本
- ✅ 软链接切换版本
- ✅ 快速回滚
- ✅ 自动清理旧版本

### SSL 管理

- ✅ 每周自动检查续签
- ✅ 续签后自动重载
- ✅ 证书有效期监控
- ✅ 续签失败告警

### 健康检查

- ✅ 10+ 检查项目
- ✅ 详细检查报告
- ✅ 失败原因分析
- ✅ 自动化验证

---

## 💡 最佳实践

1. **定期检查**
   - 每天检查网站可访问性
   - 每周检查错误日志
   - 每月更新系统软件

2. **监控告警**
   - 配置可用性监控
   - 设置部署失败告警
   - 监控证书过期时间

3. **安全维护**
   - 定期更新 SSH 密钥
   - 启用自动安全更新
   - 定期审查访问日志

4. **备份策略**
   - 定期备份配置文件
   - 备份数据库（如有）
   - 测试恢复流程

---

## 📞 获取帮助

### 查看文档

- [快速开始](./QUICK_START.md)
- [完整文档](./README.md)
- [故障排查](./README.md#故障排查)

### 运行诊断

```bash
# 健康检查
./deploy/scripts/post-deploy-check.sh

# Nginx 测试
sudo nginx -t

# SSL 证书检查
sudo certbot certificates
```

### 提交 Issue

在 GitHub 仓库创建 Issue，提供：

- 错误描述
- 相关日志
- 已尝试的解决方案

---

## 🚀 开始部署

**立即开始：** 阅读 [deploy/QUICK_START.md](./QUICK_START.md)

**预计时间：** 10-15 分钟

**结果：**

- ✅ 生产环境自动部署系统
- ✅ HTTPS 安全访问
- ✅ SSL 自动续签
- ✅ 完整的健康检查
- ✅ 自动回滚机制

---

**祝您部署顺利！** 🎉

有任何问题，请参考相关文档或提交 Issue。
