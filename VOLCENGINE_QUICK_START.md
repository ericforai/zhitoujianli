# 🚀 智投简历火山云服务器快速部署指南

## ⚡ 快速开始 (15分钟完成部署)

### 📋 准备工作
- ✅ 火山云服务器已购买
- ✅ 服务器可以SSH登录
- ✅ 域名已准备好解析

---

## 🎯 步骤一：服务器自动配置 (5分钟)

### 1.1 上传配置脚本到服务器
在你的本地机器执行：
```bash
# 上传自动配置脚本
scp scripts/volcengine-deploy.sh root@你的服务器IP:/root/

# 登录服务器
ssh root@你的服务器IP
```

### 1.2 运行自动配置脚本
在服务器上执行：
```bash
chmod +x /root/volcengine-deploy.sh
/root/volcengine-deploy.sh
```

**脚本会提示输入：**
- 🌐 火山云服务器公网IP
- 🔐 数据库密码 (建议使用默认)
- 🌍 域名 (默认: api.zhitoujianli.com)

---

## 🎯 步骤二：MySQL安全配置 (2分钟)

脚本运行完成后，在服务器上执行：
```bash
# 完成MySQL安全配置
mysql -u root -p --connect-expired-password < /tmp/mysql_setup.sql
```

---

## 🎯 步骤三：域名解析配置 (1分钟)

在你的域名DNS管理中添加A记录：
```
类型: A
主机记录: api
解析值: 你的火山云服务器IP
TTL: 600
```

---

## 🎯 步骤四：SSL证书申请 (2分钟)

在服务器上执行：
```bash
# 申请SSL证书 (确保域名已解析)
certbot --nginx -d api.zhitoujianli.com

# 测试自动续期
certbot renew --dry-run
```

---

## 🎯 步骤五：构建和部署应用 (5分钟)

### 5.1 在本地构建应用
```bash
cd /Users/user/autoresume
./scripts/prepare-volcengine-deployment.sh
```

### 5.2 部署到服务器
```bash
cd deployment-package
./deploy-to-server.sh
```

---

## ✅ 步骤六：验证部署

### 6.1 检查服务状态
在服务器上执行：
```bash
/opt/zhitoujianli/check_deployment.sh
```

### 6.2 测试API
```bash
# 测试健康检查
curl https://api.zhitoujianli.com/health

# 测试登录接口
curl -X POST https://api.zhitoujianli.com/api/auth/login/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## 🎯 步骤七：更新前端配置

在火山云控制台更新环境变量：
```json
{
  "env": {
    "REACT_APP_API_URL": "https://api.zhitoujianli.com/api"
  }
}
```

---

## 🎉 完成！

🌟 **恭喜！你的智投简历系统已成功部署到火山云！**

### 📍 访问地址
- **前端网站**: https://zhitoujianli.com
- **API接口**: https://api.zhitoujianli.com
- **健康检查**: https://api.zhitoujianli.com/health

### 🔧 管理命令
```bash
# 重启应用
systemctl restart zhitoujianli

# 查看日志
journalctl -u zhitoujianli -f

# 检查状态
/opt/zhitoujianli/check_deployment.sh

# 手动备份
/opt/zhitoujianli/backup.sh
```

---

## 🚨 如果遇到问题

### 常见问题解决

#### 1. SSL证书申请失败
```bash
# 检查域名解析
nslookup api.zhitoujianli.com

# 检查防火墙
firewall-cmd --list-all

# 手动申请证书
certbot certonly --webroot -w /var/www/html -d api.zhitoujianli.com
```

#### 2. 应用启动失败
```bash
# 查看详细日志
journalctl -u zhitoujianli --since "10 minutes ago"

# 检查配置文件
cat /opt/zhitoujianli/config/.env

# 检查端口占用
netstat -tlnp | grep 8080
```

#### 3. 数据库连接失败
```bash
# 测试数据库连接
mysql -u zhitoujianli -p zhitoujianli

# 检查MySQL状态
systemctl status mysqld

# 重启MySQL
systemctl restart mysqld
```

### 📞 应急联系信息
- **部署文档**: `/Users/user/autoresume/docs/deployment/VOLCENGINE_SERVER_DEPLOYMENT_GUIDE.md`
- **服务器配置**: `/opt/zhitoujianli/config/.env`
- **备份位置**: `/opt/zhitoujianli/backups/`

---

## 💡 下一步优化建议

1. **配置监控**: 设置服务器监控和告警
2. **性能优化**: 根据访问量调整JVM参数
3. **安全加固**: 配置更严格的防火墙规则
4. **数据备份**: 设置异地备份策略

---

**🎯 重要提醒**: 部署完成后，前端的登录功能应该能够正常工作，405错误将被解决！