# 多用户模式运维指南

## 日常运维

### 启用/禁用多用户模式

#### 启用多用户模式

```bash
# 1. 编辑配置文件
vi /opt/zhitoujianli/backend/.env

# 修改：SECURITY_ENABLED=false → SECURITY_ENABLED=true

# 2. 重启服务
systemctl restart get_jobs
# 或
ps aux | grep java | grep get_jobs | awk '{print $2}' | xargs kill
cd /opt/zhitoujianli/backend && nohup java -jar get_jobs-v2.0.1.jar > logs/app.log 2>&1 &

# 3. 验证
sleep 10
curl -s http://localhost:8080/api/auth/health | python3 -m json.tool
```

#### 禁用多用户模式（紧急回退）

```bash
# 1. 修改配置
sed -i 's/SECURITY_ENABLED=true/SECURITY_ENABLED=false/' /opt/zhitoujianli/backend/.env

# 2. 重启服务
ps aux | grep java | grep get_jobs | awk '{print $2}' | xargs kill
cd /opt/zhitoujianli/backend && nohup java -jar get_jobs-v2.0.1.jar > logs/app.log 2>&1 &

# 3. 验证立即生效
curl -s http://localhost:8080/api/config | python3 -c "import json,sys; print('UserId:', json.load(sys.stdin).get('userId'))"
# 预期：UserId: default_user
```

### 监控并发用户

#### 查看当前活跃用户

```bash
# 检查用户数据目录
ls -la /opt/zhitoujianli/backend/user_data/ | grep ^d | wc -l

# 检查Cookie文件（代表已登录Boss的用户）
ls -la /tmp/boss_cookies*.json | wc -l

# 检查正在投递的用户（进程监控）
ps aux | grep "BOSS_USER_ID" | grep -v grep | wc -l
```

#### 监控系统资源

```bash
# 内存使用
free -h

# CPU使用
top -bn1 | grep java

# 磁盘使用
df -h /opt/zhitoujianli/backend/user_data/

# 实时监控
watch -n 5 'ps aux | grep java | grep get_jobs'
```

### 用户数据管理

#### 查看用户列表

```bash
# 列出所有用户目录
ls -la /opt/zhitoujianli/backend/user_data/

# 查看用户配置
for user in /opt/zhitoujianli/backend/user_data/user_*/; do
  echo "=== $(basename $user) ==="
  cat "$user/config.json" | python3 -c "import json,sys; data=json.load(sys.stdin); print('Email:', data.get('userEmail')); print('Keywords:', data.get('boss', {}).get('keywords'))"
  echo
done
```

#### 清理用户数据

```bash
# 清理指定用户数据
USER_ID="user_2"
rm -rf /opt/zhitoujianli/backend/user_data/$USER_ID
rm -f /tmp/boss_cookies_$USER_ID.json
rm -f /tmp/boss_delivery_$USER_ID.log

echo "✅ 用户$USER_ID数据已清理"
```

#### 备份用户数据

```bash
# 备份所有用户数据
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backup/user_data_$BACKUP_DATE.tar.gz \
  -C /opt/zhitoujianli/backend \
  user_data/

echo "✅ 备份完成: /backup/user_data_$BACKUP_DATE.tar.gz"

# 恢复备份
tar -xzf /backup/user_data_20251022_100000.tar.gz \
  -C /opt/zhitoujianli/backend/
```

## 故障处理

### 场景1：服务无法启动

**症状**：`java -jar get_jobs-v2.0.1.jar` 启动失败

**排查**：

```bash
# 检查日志
tail -100 /opt/zhitoujianli/backend/logs/app.log

# 检查端口占用
lsof -i:8080

# 检查.env文件格式
cat /opt/zhitoujianli/backend/.env | grep -E "^[A-Z_]+=.*"
```

**解决**：

```bash
# 杀死占用进程
kill -9 $(lsof -ti:8080)

# 重新启动
cd /opt/zhitoujianli/backend && java -jar get_jobs-v2.0.1.jar
```

