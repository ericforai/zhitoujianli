# 智投简历 - AI智能求职助手

## 项目简介

智投简历是一个基于AI技术的智能求职助手平台，帮助求职者自动化投递简历、生成个性化打招呼语，并提供完整的求职管理解决方案。

## 项目结构

```
zhitoujianli/
├── README.md                          # 项目主文档
├── .gitignore                         # Git 忽略文件
├── 
├── docs/                              # 文档目录
│   ├── deployment/                    # 部署相关文档
│   ├── technical/                     # 技术文档
│   ├── user-guides/                   # 用户指南
│   └── security/                      # 安全相关文档
│
├── frontend/                          # 前端项目 (React)
│   ├── src/                          # React 前端源码
│   ├── public/                       # 静态资源
│   └── package.json                  # 前端依赖
│
├── backend/                          # 后端项目 (Spring Boot)
│   ├── get_jobs/                     # Spring Boot 后端
│   └── simple-backend/               # 简单后端服务
│
├── blog/                             # 博客项目 (Astro)
│   └── zhitoujianli-blog/            # Astro 博客
│
├── mvp/                              # MVP 项目 (Next.js)
│   └── zhitoujianli-mvp/             # Next.js MVP
│
├── website/                          # 网站项目 (React)
│   └── zhitoujianli-website/         # React 网站
│
├── astro/                            # Astro 项目
│   └── astrowind/                    # Astro 模板
│
├── scripts/                          # 脚本文件
├── tests/                            # 测试文件
├── config/                           # 配置文件
└── tools/                            # 工具文件
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

## 技术栈

### 前端技术
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Axios** - HTTP客户端

### 后端技术
- **Spring Boot 3** - Java后端框架
- **Spring Security** - 安全框架
- **JWT** - 身份认证
- **Maven** - 依赖管理

### AI技术
- **DeepSeek API** - 主要AI服务
- **OpenAI API** - 备用AI服务
- **Ollama** - 本地AI部署

### 数据库
- **MySQL** - 主数据库
- **Redis** - 缓存数据库

### 部署技术
- **EdgeOne Pages** - 前端部署
- **Docker** - 容器化部署
- **Nginx** - 反向代理

## 快速开始

### 环境要求
- Node.js 18+
- Java 21+
- Maven 3.8+
- MySQL 8.0+

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/zhitoujianli.git
cd zhitoujianli
```

2. **安装前端依赖**
```bash
cd frontend
npm install
```

3. **安装后端依赖**
```bash
cd backend/get_jobs
mvn clean install
```

4. **配置环境变量**
```bash
# 复制配置文件
cp config/env.example .env

# 编辑配置文件
vim .env
```

5. **启动服务**
```bash
# 启动后端服务
cd backend/get_jobs
./start_with_auth.sh

# 启动前端服务
cd frontend
npm start
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
- [EdgeOne部署配置](docs/deployment/EDGEONE_DEPLOYMENT_CONFIG.md)
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

## 开发指南

### 代码规范
- 使用ESLint进行代码检查
- 遵循TypeScript严格模式
- 使用Prettier进行代码格式化

### 提交规范
```bash
# 功能开发
git commit -m "feat: 添加新功能"

# 问题修复
git commit -m "fix: 修复问题"

# 文档更新
git commit -m "docs: 更新文档"
```

### 测试
```bash
# 前端测试
cd frontend
npm test

# 后端测试
cd backend/get_jobs
mvn test
```

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

## 更新日志

### v2.0.1 (2025-10-02)
- ✅ 完成项目结构重组
- ✅ 实现EdgeOne部署配置
- ✅ 添加安全审计功能
- ✅ 优化CORS配置
- ✅ 完善文档体系

### v2.0.0 (2025-09-30)
- 🎉 发布AI智能打招呼语功能
- 🎉 集成Authing身份认证
- 🎉 实现用户配额管理
- 🎉 添加博客系统

---

**智投简历团队** © 2025
