# Git提交规范指南

## 📖 概述

本指南详细说明如何在智投简历项目中使用Git提交规范，确保提交信息的一致性和可读性。

---

## 🎯 提交格式规范

### 基本格式
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 格式说明
- **type**: 提交类型（必需）
- **scope**: 影响范围（可选）
- **description**: 简短描述（必需）
- **body**: 详细描述（可选）
- **footer**: 脚注信息（可选）

---

## 📝 提交类型详解

### 主要类型

#### 🆕 feat - 新功能
用于添加新的功能特性。

```bash
feat(auth): 添加用户登录功能
feat(api): 实现简历解析API接口
feat(frontend): 添加用户仪表板组件
```

#### 🐛 fix - 修复bug
用于修复代码中的错误。

```bash
fix(api): 修复用户信息获取接口返回空值问题
fix(frontend): 修复登录页面在移动端的显示问题
fix(backend): 修复数据库连接池泄漏问题
```

#### 📚 docs - 文档更新
用于更新项目文档。

```bash
docs: 更新API文档和部署指南
docs(readme): 添加项目安装说明
docs(api): 完善用户认证接口文档
```

#### 🎨 style - 代码格式调整
用于代码格式调整，不影响功能。

```bash
style(frontend): 统一组件命名规范
style(backend): 调整代码缩进和空行
style: 修复ESLint和Prettier警告
```

#### ♻️ refactor - 代码重构
用于代码重构，既不添加功能也不修复bug。

```bash
refactor(frontend): 重构用户组件，提高代码复用性
refactor(backend): 重构服务层，提取公共方法
refactor(api): 优化响应数据结构
```

#### ⚡ perf - 性能优化
用于性能相关的改进。

```bash
perf(backend): 优化数据库查询，减少响应时间50%
perf(frontend): 使用React.memo优化组件渲染性能
perf(api): 添加Redis缓存，提升接口响应速度
```

#### 🧪 test - 测试相关
用于添加或修改测试代码。

```bash
test(frontend): 添加用户登录组件的单元测试
test(backend): 完善用户服务的集成测试
test(api): 添加简历解析接口的测试用例
```

#### 🏗️ build - 构建系统或依赖变动
用于构建系统或外部依赖的变动。

```bash
build: 更新Maven依赖版本
build(frontend): 配置Webpack优化构建
build(docker): 优化Docker镜像构建过程
```

#### 🔄 ci - CI/CD相关
用于持续集成和部署的配置变更。

```bash
ci: 添加GitHub Actions工作流
ci: 配置代码质量检查流程
ci: 更新部署脚本
```

#### 🔧 chore - 其他修改
用于其他不重要的修改。

```bash
chore: 更新.gitignore文件
chore: 清理无用的依赖包
chore: 更新项目配置文件
```

### 项目特定类型

#### 🔒 security - 安全相关
用于安全相关的修改。

```bash
security(auth): 加强JWT Token验证逻辑
security(api): 修复SQL注入漏洞
security(frontend): 添加XSS防护措施
```

#### ⚙️ config - 配置文件修改
用于配置文件相关的修改。

```bash
config: 更新数据库连接配置
config(nginx): 优化反向代理配置
config(env): 添加新的环境变量
```

#### 📦 deps - 依赖更新
用于依赖包的更新。

```bash
deps: 升级React到18.2.0版本
deps(backend): 更新Spring Boot到3.2.0
deps: 修复安全漏洞依赖包
```

#### 🚀 release - 发布版本
用于版本发布。

```bash
release: 发布v1.2.0版本
release: 准备v2.0.0-beta版本
release: 发布热修复版本v1.2.1
```

---

## 🎯 作用域（Scope）说明

### 前端相关
- `frontend`: 前端整体
- `react`: React相关
- `typescript`: TypeScript相关
- `ui`: UI组件
- `components`: 组件相关
- `hooks`: React Hooks
- `utils`: 工具函数
- `services`: 服务层

### 后端相关
- `backend`: 后端整体
- `api`: API接口
- `auth`: 认证授权
- `security`: 安全相关
- `database`: 数据库相关
- `server`: 服务器配置

### 配置相关
- `config`: 配置文件
- `env`: 环境变量
- `docker`: Docker相关
- `nginx`: Nginx配置
- `deploy`: 部署相关

### 文档相关
- `docs`: 文档
- `readme`: README文件
- `changelog`: 变更日志

### 测试相关
- `test`: 测试
- `e2e`: 端到端测试
- `unit`: 单元测试

### 构建相关
- `build`: 构建
- `ci`: 持续集成
- `workflow`: 工作流

---

## 📋 提交信息规范

### 标题规范
- **长度**: 不超过50个字符
- **语言**: 使用中文
- **格式**: 动词开头，简洁明了
- **标点**: 结尾不使用句号

```bash
# ✅ 正确示例
feat(auth): 添加用户登录功能
fix(api): 修复数据查询异常
docs: 更新部署文档

# ❌ 错误示例
feat(auth): 添加用户登录功能。
fix(api): 修复了数据查询的异常问题
docs: 更新了部署相关的文档说明
```