### 场景2：用户无法保存配置

**症状**：API返回`"保存失败: Permission denied"`

**排查**：

```bash
# 检查目录权限
ls -ld /opt/zhitoujianli/backend/user_data/

# 检查磁盘空间
df -h /opt/zhitoujianli/backend/
```

**解决**：

```bash
# 修复权限
chmod -R 755 /opt/zhitoujianli/backend/user_data/
chown -R root:root /opt/zhitoujianli/backend/user_data/

# 清理磁盘空间（如果满了）
rm -f /tmp/boss_*.log.old
rm -f /opt/zhitoujianli/backend/logs/*.log.*.gz
```

### 场景3：用户登录状态卡死

**症状**：用户A一直提示"登录流程正在进行中"

**排查**：

```bash
# 检查登录状态文件
cat /tmp/boss_login_status.txt

# 检查日志
tail -50 /tmp/boss_login.log | grep "登录"
```

**解决**：

```bash
# 方案1：等待超时自动释放（10分钟）

# 方案2：手动清理登录状态
rm -f /tmp/boss_qrcode.png
rm -f /tmp/boss_login_status.txt

# 方案3：重启服务（最后手段）
systemctl restart get_jobs
```

### 场景4：Cookie文件冲突

**症状**：用户A和用户B使用了同一个Boss账号登录

**排查**：

```bash
# 检查Cookie文件
ls -la /tmp/boss_cookies*.json

# 检查Boss日志
tail -100 /tmp/boss_login.log | grep "Cookie路径"
```

**解决**：

```bash
# 清理所有Cookie文件，让用户重新登录
rm -f /tmp/boss_cookies*.json

echo "✅ 已清理所有Cookie，用户需要重新扫码登录"
```

### 场景5：数据迁移失败

**症状**：首个用户注册后，`user_1`目录为空

**排查**：

```bash
# 检查备份是否存在
ls -la /opt/zhitoujianli/backend/user_data/default_user.backup/

# 检查日志
tail -100 /opt/zhitoujianli/backend/logs/app.log | grep "数据迁移"
```

**解决**：

```bash
# 手动执行数据迁移
cp -r /opt/zhitoujianli/backend/user_data/default_user \
     /opt/zhitoujianli/backend/user_data/user_1

# 更新配置文件中的userId
cd /opt/zhitoujianli/backend/user_data/user_1
sed -i 's/"userId": "default_user"/"userId": "user_1"/' config.json

echo "✅ 手动数据迁移完成"
```

## 性能调优

### 调整并发限制

```bash
# 编辑.env文件
vi /opt/zhitoujianli/backend/.env

# 修改并发数（默认5，建议根据服务器配置调整）
MAX_CONCURRENT_DELIVERIES=10  # 高配置服务器可增加

# 重启服务生效
systemctl restart get_jobs
```

**配置建议**：

| 服务器配置 | 推荐并发数 | 内存需求 |
|-----------|-----------|---------|
| 2核4GB | 3 | ~2.5GB |
| 4核8GB | 5 | ~4GB |
| 8核16GB | 10 | ~7GB |

### 清理历史日志

```bash
# 清理超过7天的日志文件
find /tmp -name "boss_*.log" -mtime +7 -delete
find /opt/zhitoujianli/backend/logs -name "*.log.*" -mtime +7 -delete

# 压缩当前日志
cd /opt/zhitoujianli/backend/logs
for log in *.log; do
  if [ -f "$log" ]; then
    gzip -c "$log" > "$log.$(date +%Y%m%d).gz"
    > "$log"  # 清空但保留文件
  fi
done
```

## 数据备份策略

### 每日备份脚本

创建 `/opt/scripts/backup_user_data.sh`：

