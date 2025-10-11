#!/usr/bin/env node

/**
 * 复制前端构建产物到根目录
 *
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 * @updated 2025-10-11 - 使用公共工具函数，改进错误处理
 */

const { copyDir, exists, getDirSize, formatSize } = require('./utils/file-utils');

const SOURCE_DIR = 'frontend/build';
const DEST_DIR = 'build';

console.log('📂 正在复制前端构建产物...');

try {
  // 检查源目录是否存在
  if (!exists(SOURCE_DIR)) {
    console.error(`❌ 错误: 源目录不存在: ${SOURCE_DIR}`);
    console.log('💡 提示: 请先运行 npm run build:frontend 构建前端项目');
    process.exit(1);
  }

  // 执行复制
  copyDir(SOURCE_DIR, DEST_DIR);

  // 获取复制后的目录大小
  const size = getDirSize(DEST_DIR);
  console.log(`✅ 构建文件复制成功! (大小: ${formatSize(size)})`);
  console.log(`   源目录: ${SOURCE_DIR}`);
  console.log(`   目标目录: ${DEST_DIR}`);
} catch (error) {
  console.error('❌ 复制构建文件失败:', error.message);
  process.exit(1);
}
