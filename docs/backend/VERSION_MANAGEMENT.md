# 智投简历 - 后端版本管理规范

## 📋 概述

本文档定义了智投简历后端应用的版本管理规范，旨在解决版本混乱、难以追踪等问题。

### 问题背景

**旧版本管理问题：**
- ❌ 版本号不统一：`v2.0.1-timestamp`、`v2.5.0-feature`、`v20251102_fix`
- ❌ 无法追踪当前运行版本
- ❌ 手动管理版本号（容易出错）
- ❌ 旧版本堆积（占用空间且混淆）
- ❌ 部署脚本未集成版本管理

**新版本管理方案：**
- ✅ 统一语义化版本号
- ✅ 自动化构建和部署
- ✅ Git提交追踪
- ✅ 版本API实时查询
- ✅ 自动清理旧版本

---

## 🎯 版本号规范

### 语义化版本（Semantic Versioning）

**格式：** `MAJOR.MINOR.PATCH`

```
示例：2.2.0
- MAJOR (主版本): 2  - 不兼容的API变更
- MINOR (次版本): 2  - 向后兼容的功能新增
- PATCH (修订版本): 0 - 向后兼容的bug修复
```

### JAR文件命名规范

**格式：** `get_jobs-v{VERSION}.jar`

```
示例：get_jobs-v2.2.0.jar

组成部分：
- get_jobs: 项目名称
- v2.2.0: 语义化版本号

说明：
- JAR文件名仅包含版本号，保持简洁
- Git提交信息（SHA、分支、构建时间等）通过内置的git.properties在运行时暴露
- 通过版本API（/api/version）可实时查询完整版本信息，包括Git SHA

优势：
- 文件名简洁清晰
- Git信息动态可查
- 易于版本管理
```

### 版本号升级规则

| 变更类型 | 版本号变化 | 示例 |
|---------|-----------|------|
| 修复bug（向后兼容） | 增加PATCH | 2.2.0 → 2.2.1 |
| 新增功能（向后兼容） | 增加MINOR，重置PATCH | 2.2.1 → 2.3.0 |
| 不兼容的API变更 | 增加MAJOR，重置MINOR和PATCH | 2.3.0 → 3.0.0 |

---

## 🔧 技术实现

### 1. Maven配置（pom.xml）

```xml
<project>
    <version>2.2.0</version>

    <properties>
        <git.commit.id.abbrev>unknown</git.commit.id.abbrev>
        <build.timestamp>${maven.build.timestamp}</build.timestamp>
        <maven.build.timestamp.format>yyyyMMdd_HHmmss</maven.build.timestamp.format>
    </properties>

    <build>
        <finalName>get_jobs-v${project.version}-${git.commit.id.abbrev}</finalName>

        <plugins>
            <!-- Git Commit ID Plugin -->
            <plugin>
                <groupId>io.github.git-commit-id</groupId>
                <artifactId>git-commit-id-maven-plugin</artifactId>
                <version>6.0.0</version>
                <!-- 配置详见pom.xml -->
            </plugin>
        </plugins>
    </build>
</project>
```

### 2. 版本API（运行时查询）

**端点：** `GET /api/version`

**响应示例：**
```json
{
  "version": "2.2.0",
  "gitSha": "a3f5c2d",
  "gitBranch": "main",
  "buildTime": "2025-11-03T19:00:00Z",
  "commitTime": "2025-11-03T18:50:00Z",
  "commitMessage": "feat(version): 添加版本管理系统",
  "uptime": "2h 15m 30s",
  "javaVersion": "21.0.1",
  "springVersion": "3.2.0"
}
```

**其他端点：**
- `GET /api/version/short` - 简化版本信息
- `GET /api/version/health` - 健康检查（含版本）

---

## 🚀 自动化工具

### 1. build-backend.sh - 自动化构建

**功能：**
- 自动读取pom.xml版本号
- 自动获取Git提交信息
- Maven构建（跳过测试）
- 复制JAR到部署目录
- 记录构建日志

**使用方法：**
```bash
cd /root/zhitoujianli
./scripts/build-backend.sh
```

**输出示例：**
```
🚀 开始构建后端应用
==========================================
版本号: 2.2.0
Git SHA: a3f5c2d
Git分支: main
构建时间: 20251103_190000
JAR名称: get_jobs-v2.2.0-a3f5c2d.jar
==========================================
✅ 构建成功！
```

---

### 2. deploy-backend.sh - 智能部署

**功能：**
- 自动查找最新构建的JAR
- 备份当前运行版本
- 更新符号链接
- 重启systemd服务
- 健康检查（HTTP + systemd）
- 部署失败自动回滚

**使用方法：**
```bash
cd /root/zhitoujianli
./scripts/deploy-backend.sh
```

**安全机制：**
- ✅ 部署前自动备份
- ✅ 健康检查超时60秒
- ✅ 失败自动回滚到上一个版本
- ✅ 记录详细部署日志

---

### 3. cleanup-old-versions.sh - 清理旧版本

