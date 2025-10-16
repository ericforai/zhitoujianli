# 🚀 智投简历 - 紧急部署方案

## 📊 当前状态
- ✅ 前端构建成功
- ✅ 部署包已创建 (deploy_package.tar.gz, 184K)
- ❌ GitHub Actions持续失败
- ❌ SSH连接验证失败

## 🎯 解决方案

### 方案1: 使用GitHub Releases上传部署包

1. **访问GitHub Releases页面**
   ```
   https://github.com/ericforai/zhitoujianli/releases
   ```

2. **创建新Release**
   - 点击 "Create a new release"
   - Tag: `v1.0.0-deploy`
   - Title: `紧急部署包`
   - 上传 `deploy_package.tar.gz`

3. **在服务器上下载并部署**
   ```bash
   # 下载部署包
   wget https://github.com/ericforai/zhitoujianli/releases/download/v1.0.0-deploy/deploy_package.tar.gz
   
   # 解压
   tar -xzf deploy_package.tar.gz
   
   # 部署
   sudo mkdir -p /var/www/zhitoujianli/releases
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   sudo mv build /var/www/zhitoujianli/releases/dist_$TIMESTAMP
   sudo rm -rf /var/www/zhitoujianli/dist
   sudo ln -s /var/www/zhitoujianli/releases/dist_$TIMESTAMP /var/www/zhitoujianli/dist
   
   # 更新Nginx
   sudo cp zhitoujianli.conf /etc/nginx/conf.d/
   sudo nginx -t && sudo systemctl reload nginx
   ```

### 方案2: 直接修改GitHub Actions Secrets

**问题分析：**
GitHub Actions失败的原因可能是SSH配置问题：

1. **检查SSH_HOST**: 应该是 `115.190.182.95`
2. **检查SSH_USER**: 应该是 `root` 或 `ubuntu`
3. **检查SSH_KEY**: 应该是完整的私钥内容
4. **检查SSH_PORT**: 应该是 `22`

**修复步骤：**
1. 访问：`https://github.com/ericforai/zhitoujianli/settings/secrets/actions`
2. 检查并更新所有SSH相关的Secrets
3. 重新触发部署

### 方案3: 使用Web界面直接部署

**如果以上方案都失败，可以：**

1. **下载部署包**
   ```bash
   # 在服务器上执行
   cd /tmp
   wget https://raw.githubusercontent.com/ericforai/zhitoujianli/main/deploy_package.tar.gz
   ```

2. **执行部署命令**
   ```bash
   tar -xzf deploy_package.tar.gz
   sudo mkdir -p /var/www/zhitoujianli/releases
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   sudo mv build /var/www/zhitoujianli/releases/dist_$TIMESTAMP
   sudo rm -rf /var/www/zhitoujianli/dist
   sudo ln -s /var/www/zhitoujianli/releases/dist_$TIMESTAMP /var/www/zhitoujianli/dist
   sudo cp zhitoujianli.conf /etc/nginx/conf.d/
   sudo nginx -t && sudo systemctl reload nginx
   ```

## 🔍 问题诊断

**GitHub Actions失败的可能原因：**
1. SSH密钥配置错误
2. 服务器SSH服务未启动
3. 防火墙阻止SSH连接
4. GitHub Actions Runner网络问题

## 📋 下一步

**推荐操作顺序：**
1. 先尝试方案1（GitHub Releases）
2. 如果失败，检查方案2（SSH Secrets）
3. 最后使用方案3（直接部署）

**验证部署：**
部署完成后，访问：`https://www.zhitoujianli.com/register`
检查是否显示邮箱验证码功能。
