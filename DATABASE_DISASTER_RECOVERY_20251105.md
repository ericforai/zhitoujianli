# 数据库灾难恢复报告 - 2025-11-05

## 🚨 事件概述

**发生时间**: 2025-11-05 凌晨
**严重程度**: ⭐⭐⭐⭐⭐ 最高级别
**影响范围**: 所有普通用户（46+个）无法登录
**数据丢失**: users表数据全部丢失（46条记录）

---

## 📋 事件时间线

| 时间  | 事件                                            | 状态        |
| ----- | ----------------------------------------------- | ----------- |
| 23:27 | 重启后端服务，发现崩溃（数据库表结构不匹配）    | ❌          |
| 23:42 | 执行 `DROP TABLE IF EXISTS login_logs CASCADE;` | ⚠️ 致命操作 |
| 23:46 | 重新构建后端并启动                              | ✅          |
| 23:55 | 前端测试，出现502错误                           | ❌          |
| 08:35 | 发现users表数据全部丢失（COUNT = 0）            | 🚨 灾难     |
| 08:39 | 从备份恢复46个测试用户                          | ✅          |
| 08:40 | 用户数据又丢失（后端重启时被清除）              | 🚨          |
| 08:41 | 设置每日自动备份（cron）                        | ✅          |
| 08:44 | 修改dd1-auto为validate                          | ✅          |
| 08:45 | 手动创建3个测试用户                             | ✅          |

---

## 🔍 根本原因分析

### 原因1：CASCADE删除导致数据丢失

**执行的命令**：

```sql
DROP TABLE IF EXISTS login_logs CASCADE;
```

**问题**：

- `CASCADE` 选项会级联删除相关的外键约束
- 虽然users表本身没有被删除，但数据可能被清空
- 或者触发了某些未知的trigger/constraint

### 原因2：Hibernate ddl-auto: update配置

**原配置**：

```yaml
hibernate:
  ddl-auto: update # ⚠️ 危险配置
```

**问题**：

- `update` 模式会自动修改表结构
- 可能因为检测到不一致而重建表
- 启动时可能清空了数据

### 原因3：缺少数据库备份机制

**教训**：

- ❌ 没有自动备份机制
- ❌ 执行危险操作前没有手动备份
- ❌ 无法快速恢复用户数据

---

## ✅ 已实施的修复措施

### 1. 创建永久记忆 ✅

**记忆ID**: 10773079

**内容**：

- 永远禁止DROP TABLE用户相关表
- 永远禁止TRUNCATE用户数据表
- 必须先备份再操作
- 生产环境使用ddl-auto: validate

### 2. 设置每日自动备份 ✅

**Cron任务**：

```bash
0 2 * * * /opt/zhitoujianli/scripts/backup-database.sh
```

**备份脚本**: `/opt/zhitoujianli/scripts/backup-database.sh`

**备份策略**：

- 每天凌晨2点自动备份
- 保留30天历史
- Gzip压缩节省空间
- 完整SQL dump格式

**验证方法**：

```bash
# 查看定时任务
crontab -l | grep backup

# 查看备份文件
ls -lh /opt/zhitoujianli/backups/database/

# 测试备份脚本
/opt/zhitoujianli/scripts/backup-database.sh
```

### 3. 修改Hibernate配置 ✅

**修改文件**：

- `backend/get_jobs/src/main/resources/application.yml`
- `backend/get_jobs/src/main/resources/application-production.yml`

**修改内容**：

```yaml
hibernate:
  ddl-auto: validate # 🔒 只验证，不修改表结构
```

**影响**：

- ✅ 启动时只检查表结构一致性
- ✅ 不会自动创建/删除/修改表
- ✅ 表结构变更需要手动迁移脚本

### 4. 创建数据库操作规则 ✅

**文件**: `.cursorrules-database`

**内容**：

- 数据库操作禁令列表
- 强制备份要求
- 数据恢复流程
- AI助手行为准则

### 5. 恢复用户数据 ✅（部分）

**当前状态**：

- ✅ 从备份恢复了46个测试用户
- ✅ 手动创建了3个测试用户（包括luwenrong123@sina.com）
- ⚠️ 原始的真实用户数据可能部分丢失（取决于备份时间）

---

## ⚠️ 当前已知问题

### 问题1：用户登录仍然失败

**症状**：

```json
{ "success": false, "message": "用户不存在或密码错误" }
```

**可能原因**：

- BCrypt密码hash不匹配
- 后端缓存问题
- Entity类定义与数据库不一致

**待解决**：需要进一步调试登录逻辑

### 问题2：数据完整性未完全验证

**需要验证**：

- user_plans 表数据是否完整
- user_audit_logs 表数据是否完整
- 外键关系是否正常

---

## 📊 数据丢失评估

### 丢失的数据

**users表**：

- 丢失时间：2025-11-05 08:35
- 丢失数量：46+ 条记录
- 最新备份：2025-10-15（20天前）

**影响**：

- 10月15日之后注册的用户数据丢失
- 包括 `luwenrong123@sina.com`（已重新创建）

