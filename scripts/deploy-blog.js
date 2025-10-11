#!/usr/bin/env node

/**
 * 部署博客到主站 /blog/ 路径
 *
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 * @updated 2025-10-11 - 使用公共工具函数，改进错误处理
 */

const { copyDir, exists, getDirSize, formatSize } = require('./utils/file-utils');

const BLOG_SOURCE_DIR = 'blog/zhitoujianli-blog/dist';
const BLOG_DEST_DIR = 'build/blog';

console.log('📝 正在部署博客到 /blog/ 路径...');

try {
  // 检查博客构建产物是否存在
  if (!exists(BLOG_SOURCE_DIR)) {
    console.error(`❌ 错误: 博客构建产物不存在: ${BLOG_SOURCE_DIR}`);
    console.log('💡 提示: 请先运行 npm run build:blog 构建博客项目');
    process.exit(1);
  }

  // 复制博客构建输出到主站build/blog目录
  copyDir(BLOG_SOURCE_DIR, BLOG_DEST_DIR);

  // 获取复制后的目录大小
  const size = getDirSize(BLOG_DEST_DIR);
  console.log(`✅ 博客部署成功! (大小: ${formatSize(size)})`);
  console.log(`   源目录: ${BLOG_SOURCE_DIR}`);
  console.log(`   目标目录: ${BLOG_DEST_DIR}`);
} catch (error) {
  console.error('❌ 部署博客失败:', error.message);
  process.exit(1);
}
