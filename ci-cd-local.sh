#!/bin/bash

# 本地CI/CD脚本
# 用于快速部署和验证

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   智投简历本地CI/CD脚本${NC}"
echo -e "${BLUE}========================================${NC}"

# 函数：运行测试
run_tests() {
    echo -e "${YELLOW}[1/4] 运行测试...${NC}"
    
    # 前端测试
    cd /root/zhitoujianli/frontend
    echo "前端代码检查..."
    npm run lint
    npm run type-check
    
    # 后端测试
    cd /root/zhitoujianli/backend/get_jobs
    echo "后端测试..."
    mvn test -DskipTests=false
    
    echo -e "${GREEN}✓ 测试完成${NC}"
}

# 函数：构建项目
build_project() {
    echo -e "${YELLOW}[2/4] 构建项目...${NC}"
    
    # 构建前端
    cd /root/zhitoujianli/frontend
    echo "构建前端..."
    npm run build
    
    # 构建博客
    cd /root/zhitoujianli/blog/zhitoujianli-blog
    echo "构建博客..."
    npm run build
    
    # 构建后端
    cd /root/zhitoujianli/backend/get_jobs
    echo "构建后端..."
    mvn clean package -DskipTests
    
    echo -e "${GREEN}✓ 构建完成${NC}"
}

# 函数：部署项目
deploy_project() {
    echo -e "${YELLOW}[3/4] 部署项目...${NC}"
    
    # 执行统一部署
    /root/zhitoujianli/deploy-unified.sh
    
    echo -e "${GREEN}✓ 部署完成${NC}"
}

# 函数：验证部署
verify_deployment() {
    echo -e "${YELLOW}[4/4] 验证部署...${NC}"
    
    # 等待服务启动
    sleep 10
    
    # 检查服务状态
    local services=("后端:8080" "Nginx:80")
    for service in "${services[@]}"; do
        local name=$(echo $service | cut -d: -f1)
        local port=$(echo $service | cut -d: -f2)
        
        if netstat -tlnp | grep -q ":$port "; then
            echo -e "${GREEN}✓ $name 服务正常${NC}"
        else
            echo -e "${RED}✗ $name 服务异常${NC}"
            return 1
        fi
    done
    
    # 测试API
    if curl -s -X POST http://localhost:8080/api/auth/send-verification-code \
       -H "Content-Type: application/json" \
       -d '{"email":"test@example.com"}' | grep -q "success"; then
        echo -e "${GREEN}✓ API测试通过${NC}"
    else
        echo -e "${RED}✗ API测试失败${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✓ 验证完成${NC}"
}

# 主函数
main() {
    local start_time=$(date +%s)
    
    run_tests
    build_project
    deploy_project
    verify_deployment
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}🎉 CI/CD流程完成！耗时: ${duration}秒${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# 执行主函数
main "$@"
