# 🔐 GitHub Secrets 配置详细指南

## 📋 检查步骤

### 1. 访问GitHub Secrets页面
```
https://github.com/ericforai/zhitoujianli/settings/secrets/actions
```

### 2. 检查必需的Secrets

**必需的Secrets列表：**
- `SSH_HOST` - 服务器IP地址
- `SSH_USER` - SSH用户名
- `SSH_PORT` - SSH端口
- `SSH_KEY` - SSH私钥
- `REMOTE_DEPLOY_DIR` - 部署目录
- `REMOTE_NGINX_CONF` - Nginx配置文件路径

## 🔧 具体配置值

### SSH_HOST
```
值: 115.190.182.95
说明: 你的服务器IP地址
```

### SSH_USER
```
值: root
或者: ubuntu
说明: SSH登录用户名，通常是root或ubuntu
```

### SSH_PORT
```
值: 22
说明: SSH端口，默认是22
```

### SSH_KEY
```
值: -----BEGIN OPENSSH PRIVATE KEY-----
     [你的私钥内容]
     -----END OPENSSH PRIVATE KEY-----
说明: 完整的SSH私钥内容
```

### REMOTE_DEPLOY_DIR
```
值: /var/www/zhitoujianli
说明: 前端文件部署目录
```

### REMOTE_NGINX_CONF
```
值: /etc/nginx/conf.d/zhitoujianli.conf
说明: Nginx配置文件路径
```

## 🛠️ 如何获取SSH私钥

### 方法1: 从本地获取
```bash
# 查看本地SSH私钥
cat ~/.ssh/id_rsa
# 或者
cat ~/.ssh/id_ed25519
```

### 方法2: 从服务器获取
```bash
# 登录服务器
ssh root@115.190.182.95

# 查看服务器上的私钥
cat ~/.ssh/id_rsa
# 或者
cat ~/.ssh/id_ed25519
```

### 方法3: 生成新的SSH密钥对
```bash
# 生成新的SSH密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 查看公钥（添加到服务器）
cat ~/.ssh/id_ed25519.pub

# 查看私钥（添加到GitHub Secrets）
cat ~/.ssh/id_ed25519
```

## 📝 配置步骤

### 1. 添加/编辑Secrets
1. 点击 "New repository secret"
2. 输入Name（如SSH_HOST）
3. 输入Value（如115.190.182.95）
4. 点击 "Add secret"

### 2. 验证配置
检查所有Secrets是否都已正确配置：
- ✅ SSH_HOST: 115.190.182.95
- ✅ SSH_USER: root
- ✅ SSH_PORT: 22
- ✅ SSH_KEY: [私钥内容]
- ✅ REMOTE_DEPLOY_DIR: /var/www/zhitoujianli
- ✅ REMOTE_NGINX_CONF: /etc/nginx/conf.d/zhitoujianli.conf

## 🔍 常见问题排查

### 问题1: SSH连接失败
**可能原因：**
- SSH_HOST配置错误
- SSH_USER配置错误
- SSH_PORT配置错误
- SSH_KEY配置错误

**解决方法：**
1. 检查服务器IP是否正确
2. 确认SSH用户名（root或ubuntu）
3. 确认SSH端口（通常是22）
4. 检查SSH私钥格式是否正确

### 问题2: 权限不足
**可能原因：**
- SSH用户权限不足
- 目录权限问题

**解决方法：**
1. 确保SSH用户有sudo权限
2. 检查部署目录权限
3. 确保Nginx配置目录可写

### 问题3: 文件路径错误
**可能原因：**
- REMOTE_DEPLOY_DIR路径错误
- REMOTE_NGINX_CONF路径错误

**解决方法：**
1. 确认部署目录存在
2. 确认Nginx配置目录存在
3. 检查路径权限

## 🧪 测试SSH连接

### 本地测试
```bash
# 测试SSH连接
ssh -i ~/.ssh/id_rsa root@115.190.182.95

# 测试特定端口
ssh -i ~/.ssh/id_rsa -p 22 root@115.190.182.95
```

### GitHub Actions测试
创建测试工作流：
```yaml
name: Test SSH Connection
on: workflow_dispatch

jobs:
  test-ssh:
    runs-on: ubuntu-latest
    steps:
      - name: Test SSH
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          port: ${{ secrets.SSH_PORT }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            echo "SSH连接成功！"
            whoami
            pwd
            ls -la
```

## ✅ 配置完成检查清单

- [ ] SSH_HOST已配置
- [ ] SSH_USER已配置
- [ ] SSH_PORT已配置
- [ ] SSH_KEY已配置（完整私钥）
- [ ] REMOTE_DEPLOY_DIR已配置
- [ ] REMOTE_NGINX_CONF已配置
- [ ] 本地SSH连接测试成功
- [ ] GitHub Actions SSH测试成功

## 🚀 配置完成后

1. **重新触发部署**
   - 访问：`https://github.com/ericforai/zhitoujianli/actions`
   - 点击 "Run workflow" 按钮
   - 选择 "Deploy to Production"

2. **监控部署状态**
   - 查看部署日志
   - 确认每个步骤都成功

3. **验证部署结果**
   - 访问：`https://www.zhitoujianli.com/register`
   - 检查是否显示邮箱验证码功能