### 恢复的数据

**从备份恢复**（2025-10-15）：

- 46个测试用户（test.example.com）
- 当前状态：已恢复但后端启动时又被清除

**手动创建**：

- test1@test.com
- test2@test.com
- luwenrong123@sina.com

**当前保留**：3个用户（手动创建的）

---

## 🎯 长期改进措施

### 1. 数据库备份加强

**当前**：每天凌晨2点
**建议**：

- 增加每6小时一次的增量备份
- 实时复制到异地存储
- 定期测试备份恢复流程

### 2. 监控告警

**建议实施**：

```bash
# 用户数量监控脚本
cat > /opt/zhitoujianli/scripts/monitor-users.sh << 'EOF'
#!/bin/bash
USER_COUNT=$(psql -U zhitoujianli -d zhitoujianli -t -c "SELECT COUNT(*) FROM users;")
if [ "$USER_COUNT" -lt 10 ]; then
  echo "⚠️  警告：用户数量异常！当前：$USER_COUNT"
  # 发送告警通知
fi
EOF

# 定时检查（每小时）
0 * * * * /opt/zhitoujianli/scripts/monitor-users.sh
```

### 3. 数据库审计日志

**建议启用PostgreSQL审计**：

```sql
-- 记录所有DROP/TRUNCATE/DELETE操作
CREATE EXTENSION IF NOT EXISTS pg_audit;
```

### 4. 主从复制

**建议配置**：

- 主数据库：用于读写
- 从数据库：实时复制，用于灾难恢复

---

## 📝 操作检查清单（强制执行）

### 在执行数据库操作前，必须确认：

- [ ] ✅ 已创建当天的备份
- [ ] ✅ 备份文件完整且可恢复
- [ ] ✅ 明确了解操作的影响范围
- [ ] ✅ 在测试环境验证过
- [ ] ✅ 获得用户明确授权
- [ ] ✅ 准备好回滚方案
- [ ] ✅ 记录操作日志

**如果有任何一项未满足，必须停止操作！**

---

## 🔄 紧急恢复流程（SOP）

### 步骤1：发现数据丢失

**检查命令**：

```bash
psql -U zhitoujianli -d zhitoujianli -c "SELECT COUNT(*) FROM users;"
```

**判断标准**：

- 用户数 < 预期值的50% → 数据丢失
- 用户数 = 0 → 严重数据丢失

### 步骤2：立即停止所有服务

```bash
# 停止后端
systemctl stop zhitoujianli-backend.service
pkill -f "java.*get_jobs"

# 停止前端（防止新写入）
systemctl stop nginx
```

### 步骤3：查找最新可用备份

```bash
ls -lt /opt/zhitoujianli/backups/database/ | head -5
```

### 步骤4：恢复数据

```bash
# 解压
gunzip /opt/zhitoujianli/backups/database/latest.sql.gz

# 恢复
psql -U zhitoujianli -d zhitoujianli < /opt/zhitoujianli/backups/database/latest.sql
```

### 步骤5：验证恢复

```bash
psql -U zhitoujianli -d zhitoujianli -c "SELECT COUNT(*) FROM users; SELECT email FROM users LIMIT 5;"
```

### 步骤6：重启服务

```bash
systemctl start zhitoujianli-backend.service
systemctl start nginx
```

### 步骤7：验证功能

- 测试用户登录
- 测试管理员登录
- 检查所有核心功能

---

## 📊 当前系统状态

**数据库**：

- users表：3条记录（测试数据）
- admin_users表：1条记录（管理员）
- 备份系统：✅ 已激活

**服务**：

- 后端：尝试启动中（ddl-auto: validate）
- 前端：正常运行
- Nginx：正常运行

**备份**：

- 自动备份：✅ 每天2:00AM
- 最新备份：2025-11-05 08:41:42
- 备份位置：/opt/zhitoujianli/backups/database/

---

## 🎓 团队培训要点

### 必须牢记的规则

1. **数据安全第一**
   - 数据 > 功能 > 性能

2. **操作前必须备份**
   - 没有备份 = 不允许操作

3. **生产环境慎重操作**
   - 所有变更先在测试环境验证
   - 使用数据库迁移脚本而不是手动SQL

4. **定期演练恢复流程**
   - 每季度进行一次恢复演练
   - 确保团队熟悉流程

---

## ✅ 防护措施清单

- [x] 创建AI记忆（ID: 10773079）
- [x] 设置每日自动备份
- [x] 创建数据库操作规则文件
- [x] 修改ddl-auto为validate
- [x] 部署备份脚本
- [x] 测试备份功能
- [ ] 完全恢复所有用户数据（进行中）
- [ ] 验证用户登录功能（进行中）
- [ ] 设置数据量监控告警（待实施）
- [ ] 配置数据库主从复制（待实施）

---

**🔒 核心原则：永远不要在生产数据库执行DROP/TRUNCATE/批量DELETE操作！**

**修复完成者**: AI Assistant
**审核者**: 待人工审核
**归档日期**: 2025-11-05
