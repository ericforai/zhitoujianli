# 智投简历火山云服务器部署记录

## 📋 部署信息

| 项目 | 详情 |
|------|------|
| **部署日期** | 2025年10月2日 |
| **服务器提供商** | 火山云 |
| **服务器IP** | 115.190.182.95 |
| **操作系统** | CentOS/RHEL 8+ |
| **域名** | api.zhitoujianli.com |
| **部署方式** | 自动化脚本部署 |

## 🏗️ 技术架构

### 系统架构图
```
用户请求
    ↓
EdgeOne CDN (zhitoujianli.com)
    ↓ 前端静态资源
    ↓ API请求 (/api/*)
火山云服务器 (115.190.182.95)
    ↓ Nginx反向代理 (80/443 → 8080)
    ↓ Spring Boot应用 (端口8080)
    ↓ MySQL数据库 (端口3306)
    ↓ Redis缓存 (端口6379)
```

### 技术栈
- **前端**: React + TypeScript (EdgeOne CDN)
- **后端**: Spring Boot + Java 17
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **Web服务器**: Nginx
- **SSL证书**: Let's Encrypt
- **服务管理**: systemd

## 🛠️ 部署规范

### 目录结构
```
/opt/zhitoujianli/
├── app/                    # 应用JAR文件
│   └── get_jobs-2.0.1.jar
├── config/                 # 配置文件
│   └── .env                # 环境变量配置
├── logs/                   # 日志文件
│   └── application.log
├── backups/                # 备份文件
└── check_status.sh         # 状态检查脚本
```

### 服务配置
- **应用服务**: zhitoujianli.service
- **端口映射**: 8080 (内部) → 443 (外部HTTPS)
- **用户权限**: zhitoujianli (非root用户)
- **文件权限**: 配置文件600，应用目录755

### 网络配置
- **防火墙端口**: 22 (SSH), 80 (HTTP), 443 (HTTPS), 8080 (应用)
- **SSL/TLS**: TLS 1.2+, 强密码套件
- **CORS配置**: 支持zhitoujianli.com域名

## 🚀 自动部署流程

### 部署脚本执行
```bash
cd /Users/user/autoresume
./scripts/auto-deploy-volcengine.sh
```

### 部署步骤详解

#### 1. 服务器连接测试
- 验证SSH连接到115.190.182.95
- 确认root用户访问权限

#### 2. 系统环境配置
- 系统包更新 (`yum update -y`)
- 基础软件安装 (wget, curl, vim, git)
- 防火墙配置 (firewalld)

#### 3. 应用用户创建
- 创建zhitoujianli用户
- 配置sudo权限
- 创建应用目录结构

#### 4. 运行环境安装
- **Java 17**: OpenJDK安装和配置
- **MySQL 8.0**: 数据库服务安装
- **Redis**: 缓存服务安装
- **Nginx**: 反向代理服务安装

#### 5. 数据库初始化
```sql
CREATE DATABASE zhitoujianli DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'zhitoujianli'@'localhost' IDENTIFIED BY 'ZhiTou2025!@#';
GRANT ALL PRIVILEGES ON zhitoujianli.* TO 'zhitoujianli'@'localhost';
FLUSH PRIVILEGES;
```

#### 6. 应用配置
- 环境变量配置 (.env文件)
- systemd服务配置
- 日志和备份策略

#### 7. 本地应用构建
- 简化SecurityConfig避免编译错误
- Maven打包 (`mvn clean package -DskipTests`)
- JAR文件生成

#### 8. 应用部署
- JAR文件上传到服务器
- 服务启动和自启动配置
- 状态验证

#### 9. SSL证书配置
- Let's Encrypt证书申请
- Nginx HTTPS配置
- 证书自动续期设置

#### 10. 部署验证
- 服务状态检查
- 端口监听验证
- API健康检查
- 资源使用率监控

## 📊 监控和维护

### 状态检查命令
```bash
# 服务状态检查
ssh root@115.190.182.95 '/opt/zhitoujianli/check_status.sh'

# 实时日志查看
ssh root@115.190.182.95 'journalctl -u zhitoujianli -f'

# 系统资源监控
ssh root@115.190.182.95 'top'
ssh root@115.190.182.95 'df -h'
ssh root@115.190.182.95 'free -h'
```

