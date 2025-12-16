# 生产环境发布流程 - 标准操作程序

## 📋 概述

本文档定义了智投简历项目的**标准生产环境发布流程**。所有生产环境部署必须严格按照此流程执行。

## 🚀 标准发布流程

### 完整发布命令（一键执行）

**方式1: 使用标准发布脚本（推荐）**

```bash
cd /root/zhitoujianli
./scripts/deploy-production.sh
```

**方式2: 手动执行（分步）**

```bash
cd /root/zhitoujianli
git pull origin main
./deploy-frontend.sh
./scripts/deploy-backend.sh
```

两种方式效果相同，脚本方式会自动验证每个步骤。

### 分步执行说明

#### 步骤1: 进入项目目录

```bash
cd /root/zhitoujianli
```

**目的**: 确保在正确的项目目录下执行所有命令

#### 步骤2: 拉取最新代码

```bash
git pull origin main
```

**目的**:

- 从GitHub主分支拉取最新代码
- 确保生产环境代码与GitHub版本一致
- 避免使用本地未提交的代码

**⚠️ 重要**:

- 必须从 `origin/main` 拉取，不要使用其他分支
- 如果拉取失败，检查网络连接和GitHub访问权限
- 如果出现冲突，**不要**在生产环境解决，回退到上一步

#### 步骤3: 部署前端

```bash
./deploy-frontend.sh
```

**功能**:

- 自动构建前端代码
- 部署到 `/var/www/zhitoujianli/build/`
- 自动验证部署结果
- 失败时自动回滚

**预期输出**:

```
✅ 前端部署成功
✅ 健康检查通过
```

#### 步骤4: 部署后端

```bash
./scripts/deploy-backend.sh
```

**功能**:

- 自动编译后端代码
- 构建JAR文件
- 更新符号链接
- 重启systemd服务
- 验证服务状态

**预期输出**:

```
✅ 后端构建成功
✅ 服务重启成功
✅ 健康检查通过
```

## 📝 发布前检查清单

在执行发布流程前，请确认：

- [ ] **代码已提交**: 所有更改已提交到GitHub主分支
- [ ] **测试通过**: 本地开发环境测试通过
- [ ] **配置正确**: 生产环境配置文件正确（`/etc/zhitoujianli/backend.env`）
- [ ] **数据库备份**: 如涉及数据库变更，已备份数据库
- [ ] **通知团队**: 如需要，已通知团队成员即将发布

## ✅ 发布后验证

### 自动验证

部署脚本会自动执行以下验证：

1. **前端验证**:
   - 检查部署文件是否存在
   - 验证HTTP响应状态
   - 检查API代理是否正常

2. **后端验证**:
   - 检查服务状态
   - 验证健康检查端点
   - 检查日志是否有错误

### 手动验证（推荐）

```bash
# 1. 检查前端页面
curl -I https://www.zhitoujianli.com/
# 应该返回: HTTP/2 200

# 2. 检查后端API
curl https://www.zhitoujianli.com/api/auth/health
# 应该返回: {"success":true,"message":"服务运行正常"}

# 3. 检查服务状态
systemctl status zhitoujianli-backend.service
# 应该显示: active (running)

# 4. 检查日志（最近50行）
journalctl -u zhitoujianli-backend.service -n 50 --no-pager
# 应该没有ERROR级别的日志
```

## 🔄 回滚流程

如果发布后发现问题，可以快速回滚：

### 前端回滚

```bash
# 查看备份列表
ls -lt /opt/zhitoujianli/backups/frontend/

# 恢复指定备份（替换日期时间）
sudo cp -r /opt/zhitoujianli/backups/frontend/YYYYMMDD_HHMMSS/* /var/www/zhitoujianli/build/
```

### 后端回滚

```bash
# 查看JAR版本列表
ls -lt /opt/zhitoujianli/backend/get_jobs-v*.jar

# 切换到旧版本（替换版本号）
ln -sf /opt/zhitoujianli/backend/get_jobs-v旧版本.jar /opt/zhitoujianli/backend/get_jobs-latest.jar

# 重启服务
systemctl restart zhitoujianli-backend.service
```

## 🚨 紧急情况处理

### 服务完全不可用

```bash
# 1. 立即回滚到上一个版本
cd /root/zhitoujianli
git reset --hard HEAD~1  # 回退一个提交
./deploy-frontend.sh
./scripts/deploy-backend.sh

# 2. 或者从GitHub拉取上一个稳定版本
git fetch origin
git checkout <stable-tag>
./deploy-frontend.sh
./scripts/deploy-backend.sh
```

### 数据库问题

```bash
# 1. 停止服务
systemctl stop zhitoujianli-backend.service

# 2. 恢复数据库备份
# （根据你的备份策略执行）

# 3. 重启服务
systemctl start zhitoujianli-backend.service
```

## 📊 发布记录

建议记录每次发布：

| 日期时间         | 版本/提交 | 发布人 | 验证结果 | 备注     |
| ---------------- | --------- | ------ | -------- | -------- |
| 2025-12-12 10:00 | e743261   | -      | ✅ 通过  | 标准发布 |

## 🔒 安全注意事项

1. **不要在生产环境直接修改代码**
2. **不要跳过 `git pull` 步骤**
3. **不要手动复制文件到部署目录**
4. **不要手动重启服务而不使用部署脚本**
5. **发布前确保代码已通过测试**

## 📚 相关文档

- [开发环境设置指南](./DEVELOPMENT_ENVIRONMENT_SETUP.md)
- [生产环境部署指南](./PRODUCTION_DEPLOYMENT.md)
- [故障排除指南](./TROUBLESHOOTING.md)

## 💡 最佳实践

1. **定期发布**: 建议每周固定时间发布，避免频繁发布
2. **小步快跑**: 每次发布包含少量更改，便于问题定位
3. **充分测试**: 发布前在开发环境充分测试
4. **监控告警**: 发布后密切关注监控和日志
5. **文档更新**: 重要变更及时更新文档



