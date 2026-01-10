# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**智投简历 (ZhiTouJianLi)** is an AI-powered intelligent job application SaaS platform that helps job seekers automatically deliver resumes, generate personalized greetings, and provides complete job management solutions.

### Core Features

- **AI Smart Greeting Generation** - Personalized content generation based on DeepSeek API
- **Smart Resume Parsing** - Supports PDF, Word, TXT formats
- **Automated Job Delivery** - Supports Boss Zhipin and other mainstream recruitment platforms
- **User Management System** - Spring Security + JWT authentication and authorization
- **Data Statistics & Analysis** - Delivery success rate, interview invitation rate visualization
- **Enterprise-grade Security** - Spring Security + JWT + CORS protection
- **Local Agent Mode** - Client-side automation for enhanced privacy and control

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.1.1 | UI Framework |
| TypeScript | 4.9.5 | Type-safe JavaScript |
| Tailwind CSS | 3.4.17 | Styling |
| Axios | 1.12.2 | HTTP client |
| React Router | 7.9.3 | Routing |
| SockJS | 1.6.1 | WebSocket client |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Spring Boot | 3.2.0 | Java framework |
| Java | 21 | Language |
| Spring Security | 6.x | Security framework |
| WebSocket | 6.x | Real-time communication |
| JWT (jjwt) | 0.12.5 | Token generation/validation |
| Playwright | 1.51.0 | Browser automation |
| Selenium | 4.31.0 | Web automation |
| PostgreSQL | 12+ | Database |

### AI Services

- **DeepSeek API** - Primary AI service (resume parsing, greeting generation)
- **OpenAI API** - Backup AI service
- **Ollama** - Local AI model support (optional)

---

## Project Structure

```
zhitoujianli/
├── frontend/                    # React 19 frontend (唯一源代码)
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page-level components
│   │   ├── services/            # API service layer
│   │   ├── hooks/               # Custom React hooks
│   │   ├── contexts/            # React contexts for state
│   │   └── config/              # Environment configuration
│   ├── public/                  # Static assets
│   └── package.json
│
├── backend/get_jobs/            # Spring Boot backend
│   ├── src/main/java/
│   │   ├── config/              # Configuration classes
│   │   ├── controller/          # REST API endpoints
│   │   ├── service/             # Business logic
│   │   ├── entity/              # JPA entities
│   │   ├── filter/              # JWT authentication filter
│   │   ├── interceptor/         # WebSocket handshake interceptor
│   │   ├── boss/                # Boss Zhipin automation
│   │   │   ├── Boss.java        # Main automation engine
│   │   │   ├── BossConfig.java  # Configuration
│   │   │   ├── IsolatedBossRunner.java  # Isolated execution
│   │   │   └── service/         # Boss-specific services
│   │   └── utils/               # Utility classes
│   └── pom.xml
│
├── blog/zhitoujianli-blog/      # Astro blog system
│   ├── src/
│   ├── dist/                    # Build output (唯一正确的博客部署源)
│   └── astro.config.ts
│
├── scripts/                     # Deployment and utility scripts
│   ├── deploy-frontend.sh
│   ├── deploy-backend.sh
│   ├── deploy-blog.sh
│   └── build-backend.sh
│
└── local-agent/                 # Local agent module
```

---

## Development Commands

### Frontend Commands (frontend/)

```bash
# Development
npm start                   # Start dev server (port 3000, hot reload)
npm run build              # Build for production

# Code Quality
npm run lint               # ESLint check
npm run lint:fix           # Auto-fix lint issues
npm run format             # Prettier format
npm run type-check         # TypeScript type check
npm run code-quality       # Full quality check (type + lint + format)

# Testing
npm test                   # Run tests
npm test -- --coverage     # Coverage report
```

### Backend Commands (backend/get_jobs/)

```bash
# Development
mvn spring-boot:run        # Start dev server (port 8080)
mvn clean compile          # Compile code

# Building
mvn clean package          # Build JAR (includes tests)
mvn clean package -DskipTests  # Build without tests
mvn clean install          # Build and install to local repo

# Testing
mvn test                   # Run all tests
mvn test -Dtest=YourTest   # Run specific test

# Code Quality
mvn checkstyle:check       # Code style check
mvn spotbugs:check         # Static code analysis
mvn pmd:check              # Code quality analysis
mvn jacoco:check           # Test coverage (≥60%)
mvn verify                 # Run all checks
```

