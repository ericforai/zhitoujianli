# 智投简历 - 开发环境设置指南

## 📋 概述

本文档说明如何在**本地电脑**配置开发环境，与生产服务器环境完全分离，降低开发风险。

## 🎯 环境分离策略

### 开发环境（本地电脑）

- **位置**: 本地电脑任意目录（如 `~/projects/zhitoujianli` 或 `D:\projects\zhitoujianli`）
- **用途**: 日常开发和测试
- **端口**:
  - 前端: `3000`
  - 后端: `8080`
- **数据库**: 本地PostgreSQL（可独立或连接测试数据库）
- **配置**: Spring Profile = `dev`
- **访问**: `http://localhost:3000`

### 生产环境（服务器）

- **位置**: 服务器 `/root/zhitoujianli` 或 `/opt/zhitoujianli`
- **用途**: 线上服务
- **端口**:
  - 前端: `80/443` (Nginx)
  - 后端: `8080` (systemd服务)
- **数据库**: 生产PostgreSQL
- **配置**: Spring Profile = `prod`
- **访问**: `https://www.zhitoujianli.com`

## 🚀 快速开始

### 1. 在本地电脑克隆代码

**Windows (Git Bash / PowerShell):**

```bash
# 选择项目目录
cd ~/projects  # 或 D:\projects

# 克隆代码
git clone git@github.com:ericforai/zhitoujianli.git
cd zhitoujianli
```

**Mac / Linux:**

```bash
# 选择项目目录
cd ~/projects

# 克隆代码
git clone git@github.com:ericforai/zhitoujianli.git
cd zhitoujianli
```

### 2. 安装依赖

**后端依赖（Java + Maven）:**

- 安装 Java 21: https://adoptium.net/
- 安装 Maven: https://maven.apache.org/download.cgi
- 安装 PostgreSQL: https://www.postgresql.org/download/

**前端依赖（Node.js）:**

- 安装 Node.js 18+: https://nodejs.org/
- 安装 npm（通常随Node.js一起安装）

```bash
# 验证安装
java -version  # 应该显示 Java 21
mvn -version   # 应该显示 Maven 3.8+
node -v        # 应该显示 v18+
npm -v         # 应该显示 9+
```

### 3. 配置开发环境

#### 3.1 创建开发环境变量文件

**Windows (Git Bash):**

```bash
cd ~/projects/zhitoujianli

# 复制环境变量模板（注意：使用 env.example，不是 .env.example）
cp env.example .env.dev

# 如果 env.example 不存在，检查是否有 .env.example
# cp .env.example .env.dev
```

**Mac / Linux:**

```bash
cd ~/projects/zhitoujianli

# 复制环境变量模板（注意：使用 env.example，不是 .env.example）
cp env.example .env.dev

# 如果 env.example 不存在，检查是否有 .env.example
# cp .env.example .env.dev
```

编辑 `.env.dev` 文件（使用你喜欢的编辑器）：

```bash
# 开发环境配置
SPRING_PROFILES_ACTIVE=dev
APP_ENV=dev

# 数据库配置（可以使用本地数据库或共享生产数据库）
DATABASE_URL=jdbc:postgresql://localhost:5432/zhitoujianli
DB_USERNAME=zhitoujianli
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=dev_secret_key_for_local_development_only_12345678901234567890
JWT_EXPIRATION=86400000

# DeepSeek AI配置
BASE_URL=https://api.deepseek.com
API_KEY=your_deepseek_api_key_here
MODEL=deepseek-chat

# 安全配置
SECURITY_ENABLED=true
```

#### 3.2 配置数据库（本地）

**创建本地数据库：**

```bash
# 连接到PostgreSQL
psql -U postgres

# 创建数据库和用户
CREATE DATABASE zhitoujianli;
CREATE USER zhitoujianli WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE zhitoujianli TO zhitoujianli;
\q
```

**或者使用现有数据库：**

- 如果已有测试数据库，直接修改 `.env.dev` 中的数据库连接信息

#### 3.3 配置前端开发环境

前端会自动检测环境，开发环境使用：

- API地址: `http://localhost:8080/api`
- WebSocket: `ws://localhost:8080/ws`

### 4. 启动开发环境

#### 方式1: 使用自动化脚本（推荐）

**Windows (Git Bash):**

