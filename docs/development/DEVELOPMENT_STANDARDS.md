# 开发规范文档

## 📋 目录
- [代码风格规范](#代码风格规范)
- [Git提交规范](#git提交规范)
- [Code Review流程](#code-review流程)
- [测试规范](#测试规范)
- [文档规范](#文档规范)
- [部署规范](#部署规范)

---

## 🎨 代码风格规范

### 前端代码规范

#### ESLint配置
项目使用ESLint进行代码质量检查，配置文件位于 `frontend/.eslintrc.js`。

**主要规则：**
- 使用TypeScript严格模式
- React Hooks规则检查
- 导入顺序规范化
- 未使用代码检测
- 可访问性检查

**常用命令：**
```bash
# 检查代码问题
npm run lint

# 自动修复问题
npm run lint:fix

# 严格检查（CI环境）
npm run lint:check
```

#### Prettier配置
项目使用Prettier进行代码格式化，配置文件位于 `frontend/.prettierrc`。

**格式化规则：**
- 单引号
- 分号结尾
- 2个空格缩进
- 行宽80字符
- 尾随逗号（ES5）

**常用命令：**
```bash
# 格式化代码
npm run format

# 检查格式
npm run format:check
```

#### TypeScript规范
- 使用严格模式
- 避免使用`any`类型
- 优先使用接口而非类型别名
- 函数必须有明确的返回类型（复杂函数）

### 后端代码规范

#### Checkstyle配置
项目使用Checkstyle进行Java代码风格检查，配置文件位于 `backend/get_jobs/checkstyle.xml`。

**主要规则：**
- 基于Google Java Style Guide
- 行长度限制120字符
- 方法长度限制150行
- 参数数量限制7个
- 强制使用大括号

#### 代码质量工具
- **SpotBugs**: 静态代码分析，检测潜在bug
- **PMD**: 代码质量分析，检测代码异味
- **JaCoCo**: 代码覆盖率检查，最低60%

**常用命令：**
```bash
# 运行所有质量检查
mvn validate

# 单独运行检查
mvn checkstyle:check
mvn spotbugs:check
mvn pmd:check

# 生成覆盖率报告
mvn test jacoco:report
```

---

## 📝 Git提交规范

### Conventional Commits规范
项目遵循[Conventional Commits](https://www.conventionalcommits.org/)规范。

#### 提交格式
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### 类型说明
- **feat**: 新功能
- **fix**: 修复bug
- **docs**: 文档更新
- **style**: 代码格式调整（不影响功能）
- **refactor**: 代码重构
- **perf**: 性能优化
- **test**: 测试相关
- **build**: 构建系统或依赖变动
- **ci**: CI/CD相关
- **chore**: 其他修改
- **revert**: 回滚提交

#### 作用域（可选）
- **frontend**: 前端相关
- **backend**: 后端相关
- **api**: API相关
- **auth**: 认证相关
- **security**: 安全相关
- **config**: 配置相关
- **docs**: 文档相关
- **test**: 测试相关

#### 提交示例
```bash
# 新功能
feat(auth): 添加用户登录功能

# 修复bug
fix(api): 修复用户信息获取接口返回空值问题

# 文档更新
docs: 更新API文档和部署指南

# 代码重构
refactor(frontend): 重构用户组件，提高代码复用性

# 性能优化
perf(backend): 优化数据库查询，减少响应时间50%
```

### Git工作流
1. **分支命名**: `type/description`
   - `feat/user-authentication`
   - `fix/login-bug`
   - `docs/api-documentation`

2. **提交频率**: 小步快跑，频繁提交
3. **提交信息**: 清晰描述变更内容
4. **合并策略**: 使用Rebase，保持线性历史

---

## 👥 Code Review流程

### PR创建规范
1. **标题格式**: `[TYPE] 简短描述`
2. **详细描述**: 使用PR模板填写完整信息
3. **关联Issue**: 链接相关Issue
4. **测试说明**: 描述测试方法和结果

### 审核清单

#### 代码质量
- [ ] 代码符合项目规范
- [ ] 没有语法错误和警告
- [ ] 代码逻辑清晰易懂
- [ ] 性能影响评估
- [ ] 安全性检查

#### 功能完整性
- [ ] 功能按需求实现
- [ ] 边界条件处理
- [ ] 错误处理完善
- [ ] 向后兼容性

#### 测试覆盖
- [ ] 单元测试覆盖
- [ ] 集成测试通过
- [ ] 手动测试验证
- [ ] 性能测试结果

#### 文档更新
- [ ] 代码注释完整
- [ ] API文档更新
- [ ] 用户文档更新
- [ ] 部署说明更新

### 审核流程
1. **自检**: 提交前完成自我检查
2. **CI检查**: 确保所有自动化检查通过
3. **同行审核**: 至少1人审核通过
4. **技术负责人**: 重要功能需要技术负责人审核
5. **合并**: 审核通过后合并到目标分支

---

## 🧪 测试规范

### 测试金字塔
```
        E2E测试 (少量)
       /            \
   集成测试 (适量)    \
  /                  \
单元测试 (大量)       /
```

### 前端测试
- **单元测试**: 使用Jest + React Testing Library
- **集成测试**: 测试组件间交互
- **E2E测试**: 使用Playwright（可选）

### 后端测试
- **单元测试**: 使用JUnit 5
- **集成测试**: 使用Spring Boot Test
- **API测试**: 使用MockMvc或TestRestTemplate

### 测试覆盖率要求
- **单元测试**: 最低60%
- **关键业务逻辑**: 最低80%
- **新增代码**: 100%覆盖

---

## 📚 文档规范

### 代码注释
- **类注释**: 说明类的职责和用途
- **方法注释**: 说明参数、返回值和异常
- **复杂逻辑**: 解释业务逻辑和算法
- **TODO注释**: 标记待完成的功能

### API文档
- 使用Swagger/OpenAPI规范
- 提供完整的请求/响应示例
- 包含错误码和处理说明

### 用户文档
- 使用清晰的语言描述
- 提供完整的操作步骤
- 包含截图和示例

---

## 🚀 部署规范

### 环境管理
- **开发环境**: 本地开发使用
- **测试环境**: 功能测试和集成测试
- **预生产环境**: 生产前最后验证
- **生产环境**: 正式运行环境

### 部署流程
1. **代码合并**: 合并到主分支
2. **自动构建**: CI/CD自动构建
3. **自动测试**: 运行完整测试套件
4. **部署验证**: 部署后验证功能
5. **监控告警**: 监控系统状态

### 回滚策略
- 保留最近5个版本的部署包
- 支持一键回滚到上一版本
- 数据库变更需要兼容性考虑

---

## 🔧 工具配置

### 开发环境要求
- **Node.js**: >= 18.0.0
- **Java**: >= 21
- **Maven**: >= 3.8.0
- **Git**: >= 2.30.0

### IDE配置
推荐使用以下IDE并安装相应插件：

**VS Code**
- ESLint
- Prettier
- TypeScript Importer
- GitLens

**IntelliJ IDEA**
- Checkstyle-IDEA
- SpotBugs
- SonarLint

### Git配置
```bash
# 配置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 配置编辑器
git config --global core.editor "code --wait"

# 配置换行符
git config --global core.autocrlf input
```

---

## 📞 支持与反馈

如果在开发过程中遇到问题，可以通过以下方式获取帮助：

1. **查阅文档**: 首先查阅相关文档
2. **团队讨论**: 在团队群组中讨论
3. **技术负责人**: 联系技术负责人
4. **创建Issue**: 在GitHub上创建Issue

---

**文档版本**: v1.0
**最后更新**: 2025-01-27
**维护团队**: ZhiTouJianLi Development Team
