# 更新日志

所有重要的项目变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且此项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [2.0.0] - 2025-10-23

### 🎉 重大更新
- **智投简历系统正式发布v2.0版本**
- 完整的前后端分离架构实现
- 企业级安全认证系统上线

### ✨ 新增功能
- **AI智能打招呼语生成** - 基于DeepSeek API的个性化内容生成
- **智能简历解析** - 支持PDF、Word、TXT格式自动解析
- **自动化投递系统** - 支持Boss直聘等主流招聘平台
- **用户管理系统** - Spring Security + JWT身份认证和权限控制
- **数据统计分析** - 投递成功率、面试邀请率等数据可视化
- **企业级安全** - Spring Security + JWT + CORS保护

### 🔧 技术架构
- **前端**: React 19.1.1 + TypeScript 4.9.5 + Tailwind CSS 3.4.17
- **后端**: Spring Boot 3.2.0 + Java 21 + Spring Security 6.x
- **数据库**: PostgreSQL + JPA
- **AI服务**: DeepSeek API + OpenAI API (备用)
- **部署**: Docker + Nginx + SSL/TLS

### 🚀 核心特性
- 🤖 AI智能打招呼语生成
- 📄 智能简历解析和结构化
- 🎯 自动化简历投递
- 👥 多用户权限管理
- 📊 数据统计和分析
- 🔐 企业级安全认证
- 🌐 WebSocket实时通信
- 📱 响应式UI设计

### 🛠️ 开发工具
- **代码质量**: ESLint + Prettier + TypeScript严格模式
- **测试**: Jest + React Testing Library + JUnit 5
- **构建**: Maven + npm + Docker
- **CI/CD**: GitHub Actions + 自动化部署

### 📦 部署支持
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx配置
- **SSL证书**: Let's Encrypt自动续期
- **监控**: Spring Boot Actuator

### 🔒 安全特性
- JWT无状态认证
- Spring Security权限控制
- CORS跨域保护
- XSS和CSRF防护
- 密码BCrypt加密
- API限流保护

### 📈 性能优化
- React组件懒加载
- 数据库查询优化
- 静态资源CDN
- 图片WebP格式
- 代码分割和压缩

### 🐛 修复问题
- 修复CORS跨域问题
- 修复用户认证流程
- 修复简历上传功能
- 修复Boss直聘登录问题
- 修复WebSocket连接问题

### 📚 文档更新
- 完整的API文档
- 部署指南
- 开发规范
- 用户使用手册
- 安全配置指南

### ⚠️ 已知问题
- 部分测试用例需要更新
- SpotBugs静态分析发现的问题待修复
- 前端格式化问题待处理

### 🔄 迁移指南
从v1.x升级到v2.0：
1. 更新数据库schema
2. 重新配置环境变量
3. 更新前端依赖
4. 重新部署应用

### 📞 支持
- GitHub Issues: [项目Issues](https://github.com/ericforai/zhitoujianli/issues)
- 文档: [项目Wiki](https://github.com/ericforai/zhitoujianli/wiki)
- 邮箱: support@zhitoujianli.com

---

## [1.1.0] - 2025-10-15

### 新增功能
- Boss直聘登录功能
- 简历上传和解析
- 基础用户认证

### 修复问题
- 修复登录页面问题
- 修复API接口问题

## [1.0.0] - 2025-10-01

### 初始发布
- 基础项目架构
- 前端React应用
- 后端Spring Boot应用
- 基础功能实现
