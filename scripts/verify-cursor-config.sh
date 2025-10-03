#!/bin/bash

# Cursor配置验证脚本
# 用于验证Cursor项目配置是否正确

set -e

echo "🔍 验证Cursor项目配置..."

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

# 检查文件是否存在
check_file() {
    local file_path=$1
    local description=$2

    if [ -f "$file_path" ]; then
        print_message $GREEN "✅ $description: $file_path"
        return 0
    else
        print_message $RED "❌ $description: $file_path (文件不存在)"
        return 1
    fi
}

# 检查目录是否存在
check_directory() {
    local dir_path=$1
    local description=$2

    if [ -d "$dir_path" ]; then
        print_message $GREEN "✅ $description: $dir_path"
        return 0
    else
        print_message $RED "❌ $description: $dir_path (目录不存在)"
        return 1
    fi
}

echo ""
print_message $BLUE "📋 检查Cursor配置文件..."

# 检查主要配置文件
check_file ".cursorrules" "Cursor项目规则文件"
check_file ".cursor/settings.json" "Cursor设置文件"
check_file ".cursor/prompts.json" "Cursor提示词文件"
check_file ".cursor/chat-templates.json" "Cursor聊天模板文件"

echo ""
print_message $BLUE "📋 检查开发规范文件..."

# 检查开发规范文档
check_file "docs/development/README.md" "开发文档中心"
check_file "docs/development/DEVELOPMENT_STANDARDS.md" "开发规范文档"
check_file "docs/development/COMMIT_GUIDE.md" "提交规范指南"
check_file "docs/development/CODE_REVIEW_GUIDE.md" "代码审查指南"
check_file "docs/development/CURSOR_USAGE_GUIDE.md" "Cursor使用指南"

echo ""
print_message $BLUE "📋 检查代码质量配置..."

# 检查前端配置
check_file "frontend/.eslintrc.js" "ESLint配置文件"
check_file "frontend/.prettierrc" "Prettier配置文件"
check_file "frontend/.prettierignore" "Prettier忽略文件"

# 检查后端配置
check_file "backend/get_jobs/checkstyle.xml" "Checkstyle配置文件"
check_file "backend/get_jobs/.editorconfig" "EditorConfig文件"

echo ""
print_message $BLUE "📋 检查Git配置..."

# 检查Git配置
check_file "commitlint.config.js" "Commitlint配置文件"
check_directory ".husky" "Husky配置目录"
check_file ".husky/pre-commit" "Pre-commit钩子"
check_file ".husky/commit-msg" "Commit-msg钩子"
check_file ".husky/pre-push" "Pre-push钩子"

echo ""
print_message $BLUE "📋 检查GitHub配置..."

# 检查GitHub配置
check_directory ".github" "GitHub配置目录"
check_directory ".github/workflows" "GitHub Actions工作流目录"
check_file ".github/workflows/code-quality.yml" "代码质量检查工作流"
check_file ".github/workflows/pr-check.yml" "PR检查工作流"
check_file ".github/PULL_REQUEST_TEMPLATE.md" "PR模板"
check_directory ".github/ISSUE_TEMPLATE" "Issue模板目录"
check_file ".github/ISSUE_TEMPLATE/bug_report.md" "Bug报告模板"
check_file ".github/ISSUE_TEMPLATE/feature_request.md" "功能请求模板"

echo ""
print_message $BLUE "📋 检查工具脚本..."

# 检查工具脚本
check_file "scripts/setup-dev-environment.sh" "开发环境设置脚本"
check_file "scripts/verify-cursor-config.sh" "Cursor配置验证脚本"

echo ""
print_message $BLUE "📋 验证配置文件内容..."

# 验证.cursorrules文件内容
if [ -f ".cursorrules" ]; then
    if grep -q "智投简历项目" ".cursorrules"; then
        print_message $GREEN "✅ .cursorrules包含项目特定配置"
    else
        print_message $YELLOW "⚠️ .cursorrules可能缺少项目特定配置"
    fi

    if grep -q "React 18" ".cursorrules"; then
        print_message $GREEN "✅ .cursorrules包含前端技术栈配置"
    else
        print_message $YELLOW "⚠️ .cursorrules可能缺少前端技术栈配置"
    fi

    if grep -q "Spring Boot 3" ".cursorrules"; then
        print_message $GREEN "✅ .cursorrules包含后端技术栈配置"
    else
        print_message $YELLOW "⚠️ .cursorrules可能缺少后端技术栈配置"
    fi
fi

# 验证Cursor设置文件
if [ -f ".cursor/settings.json" ]; then
    if grep -q "cursor.ai.enabled" ".cursor/settings.json"; then
        print_message $GREEN "✅ Cursor AI功能已启用"
    else
        print_message $YELLOW "⚠️ Cursor AI功能可能未启用"
    fi
fi

echo ""
print_message $BLUE "📋 生成Cursor使用建议..."

echo ""
print_message $YELLOW "🎯 Cursor使用建议："
echo ""
echo "1. 启动Cursor后，AI助手会自动加载项目规则"
echo "2. 使用以下方式与AI交互："
echo "   - 直接提问：'请帮我创建一个用户登录组件'"
echo "   - 使用提示词：'@code-review 请审查这段代码'"
echo "   - 使用模板：'我需要开发一个新功能：用户管理'"
echo ""
echo "3. 常用提示词："
echo "   - @code-review: 代码审查"
echo "   - @refactor: 代码重构"
echo "   - @debug: 问题调试"
echo "   - @optimize: 性能优化"
echo "   - @security: 安全检查"
echo "   - @test: 测试生成"
echo "   - @documentation: 文档编写"
echo ""
echo "4. 查看详细使用指南："
echo "   code docs/development/CURSOR_USAGE_GUIDE.md"

echo ""
print_message $BLUE "📋 测试Cursor配置..."

# 创建一个测试文件来验证Cursor配置
cat > cursor-test.ts << 'EOF'
// Cursor配置测试文件
// 请删除此文件，它仅用于测试Cursor配置

interface TestProps {
  name: string;
  age: number;
}

const TestComponent: React.FC<TestProps> = ({ name, age }) => {
  return (
    <div className="p-4">
      <h1>Hello {name}, you are {age} years old</h1>
    </div>
  );
};

export default TestComponent;
EOF

print_message $GREEN "✅ 已创建测试文件 cursor-test.ts"
print_message $BLUE "💡 请在Cursor中打开此文件，测试AI助手是否正常工作"

echo ""
print_message $GREEN "🎉 Cursor配置验证完成！"
print_message $BLUE "📚 查看完整使用指南: docs/development/CURSOR_USAGE_GUIDE.md"
print_message $YELLOW "🧪 测试完成后请删除 cursor-test.ts 文件"
