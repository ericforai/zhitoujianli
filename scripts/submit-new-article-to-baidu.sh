#!/bin/bash
# 百度搜索引擎 - 新文章提交脚本
# 创建时间: 2025-11-11
# 用途: 提交新博客文章到百度搜索引擎收录

set -e

# 配置信息
SITE="blog.zhitoujianli.com"
TOKEN="YOUR_BAIDU_TOKEN"  # 需要从百度站长平台获取
BAIDU_API="http://data.zz.baidu.com/urls?site=${SITE}&token=${TOKEN}"

# 新文章URL
NEW_ARTICLE_URL="https://blog.zhitoujianli.com/college-graduate-job-hunting-2025/"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}    百度搜索引擎 - 新文章提交工具${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# 检查Token是否已设置
if [ "$TOKEN" == "YOUR_BAIDU_TOKEN" ]; then
    echo -e "${RED}❌ 错误：请先设置百度站长平台Token${NC}"
    echo ""
    echo -e "${YELLOW}📝 获取Token步骤：${NC}"
    echo "1. 访问百度站长平台: https://ziyuan.baidu.com/"
    echo "2. 登录并进入「数据引入」→「链接提交」"
    echo "3. 选择「主动推送」标签"
    echo "4. 复制Token（在接口调用地址中）"
    echo "5. 编辑此脚本，将 YOUR_BAIDU_TOKEN 替换为实际Token"
    echo ""
    echo -e "${BLUE}接口地址示例：${NC}"
    echo "http://data.zz.baidu.com/urls?site=blog.zhitoujianli.com&token=YOUR_ACTUAL_TOKEN"
    echo ""
    exit 1
fi

# 创建临时文件
TEMP_FILE=$(mktemp)
echo "$NEW_ARTICLE_URL" > "$TEMP_FILE"

echo -e "${YELLOW}📤 正在提交新文章到百度...${NC}"
echo -e "${BLUE}URL: ${NEW_ARTICLE_URL}${NC}"
echo ""

# 提交到百度
RESPONSE=$(curl -s -H 'Content-Type:text/plain' --data-binary @"$TEMP_FILE" "$BAIDU_API")

# 清理临时文件
rm -f "$TEMP_FILE"

# 解析响应
echo -e "${GREEN}✅ 提交完成！${NC}"
echo ""
echo -e "${YELLOW}📊 百度API响应：${NC}"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# 检查是否成功
if echo "$RESPONSE" | grep -q "success"; then
    SUCCESS_COUNT=$(echo "$RESPONSE" | jq -r '.success' 2>/dev/null || echo "1")
    REMAIN_QUOTA=$(echo "$RESPONSE" | jq -r '.remain' 2>/dev/null || echo "未知")

    echo -e "${GREEN}🎉 提交成功！${NC}"
    echo -e "${GREEN}   ✓ 成功提交: ${SUCCESS_COUNT} 个URL${NC}"
    echo -e "${GREEN}   ✓ 剩余配额: ${REMAIN_QUOTA}${NC}"
    echo ""

    # 提供后续建议
    echo -e "${YELLOW}📝 后续操作建议：${NC}"
    echo "1. 【3天后检查】访问百度站长平台查看收录状态"
    echo "2. 【1周后验证】搜索: site:blog.zhitoujianli.com 大学生求职"
    echo "3. 【监控索引】定期查看「数据监控」→「索引量」"
    echo ""

    # 创建提交记录
    LOG_DIR="/var/log/baidu-submit"
    mkdir -p "$LOG_DIR"
    LOG_FILE="$LOG_DIR/submit-history.log"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS - $NEW_ARTICLE_URL" >> "$LOG_FILE"

    echo -e "${BLUE}📄 提交记录已保存到: ${LOG_FILE}${NC}"
else
    echo -e "${RED}❌ 提交可能失败，请检查响应信息${NC}"

    # 常见错误提示
    echo ""
    echo -e "${YELLOW}🔍 常见问题排查：${NC}"
    echo "1. Token是否正确？"
    echo "2. 每日配额是否用完？"
    echo "3. URL格式是否正确？"
    echo "4. 网络连接是否正常？"
    echo ""

    # 记录失败
    LOG_DIR="/var/log/baidu-submit"
    mkdir -p "$LOG_DIR"
    LOG_FILE="$LOG_DIR/submit-history.log"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] FAILED - $NEW_ARTICLE_URL - Response: $RESPONSE" >> "$LOG_FILE"
fi

echo -e "${BLUE}================================================${NC}"
echo ""

# 提供手动提交链接
echo -e "${YELLOW}💡 也可以手动提交：${NC}"
echo "访问: https://ziyuan.baidu.com/linksubmit/url"
echo "粘贴URL: $NEW_ARTICLE_URL"
echo ""

