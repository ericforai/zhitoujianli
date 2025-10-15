#!/bin/bash

# 部署状态监控脚本
# 实时监控部署状态和性能

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   智投简历部署状态监控${NC}"
echo -e "${BLUE}========================================${NC}"

# 函数：检查服务状态
check_service_status() {
    echo -e "${YELLOW}检查服务状态...${NC}"
    
    # 检查后端服务
    if netstat -tlnp | grep -q ":8080 "; then
        echo -e "${GREEN}✓ 后端服务运行正常 (端口 8080)${NC}"
    else
        echo -e "${RED}✗ 后端服务未运行${NC}"
    fi
    
    # 检查Nginx服务
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✓ Nginx服务运行正常${NC}"
    else
        echo -e "${RED}✗ Nginx服务异常${NC}"
    fi
    
    # 检查前端文件
    if [ -f "/usr/share/nginx/html/index.html" ]; then
        echo -e "${GREEN}✓ 前端文件存在${NC}"
        local js_file=$(grep -o 'main\.[a-f0-9]*\.js' /usr/share/nginx/html/index.html | head -1)
        echo -e "${BLUE}  前端版本: $js_file${NC}"
    else
        echo -e "${RED}✗ 前端文件缺失${NC}"
    fi
}

# 函数：检查API响应
check_api_responses() {
    echo -e "${YELLOW}检查API响应...${NC}"
    
    # 测试邮箱验证码API
    local response=$(curl -s -w "%{http_code}" -o /tmp/api_response.json \
        -X POST http://localhost:8080/api/auth/send-verification-code \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com"}')
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ 邮箱验证码API正常${NC}"
    else
        echo -e "${RED}✗ 邮箱验证码API异常 (HTTP $response)${NC}"
    fi
}

# 函数：生成监控报告
generate_monitor_report() {
    local report_file="/tmp/deployment-monitor-report.txt"
    
    cat > "$report_file" << REPORT_EOF
智投简历部署监控报告
====================
检查时间: $(date)

服务状态:
- 后端服务: $(netstat -tlnp | grep -q ":8080 " && echo "运行中" || echo "未运行")
- Nginx服务: $(systemctl is-active --quiet nginx && echo "运行中" || echo "异常")
- 前端文件: $([ -f "/usr/share/nginx/html/index.html" ] && echo "存在" || echo "缺失")

Git信息:
- 当前分支: $(cd /root/zhitoujianli && git branch --show-current)
- 最新提交: $(cd /root/zhitoujianli && git log -1 --format=%s)
REPORT_EOF
    
    echo -e "${GREEN}监控报告已生成: $report_file${NC}"
    cat "$report_file"
}

# 主函数
main() {
    check_service_status
    echo ""
    check_api_responses
    echo ""
    generate_monitor_report
}

# 执行主函数
main "$@"
