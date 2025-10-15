#!/bin/bash

# Git合并冲突检测脚本
# 用于在CI/CD和pre-commit阶段检测未解决的合并冲突

set -e

echo "🔍 检查Git合并冲突..."

# 检查是否有合并冲突标记
CONFLICT_MARKERS=(
    "<<<<<<< HEAD"
    "======="
    ">>>>>>> "
    "<<<<<<< "
    ">>>>>>>"
)

CONFLICT_FILES=()
TOTAL_CONFLICTS=0

# 遍历所有源代码文件
CHANGED_FILES=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.java" | grep -v node_modules | grep -v target | head -100)

for file in $CHANGED_FILES; do
    # 跳过二进制文件和目录
    if [ -f "$file" ] && [ ! -d "$file" ]; then
        # 检查文件是否包含冲突标记
        for marker in "${CONFLICT_MARKERS[@]}"; do
            if grep -q "$marker" "$file" 2>/dev/null; then
                CONFLICT_FILES+=("$file")
                CONFLICTS_IN_FILE=$(grep -c "$marker" "$file" 2>/dev/null || echo "0")
                TOTAL_CONFLICTS=$((TOTAL_CONFLICTS + CONFLICTS_IN_FILE))

                echo "❌ 发现合并冲突标记在文件: $file"
                echo "   标记: $marker (出现 $CONFLICTS_IN_FILE 次)"

                # 显示冲突的具体行
                echo "   冲突行:"
                grep -n "$marker" "$file" 2>/dev/null | head -5 | sed 's/^/     /'
                echo ""
                break
            fi
        done
    fi
done

# 报告结果
if [ ${#CONFLICT_FILES[@]} -gt 0 ]; then
    echo "🚨 发现 $TOTAL_CONFLICTS 个未解决的合并冲突！"
    echo ""
    echo "📋 冲突文件列表:"
    printf '%s\n' "${CONFLICT_FILES[@]}" | sort -u | sed 's/^/   - /'
    echo ""
    echo "🔧 解决方法:"
    echo "   1. 手动编辑冲突文件，选择要保留的代码"
    echo "   2. 删除所有冲突标记 (<<<<<<< HEAD, =======, >>>>>>> commit-hash)"
    echo "   3. 测试修改后的代码"
    echo "   4. 重新提交"
    echo ""
    echo "💡 预防措施:"
    echo "   - 在合并分支前运行: git status"
    echo "   - 使用 git merge --no-ff 进行显式合并"
    echo "   - 配置编辑器显示合并冲突标记"
    echo ""
    exit 1
else
    echo "✅ 未发现合并冲突标记"
    exit 0
fi
