# 智投简历 - 监控告警系统

**创建时间**: 2025-11-03
**技术栈**: Prometheus + Grafana + Alertmanager

---

## 🚀 快速启动

### 前提条件

1. **Docker和Docker Compose已安装**
2. **智投简历后端服务运行在8080端口**
3. **配置环境变量**（告警邮件）

---

### 启动监控系统

```bash
# 1. 进入项目根目录
cd /root/zhitoujianli

# 2. 启动监控服务
docker-compose -f docker-compose.monitoring.yml up -d

# 3. 检查服务状态
docker-compose -f docker-compose.monitoring.yml ps

# 预期输出：
# zhitoujianli-prometheus    running    0.0.0.0:9090->9090/tcp
# zhitoujianli-grafana       running    0.0.0.0:3000->3000/tcp
# zhitoujianli-alertmanager  running    0.0.0.0:9093->9093/tcp
```

---

## 🌐 访问地址

### Prometheus
- **URL**: http://localhost:9090 或 https://zhitoujianli.com:9090
- **功能**: 查看原始指标、执行PromQL查询、查看告警状态

### Grafana
- **URL**: http://localhost:3000 或 https://zhitoujianli.com:3000
- **登录**: admin / admin123（首次登录后请修改密码）
- **功能**: 可视化Dashboard、告警配置

### Alertmanager
- **URL**: http://localhost:9093
- **功能**: 查看告警历史、配置通知渠道

---

## 📊 Dashboard访问

Grafana默认Dashboard（自动创建）:
1. **系统概览** - 服务状态、API调用统计
2. **多租户安全** - 跨租户访问、未授权访问
3. **性能监控** - 响应时间、数据库性能
4. **资源使用** - CPU、内存、JVM状态

**首次访问**:
1. 打开 http://localhost:3000
2. 登录 (admin/admin123)
3. 左侧菜单 → Dashboards → 智投简历监控

---

## 🔔 告警配置

### 已配置的告警

**安全类（严重）**:
- 未授权访问过多
- 数据访问被拒绝激增
- API错误率过高

**性能类（警告）**:
- API响应时间过长
- 数据库连接池使用率高
- JVM堆内存使用率高
- GC耗时过长

**可用性类（严重）**:
- 服务宕机
- 健康检查失败
- HTTP请求成功率低
- 数据库连接失败

---

## 📧 配置邮件通知

### 1. 修改Alertmanager配置

```bash
# 编辑配置文件
vim /root/zhitoujianli/monitoring/alertmanager/alertmanager.yml

# 修改SMTP配置
global:
  smtp_from: 'your-email@qq.com'
  smtp_auth_username: 'your-email@qq.com'
  smtp_auth_password: 'your-smtp-auth-code'

receivers:
  - name: 'critical-alerts'
    email_configs:
      - to: 'admin@yourdomain.com'  # 修改接收邮箱
```

### 2. 重启Alertmanager

```bash
docker-compose -f docker-compose.monitoring.yml restart alertmanager
```

---

## 🧪 测试告警

### 测试1: 模拟服务宕机

```bash
# 停止后端服务
systemctl stop zhitoujianli-backend

# 等待1-2分钟，应该收到告警邮件：
# "🚨 后端服务宕机！"

# 恢复服务
systemctl start zhitoujianli-backend

# 应该收到恢复通知
```

### 测试2: 模拟未授权访问

```bash
# 发送无Token请求（模拟攻击）
for i in {1..10}; do
  curl -X GET https://zhitoujianli.com/api/config
done

# 应该触发告警：
# "未授权访问过多"
```

---

## 📈 监控指标说明

### API指标

- `api_calls_seconds` - API响应时间
- `api_requests_total` - API请求总数
- `security_unauthorized_total` - 未授权访问次数
- `security_data_access_denied` - 数据访问被拒绝次数

### 系统指标

- `jvm_memory_used_bytes` - JVM内存使用
- `hikaricp_connections_active` - 活跃数据库连接
- `process_cpu_usage` - CPU使用率
- `http_server_requests_seconds` - HTTP请求耗时

### 用户指标

- `user_activity_total` - 用户活跃度

---

## 🔧 常用操作

### 查看实时指标

```bash
# 进入Prometheus容器
docker exec -it zhitoujianli-prometheus sh

# 查询指标
curl http://localhost:9090/api/v1/query?query=up

# 查看告警状态
curl http://localhost:9090/api/v1/alerts
```

### 查看告警历史

```bash
# 访问Alertmanager UI
open http://localhost:9093

# 或通过API
curl http://localhost:9093/api/v2/alerts
```

### 备份Grafana Dashboard

```bash
# 导出Dashboard JSON
curl -u admin:admin123 \
  http://localhost:3000/api/dashboards/db/zhitoujianli-overview \
  > dashboard-backup.json
```

---

## 📋 维护建议

### 日常检查

- [ ] 每天查看Grafana Dashboard
- [ ] 每周查看告警历史
- [ ] 每月审查告警规则

### 数据清理

```bash
# Prometheus数据保留30天（已配置）
# 如需手动清理
docker exec zhitoujianli-prometheus \
  promtool tsdb clean-tombstones /prometheus
```

### 性能优化

- Prometheus数据保留期：30天（可调整）
- 采集间隔：15秒（可调整）
- Grafana刷新间隔：30秒

---

## 🚨 故障排除

### Prometheus无法采集指标

```bash
# 检查后端Actuator端点
curl http://localhost:8080/actuator/prometheus

# 应该返回Prometheus格式的指标数据
```

### Grafana无法连接Prometheus

```bash
# 检查网络
docker network inspect zhitoujianli_monitoring

# 检查Prometheus是否运行
docker logs zhitoujianli-prometheus
```

### 告警未发送

```bash
# 检查Alertmanager日志
docker logs zhitoujianli-alertmanager

# 检查SMTP配置
docker exec zhitoujianli-alertmanager \
  cat /etc/alertmanager/alertmanager.yml
```

---

**文档版本**: v1.0
**最后更新**: 2025-11-03







