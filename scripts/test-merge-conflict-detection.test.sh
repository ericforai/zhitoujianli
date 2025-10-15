#!/bin/bash

# 测试Git合并冲突检测脚本

set -e

echo "🧪 测试Git合并冲突检测功能..."

# 创建测试目录
TEST_DIR="/tmp/merge-conflict-test"
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# 创建测试文件
cat > test-conflict.ts << 'EOF'
import React from 'react';

<<<<<<< HEAD
const Component = () => {
  return <div>Version A</div>;
};
=======
const Component = () => {
  return <div>Version B</div>;
};
>>>>>>> branch-b

export default Component;
EOF

cat > test-no-conflict.ts << 'EOF'
import React from 'react';

const Component = () => {
  return <div>No conflicts here</div>;
};

export default Component;
EOF

# 复制检测脚本
cp /root/zhitoujianli/scripts/check-merge-conflicts.sh ./check-merge-conflicts.sh
chmod +x ./check-merge-conflicts.sh

echo "📝 测试1: 检测包含合并冲突的文件..."
if ./check-merge-conflicts.sh > /dev/null 2>&1; then
    echo "❌ 测试失败: 应该检测到合并冲突"
    exit 1
else
    echo "✅ 测试通过: 正确检测到合并冲突"
fi

# 移除冲突文件
rm test-conflict.ts

echo "📝 测试2: 检测无冲突的文件..."
if ./check-merge-conflicts.sh > /dev/null 2>&1; then
    echo "✅ 测试通过: 正确识别无冲突状态"
else
    echo "❌ 测试失败: 应该通过无冲突检测"
    exit 1
fi

# 清理
cd /
rm -rf "$TEST_DIR"

echo "🎉 所有测试通过！Git合并冲突检测功能正常工作。"
