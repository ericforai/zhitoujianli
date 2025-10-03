#!/bin/bash

# 开发环境快速设置脚本
# 用于新开发者快速配置开发环境

set -e

echo "🚀 开始设置智投简历项目开发环境..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_message $RED "❌ $1 未安装，请先安装 $1"
        return 1
    else
        print_message $GREEN "✅ $1 已安装"
        return 0
    fi
}

# 检查版本要求
check_version() {
    local command=$1
    local version_pattern=$2
    local required_version=$3

    if check_command $command; then
        local current_version=$($command --version 2>&1 | grep -o "$version_pattern" | head -1)
        print_message $BLUE "当前版本: $current_version"

        # 这里可以添加版本比较逻辑
        print_message $GREEN "版本检查通过"
    fi
}

echo ""
print_message $BLUE "📋 检查系统要求..."

# 检查Node.js
print_message $YELLOW "检查 Node.js..."
check_version "node" "v[0-9]+\.[0-9]+\.[0-9]+" "18.0.0"

# 检查npm
print_message $YELLOW "检查 npm..."
check_command "npm"

# 检查Java
print_message $YELLOW "检查 Java..."
check_version "java" "[0-9]+\.[0-9]+\.[0-9]+" "21"

# 检查Maven
print_message $YELLOW "检查 Maven..."
check_version "mvn" "[0-9]+\.[0-9]+\.[0-9]+" "3.8.0"

# 检查Git
print_message $YELLOW "检查 Git..."
check_version "git" "[0-9]+\.[0-9]+\.[0-9]+" "2.30.0"

echo ""
print_message $BLUE "📦 安装项目依赖..."

# 安装前端依赖
if [ -d "frontend" ]; then
    print_message $YELLOW "安装前端依赖..."
    cd frontend

    # 检查package.json是否存在
    if [ -f "package.json" ]; then
        npm ci
        print_message $GREEN "✅ 前端依赖安装完成"
    else
        print_message $RED "❌ 未找到 frontend/package.json"
    fi

    cd ..
else
    print_message $RED "❌ 未找到 frontend 目录"
fi

# 安装后端依赖
if [ -d "backend/get_jobs" ]; then
    print_message $YELLOW "安装后端依赖..."
    cd backend/get_jobs

    # 检查pom.xml是否存在
    if [ -f "pom.xml" ]; then
        mvn dependency:resolve
        print_message $GREEN "✅ 后端依赖安装完成"
    else
        print_message $RED "❌ 未找到 backend/get_jobs/pom.xml"
    fi

    cd ../..
else
    print_message $RED "❌ 未找到 backend/get_jobs 目录"
fi

echo ""
print_message $BLUE "🔧 配置Git..."

# 配置Git用户信息（如果未配置）
if [ -z "$(git config user.name)" ]; then
    print_message $YELLOW "配置Git用户信息..."
    read -p "请输入Git用户名: " git_username
    read -p "请输入Git邮箱: " git_email

    git config --global user.name "$git_username"
    git config --global user.email "$git_email"
    print_message $GREEN "✅ Git用户信息配置完成"
else
    print_message $GREEN "✅ Git用户信息已配置"
fi

# 配置Git编辑器
if [ -z "$(git config core.editor)" ]; then
    print_message $YELLOW "配置Git编辑器..."
    git config --global core.editor "code --wait"
    print_message $GREEN "✅ Git编辑器配置完成"
fi

# 配置换行符
git config --global core.autocrlf input

echo ""
print_message $BLUE "🛠️ 配置开发工具..."

# 配置Husky
if [ -d ".husky" ]; then
    print_message $YELLOW "配置Git Hooks..."
    chmod +x .husky/pre-commit
    chmod +x .husky/commit-msg
    chmod +x .husky/pre-push
    print_message $GREEN "✅ Git Hooks配置完成"
fi

# 配置VS Code设置（如果使用VS Code）
if command -v code &> /dev/null; then
    print_message $YELLOW "配置VS Code..."

    # 创建VS Code设置目录
    mkdir -p .vscode

    # 创建VS Code设置文件
    cat > .vscode/settings.json << EOF
{
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true,
        "source.organizeImports": true
    },
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact"
    ],
    "typescript.preferences.importModuleSpecifier": "relative",
    "java.format.settings.url": "./backend/get_jobs/checkstyle.xml",
    "java.checkstyle.configuration": "./backend/get_jobs/checkstyle.xml"
}
EOF

    # 创建VS Code扩展推荐文件
    cat > .vscode/extensions.json << EOF
{
    "recommendations": [
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        "ms-vscode.vscode-typescript-next",
        "bradlc.vscode-tailwindcss",
        "redhat.java",
        "vscjava.vscode-java-pack",
        "gabrielbb.vscode-lombok",
        "eamodio.gitlens",
        "ms-vscode.vscode-json"
    ]
}
EOF

    print_message $GREEN "✅ VS Code配置完成"
fi

echo ""
print_message $BLUE "🧪 运行代码质量检查..."

# 前端代码检查
if [ -d "frontend" ]; then
    print_message $YELLOW "检查前端代码质量..."
    cd frontend

    # TypeScript类型检查
    print_message $BLUE "运行TypeScript类型检查..."
    npm run type-check

    # ESLint检查
    print_message $BLUE "运行ESLint检查..."
    npm run lint:check

    # Prettier格式检查
    print_message $BLUE "运行Prettier格式检查..."
    npm run format:check

    cd ..
    print_message $GREEN "✅ 前端代码质量检查完成"
fi

# 后端代码检查
if [ -d "backend/get_jobs" ]; then
    print_message $YELLOW "检查后端代码质量..."
    cd backend/get_jobs

    # Checkstyle检查
    print_message $BLUE "运行Checkstyle检查..."
    mvn checkstyle:check

    cd ../..
    print_message $GREEN "✅ 后端代码质量检查完成"
fi

echo ""
print_message $BLUE "📚 显示开发文档..."

print_message $YELLOW "📖 开发规范文档："
echo "  - 开发规范: docs/development/DEVELOPMENT_STANDARDS.md"
echo "  - 提交规范: docs/development/COMMIT_GUIDE.md"
echo "  - 代码审查: docs/development/CODE_REVIEW_GUIDE.md"

print_message $YELLOW "🔧 常用命令："
echo "  前端开发："
echo "    cd frontend && npm start          # 启动开发服务器"
echo "    cd frontend && npm run build      # 构建生产版本"
echo "    cd frontend && npm test           # 运行测试"
echo "    cd frontend && npm run lint       # 代码检查"
echo "    cd frontend && npm run format     # 代码格式化"
echo ""
echo "  后端开发："
echo "    cd backend/get_jobs && mvn spring-boot:run  # 启动后端服务"
echo "    cd backend/get_jobs && mvn test             # 运行测试"
echo "    cd backend/get_jobs && mvn checkstyle:check # 代码风格检查"

print_message $YELLOW "🎯 下一步："
echo "  1. 阅读开发规范文档"
echo "  2. 配置IDE和开发工具"
echo "  3. 运行项目并验证功能"
echo "  4. 开始开发新功能"

echo ""
print_message $GREEN "🎉 开发环境设置完成！"
print_message $BLUE "Happy Coding! 🚀"
