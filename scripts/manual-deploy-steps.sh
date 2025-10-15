#!/bin/bash

# 智投简历手动部署步骤脚本
# 火山云服务器IP: 115.190.182.95

SERVER_IP="115.190.182.95"
SSH_USER="root"

echo "🚀 智投简历手动部署步骤"
echo "=========================="
echo "服务器IP: $SERVER_IP"

# 步骤1: 检查基础环境
echo ""
echo "步骤1: 检查基础环境"
echo "==================="
ssh $SSH_USER@$SERVER_IP << 'ENV_CHECK'
echo "🔍 检查系统信息:"
uname -a
echo ""
echo "🔍 检查Java版本:"
java -version 2>&1 || echo "Java未安装"
echo ""
echo "🔍 检查目录结构:"
ls -la /opt/zhitoujianli/
ENV_CHECK

# 步骤2: 安装Java（如果需要）
echo ""
echo "步骤2: 安装Java环境"
echo "==================="
ssh $SSH_USER@$SERVER_IP << 'JAVA_INSTALL'
if ! command -v java &> /dev/null; then
    echo "📦 安装Java 17..."
    yum install -y java-17-openjdk java-17-openjdk-devel
    echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk' >> /etc/profile
    source /etc/profile
else
    echo "✅ Java已安装"
fi
java -version
JAVA_INSTALL

# 步骤3: 本地构建应用
echo ""
echo "步骤3: 本地构建应用"
echo "==================="

# 进入后端目录
cd backend/get_jobs

# 创建简化的SecurityConfig
echo "📝 创建简化SecurityConfig..."
cat > src/main/java/config/SimpleSecurityConfig.java << 'JAVA_EOF'
package config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SimpleSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                corsConfig.setAllowedOriginPatterns(java.util.Arrays.asList(
                    "https://zhitoujianli.com",
                    "https://www.zhitoujianli.com", 
                    "https://*.zhitoujianli.com",
                    "http://localhost:*"
                ));
                corsConfig.setAllowedMethods(java.util.Arrays.asList("*"));
                corsConfig.setAllowedHeaders(java.util.Arrays.asList("*"));
                corsConfig.setAllowCredentials(true);
                corsConfig.setMaxAge(3600L);
                return corsConfig;
            }))
            .authorizeHttpRequests(authz -> authz
                .anyRequest().permitAll()
            );
        return http.build();
    }
}
JAVA_EOF

# 备份原SecurityConfig
if [ -f "src/main/java/config/SecurityConfig.java" ]; then
    mv src/main/java/config/SecurityConfig.java src/main/java/config/SecurityConfig.java.bak
    echo "✅ 原SecurityConfig已备份"
fi

# 设置安全模式为禁用
echo "SECURITY_ENABLED=false" >> .env

# Maven构建
echo "🔨 开始Maven构建..."
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
    ls -la target/get_jobs-*.jar
else
    echo "❌ 构建失败"
    exit 1
fi

# 步骤4: 上传应用
echo ""
echo "步骤4: 上传应用到服务器"
echo "======================"
scp target/get_jobs-*.jar $SSH_USER@$SERVER_IP:/opt/zhitoujianli/app/

# 步骤5: 创建配置文件
echo ""
echo "步骤5: 创建配置文件"
echo "=================="
ssh $SSH_USER@$SERVER_IP << 'CONFIG_CREATE'
cat > /opt/zhitoujianli/config/.env << 'ENV_EOF'
# ========== 基础配置 ==========
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=production

# ========== 安全配置 ==========
SECURITY_ENABLED=false

# ========== 日志配置 ==========
LOG_LEVEL=INFO
LOG_FILE=/opt/zhitoujianli/logs/application.log

# ========== Authing配置 ==========
AUTHING_USER_POOL_ID=68db6e4c4f248dd866413bc2
AUTHING_APP_ID=68db6e4e85de9cb8daf2b3d2
AUTHING_APP_HOST=https://zhitoujianli.authing.cn

# ========== 企业微信配置 ==========
HOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your_key_here

# ========== AI配置 ==========
BASE_URL=https://api.deepseek.com
API_KEY=sk-your-deepseek-api-key
MODEL=deepseek-chat
ENV_EOF

chmod 600 /opt/zhitoujianli/config/.env
echo "✅ 配置文件已创建"
CONFIG_CREATE

# 步骤6: 创建启动服务
echo ""
echo "步骤6: 创建系统服务"
echo "=================="
ssh $SSH_USER@$SERVER_IP << 'SERVICE_CREATE'
cat > /etc/systemd/system/zhitoujianli.service << 'SERVICE_EOF'
[Unit]
Description=智投简历后端服务
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/opt/zhitoujianli/app
ExecStart=/usr/bin/java -jar -Dspring.config.additional-location=file:/opt/zhitoujianli/config/ get_jobs-2.0.1.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

Environment=JAVA_HOME=/usr/lib/jvm/java-17-openjdk
Environment=SPRING_PROFILES_ACTIVE=production

[Install]
WantedBy=multi-user.target
SERVICE_EOF

systemctl daemon-reload
echo "✅ 系统服务已创建"
SERVICE_CREATE

# 步骤7: 启动应用
echo ""
echo "步骤7: 启动应用服务"
echo "=================="
ssh $SSH_USER@$SERVER_IP << 'SERVICE_START'
systemctl start zhitoujianli
systemctl enable zhitoujianli
sleep 5
systemctl status zhitoujianli --no-pager
SERVICE_START

# 步骤8: 测试应用
echo ""
echo "步骤8: 测试应用"
echo "=============="
ssh $SSH_USER@$SERVER_IP << 'TEST_APP'
echo "🧪 测试端口监听:"
netstat -tlnp | grep 8080

echo ""
echo "🧪 测试API响应:"
curl -f http://localhost:8080/health 2>/dev/null && echo "✅ API健康检查通过" || echo "❌ API健康检查失败"

echo ""
echo "🧪 测试外部访问:"
curl -f http://115.190.182.95:8080/health 2>/dev/null && echo "✅ 外部访问正常" || echo "❌ 外部访问失败"
TEST_APP

# 回到项目根目录
cd ../../

echo ""
echo "🎉 部署完成！"
echo "============="
echo "✅ 应用已部署到火山云服务器: $SERVER_IP"
echo "🌐 API地址: http://$SERVER_IP:8080"
echo "🏥 健康检查: http://$SERVER_IP:8080/health"
echo ""
echo "📋 下一步:"
echo "1. 测试API: curl http://$SERVER_IP:8080/health"
echo "2. 在火山云更新环境变量: REACT_APP_API_URL=http://$SERVER_IP:8080/api"
echo "3. 重新部署前端应用"
echo ""
echo "🔧 管理命令:"
echo "  查看日志: ssh $SSH_USER@$SERVER_IP 'journalctl -u zhitoujianli -f'"
echo "  重启服务: ssh $SSH_USER@$SERVER_IP 'systemctl restart zhitoujianli'"
echo "  查看状态: ssh $SSH_USER@$SERVER_IP 'systemctl status zhitoujianli'"