**功能：**
- 自动清理旧版本JAR
- 保留最近N个版本（默认3个）
- 同时清理备份目录
- 显示释放的磁盘空间

**使用方法：**
```bash
# 保留最近3个版本（默认）
./scripts/cleanup-old-versions.sh

# 保留最近5个版本
./scripts/cleanup-old-versions.sh 5
```

**输出示例：**
```
🧹 开始清理旧版本JAR
保留最近 3 个版本

现有版本列表:
  [保留] get_jobs-v2.2.0-a3f5c2d.jar (304MB, 2025-11-03 19:00:00)
  [保留] get_jobs-v2.1.1-b8e4f1a.jar (296MB, 2025-11-02 20:37:00)
  [保留] get_jobs-v2.0.1-c9f2a3b.jar (304MB, 2025-11-03 18:44:00)
  [删除] get_jobs-v2.0.8-d1a5e2f.jar (304MB, 2025-10-23 15:33:00)

✅ 已删除 1 个旧版本，释放空间 304MB
```

---

### 4. get-current-version.sh - 版本查询

**功能：**
- 查询文件系统版本（符号链接指向）
- 查询服务状态（systemd）
- 查询API版本信息（实时）
- 列出所有可用版本

**使用方法：**
```bash
# 完整信息
./scripts/get-current-version.sh

# 快速检查
./scripts/get-current-version.sh quick

# 仅列出所有版本
./scripts/get-current-version.sh list

# 仅查询API
./scripts/get-current-version.sh api
```

---

## 📂 目录结构

```
/opt/zhitoujianli/backend/
├── get_jobs-v2.2.0-a3f5c2d.jar       # 最新版本
├── get_jobs-v2.1.1-b8e4f1a.jar       # 旧版本
├── get_jobs-latest.jar               # 符号链接 → 当前运行版本
├── backups/                          # 备份目录
│   ├── backup-20251103_190000-get_jobs-v2.1.1-b8e4f1a.jar
│   └── backup-20251103_185000-get_jobs-v2.0.1-c9f2a3b.jar
└── logs/                             # 日志目录（建议）

/root/zhitoujianli/scripts/
├── build-backend.sh                  # 构建脚本
├── deploy-backend.sh                 # 部署脚本
├── cleanup-old-versions.sh           # 清理脚本
└── get-current-version.sh            # 版本查询脚本
```

---

## 🔄 完整开发流程

### 场景1：修复Bug

```bash
# 1. 修改代码（例如修复登录bug）
vim backend/get_jobs/src/main/java/...

# 2. 更新版本号（PATCH + 1）
vim backend/get_jobs/pom.xml
# 修改 <version>2.2.0</version> → <version>2.2.1</version>

# 3. 提交代码
git add .
git commit -m "fix(auth): 修复用户登录失败问题"

# 4. 构建
./scripts/build-backend.sh
# 生成: get_jobs-v2.2.1.jar（Git SHA: d4e5a3c 包含在jar内的git.properties中）

# 5. 部署
./scripts/deploy-backend.sh
# 自动备份、部署、健康检查

# 6. 验证
./scripts/get-current-version.sh quick
# ✓ 服务运行中 - 版本: 2.2.1-d4e5a3c

# 7. 清理旧版本（可选）
./scripts/cleanup-old-versions.sh
```

---

### 场景2：新增功能

```bash
# 1. 修改代码（例如新增简历解析功能）
vim backend/get_jobs/src/main/java/...

# 2. 更新版本号（MINOR + 1，PATCH重置）
vim backend/get_jobs/pom.xml
# 修改 <version>2.2.1</version> → <version>2.3.0</version>

# 3. 提交代码
git add .
git commit -m "feat(resume): 添加智能简历解析功能"

# 4. 构建和部署
./scripts/build-backend.sh
./scripts/deploy-backend.sh

# 5. 验证
curl http://localhost:8080/api/version | jq '.'
```

---

### 场景3：部署回滚

```bash
# 场景：新版本部署后发现严重bug，需要回滚

# 方式1：自动回滚（部署失败时自动触发）
./scripts/deploy-backend.sh
# 如果健康检查失败，脚本会自动回滚

# 方式2：手动回滚
# 查看所有版本
./scripts/get-current-version.sh list

# 手动切换到旧版本
ln -sf /opt/zhitoujianli/backend/get_jobs-v2.2.0-a3f5c2d.jar \
       /opt/zhitoujianli/backend/get_jobs-latest.jar

# 重启服务
systemctl restart zhitoujianli-backend

# 验证
./scripts/get-current-version.sh quick
```

---

## 🛡️ 最佳实践

### ✅ DO（推荐做法）

1. **每次修改代码都更新版本号**
   - Bug修复：增加PATCH版本
   - 新功能：增加MINOR版本
   - 破坏性变更：增加MAJOR版本

2. **使用自动化脚本**
   - 构建：`./scripts/build-backend.sh`
   - 部署：`./scripts/deploy-backend.sh`
   - 清理：`./scripts/cleanup-old-versions.sh`

