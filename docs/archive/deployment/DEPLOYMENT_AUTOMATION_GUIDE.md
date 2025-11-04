# 智投简历自动化部署指南

## 📋 概述

本指南介绍智投简历项目的自动化部署系统，包括统一部署路径、CI/CD流程和版本检查机制。

## 🗂️ 部署文件结构

```
/root/zhitoujianli/
├── deployment-config.yaml          # 统一部署配置文件
├── deploy-unified.sh               # 统一部署脚本
├── ci-cd-local.sh                  # 本地CI/CD脚本
├── version-check.sh                # 版本检查脚本
├── deployment-monitor.sh           # 部署监控脚本
├── quick-deploy.sh                 # 快速部署工具
├── setup-cron.sh                   # 定时任务配置脚本
└── .github/workflows/deploy.yml    # GitHub Actions工作流
```

## 🚀 快速开始

### 1. 使用快速部署工具（推荐）

```bash
cd /root/zhitoujianli
./quick-deploy.sh
```

交互式菜单提供以下选项：
- 完整部署（前端+后端+博客）
- 单独部署前端/后端/博客
- 版本检查
- 部署监控
- 查看日志
- 版本回滚

### 2. 使用统一部署脚本

```bash
cd /root/zhitoujianli
./deploy-unified.sh
```

自动执行：
1. 备份当前版本
2. 部署前端
3. 部署后端
4. 部署博客
5. 重启Nginx
6. 验证部署

### 3. 版本检查

```bash
./version-check.sh
```

检查项目：
- Git版本信息
- 前端版本同步状态
- 后端运行状态
- 生成版本报告（version-info.json）

### 4. 部署监控

```bash
./deployment-monitor.sh
```

监控内容：
- 服务运行状态
- API响应状态
- 系统资源使用
- 生成监控报告

## 📁 统一部署路径配置

所有部署脚本使用 `deployment-config.yaml` 中的统一路径配置：

### 前端路径
- 源码目录: `/root/zhitoujianli/frontend`
- 构建目录: `/root/zhitoujianli/frontend/build`
- 生产目录: `/usr/share/nginx/html`
- 备份目录: `/var/www/html.backup.*`

### 后端路径
- 源码目录: `/root/zhitoujianli/backend/get_jobs`
- PID文件: `/root/zhitoujianli/backend.pid`
- 日志文件: `/tmp/backend.log`

### 博客路径
- 源码目录: `/root/zhitoujianli/blog/zhitoujianli-blog`
- 构建目录: `/root/zhitoujianli/blog/zhitoujianli-blog/dist`
- 生产目录: `/usr/share/nginx/html`

### 服务端口
- 前端: 3000 (开发环境)
- 后端: 8080
- 博客: 4321 (开发环境)
- Nginx: 80, 443

## 🔄 CI/CD自动化流程

### GitHub Actions自动部署

提交到main分支时自动触发：

1. **测试阶段**
   - 代码质量检查（ESLint, TypeScript）
   - 前端测试
   - 后端测试
   - 构建验证

2. **部署阶段**
   - 拉取最新代码
   - 执行统一部署脚本
   - 验证部署结果

### 本地CI/CD流程

```bash
./ci-cd-local.sh
```

执行流程：
1. 运行测试
2. 构建项目
3. 部署项目
4. 验证部署

## 🕐 定时任务

设置定时任务：

```bash
./setup-cron.sh
```

自动配置：
- 每小时检查版本一致性
- 每天凌晨2点执行完整部署检查
- 每周一凌晨3点清理旧日志

查看定时任务：
```bash
crontab -l
```

## 📊 版本检查系统

### 版本信息文件

位置: `/root/zhitoujianli/version-info.json`

包含内容：
- Git提交信息（hash, branch, message）
- 前端版本信息（构建时间、生产时间、JS文件名）
- 后端版本信息（构建时间、运行状态）
- 博客版本信息（构建时间、同步状态）

### 版本一致性检查

脚本自动检查：
- 前端构建版本与生产版本是否一致
- 后端服务是否正常运行
- 博客文件是否同步

## 🔧 版本回滚

### 自动备份

