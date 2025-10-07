# 智投简历 - AI智能求职助手

[![Version](https://img.shields.io/badge/version-2.0.3-blue.svg)](https://github.com/ericforai/zhitoujianli)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-18.x-brightgreen.svg)](https://nodejs.org/)
[![Java](https://img.shields.io/badge/java-21-orange.svg)](https://adoptium.net/)

## 📋 项目简介

智投简历是一个基于AI技术的智能求职助手SaaS平台，帮助求职者自动化投递简历、生成个性化打招呼语，并提供完整的求职管理解决方案。

### ✨ 核心特性

- 🤖 **AI智能打招呼语生成** - 基于DeepSeek API的个性化内容生成
- 📄 **智能简历解析** - 支持PDF、Word、TXT格式自动解析
- 🎯 **自动化投递** - 支持Boss直聘等主流招聘平台
- 👥 **用户管理系统** - 基于Authing的身份认证和权限控制
- 📊 **数据统计分析** - 投递成功率、面试邀请率等数据可视化
- 🔐 **企业级安全** - Spring Security + JWT + CORS保护

## 🏗️ 项目架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     智投简历项目架构                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐      ┌──────────────┐      ┌──────────┐  │
│  │   浏览器     │ ───> │   Nginx      │ ───> │  前端应用  │  │
│  │  (用户端)    │      │  (端口80)     │      │ (React 19) │  │
│  └─────────────┘      └──────────────┘      └──────────┘  │
│         │                     │                              │
│         │                     │                              │
│         │                     ▼                              │
│         │            ┌──────────────┐                        │
│         └──────────> │  后端API     │                        │
│                      │ (端口8080)   │                        │
│                      │ Spring Boot  │                        │
│                      └──────────────┘                        │
│                             │                                │
│                   ┌─────────┼─────────┐                     │
│                   ▼         ▼         ▼                      │
│            ┌─────────┐ ┌────────┐ ┌────────┐              │
│            │ Authing │ │DeepSeek│ │ MySQL  │              │
│            │  认证    │ │  AI    │ │ (计划) │              │
│            └─────────┘ └────────┘ └────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 端口分配

| 端口 | 服务 | 用途 | 环境 |
|------|------|------|------|
| **80** | Nginx | 生产环境Web服务器 | 生产 |
| **3000** | React Dev Server | 前端开发服务器（热重载） | 开发 |
| **8080** | Spring Boot | 后端API服务器 | 开发/生产 |

### 项目结构

```
zhitoujianli/
├── README.md                          # 项目主文档
├── package.json                       # 根项目配置 (npm workspaces)
├── .gitignore                         # Git忽略文件
├── .cursorrules                       # Cursor开发规范
│
├── .cursor/                           # Cursor规则配置
│   └── rules/
│       ├── cursorpromptoptimizationframework.mdc
│       └── github.mdc
│
├── docs/                              # 📚 文档目录
│   ├── deployment/                    # 部署相关文档
│   │   ├── DEPLOYMENT_GUIDE.md
│   │   └── VOLCANO_DEPLOYMENT_GUIDE.md
│   ├── technical/                     # 技术文档
│   │   ├── API_DOCUMENTATION.md
│   │   ├── ADMIN_SYSTEM_TECHNICAL_DOCUMENTATION.md
│   │   └── BLOG_SERVICE_DOCUMENTATION.md
│   ├── user-guides/                   # 用户指南
│   │   ├── QUICK_START_GUIDE.md
│   │   └── ADMIN_LOGIN_GUIDE.md
│   └── security/                      # 安全相关文档
│       ├── SECURITY_AUDIT_REPORT.md
│       └── THREE_TIER_ACCESS_CONTROL_SYSTEM.md
│
├── frontend/                          # 🎨 前端项目 (React 19)
│   ├── src/                          # React源码
│   │   ├── components/               # React组件
│   │   ├── services/                 # API服务
│   │   ├── pages/                    # 页面组件
│   │   └── App.tsx                   # 主应用组件
│   ├── public/                       # 静态资源
│   ├── build/                        # 构建输出
│   ├── package.json                  # 前端依赖
│   ├── tsconfig.json                 # TypeScript配置
│   ├── tailwind.config.js            # Tailwind CSS配置
│   └── nginx.conf                    # 前端Nginx配置
│
├── backend/                          # ⚙️ 后端项目 (Spring Boot 3.2.0)
│   ├── get_jobs/                     # 主后端服务
│   │   ├── src/main/java/
│   │   │   ├── config/               # 配置类
│   │   │   │   ├── CorsConfig.java   # CORS跨域配置
│   │   │   │   ├── SecurityConfig.java # Spring Security配置
│   │   │   │   └── WebSocketConfig.java # WebSocket配置
│   │   │   ├── controller/           # 控制器
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── AdminController.java
│   │   │   │   └── BossController.java
│   │   │   ├── service/              # 服务层
│   │   │   │   ├── AdminService.java
│   │   │   │   ├── AuthService.java
│   │   │   │   └── AiService.java
│   │   │   ├── entity/               # 实体类
│   │   │   ├── enums/                # 枚举类
│   │   │   └── WebApplication.java   # 主启动类
│   │   ├── pom.xml                   # Maven配置
│   │   └── docs/                     # 后端文档
│   └── simple-backend/               # 简单后端服务
│
├── blog/                             # 📝 博客系统 (Astro)
│   └── zhitoujianli-blog/
│       ├── src/
│       ├── public/
│       └── astro.config.ts
│
├── scripts/                          # 🔧 脚本文件
│   ├── deploy-to-volcano.sh          # 火山云部署脚本
│   ├── start_dev.sh                  # 开发环境启动
│   └── sync-to-production.sh         # 生产环境同步
│
├── config/                           # ⚙️ 配置文件
│   └── env.example                   # 环境变量示例
│
├── nginx/                            # 🌐 Nginx配置
│   ├── nginx.conf                    # 主配置文件
│   └── certs/                        # SSL证书目录
│
├── tests/                            # 🧪 测试文件
│
└── logs/                             # 📋 日志目录
    └── backend.log
```

## 核心功能

### 🤖 AI智能打招呼语
- 基于岗位要求生成个性化打招呼语
- 支持多种AI模型 (DeepSeek, OpenAI, Ollama)
- 智能匹配求职者经历与岗位需求

### 📄 简历解析与优化
- 支持PDF、Word格式简历解析
- 自动提取关键信息
- 简历内容优化建议

### 🎯 智能投递系统
- 支持Boss直聘、智联招聘等平台
- 自动化投递流程
- 投递状态跟踪

### 👥 用户管理系统
- 基于Authing的身份认证
- 用户配额管理
- 多层级权限控制

### 📊 数据统计与分析
- 投递成功率统计
- 面试邀请率分析
- 用户行为数据追踪

## 💻 技术栈

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 19.1.1 | 用户界面框架 |
| **TypeScript** | 4.9.5 | 类型安全的JavaScript超集 |
| **Tailwind CSS** | 3.4.17 | 实用优先的CSS框架 |
| **Axios** | 1.12.2 | HTTP客户端（API调用） |
| **React Router** | 7.9.3 | 前端路由管理 |
| **React Dropzone** | 14.3.8 | 文件上传组件 |
| **Authing JS SDK** | 4.23.55 | 身份认证SDK |

**开发工具:**
- ESLint + Prettier - 代码检查和格式化
- React Testing Library - 组件测试
- Jest - 单元测试框架

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Spring Boot** | 3.2.0 | Java后端框架 |
| **Java** | 21 | 编程语言 |
| **Spring Security** | 6.x | 安全认证框架 |
| **Spring WebSocket** | 6.x | WebSocket实时通信 |
| **JWT (jjwt)** | 0.12.5 | Token生成和验证 |
| **Maven** | 3.8+ | 依赖管理和构建工具 |
| **Lombok** | 1.18.30 | 减少样板代码 |
| **Authing Java SDK** | 3.1.19 | 身份认证SDK |

**第三方集成:**
- Selenium 4.31.0 - Web自动化
- Microsoft Playwright 1.51.0 - 浏览器自动化
- Apache PDFBox 2.0.29 - PDF解析
- Apache POI 5.2.5 - Office文档解析

**代码质量工具:**
- Checkstyle - 代码风格检查
- SpotBugs - 静态代码分析
- PMD - 代码质量分析
- JaCoCo - 测试覆盖率 (≥60%)

### AI 技术

| 服务 | 用途 |
|------|------|
| **DeepSeek API** | 主要AI服务（简历解析、打招呼语生成） |
| **OpenAI API** | 备用AI服务 |
| **Ollama** | 本地AI模型支持（可选） |

### 数据库与缓存

| 技术 | 状态 | 用途 |
|------|------|------|
| **MySQL** | 8.0+ (计划中) | 主数据库 |
| **Redis** | (计划中) | 缓存数据库、会话存储 |

### 部署技术

| 技术 | 用途 |
|------|------|
| **火山云** | 云服务器部署 |
| **Docker** | 容器化部署 |
| **Docker Compose** | 多容器编排 |
| **Nginx** | 反向代理和负载均衡 |
| **SSL/TLS** | HTTPS加密通信 |

### 架构特点

- ✅ **前后端分离** - RESTful API架构
- ✅ **WebSocket实时通信** - 投递状态推送
- ✅ **JWT无状态认证** - 支持分布式部署
- ✅ **CORS跨域支持** - 开发/生产环境隔离
- ✅ **Docker容器化** - 一键部署，环境一致性
- ✅ **Nginx反向代理** - 静态资源缓存、HTTPS支持

## 🚀 快速开始

### 环境要求

| 环境 | 版本要求 | 说明 |
|------|----------|------|
| **Node.js** | 18.0.0+ | 前端开发环境 |
| **npm** | 8.0.0+ | 包管理器（**注意：项目使用npm，不是pnpm**） |
| **Java** | 21+ | 后端开发环境 |
| **Maven** | 3.8+ | Java依赖管理 |
| **Git** | 2.x | 版本控制 |
| **MySQL** | 8.0+ (可选) | 数据库（未来版本） |
| **Docker** | 20.x+ (可选) | 容器化部署 |

### 安装步骤

#### 1. 克隆项目

```bash
# 克隆仓库
git clone https://github.com/ericforai/zhitoujianli.git
cd zhitoujianli

# 查看当前分支
git branch -a
```

#### 2. 安装前端依赖

```bash
# 进入前端目录
cd frontend

# 安装依赖（使用npm，不是pnpm）
npm install

# 验证安装
npm list react
```

#### 3. 安装后端依赖

```bash
# 进入后端目录
cd backend/get_jobs

# 安装依赖
mvn clean install -DskipTests

# 或者只编译不安装到本地仓库
mvn clean compile
```

#### 4. 配置环境变量

```bash
# 回到项目根目录
cd /root/zhitoujianli

# 复制环境变量示例文件
cp config/env.example .env

# 编辑配置文件（根据实际情况修改）
vim .env
```

**主要配置项：**

```bash
# 前端API配置
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development

# Authing配置（身份认证）
AUTHING_USER_POOL_ID=your_user_pool_id
AUTHING_APP_ID=your_app_id
AUTHING_APP_SECRET=your_app_secret

# DeepSeek AI配置
BASE_URL=https://api.deepseek.com
API_KEY=your_deepseek_api_key
MODEL=deepseek-chat

# JWT配置
JWT_SECRET=your_very_long_and_secure_secret_key_here
```

#### 5. 启动服务

**开发环境启动（推荐）：**

```bash
# 终端1：启动后端服务（端口8080）
cd backend/get_jobs
mvn spring-boot:run

# 终端2：启动前端服务（端口3000）
cd frontend
npm start

# 浏览器访问
# 前端开发环境: http://localhost:3000
# 后端API: http://localhost:8080/api
```

**生产环境启动：**

```bash
# 构建前端
cd frontend
npm run build

# 构建后端
cd backend/get_jobs
mvn clean package -DskipTests

# 使用Docker Compose启动（推荐）
cd /root/zhitoujianli
docker-compose -f volcano-deployment.yml up -d
```

### 验证安装

访问以下地址验证服务是否正常：

- **前端开发环境**: http://localhost:3000
- **后端健康检查**: http://localhost:8080/api/auth/health
- **后端API文档**: http://localhost:8080/swagger-ui.html (如已配置)

**期望响应示例：**

```json
{
  "success": true,
  "appId": "68db6e4e85de9cb8daf2b3d2",
  "message": "✅ Authing配置正常",
  "authingConfigured": true
}
```

## 配置说明

### 环境变量配置
```bash
# API配置
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development

# Authing配置
AUTHING_USER_POOL_ID=your_user_pool_id
AUTHING_APP_ID=your_app_id
AUTHING_APP_SECRET=your_app_secret

# AI配置
BASE_URL=https://api.deepseek.com
API_KEY=your_api_key
MODEL=deepseek-chat
```

### 数据库配置
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/zhitoujianli
    username: your_username
    password: your_password
```

## 部署指南

### 生产环境部署
详细的部署指南请参考：
- [火山云部署指南](VOLCANO_DEPLOYMENT_GUIDE.md)
- [部署指南](docs/deployment/DEPLOYMENT_GUIDE.md)

### 安全配置
安全相关配置请参考：
- [安全审计报告](docs/security/SECURITY_AUDIT_REPORT.md)
- [安全系统文档](docs/security/BLOG_SECURITY_SYSTEM_DOCUMENTATION.md)

## 文档目录

### 技术文档
- [API文档](docs/technical/API_DOCUMENTATION.md)
- [系统技术文档](docs/technical/ADMIN_SYSTEM_TECHNICAL_DOCUMENTATION.md)
- [博客服务文档](docs/technical/BLOG_SERVICE_DOCUMENTATION.md)

### 用户指南
- [快速开始指南](docs/user-guides/QUICK_START_GUIDE.md)
- [配额管理系统用户指南](docs/user-guides/QUOTA_MANAGEMENT_SYSTEM_USER_GUIDE.md)
- [管理员登录指南](docs/user-guides/ADMIN_LOGIN_GUIDE.md)

### 安全文档
- [安全审计报告](docs/security/SECURITY_AUDIT_REPORT.md)
- [三层访问控制系统](docs/security/THREE_TIER_ACCESS_CONTROL_SYSTEM.md)

## 👨‍💻 开发指南

### 开发工作流

#### 1. 创建功能分支

```bash
# 从主分支创建功能分支
git checkout main
git pull origin main
git checkout -b feat/your-feature-name

# 命名规范
# feat/功能名称    - 新功能
# fix/修复名称     - Bug修复
# docs/文档名称    - 文档更新
# refactor/重构名称 - 代码重构
```

#### 2. 开发流程

```bash
# 1. 启动开发环境
# 终端1：后端
cd backend/get_jobs
mvn spring-boot:run

# 终端2：前端（支持热重载）
cd frontend
npm start

# 2. 进行开发
# 编辑代码，浏览器自动刷新

# 3. 运行代码质量检查
cd frontend
npm run code-quality  # 类型检查 + Lint + 格式检查

# 4. 运行测试
npm test

# 5. 构建验证
npm run build
```

### 可用命令

#### 前端命令（frontend/）

```bash
# 开发
npm start                   # 启动开发服务器（端口3000，热重载）
npm run build              # 构建生产版本

# 测试
npm test                   # 运行所有测试（交互模式）
npm test -- --coverage     # 测试覆盖率报告
npm run test:frontend      # 同 npm test

# 代码质量
npm run lint               # ESLint检查
npm run lint:fix           # 自动修复Lint问题
npm run lint:check         # 严格检查（0 warnings）
npm run format             # Prettier格式化
npm run format:check       # 格式检查（不修改文件）
npm run type-check         # TypeScript类型检查
npm run code-quality       # 完整质量检查（type + lint + format）
```

#### 后端命令（backend/get_jobs/）

```bash
# 开发
mvn spring-boot:run                    # 启动开发服务器（端口8080）
mvn clean compile                      # 编译代码

# 构建
mvn clean package                      # 构建JAR包（跳过测试）
mvn clean package -DskipTests          # 构建并跳过测试
mvn clean install                      # 构建并安装到本地仓库

# 测试
mvn test                               # 运行所有测试
mvn test -Dtest=YourTest              # 运行指定测试

# 代码质量
mvn checkstyle:check                   # 代码风格检查
mvn spotbugs:check                     # 静态代码分析
mvn pmd:check                          # 代码质量分析
mvn jacoco:check                       # 测试覆盖率检查（≥60%）

# 一键检查所有代码质量
mvn verify                             # 运行所有检查
```

#### 根目录命令（/）

```bash
# 快速命令（使用npm workspaces）
npm run build                          # 构建前端
npm run build:frontend                 # 构建前端
npm run build:backend                  # 构建后端（Maven）
npm run build:blog                     # 构建博客
npm test                              # 运行前端测试
npm run dev:frontend                   # 启动前端开发服务器
npm run dev:blog                       # 启动博客开发服务器

# Docker相关
npm run docker:build                   # 构建Docker镜像
npm run docker:up                      # 启动Docker容器
npm run docker:down                    # 停止Docker容器
npm run docker:logs                    # 查看Docker日志

# 部署
npm run deploy:volcano                 # 部署到火山云
```

### 代码规范

#### 前端代码规范（遵循 .cursorrules）

- ✅ 使用 **TypeScript 严格模式**，避免 `any` 类型
- ✅ 组件使用 **函数式组件** + React Hooks
- ✅ 使用 **Tailwind CSS** 进行样式设计
- ✅ 组件命名使用 **PascalCase**，文件名使用 **kebab-case**
- ✅ 最大文件行数：**800行**
- ✅ 注释风格：**ASCII块注释（中文）**
- ✅ 导入顺序：React → 第三方库 → 本地组件 → 工具函数

**示例：**
```typescript
// ✅ 正确示例
interface UserProfileProps {
  userId: string;
  onUpdate: (data: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, onUpdate }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const handleUpdate = useCallback((data: User) => {
    // 更新用户信息
    setUser(data);
    onUpdate(data);
  }, [onUpdate]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* 组件内容 */}
    </div>
  );
};

export default UserProfile;
```

#### 后端代码规范（遵循 Google Java Style Guide）

- ✅ 使用 **Spring Boot 3** + **Java 21**
- ✅ 使用 **Lombok** 减少样板代码
- ✅ 控制器使用 **RESTful** 风格
- ✅ 服务层使用 **接口 + 实现类** 模式
- ✅ 所有 public 方法必须有 **JavaDoc** 注释
- ✅ 使用 **@Valid** 进行参数验证
- ✅ 异常处理使用 **全局异常处理器**

**示例：**
```java
// ✅ 正确示例
@Service
@Slf4j
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * 根据ID获取用户信息
     * @param userId 用户ID
     * @return 用户信息
     * @throws UserNotFoundException 用户不存在时抛出
     */
    public User getUserById(Long userId) {
        try {
            return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("用户不存在"));
        } catch (Exception e) {
            log.error("获取用户信息失败，userId: {}", userId, e);
            throw new ServiceException("获取用户信息失败");
        }
    }
}
```

### Git 提交规范（Conventional Commits）

#### 提交格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### 提交类型

| 类型 | 说明 | 示例 |
|------|------|------|
| **feat** | 新功能 | `feat(auth): 添加用户登录功能` |
| **fix** | Bug修复 | `fix(api): 修复用户信息返回空值问题` |
| **docs** | 文档更新 | `docs: 更新API文档和部署指南` |
| **style** | 代码格式（不影响功能） | `style: 格式化代码` |
| **refactor** | 代码重构 | `refactor(frontend): 重构用户组件` |
| **perf** | 性能优化 | `perf: 优化API响应时间` |
| **test** | 测试相关 | `test: 添加用户服务单元测试` |
| **build** | 构建系统或依赖变动 | `build: 升级React到19.1.1` |
| **ci** | CI/CD相关 | `ci: 添加GitHub Actions配置` |
| **chore** | 其他修改 | `chore: 更新.gitignore` |
| **security** | 安全相关 | `security: 修复XSS漏洞` |
| **config** | 配置文件修改 | `config: 更新CORS配置` |
| **deps** | 依赖更新 | `deps: 更新Spring Boot到3.2.0` |

#### 作用域示例

- `frontend` - 前端相关
- `backend` - 后端相关
- `api` - API接口
- `auth` - 身份认证
- `security` - 安全
- `config` - 配置
- `docs` - 文档
- `test` - 测试

#### 提交示例

```bash
# 好的示例 ✅
git commit -m "feat(auth): 添加邮箱登录功能"
git commit -m "fix(api): 修复用户信息获取接口CORS错误"
git commit -m "docs: 更新README架构说明"
git commit -m "refactor(frontend): 重构简历管理组件，提高代码复用性"

# 不好的示例 ❌
git commit -m "update"
git commit -m "fix bug"
git commit -m "修改文件"
```

### 测试要求

#### 前端测试

```bash
# 运行测试
cd frontend
npm test                      # 交互模式
npm test -- --coverage        # 生成覆盖率报告
npm test -- --watchAll=false  # 非交互模式（CI环境）

# 查看覆盖率报告
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
```

**测试要求：**
- ✅ 测试覆盖率 ≥ **60%**
- ✅ 使用 **React Testing Library**
- ✅ 工具函数使用 **Jest**
- ✅ API调用使用 **Mock**

#### 后端测试

```bash
# 运行测试
cd backend/get_jobs
mvn test                      # 运行所有测试
mvn test -Dtest=UserServiceTest  # 运行指定测试
mvn jacoco:report             # 生成覆盖率报告

# 查看覆盖率报告
open target/site/jacoco/index.html  # macOS
```

**测试要求：**
- ✅ 测试覆盖率 ≥ **60%**（JaCoCo强制检查）
- ✅ 单元测试使用 **JUnit 5**
- ✅ 集成测试使用 **Spring Boot Test**
- ✅ API测试使用 **MockMvc**

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系我们

- 项目主页: https://zhitoujianli.com
- 问题反馈: https://github.com/your-username/zhitoujianli/issues
- 邮箱: support@zhitoujianli.com

## 📝 更新日志

### v2.0.3 (2025-10-07) - 当前版本

**架构优化**
- ✅ 更新包管理器配置：确认使用 npm (不是 pnpm)
- ✅ 完善项目架构文档：详细的端口分配、服务说明
- ✅ 更新技术栈版本信息：React 19.1.1, Spring Boot 3.2.0
- ✅ 优化 Cursor 规则配置：修正执行命令

**CORS 跨域修复**
- ✅ 修复开发环境 CORS 问题：添加 http://115.190.182.95:3000 到白名单
- ✅ 更新 CorsConfig.java 和 SecurityConfig.java
- ✅ 支持开发环境与生产环境隔离

**功能移除**
- ✅ 移除所有价格相关内容（Pricing组件、导航链接、页脚链接）
- ✅ 优化用户界面，更聚焦核心功能

**文档完善**
- ✅ 重写 README.md：完整的架构说明、开发指南
- ✅ 添加详细的命令列表和使用说明
- ✅ 完善 Git 提交规范和代码规范文档

### v2.0.2 (2025-01-27)

**火山云部署**
- ✅ 从 EdgeOne 迁移到火山云部署
- ✅ 清理所有 EdgeOne 相关配置和文档
- ✅ 创建完整的 Docker 容器化部署方案
- ✅ 配置 Nginx 反向代理和 SSL/TLS
- ✅ 编写详细的火山云部署指南文档

**Docker 化**
- ✅ 创建 volcano-deployment.yml 配置
- ✅ 配置前端、后端、博客 Dockerfile
- ✅ 配置 MySQL 和 Redis 容器
- ✅ 实现一键部署脚本

### v2.0.1 (2025-10-02)

**管理员系统**
- ✅ 实现超级管理员系统（ID: 68dba0e3d9c27ebb0d93aa42）
- ✅ 创建三层权限体系（SUPER_ADMIN / PLATFORM_ADMIN / CUSTOMER_ADMIN）
- ✅ 开发管理员前端界面和后端API
- ✅ 集成 Spring Security 权限控制

**安全增强**
- ✅ 实现三层访问控制系统
- ✅ 配置 JWT Token 认证
- ✅ 添加 API 限流保护
- ✅ 完善安全审计日志

### v2.0.0 (2025-09-30) - 首次发布

**核心功能**
- 🎉 AI 智能打招呼语生成（DeepSeek API）
- 🎉 简历解析与优化（PDF/Word支持）
- 🎉 Boss 直聘自动化投递
- 🎉 用户管理系统（Authing V3 集成）
- 🎉 博客系统（Astro）

**技术实现**
- ✅ React 19 + TypeScript 前端框架
- ✅ Spring Boot 3 + Java 21 后端框架
- ✅ WebSocket 实时通信
- ✅ Spring Security + JWT 安全认证
- ✅ Maven 构建工具和依赖管理

### 近期计划 (Roadmap)

#### v2.1.0 (计划中)
- 🔜 MySQL 数据库集成
- 🔜 Redis 缓存系统
- 🔜 用户配额管理系统
- 🔜 数据统计与分析仪表板
- 🔜 支持更多招聘平台（智联招聘、拉勾网）

#### v2.2.0 (规划中)
- 🔜 移动端适配（响应式设计）
- 🔜 微信小程序版本
- 🔜 AI 简历优化建议
- 🔜 面试准备助手
- 🔜 求职进度管理

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. **Fork 项目** - 点击右上角 Fork 按钮
2. **克隆到本地** - `git clone https://github.com/your-username/zhitoujianli.git`
3. **创建功能分支** - `git checkout -b feat/amazing-feature`
4. **提交更改** - `git commit -m 'feat: 添加某个很棒的功能'`
5. **推送到分支** - `git push origin feat/amazing-feature`
6. **创建 Pull Request** - 在 GitHub 上提交 PR

### 代码审查要点

- ✅ 代码符合项目规范（参考开发指南）
- ✅ 包含完整的单元测试（覆盖率 ≥ 60%）
- ✅ 通过所有代码质量检查（Lint、Format、Type Check）
- ✅ 提交信息符合 Conventional Commits 规范
- ✅ 更新相关文档（如有必要）

### 报告问题

发现 Bug 或有功能建议？请：
1. 检查 [Issues](https://github.com/ericforai/zhitoujianli/issues) 是否已有类似问题
2. 创建新 Issue 并提供详细信息：
   - 问题描述
   - 复现步骤
   - 期望行为
   - 实际行为
   - 环境信息（OS、Node.js版本、浏览器等）

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

- **项目主页**: https://zhitoujianli.com
- **GitHub**: https://github.com/ericforai/zhitoujianli
- **问题反馈**: https://github.com/ericforai/zhitoujianli/issues
- **邮箱**: support@zhitoujianli.com

## 🙏 致谢

感谢以下开源项目和服务：

- [React](https://reactjs.org/) - 用户界面框架
- [Spring Boot](https://spring.io/projects/spring-boot) - Java 应用框架
- [Authing](https://www.authing.cn/) - 身份认证服务
- [DeepSeek](https://www.deepseek.com/) - AI 服务
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [火山云](https://www.volcengine.com/) - 云服务

---

**智投简历团队** © 2025 | 用 ❤️ 构建，助力求职者找到理想工作
