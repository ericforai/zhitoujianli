# 智能打招呼语故障排查指南

## 🎯 快速诊断

如果智能打招呼语没有生效，按以下步骤排查：

### 第一步：确认配置已启用

```bash
# 检查enableSmartGreeting是否为true
grep "enableSmartGreeting" /opt/zhitoujianli/backend/user_data/*/config.json
```

**期望输出**：`"enableSmartGreeting" : true`

---

### 第二步：确认简历文件存在

```bash
# 查找所有用户的简历文件
find /opt/zhitoujianli/backend/user_data -name "candidate_resume.json"
```

**期望输出**：至少一个文件路径

**如果没有输出**：
- 用户还没有上传简历
- 解决：访问前端 `/resume-manager` 页面上传简历

---

### 第三步：检查环境变量（核心修复）

```bash
# 检查环境变量配置
grep -E "USER_DATA_DIR|BOSS_WORK_DIR" /etc/zhitoujianli/backend.env
```

**期望输出**：
```
USER_DATA_DIR=/opt/zhitoujianli/backend/user_data
BOSS_WORK_DIR=/opt/zhitoujianli/backend
```

**如果没有输出**：
```bash
# 添加环境变量
echo "USER_DATA_DIR=/opt/zhitoujianli/backend/user_data" >> /etc/zhitoujianli/backend.env
echo "BOSS_WORK_DIR=/opt/zhitoujianli/backend" >> /etc/zhitoujianli/backend.env

# 重启服务使环境变量生效
systemctl restart zhitoujianli-backend.service
```

---

### 第四步：查看投递日志

```bash
# 查看最近的投递日志
tail -100 /tmp/boss_delivery_*.log | grep "打招呼语"
```

**正常日志**应该包含：
```
【打招呼语】当前工作目录: /opt/zhitoujianli/backend
【打招呼语】用户数据目录: /opt/zhitoujianli/backend/user_data
【打招呼语】✅ 找到简历文件: /opt/zhitoujianli/backend/user_data/xxx/candidate_resume.json
【智能打招呼】开始生成，岗位: xxx
【智能打招呼】调用AI服务，岗位: xxx
【智能打招呼】生成成功，耗时: 6秒，长度: 215字
```

**异常日志**会包含：
```
【打招呼语】❌ 未找到简历文件
【打招呼语】绝对路径列表: /opt/xxx/...
【打招呼语】降级使用默认招呼语
```

---

## 🔍 常见问题详解

### 问题1：日志显示"未找到简历文件"

**症状**：
```
【打招呼语】未找到简历文件，已尝试的路径: user_data/xxx/candidate_resume.json, ...
```

**根本原因**：
- Boss程序使用相对路径查找文件
- 工作目录不是 `/opt/zhitoujianli/backend`

**已修复（v2.2.4+）**：
- 使用环境变量 `USER_DATA_DIR`
- 使用绝对路径查找
- 添加详细的路径诊断日志

**验证修复**：
```bash
# 查看版本
ls -lh /opt/zhitoujianli/backend/get_jobs-latest.jar

# 应该链接到 v2.2.4-greeting-fix.jar 或更新版本
```

---

### 问题2：环境变量不生效

**症状**：
- 已添加环境变量但日志还是显示找不到文件
- 日志中的"用户数据目录"还是错误的路径

**原因**：
- 环境变量未传递给Boss子进程
- systemd服务未重新加载

**解决**：
```bash
# 1. 确认环境变量文件存在
cat /etc/zhitoujianli/backend.env | grep USER_DATA_DIR

# 2. 重启服务（关键！）
systemctl restart zhitoujianli-backend.service

# 3. 验证服务正常
systemctl status zhitoujianli-backend.service
```

**修复说明**：
- v2.2.4版本已修复BossExecutionService
- 现在会自动从 `/etc/zhitoujianli/backend.env` 读取并传递环境变量
- 如果环境变量未设置，使用默认值 `/opt/zhitoujianli/backend/user_data`

---

### 问题3：用户ID格式不匹配

**症状**：
```
【打招呼语】尝试路径: /opt/.../user_data/luwenrong123_sina_com/candidate_resume.json (存在: false)
【打招呼语】尝试路径: /opt/.../user_data/luwenrong123@sina.com/candidate_resume.json (存在: false)
```

**原因**：
- 实际文件夹名与转换后的用户ID不匹配

**解决**：
```bash
# 1. 查看实际文件夹名
ls -d /opt/zhitoujianli/backend/user_data/*/

# 2. 查看config中的userId
grep "userId" /opt/zhitoujianli/backend/user_data/*/config.json

# 3. 如果不匹配，重命名文件夹或更新config.json
```