```bash
#!/bin/bash
# 智投简历 - 用户数据每日备份

BACKUP_DIR="/backup/zhitoujianli"
DATE=$(date +%Y%m%d)
SOURCE_DIR="/opt/zhitoujianli/backend/user_data"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份用户数据
tar -czf $BACKUP_DIR/user_data_$DATE.tar.gz -C /opt/zhitoujianli/backend user_data/

# 备份Cookie文件
tar -czf $BACKUP_DIR/cookies_$DATE.tar.gz /tmp/boss_cookies*.json 2>/dev/null || true

# 清理超过30天的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "$(date): 备份完成 - $BACKUP_DIR/user_data_$DATE.tar.gz"
```

设置定时任务：

```bash
# 添加到crontab
crontab -e

# 每天凌晨2点执行
0 2 * * * /opt/scripts/backup_user_data.sh >> /var/log/zhitoujianli_backup.log 2>&1
```

### 恢复用户数据

```bash
# 恢复到指定日期的备份
RESTORE_DATE="20251022"
cd /opt/zhitoujianli/backend

# 备份当前数据
mv user_data user_data.old

# 解压备份
tar -xzf /backup/zhitoujianli/user_data_$RESTORE_DATE.tar.gz

echo "✅ 数据已恢复到 $RESTORE_DATE"
```

## 安全加固

### 1. 保护环境变量文件

```bash
# 限制.env文件权限
chmod 600 /opt/zhitoujianli/backend/.env
chown root:root /opt/zhitoujianli/backend/.env

# 禁止普通用户读取
ls -la /opt/zhitoujianli/backend/.env
# 预期：-rw------- 1 root root
```

### 2. 定期审计日志

```bash
# 检查异常登录
grep -i "登录失败\|认证失败" /opt/zhitoujianli/backend/logs/app.log | tail -20

# 检查可疑的userId
grep -E "userId.*(\.\.|/|\\\\)" /opt/zhitoujianli/backend/logs/app.log

# 检查频繁请求（可能的攻击）
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10
```

### 3. 限制API访问频率

在Nginx配置中添加限流：

```nginx
# /etc/nginx/conf.d/zhitoujianli.conf

# 定义限流区域
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=10r/m;  # 认证接口：10次/分钟
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=60r/m;   # 普通API：60次/分钟

location /api/auth/ {
    limit_req zone=auth_limit burst=5 nodelay;
    proxy_pass http://backend_servers;
}

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://backend_servers;
}
```

## 用户管理

### 查看注册用户列表

```bash
# 通过API查询（需要管理员权限）
# 或直接查询数据库

# 查看用户数据目录
ls -la /opt/zhitoujianli/backend/user_data/ | grep "^d"

# 统计用户数
ls -la /opt/zhitoujianli/backend/user_data/ | grep "^d" | grep user_ | wc -l
```

### 禁用用户账号

```bash
# 方案1：删除用户数据（硬删除）
USER_ID="user_3"
mv /opt/zhitoujianli/backend/user_data/$USER_ID \
   /opt/zhitoujianli/backend/user_data/$USER_ID.disabled

# 方案2：数据库软删除（通过API）
# 需要实现管理员API
```

### 重置用户密码

```bash
# 需要通过API或数据库操作
# 示例：使用SQL直接更新（BCrypt加密的密码）

# 生成新密码的Hash
# 需要使用BCrypt工具或Java代码
```

## 系统健康检查

### 每日检查清单

