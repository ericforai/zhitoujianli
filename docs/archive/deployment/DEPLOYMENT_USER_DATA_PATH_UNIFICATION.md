# 用户数据路径统一 - 部署指南

## 📋 部署概述

**版本**: v1.0
**日期**: 2025-11-04
**目标**: 统一用户数据存储路径，解决配置和简历分散在不同目录的问题

**问题描述**:
- 当前用户 `luwenrong123@sina.com` 的数据分散在两个目录：
  - 简历：`user_data/luwenrong123@sina.com/candidate_resume.json`
  - 配置：`user_data/luwenrong123_sina_com/config.json`

**解决方案**:
- 统一到 `user_data/luwenrong123_sina_com/` 目录（使用下划线格式）

---

## 🚀 快速部署

### 1️⃣ 预览迁移（推荐第一步）

```bash
cd /root/zhitoujianli
./scripts/migrate-user-data.sh
```

这将显示将要执行的操作，**不会修改任何数据**。

### 2️⃣ 执行迁移

```bash
cd /root/zhitoujianli
./scripts/migrate-user-data.sh --execute
```

### 3️⃣ 编译部署

```bash
# 编译后端
cd /root/zhitoujianli/backend/get_jobs
mvn clean package -DskipTests

# 部署
cp target/get_jobs-*.jar /opt/zhitoujianli/backend/get_jobs-v2.2.0.jar
ln -sf /opt/zhitoujianli/backend/get_jobs-v2.2.0.jar /opt/zhitoujianli/backend/get_jobs-latest.jar

# 重启服务
systemctl restart zhitoujianli-backend.service
systemctl status zhitoujianli-backend.service
```

### 4️⃣ 验证

```bash
# 检查服务状态
systemctl status zhitoujianli-backend.service

# 查看日志（迁移记录）
journalctl -u zhitoujianli-backend.service -f | grep "迁移"

# 验证用户数据目录
ls -la /root/zhitoujianli/backend/get_jobs/user_data/luwenrong123_sina_com/
```

---

## 📝 详细实施步骤

### Phase 1: 准备工作

1. **备份数据**
```bash
cd /root/zhitoujianli/backend/get_jobs
cp -r user_data user_data_backup_manual_$(date +%Y%m%d_%H%M%S)
```

2. **检查当前状态**
```bash
# 查看所有用户目录
ls -la user_data/

# 查看特定用户的数据
ls -la user_data/luwenrong123@sina.com/
ls -la user_data/luwenrong123_sina_com/
```

### Phase 2: 执行迁移

1. **预览迁移计划**
```bash
./scripts/migrate-user-data.sh
```

2. **执行迁移**
```bash
./scripts/migrate-user-data.sh --execute
```

3. **验证迁移结果**
```bash
# 检查新目录
ls -la user_data/luwenrong123_sina_com/

# 应该包含以下文件：
# - candidate_resume.json
# - config.json
# - default_greeting.json
# - boss_cookie.json（如果有）
```

### Phase 3: 部署新代码

1. **编译后端**
```bash
cd /root/zhitoujianli/backend/get_jobs
mvn clean package -DskipTests
```

2. **部署JAR文件**
```bash
# 复制到部署目录
cp target/get_jobs-*.jar /opt/zhitoujianli/backend/get_jobs-v2.2.0.jar

# 更新符号链接
ln -sf /opt/zhitoujianli/backend/get_jobs-v2.2.0.jar /opt/zhitoujianli/backend/get_jobs-latest.jar
```

3. **重启服务**
```bash
systemctl daemon-reload  # 如果修改了systemd配置
systemctl restart zhitoujianli-backend.service
```

### Phase 4: 验证部署

1. **检查服务状态**
```bash
systemctl status zhitoujianli-backend.service
```

2. **查看启动日志**
```bash
journalctl -u zhitoujianli-backend.service -n 100 --no-pager
```

3. **测试用户登录**
```bash
# 使用浏览器访问
http://115.190.182.95/login

# 登录后查看日志，应该看到自动迁移消息（如果有旧数据）
journalctl -u zhitoujianli-backend.service -f | grep "迁移"
```

4. **验证功能**
- ✅ 用户登录
- ✅ 上传简历
- ✅ 设置配置
- ✅ 启动Boss任务
- ✅ 查看所有文件在同一目录

---

## 🔍 迁移脚本详解

### 功能特性

1. **安全预览模式**
   - 默认为预览模式，不修改任何数据
   - 显示将要执行的所有操作

2. **自动备份**
   - 执行迁移前自动创建备份
   - 备份目录：`user_data_backup_YYYYMMDD_HHMMSS`

3. **智能合并**
   - 如果新旧目录都存在，自动合并文件
   - 不覆盖新目录中已有的文件
   - 保留最新的文件版本

4. **详细日志**
   - 所有操作记录到日志文件
   - 日志文件：`/tmp/user_data_migration_YYYYMMDD_HHMMSS.log`

### 使用示例