3. **提交代码前先commit**
   - Git SHA是版本追踪的关键
   - 先commit再构建，确保版本可追溯

4. **定期清理旧版本**
   - 每周运行一次清理脚本
   - 或设置cron定时任务

5. **部署前先测试**
   - 在测试环境验证
   - 查看构建日志
   - 确认版本号正确

---

### ❌ DON'T（禁止做法）

1. **❌ 手动复制JAR文件**
   ```bash
   # ❌ 错误！版本信息会丢失
   cp target/get_jobs.jar /opt/zhitoujianli/backend/
   ```

2. **❌ 不更新版本号就构建**
   ```bash
   # ❌ 错误！会导致版本混淆
   # 修改代码后必须更新pom.xml中的版本号
   ```

3. **❌ 硬编码版本号**
   ```bash
   # ❌ 错误！
   ln -sf /opt/zhitoujianli/backend/get_jobs-v2.2.0-a3f5c2d.jar ...

   # ✅ 正确！使用脚本
   ./scripts/deploy-backend.sh
   ```

4. **❌ 手动删除旧版本**
   ```bash
   # ❌ 错误！可能误删当前运行版本
   rm /opt/zhitoujianli/backend/get_jobs-v*.jar

   # ✅ 正确！使用清理脚本
   ./scripts/cleanup-old-versions.sh
   ```

5. **❌ 跳过健康检查**
   ```bash
   # ❌ 错误！可能部署失败但未发现
   systemctl restart zhitoujianli-backend

   # ✅ 正确！使用部署脚本（自动健康检查）
   ./scripts/deploy-backend.sh
   ```

---

## 🔧 故障排查

### 问题1：版本号显示unknown

**原因：** Git插件未能读取Git信息

**解决方案：**
```bash
# 检查是否在Git仓库中
cd /root/zhitoujianli
git status

# 如果不是Git仓库，初始化
git init
git add .
git commit -m "init: 初始化项目"

# 重新构建
./scripts/build-backend.sh
```

---

### 问题2：部署后版本未更新

**原因：** 可能缓存了旧的JAR文件

**解决方案：**
```bash
# 1. 清理Maven缓存
cd /root/zhitoujianli/backend/get_jobs
mvn clean

# 2. 重新构建
cd /root/zhitoujianli
./scripts/build-backend.sh

# 3. 部署
./scripts/deploy-backend.sh

# 4. 验证（检查Git SHA是否更新）
./scripts/get-current-version.sh
```

---

### 问题3：健康检查超时

**原因：** 服务启动时间过长或启动失败

**解决方案：**
```bash
# 查看服务日志
journalctl -u zhitoujianli-backend -n 50

# 查看错误日志
tail -f /var/log/zhitoujianli-backend-error.log

# 手动测试健康检查
curl http://localhost:8080/api/version/health

# 如果端口被占用
lsof -i:8080
```

---

## 📊 监控和维护

### 定时清理任务（Cron）

```bash
# 编辑crontab
crontab -e

# 每周日凌晨3点清理旧版本（保留3个）
0 3 * * 0 /root/zhitoujianli/scripts/cleanup-old-versions.sh 3 >> /opt/zhitoujianli/logs/cleanup.log 2>&1

# 每天检查版本并记录
0 0 * * * /root/zhitoujianli/scripts/get-current-version.sh quick >> /opt/zhitoujianli/logs/version-check.log 2>&1
```

---

### 版本追踪日志

所有脚本都会记录日志到 `/opt/zhitoujianli/logs/`：

- `build-backend.log` - 构建日志
- `deploy-backend.log` - 部署日志
- `cleanup-backend.log` - 清理日志

**查看日志：**
```bash
# 查看最近的构建日志
tail -f /opt/zhitoujianli/logs/build-backend.log

# 查看部署历史
grep "部署成功" /opt/zhitoujianli/logs/deploy-backend.log
```

---

## 🎯 版本管理检查清单

### 开发阶段
- [ ] 修改代码前拉取最新代码
- [ ] 根据变更类型更新版本号
- [ ] 提交代码到Git（含规范的commit message）
- [ ] 运行构建脚本并检查日志

### 部署阶段
- [ ] 确认构建成功
- [ ] 运行部署脚本
- [ ] 等待健康检查通过
- [ ] 验证版本号（API查询）
- [ ] 测试关键功能

### 维护阶段
- [ ] 定期清理旧版本
- [ ] 检查磁盘空间
- [ ] 审查部署日志
- [ ] 验证备份文件

---

## 📞 相关文档

- [部署指南](../deployment/DEPLOYMENT_GUIDE.md)
- [开发规范](../README.md)
- [API文档](../api/API_REFERENCE.md)

---

## 📝 变更记录

| 版本 | 日期 | 作者 | 说明 |
|-----|------|------|------|
| 1.0.0 | 2025-11-03 | ZhiTouJianLi Team | 初始版本管理规范 |

---

**维护者：** ZhiTouJianLi Team
**最后更新：** 2025-11-03

