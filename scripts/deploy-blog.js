#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('📝 Deploying blog to /blog/ path...');

try {
  // 确保blog目录存在
  const blogDestPath = 'build/blog';
  
  // 复制博客构建输出到主站build/blog目录
  if (fs.existsSync('blog/zhitoujianli-blog/dist')) {
    copyDir('blog/zhitoujianli-blog/dist', blogDestPath);
    console.log('✅ Blog deployed successfully to /blog/ path!');
  } else {
    console.log('⚠️  Blog build not found. Please run npm run build:blog first.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error deploying blog:', error.message);
  process.exit(1);
}