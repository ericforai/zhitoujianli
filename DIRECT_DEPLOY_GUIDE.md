# 🚀 直接部署方案

## 📊 当前状态

- ✅ GitHub Secrets已配置
- ✅ 部署包已准备 (deploy_package.tar.gz)
- ❌ SSH连接失败（需要手动添加公钥）

## 🎯 解决方案

### 方案1: 手动添加SSH公钥（推荐）

**在服务器上执行以下命令：**

```bash
# 1. 登录服务器（使用密码）
ssh root@115.190.182.95

# 2. 创建SSH目录
mkdir -p ~/.ssh

# 3. 添加公钥
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPOW+55P+OHEbV1SnRI7ONIs6FleYOwbB0Ak4q+aXzXg zhitoujianli-deploy" >> ~/.ssh/authorized_keys

# 4. 设置正确权限
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# 5. 退出服务器
exit
```

**添加公钥后，测试SSH连接：**

```bash
ssh -i /root/.ssh/id_ed25519 root@115.190.182.95 "echo 'SSH连接成功！'"
```

### 方案2: 使用GitHub Actions测试

1. **访问测试页面**

   ```
   https://github.com/ericforai/zhitoujianli/actions/workflows/test-ssh.yml
   ```

2. **点击 "Run workflow" 按钮**

3. **查看测试结果**
   - 如果SSH连接成功，继续方案3
   - 如果失败，需要手动添加公钥

### 方案3: 运行部署

**SSH连接成功后：**

1. **访问部署页面**

   ```
   https://github.com/ericforai/zhitoujianli/actions/workflows/deploy.yml
   ```

2. **点击 "Run workflow" 按钮**

3. **监控部署状态**
   - 查看部署日志
   - 确认每个步骤都成功

### 方案4: 直接使用部署包

**如果GitHub Actions还是失败，直接使用部署包：**

```bash
# 1. 下载部署包到服务器
wget https://raw.githubusercontent.com/ericforai/zhitoujianli/main/deploy_package.tar.gz

# 2. 解压部署包
tar -xzf deploy_package.tar.gz

# 3. 部署前端文件
sudo mkdir -p /var/www/zhitoujianli/releases
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
sudo mv build /var/www/zhitoujianli/releases/dist_$TIMESTAMP

# 4. 更新软链接
sudo rm -rf /var/www/zhitoujianli/dist
sudo ln -s /var/www/zhitoujianli/releases/dist_$TIMESTAMP /var/www/zhitoujianli/dist

# 5. 更新Nginx配置
sudo cp zhitoujianli.conf /etc/nginx/conf.d/
sudo nginx -t && sudo systemctl reload nginx

# 6. 健康检查
curl -fsSIL https://www.zhitoujianli.com/register
```

## 🔍 问题诊断

**SSH连接失败的原因：**

1. **公钥未添加到服务器** - 需要手动添加
2. **服务器SSH配置问题** - 可能需要检查sshd_config
3. **防火墙阻止连接** - 需要检查防火墙设置

## 📋 下一步操作

**推荐操作顺序：**

1. **先执行方案1** - 手动添加SSH公钥
2. **然后执行方案2** - 测试SSH连接
3. **最后执行方案3** - 运行GitHub Actions部署

**如果方案1-3都失败：**

- 使用方案4直接部署

## ✅ 验证部署

**部署完成后，访问：**

```
https://www.zhitoujianli.com/register
```

**检查是否显示：**

- ✅ 邮箱验证码输入框
- ✅ 发送验证码按钮
- ❌ 不再显示"用户名(可选)"字段

