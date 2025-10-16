# 🚀 智投简历 - 自动化部署系统

## 概述

本项目已配置完整的 GitHub Actions 自动化部署系统，支持：

- ✅ **自动部署** - Push 到 main 分支自动触发
- ✅ **SSL 自动续签** - 每周自动检查并续签证书
- ✅ **健康检查** - 部署后自动验证服务状态
- ✅ **自动回滚** - 部署失败自动恢复到上一版本
- ✅ **版本管理** - 保留最近 3 个版本，快速回滚

---

## 📁 部署文件结构

```
zhitoujianli/
├── .github/
│   └── workflows/
│       ├── deploy.yml              # 自动部署工作流
│       └── ssl-renew.yml           # SSL 证书自动续签
├── deploy/
│   ├── nginx/
│   │   └── zhitoujianli.conf      # 生产环境 Nginx 配置
│   ├── scripts/
│   │   └── post-deploy-check.sh   # 部署后健康检查脚本
│   ├── README.md                   # 完整部署文档
│   ├── QUICK_START.md             # 快速开始指南（10分钟部署）
│   └── github-secrets-template.md # GitHub Secrets 配置模板
└── DEPLOYMENT.md                   # 本文件
```

---

## 🎯 快速开始

### 选择您的场景：

#### 场景 1: 首次部署（推荐阅读）

**阅读文档：** [deploy/QUICK_START.md](./deploy/QUICK_START.md)

这是一个简化的快速部署指南，帮助您在 **10 分钟**内完成：

1. 服务器准备
2. SSL 证书申请
3. SSH 密钥配置
4. GitHub Secrets 配置
5. 首次部署

---

#### 场景 2: 详细配置和故障排查

**阅读文档：** [deploy/README.md](./deploy/README.md)

完整的部署文档，包含：

- 详细的服务器配置步骤
- 安全配置建议
- 常见问题解决方案
- 回滚流程
- 监控和日志管理
- 维护清单

---

#### 场景 3: 配置 GitHub Secrets

**阅读文档：** [deploy/github-secrets-template.md](./deploy/github-secrets-template.md)

详细的 GitHub Secrets 配置指南，包含：

- 每个 Secret 的说明和示例
- 如何获取 SSH 私钥
- 配置验证测试
- 故障排查步骤

---

## 🔧 核心功能

### 1. 自动部署流程

**触发方式：**

- 自动触发：Push 到 `main` 分支
- 手动触发：GitHub Actions 界面

**部署步骤：**

```
1. 检出代码
2. 安装依赖
3. 代码质量检查
4. 构建前端项目
5. 上传到服务器
6. 更新 Nginx 配置
7. 测试配置并重载
8. 切换到新版本
9. 健康检查
10. 清理旧版本
```

**工作流文件：** `.github/workflows/deploy.yml`

---

### 2. SSL 证书自动续签

**触发方式：**

- 自动触发：每周一 UTC 03:00（北京时间 11:00）
- 手动触发：GitHub Actions 界面

**续签步骤：**

```
1. 检查当前证书状态
2. 执行证书续签（certbot renew）
3. 验证新证书有效性
4. 自动重载 Nginx
5. 健康检查
```

**工作流文件：** `.github/workflows/ssl-renew.yml`

---

### 3. 健康检查

**检查项目：**

- HTTP 强制跳转 HTTPS
- HTTPS 主页访问
- 常见页面（注册、登录）
- SSL 证书有效性
- API 端点响应
- CORS 配置
- 响应时间
- 安全响应头
- 页面内容完整性

**脚本文件：** `deploy/scripts/post-deploy-check.sh`

**使用方法：**

```bash
# 在服务器上运行
./deploy/scripts/post-deploy-check.sh production

# 或本地运行（检查线上环境）
./deploy/scripts/post-deploy-check.sh
```

---

### 4. 版本管理和回滚

**版本管理：**

- 使用软链接管理版本
- 保留最近 3 个版本
- 支持快速切换版本

**目录结构：**

