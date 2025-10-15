# 🚀 智投简历自动化部署系统

## ⚡ 快速开始

### 最简单的方式 - 使用快速部署工具

```bash
cd /root/zhitoujianli
./quick-deploy.sh
```

这会打开一个交互式菜单，您可以轻松完成所有部署操作。

## 📦 已创建的工具和脚本

### 1. 统一部署配置
- **文件**: `deployment-config.yaml`
- **说明**: 统一所有部署路径配置，确保一致性

### 2. 统一部署脚本
- **文件**: `deploy-unified.sh`
- **用法**: `./deploy-unified.sh`
- **功能**: 一键完整部署（前端+后端+博客）

### 3. CI/CD流程
- **文件**: `.github/workflows/deploy.yml` (GitHub Actions)
- **文件**: `ci-cd-local.sh` (本地CI/CD)
- **用法**: `./ci-cd-local.sh`
- **功能**: 自动化测试、构建、部署、验证流程

### 4. 版本检查系统
- **文件**: `version-check.sh`
- **用法**: `./version-check.sh`
- **功能**: 检查生产环境和测试环境的代码版本一致性

### 5. 部署监控工具
- **文件**: `deployment-monitor.sh`
- **用法**: `./deployment-monitor.sh`
- **功能**: 实时监控服务状态、API响应、系统资源

### 6. 快速部署工具
- **文件**: `quick-deploy.sh`
- **用法**: `./quick-deploy.sh`
- **功能**: 交互式菜单，提供所有部署和管理功能

### 7. 定时任务配置
- **文件**: `setup-cron.sh`
- **用法**: `./setup-cron.sh`
- **功能**: 自动设置定时任务（版本检查、日志清理等）

## 🎯 常用场景

### 场景1：更新前端代码后部署

```bash
# 方式1：使用快速部署工具
./quick-deploy.sh
# 选择 2) 仅部署前端

# 方式2：直接部署
cd frontend
npm run build
cp -r build/* /usr/share/nginx/html/
chown -R www-data:www-data /usr/share/nginx/html
systemctl reload nginx
```

### 场景2：更新后端代码后部署

```bash
# 使用快速部署工具
./quick-deploy.sh
# 选择 3) 仅部署后端
```

### 场景3：完整部署所有服务

```bash
# 使用统一部署脚本
./deploy-unified.sh
```

### 场景4：检查版本是否一致

```bash
# 运行版本检查
./version-check.sh
```

### 场景5：监控服务状态

```bash
# 运行部署监控
./deployment-monitor.sh
```

### 场景6：版本回滚

```bash
# 使用快速部署工具
./quick-deploy.sh
# 选择 8) 回滚到上一版本
```

## 📋 部署路径说明

### 前端部署路径
- **构建目录**: `/root/zhitoujianli/frontend/build`
- **生产目录**: `/usr/share/nginx/html`
- **备份目录**: `/var/www/html.backup.*`

### 后端部署路径
- **源码目录**: `/root/zhitoujianli/backend/get_jobs`
- **日志文件**: `/tmp/backend.log`
- **PID文件**: `/root/zhitoujianli/backend.pid`

### 博客部署路径
- **构建目录**: `/root/zhitoujianli/blog/zhitoujianli-blog/dist`
- **生产目录**: `/usr/share/nginx/html`

## 🔄 自动化流程说明

### 1. 定时版本检查
每小时自动检查版本一致性，如发现不一致会记录到日志。

### 2. 定时完整检查
每天凌晨2点执行完整的CI/CD检查，确保系统稳定。

### 3. 自动日志清理
每周一凌晨3点自动清理7天前的日志文件。

### 4. GitHub Actions自动部署
提交代码到main分支时，自动触发测试、构建和部署流程。

## 📊 监控和日志

### 查看部署日志
```bash
tail -f /var/log/zhitoujianli-deploy.log
```

### 查看版本检查日志
```bash
tail -f /var/log/zhitoujianli-version-check.log
```

### 查看后端日志
```bash
tail -f /tmp/backend.log
```

### 查看Nginx日志
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

## 🛠️ 故障处理

### 问题1：前端更新后没有生效
**原因**: 浏览器缓存或Nginx缓存
**解决方案**:
```bash
# 清除Nginx缓存并重启
systemctl restart nginx
# 清除浏览器缓存（Ctrl+Shift+R）
```

### 问题2：后端服务未运行
**解决方案**:
```bash
# 查看后端日志找出错误原因
tail -100 /tmp/backend.log

# 重新部署后端
./quick-deploy.sh
# 选择 3) 仅部署后端
```

### 问题3：版本不一致
**解决方案**:
```bash
# 运行版本检查
./version-check.sh

# 如果确实不一致，执行完整部署
./deploy-unified.sh
```

## ✅ 系统状态检查清单

在重要操作前，建议运行以下检查：

```bash
# 1. 检查所有服务状态
./deployment-monitor.sh

# 2. 检查版本一致性
./version-check.sh

# 3. 测试API响应
curl -X POST http://localhost:8080/api/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 4. 测试前端访问
curl -I http://localhost/
```

## 📚 更多文档

详细文档请参考：
- **完整部署指南**: `DEPLOYMENT_AUTOMATION_GUIDE.md`
- **项目README**: `README.md`
- **API文档**: `docs/API.md`

## 🎉 完成！

您的自动化部署系统已经完全配置好了！

现在您可以：
✅ 使用统一的部署路径
✅ 通过CI/CD自动部署
✅ 定期检查版本一致性
✅ 监控服务状态
✅ 快速回滚版本
✅ 查看详细日志

祝您部署顺利！🚀
