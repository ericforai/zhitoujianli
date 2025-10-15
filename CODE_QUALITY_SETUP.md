# 代码质量配置指南

本项目已配置跨语言代码规范工具，确保代码风格一致性和质量标准。

## 📋 工具清单

### 前端 (TypeScript/React)

- **ESLint**: JavaScript/TypeScript代码检查
- **Prettier**: 代码格式化
- **TypeScript Compiler**: 类型检查

### Python

- **Flake8**: Python代码检查（PEP8合规）
- **Black**: Python代码格式化
- **isort**: 导入语句排序

### Java (后端)

- **Checkstyle**: 代码风格检查（Maven集成）
- **SpotBugs**: 静态分析工具
- **Maven Compiler**: 编译检查

## 🚀 快速开始

### 前端代码检查

```bash
# 运行ESLint检查
npm run lint

# 自动修复ESLint问题 + Prettier格式化
npm run lint:fix

# 检查代码格式（不修改文件）
npm run format:check

# 格式化所有代码
npm run format

# TypeScript类型检查
npm run type-check

# 运行完整的代码质量检查（lint + format + type）
npm run code-quality
```

### Python代码检查

```bash
# 安装依赖（首次使用）
pip install flake8 black isort

# 检查Python代码规范
npm run lint:python
# 或直接使用
flake8 backend_manager.py

# 格式化Python代码
npm run format:python
# 或直接使用
black backend_manager.py

# 排序导入语句
isort backend_manager.py
```

### Java代码检查

```bash
# 进入后端目录
cd backend/get_jobs

# 运行Checkstyle检查
mvn checkstyle:check

# 运行SpotBugs静态分析
mvn spotbugs:check

# 运行PMD代码质量检查
mvn pmd:check

# 运行所有检查
mvn verify
```

## 📁 配置文件

### 前端配置

- `.prettierrc.json` - Prettier格式化规则
- `.prettierignore` - Prettier忽略文件
- `frontend/.eslintrc.js` - ESLint规则（在frontend目录）
- `frontend/tsconfig.json` - TypeScript配置

### Python配置

- `setup.cfg` - Flake8配置
- `pyproject.toml` - Black和isort配置

### Java配置

- `backend/get_jobs/pom.xml` - Maven插件配置
- `backend/get_jobs/checkstyle.xml` - Checkstyle规则（如存在）

## 🔧 配置说明

### Prettier规则

```json
{
  "semi": true, // 使用分号
  "trailingComma": "es5", // ES5兼容的尾随逗号
  "singleQuote": true, // 使用单引号
  "printWidth": 100, // 每行最大字符数
  "tabWidth": 2, // 缩进宽度
  "jsxSingleQuote": true, // JSX中使用单引号
  "arrowParens": "avoid" // 箭头函数参数省略括号
}
```

### Flake8规则

- 最大行长度: 100字符
- 忽略规则: E203, W503, E501
- 排除目录: `.git`, `__pycache__`, `build`, `dist`, `node_modules`

### Black规则

- 行长度: 100字符
- 目标Python版本: 3.8, 3.9, 3.10
- 排除: `.git`, `.venv`, `build`, `dist`, `node_modules`, `backend`

## 🎯 CI/CD集成

### Git Pre-commit Hook

项目使用Husky进行Git hooks管理。提交前会自动运行代码检查：

```bash
# 自动安装（package.json中已配置）
npm run prepare
```

### 持续集成建议

在CI流程中添加以下检查：

```yaml
# .github/workflows/code-quality.yml 示例
name: Code Quality

on: [push, pull_request]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run code quality checks
        run: npm run code-quality

  python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Python dependencies
        run: pip install flake8 black
      - name: Run Python checks
        run: |
          flake8 backend_manager.py
          black --check backend_manager.py

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK 21
        uses: actions/setup-java@v2
        with:
          java-version: '21'
      - name: Run Maven checks
        run: |
          cd backend/get_jobs
          mvn clean verify
```

## 📝 最佳实践

### 提交前检查清单

- [ ] 运行 `npm run code-quality` 确保前端代码无错误
- [ ] 运行 `flake8` 和 `black` 检查Python代码
- [ ] 确保 `mvn verify` 通过后端检查
- [ ] 查看Git diff确认修改符合预期
- [ ] 编写清晰的提交信息（遵循项目Git规范）

### IDE集成建议

#### VSCode

安装推荐扩展：

- ESLint
- Prettier - Code formatter
- Python
- Black Formatter
- Java Extension Pack

配置 `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"]
}
```

#### IntelliJ IDEA

- 启用Checkstyle插件
- 配置自动导入优化
- 启用保存时格式化

## 🐛 常见问题

### Q: ESLint报错 "Cannot find module 'eslint-config-...'"

A: 在前端目录运行 `npm install` 安装依赖

### Q: Black报错 "command not found"

A: 使用 `pip install black` 安装Black

### Q: Maven checkstyle失败

A: 检查Java代码是否符合Google Java Style Guide，或运行 `mvn spotless:apply` 自动格式化

### Q: 如何临时跳过某个检查？

A: 不建议跳过检查。如确需跳过，可使用：

- ESLint: `// eslint-disable-next-line rule-name`
- Flake8: `# noqa: E501`
- Checkstyle: `// CHECKSTYLE:OFF`

## 🔄 更新配置

配置文件位于项目根目录，可根据团队需求调整：

- 修改后通知团队成员
- 更新此文档说明
- 在下次团队会议中讨论重大变更

## 📞 支持

如有问题或建议，请：

1. 查阅本文档
2. 搜索相关工具的官方文档
3. 在项目issue中提问
4. 联系技术负责人

---

**最后更新**: 2025-01-11
**维护者**: ZhiTouJianLi Team