### Deployment Scripts (from project root)

```bash
# Frontend deployment (唯一正确方式)
./deploy-frontend.sh       # Build and deploy frontend

# Backend deployment
./scripts/build-backend.sh     # Build backend JAR
./scripts/deploy-backend.sh    # Deploy backend JAR

# Blog deployment (唯一正确方式)
./scripts/deploy-blog.sh       # Build and deploy blog

# Full production deployment
./scripts/deploy-production.sh # Deploy frontend + backend
```

---

## Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     智投简历项目架构                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐      ┌──────────────┐      ┌──────────┐  │
│  │   Browser   │ ───> │   Nginx      │ ───> │  Frontend │  │
│  │  (用户端)    │      │  (端口80)     │      │ (React 19) │  │
│  └─────────────┘      └──────────────┘      └──────────┘  │
│         │                     │                              │
│         │                     ▼                              │
│         │            ┌──────────────┐                        │
│         └──────────> │  Backend API │                        │
│                      │ (端口8080)   │                        │
│                      │ Spring Boot  │                        │
│                      └──────────────┘                        │
│                             │                                │
│                   ┌─────────┼─────────┐                     │
│                   ▼         ▼         ▼                      │
│            ┌─────────┐ ┌────────┐ ┌──────────┐            │
│            │Security │ │DeepSeek│ │PostgreSQL│            │
│            │ + JWT   │ │  AI    │ │  数据库  │            │
│            └─────────┘ └────────┘ └──────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Backend Package Structure

- **`config/`** - Spring configuration (CORS, Security, WebSocket, JWT)
- **`controller/`** - REST API endpoints (Auth, Admin, Boss, UserPlan, LocalAgent)
- **`service/`** - Business logic layer
- **`entity/`** - JPA database entities
- **`boss/`** - Boss Zhipin automation (核心自动化模块)
- **`filter/`** - JWT authentication filter
- **`interceptor/`** - WebSocket handshake interceptor

### Key Architectural Patterns

1. **Isolated Execution Pattern** - `IsolatedBossRunner` runs Boss automation in isolated JVM contexts to prevent memory leaks
2. **Service-Oriented Architecture** - Clear separation of concerns with service layers
3. **WebSocket Real-time Updates** - Server-push notifications for job delivery status
4. **Dual Mode Operation** - Cloud mode vs Local Agent mode for privacy

---

## Critical Deployment Rules

### 🚨 Frontend Deployment Rules

**绝对禁止的操作：**
```bash
# ❌ 禁止手动复制文件
cp build/* /usr/share/nginx/html/
```

**必须使用自动化脚本：**
```bash
# ✅ 唯一正确方式（在项目根目录）
./deploy-frontend.sh
```

**前端开发唯一正确流程：**
```bash
# 1. 修改代码
cd /root/zhitoujianli/frontend/
vi src/components/XXX.tsx

# 2. 构建+部署（一条命令）
cd /root/zhitoujianli && ./deploy-frontend.sh

# 3. 提醒用户清除缓存
# Ctrl + Shift + R
```

### 🚨 Backend Deployment Rules

**部署流程：**
1. 修改后端代码
2. 构建JAR：`cd backend/get_jobs && mvn clean package -DskipTests`
3. **关键步骤**：确保 `target/classes` 目录存在（`IsolatedBossRunner` 依赖）
4. 复制JAR到部署目录
5. 更新符号链接
6. 重启服务：`systemctl restart zhitoujianli-backend.service`

**自动部署脚本：**
```bash
./scripts/build-backend.sh    # 构建
./scripts/deploy-backend.sh   # 部署（包含健康检查和自动回滚）
```

### 🚨 Blog Deployment Rules

**唯一正确的博客部署方式：**
```bash
cd /root/zhitoujianli
./scripts/deploy-blog.sh
```