```
/var/www/zhitoujianli/
├── releases/
│   ├── dist_123/    # 旧版本
│   ├── dist_124/    # 备份版本
│   └── dist_125/    # 当前版本
├── dist -> releases/dist_125/        # 当前版本（软链接）
└── dist_backup -> releases/dist_124/ # 备份版本（软链接）
```

**回滚命令：**

```bash
# 回滚到备份版本
cd /var/www/zhitoujianli
sudo rm dist
sudo cp -P dist_backup dist

# 或回滚到指定版本
sudo rm dist
sudo ln -s releases/dist_123 dist
```

---

## 📋 部署检查清单

### 前置条件检查

#### 服务器配置

- [ ] 服务器已安装 Nginx
- [ ] 服务器已安装 Certbot
- [ ] 服务器已安装 curl、rsync
- [ ] 防火墙已配置（80、443 端口开放）
- [ ] 部署目录已创建（/var/www/zhitoujianli）

#### 域名和证书

- [ ] 域名已解析到服务器 IP
  - zhitoujianli.com
  - www.zhitoujianli.com
- [ ] SSL 证书已申请成功
- [ ] 证书文件路径正确
  - /etc/letsencrypt/live/zhitoujianli.com/fullchain.pem
  - /etc/letsencrypt/live/zhitoujianli.com/privkey.pem

#### SSH 配置

- [ ] SSH 密钥对已生成
- [ ] 公钥已添加到服务器 authorized_keys
- [ ] 可以使用私钥 SSH 登录服务器
- [ ] SSH 用户有必要的权限

#### GitHub Secrets

- [ ] SSH_HOST 已配置
- [ ] SSH_USER 已配置
- [ ] SSH_PORT 已配置
- [ ] SSH_KEY 已配置（完整的私钥内容）
- [ ] REMOTE_DEPLOY_DIR 已配置
- [ ] REMOTE_NGINX_CONF 已配置

### 首次部署检查

#### 部署前

- [ ] 代码已提交到 main 分支
- [ ] GitHub Actions 工作流文件存在
  - .github/workflows/deploy.yml
  - .github/workflows/ssl-renew.yml
- [ ] Nginx 配置文件存在
  - deploy/nginx/zhitoujianli.conf
- [ ] 健康检查脚本存在
  - deploy/scripts/post-deploy-check.sh

#### 部署中

- [ ] GitHub Actions 工作流已触发
- [ ] 构建步骤成功完成
- [ ] 上传步骤成功完成
- [ ] Nginx 配置测试通过
- [ ] Nginx 重载成功
- [ ] 版本切换成功

#### 部署后

- [ ] 网站可以访问：https://www.zhitoujianli.com/
- [ ] HTTP 自动跳转到 HTTPS
- [ ] 注册页面正常：https://www.zhitoujianli.com/register
- [ ] 登录页面正常：https://www.zhitoujianli.com/login
- [ ] SSL 证书有效（浏览器显示锁图标）
- [ ] 浏览器控制台无 CORS 错误
- [ ] API 请求正常
- [ ] 健康检查脚本通过

### 后续维护检查

#### 每日检查

- [ ] 网站可访问性
- [ ] 查看错误日志（如有异常）

#### 每周检查

- [ ] SSL 证书有效期（自动续签工作流是否正常）
- [ ] 系统资源使用情况
- [ ] 清理旧日志文件

#### 每月检查

- [ ] 更新系统软件包
- [ ] 备份配置文件
- [ ] 检查磁盘空间
- [ ] 审查访问日志

---

## 🎓 学习路径

### 新手（从未部署过）

1. **阅读顺序：**

   ```
   1. deploy/QUICK_START.md        # 快速开始（必读）
   2. deploy/github-secrets-template.md  # 配置 Secrets
   3. 执行首次部署
   4. deploy/README.md             # 深入了解（可选）
   ```

2. **预计时间：** 30 分钟
   - 阅读文档：10 分钟
   - 配置服务器：10 分钟
   - 首次部署：10 分钟

---

### 有经验（熟悉部署流程）

1. **阅读顺序：**

   ```
   1. 本文件（DEPLOYMENT.md）      # 快速了解
   2. deploy/github-secrets-template.md  # 配置参考
   3. 直接开始部署
   ```

