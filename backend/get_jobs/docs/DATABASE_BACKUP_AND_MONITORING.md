# 数据库备份与监控完全指南

## 📋 目录

- [概述](#概述)
- [功能特性](#功能特性)
- [软删除机制](#软删除机制)
- [审计日志系统](#审计日志系统)
- [数据库备份](#数据库备份)
- [数据库恢复](#数据库恢复)
- [连接池监控](#连接池监控)
- [最佳实践](#最佳实践)
- [故障排查](#故障排查)

---

## 概述

本文档详细说明智投简历平台的数据库备份、监控和审计系统的使用方法。

**关键特性：**
- ✅ 用户软删除（支持恢复）
- ✅ 完整的审计日志系统
- ✅ 自动数据库备份
- ✅ HikariCP连接池监控
- ✅ 防暴力破解保护
- ✅ 最后登录跟踪

---

## 功能特性

### 1️⃣ 软删除机制

用户账号支持软删除，删除的用户可以恢复。

**User实体新增字段：**
```java
@Column
private LocalDateTime deletedAt;          // 软删除时间戳

@Column(length = 500)
private String deleteReason;               // 删除原因

@Column
private LocalDateTime lastLoginAt;         // 最后登录时间

@Column(length = 50)
private String lastLoginIp;                // 最后登录IP
```

**核心方法：**
```java
// 软删除用户
user.softDelete("用户申请注销");

// 恢复用户
user.restore();

// 检查是否已删除
boolean isDeleted = user.isDeleted();

// 更新最后登录信息
user.updateLastLogin(clientIp);
```

**UserRepository查询（自动排除已删除用户）：**
```java
// 查找用户（自动排除已删除）
Optional<User> findByEmail(String email);

// 查找用户（包括已删除）
Optional<User> findByEmailIncludingDeleted(String email);

// 查找激活的用户（排除已删除）
Optional<User> findActiveByEmail(String email);
```

**UserService操作：**
```java
// 软删除用户
userService.softDeleteUser(userId, "用户违规");

// 恢复用户
userService.restoreUser(userId);

// 检查用户是否已删除
boolean deleted = userService.isUserDeleted(email);

// 更新最后登录
userService.updateLastLogin(userId, ipAddress);
```

---

### 2️⃣ 审计日志系统

完整记录所有用户操作，用于安全审计和问题排查。

**支持的操作类型：**
- `REGISTER` - 用户注册
- `LOGIN` - 用户登录
- `LOGOUT` - 用户登出
- `FAILED_LOGIN_ATTEMPT` - 登录失败
- `PASSWORD_RESET` - 密码重置
- `PASSWORD_CHANGE` - 密码修改
- `EMAIL_VERIFY` - 邮箱验证
- `ACCOUNT_DELETE` - 账户删除
- `ACCOUNT_RESTORE` - 账户恢复
- `SUSPICIOUS_ACTIVITY` - 可疑活动

**自动记录信息：**
- 用户ID和邮箱
- 操作类型和结果
- IP地址
- User-Agent
- 请求路径
- 失败原因（如果失败）
- 时间戳

**使用示例：**
```java
// 记录成功的操作
auditService.logRegister(user, clientIp, userAgent);
auditService.logLogin(user, clientIp, userAgent);

// 记录失败的操作
auditService.logLoginFailure(email, "密码错误", clientIp, userAgent);
auditService.logFailure(userId, email, ActionType.PASSWORD_RESET,
                       "验证码错误", clientIp, userAgent, "/api/auth/reset");

// 查询审计日志
Page<UserAuditLog> logs = auditService.getUserAuditLogs(userId, page, size);

// 检查可疑活动（防暴力破解）
boolean suspicious = auditService.checkSuspiciousActivity(email, ipAddress);
// 15分钟内失败次数：邮箱>=5次 或 IP>=10次

// 查询最近失败的登录尝试
List<UserAuditLog> failed = auditService.getRecentFailedLoginAttempts(24);

// 清理旧日志（定期执行）
auditService.cleanupOldLogs(90); // 清理90天前的日志
```

**数据库表结构：**
```sql
CREATE TABLE user_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    user_email VARCHAR(100),
    action_type VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    result VARCHAR(20) NOT NULL,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    request_path VARCHAR(200),
    failure_reason VARCHAR(1000),
    extra_data TEXT,
    created_at TIMESTAMP NOT NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at),
    INDEX idx_ip_address (ip_address)
);
```

---

### 3️⃣ 安全增强

**防暴力破解保护：**
```java
// 在登录时自动检查
if (auditService.checkSuspiciousActivity(email, clientIp)) {
    // 返回429 Too Many Requests
    return ResponseEntity.status(429)
        .body(Map.of("success", false,
                    "message", "登录尝试过于频繁，请15分钟后再试"));
}
```

**防护规则：**
- 同一邮箱15分钟内失败5次 → 临时锁定
- 同一IP 15分钟内失败10次 → 临时锁定
- 锁定时间：15分钟

**最后登录跟踪：**
```java
// 登录成功后自动记录
userService.updateLastLogin(user.getUserId(), clientIp);

// 用户实体包含最后登录信息
user.getLastLoginAt();   // 最后登录时间
user.getLastLoginIp();   // 最后登录IP
```

---

## 数据库备份

### 自动备份配置

**1. 配置定时任务（每天凌晨2点自动备份）：**
```bash
cd /root/zhitoujianli/backend/get_jobs/scripts
sudo ./setup_cron_backup.sh
```

**2. 手动执行备份：**
```bash
./backup_database.sh
```

**3. 查看备份日志：**
```bash
tail -f /root/zhitoujianli/backups/backup.log
```

### 备份脚本功能

**自动化流程：**
1. ✅ 使用`pg_dump`导出数据库
2. ✅ 使用`gzip`压缩备份文件
3. ✅ 验证备份文件完整性
4. ✅ 清理超过30天的旧备份
5. ✅ 记录详细日志
6. ✅ 支持通知（邮件/钉钉/企业微信）

**备份配置：**
```bash
# 备份目录
BACKUP_DIR="/root/zhitoujianli/backups/database"

# 保留30天的备份
BACKUP_RETENTION_DAYS=30

# 备份文件命名：zhitoujianli_backup_20251011_020000.sql.gz
```

**修改备份配置：**
```bash
# 编辑备份脚本
vim /root/zhitoujianli/backend/get_jobs/scripts/backup_database.sh

# 修改以下变量
DB_HOST="localhost"           # 数据库主机
DB_PORT="5432"                # 数据库端口
DB_NAME="zhitoujianli"        # 数据库名称
DB_USER="zhitoujianli"        # 数据库用户
BACKUP_RETENTION_DAYS=30      # 保留天数
```

**查看备份文件：**
```bash
ls -lh /root/zhitoujianli/backups/database/
```

---

## 数据库恢复

### 恢复最新备份

```bash
cd /root/zhitoujianli/backend/get_jobs/scripts
./restore_database.sh
```

### 恢复指定备份

```bash
# 使用完整路径
./restore_database.sh /root/zhitoujianli/backups/database/zhitoujianli_backup_20251011_020000.sql.gz

# 或者只使用文件名
./restore_database.sh zhitoujianli_backup_20251011_020000.sql.gz
```

### 恢复流程

**安全机制：**
1. ⚠️ 显示警告信息，要求确认
2. ✅ 自动创建当前数据库的安全备份
3. ✅ 执行数据库恢复
4. ✅ 验证恢复结果
5. ✅ 记录详细日志

**注意事项：**
- 恢复操作会覆盖当前数据库的所有数据
- 恢复前会自动创建安全备份
- 如果恢复失败，可以使用安全备份回滚
- 建议在非生产环境先测试恢复流程

**查看恢复日志：**
```bash
tail -f /root/zhitoujianli/backups/restore.log
```

---

## 连接池监控

### HikariCP配置

**application.yml配置：**
```yaml
spring:
  datasource:
    hikari:
      minimum-idle: 5                    # 最小空闲连接数
      maximum-pool-size: 20              # 最大连接数
      connection-timeout: 30000          # 连接超时（30秒）
      max-lifetime: 1800000              # 最大生命周期（30分钟）
      idle-timeout: 600000               # 空闲超时（10分钟）
      connection-test-query: SELECT 1    # 连接测试查询
      pool-name: ZhiTouJianLi-HikariCP   # 连接池名称
      leak-detection-threshold: 60000    # 连接泄漏检测（60秒）
```

### 监控端点

**Spring Boot Actuator配置：**
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus,hikaricp
  endpoint:
    health:
      show-details: always
  metrics:
    enable:
      hikaricp: true
```

**访问监控端点：**
```bash
# 健康检查
curl http://localhost:8080/actuator/health

# 连接池指标
curl http://localhost:8080/actuator/metrics/hikaricp.connections
curl http://localhost:8080/actuator/metrics/hikaricp.connections.active
curl http://localhost:8080/actuator/metrics/hikaricp.connections.idle
curl http://localhost:8080/actuator/metrics/hikaricp.connections.pending

# Prometheus格式指标
curl http://localhost:8080/actuator/prometheus
```

### 关键指标

**连接池指标：**
- `hikaricp.connections` - 总连接数
- `hikaricp.connections.active` - 活动连接数
- `hikaricp.connections.idle` - 空闲连接数
- `hikaricp.connections.pending` - 等待连接的线程数
- `hikaricp.connections.max` - 最大连接数
- `hikaricp.connections.min` - 最小连接数
- `hikaricp.connections.timeout` - 连接超时次数
- `hikaricp.connections.creation` - 连接创建时间
- `hikaricp.connections.acquire` - 连接获取时间
- `hikaricp.connections.usage` - 连接使用时间

**告警阈值建议：**
- 活动连接数 > 最大连接数的80% → 需要扩容
- 等待连接的线程数 > 0 → 连接池不足
- 连接超时次数 > 0 → 数据库响应慢
- 连接获取时间 > 100ms → 性能问题

---

## 最佳实践

### 1. 备份策略

**推荐配置：**
- ✅ 每天自动备份（凌晨2点）
- ✅ 保留30天的备份
- ✅ 定期测试恢复流程（每月一次）
- ✅ 重要操作前手动备份
- ✅ 备份文件异地存储（可选）

**备份验证：**
```bash
# 每月执行一次恢复测试（测试环境）
./restore_database.sh
```

### 2. 审计日志管理

**日志清理策略：**
```java
// 定期清理旧日志（保留90天）
@Scheduled(cron = "0 0 3 * * *")  // 每天凌晨3点执行
public void cleanupAuditLogs() {
    auditService.cleanupOldLogs(90);
}
```

**重要日志保留：**
- 登录失败记录 - 保留180天
- 账户删除记录 - 永久保留
- 安全事件记录 - 永久保留

### 3. 连接池优化

**配置原则：**
```
maximum-pool-size = ((CPU核心数 * 2) + 磁盘数量)
minimum-idle = maximum-pool-size / 2
```

**示例：**
- 4核CPU + 1块磁盘 → maximum-pool-size = 10
- 8核CPU + 2块磁盘 → maximum-pool-size = 18

**监控告警：**
- 设置Prometheus + Grafana监控
- 活动连接数告警 > 80%
- 连接超时告警 > 0

### 4. 安全建议

**密码策略：**
- ✅ 最小长度6位（建议8位）
- ✅ BCrypt加密存储
- ✅ 防暴力破解保护

**审计建议：**
- ✅ 记录所有认证操作
- ✅ 记录敏感数据修改
- ✅ 定期审查可疑活动
- ✅ 导出重要日志归档

---

## 故障排查

### 备份失败

**问题：备份脚本执行失败**

**排查步骤：**
```bash
# 1. 检查PostgreSQL服务
systemctl status postgresql

# 2. 检查数据库连接
PGPASSWORD=zhitoujianli123 psql -h localhost -U zhitoujianli -d zhitoujianli -c "SELECT 1"

# 3. 检查磁盘空间
df -h /root/zhitoujianli/backups

# 4. 查看备份日志
tail -100 /root/zhitoujianli/backups/backup.log

# 5. 手动测试备份
cd /root/zhitoujianli/backend/get_jobs/scripts
./backup_database.sh
```

### 恢复失败

**问题：数据库恢复失败**

**排查步骤：**
```bash
# 1. 检查备份文件完整性
gzip -t /root/zhitoujianli/backups/database/backup_file.sql.gz

# 2. 手动解压查看
gunzip -c backup_file.sql.gz | less

# 3. 查看恢复日志
tail -100 /root/zhitoujianli/backups/restore.log

# 4. 使用安全备份回滚
./restore_database.sh safety_backup_YYYYMMDD_HHMMSS.sql.gz
```

### 连接池耗尽

**问题：数据库连接池耗尽**

**症状：**
- 应用响应缓慢
- 日志显示连接超时
- `hikaricp.connections.pending` > 0

**解决方案：**
```yaml
# 1. 临时增加连接池大小
spring:
  datasource:
    hikari:
      maximum-pool-size: 30  # 从20增加到30

# 2. 检查是否有连接泄漏
leak-detection-threshold: 30000  # 30秒（调试用）

# 3. 优化慢查询
# 查看慢查询日志
tail -f logs/zhitoujianli.log | grep "org.hibernate.SQL"

# 4. 检查长时间未提交的事务
SELECT * FROM pg_stat_activity WHERE state = 'idle in transaction';
```

### 审计日志查询慢

**问题：审计日志查询性能差**

**优化方案：**
```sql
-- 1. 检查索引
SELECT * FROM pg_indexes WHERE tablename = 'user_audit_logs';

-- 2. 添加缺失的索引
CREATE INDEX idx_created_at ON user_audit_logs(created_at);
CREATE INDEX idx_user_email ON user_audit_logs(user_email);

-- 3. 定期清理旧数据
DELETE FROM user_audit_logs WHERE created_at < NOW() - INTERVAL '90 days';

-- 4. 考虑分区表（数据量大时）
CREATE TABLE user_audit_logs_2025 PARTITION OF user_audit_logs
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

---

## 快速参考

### 常用命令

```bash
# 备份相关
./backup_database.sh                    # 手动备份
./restore_database.sh                   # 恢复最新备份
./setup_cron_backup.sh                  # 配置定时备份
tail -f /root/zhitoujianli/backups/backup.log  # 查看备份日志

# 数据库操作
PGPASSWORD=zhitoujianli123 psql -h localhost -U zhitoujianli -d zhitoujianli
\dt                                     # 列出所有表
\d users                                # 查看users表结构
\d user_audit_logs                      # 查看审计日志表结构
SELECT COUNT(*) FROM users;             # 统计用户数
SELECT COUNT(*) FROM user_audit_logs;   # 统计审计日志数

# 监控相关
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/metrics/hikaricp.connections.active
```

### 重要文件位置

```
/root/zhitoujianli/
├── backend/get_jobs/
│   ├── src/main/java/
│   │   ├── entity/
│   │   │   ├── User.java              # 用户实体（包含软删除）
│   │   │   └── UserAuditLog.java      # 审计日志实体
│   │   ├── repository/
│   │   │   ├── UserRepository.java    # 用户仓库
│   │   │   └── UserAuditLogRepository.java  # 审计日志仓库
│   │   ├── service/
│   │   │   ├── UserService.java       # 用户服务
│   │   │   └── UserAuditService.java  # 审计服务
│   │   └── util/
│   │       └── RequestUtil.java       # 请求工具类
│   ├── scripts/
│   │   ├── backup_database.sh         # 备份脚本
│   │   ├── restore_database.sh        # 恢复脚本
│   │   └── setup_cron_backup.sh       # 定时任务配置
│   └── src/main/resources/
│       └── application.yml            # 配置文件
└── backups/
    ├── database/                      # 备份文件目录
    ├── backup.log                     # 备份日志
    └── restore.log                    # 恢复日志
```

---

## 更新日志

**v1.0.0 (2025-10-11)**
- ✅ 实现用户软删除机制
- ✅ 实现完整的审计日志系统
- ✅ 添加HikariCP连接池监控
- ✅ 创建自动备份脚本和定时任务
- ✅ 添加防暴力破解保护
- ✅ 实现最后登录跟踪

---

## 技术支持

如有问题，请联系：
- 📧 Email: zhitoujianli@qq.com
- 📚 文档: https://github.com/ericforai/zhitoujianli
- 🐛 Bug报告: https://github.com/ericforai/zhitoujianli/issues

---

**ZhiTouJianLi Team** | 2025-10-11