```bash
#!/bin/bash
# 系统健康检查脚本

echo "=== 智投简历系统健康检查 ==="
echo "检查时间: $(date)"
echo

# 1. 服务状态
echo "【服务状态】"
if ps aux | grep java | grep get_jobs | grep -v grep > /dev/null; then
    echo "✅ 后端服务运行中"
else
    echo "❌ 后端服务未运行"
fi

# 2. API健康检查
echo "【API健康】"
HEALTH=$(curl -s http://localhost:8080/api/auth/health | python3 -c "import json,sys; print(json.load(sys.stdin).get('message'))" 2>/dev/null)
if [ "$HEALTH" ]; then
    echo "✅ API响应正常: $HEALTH"
else
    echo "❌ API无响应"
fi

# 3. 磁盘空间
echo "【磁盘空间】"
DISK_USAGE=$(df -h /opt/zhitoujianli/backend | awk 'NR==2 {print $5}' | tr -d '%')
if [ $DISK_USAGE -lt 80 ]; then
    echo "✅ 磁盘使用: ${DISK_USAGE}%"
else
    echo "⚠️  磁盘使用: ${DISK_USAGE}% （需要清理）"
fi

# 4. 内存使用
echo "【内存使用】"
MEM_USAGE=$(free | awk 'NR==2 {printf "%.1f%%", $3/$2*100}')
echo "内存使用: $MEM_USAGE"

# 5. 用户数量
echo "【用户统计】"
USER_COUNT=$(ls -la /opt/zhitoujianli/backend/user_data/ | grep "^d" | grep user_ | wc -l)
echo "注册用户数: $USER_COUNT"

# 6. Cookie文件
echo "【登录状态】"
COOKIE_COUNT=$(ls /tmp/boss_cookies*.json 2>/dev/null | wc -l)
echo "已登录Boss账号数: $COOKIE_COUNT"

echo
echo "=== 检查完成 ==="
```

保存并设置定时任务：

```bash
chmod +x /opt/scripts/health_check.sh
crontab -e

# 每天早上8点执行
0 8 * * * /opt/scripts/health_check.sh | mail -s "智投简历健康报告" admin@zhitoujianli.com
```

## 应急预案

### 应急1：系统负载过高

**触发条件**：CPU >90% 或 内存>90%

**应急操作**：

```bash
# 1. 立即降低并发限制
sed -i 's/MAX_CONCURRENT_DELIVERIES=.*/MAX_CONCURRENT_DELIVERIES=2/' \
  /opt/zhitoujianli/backend/.env

# 2. 重启服务
systemctl restart get_jobs

# 3. 通知用户
# 在前端添加公告："系统维护中，部分功能受限"
```

### 应急2：数据损坏

**触发条件**：配置文件无法解析、格式错误

**应急操作**：

```bash
# 1. 从备份恢复
LATEST_BACKUP=$(ls -t /backup/zhitoujianli/user_data_*.tar.gz | head -1)
echo "使用备份: $LATEST_BACKUP"

# 2. 备份损坏的数据
mv /opt/zhitoujianli/backend/user_data \
   /opt/zhitoujianli/backend/user_data.corrupted.$(date +%Y%m%d%H%M%S)

# 3. 恢复备份
tar -xzf $LATEST_BACKUP -C /opt/zhitoujianli/backend/

# 4. 验证
ls -la /opt/zhitoujianli/backend/user_data/

# 5. 重启服务
systemctl restart get_jobs
```

### 应急3：JWT密钥泄露

**触发条件**：发现JWT_SECRET被公开

**应急操作**：

```bash
# 1. 立即生成新密钥
NEW_SECRET=$(openssl rand -hex 32)

# 2. 更新.env文件
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$NEW_SECRET/" \
  /opt/zhitoujianli/backend/.env

# 3. 重启服务
systemctl restart get_jobs

# 4. 通知所有用户
# - 所有现有Token立即失效
# - 用户需要重新登录
```

## 升级和维护

### 升级多用户功能

#### 更新代码

```bash
# 1. 拉取最新代码
cd /root/zhitoujianli
git pull origin main

# 2. 编译
cd backend/get_jobs
mvn clean package -DskipTests

# 3. 备份当前版本
cp /opt/zhitoujianli/backend/get_jobs-v2.0.1.jar \
   /opt/zhitoujianli/backend/get_jobs-v2.0.1.jar.backup

# 4. 部署新版本
cp target/get_jobs-v2.0.1.jar /opt/zhitoujianli/backend/

# 5. 重启
systemctl restart get_jobs

# 6. 验证
sleep 10
curl -s http://localhost:8080/api/auth/health | python3 -m json.tool
```

#### 回滚到上一个版本

```bash
# 恢复备份
cp /opt/zhitoujianli/backend/get_jobs-v2.0.1.jar.backup \
   /opt/zhitoujianli/backend/get_jobs-v2.0.1.jar

# 重启
systemctl restart get_jobs
```

