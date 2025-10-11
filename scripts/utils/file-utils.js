#!/usr/bin/env node

/**
 * 文件操作工具函数
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

const fs = require('fs');
const path = require('path');

/**
 * 递归复制目录
 * @param {string} src - 源目录路径
 * @param {string} dest - 目标目录路径
 * @throws {Error} 当复制失败时抛出错误
 */
function copyDir(src, dest) {
  // 检查源目录是否存在
  if (!fs.existsSync(src)) {
    throw new Error(`源目录不存在: ${src}`);
  }

  // 创建目标目录（如果不存在）
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // 读取源目录中的所有条目
  const entries = fs.readdirSync(src, { withFileTypes: true });

  // 遍历并复制每个条目
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // 递归复制子目录
      copyDir(srcPath, destPath);
    } else {
      // 复制文件
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * 检查文件或目录是否存在
 * @param {string} filePath - 文件或目录路径
 * @returns {boolean} 存在返回true，否则返回false
 */
function exists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * 获取目录大小（递归计算所有文件大小）
 * @param {string} dirPath - 目录路径
 * @returns {number} 目录大小（字节）
 */
function getDirSize(dirPath) {
  let size = 0;

  if (!fs.existsSync(dirPath)) {
    return 0;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      size += getDirSize(entryPath);
    } else {
      const stats = fs.statSync(entryPath);
      size += stats.size;
    }
  }

  return size;
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小字符串
 */
function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

module.exports = {
  copyDir,
  exists,
  getDirSize,
  formatSize,
};
