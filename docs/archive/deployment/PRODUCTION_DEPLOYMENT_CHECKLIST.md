# 🚀 生产环境部署检查清单

**部署日期**: _____年_____月_____日
**部署人员**: __________________
**版本号**: v________________

---

## 📋 部署前检查（必须100%完成）

### 一、环境准备 🖥️

- [ ] 服务器已准备就绪（配置符合要求）
- [ ] 域名已备案（如在中国大陆）
- [ ] DNS已正确配置指向服务器IP
- [ ] 防火墙已配置（开放80、443、8080端口）
- [ ] SSL证书已准备（推荐Let's Encrypt）
- [ ] Docker和Docker Compose已安装

**服务器要求**:
- CPU: 2核心以上
- 内存: 4GB以上
- 磁盘: 20GB以上可用空间
- 操作系统: Ubuntu 20.04+ / CentOS 7+

---

### 二、配置文件准备 📝

#### 后端配置文件

- [ ] 已创建 `backend/get_jobs/.env.production`
- [ ] JWT_SECRET已配置（48字节强随机密钥）
- [ ] Authing配置已填写（真实的UserPoolID、AppID、AppSecret）
- [ ] SECURITY_ENABLED=true
- [ ] 数据库配置已填写（如使用）
- [ ] Redis配置已填写（如使用）
- [ ] SPRING_PROFILES_ACTIVE=production

**验证JWT_SECRET**:
```bash
# 长度应≥48字节
echo -n "您的JWT_SECRET" | wc -c
```

#### 前端配置文件

- [ ] 已创建 `frontend/.env.production`
- [ ] REACT_APP_API_URL已设置（https://api.zhitoujianli.com）
- [ ] REACT_APP_ENV=production
- [ ] REACT_APP_DEBUG=false
- [ ] Google Analytics ID已配置（可选）
- [ ] Sentry DSN已配置（可选）

---

### 三、代码检查 💻

#### 后端代码

- [ ] 代码已提交到Git主分支
- [ ] 所有修复已合并
- [ ] Maven编译通过: `mvn clean compile`
- [ ] 单元测试通过: `mvn test`
- [ ] 代码检查通过: `mvn checkstyle:check`
- [ ] 没有硬编码的测试URL
- [ ] 日志级别设置为INFO或以上

#### 前端代码

- [ ] 代码已提交到Git
- [ ] TypeScript检查通过: `npm run type-check`
- [ ] ESLint检查通过: `npm run lint`
- [ ] 生产构建成功: `npm run build`
- [ ] 没有console.log调试代码（或已禁用）
- [ ] 没有硬编码的测试URL

---

### 四、安全检查 🔐

#### 关键安全项

- [ ] JWT_SECRET已更换为生产密钥（非测试密钥）
- [ ] Authing配置使用生产环境密钥
- [ ] SECURITY_ENABLED=true
- [ ] CORS只允许生产域名
- [ ] 敏感信息不在代码中
- [ ] .env文件已添加到.gitignore
- [ ] 数据库密码使用强密码
- [ ] SSL证书已配置（HTTPS）

#### 密钥检查

- [ ] JWT_SECRET长度≥48字节
- [ ] JWT_SECRET不包含"test"、"demo"等字样
- [ ] Authing密钥来自生产环境
- [ ] 数据库密码≥16位强密码
- [ ] Redis密码已配置

---

### 五、Docker配置 🐳

- [ ] Dockerfile.production已创建（前后端）
- [ ] docker-compose.production.yml已创建
- [ ] 健康检查已配置
- [ ] 资源限制已设置（CPU、内存）
- [ ] 重启策略已配置（unless-stopped）
- [ ] 日志驱动已配置
- [ ] 数据卷已配置（持久化数据）

---

### 六、Nginx配置 🌐

- [ ] nginx-production.conf已创建
- [ ] SSL证书路径正确
- [ ] 反向代理配置正确
- [ ] Gzip压缩已启用
- [ ] 静态文件缓存已配置
- [ ] WebSocket支持已配置
- [ ] 安全头已添加（HSTS、X-Frame-Options等）
- [ ] 访问日志已配置
- [ ] 错误日志已配置

---

### 七、数据库准备（如使用） 💾

- [ ] 数据库已创建
- [ ] 数据库用户已创建并授权
- [ ] 数据库表已初始化
- [ ] 数据已迁移/导入
- [ ] 备份策略已配置
- [ ] 连接池已配置
- [ ] 慢查询日志已启用

---

### 八、监控和日志 📊

- [ ] 日志目录已创建并设置权限
- [ ] 日志轮转已配置（logrotate）
- [ ] 应用监控已配置（可选：Prometheus）
- [ ] 错误监控已配置（可选：Sentry）
- [ ] 服务器监控已配置（可选）
- [ ] 告警规则已设置

---

## 🚀 部署执行步骤

### 步骤1: 上传代码到服务器

```bash
# 方式1: Git拉取
git clone https://github.com/ericforai/zhitoujianli.git
cd zhitoujianli
git checkout main

# 方式2: SCP上传
scp -r ./zhitoujianli user@server:/path/to/
```

- [ ] 代码已上传到服务器

---

### 步骤2: 配置环境变量