### 重要文件位置
| 文件类型 | 路径 |
|---------|------|
| 应用配置 | `/opt/zhitoujianli/config/.env` |
| 应用日志 | `/opt/zhitoujianli/logs/application.log` |
| 系统日志 | `journalctl -u zhitoujianli` |
| Nginx配置 | `/etc/nginx/conf.d/zhitoujianli.conf` |
| SSL证书 | `/etc/letsencrypt/live/api.zhitoujianli.com/` |
| 服务配置 | `/etc/systemd/system/zhitoujianli.service` |

### 备份策略
- **频率**: 每日凌晨2点自动备份
- **内容**: 数据库、应用配置、JAR文件
- **保留期**: 30天自动清理
- **位置**: `/opt/zhitoujianli/backups/`

## 🌐 域名和网络配置

### DNS配置要求
在域名管理面板添加以下记录：
```
类型: A
主机记录: api
解析值: 115.190.182.95
TTL: 600秒
```

### EdgeOne环境变量更新
在腾讯云EdgeOne控制台更新：
```json
{
  "env": {
    "REACT_APP_API_URL": "https://api.zhitoujianli.com/api"
  }
}
```

## 🔒 安全配置

### 访问控制
- SSH密钥认证
- 防火墙端口限制
- 应用用户权限隔离
- 数据库用户权限最小化

### SSL/TLS配置
- TLS 1.2+ 协议
- 强密码套件
- HSTS安全头
- 证书自动续期

### 数据保护
- 数据库密码强度要求
- 配置文件权限控制
- 定期备份策略
- 日志安全存储

## 🚨 故障处理

### 常见问题诊断

#### 1. 应用启动失败
```bash
# 查看服务状态
systemctl status zhitoujianli

# 查看详细日志
journalctl -u zhitoujianli --since "10 minutes ago"

# 检查配置文件
cat /opt/zhitoujianli/config/.env
```

#### 2. 数据库连接问题
```bash
# 测试数据库连接
mysql -u zhitoujianli -p zhitoujianli

# 检查MySQL服务
systemctl status mysqld

# 查看MySQL错误日志
tail -f /var/log/mysqld.log
```

#### 3. SSL证书问题
```bash
# 检查证书状态
certbot certificates

# 手动续期
certbot renew

# 测试Nginx配置
nginx -t
```

#### 4. 网络连通性问题
```bash
# 检查端口监听
netstat -tlnp | grep -E "(80|443|8080)"

# 测试内部API
curl http://localhost:8080/health

# 测试外部访问
curl https://api.zhitoujianli.com/health
```

### 应急恢复步骤

1. **服务重启**
   ```bash
   systemctl restart zhitoujianli
   systemctl restart nginx
   systemctl restart mysqld
   ```

2. **配置恢复**
   ```bash
   # 从备份恢复配置
   cp /opt/zhitoujianli/backups/config_最新日期/* /opt/zhitoujianli/config/
   ```

3. **数据库恢复**
   ```bash
   # 从备份恢复数据库
   mysql -u zhitoujianli -p zhitoujianli < /opt/zhitoujianli/backups/db_最新日期.sql
   ```

## 📞 技术支持信息

### 关键联系信息
- **服务器IP**: 115.190.182.95
- **SSH用户**: root
- **数据库密码**: ZhiTou2025!@#
- **应用端口**: 8080
- **管理域名**: api.zhitoujianli.com

### 维护窗口
- **定期维护**: 每周日凌晨2-4点
- **安全更新**: 每月第一个周末
- **备份检查**: 每月15日

### 文档版本
- **创建日期**: 2025年10月2日
- **最后更新**: 2025年10月2日
- **版本号**: v1.0
- **责任人**: 智投简历技术团队

---

**重要提醒**: 
- 生产环境部署前务必备份重要数据
- 定期检查SSL证书有效期
- 监控系统资源使用情况
- 保持系统和应用更新