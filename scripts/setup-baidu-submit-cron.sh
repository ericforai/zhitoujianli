#!/bin/bash

###############################################################################
# 百度URL提交Cron定时任务配置脚本
#
# 功能：配置每天自动执行百度URL提交的cron任务
# 默认执行时间：每天凌晨3:00
#
# 作者：ZhiTouJianLi Team
# 日期：2025-01-28
###############################################################################

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 脚本路径
SCRIPT_PATH="/root/zhitoujianli/backend/get_jobs/scripts/submit_baidu_urls.sh"
CRON_SCHEDULE="0 3 * * *"  # 每天凌晨3点执行
CRON_COMMENT="# 百度URL提交定时任务"
LOG_DIR="/root/zhitoujianli/backend/get_jobs/logs"
LOG_FILE="$LOG_DIR/baidu-submit-cron.log"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   百度URL提交Cron定时任务配置${NC}"
echo -e "${BLUE}========================================${NC}"

# 检查脚本文件是否存在
if [ ! -f "$SCRIPT_PATH" ]; then
    echo -e "${RED}错误: 脚本文件不存在${NC}"
    echo -e "${RED}请确认路径: $SCRIPT_PATH${NC}"
    exit 1
fi

# 设置脚本执行权限
chmod +x "$SCRIPT_PATH"
echo -e "${GREEN}✓ 已设置脚本执行权限${NC}"

# 创建日志目录
mkdir -p "$LOG_DIR"
echo -e "${GREEN}✓ 已创建日志目录: $LOG_DIR${NC}"

# 获取当前的crontab
CURRENT_CRON=$(crontab -l 2>/dev/null)

# 检查是否已存在该任务
if echo "$CURRENT_CRON" | grep -q "submit_baidu_urls.sh"; then
    echo -e "${YELLOW}检测到已存在百度URL提交定时任务${NC}"
    echo -e "${YELLOW}是否需要重新配置？ (y/n)${NC}"
    read -r RESPONSE

    if [ "$RESPONSE" != "y" ] && [ "$RESPONSE" != "Y" ]; then
        echo -e "${BLUE}已取消配置${NC}"
        exit 0
    fi

    # 移除旧的cron任务
    CRON_WITHOUT_BAIDU=$(echo "$CURRENT_CRON" | grep -v "submit_baidu_urls.sh" | grep -v "$CRON_COMMENT")
    echo "$CRON_WITHOUT_BAIDU" > /tmp/current_cron
    crontab /tmp/current_cron
    rm /tmp/current_cron
    echo -e "${GREEN}✓ 已移除旧的百度URL提交任务${NC}"
fi

# 构建新的cron任务
NEW_CRON_LINE="$CRON_SCHEDULE $SCRIPT_PATH >> $LOG_FILE 2>&1"

# 添加新的cron任务
(crontab -l 2>/dev/null; echo "$CRON_COMMENT"; echo "$NEW_CRON_LINE") | crontab -

echo -e "${GREEN}✓ Cron任务配置成功！${NC}"
echo ""
echo -e "${BLUE}任务详情:${NC}"
echo -e "  执行时间: ${YELLOW}每天凌晨3:00${NC}"
echo -e "  脚本路径: ${GREEN}$SCRIPT_PATH${NC}"
echo -e "  日志文件: ${GREEN}$LOG_FILE${NC}"
echo ""

# 显示当前的crontab
echo -e "${BLUE}当前Crontab配置:${NC}"
crontab -l
echo ""

echo -e "${GREEN}配置完成！${NC}"
echo -e "${YELLOW}提示: 您可以使用以下命令查看日志:${NC}"
echo -e "  tail -f $LOG_FILE"
echo ""
echo -e "${YELLOW}或手动执行测试:${NC}"
echo -e "  $SCRIPT_PATH"

exit 0

