# 智投简历 - 火山云部署指南

## 📋 概述

本指南将帮助您在火山云上部署智投简历项目，包括前端React应用、后端Spring Boot服务和博客系统。

## 🏗️ 项目架构

```
火山云服务器
├── 前端服务 (React + Nginx) - 端口80
├── 后端服务 (Spring Boot) - 端口8080
├── 博客服务 (Astro + Nginx) - 端口4321
└── 主Nginx代理 - 端口443 (HTTPS)
```

## 🚀 快速部署

### 1. 环境准备

#### 系统要求
- Ubuntu 20.04+ 或 CentOS 8+
- Docker 20.10+
- Docker Compose 2.0+
- 至少2GB内存
- 至少10GB磁盘空间

#### 安装Docker和Docker Compose

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 2. 项目部署

#### 克隆项目
```bash
git clone https://github.com/ericforai/zhitoujianli.git
cd zhitoujianli
```

#### 配置环境变量
```bash
# 复制环境变量模板
cp env.example .env

# 编辑环境变量
vim .env
```

#### 运行部署脚本
```bash
# 在项目根目录执行
./scripts/deploy-to-volcano.sh
```

### 3. 手动部署步骤

如果自动部署脚本失败，可以手动执行以下步骤：

```bash
# 1. 停止现有容器
docker-compose -f volcano-deployment.yml down

# 2. 构建并启动服务
docker-compose -f volcano-deployment.yml up --build -d

# 3. 查看服务状态
docker-compose -f volcano-deployment.yml ps

# 4. 查看日志
docker-compose -f volcano-deployment.yml logs -f
```

## 🌐 域名配置

### 1. 域名解析

在您的域名提供商处添加以下DNS记录：

```
A记录: zhitoujianli.com -> 您的服务器IP
A记录: www.zhitoujianli.com -> 您的服务器IP
```

### 2. SSL证书配置

#### 使用Let's Encrypt免费证书

```bash
# 安装Certbot
sudo apt update
sudo apt install certbot

# 申请证书
sudo certbot certonly --standalone -d zhitoujianli.com -d www.zhitoujianli.com

# 证书文件位置
# /etc/letsencrypt/live/zhitoujianli.com/fullchain.pem
# /etc/letsencrypt/live/zhitoujianli.com/privkey.pem
```

#### 配置Nginx使用SSL证书

```bash
# 创建SSL目录
sudo mkdir -p nginx/ssl

# 复制证书文件
sudo cp /etc/letsencrypt/live/zhitoujianli.com/fullchain.pem nginx/ssl/zhitoujianli.com.crt
sudo cp /etc/letsencrypt/live/zhitoujianli.com/privkey.pem nginx/ssl/zhitoujianli.com.key

# 设置权限
sudo chmod 644 nginx/ssl/zhitoujianli.com.crt
sudo chmod 600 nginx/ssl/zhitoujianli.com.key
```

### 3. 防火墙配置

```bash
# 开放必要端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

## 🔧 服务管理

### 常用命令

```bash
# 查看服务状态
docker-compose -f volcano-deployment.yml ps

# 查看日志
docker-compose -f volcano-deployment.yml logs -f [service_name]

# 重启服务
docker-compose -f volcano-deployment.yml restart [service_name]

# 停止所有服务
docker-compose -f volcano-deployment.yml down

# 停止并删除所有容器和镜像
docker-compose -f volcano-deployment.yml down --rmi all
```

### 服务监控

```bash
# 查看容器资源使用情况
docker stats

# 查看磁盘使用情况
df -h

# 查看内存使用情况
free -h

# 查看系统负载
htop
```

## 🧪 测试部署

### 1. 本地测试

```bash
# 测试前端服务
curl -I http://localhost:80

# 测试后端API
curl -I http://localhost:8080/api/health

# 测试博客服务
curl -I http://localhost:4321/blog
```

### 2. 外网测试

```bash
# 测试域名解析
nslookup zhitoujianli.com

# 测试HTTPS访问
curl -I https://zhitoujianli.com

# 测试API访问
curl -I https://zhitoujianli.com/api/health
```

### 3. 功能测试

1. **前端功能测试**
   - 访问 https://zhitoujianli.com
   - 测试登录功能
   - 测试用户注册
   - 测试智能打招呼功能

2. **后端API测试**
   - 测试用户认证
   - 测试AI接口
   - 测试简历解析

3. **博客功能测试**
   - 访问 https://zhitoujianli.com/blog
   - 测试文章浏览
   - 测试搜索功能

## 🔍 故障排除

### 常见问题

#### 1. 容器启动失败

```bash
# 查看容器日志
docker-compose -f volcano-deployment.yml logs [service_name]

# 检查端口占用
netstat -tlnp | grep :80
netstat -tlnp | grep :8080
netstat -tlnp | grep :4321
```

#### 2. 域名无法访问

```bash
# 检查DNS解析
nslookup zhitoujianli.com

# 检查防火墙
sudo ufw status

# 检查Nginx配置
docker-compose -f volcano-deployment.yml logs nginx
```

#### 3. SSL证书问题

```bash
# 检查证书文件
ls -la nginx/ssl/

# 测试SSL连接
openssl s_client -connect zhitoujianli.com:443 -servername zhitoujianli.com
```

#### 4. API调用失败

```bash
# 检查后端服务
docker-compose -f volcano-deployment.yml logs backend

# 测试API连通性
curl -v http://localhost:8080/api/health

# 检查CORS配置
curl -H "Origin: https://zhitoujianli.com" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: X-Requested-With" -X OPTIONS http://localhost:8080/api/health
```

### 日志分析

```bash
# 查看所有服务日志
docker-compose -f volcano-deployment.yml logs

# 查看特定服务日志
docker-compose -f volcano-deployment.yml logs frontend
docker-compose -f volcano-deployment.yml logs backend
docker-compose -f volcano-deployment.yml logs blog
docker-compose -f volcano-deployment.yml logs nginx

# 实时查看日志
docker-compose -f volcano-deployment.yml logs -f --tail=100
```

## 📊 性能优化

### 1. 容器资源限制

```yaml
# 在volcano-deployment.yml中添加资源限制
services:
  frontend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### 2. Nginx缓存配置

```nginx
# 在nginx配置中添加缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
}
```

### 3. 数据库连接池优化

```yaml
# 在Spring Boot配置中优化连接池
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
```

## 🔄 更新部署

### 1. 代码更新

```bash
# 拉取最新代码
git pull origin main

# 重新构建并部署
docker-compose -f volcano-deployment.yml up --build -d
```

### 2. 配置更新

```bash
# 修改配置文件后重启服务
docker-compose -f volcano-deployment.yml restart [service_name]
```

### 3. 证书更新

```bash
# 更新Let's Encrypt证书
sudo certbot renew

# 重启Nginx服务
docker-compose -f volcano-deployment.yml restart nginx
```

## 📞 技术支持

如果您在部署过程中遇到问题，可以通过以下方式获取帮助：

- 查看项目文档：`docs/` 目录
- 提交Issue：https://github.com/ericforai/zhitoujianli/issues
- 联系技术支持：zhitoujianli@qq.com

---

**文档版本**: v1.0
**创建时间**: 2025-01-27
**维护团队**: ZhiTouJianLi Development Team

