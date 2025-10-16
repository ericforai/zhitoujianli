# GitHub Secrets 配置模板

## 📋 配置路径

GitHub 仓库 → `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

---

## 🔐 必需的 Secrets

### 1. SSH_HOST

**说明：** 服务器域名或 IP 地址

**示例值：**

```
zhitoujianli.com
```

或

```
123.456.789.012
```

**如何获取：**

```bash
# 如果使用域名
echo "zhitoujianli.com"

# 如果使用 IP
curl ifconfig.me
```

---

### 2. SSH_USER

**说明：** SSH 登录用户名

**常用值：**

- `ubuntu` (Ubuntu 系统默认)
- `root` (Root 用户)
- `admin` (某些发行版)
- 您自定义的用户名

**示例值：**

```
ubuntu
```

**如何获取：**

```bash
# 查看当前用户
whoami

# 或登录时使用的用户名
# ssh [THIS_USER]@your-server-ip
```

---

### 3. SSH_PORT

**说明：** SSH 端口号

**默认值：**

```
22
```

**如何获取：**

```bash
# 查看 SSH 配置
cat /etc/ssh/sshd_config | grep "^Port"

# 如果未显示，则使用默认值 22
```

---

### 4. SSH_KEY

**说明：** SSH 私钥内容（最重要！）

**格式要求：**

- 必须包含完整的 BEGIN 和 END 标记
- 保持原始格式，包括所有换行符
- 不要有额外的空格或注释

**示例值：**

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAx1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL
MNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN
OPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP
... (省略中间部分) ...
QRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQR
STUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz==
-----END RSA PRIVATE KEY-----
```

**如何获取：**

**方法 1：查看现有私钥**

```bash
# 查看默认私钥
cat ~/.ssh/id_rsa

# 或查看指定私钥
cat ~/.ssh/zhitoujianli_deploy
```

**方法 2：生成新的密钥对**

```bash
# 生成新密钥对
ssh-keygen -t rsa -b 4096 -C "deploy@zhitoujianli.com" -f ~/.ssh/zhitoujianli_deploy

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/zhitoujianli_deploy.pub your-user@your-server-ip

# 获取私钥内容
cat ~/.ssh/zhitoujianli_deploy
```

**方法 3：复制到剪贴板**

```bash
# macOS
cat ~/.ssh/id_rsa | pbcopy

# Linux (需要 xclip)
cat ~/.ssh/id_rsa | xclip -selection clipboard

# Windows (Git Bash)
cat ~/.ssh/id_rsa | clip
```

**⚠️ 安全提示：**

- 私钥是敏感信息，切勿泄露
- 不要将私钥提交到代码仓库
- 定期更换密钥对
- 使用强密码保护私钥（可选）

---

### 5. REMOTE_DEPLOY_DIR

**说明：** 服务器上的部署目录

**推荐值：**

```
/var/www/zhitoujianli
```

**其他可选值：**

```
/home/ubuntu/www/zhitoujianli
/opt/zhitoujianli
/srv/zhitoujianli
```

**创建目录：**

```bash
# SSH 登录到服务器后执行
sudo mkdir -p /var/www/zhitoujianli
sudo mkdir -p /var/www/zhitoujianli/releases
sudo chown -R $USER:$USER /var/www/zhitoujianli
```

---

### 6. REMOTE_NGINX_CONF

**说明：** Nginx 配置文件路径

**推荐值：**

```
/etc/nginx/conf.d/zhitoujianli.conf
```

**其他可选值：**

```
/etc/nginx/sites-available/zhitoujianli.conf
/etc/nginx/sites-enabled/zhitoujianli.conf
```

**验证路径：**

```bash
# 查看 Nginx 配置目录
ls -la /etc/nginx/conf.d/
ls -la /etc/nginx/sites-available/
```

---

## 📝 配置清单

完成以下清单，确保所有配置正确：

### 服务器准备

- [ ] 服务器已安装 Nginx
- [ ] 服务器已安装 Certbot
- [ ] SSL 证书已申请成功
- [ ] 部署目录已创建
- [ ] 防火墙已配置（80, 443 端口开放）

### SSH 配置

- [ ] SSH 密钥对已生成
- [ ] 公钥已添加到服务器
- [ ] 可以使用私钥 SSH 登录服务器
- [ ] 私钥内容已复制（包含 BEGIN/END 标记）

### GitHub Secrets

- [ ] SSH_HOST 已配置
- [ ] SSH_USER 已配置
- [ ] SSH_PORT 已配置
- [ ] SSH_KEY 已配置（完整的私钥）
- [ ] REMOTE_DEPLOY_DIR 已配置
- [ ] REMOTE_NGINX_CONF 已配置

### 验证测试

- [ ] 本地可以 SSH 登录服务器
- [ ] GitHub Actions 手动触发测试通过
- [ ] 网站可以正常访问
- [ ] HTTPS 证书有效
- [ ] API 请求正常