```bash
cd ~/projects/zhitoujianli
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

**Mac / Linux:**

```bash
cd ~/projects/zhitoujianli
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

**停止开发环境：**

```bash
./scripts/stop-dev.sh
```

#### 方式2: 手动启动（两个终端窗口）

**终端1 - 启动后端：**

```bash
cd ~/projects/zhitoujianli/backend/get_jobs

# Windows (Git Bash)
export SPRING_PROFILES_ACTIVE=dev
mvn spring-boot:run

# Mac / Linux
SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run
```

**终端2 - 启动前端：**

```bash
cd ~/projects/zhitoujianli/frontend

# Windows (Git Bash)
export REACT_APP_ENV=development
export REACT_APP_API_URL=http://localhost:8080/api
npm start

# Mac / Linux
REACT_APP_ENV=development REACT_APP_API_URL=http://localhost:8080/api npm start
```

### 5. 访问开发环境

- **前端**: http://localhost:3000
- **后端API**: http://localhost:8080/api
- **健康检查**: http://localhost:8080/api/auth/health

## 📝 开发工作流程

### 日常开发流程

1. **拉取最新代码**

   ```bash
   cd ~/projects/zhitoujianli
   git pull origin main
   ```

2. **启动开发环境**

   ```bash
   ./scripts/start-dev.sh
   # 或手动启动（见上方）
   ```

3. **进行开发**
   - 修改代码
   - 前端自动热重载（React开发服务器）
   - 后端需要重启（修改Java代码后）
   - 查看日志

4. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 新功能描述"
   git push origin main
   ```

### 部署到生产环境

代码推送到GitHub后，在**服务器**上执行部署：

```bash
# 在服务器上执行
cd /root/zhitoujianli
git pull origin main
./deploy-frontend.sh
./scripts/deploy-backend.sh
```

详见 [生产环境部署指南](./PRODUCTION_DEPLOYMENT.md)

## 🔧 开发环境配置说明

### Spring Boot配置

开发环境使用 `application-dev.yml`，主要特点：

- **数据库**: 允许自动更新表结构 (`ddl-auto: update`)
- **日志**: 详细日志输出，包括SQL语句
- **CORS**: 允许所有来源（便于开发调试）
- **端口**: 8080

### 前端配置

开发环境自动检测，使用：

- `REACT_APP_ENV=development`
- `REACT_APP_API_URL=http://localhost:8080/api`
- 热重载支持
- Source Map启用

## 🐛 常见问题

### 1. 端口被占用

**Windows:**

```bash
# 检查端口占用
netstat -ano | findstr :8080
netstat -ano | findstr :3000

# 停止占用端口的进程（替换PID为实际进程ID）
taskkill /PID <PID> /F
```

**Mac / Linux:**

```bash
# 检查端口占用
lsof -i :8080
lsof -i :3000

# 停止占用端口的进程
kill -9 <PID>
```

### 2. 数据库连接失败

**Windows:**

```bash
# 检查PostgreSQL服务状态（以管理员身份运行）
sc query postgresql-x64-XX  # XX是版本号

# 启动PostgreSQL服务
net start postgresql-x64-XX

# 测试连接
psql -h localhost -U zhitoujianli -d zhitoujianli
```

**Mac:**

```bash
# 检查PostgreSQL状态
brew services list | grep postgresql

# 启动PostgreSQL
brew services start postgresql

# 测试连接
psql -h localhost -U zhitoujianli -d zhitoujianli
```

**Linux:**

```bash
# 检查PostgreSQL状态
sudo systemctl status postgresql

# 启动PostgreSQL
sudo systemctl start postgresql

# 测试连接
psql -h localhost -U zhitoujianli -d zhitoujianli
```

### 3. 前端无法连接后端

- 检查后端是否启动: `curl http://localhost:8080/api/auth/health`
- 检查CORS配置
- 检查浏览器控制台错误

### 4. 环境变量未生效

- 确保 `.env.dev` 文件存在
- 检查环境变量格式（无空格，无引号）
- 重启服务

## 📚 相关文档

- [本地开发快速开始](./LOCAL_DEVELOPMENT_QUICK_START.md) - 5分钟快速搭建
- [生产环境部署指南](./PRODUCTION_DEPLOYMENT.md)
- [API文档](./API_DOCUMENTATION.md)
- [故障排除指南](./TROUBLESHOOTING.md)