```bash
# 1. 预览模式（推荐）
./scripts/migrate-user-data.sh

# 输出示例：
# [INFO] 用户数据目录: /root/zhitoujianli/backend/get_jobs/user_data
# [INFO] 处理用户目录: luwenrong123@sina.com -> luwenrong123_sina_com
# [INFO]   文件数量: 2
# [WARNING]   新目录已存在，需要合并
# [INFO]   [预览模式] 将合并目录

# 2. 执行模式
./scripts/migrate-user-data.sh --execute

# 输出示例：
# [INFO] 创建备份到: /root/zhitoujianli/backend/get_jobs/user_data_backup_20251104_120000
# [SUCCESS] 备份完成
# [INFO] 处理用户目录: luwenrong123@sina.com -> luwenrong123_sina_com
# [SUCCESS] 合并完成: 复制 2 个文件，跳过 1 个文件
# [INFO] 已删除旧目录: luwenrong123@sina.com
# [SUCCESS] ✅ 迁移完成！
```

---

## 🛡️ 安全保障

### 1. 多重备份

```bash
# 手动备份（推荐）
cp -r user_data user_data_backup_manual_$(date +%Y%m%d_%H%M%S)

# 脚本自动备份
# 执行迁移时自动创建

# 验证备份
ls -la user_data_backup_*
```

### 2. 回滚方案

**如果迁移后发现问题**:

```bash
# 停止服务
systemctl stop zhitoujianli-backend.service

# 恢复备份
cd /root/zhitoujianli/backend/get_jobs
rm -rf user_data
cp -r user_data_backup_YYYYMMDD_HHMMSS user_data

# 重启服务
systemctl start zhitoujianli-backend.service
```

### 3. 向后兼容

新代码包含向后兼容逻辑：
- ✅ 优先读取新格式路径
- ✅ 自动查找旧格式路径
- ✅ 新数据统一保存到新格式
- ✅ 不影响现有功能

---

## 📊 监控与验证

### 1. 实时监控迁移

```bash
# 查看迁移日志
journalctl -u zhitoujianli-backend.service -f | grep "迁移"

# 查看用户目录变化
watch -n 1 'ls -la user_data/ | grep @'
```

### 2. 验证清单

- [ ] 备份已完成
- [ ] 迁移脚本执行成功
- [ ] 新代码部署成功
- [ ] 服务正常启动
- [ ] 用户可以正常登录
- [ ] 简历上传正常
- [ ] 配置保存正常
- [ ] Boss任务正常运行
- [ ] 所有文件在同一目录

### 3. 测试用户流程

```bash
# 1. 登录用户
#    浏览器访问: http://115.190.182.95/login

# 2. 上传简历
#    验证保存路径:
ls -la user_data/luwenrong123_sina_com/candidate_resume.json

# 3. 设置配置
#    验证保存路径:
ls -la user_data/luwenrong123_sina_com/config.json

# 4. 启动Boss任务
#    查看日志，确认能正确读取配置和简历:
journalctl -u zhitoujianli-backend.service -f
```

---

## 🐛 常见问题

### Q1: 迁移失败怎么办？

**A**: 迁移失败不影响系统正常使用，因为代码包含向后兼容逻辑。

```bash
# 查看详细错误日志
cat /tmp/user_data_migration_*.log

# 如果需要回滚
cd /root/zhitoujianli/backend/get_jobs
rm -rf user_data
cp -r user_data_backup_* user_data
```

### Q2: 部分用户数据丢失？

**A**: 检查备份目录，恢复丢失的文件。

```bash
# 查看备份
ls -la user_data_backup_*/luwenrong123@sina.com/

# 恢复特定文件
cp user_data_backup_*/luwenrong123@sina.com/candidate_resume.json \
   user_data/luwenrong123_sina_com/
```

### Q3: 新旧目录都存在怎么办？

**A**: 脚本会自动合并，保留新目录中的文件，只复制旧目录中新的文件。

```bash
# 手动合并（如果需要）
cp -n user_data/luwenrong123@sina.com/* user_data/luwenrong123_sina_com/
```

### Q4: 服务启动失败？

**A**: 检查JAR文件和依赖。

```bash
# 查看错误日志
journalctl -u zhitoujianli-backend.service -n 50 --no-pager

# 检查JAR文件
ls -lh /opt/zhitoujianli/backend/get_jobs-latest.jar

# 验证Java版本
java -version  # 需要 Java 21
```

---

## 📞 应急联系

如果遇到严重问题：

1. **立即停止服务**
```bash
systemctl stop zhitoujianli-backend.service
```

2. **恢复备份**
```bash
cd /root/zhitoujianli/backend/get_jobs
rm -rf user_data
cp -r user_data_backup_manual_* user_data
```

3. **回滚代码**
```bash
ln -sf /opt/zhitoujianli/backend/get_jobs-v2.1.1.jar \
       /opt/zhitoujianli/backend/get_jobs-latest.jar
```

4. **重启服务**
```bash
systemctl start zhitoujianli-backend.service
```

---

## ✅ 部署成功标志

部署成功后，应该看到：

1. **服务正常运行**
```bash
systemctl status zhitoujianli-backend.service
# ● zhitoujianli-backend.service - ZhiTouJianLi Backend Service
#    Loaded: loaded
#    Active: active (running)
```

2. **用户数据统一**
```bash
ls -la user_data/luwenrong123_sina_com/
# -rw-r--r-- candidate_resume.json
# -rw-r--r-- config.json
# -rw-r--r-- default_greeting.json
# -rw-r--r-- boss_cookie.json
```

3. **日志无错误**
```bash
journalctl -u zhitoujianli-backend.service -n 20 --no-pager
# 无 ERROR 或 WARN 级别日志
```

4. **功能正常**
- ✅ 用户登录成功
- ✅ 简历上传正常
- ✅ 配置保存正常
- ✅ Boss任务运行正常

---

**部署完成！** 🎉


