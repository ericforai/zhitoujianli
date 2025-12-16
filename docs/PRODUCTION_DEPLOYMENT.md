# 智投简历 - 生产环境部署指南

## 📋 概述

本文档说明如何将代码部署到生产环境，确保与开发环境完全分离。

## 🎯 部署原则

1. **代码来源**: 始终从GitHub主分支部署
2. **环境隔离**: 开发环境和生产环境完全分离
3. **自动化部署**: 使用脚本自动化部署流程
4. **回滚机制**: 保留部署历史，支持快速回滚

## 🚀 部署流程

### 前置检查

1. **确认代码已提交到GitHub**

   ```bash
   cd /root/zhitoujianli
   git status
   git log origin/main -1
   ```

2. **验证生产环境配置**
   ```bash
   # 检查生产环境变量
   cat /etc/zhitoujianli/backend.env | grep SPRING_PROFILES_ACTIVE
   # 应该显示: SPRING_PROFILES_ACTIVE=prod
   ```

### 前端部署

#### 方式1: 使用自动化脚本（推荐）

```bash
cd /root/zhitoujianli

# 部署前验证
./scripts/validate-deployment.sh

# 部署前端
./deploy-frontend.sh
```

#### 方式2: 手动部署

```bash
# 1. 拉取最新代码
cd /root/zhitoujianli
git fetch origin
git reset --hard origin/main

# 2. 构建前端
cd frontend
npm install
npm run build

# 3. 部署到Nginx目录
sudo cp -r build/* /var/www/zhitoujianli/build/

# 4. 验证部署
curl -I https://www.zhitoujianli.com/
```

### 后端部署

#### 方式1: 使用自动化脚本（推荐）

```bash
cd /root/zhitoujianli
./scripts/deploy-backend.sh
```

#### 方式2: 手动部署

```bash
# 1. 拉取最新代码
cd /root/zhitoujianli
git fetch origin
git reset --hard origin/main

# 2. 构建后端
cd backend/get_jobs
mvn clean package -DskipTests

# 3. 编译类文件（重要！）
mvn compile -DskipTests

# 4. 复制JAR文件
VERSION=$(date +%Y%m%d_%H%M%S)
cp target/get_jobs-*.jar /opt/zhitoujianli/backend/get_jobs-v${VERSION}.jar
ln -sf /opt/zhitoujianli/backend/get_jobs-v${VERSION}.jar /opt/zhitoujianli/backend/get_jobs-latest.jar

# 5. 重启服务
sudo systemctl daemon-reload
sudo systemctl restart zhitoujianli-backend.service

# 6. 验证服务
sudo systemctl status zhitoujianli-backend.service
```

### 博客部署

```bash
cd /root/zhitoujianli
./scripts/deploy-blog.sh
```

## 🔍 部署验证

### 前端验证

```bash
# 检查文件是否存在
ls -lh /var/www/zhitoujianli/build/index.html

# 检查HTTP响应
curl -I https://www.zhitoujianli.com/

# 检查API代理
curl https://www.zhitoujianli.com/api/auth/health
```

### 后端验证

```bash
# 检查服务状态
sudo systemctl status zhitoujianli-backend.service

# 检查日志
sudo journalctl -u zhitoujianli-backend.service -n 50

# 检查API响应
curl https://www.zhitoujianli.com/api/auth/health
```

### 完整验证

```bash
# 运行完整验证脚本
/root/zhitoujianli/scripts/validate-deployment.sh
```

## 🔄 回滚流程

### 前端回滚

```bash
# 查看部署历史
ls -lt /opt/zhitoujianli/backups/frontend/

# 恢复备份
sudo cp -r /opt/zhitoujianli/backups/frontend/YYYYMMDD_HHMMSS/* /var/www/zhitoujianli/build/
```

### 后端回滚

```bash
# 查看JAR版本
ls -lt /opt/zhitoujianli/backend/get_jobs-v*.jar

# 切换到旧版本
ln -sf /opt/zhitoujianli/backend/get_jobs-v旧版本.jar /opt/zhitoujianli/backend/get_jobs-latest.jar

# 重启服务
sudo systemctl restart zhitoujianli-backend.service
```

## 📝 部署检查清单

### 部署前

- [ ] 代码已提交到GitHub
- [ ] 本地测试通过
- [ ] 生产环境配置正确
- [ ] 数据库备份完成（如需要）

### 部署中

- [ ] 拉取最新代码
- [ ] 构建成功
- [ ] 部署到正确路径
- [ ] 服务重启成功

### 部署后

- [ ] 前端页面可访问
- [ ] 后端API正常响应
- [ ] 数据库连接正常
- [ ] 日志无错误
- [ ] 功能测试通过

## 🚨 注意事项

### 1. 环境变量

生产环境必须使用 `SPRING_PROFILES_ACTIVE=prod`，配置文件：

- `/etc/zhitoujianli/backend.env`

### 2. 数据库

- 生产环境数据库配置在 `application-production.yml`
- 确保 `ddl-auto=validate`（禁止自动修改表结构）

### 3. 安全

- 生产环境必须启用认证: `SECURITY_ENABLED=true`
- JWT密钥必须足够复杂
- 不要在生产环境使用开发密钥

### 4. 日志

- 生产环境日志级别: `INFO`
- 日志文件位置: `/opt/zhitoujianli/logs/`
- 定期清理旧日志

## 📚 相关文档

- [开发环境设置指南](./DEVELOPMENT_ENVIRONMENT_SETUP.md)
- [故障排除指南](./TROUBLESHOOTING.md)
- [API文档](./API_DOCUMENTATION.md)



