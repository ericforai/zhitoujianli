# 黑名单功能调试指南

## 🔍 当前状态

**问题**: 黑名单配置文件中有数据，但加载结果为0个

**配置文件内容** (`/opt/zhitoujianli/backend/user_data/luwenrong123_sina_com/config.json`):
```json
{
  "blacklistConfig": {
    "companyBlacklist": ["优刻得", "泛微"],
    "positionBlacklist": ["销售"],
    "enableBlacklistFilter": true
  }
}
```

**加载结果**: 公司黑名单=0个, 职位黑名单=0个, 关键词黑名单=0个

---

## ✅ 已完成的修复

1. **修复1**: 黑名单加载优先级（config.json优先，blacklist.json备用）✅
2. **修复2**: 字段名统一（keywordBlacklist → recruiterBlacklist）✅
3. **修复3**: 添加详细调试日志 ✅

---

## 🎯 下一步操作

### 1. **重新启动投递程序**
   - 在前端点击"开始投递"
   - 或者通过API触发投递

### 2. **查看详细日志**
   ```bash
   # 查看最新的Boss程序日志
   tail -200 /tmp/boss_delivery_luwenrong123@sina.com.log | grep -E "黑名单|blacklist|📝"
   ```

### 3. **预期的日志输出**
   ```
   📝 黑名单过滤开关: enableBlacklistFilter=true
   📝 读取公司黑名单: companyBlacklist=[优刻得, 泛微]
   📝 读取职位黑名单: positionBlacklist=[销售]
   📝 读取招聘者黑名单: recruiterBlacklist=null
   📋 黑名单配置加载成功:
     - 公司黑名单: 2 个
     - 职位黑名单: 1 个
     - 关键词黑名单: 0 个
   ```

---

## 🔧 可能的问题

### **问题1**: enableBlacklistFilter=false
- **原因**: 黑名单过滤被禁用
- **解决**: 在前端黑名单设置页面勾选"启用黑名单过滤"

### **问题2**: companyBlacklist=null
- **原因**: JSON解析失败或字段名不匹配
- **解决**: 检查config.json格式是否正确

### **问题3**: companyBlacklist=[] (空数组)
- **原因**: 数据被解析为空数组
- **解决**: 检查getListFromConfig方法

---

## 📝 验证命令

```bash
# 1. 查看配置文件
cat /opt/zhitoujianli/backend/user_data/luwenrong123_sina_com/config.json | jq '.blacklistConfig'

# 2. 查看最新日志
tail -100 /tmp/boss_delivery_luwenrong123@sina.com.log | grep "黑名单"

# 3. 查看服务状态
systemctl status zhitoujianli-backend.service

# 4. 查看JAR版本
readlink -f /opt/zhitoujianli/backend/get_jobs-latest.jar
```

---

## ✅ 成功标志

当黑名单正常工作时，您应该看到：

1. **加载日志显示正确数量**:
   ```
   - 公司黑名单: 2 个  (优刻得, 泛微)
   - 职位黑名单: 1 个  (销售)
   ```

2. **投递过程中跳过黑名单岗位**:
   ```
   【市场总监】第X个岗位：销售总监在黑名单中，跳过
   ```

3. **黑名单公司被过滤**:
   ```
   【市场总监】第X个岗位：公司优刻得在黑名单中，跳过
   ```

---

**⚠️ 重要提醒**: 每次修改黑名单配置后，需要重新启动投递程序才能生效！


















