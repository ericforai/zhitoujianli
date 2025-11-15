# 智投简历 - 生产环境部署指南

## 📋 目录

- [概述](#概述)
- [前置条件](#前置条件)
- [服务器配置](#服务器配置)
- [GitHub Secrets 配置](#github-secrets-配置)
- [首次部署](#首次部署)
- [自动部署流程](#自动部署流程)
- [SSL 证书管理](#ssl-证书管理)
- [健康检查](#健康检查)
- [故障排查](#故障排查)
- [回滚流程](#回滚流程)

---

## 概述

本项目采用 GitHub Actions 实现自动化部署，包含以下功能：

- ✅ 自动构建前端项目
- ✅ 自动上传到生产服务器
- ✅ 自动配置和重载 Nginx
- ✅ 部署健康检查
- ✅ 失败自动回滚
- ✅ SSL 证书自动续签

**技术栈：**

- 前端：React 18 + TypeScript + Vite
- Web服务器：Nginx
- SSL：Let's Encrypt (Certbot)
- CI/CD：GitHub Actions

---

## 前置条件

### 1. 服务器要求

- **操作系统**: Ubuntu 20.04+ / Debian 11+
- **配置**: 2核 2GB 内存以上
- **域名**: 已解析到服务器 IP
  - `zhitoujianli.com`
  - `www.zhitoujianli.com`

### 2. 必需软件

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Nginx
sudo apt install -y nginx

# 安装 Certbot（SSL 证书）
sudo apt install -y certbot python3-certbot-nginx

# 安装其他工具
sudo apt install -y curl git rsync
```

### 3. SSH 密钥对

在本地生成 SSH 密钥对（如果还没有）：

```bash
ssh-keygen -t rsa -b 4096 -C "deploy@zhitoujianli.com"
```

将公钥添加到服务器：

```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub user@your-server-ip
```

---

## 服务器配置

### 1. 创建部署目录

```bash
# 创建项目目录
sudo mkdir -p /var/www/zhitoujianli
sudo mkdir -p /var/www/zhitoujianli/releases
sudo mkdir -p /var/www/letsencrypt

# 设置权限（替换 ubuntu 为你的用户名）
sudo chown -R ubuntu:ubuntu /var/www/zhitoujianli
sudo chown -R www-data:www-data /var/www/letsencrypt
```

### 2. 申请 SSL 证书

```bash
# 使用 Certbot 申请证书
sudo certbot certonly --standalone \
  -d zhitoujianli.com \
  -d www.zhitoujianli.com \
  --agree-tos \
  --email your-email@example.com

# 验证证书
sudo certbot certificates
```

**注意：** 首次申请证书时需要临时停止 Nginx：

```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone -d zhitoujianli.com -d www.zhitoujianli.com
sudo systemctl start nginx
```

### 3. 配置防火墙

```bash
# 允许 HTTP 和 HTTPS
sudo ufw allow 'Nginx Full'

# 允许 SSH（重要！）
sudo ufw allow OpenSSH

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

---

## GitHub Secrets 配置

在 GitHub 仓库中配置以下 Secrets：

**路径：** `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

| Secret 名称         | 说明            | 示例值                                  |
| ------------------- | --------------- | --------------------------------------- |
| `SSH_HOST`          | 服务器域名或 IP | `zhitoujianli.com` 或 `123.456.789.012` |
| `SSH_USER`          | SSH 用户名      | `ubuntu` 或 `root`                      |
| `SSH_PORT`          | SSH 端口        | `22`                                    |
| `SSH_KEY`           | SSH 私钥内容    | 见下方说明                              |
| `REMOTE_DEPLOY_DIR` | 部署目录        | `/var/www/zhitoujianli`                 |
| `REMOTE_NGINX_CONF` | Nginx 配置路径  | `/etc/nginx/conf.d/zhitoujianli.conf`   |

### 获取 SSH 私钥内容

```bash
# 查看私钥内容
cat ~/.ssh/id_rsa

# 或者复制到剪贴板（macOS）
cat ~/.ssh/id_rsa | pbcopy

# Linux（使用 xclip）
cat ~/.ssh/id_rsa | xclip -selection clipboard
```

**重要：**

- 私钥需要包含 `-----BEGIN RSA PRIVATE KEY-----` 和 `-----END RSA PRIVATE KEY-----`
- 保持原始格式，包括所有换行符

---

## 首次部署

### 步骤 1: 准备工作

1. 确认服务器已完成上述配置
2. 确认 GitHub Secrets 已全部配置
3. 确认 SSL 证书已申请成功

### 步骤 2: 手动触发部署

1. 进入 GitHub 仓库
2. 点击 `Actions` 标签
3. 选择 `Deploy to Production` 工作流
4. 点击 `Run workflow` → `Run workflow`

### 步骤 3: 验证部署

部署完成后，访问以下地址验证：

- 主页：https://www.zhitoujianli.com/
- 注册页：https://www.zhitoujianli.com/register
- 登录页：https://www.zhitoujianli.com/login

或运行健康检查脚本：

```bash
# 在服务器上运行
/var/www/zhitoujianli/scripts/post-deploy-check.sh production

# 或本地运行（需要 curl 和 openssl）
./deploy/scripts/post-deploy-check.sh
```

---

## 自动部署流程

### 触发条件

自动部署会在以下情况触发：

1. **自动触发**：Push 到 `main` 分支
2. **手动触发**：在 GitHub Actions 界面手动运行

### 部署流程

```mermaid
graph TD
    A[Push to main] --> B[检出代码]
    B --> C[安装依赖]
    C --> D[代码质量检查]
    D --> E[构建前端]
    E --> F[上传到服务器]
    F --> G[更新 Nginx 配置]
    G --> H[测试 Nginx 配置]
    H --> I{配置是否正确?}
    I -->|是| J[重载 Nginx]
    I -->|否| K[回滚配置]
    J --> L[切换版本]
    L --> M[健康检查]
    M --> N{检查是否通过?}
    N -->|是| O[清理旧版本]
    N -->|否| P[回滚到旧版本]
    O --> Q[部署成功]
    P --> R[部署失败]
    K --> R
```

### 版本管理

项目采用软链接方式管理版本：

```
/var/www/zhitoujianli/
├── releases/
│   ├── dist_123/    # 版本 123
│   ├── dist_124/    # 版本 124
│   └── dist_125/    # 版本 125（最新）
├── dist -> releases/dist_125/    # 当前版本（软链接）
└── dist_backup -> releases/dist_124/    # 备份版本（软链接）
```

- 系统保留最近 3 个版本
- 部署失败时自动回滚到 `dist_backup`

---

## SSL 证书管理

### 自动续签

证书每周一 UTC 03:00（北京时间 11:00）自动续签。

工作流路径：`.github/workflows/ssl-renew.yml`

### 手动续签

**方式 1：通过 GitHub Actions**

1. 进入 `Actions` → `Renew SSL Certificate`
2. 点击 `Run workflow`
3. 选择是否强制续签

**方式 2：SSH 到服务器**

```bash
# 测试续签（dry-run）
sudo certbot renew --dry-run

# 实际续签
sudo certbot renew

# 强制续签
sudo certbot renew --force-renewal

# 续签后重载 Nginx
sudo systemctl reload nginx
```

### 证书状态检查

```bash
# 查看所有证书
sudo certbot certificates

# 查看特定证书
sudo certbot certificates --domain zhitoujianli.com

# 检查证书有效期
sudo openssl x509 -in /etc/letsencrypt/live/zhitoujianli.com/fullchain.pem -noout -enddate
```

### 续签失败处理

如果自动续签失败，请检查：

1. **端口占用**

   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

2. **Nginx 配置**

   ```bash
   sudo nginx -t
   ```

3. **验证路径**

   ```bash
   # 确保可访问
   curl http://zhitoujianli.com/.well-known/acme-challenge/test
   ```

4. **防火墙**

   ```bash
   sudo ufw status
   ```

5. **日志**
   ```bash
   sudo tail -f /var/log/letsencrypt/letsencrypt.log
   ```

---

## 健康检查

### 自动健康检查

部署流程会自动执行健康检查，包括：

- ✅ HTTP 强制跳转 HTTPS
- ✅ 主页访问
- ✅ 注册/登录页面
- ✅ SSL 证书有效性
- ✅ API 端点响应
- ✅ CORS 配置
- ✅ 响应时间
- ✅ 安全响应头

### 手动健康检查

运行健康检查脚本：

```bash
# 在服务器上
cd /var/www/zhitoujianli
./scripts/post-deploy-check.sh production

# 本地运行（检查线上环境）
./deploy/scripts/post-deploy-check.sh
```

### 快速检查命令

```bash
# 检查网站响应
curl -I https://www.zhitoujianli.com/

# 检查 API 端点
curl -I https://zhitoujianli.com/api/auth/send-verification-code

# 检查 CORS
curl -H "Origin: https://www.zhitoujianli.com" -I https://zhitoujianli.com/api/

# 检查 Nginx 状态
sudo systemctl status nginx

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/zhitoujianli_access.log
sudo tail -f /var/log/nginx/zhitoujianli_error.log
```

---

## 故障排查

### 问题 1: 部署失败 - SSH 连接失败

**症状：** GitHub Actions 日志显示 SSH 连接超时或拒绝

**解决方案：**

```bash
# 1. 检查 SSH 服务
sudo systemctl status ssh

# 2. 检查防火墙
sudo ufw status

# 3. 验证 SSH 密钥
ssh -i ~/.ssh/id_rsa user@your-server-ip

# 4. 检查 authorized_keys
cat ~/.ssh/authorized_keys
```

### 问题 2: Nginx 配置测试失败

**症状：** `nginx -t` 失败

**解决方案：**

```bash
# 1. 检查配置语法
sudo nginx -t

# 2. 查看详细错误
sudo nginx -T

# 3. 检查证书路径
ls -l /etc/letsencrypt/live/zhitoujianli.com/

# 4. 恢复备份配置
sudo cp /etc/nginx/conf.d/zhitoujianli.conf.backup /etc/nginx/conf.d/zhitoujianli.conf
```

### 问题 3: CORS 错误

**症状：** 浏览器控制台显示 CORS 错误

**解决方案：**

1. 检查 Nginx 配置中的 CORS 头：

   ```nginx
   add_header 'Access-Control-Allow-Origin' 'https://www.zhitoujianli.com' always;
   ```

2. 验证 CORS 响应：

   ```bash
   curl -H "Origin: https://www.zhitoujianli.com" -I https://zhitoujianli.com/api/
   ```

3. 确保 `always` 参数存在（包括错误响应）

### 问题 4: SSL 证书错误

**症状：** 浏览器显示证书无效或过期

**解决方案：**

```bash
# 1. 检查证书状态
sudo certbot certificates

# 2. 手动续签
sudo certbot renew --force-renewal

# 3. 检查证书文件
sudo ls -l /etc/letsencrypt/live/zhitoujianli.com/

# 4. 重启 Nginx
sudo systemctl restart nginx
```

### 问题 5: 页面显示 404

**症状：** 访问页面返回 404

**解决方案：**

```bash
# 1. 检查软链接
ls -la /var/www/zhitoujianli/dist

# 2. 检查文件权限
sudo chown -R www-data:www-data /var/www/zhitoujianli/dist

# 3. 检查 Nginx root 配置
sudo cat /etc/nginx/conf.d/zhitoujianli.conf | grep root

# 4. 验证文件存在
ls -la /var/www/zhitoujianli/dist/index.html
```

### 问题 6: API 请求失败

**症状：** 前端无法访问后端 API

**解决方案：**

```bash
# 1. 检查后端服务
curl http://115.190.182.95:8080/api/health

# 2. 检查 Nginx 反向代理配置
sudo cat /etc/nginx/conf.d/zhitoujianli.conf | grep proxy_pass

# 3. 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/zhitoujianli_error.log

# 4. 测试反向代理
curl -I https://zhitoujianli.com/api/auth/send-verification-code
```

---

## 回滚流程

### 自动回滚

部署失败时会自动回滚到上一个版本。

### 手动回滚

**方式 1：切换到指定版本**

```bash
# 查看可用版本
ls -la /var/www/zhitoujianli/releases/

# 切换版本（例如回滚到 dist_123）
cd /var/www/zhitoujianli
sudo rm dist
sudo ln -s releases/dist_123 dist

# 验证
ls -la dist
```

**方式 2：使用备份版本**

```bash
# 使用自动备份的上一个版本
cd /var/www/zhitoujianli
sudo rm dist
sudo cp -P dist_backup dist

# 验证
ls -la dist
```

**方式 3：通过 GitHub Actions**

重新部署之前的提交：

1. 进入 `Actions` → `Deploy to Production`
2. 选择之前成功的工作流运行
3. 点击 `Re-run jobs` → `Re-run all jobs`

### 回滚后验证

```bash
# 运行健康检查
./deploy/scripts/post-deploy-check.sh

# 或手动检查
curl -I https://www.zhitoujianli.com/
```

---

## 监控和日志

### Nginx 日志

```bash
# 访问日志
sudo tail -f /var/log/nginx/zhitoujianli_access.log

# 错误日志
sudo tail -f /var/log/nginx/zhitoujianli_error.log

# 实时监控（需要安装 goaccess）
sudo goaccess /var/log/nginx/zhitoujianli_access.log -c
```

### 系统日志

```bash
# Nginx 服务日志
sudo journalctl -u nginx -f

# Certbot 日志
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# 系统日志
sudo tail -f /var/log/syslog
```

### 性能监控

```bash
# 系统资源
htop

# 磁盘使用
df -h

# Nginx 连接数
sudo netstat -an | grep :80 | wc -l
sudo netstat -an | grep :443 | wc -l

# 进程状态
ps aux | grep nginx
```

---

## 安全建议

### 1. SSH 安全

```bash
# 禁用密码登录（推荐）
sudo nano /etc/ssh/sshd_config
# 设置: PasswordAuthentication no

# 重启 SSH 服务
sudo systemctl restart ssh
```

### 2. 定期更新

```bash
# 自动安全更新
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 3. 备份

```bash
# 备份配置文件
sudo tar -czf /backup/nginx-$(date +%Y%m%d).tar.gz /etc/nginx/

# 备份 SSL 证书
sudo tar -czf /backup/letsencrypt-$(date +%Y%m%d).tar.gz /etc/letsencrypt/

# 定期备份网站文件
sudo tar -czf /backup/www-$(date +%Y%m%d).tar.gz /var/www/zhitoujianli/
```

### 4. 监控告警

建议配置：

- 服务器监控（如 Prometheus + Grafana）
- 错误日志告警（如 Sentry）
- 可用性监控（如 UptimeRobot）

---

## 维护清单

### 每日

- [ ] 检查网站可访问性
- [ ] 查看错误日志

### 每周

- [ ] 检查 SSL 证书有效期
- [ ] 查看系统资源使用情况
- [ ] 清理旧日志文件

### 每月

- [ ] 更新系统软件包
- [ ] 备份配置文件
- [ ] 检查磁盘空间
- [ ] 审查访问日志

### 每季度

- [ ] 审查安全配置
- [ ] 更新 SSL 配置（TLS 版本、加密套件）
- [ ] 性能优化

---

## 联系支持

如遇到问题，请通过以下方式获取帮助：

- **GitHub Issues**: [项目 Issues 页面]
- **文档**: [项目文档]
- **邮件**: zhitoujianli@qq.com

---

## 附录

### A. 目录结构

```
/var/www/zhitoujianli/
├── releases/           # 所有版本目录
│   ├── dist_120/
│   ├── dist_121/
│   └── dist_122/
├── dist/              # 当前版本（软链接）
├── dist_backup/       # 备份版本（软链接）
└── scripts/           # 部署脚本（可选）
    └── post-deploy-check.sh

/etc/nginx/
└── conf.d/
    ├── zhitoujianli.conf         # 当前配置
    └── zhitoujianli.conf.backup  # 备份配置

/etc/letsencrypt/
└── live/
    └── zhitoujianli.com/
        ├── fullchain.pem    # 证书
        ├── privkey.pem      # 私钥
        └── chain.pem        # 证书链
```

### B. 常用命令速查

```bash
# Nginx
sudo nginx -t                    # 测试配置
sudo systemctl reload nginx      # 重载配置
sudo systemctl restart nginx     # 重启服务
sudo systemctl status nginx      # 查看状态

# SSL 证书
sudo certbot renew               # 续签证书
sudo certbot certificates        # 查看证书
sudo certbot delete              # 删除证书

# 部署
ssh user@server                  # 登录服务器
ls -la /var/www/zhitoujianli/    # 查看部署文件
./deploy/scripts/post-deploy-check.sh  # 健康检查

# 日志
sudo tail -f /var/log/nginx/zhitoujianli_access.log
sudo tail -f /var/log/nginx/zhitoujianli_error.log
```

### C. 环境变量

前端构建时可配置的环境变量：

| 变量名              | 说明         | 默认值                     |
| ------------------- | ------------ | -------------------------- |
| `VITE_API_BASE_URL` | API 基础地址 | `https://zhitoujianli.com` |
| `NODE_ENV`          | 环境标识     | `production`               |

---

**最后更新**: 2025-10-16
**版本**: v1.0.0