2. **预计时间：** 10 分钟

---

### 故障排查

**问题 1：** 部署失败

- 查看 GitHub Actions 日志
- 参考 [deploy/README.md#故障排查](./deploy/README.md#故障排查)

**问题 2：** 网站无法访问

- 运行健康检查脚本
- 查看 Nginx 错误日志

**问题 3：** CORS 错误

- 检查 Nginx 配置中的 CORS 头
- 参考 [deploy/README.md#问题3-cors错误](./deploy/README.md#问题3-cors错误)

**问题 4：** SSL 证书问题

- 检查证书有效期
- 手动执行续签测试
- 参考 [deploy/README.md#ssl证书管理](./deploy/README.md#ssl证书管理)

---

## 🔗 相关链接

### 文档

- [完整部署文档](./deploy/README.md)
- [快速开始指南](./deploy/QUICK_START.md)
- [GitHub Secrets 配置](./deploy/github-secrets-template.md)

### 工作流

- [自动部署工作流](./.github/workflows/deploy.yml)
- [SSL 续签工作流](./.github/workflows/ssl-renew.yml)

### 配置文件

- [Nginx 配置](./deploy/nginx/zhitoujianli.conf)
- [健康检查脚本](./deploy/scripts/post-deploy-check.sh)

### 外部资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Let's Encrypt 文档](https://letsencrypt.org/docs/)
- [Certbot 文档](https://certbot.eff.org/docs/)

---

## 📞 获取帮助

### 问题反馈

如遇到问题，请按以下步骤操作：

1. **查看日志**
   - GitHub Actions 日志
   - Nginx 错误日志
   - Certbot 日志

2. **运行诊断**

   ```bash
   # 健康检查
   ./deploy/scripts/post-deploy-check.sh

   # Nginx 配置测试
   sudo nginx -t

   # SSL 证书检查
   sudo certbot certificates
   ```

3. **查阅文档**
   - [故障排查指南](./deploy/README.md#故障排查)
   - [常见问题](./deploy/README.md#常见问题)

4. **提交 Issue**
   - 提供详细的错误信息
   - 包含相关日志
   - 说明已尝试的解决方案

---

## 🎯 下一步

完成首次部署后，建议配置以下内容：

### 监控和告警

- [ ] 配置网站可用性监控（推荐 UptimeRobot）
- [ ] 配置服务器资源监控
- [ ] 设置部署失败告警

### 性能优化

- [ ] 启用 CDN 加速
- [ ] 配置静态资源缓存
- [ ] 启用 Gzip 压缩

### 安全加固

- [ ] 配置 fail2ban 防暴力破解
- [ ] 启用自动安全更新
- [ ] 配置日志审计

### 备份策略

- [ ] 配置自动备份
- [ ] 定期测试恢复流程
- [ ] 异地备份

---

## 📊 部署统计

部署系统会在每次部署时生成统计信息：

- **部署版本号**：GitHub Run Number
- **部署时间**：UTC 时间戳
- **触发者**：GitHub 用户
- **提交 SHA**：Git commit hash
- **构建时间**：构建耗时
- **健康检查结果**：通过/失败

查看方式：

1. GitHub Actions → Deploy to Production → 查看 Summary
2. 或查看部署日志

---

## ✨ 特性亮点

1. **零停机部署**
   - 使用软链接切换版本
   - Nginx 平滑重载
   - 秒级切换

2. **自动回滚**
   - 健康检查失败自动回滚
   - 保留多个历史版本
   - 一键回滚命令

3. **完整的健康检查**
   - 多维度检查（10+ 项）
   - 详细的检查报告
   - 失败原因分析

4. **智能的版本管理**
   - 自动保留最近 3 个版本
   - 清理旧版本节省空间
   - 快速版本切换

5. **自动化证书管理**
   - 每周自动续签检查
   - 续签失败告警
   - 自动重载服务

---

**祝您部署顺利！** 🚀

有任何问题，请参考相关文档或提交 Issue。
