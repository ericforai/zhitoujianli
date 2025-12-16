# 本地开发环境设置 - 快速参考

## 🎯 核心概念

- **开发环境**: 你的**本地电脑**（Windows/Mac/Linux）
- **生产环境**: **服务器**（`/root/zhitoujianli`）

## 🚀 3步开始开发

### 1. 在本地电脑克隆代码

```bash
cd ~/projects  # 或 Windows: D:\projects
git clone git@github.com:ericforai/zhitoujianli.git
cd zhitoujianli
```

### 2. 配置环境

```bash
# 复制环境变量模板（注意：使用 env.example，不是 .env.example）
cp env.example .env.dev

# 编辑 .env.dev，至少配置：
# - DATABASE_URL (本地PostgreSQL)
# - API_KEY (DeepSeek API密钥)
```

### 3. 启动开发环境

```bash
# 方式1: 使用脚本（推荐）
./scripts/start-dev.sh

# 方式2: 手动启动（两个终端）
# 终端1: cd backend/get_jobs && SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run
# 终端2: cd frontend && REACT_APP_ENV=development npm start
```

### 4. 访问应用

打开浏览器: **http://localhost:3000**

## 📚 详细文档

- **[5分钟快速开始](./docs/LOCAL_DEVELOPMENT_QUICK_START.md)** - 最详细的步骤说明
- **[完整开发环境指南](./docs/DEVELOPMENT_ENVIRONMENT_SETUP.md)** - 完整配置说明
- **[生产环境部署](./docs/PRODUCTION_DEPLOYMENT.md)** - 如何部署到服务器

## 🔄 工作流程

```
本地开发 → 提交到GitHub → 服务器拉取 → 部署到生产
```

1. **在本地开发**: 修改代码，测试功能
2. **提交代码**: `git push origin main`
3. **服务器部署**: 在服务器上执行 `git pull` 和部署脚本

## ⚠️ 重要提醒

1. **开发环境在本地电脑**，不是服务器
2. **生产环境在服务器**，不要在生产环境直接修改代码
3. **始终从GitHub部署**，确保代码版本一致

## 🆘 遇到问题？

查看 [快速开始指南](./docs/LOCAL_DEVELOPMENT_QUICK_START.md) 的"常见问题"部分。



