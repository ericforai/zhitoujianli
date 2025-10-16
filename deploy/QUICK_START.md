# 🚀 快速开始 - GitHub Actions 自动部署

这是一个简化的快速部署指南，帮助您在 10 分钟内完成生产环境部署配置。

---

## ⚡ 5 步快速部署

### 步骤 1: 服务器准备（2分钟）

```bash
# 1. SSH 登录到服务器
ssh your-user@your-server-ip

# 2. 一键安装所需软件
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx curl rsync

# 3. 创建部署目录
sudo mkdir -p /var/www/zhitoujianli/releases
sudo mkdir -p /var/www/letsencrypt
sudo chown -R $USER:$USER /var/www/zhitoujianli
sudo chown -R www-data:www-data /var/www/letsencrypt

# 4. 开放防火墙端口
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

### 步骤 2: 申请 SSL 证书（2分钟）

```bash
# 临时停止 Nginx
sudo systemctl stop nginx

# 申请证书（替换邮箱地址）
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
```

**验证成功标志：**

```
Certificate Name: zhitoujianli.com
  Domains: zhitoujianli.com www.zhitoujianli.com
  Expiry Date: 2025-XX-XX XX:XX:XX+00:00 (VALID: 89 days)
```

---

### 步骤 3: 生成 SSH 密钥对（1分钟）

**在本地电脑上执行：**

```bash
# 生成密钥对（如果已有可跳过）
ssh-keygen -t rsa -b 4096 -C "deploy@zhitoujianli.com" -f ~/.ssh/zhitoujianli_deploy

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/zhitoujianli_deploy.pub your-user@your-server-ip

# 测试连接
ssh -i ~/.ssh/zhitoujianli_deploy your-user@your-server-ip

# 获取私钥内容（用于 GitHub Secrets）
cat ~/.ssh/zhitoujianli_deploy
```

**重要：** 复制完整的私钥内容，包括：

```
-----BEGIN RSA PRIVATE KEY-----
...所有内容...
-----END RSA PRIVATE KEY-----
```

---

### 步骤 4: 配置 GitHub Secrets（3分钟）

1. **进入 GitHub 仓库**
   - 点击 `Settings` → `Secrets and variables` → `Actions`

2. **点击 `New repository secret`，逐个添加以下配置：**

| 名称                | 值                                      | 说明            |
| ------------------- | --------------------------------------- | --------------- |
| `SSH_HOST`          | `zhitoujianli.com` 或 `123.456.789.012` | 服务器域名或 IP |
| `SSH_USER`          | `ubuntu` 或 `your-username`             | SSH 用户名      |
| `SSH_PORT`          | `22`                                    | SSH 端口        |
| `SSH_KEY`           | 上一步复制的私钥内容                    | 完整的私钥      |
| `REMOTE_DEPLOY_DIR` | `/var/www/zhitoujianli`                 | 部署目录        |
| `REMOTE_NGINX_CONF` | `/etc/nginx/conf.d/zhitoujianli.conf`   | Nginx 配置路径  |

**配置示例截图：**

```
Name: SSH_HOST
Secret: zhitoujianli.com

Name: SSH_USER
Secret: ubuntu

Name: SSH_KEY
Secret: -----BEGIN RSA PRIVATE KEY-----
        MIIEpAIBAAKCAQEA...
        ...完整的私钥内容...
        -----END RSA PRIVATE KEY-----
