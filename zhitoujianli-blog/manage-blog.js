#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const POSTS_DIR = './src/data/post';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

async function createPost() {
  console.log('\n📝 创建新博客文章\n');
  
  const title = await askQuestion('文章标题: ');
  const excerpt = await askQuestion('文章摘要: ');
  const category = await askQuestion('分类 (求职指南/职场建议/产品动态): ');
  const tags = await askQuestion('标签 (用逗号分隔): ');
  const author = await askQuestion('作者: ');
  
  const slug = generateSlug(title);
  const date = new Date();
  const publishDate = formatDate(date);
  
  const frontMatter = `---
title: "${title}"
excerpt: "${excerpt}"
category: "${category}"
tags: [${tags.split(',').map(tag => `"${tag.trim()}"`).join(', ')}]
image: "~/assets/images/default.png"
publishDate: ${publishDate}T00:00:00.000Z
author: "${author}"
---

# ${title}

${excerpt}

## 内容

在这里编写您的博客内容...

## 总结

总结文章要点...
`;

  const filename = `${slug}.md`;
  const filepath = path.join(POSTS_DIR, filename);
  
  if (fs.existsSync(filepath)) {
    console.log(`❌ 文件已存在: ${filename}`);
    return;
  }
  
  fs.writeFileSync(filepath, frontMatter);
  console.log(`✅ 文章创建成功: ${filename}`);
  console.log(`📁 路径: ${filepath}`);
}

async function listPosts() {
  console.log('\n📚 现有博客文章\n');
  
  const files = fs.readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.md'))
    .sort();
  
  if (files.length === 0) {
    console.log('暂无文章');
    return;
  }
  
  files.forEach((file, index) => {
    const filepath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(filepath, 'utf8');
    const titleMatch = content.match(/title:\s*"([^"]*)"/);
    const title = titleMatch ? titleMatch[1] : file;
    
    console.log(`${index + 1}. ${title} (${file})`);
  });
}

async function deletePost() {
  await listPosts();
  
  const filename = await askQuestion('\n要删除的文件名 (包含.md): ');
  const filepath = path.join(POSTS_DIR, filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(`❌ 文件不存在: ${filename}`);
    return;
  }
  
  const confirm = await askQuestion(`确定要删除 "${filename}" 吗? (y/N): `);
  
  if (confirm.toLowerCase() === 'y') {
    fs.unlinkSync(filepath);
    console.log(`✅ 文章删除成功: ${filename}`);
  } else {
    console.log('❌ 取消删除');
  }
}

async function main() {
  console.log('🎯 智投简历博客管理工具\n');
  console.log('1. 创建新文章');
  console.log('2. 查看所有文章');
  console.log('3. 删除文章');
  console.log('4. 退出\n');
  
  const choice = await askQuestion('请选择操作 (1-4): ');
  
  switch (choice) {
    case '1':
      await createPost();
      break;
    case '2':
      await listPosts();
      break;
    case '3':
      await deletePost();
      break;
    case '4':
      console.log('👋 再见!');
      rl.close();
      return;
    default:
      console.log('❌ 无效选择');
  }
  
  console.log('\n');
  const continueChoice = await askQuestion('继续使用? (Y/n): ');
  
  if (continueChoice.toLowerCase() !== 'n') {
    await main();
  } else {
    console.log('👋 再见!');
    rl.close();
  }
}

main().catch(console.error);
