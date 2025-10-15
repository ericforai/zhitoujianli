#!/bin/bash

# 快速部署工具
# 提供简单的命令行界面来管理部署

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

show_menu() {
    clear
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   智投简历快速部署工具${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "请选择操作："
    echo ""
    echo "1) 完整部署（前端+后端+博客）"
    echo "2) 仅部署前端"
    echo "3) 仅部署后端"
    echo "4) 仅部署博客"
    echo "5) 版本检查"
    echo "6) 部署监控"
    echo "7) 查看部署日志"
    echo "8) 回滚到上一版本"
    echo "9) 退出"
    echo ""
    echo -n "请输入选项 [1-9]: "
}

deploy_frontend() {
    echo -e "${YELLOW}开始部署前端...${NC}"
    cd /root/zhitoujianli/frontend
    
    echo "构建前端..."
    npm run build
    
    echo "复制文件到生产目录..."
    cp -r build/* /usr/share/nginx/html/
    chown -R www-data:www-data /usr/share/nginx/html
    
    echo -e "${GREEN}✓ 前端部署完成${NC}"
}

deploy_backend() {
    echo -e "${YELLOW}开始部署后端...${NC}"
    cd /root/zhitoujianli/backend/get_jobs
    
    # 停止现有服务
    if [ -f "/root/zhitoujianli/backend.pid" ]; then
        kill $(cat /root/zhitoujianli/backend.pid) 2>/dev/null || true
        sleep 3
    fi
    
    echo "构建后端..."
    mvn clean package -DskipTests -Dcheckstyle.skip=true
    
    echo "启动后端服务..."
    nohup mvn spring-boot:run -DskipTests -Dcheckstyle.skip=true > /tmp/backend.log 2>&1 &
    echo $! > /root/zhitoujianli/backend.pid
    
    sleep 5
    echo -e "${GREEN}✓ 后端部署完成${NC}"
}

deploy_blog() {
    echo -e "${YELLOW}开始部署博客...${NC}"
    cd /root/zhitoujianli/blog/zhitoujianli-blog
    
    echo "构建博客..."
    npm run build
    
    echo "复制文件到生产目录..."
    cp -r dist/* /usr/share/nginx/html/
    chown -R www-data:www-data /usr/share/nginx/html
    
    echo -e "${GREEN}✓ 博客部署完成${NC}"
}

rollback_version() {
    echo -e "${YELLOW}回滚到上一版本...${NC}"
    
    # 查找最新的备份
    local latest_backup=$(find /var/www -name "html.backup.*" -type d | sort -r | head -1)
    
    if [ -z "$latest_backup" ]; then
        echo -e "${RED}✗ 未找到备份文件${NC}"
        return 1
    fi
    
    echo "找到备份: $latest_backup"
    echo -n "确认回滚？[y/N]: "
    read confirm
    
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        cp -r "$latest_backup"/* /usr/share/nginx/html/
        chown -R www-data:www-data /usr/share/nginx/html
        echo -e "${GREEN}✓ 回滚完成${NC}"
    else
        echo "已取消"
    fi
}

view_logs() {
    echo -e "${YELLOW}查看部署日志...${NC}"
    echo ""
    echo "1) 部署日志"
    echo "2) 后端日志"
    echo "3) Nginx错误日志"
    echo "4) 版本检查日志"
    echo ""
    echo -n "请选择 [1-4]: "
    read log_choice
    
    case $log_choice in
        1) tail -50 /var/log/zhitoujianli-deploy.log 2>/dev/null || echo "日志文件不存在" ;;
        2) tail -50 /tmp/backend.log 2>/dev/null || echo "日志文件不存在" ;;
        3) tail -50 /var/log/nginx/error.log ;;
        4) tail -50 /var/log/zhitoujianli-version-check.log 2>/dev/null || echo "日志文件不存在" ;;
        *) echo "无效选项" ;;
    esac
}

# 主循环
while true; do
    show_menu
    read choice
    
    case $choice in
        1)
            echo ""
            /root/zhitoujianli/deploy-unified.sh
            echo ""
            echo -n "按Enter键继续..."
            read
            ;;
        2)
            echo ""
            deploy_frontend
            systemctl reload nginx
            echo ""
            echo -n "按Enter键继续..."
            read
            ;;
        3)
            echo ""
            deploy_backend
            echo ""
            echo -n "按Enter键继续..."
            read
            ;;
        4)
            echo ""
            deploy_blog
            systemctl reload nginx
            echo ""
            echo -n "按Enter键继续..."
            read
            ;;
        5)
            echo ""
            /root/zhitoujianli/version-check.sh
            echo ""
            echo -n "按Enter键继续..."
            read
            ;;
        6)
            echo ""
            /root/zhitoujianli/deployment-monitor.sh
            echo ""
            echo -n "按Enter键继续..."
            read
            ;;
        7)
            echo ""
            view_logs
            echo ""
            echo -n "按Enter键继续..."
            read
            ;;
        8)
            echo ""
            rollback_version
            echo ""
            echo -n "按Enter键继续..."
            read
            ;;
        9)
            echo -e "${GREEN}再见！${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}无效选项，请重试${NC}"
            sleep 2
            ;;
    esac
done