### 数据库维护（如果使用PostgreSQL）

```bash
# 连接数据库
psql -U postgres -d zhitoujianli

# 查看用户表
SELECT user_id, email, username, email_verified, created_at FROM users;

# 查看审计日志
SELECT * FROM user_audit_logs ORDER BY timestamp DESC LIMIT 20;

# 清理超过90天的审计日志
DELETE FROM user_audit_logs WHERE timestamp < NOW() - INTERVAL '90 days';
```

## 监控告警

### 设置告警规则

使用监控工具（如Prometheus + Grafana）或简单脚本：

```bash
#!/bin/bash
# 告警脚本

# 检查CPU使用率
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "⚠️  CPU使用率过高: ${CPU_USAGE}%" | mail -s "告警：CPU使用率" admin@example.com
fi

# 检查内存使用率
MEM_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3/$2*100}')
if [ $MEM_USAGE -gt 85 ]; then
    echo "⚠️  内存使用率过高: ${MEM_USAGE}%" | mail -s "告警：内存使用率" admin@example.com
fi

# 检查服务是否运行
if ! ps aux | grep java | grep get_jobs | grep -v grep > /dev/null; then
    echo "❌ 后端服务已停止" | mail -s "严重告警：服务停止" admin@example.com
fi
```

定时执行：

```bash
# 每5分钟检查一次
*/5 * * * * /opt/scripts/alert_check.sh
```

## 维护窗口

### 计划停机维护

**通知模板**：

```
亲爱的智投简历用户：

系统将于 2025年10月22日 02:00-04:00 进行例行维护。
维护期间服务将暂停，请您提前保存工作。

维护内容：
- 系统升级
- 数据备份
- 性能优化

预计恢复时间：04:00

感谢您的理解和支持！
智投简历团队
```

**维护步骤**：

```bash
# 1. 停止服务
systemctl stop get_jobs

# 2. 备份数据
/opt/scripts/backup_user_data.sh

# 3. 执行升级
cd /root/zhitoujianli && git pull
cd backend/get_jobs && mvn clean package -DskipTests
cp target/get_jobs-v2.0.1.jar /opt/zhitoujianli/backend/

# 4. 数据库升级（如有）
# psql -U postgres -d zhitoujianli < migration.sql

# 5. 重启服务
systemctl start get_jobs

# 6. 验证
sleep 10
curl -s http://localhost:8080/api/auth/health

# 7. 通知用户维护完成
```

## 运维最佳实践

### DO's ✅

- ✅ 定期备份用户数据（每天）
- ✅ 监控系统资源使用（CPU、内存、磁盘）
- ✅ 查看错误日志（每天）
- ✅ 保持.env文件的权限为600
- ✅ 在测试环境验证后再部署到生产
- ✅ 保留至少3个版本的备份
- ✅ 记录所有变更操作

### DON'Ts ❌

- ❌ 不要直接修改user_data目录下的文件
- ❌ 不要手动删除Cookie文件（除非故障排查）
- ❌ 不要在生产环境直接修改代码
- ❌ 不要忽略告警信息
- ❌ 不要在未备份的情况下执行危险操作
- ❌ 不要将JWT_SECRET提交到代码仓库

## 运维检查清单

### 每日检查

- [ ] 服务运行状态
- [ ] API健康检查
- [ ] 错误日志审查
- [ ] 磁盘空间检查

### 每周检查

- [ ] 数据备份验证
- [ ] 审计日志分析
- [ ] 性能指标回顾
- [ ] 用户数据统计

### 每月检查

- [ ] 安全漏洞扫描
- [ ] 依赖版本更新
- [ ] 数据库优化
- [ ] 清理历史日志

## 联系方式

技术支持：
- 运维团队邮箱：zhitoujianli@qq.com
- 紧急联系电话：138-xxxx-xxxx
- 技术文档：https://docs.zhitoujianli.com/ops