**重要路径：**
- 博客源代码：`/root/zhitoujianli/blog/zhitoujianli-blog/src/`
- 博客构建输出：`/root/zhitoujianli/blog/zhitoujianli-blog/dist/`（唯一正确的部署源）
- 博客部署路径：`/var/www/zhitoujianli/blog/`

---

## Code Standards

### Frontend Code Standards

- Use TypeScript strict mode, avoid `any` type
- Use functional components + React Hooks
- Use Tailwind CSS for styling
- Component naming: PascalCase, file naming: kebab-case
- Import order: React → Third-party → Local components → Utilities

### Backend Code Standards

- Use Spring Boot 3 + Java 21
- Follow Google Java Style Guide
- Use Lombok to reduce boilerplate
- RESTful controller methods
- Service layer uses interface + implementation pattern
- All public methods must have JavaDoc comments

### Git Commit Conventions

Format: `<type>[optional scope]: <description>`

Types:
- `feat` - 新功能
- `fix` - Bug修复
- `docs` - 文档更新
- `style` - 代码格式调整
- `refactor` - 代码重构
- `perf` - 性能优化
- `test` - 测试相关
- `security` - 安全相关
- `config` - 配置文件修改

Examples:
```bash
feat(auth): 添加用户登录功能
fix(api): 修复用户信息获取接口CORS错误
docs: 更新API文档和部署指南
```

---

## Security Configuration Rules

### 🚨 Critical Security Rules (永久记住)

**新增API时的强制检查清单：**

1. 在 `SimpleSecurityConfig.java` 中明确声明新API路径
2. 如果是公开API，添加到 `permitAll()` 列表
3. 如果需要认证，添加到 `authenticated()` 列表
4. 检查未授权处理逻辑是否正确（基于路径判断）
5. 验证API路径不会与现有路径冲突

**前端API调用必须：**

1. 优先使用统一的API客户端 (`apiClient`)
2. 如果使用 `fetch`，必须包含标准请求头：
   - `Accept: application/json`
   - `X-Requested-With: XMLHttpRequest`
   - `Content-Type: application/json`
   - `Authorization: Bearer ${token}` (如果需要认证)

---

## Port Allocation

| Port | Service             | Purpose                     |
| ---- | ------------------- | --------------------------- |
| 80   | Nginx               | Production web server       |
| 3000 | React Dev Server    | Frontend development        |
| 8080 | Spring Boot         | Backend API server          |

---

## Environment Variables

Key environment variables (configured in `/etc/zhitoujianli/backend.env`):

```bash
# API配置
REACT_APP_API_URL=http://localhost:8080/api

# DeepSeek AI配置
BASE_URL=https://api.deepseek.com
API_KEY=your_deepseek_api_key
MODEL=deepseek-chat

# JWT配置
JWT_SECRET=your_very_long_and_secure_secret_key_here

# Boss程序配置
USER_DATA_DIR=/opt/zhitoujianli/backend/user_data
BOSS_WORK_DIR=/opt/zhitoujianli/backend
```

---

## Important Paths

```yaml
前端源代码: /root/zhitoujianli/frontend/
前端构建源: /root/zhitoujianli/frontend/build/
前端部署路径: /var/www/zhitoujianli/build/

后端源代码: /root/zhitoujianli/backend/get_jobs/
后端JAR路径: /opt/zhitoujianli/backend/

博客源代码: /root/zhitoujianli/blog/zhitoujianli-blog/src/
博客构建输出: /root/zhitoujianli/blog/zhitoujianli-blog/dist/
博客部署路径: /var/www/zhitoujianli/blog/

环境变量文件: /etc/zhitoujianli/backend.env
部署脚本: /opt/zhitoujianli/scripts/
日志目录: /opt/zhitoujianli/logs/
```

---

## Testing Requirements

- **Frontend**: Test coverage ≥ 60%, React Testing Library + Jest
- **Backend**: Test coverage ≥ 60%, JUnit 5 + Spring Boot Test + MockMvc

---

## Reference Documents

- `.cursorrules` - Cursor AI development rules
- `.cursor/rules/zhitoujianli_core.mdc` - Core system logic
- `.cursor/rules/total.mdc` - Complete development standards
- `README.md` - Project documentation

---

**AI提醒：每次操作前，先检查 `.cursorrules` 文件！**
