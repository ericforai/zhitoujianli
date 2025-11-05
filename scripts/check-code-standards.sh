#!/bin/bash
# 代码规范自动检查脚本

set -e

echo "🔍 智投简历 - 代码规范检查"
echo "================================"

BACKEND_SRC="backend/get_jobs/src/main/java"
ERRORS=0

# 检查1: 重复的用户ID处理逻辑
echo ""
echo "📋 检查1: 查找重复的用户ID处理逻辑..."
DUPLICATE_USERID=$(grep -r "userId\.replaceAll\(" "$BACKEND_SRC" --exclude-dir=util 2>/dev/null || true)
if [ -n "$DUPLICATE_USERID" ]; then
    echo "❌ 发现重复的用户ID处理逻辑："
    echo "$DUPLICATE_USERID"
    echo "   👉 请使用 UserContextUtil.sanitizeUserId()"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ 通过"
fi

# 检查2: 硬编码用户数据路径
echo ""
echo "📋 检查2: 查找硬编码用户数据路径..."
HARDCODED_PATH=$(grep -r '"user_data/[a-zA-Z0-9_]*/' "$BACKEND_SRC" | grep -v "UserContextUtil" | grep -v "测试" || true)
if [ -n "$HARDCODED_PATH" ]; then
    echo "⚠️  发现可能的硬编码路径："
    echo "$HARDCODED_PATH"
    echo "   👉 建议使用 UserContextUtil.getSafeUserDataPath()"
    # 这只是警告，不算错误
fi

# 检查3: 配置保存方法检查
echo ""
echo "📋 检查3: 检查配置保存逻辑..."
if grep -r "saveConfig" "$BACKEND_SRC" | grep -v "loadConfig" | grep -v "putAll" > /dev/null 2>&1; then
    echo "⚠️  请确认 saveConfig 方法是否使用了合并模式（putAll）"
fi

# 检查4: 检查是否有@符号保留的正则表达式
echo ""
echo "📋 检查4: 查找可能保留@符号的正则表达式..."
PRESERVE_AT=$(grep -r 'replaceAll.*\[@\]' "$BACKEND_SRC" 2>/dev/null || true)
if [ -n "$PRESERVE_AT" ]; then
    echo "❌ 发现保留@符号的正则表达式："
    echo "$PRESERVE_AT"
    echo "   👉 用户ID中的@必须被替换为_"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ 通过"
fi

# 检查5: 检查工具方法是否被正确导入
echo ""
echo "📋 检查5: 检查 UserContextUtil 导入..."
CONTROLLERS=$(find "$BACKEND_SRC/controller" -name "*.java" 2>/dev/null || true)
for file in $CONTROLLERS; do
    if grep -q "getCurrentUserId\|sanitizeUserId\|getUserDataPath" "$file" 2>/dev/null; then
        if ! grep -q "import.*UserContextUtil" "$file" 2>/dev/null; then
            echo "❌ $file 使用了 UserContextUtil 但未导入"
            ERRORS=$((ERRORS + 1))
        fi
    fi
done
echo "✅ 导入检查完成"

# 总结
echo ""
echo "================================"
if [ $ERRORS -eq 0 ]; then
    echo "✅ 所有检查通过！"
    exit 0
else
    echo "❌ 发现 $ERRORS 个错误，请修复后再提交"
    echo ""
    echo "📖 参考文档: docs/CODING_STANDARDS.md"
    exit 1
fi