---

## 🧪 配置测试

### 测试 1: SSH 连接测试

**在本地执行：**

```bash
# 使用私钥登录服务器
ssh -i ~/.ssh/zhitoujianli_deploy your-user@your-server-ip

# 如果成功登录，则配置正确
# 输入 exit 退出
```

**预期结果：**

- ✅ 成功登录到服务器
- ❌ 如果失败，检查：
  - SSH_HOST 是否正确
  - SSH_USER 是否正确
  - SSH_PORT 是否正确
  - SSH_KEY 是否正确
  - 公钥是否已添加到服务器

---

### 测试 2: 目录权限测试

**SSH 登录到服务器后执行：**

```bash
# 测试部署目录是否可写
touch /var/www/zhitoujianli/test.txt
ls -la /var/www/zhitoujianli/test.txt
rm /var/www/zhitoujianli/test.txt

# 测试 Nginx 配置目录（需要 sudo）
sudo touch /etc/nginx/conf.d/test.conf
sudo ls -la /etc/nginx/conf.d/test.conf
sudo rm /etc/nginx/conf.d/test.conf
```

**预期结果：**

- ✅ 可以创建和删除测试文件
- ❌ 如果失败，检查目录权限

---

### 测试 3: 证书路径测试

**SSH 登录到服务器后执行：**

```bash
# 检查证书文件是否存在
sudo ls -la /etc/letsencrypt/live/zhitoujianli.com/

# 查看证书详情
sudo certbot certificates
```

**预期结果：**

```
Certificate Name: zhitoujianli.com
  Domains: zhitoujianli.com www.zhitoujianli.com
  Expiry Date: 2025-XX-XX XX:XX:XX+00:00 (VALID: XX days)
  Certificate Path: /etc/letsencrypt/live/zhitoujianli.com/fullchain.pem
  Private Key Path: /etc/letsencrypt/live/zhitoujianli.com/privkey.pem
```

---

### 测试 4: GitHub Actions 测试

**在 GitHub 执行：**

1. 进入仓库 → `Actions`
2. 选择 `Deploy to Production`
3. 点击 `Run workflow` → `Run workflow`
4. 等待执行完成（约 2-3 分钟）

**预期结果：**

- ✅ 所有步骤都是绿色 ✓
- ❌ 如果失败，查看错误日志：
  - SSH 连接错误 → 检查 SSH\_\* 配置
  - 权限错误 → 检查目录权限
  - Nginx 错误 → 检查 Nginx 配置和证书

---

## 🔍 故障排查

### 问题：SSH 连接失败

**错误信息：**

```
ssh: connect to host zhitoujianli.com port 22: Connection refused
```

**解决方案：**

```bash
# 1. 检查服务器是否在线
ping your-server-ip

# 2. 检查 SSH 服务是否运行
sudo systemctl status ssh

# 3. 检查防火墙
sudo ufw status

# 4. 检查 SSH 端口
sudo netstat -tulpn | grep sshd
```

---

### 问题：权限被拒绝

**错误信息：**

```
Permission denied (publickey)
```

**解决方案：**

```bash
# 1. 确认公钥已添加到服务器
cat ~/.ssh/authorized_keys

# 2. 检查文件权限
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# 3. 重新添加公钥
ssh-copy-id -i ~/.ssh/zhitoujianli_deploy.pub your-user@your-server-ip
```

---

### 问题：私钥格式错误

**错误信息：**

```
Load key "...": invalid format
```

**解决方案：**

```bash
# 1. 检查私钥格式
head -n 1 ~/.ssh/id_rsa
# 应该显示: -----BEGIN RSA PRIVATE KEY-----

# 2. 如果是新格式（BEGIN OPENSSH PRIVATE KEY），需要转换
ssh-keygen -p -m PEM -f ~/.ssh/id_rsa

# 3. 或生成 PEM 格式的新密钥
ssh-keygen -t rsa -b 4096 -m PEM -f ~/.ssh/zhitoujianli_deploy
```

---

## 📚 参考资源

- [完整部署文档](./README.md)
- [快速开始指南](./QUICK_START.md)
- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Let's Encrypt 文档](https://letsencrypt.org/docs/)

---

## 💡 最佳实践

1. **定期更换密钥**
   - 每 6-12 个月更换一次 SSH 密钥对
   - 使用强密码保护私钥

2. **最小权限原则**
   - 不要使用 root 用户（如非必要）
   - 给予部署用户最小必要权限

3. **备份配置**
   - 定期备份 GitHub Secrets 配置（离线存储）
   - 备份服务器配置文件

4. **监控和告警**
   - 配置部署失败告警
   - 监控证书过期时间
   - 设置服务器资源告警

5. **测试环境**
   - 先在测试环境验证
   - 确认无误后再部署到生产环境

---

**配置完成后，记得运行验证测试！** ✅