### 正文规范
- **长度**: 每行不超过100个字符
- **内容**: 详细说明变更的原因和影响
- **格式**: 使用空行分隔段落

```bash
feat(auth): 添加用户登录功能

实现了基于JWT的用户认证系统，包括：
- 邮箱密码登录
- 手机号验证码登录
- Token自动刷新机制
- 登录状态持久化

影响范围：
- 前端登录组件
- 后端认证服务
- 数据库用户表结构
```

### 脚注规范
- **Breaking Changes**: 使用`BREAKING CHANGE:`标识
- **Issue关联**: 使用`Closes #123`格式
- **Co-authored-by**: 多人协作时使用

```bash
feat(api): 重构用户信息接口

BREAKING CHANGE: 用户信息接口响应结构发生变化，
需要更新前端代码以适配新的数据结构。

Closes #123
Co-authored-by: Developer Name <email@example.com>
```

---

## 🔍 提交示例

### 完整示例

#### 新功能提交
```bash
feat(auth): 添加用户登录功能

实现了完整的用户认证系统，包括：

1. 邮箱密码登录
   - 支持邮箱和密码验证
   - 密码加密存储
   - 登录失败次数限制

2. 手机号验证码登录
   - 集成短信验证服务
   - 验证码有效期5分钟
   - 防刷机制

3. JWT Token管理
   - Access Token有效期2小时
   - Refresh Token有效期7天
   - 自动刷新机制

技术实现：
- 前端使用React Hook管理登录状态
- 后端使用Spring Security + JWT
- 数据库使用MySQL存储用户信息

Closes #45
```

#### Bug修复提交
```bash
fix(api): 修复用户信息获取接口返回空值问题

问题描述：
用户信息获取接口在某些情况下返回null值，
导致前端页面显示异常。

解决方案：
1. 添加数据库查询结果验证
2. 增加异常处理和日志记录
3. 返回默认用户信息作为降级方案

测试验证：
- 单元测试覆盖所有边界情况
- 集成测试验证接口稳定性
- 手动测试确认问题解决

Fixes #78
```

#### 重构提交
```bash
refactor(frontend): 重构用户组件，提高代码复用性

重构内容：
1. 提取公共组件
   - UserCard: 用户卡片组件
   - UserForm: 用户表单组件
   - UserList: 用户列表组件

2. 优化状态管理
   - 使用Context API管理用户状态
   - 自定义Hook封装业务逻辑
   - 减少组件间的props传递

3. 改进性能
   - 使用React.memo优化渲染
   - 实现虚拟滚动优化长列表
   - 添加组件懒加载

影响范围：
- 用户管理页面
- 用户详情页面
- 用户编辑页面

性能提升：
- 页面加载时间减少30%
- 内存使用量减少20%
```

---

## 🛠️ 工具配置

### Commitizen配置
使用Commitizen工具帮助生成规范的提交信息。

```bash
# 安装Commitizen
npm install -g commitizen cz-conventional-changelog

# 配置项目
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc

# 使用cz命令提交
git cz
```

### IDE插件推荐

#### VS Code
- **GitLens**: 增强Git功能
- **Conventional Commits**: 提交信息模板
- **Git Graph**: 可视化Git历史

#### IntelliJ IDEA
- **Git Commit Template**: 提交模板
- **GitToolBox**: Git增强工具

---

## 📊 提交统计

### 提交频率建议
- **开发阶段**: 每天2-3次提交
- **功能开发**: 每个小功能一次提交
- **Bug修复**: 每个修复一次提交
- **重构**: 每个模块一次提交

### 提交大小建议
- **小提交**: 单一职责，易于理解和回滚
- **原子性**: 每次提交只做一件事
- **完整性**: 确保提交后代码可以正常编译运行

---

## 🚫 常见错误

### 避免的提交信息
```bash
# ❌ 过于简单
fix: 修复bug
feat: 新功能
update: 更新

# ❌ 过于复杂
feat(auth,api,frontend,backend,database,security,config,deploy): 实现完整的用户认证系统，包括前后端所有相关功能

# ❌ 使用英文
feat: add user login feature
fix: fix authentication bug

# ❌ 包含敏感信息
feat: 添加用户登录功能，密码是123456
fix: 修复数据库连接，用户名admin，密码password
```

### 正确的提交信息
```bash
# ✅ 清晰简洁
feat(auth): 添加用户登录功能
fix(api): 修复认证接口异常
docs: 更新用户使用手册

# ✅ 包含必要信息
feat(auth): 添加用户登录功能

实现邮箱密码和手机验证码两种登录方式，
支持JWT Token自动刷新。

Closes #123
```

---

## 📚 参考资源

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular提交规范](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Vue提交规范](https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md)
- [React提交规范](https://github.com/facebook/react/blob/main/CONTRIBUTING.md#how-to-contribute)

---

**文档版本**: v1.0
**最后更新**: 2025-01-27
**维护团队**: ZhiTouJianLi Development Team
