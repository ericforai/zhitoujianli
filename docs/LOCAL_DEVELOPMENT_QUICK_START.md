# 本地开发环境快速开始指南

## 🎯 目标

在**本地电脑**上搭建开发环境，与生产服务器完全分离。

## 📋 前置要求

### 必需软件

1. **Git** - 代码版本控制
   - Windows: https://git-scm.com/download/win
   - Mac: `brew install git`
   - Linux: `sudo apt install git`

2. **Java 21** - 后端运行环境
   - 下载: https://adoptium.net/
   - 验证: `java -version`

3. **Maven 3.8+** - Java构建工具
   - 下载: https://maven.apache.org/download.cgi
   - 验证: `mvn -version`

4. **Node.js 18+** - 前端运行环境
   - 下载: https://nodejs.org/
   - 验证: `node -v` 和 `npm -v`

5. **PostgreSQL** - 数据库
   - Windows: https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt install postgresql`

## 🚀 5分钟快速开始

### 步骤1: 克隆代码

```bash
# 选择项目目录
cd ~/projects  # 或 Windows: cd D:\projects

# 克隆代码
git clone git@github.com:ericforai/zhitoujianli.git
cd zhitoujianli
```

### 步骤2: 配置环境变量

```bash
# 确保在项目根目录
cd ~/projects/zhitoujianli  # 或你的项目路径

# 复制环境变量模板（使用 env.example，注意没有点号）
cp env.example .env.dev

# 如果 env.example 不存在，检查是否有 .env.example
# cp .env.example .env.dev

# 编辑配置文件（使用你喜欢的编辑器）
# Windows: notepad .env.dev
# Mac: open -e .env.dev 或 code .env.dev
# Linux: nano .env.dev 或 vim .env.dev
```

**最小配置（.env.dev）:**

```bash
SPRING_PROFILES_ACTIVE=dev
APP_ENV=dev

# 数据库配置（根据你的本地数据库修改）
DATABASE_URL=jdbc:postgresql://localhost:5432/zhitoujianli
DB_USERNAME=zhitoujianli
DB_PASSWORD=your_password

# DeepSeek API（必需）
API_KEY=your_deepseek_api_key_here
```

### 步骤3: 设置数据库

```bash
# 连接到PostgreSQL
psql -U postgres

# 在PostgreSQL中执行
CREATE DATABASE zhitoujianli;
CREATE USER zhitoujianli WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE zhitoujianli TO zhitoujianli;
\q
```

### 步骤4: 安装依赖

**后端依赖:**

```bash
cd backend/get_jobs
mvn clean install -DskipTests
```

**前端依赖:**

```bash
cd frontend
npm install
```

### 步骤5: 启动服务

**方式1: 使用脚本（推荐）**

```bash
# 回到项目根目录
cd ~/projects/zhitoujianli

# 启动开发环境
./scripts/start-dev.sh
```

**方式2: 手动启动（两个终端）**

**终端1 - 后端:**

```bash
cd backend/get_jobs
SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run
```

**终端2 - 前端:**

```bash
cd frontend
REACT_APP_ENV=development REACT_APP_API_URL=http://localhost:8080/api npm start
```

### 步骤6: 访问应用

打开浏览器访问: **http://localhost:3000**

## ✅ 验证安装

### 检查后端

```bash
curl http://localhost:8080/api/auth/health
```

应该返回:

```json
{
  "success": true,
  "message": "服务运行正常"
}
```

### 检查前端

浏览器访问 `http://localhost:3000`，应该看到登录页面。

## 🔧 常见问题

### 问题1: 端口被占用

**Windows:**

```bash
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Mac/Linux:**

```bash
lsof -i :8080
kill -9 <PID>
```

### 问题2: 数据库连接失败

检查：

1. PostgreSQL服务是否运行
2. 数据库名称、用户名、密码是否正确
3. `.env.dev` 文件配置是否正确

### 问题3: Maven构建失败

```bash
# 清理并重新构建
cd backend/get_jobs
mvn clean install -DskipTests
```

### 问题4: npm install 失败

```bash
# 清理并重新安装
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📚 下一步

- 查看 [完整开发环境设置指南](./DEVELOPMENT_ENVIRONMENT_SETUP.md)
- 查看 [生产环境部署指南](./PRODUCTION_DEPLOYMENT.md)
- 查看 [API文档](./API_DOCUMENTATION.md)

## 💡 开发提示

1. **前端热重载**: 修改前端代码后，浏览器自动刷新
2. **后端重启**: 修改Java代码后，需要重启后端服务
3. **查看日志**:
   - 后端日志在控制台输出
   - 前端日志在浏览器控制台（F12）