```

---

### 步骤 5: 触发首次部署（2分钟）

1. **手动触发部署**
   - 进入 GitHub 仓库
   - 点击 `Actions` 标签
   - 选择 `Deploy to Production` 工作流
   - 点击 `Run workflow` → `Run workflow`

2. **等待部署完成**
   - 观察部署日志
   - 等待所有步骤变成绿色 ✅

3. **验证部署结果**

   ```bash
   # 访问网站
   curl -I https://www.zhitoujianli.com/

   # 或在浏览器中打开
   # https://www.zhitoujianli.com/
   ```

---

## ✅ 验证清单

部署完成后，请逐项检查：

- [ ] 网站可访问：https://www.zhitoujianli.com/
- [ ] HTTP 自动跳转到 HTTPS
- [ ] 注册页面正常：https://www.zhitoujianli.com/register
- [ ] 登录页面正常：https://www.zhitoujianli.com/login
- [ ] 浏览器控制台无 CORS 错误
- [ ] SSL 证书有效（浏览器地址栏显示锁图标）
- [ ] API 端点可访问（检查网络请求）

### 快速验证命令

```bash
# 在服务器上运行健康检查
ssh your-user@your-server-ip
cd /var/www/zhitoujianli
./scripts/post-deploy-check.sh

# 或本地运行
./deploy/scripts/post-deploy-check.sh
```

---

## 🎉 完成！后续使用

### 自动部署

现在每次 push 到 `main` 分支时，都会自动部署：

```bash
git add .
git commit -m "feat: 添加新功能"
git push origin main
```

自动部署流程：

1. GitHub Actions 自动触发
2. 构建前端项目
3. 上传到服务器
4. 配置并重载 Nginx
5. 健康检查
6. 部署成功 ✅

### SSL 证书自动续签

- **自动续签**：每周一北京时间 11:00 自动执行
- **手动续签**：在 `Actions` → `Renew SSL Certificate` → `Run workflow`

---

## 🐛 常见问题

### 问题 1: 部署失败 - SSH 连接超时

**解决方案：**

```bash
# 检查 SSH 连接
ssh -i ~/.ssh/zhitoujianli_deploy your-user@your-server-ip

# 检查防火墙
sudo ufw status

# 确保 SSH 端口开放
sudo ufw allow 22/tcp
```

### 问题 2: 证书申请失败

**解决方案：**

```bash
# 确保域名已正确解析
nslookup zhitoujianli.com

# 检查 80 端口是否被占用
sudo netstat -tulpn | grep :80

# 临时停止 Nginx 后重试
sudo systemctl stop nginx
sudo certbot certonly --standalone -d zhitoujianli.com -d www.zhitoujianli.com
sudo systemctl start nginx
```

### 问题 3: 页面无法访问

**解决方案：**

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 检查 Nginx 配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 检查文件权限
ls -la /var/www/zhitoujianli/dist/
```

### 问题 4: GitHub Actions 中 Secret 不生效

**解决方案：**

1. 确认 Secret 名称完全匹配（区分大小写）
2. 重新创建 Secret（删除后重新添加）
3. 私钥内容包含完整的开始和结束标记
4. 私钥内容没有额外的空格或换行

---

## 📚 进阶配置

完成基础部署后，可以参考以下文档进行进阶配置：

- [完整部署文档](./README.md) - 详细的部署说明和配置选项
- [故障排查指南](./README.md#故障排查) - 常见问题解决方案
- [回滚流程](./README.md#回滚流程) - 版本回滚操作指南
- [监控和日志](./README.md#监控和日志) - 日志查看和监控配置

---

## 📞 获取帮助

如遇到问题：

1. **查看日志**
   - GitHub Actions 日志：仓库 `Actions` 标签
   - 服务器日志：`sudo tail -f /var/log/nginx/zhitoujianli_error.log`

2. **运行健康检查**

   ```bash
   ./deploy/scripts/post-deploy-check.sh
   ```

3. **提交 Issue**
   - 在 GitHub 仓库创建 Issue
   - 提供错误日志和详细描述

---

## 🎯 下一步

- [ ] 配置域名 DNS（如果还未配置）
- [ ] 设置监控告警（推荐 UptimeRobot）
- [ ] 配置日志分析（推荐 GoAccess）
- [ ] 启用 CDN 加速（可选）
- [ ] 配置数据库备份（如使用数据库）
- [ ] 设置自动化测试

---

**祝您部署顺利！** 🚀

如有问题，请参考 [完整部署文档](./README.md) 或提交 Issue。
