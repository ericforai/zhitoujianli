#!/bin/bash
# Boss投递监控脚本
# 用于监控Boss投递任务的运行状态和日志

LOG_FILE="/root/zhitoujianli/backend/get_jobs/target/logs/job.$(date +%Y-%m-%d).log"
MONITOR_INTERVAL=5  # 监控间隔（秒）
MAX_MONITOR_TIME=300  # 最大监控时间（秒）

echo "=========================================="
echo "Boss投递任务监控脚本"
echo "=========================================="
echo "日志文件: $LOG_FILE"
echo "监控间隔: ${MONITOR_INTERVAL}秒"
echo "最大监控时间: ${MAX_MONITOR_TIME}秒"
echo "=========================================="
echo ""

# 检查日志文件是否存在
if [ ! -f "$LOG_FILE" ]; then
    echo "⚠️  警告: 日志文件不存在: $LOG_FILE"
    echo "等待日志文件创建..."
    sleep 10
fi

# 记录开始时间
START_TIME=$(date +%s)
LAST_LINE_COUNT=0

# 监控循环
while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))

    # 检查是否超过最大监控时间
    if [ $ELAPSED -gt $MAX_MONITOR_TIME ]; then
        echo ""
        echo "⏰ 已达到最大监控时间（${MAX_MONITOR_TIME}秒），停止监控"
        break
    fi

    # 检查进程是否还在运行
    BOSS_PROCESS=$(ps aux | grep "IsolatedBossRunner" | grep -v grep | wc -l)

    if [ "$BOSS_PROCESS" -eq 0 ]; then
        echo ""
        echo "✅ Boss进程已结束"
        break
    fi

    # 检查日志文件
    if [ -f "$LOG_FILE" ]; then
        CURRENT_LINE_COUNT=$(wc -l < "$LOG_FILE" 2>/dev/null || echo "0")

        # 如果有新日志，显示最新内容
        if [ "$CURRENT_LINE_COUNT" -gt "$LAST_LINE_COUNT" ]; then
            NEW_LINES=$((CURRENT_LINE_COUNT - LAST_LINE_COUNT))
            echo ""
            echo "[$(date '+%H:%M:%S')] 📝 新日志 ($NEW_LINES 行):"
            tail -n "$NEW_LINES" "$LOG_FILE" | grep -E "投递|delivery|成功|失败|ERROR|Exception|完成|跳过" | tail -5
            LAST_LINE_COUNT=$CURRENT_LINE_COUNT
        fi

        # 检查关键状态
        SUCCESS_COUNT=$(grep -c "投递成功\|投递完成" "$LOG_FILE" 2>/dev/null || echo "0")
        FAIL_COUNT=$(grep -c "投递失败\|ERROR\|Exception" "$LOG_FILE" 2>/dev/null || echo "0")
        SKIP_COUNT=$(grep -c "跳过" "$LOG_FILE" 2>/dev/null || echo "0")

        echo -ne "\r[$(date '+%H:%M:%S')] 运行中... 成功: $SUCCESS_COUNT | 失败: $FAIL_COUNT | 跳过: $SKIP_COUNT | 进程: $BOSS_PROCESS"
    fi

    sleep $MONITOR_INTERVAL
done

echo ""
echo ""
echo "=========================================="
echo "监控结束 - 最终统计"
echo "=========================================="

if [ -f "$LOG_FILE" ]; then
    echo "日志文件: $LOG_FILE"
    echo "总行数: $(wc -l < "$LOG_FILE")"
    echo ""
    echo "📊 投递统计:"
    echo "  成功投递: $(grep -c "投递成功\|投递完成" "$LOG_FILE" 2>/dev/null || echo "0")"
    echo "  失败投递: $(grep -c "投递失败" "$LOG_FILE" 2>/dev/null || echo "0")"
    echo "  跳过岗位: $(grep -c "跳过" "$LOG_FILE" 2>/dev/null || echo "0")"
    echo "  错误数量: $(grep -c "ERROR\|Exception" "$LOG_FILE" 2>/dev/null || echo "0")"
    echo ""
    echo "📝 最新日志（最后20行）:"
    tail -20 "$LOG_FILE" | grep -E "投递|delivery|成功|失败|ERROR|Exception|完成|Boss程序" | tail -10
fi

echo ""
echo "=========================================="