```bash
# 上传生产配置文件
scp .env.production user@server:/path/to/zhitoujianli/backend/get_jobs/.env
scp .env.production user@server:/path/to/zhitoujianli/frontend/.env

# 或在服务器上创建
vim backend/get_jobs/.env
vim frontend/.env
```

- [ ] 环境变量已正确配置

---

### 步骤3: 配置SSL证书

```bash
# 使用Let's Encrypt（推荐）
sudo certbot certonly --webroot -w /var/www/certbot \
  -d zhitoujianli.com \
  -d www.zhitoujianli.com

# 或上传已有证书
scp ssl/*.crt ssl/*.key user@server:/etc/nginx/ssl/
```

- [ ] SSL证书已配置
- [ ] 证书路径在Nginx配置中正确

---

### 步骤4: 执行部署

```bash
# 执行部署脚本
chmod +x deploy-production.sh
./deploy-production.sh
```

- [ ] 部署脚本执行成功
- [ ] 没有错误信息

---

### 步骤5: 服务验证

```bash
# 检查服务状态
docker-compose -f docker-compose.production.yml ps

# 检查健康状态
curl http://localhost:8080/api/auth/health
curl https://zhitoujianli.com

# 查看日志
docker-compose -f docker-compose.production.yml logs -f
```

- [ ] 所有服务都在运行
- [ ] 健康检查通过
- [ ] 页面可正常访问
- [ ] 日志无严重错误

---

## 🧪 部署后测试

### 基本功能测试

- [ ] 首页可访问: https://zhitoujianli.com
- [ ] HTTPS正常工作（小锁图标显示）
- [ ] HTTP自动跳转到HTTPS
- [ ] 登录功能正常
- [ ] 注册功能正常
- [ ] 简历上传功能正常
- [ ] 投递功能正常
- [ ] 登出功能正常

### API测试

- [ ] 健康检查接口: https://zhitoujianli.com/api/auth/health
- [ ] 登录API正常
- [ ] Token验证正常
- [ ] 所有业务API正常

### 性能测试

- [ ] 页面加载速度<3秒
- [ ] API响应时间<500ms
- [ ] 并发100用户无问题
- [ ] 内存使用正常
- [ ] CPU使用正常

### 安全测试

- [ ] HTTPS证书有效
- [ ] 安全头正确配置
- [ ] CORS配置正确
- [ ] XSS防护有效
- [ ] CSRF防护有效
- [ ] SQL注入防护有效

---

## 🔄 回滚准备

### 回滚条件

如果出现以下情况，应立即回滚：
- ❌ 服务无法启动
- ❌ 关键功能不可用
- ❌ 严重安全漏洞
- ❌ 性能严重下降
- ❌ 数据丢失风险

### 回滚步骤

```bash
# 1. 停止新版本
docker-compose -f docker-compose.production.yml down

# 2. 恢复备份
cp backup/backup_YYYYMMDD_HHMMSS/docker-compose.yml ./

# 3. 启动旧版本
docker-compose up -d

# 4. 验证
curl http://localhost:8080/api/auth/health
```

- [ ] 回滚步骤已准备
- [ ] 备份文件可访问

---

## 📊 部署后监控（前48小时）

### 需要关注的指标

- [ ] 错误日志监控
- [ ] API响应时间
- [ ] 服务器CPU使用率
- [ ] 服务器内存使用率
- [ ] 数据库连接数
- [ ] 用户登录成功率
- [ ] 简历投递成功率

### 告警设置

- [ ] 服务停止告警
- [ ] 错误率超过1%告警
- [ ] 响应时间超过1秒告警
- [ ] CPU使用率超过80%告警
- [ ] 内存使用率超过85%告警

---

## 📝 部署记录

### 部署信息

- **部署时间**: _______________
- **部署人员**: _______________
- **服务器IP**: _______________
- **域名**: zhitoujianli.com
- **版本号**: _______________

### 部署日志

- 备份位置: _______________
- 部署日志: _______________
- 问题记录: _______________

---

## ⚠️ 重要提醒

### 部署前必读

1. **备份数据**: 部署前必须备份当前数据和配置
2. **通知用户**: 提前通知用户系统维护时间
3. **选择时间**: 选择低峰时段部署（如凌晨2-6点）
4. **准备回滚**: 确保可以快速回滚
5. **监控准备**: 部署后持续监控48小时

### 紧急联系方式

- 技术负责人: __________________
- 运维负责人: __________________
- 24小时值班: __________________

---

## ✅ 最终确认

部署前，负责人需确认：

- [ ] 所有检查项已完成
- [ ] 配置文件已双重检查
- [ ] 备份已完成
- [ ] 回滚方案已准备
- [ ] 团队已就位
- [ ] 用户已通知

**签字确认**: ______________ 日期: ______________

---

## 🎯 部署成功标准

满足以下条件视为部署成功：

1. ✅ 所有服务正常启动
2. ✅ 健康检查通过
3. ✅ 页面可正常访问（HTTPS）
4. ✅ 核心功能测试通过
5. ✅ 性能指标正常
6. ✅ 无严重错误日志
7. ✅ 监控数据正常

---

**检查清单版本**: v1.0
**最后更新**: 2025-10-10
**维护团队**: ZhiTouJianLi Team
