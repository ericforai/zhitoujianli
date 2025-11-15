# 智能打招呼语监控指南

## 📊 实时监控命令

### 方法1: 实时监控日志（推荐）

```bash
LOG_FILE="/root/zhitoujianli/backend/get_jobs/target/logs/job.$(date +%Y-%m-%d).log"
tail -f "$LOG_FILE" | grep --line-buffered -E "【打招呼语】|【智能打招呼】|【完整JD】"
```

### 方法2: 查看最近的打招呼语记录

```bash
LOG_FILE="/root/zhitoujianli/backend/get_jobs/target/logs/job.$(date +%Y-%m-%d).log"
tail -5000 "$LOG_FILE" | grep -E "【打招呼语】|【智能打招呼】|【完整JD】" | tail -50
```

### 方法3: 统计生成情况

```bash
LOG_FILE="/root/zhitoujianli/backend/get_jobs/target/logs/job.$(date +%Y-%m-%d).log"

echo "成功生成次数:"
tail -2000 "$LOG_FILE" | grep -c "【智能打招呼】✅ 成功生成"

echo "JD抓取失败次数:"
tail -2000 "$LOG_FILE" | grep -c "【完整JD】❌ 抓取失败"

echo "JD抓取成功次数:"
tail -2000 "$LOG_FILE" | grep -c "【完整JD】✅ 抓取成功"

echo "JD为空导致失败次数:"
tail -2000 "$LOG_FILE" | grep -c "⚠️ 完整JD为空"
```

## 🔍 关键日志标识

### ✅ 成功流程

```
【打招呼语】开始生成打招呼语，岗位: XXX
【打招呼语】✅ 智能打招呼已启用，开始生成个性化打招呼语
【打招呼语】✅ 获取到用户ID: XXX (来源: 系统属性(boss.user.id))
【打招呼语】✅ 找到简历文件: XXX
【简历信息】职位: XXX, 工作年限: XXX, 技能数: XXX, 核心优势数: XXX
【完整JD】✅ 抓取成功，总长度: XXX字
【智能打招呼】完整JD已获取，长度: XXX字
【智能打招呼】开始调用AI生成，岗位: XXX, JD长度: XXX字
【智能打招呼】✅ 成功生成，长度: XXX字，内容预览: XXX
```

### ❌ 失败流程（JD为空）

```
【完整JD】❌ 抓取失败: Error { TimeoutError }
【完整JD】异常类型: TimeoutError
【打招呼语】开始生成打招呼语，岗位: XXX
【打招呼语】✅ 智能打招呼已启用
【打招呼语】✅ 找到简历文件: XXX
【简历信息】职位: XXX, ...
【智能打招呼】⚠️ 完整JD为空，无法生成个性化打招呼语，使用默认招呼语
```

### ❌ 失败流程（其他原因）

```
【打招呼语】智能打招呼未启用，使用默认招呼语
或
【打招呼语】❌ 未提供用户ID，无法生成智能打招呼语
或
【打招呼语】❌ 未找到简历文件，已尝试的路径: XXX
```

## 📝 监控脚本

创建监控脚本 `/tmp/monitor_greeting.sh`:

```bash
#!/bin/bash
LOG_FILE="/root/zhitoujianli/backend/get_jobs/target/logs/job.$(date +%Y-%m-%d).log"

echo "=== 智能打招呼语实时监控 ==="
echo "日志文件: $LOG_FILE"
echo "监控中... (按 Ctrl+C 停止)"
echo ""

tail -f "$LOG_FILE" 2>/dev/null | grep --line-buffered -E "【打招呼语】|【智能打招呼】|【完整JD】|开始生成打招呼语|成功生成|完整JD为空|JD抓取|找到简历文件"
```

使用方法：
```bash
chmod +x /tmp/monitor_greeting.sh
/tmp/monitor_greeting.sh
```

## 🎯 当前状态

根据监控，Boss进程正在运行，但：
- 投递任务正在处理岗位列表
- 大部分岗位因不包含关键词被跳过
- **需要等待找到匹配的岗位，才会触发打招呼语生成**

## ✅ 验证步骤

1. 等待投递程序找到匹配的岗位
2. 监控日志，等待出现"开始生成打招呼语"的日志
3. 查看完整的生成流程
4. 确认是否成功生成智能打招呼语

## 📊 预期结果

修复后，应该看到：
- `【完整JD】✅ 抓取成功，总长度: XXX字` （而不是❌抓取失败）
- `【智能打招呼】✅ 成功生成，长度: XXX字` （而不是⚠️完整JD为空）

