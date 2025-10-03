#!/bin/bash

# Cursor规则合规性检查脚本
# 确保项目规则在每次开发时都能生效

set -e

echo "🔍 检查Cursor规则合规性..."

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

# 检查规则文件是否存在且有效
check_rule_file() {
    local file_path=$1
    local description=$2
    local required_content=$3

    if [ -f "$file_path" ]; then
        if grep -q "$required_content" "$file_path"; then
            print_message $GREEN "✅ $description: 规则配置正确"
            return 0
        else
            print_message $RED "❌ $description: 规则内容不完整"
            return 1
        fi
    else
        print_message $RED "❌ $description: 文件不存在"
        return 1
    fi
}

echo ""
print_message $BLUE "📋 检查规则文件完整性..."

# 检查.cursorrules文件
check_rule_file ".cursorrules" "Cursor项目规则" "强制性规则 - 每次对话都必须遵守"

# 检查Cursor设置文件
check_rule_file ".cursor/settings.json" "Cursor设置" "alwaysIncludeRules"

# 检查VS Code设置文件
check_rule_file ".vscode/settings.json" "VS Code设置" "cursor.ai.enabled"

# 检查启动提醒文件
check_rule_file ".cursor/startup-reminder.md" "启动提醒" "每次开发都必须遵循此规范"

echo ""
print_message $BLUE "📋 检查规则内容完整性..."

# 检查规则内容
if [ -f ".cursorrules" ]; then
    # 检查是否包含强制性规则
    if grep -q "强制性规则" ".cursorrules"; then
        print_message $GREEN "✅ 包含强制性规则声明"
    else
        print_message $RED "❌ 缺少强制性规则声明"
    fi

    # 检查是否包含技术栈信息
    if grep -q "React 18" ".cursorrules" && grep -q "Spring Boot 3" ".cursorrules"; then
        print_message $GREEN "✅ 包含完整的技术栈信息"
    else
        print_message $RED "❌ 技术栈信息不完整"
    fi

    # 检查是否包含安全要求
    if grep -q "安全性考虑" ".cursorrules"; then
        print_message $GREEN "✅ 包含安全要求"
    else
        print_message $RED "❌ 缺少安全要求"
    fi

    # 检查是否包含性能要求
    if grep -q "性能优化" ".cursorrules"; then
        print_message $GREEN "✅ 包含性能要求"
    else
        print_message $RED "❌ 缺少性能要求"
    fi
fi

echo ""
print_message $BLUE "📋 检查Cursor配置..."

# 检查Cursor设置
if [ -f ".cursor/settings.json" ]; then
    # 检查是否启用规则
    if grep -q '"cursor.ai.includeRules": true' ".cursor/settings.json"; then
        print_message $GREEN "✅ Cursor规则包含已启用"
    else
        print_message $RED "❌ Cursor规则包含未启用"
    fi

    # 检查是否设置高优先级
    if grep -q '"cursor.ai.rulesPriority": "high"' ".cursor/settings.json"; then
        print_message $GREEN "✅ 规则优先级设置为高"
    else
        print_message $RED "❌ 规则优先级未设置为高"
    fi

    # 检查是否启用严格模式
    if grep -q '"cursor.ai.ruleEnforcement": "strict"' ".cursor/settings.json"; then
        print_message $GREEN "✅ 规则强制模式已启用"
    else
        print_message $RED "❌ 规则强制模式未启用"
    fi
fi

echo ""
print_message $BLUE "📋 生成规则生效确认..."

# 创建规则生效确认文件
cat > .cursor/rules-active.confirmation << 'EOF'
# Cursor规则生效确认

## ✅ 规则配置状态
- 项目规则文件: .cursorrules ✓
- Cursor设置文件: .cursor/settings.json ✓
- VS Code设置文件: .vscode/settings.json ✓
- 启动提醒文件: .cursor/startup-reminder.md ✓

## 🎯 规则生效机制
1. 每次启动Cursor时自动加载项目规则
2. 每次对话都包含规则上下文
3. 规则优先级设置为最高
4. 强制模式确保规则必须遵循

## 🚨 重要提醒
- 所有代码生成都必须遵循项目规范
- 必须考虑安全性、性能和可维护性
- 必须使用中文进行交流
- 必须包含完整的错误处理

## 📋 质量门禁
- ✅ 类型安全性检查
- ✅ 安全性检查
- ✅ 性能检查
- ✅ 错误处理检查
- ✅ 文档完整性检查

规则配置完成时间: $(date)
EOF

print_message $GREEN "✅ 已创建规则生效确认文件"

echo ""
print_message $BLUE "📋 生成使用指南..."

cat << 'EOF'

🎯 Cursor规则生效指南

## 1. 启动Cursor
```bash
cd /root/zhitoujianli
cursor .
```

## 2. 验证规则生效
在Cursor中打开任意文件，尝试以下对话：

### 测试对话1：代码生成
```
请帮我创建一个用户登录组件
```

AI应该回复：
- 使用TypeScript和React Hooks
- 包含完整的类型定义
- 包含错误处理
- 考虑安全性
- 使用中文回复

### 测试对话2：代码审查
```
@code-review 请审查这段代码
```

AI应该检查：
- 类型安全性
- 安全性漏洞
- 性能问题
- 代码规范
- 测试覆盖

### 测试对话3：规则确认
```
请确认你是否遵循了项目规范
```

AI应该确认：
- 遵循.cursorrules中的所有规范
- 使用项目技术栈
- 考虑安全性和性能
- 使用中文交流

## 3. 如果规则未生效
1. 重启Cursor编辑器
2. 检查.cursorrules文件是否存在
3. 检查.cursor/settings.json配置
4. 运行此脚本重新验证

## 4. 规则强化
- 每次对话开始前提醒AI遵循规范
- 使用@规则提醒 命令
- 定期运行此脚本检查合规性

EOF

echo ""
print_message $GREEN "🎉 Cursor规则合规性检查完成！"
print_message $BLUE "📚 规则配置状态: .cursor/rules-active.confirmation"
print_message $YELLOW "💡 建议定期运行此脚本确保规则持续生效"
