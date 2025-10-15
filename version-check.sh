#!/bin/bash

# 版本检查系统
# 定期验证生产环境和测试环境的代码版本一致性

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 配置文件
VERSION_FILE="/root/zhitoujianli/version-info.json"
LOG_FILE="/var/log/zhitoujianli-version-check.log"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   智投简历版本检查系统${NC}"
echo -e "${BLUE}========================================${NC}"

# 函数：记录日志
log_version_check() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 函数：获取Git信息
get_git_info() {
    cd /root/zhitoujianli
    
    local git_hash=$(git rev-parse HEAD)
    local git_branch=$(git branch --show-current)
    local git_commit_date=$(git log -1 --format=%ci)
    local git_commit_message=$(git log -1 --format=%s)
    
    echo "{
        \"hash\": \"$git_hash\",
        \"branch\": \"$git_branch\",
        \"commit_date\": \"$git_commit_date\",
        \"commit_message\": \"$git_commit_message\"
    }"
}

# 函数：获取前端版本信息
get_frontend_version() {
    local build_dir="/root/zhitoujianli/frontend/build"
    local production_dir="/usr/share/nginx/html"
    
    local build_time=""
    local prod_time=""
    
    if [ -f "$build_dir/index.html" ]; then
        build_time=$(stat -c %Y "$build_dir/index.html")
    fi
    
    if [ -f "$production_dir/index.html" ]; then
        prod_time=$(stat -c %Y "$production_dir/index.html")
    fi
    
    # 获取JS文件名（版本标识）
    local build_js=""
    local prod_js=""
    
    if [ -f "$build_dir/index.html" ]; then
        build_js=$(grep -o 'main\.[a-f0-9]*\.js' "$build_dir/index.html" | head -1)
    fi
    
    if [ -f "$production_dir/index.html" ]; then
        prod_js=$(grep -o 'main\.[a-f0-9]*\.js' "$production_dir/index.html" | head -1)
    fi
    
    local synchronized="false"
    if [ "$build_js" = "$prod_js" ]; then
        synchronized="true"
    fi
    
    echo "{
        \"build_time\": $build_time,
        \"production_time\": $prod_time,
        \"build_js\": \"$build_js\",
        \"production_js\": \"$prod_js\",
        \"synchronized\": \"$synchronized\"
    }"
}

# 函数：获取后端版本信息
get_backend_version() {
    local backend_dir="/root/zhitoujianli/backend/get_jobs"
    local jar_file="$backend_dir/target/get_jobs-*.jar"
    
    local build_time=""
    local is_running="false"
    
    if ls $jar_file 1> /dev/null 2>&1; then
        build_time=$(stat -c %Y $jar_file)
    fi
    
    if netstat -tlnp | grep -q ":8080 "; then
        is_running="true"
    fi
    
    echo "{
        \"build_time\": $build_time,
        \"is_running\": $is_running,
        \"pid_file\": \"/root/zhitoujianli/backend.pid\"
    }"
}

# 函数：生成完整版本报告
generate_version_report() {
    local git_info=$(get_git_info)
    local frontend_info=$(get_frontend_version)
    local backend_info=$(get_backend_version)
    
    cat > "$VERSION_FILE" << VERSION_EOF
{
    "timestamp": "$(date -Iseconds)",
    "git": $git_info,
    "frontend": $frontend_info,
    "backend": $backend_info
}
VERSION_EOF
    
    log_version_check "版本报告已生成: $VERSION_FILE"
}

# 函数：检查版本一致性
check_version_consistency() {
    echo -e "${YELLOW}检查版本一致性...${NC}"
    
    local issues=0
    
    # 检查前端同步状态
    local frontend_sync=$(jq -r '.frontend.synchronized' "$VERSION_FILE")
    if [ "$frontend_sync" = "true" ]; then
        echo -e "${GREEN}✓ 前端版本同步${NC}"
    else
        echo -e "${RED}✗ 前端版本不同步${NC}"
        issues=$((issues + 1))
    fi
    
    # 检查后端运行状态
    local backend_running=$(jq -r '.backend.is_running' "$VERSION_FILE")
    if [ "$backend_running" = "true" ]; then
        echo -e "${GREEN}✓ 后端服务运行中${NC}"
    else
        echo -e "${RED}✗ 后端服务未运行${NC}"
        issues=$((issues + 1))
    fi
    
    return $issues
}

# 主函数
main() {
    local start_time=$(date +%s)
    
    log_version_check "开始版本检查"
    
    # 生成版本报告
    generate_version_report
    
    # 检查版本一致性
    if check_version_consistency; then
        echo -e "${GREEN}✓ 所有版本检查通过${NC}"
        log_version_check "版本检查通过"
    else
        echo -e "${RED}✗ 发现版本不一致问题${NC}"
        log_version_check "发现版本不一致问题"
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}🎉 版本检查完成！耗时: ${duration}秒${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    log_version_check "版本检查完成，耗时: ${duration}秒"
}

# 执行主函数
main "$@"