**用户ID转换规则**：
- `luwenrong123_sina_com` → `luwenrong123@sina.com`
- 系统会自动尝试两种格式

---

## 🧪 手动测试

### 测试智能打招呼是否工作

```bash
# 1. 启动一次投递（前端操作）
# 2. 立即监控日志
tail -f /tmp/boss_delivery_*.log | grep --line-buffered "打招呼\|智能\|AI服务"

# 3. 观察输出
```

**成功标志**：
- 看到"【智能打招呼】调用AI服务"
- 看到"【智能打招呼】生成成功"
- 每个岗位的打招呼语内容不同

**失败标志**：
- 只看到"【打招呼语】未找到简历文件"
- 所有岗位打招呼语完全相同

---

## 🔧 紧急修复脚本

如果智能打招呼完全无法工作，执行以下脚本：

```bash
#!/bin/bash
# 智能打招呼紧急修复脚本

echo "=== 智能打招呼诊断与修复 ==="

# 1. 检查简历文件
echo "1. 检查简历文件..."
RESUME_FILE=$(find /opt/zhitoujianli/backend/user_data -name "candidate_resume.json" | head -1)
if [ -z "$RESUME_FILE" ]; then
    echo "❌ 未找到简历文件，请先上传简历"
    exit 1
else
    echo "✅ 找到简历文件: $RESUME_FILE"
fi

# 2. 检查环境变量
echo "2. 检查环境变量..."
if ! grep -q "USER_DATA_DIR" /etc/zhitoujianli/backend.env; then
    echo "❌ 环境变量未配置，正在修复..."
    echo "USER_DATA_DIR=/opt/zhitoujianli/backend/user_data" >> /etc/zhitoujianli/backend.env
    echo "BOSS_WORK_DIR=/opt/zhitoujianli/backend" >> /etc/zhitoujianli/backend.env
    echo "✅ 环境变量已添加"
else
    echo "✅ 环境变量已配置"
fi

# 3. 检查配置
echo "3. 检查enableSmartGreeting配置..."
if grep -q "\"enableSmartGreeting\" : true" /opt/zhitoujianli/backend/user_data/*/config.json; then
    echo "✅ 智能打招呼已启用"
else
    echo "⚠️ 智能打招呼未启用，请在前端配置中启用"
fi

# 4. 重启服务
echo "4. 重启服务..."
systemctl restart zhitoujianli-backend.service
sleep 20

# 5. 检查服务状态
echo "5. 检查服务状态..."
if systemctl is-active --quiet zhitoujianli-backend.service; then
    echo "✅ 服务运行正常"
else
    echo "❌ 服务启动失败，请查看日志"
    exit 1
fi

echo "=== 修复完成，请启动投递测试 ==="
```

---

## 📈 版本历史

### v2.2.4 (2025-11-05) - 路径修复版

**修复内容**：
1. ✅ 使用绝对路径查找简历文件
2. ✅ 从环境变量读取 `USER_DATA_DIR`
3. ✅ 增强路径诊断日志
4. ✅ 自动降级机制优化

**升级方法**：
```bash
# 1. 添加环境变量
echo "USER_DATA_DIR=/opt/zhitoujianli/backend/user_data" >> /etc/zhitoujianli/backend.env
echo "BOSS_WORK_DIR=/opt/zhitoujianli/backend" >> /etc/zhitoujianli/backend.env

# 2. 重启服务
systemctl restart zhitoujianli-backend.service

# 3. 验证
tail -f /tmp/boss_delivery_*.log | grep "打招呼"
```

---

## 📞 获取帮助

如果以上方法都无法解决问题，请：

1. 收集诊断信息：
```bash
# 创建诊断报告
cat > /tmp/smart_greeting_diagnostic.txt <<EOF
=== 诊断报告 ===
时间: $(date)

1. 服务状态:
$(systemctl status zhitoujianli-backend.service)

2. 简历文件:
$(find /opt/zhitoujianli/backend/user_data -name "*.json")

3. 环境变量:
$(grep -E "USER_DATA_DIR|BOSS_WORK_DIR|API_KEY|DEEPSEEK" /etc/zhitoujianli/backend.env)

4. 最近日志:
$(tail -100 /opt/zhitoujianli/backend/target/logs/job.*.log | grep "打招呼")

5. JAR版本:
$(ls -lh /opt/zhitoujianli/backend/get_jobs-latest.jar)
EOF

cat /tmp/smart_greeting_diagnostic.txt
```

2. 发送诊断报告给技术支持

---

**文档版本**: v2.0
**最后更新**: 2025-11-05
**适用版本**: ≥ v2.2.4


