每次部署前自动备份当前版本到：
```
/var/www/html.backup.YYYYMMDD_HHMMSS/
```

保留最近5个备份。

### 手动回滚

使用快速部署工具：
```bash
./quick-deploy.sh
# 选择选项 8) 回滚到上一版本
```

或手动恢复：
```bash
# 查找最新备份
ls -lt /var/www/html.backup.*

# 恢复备份
cp -r /var/www/html.backup.XXXXXXXX_XXXXXX/* /usr/share/nginx/html/
chown -R www-data:www-data /usr/share/nginx/html
systemctl reload nginx
```

## 📝 日志文件

### 部署日志
- 位置: `/var/log/zhitoujianli-deploy.log`
- 内容: 部署操作记录

### 版本检查日志
- 位置: `/var/log/zhitoujianli-version-check.log`
- 内容: 版本检查记录

### 后端日志
- 位置: `/tmp/backend.log`
- 内容: 后端服务日志

### Nginx日志
- 访问日志: `/var/log/nginx/access.log`
- 错误日志: `/var/log/nginx/error.log`

## 🛠️ 常用命令

### 查看服务状态
```bash
# 检查后端服务
netstat -tlnp | grep :8080

# 检查Nginx服务
systemctl status nginx

# 检查前端版本
grep -o 'main\.[a-f0-9]*\.js' /usr/share/nginx/html/index.html
```

### 重启服务
```bash
# 重启后端
./deploy-unified.sh  # 或使用快速部署工具

# 重启Nginx
systemctl restart nginx

# 重新加载Nginx配置
systemctl reload nginx
```

### 清理日志
```bash
# 清理旧日志（保留最近7天）
find /var/log -name '*zhitoujianli*' -mtime +7 -delete

# 清理旧备份（保留最近5个）
find /var/www -name "html.backup.*" -type d | sort | head -n -5 | xargs rm -rf
```

## 🔐 GitHub Actions设置

### 配置Secrets

在GitHub仓库设置中添加以下Secrets：

1. `DEPLOY_SSH_KEY`: 部署服务器的SSH私钥
2. `DEPLOY_HOST`: 部署服务器地址（如：www.zhitoujianli.com）

### 生成SSH密钥

```bash
# 在本地生成SSH密钥对
ssh-keygen -t rsa -b 4096 -C "deploy@zhitoujianli.com" -f ~/.ssh/zhitoujianli_deploy

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/zhitoujianli_deploy.pub root@your-server

# 将私钥内容添加到GitHub Secrets
cat ~/.ssh/zhitoujianli_deploy
```

## 📈 性能监控

### 资源使用监控

```bash
# CPU使用率
top -bn1 | grep "Cpu(s)"

# 内存使用率
free -h

# 磁盘使用率
df -h
```

### 服务响应监控

```bash
# 测试API响应
curl -w "%{http_code}\n" -X POST http://localhost:8080/api/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 测试前端访问
curl -I http://localhost/

# 测试博客访问
curl -I http://localhost/blog/
```

## 🚨 故障排查

### 前端不显示最新版本

1. 检查构建目录和生产目录的文件
   ```bash
   grep -o 'main\.[a-f0-9]*\.js' /root/zhitoujianli/frontend/build/index.html
   grep -o 'main\.[a-f0-9]*\.js' /usr/share/nginx/html/index.html
   ```

2. 如果不一致，重新部署前端
   ```bash
   ./quick-deploy.sh
   # 选择选项 2) 仅部署前端
   ```

### 后端服务未运行

1. 检查后端日志
   ```bash
   tail -100 /tmp/backend.log
   ```

2. 重启后端服务
   ```bash
   ./quick-deploy.sh
   # 选择选项 3) 仅部署后端
   ```

### Nginx配置错误

1. 测试Nginx配置
   ```bash
   nginx -t
   ```

2. 查看错误日志
   ```bash
   tail -50 /var/log/nginx/error.log
   ```

## 📞 技术支持

如有问题，请联系开发团队或查看项目文档：
- GitHub: https://github.com/your-repo/zhitoujianli
- 文档: /root/zhitoujianli/docs/

---

最后更新: 2025-10-15
版本: 1.0
