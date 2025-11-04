# 版本管理 - 快速参考指南

## 🚀 日常操作速查表

### 1. 构建新版本

```bash
# Step 1: 修改pom.xml中的版本号
vim backend/get_jobs/pom.xml
# 修改 <version>2.2.0</version> → <version>2.2.1</version>

# Step 2: 提交代码
git add .
git commit -m "fix(xxx): 修复某个问题"

# Step 3: 构建
cd /root/zhitoujianli
./scripts/build-backend.sh
```

---

### 2. 部署新版本

```bash
cd /root/zhitoujianli
./scripts/deploy-backend.sh

# 部署会自动：
# - 备份当前版本
# - 更新符号链接
# - 重启服务
# - 健康检查
# - 失败自动回滚
```

---

### 3. 查询当前版本

```bash
# 方式1：快速检查
./scripts/get-current-version.sh quick
# 输出：✓ 服务运行中 - 版本: 2.2.0-16ebf8c

# 方式2：完整信息
./scripts/get-current-version.sh

# 方式3：API查询
curl http://localhost:8080/api/version | jq '.'
```

---

### 4. 清理旧版本

```bash
# 保留最近3个版本（推荐）
./scripts/cleanup-old-versions.sh 3

# 保留最近5个版本
./scripts/cleanup-old-versions.sh 5
```

---

## 📝 版本号升级规则

| 变更类型   | 版本号变化    | 命令示例                     |
| ---------- | ------------- | ---------------------------- |
| Bug修复    | 2.2.0 → 2.2.1 | `git commit -m "fix: ..."`   |
| 新功能     | 2.2.1 → 2.3.0 | `git commit -m "feat: ..."`  |
| 破坏性变更 | 2.3.0 → 3.0.0 | `git commit -m "feat!: ..."` |

---

## 🔧 常用命令

```bash
# 查看所有可用版本
./scripts/get-current-version.sh list

# 查看服务状态
systemctl status zhitoujianli-backend

# 查看最近日志
journalctl -u zhitoujianli-backend -n 50

# 查看应用日志
tail -f /var/log/zhitoujianli-backend.log

# 查看错误日志
tail -f /var/log/zhitoujianli-backend-error.log
```

---

## 🛡️ 紧急回滚

```bash
# 方式1：使用备份目录
ls /opt/zhitoujianli/backend/backups/
ln -sf /opt/zhitoujianli/backend/backups/backup-xxx.jar \
       /opt/zhitoujianli/backend/get_jobs-latest.jar
systemctl restart zhitoujianli-backend

# 方式2：切换到旧版本
ln -sf /opt/zhitoujianli/backend/get_jobs-v2.1.0.jar \
       /opt/zhitoujianli/backend/get_jobs-latest.jar
systemctl restart zhitoujianli-backend
```

---

## 📊 版本API端点

| 端点                      | 说明          | 示例                                            |
| ------------------------- | ------------- | ----------------------------------------------- |
| `GET /api/version`        | 完整版本信息  | `curl http://localhost:8080/api/version`        |
| `GET /api/version/short`  | 简化版本信息  | `curl http://localhost:8080/api/version/short`  |
| `GET /api/version/health` | 健康检查+版本 | `curl http://localhost:8080/api/version/health` |

---

## ⚡ 完整工作流示例

### 场景：修复一个Bug

```bash
# 1. 修改代码
vim backend/get_jobs/src/main/java/...

# 2. 更新版本号（Bug修复：PATCH+1）
vim backend/get_jobs/pom.xml
# 修改：<version>2.2.0</version> → <version>2.2.1</version>

# 3. 提交代码
git add .
git commit -m "fix(auth): 修复登录验证问题"
git push

# 4. 构建
./scripts/build-backend.sh
# 输出：✅ 构建成功！get_jobs-v2.2.1.jar

# 5. 部署
./scripts/deploy-backend.sh
# 输出：✅ 部署成功！版本: 2.2.1-abc1234

# 6. 验证
./scripts/get-current-version.sh quick
# 输出：✓ 服务运行中 - 版本: 2.2.1-abc1234

# 7. 测试功能
curl http://localhost:8080/api/xxx

# 8. 清理旧版本（可选）
./scripts/cleanup-old-versions.sh 3
```

---

## 🆘 故障排查

### 问题1：构建失败

```bash
# 检查Maven版本
mvn --version

# 清理并重试
cd /root/zhitoujianli/backend/get_jobs
mvn clean
mvn package -DskipTests=true
```

### 问题2：部署后服务无法启动

```bash
# 查看详细日志
journalctl -u zhitoujianli-backend -n 100 --no-pager

# 检查端口占用
lsof -i:8080

# 检查环境变量
sudo cat /etc/zhitoujianli/backend.env
```

### 问题3：版本API返回空

```bash
# 检查git.properties是否存在
unzip -l /opt/zhitoujianli/backend/get_jobs-latest.jar | grep git.properties

# 检查应用启动日志
grep "版本信息" /var/log/zhitoujianli-backend.log
```

---

## 📁 重要目录

```
/root/zhitoujianli/
├── scripts/
│   ├── build-backend.sh          # 构建脚本
│   ├── deploy-backend.sh         # 部署脚本
│   ├── cleanup-old-versions.sh   # 清理脚本
│   └── get-current-version.sh    # 版本查询脚本
│
/opt/zhitoujianli/backend/
├── get_jobs-v2.2.0.jar          # 当前版本
├── get_jobs-latest.jar          # 符号链接 → 当前版本
├── backups/                     # 备份目录
└── logs/                        # 日志目录
```

---

## ⏰ 自动化维护（Cron）

```bash
# 编辑crontab
crontab -e

# 每周日凌晨3点清理旧版本
0 3 * * 0 /root/zhitoujianli/scripts/cleanup-old-versions.sh 3 >> /opt/zhitoujianli/logs/cleanup.log 2>&1

# 每天记录版本信息
0 0 * * * /root/zhitoujianli/scripts/get-current-version.sh quick >> /opt/zhitoujianli/logs/version-check.log 2>&1
```

---

## 🔑 关键注意事项

1. **每次修改代码都要更新版本号**
2. **提交代码后再构建**（Git SHA是追踪的关键）
3. **使用脚本，不要手动操作**
4. **部署前先在测试环境验证**
5. **定期清理旧版本节省空间**

---

**维护者：** ZhiTouJianLi Team
**最后更新：** 2025-11-03
