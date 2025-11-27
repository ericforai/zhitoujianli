# Boss 投递脚本使用指南

## 📋 前置要求

1. **Node.js 版本**: >= 18.0.0
2. **npm 或 yarn**: 用于安装依赖

## 🚀 快速开始

### 1. 安装依赖

在运行脚本之前，需要先安装必要的依赖：

```bash
# 使用 npm
npm install playwright ws

# 或使用 yarn
yarn add playwright ws
```

### 2. 安装 Playwright 浏览器

安装依赖后，还需要安装 Playwright 的浏览器：

```bash
npx playwright install chromium
```

### 3. 运行脚本

```bash
node boss-runner.js <服务器地址> <用户ID>
```

例如：

```bash
node boss-runner.js 115.190.182.95:8080 user123
```

## ❌ 常见错误

### 错误：`Cannot find module 'playwright'`

**原因**: 未安装 `playwright` 模块

**解决方法**:
```bash
npm install playwright ws
npx playwright install chromium
```

### 错误：`Cannot find module 'ws'`

**原因**: 未安装 `ws` 模块

**解决方法**:
```bash
npm install ws
```

### 错误：`node:internal/modules/cjs/loader:1225`

**原因**: Node.js 无法找到或加载模块

**解决方法**:
1. 确认 Node.js 版本 >= 18.0.0: `node --version`
2. 确认在正确的目录下运行脚本
3. 确认 `node_modules` 目录存在: `ls node_modules`
4. 如果 `node_modules` 不存在，运行: `npm install playwright ws`

## 📝 完整安装步骤

```bash
# 1. 创建项目目录（可选）
mkdir boss-delivery
cd boss-delivery

# 2. 初始化 npm 项目（可选，但推荐）
npm init -y

# 3. 安装依赖
npm install playwright ws

# 4. 安装 Playwright 浏览器
npx playwright install chromium

# 5. 下载 boss-runner.js 脚本到当前目录

# 6. 运行脚本
node boss-runner.js <服务器地址> <用户ID>
```

## 🔍 验证安装

运行以下命令验证依赖是否正确安装：

```bash
# 检查 Node.js 版本
node --version

# 检查 playwright 是否安装
node -e "console.log(require('playwright'))"

# 检查 ws 是否安装
node -e "console.log(require('ws'))"
```

如果以上命令都能正常执行，说明依赖已正确安装。

## 💡 提示

- 如果使用 `yarn`，将 `npm` 命令替换为 `yarn` 即可
- 如果遇到权限问题，可能需要使用 `sudo`（Linux/Mac）或以管理员身份运行（Windows）
- 建议在项目目录下创建 `package.json` 文件，这样可以更好地管理依赖

## 🆘 获取帮助

如果遇到其他问题，请：

1. 检查错误信息的详细内容
2. 确认 Node.js 和 npm 版本符合要求
3. 查看脚本开头的错误提示信息
4. 联系技术支持





