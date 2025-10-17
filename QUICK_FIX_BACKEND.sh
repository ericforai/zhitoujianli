#!/bin/bash
# 快速修复并启动后端服务

echo "====================================="
echo "智投简历 - 后端快速修复脚本"
echo "====================================="

cd /root/zhitoujianli/backend/get_jobs

echo "1. 尝试构建后端..."
if mvn clean package -DskipTests -Dcheckstyle.skip=true -Dspotbugs.skip=true -Dpmd.skip=true -q; then
    echo "✓ 构建成功！"
    
    echo "2. 停止旧的后端服务..."
    pkill -f "get_jobs-v2.0.1.jar" 2>/dev/null || true
    sleep 2
    
    echo "3. 启动新的后端服务..."
    nohup java -jar target/get_jobs-v2.0.1.jar > logs/backend.log 2>&1 &
    echo $! > backend.pid
    
    echo "4. 等待服务启动..."
    sleep 5
    
    if ps -p $(cat backend.pid) > /dev/null 2>&1; then
        echo "✓ 后端服务启动成功！ (PID: $(cat backend.pid))"
        echo ""
        echo "验证部署:"
        bash /root/zhitoujianli/scripts/verify-env.sh
    else
        echo "✗ 后端服务启动失败，请查看日志:"
        echo "  tail -f logs/backend.log"
        exit 1
    fi
else
    echo "✗ 构建失败"
    echo ""
    echo "请检查代码错误并手动修复，或尝试恢复到之前的版本:"
    echo "  git log --oneline -10"
    echo "  git checkout <commit-hash> -- src/"
    exit 1
fi
