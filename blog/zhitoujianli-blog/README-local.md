# 智投简历博客 - 本地管理指南

本博客系统已配置为本地存储，所有博客内容存储在本地文件系统中，无需依赖 GitHub 或其他外部服务。

## 🚀 快速开始

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 访问网站
- 博客首页：http://localhost:4321/blog/
- 后台管理：http://localhost:4321/blog/decapcms/index.html

## 📝 管理博客内容

### 方法一：使用命令行工具（推荐）

#### 启动博客管理工具
```bash
npm run blog
```

#### 查看所有文章
```bash
npm run blog:list
```

#### 功能说明
- ✅ 创建新文章
- ✅ 查看所有文章列表
- ✅ 删除文章
- ✅ 自动生成 URL 友好的文件名

### 方法二：直接编辑文件

博客文章存储在 `src/data/post/` 目录中，您可以直接编辑 Markdown 文件。

#### 文章格式示例
```markdown
---
title: "文章标题"
excerpt: "文章摘要"
category: "求职指南"
tags: ["简历", "求职"]
image: "~/assets/images/default.png"
publishDate: 2024-01-01T00:00:00.000Z
author: "作者名称"
---

# 文章标题

文章内容...
```

## 🎯 分类说明

- **求职指南** - 求职技巧、面试准备等
- **职场建议** - 职场发展、工作技能等  
- **产品动态** - 智投简历产品更新、功能介绍等

## 📁 目录结构

```
src/data/post/           # 博客文章目录
├── zhitoujianli-introduction.md
├── resume-optimization-tips.md
└── interview-preparation-guide.md
```

## 🔧 高级配置

### 自定义图片
将图片放在 `src/assets/images/` 目录中，然后在文章中引用：
```markdown
image: "~/assets/images/your-image.png"
```

### 修改网站配置
编辑 `src/config.yaml` 文件可修改：
- 网站标题和描述
- SEO 设置
- 社交媒体链接

## 🚀 部署到生产环境

### 1. 构建项目
```bash
npm run build
```

### 2. 部署选项
- **Vercel**: 直接连接 GitHub 仓库
- **Netlify**: 支持拖放部署
- **服务器**: 将 `dist/` 目录上传到服务器

### 3. 商业化部署
当需要商业化时，可以：
- 部署到云服务器
- 配置域名和 SSL
- 设置 CDN 加速
- 添加数据库支持（如需要）

## 📋 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run blog             # 博客管理工具
npm run blog:list        # 查看文章列表

# 构建
npm run build            # 构建生产版本
npm run preview          # 预览构建结果

# 检查
npm run check            # 检查代码质量
npm run fix              # 修复代码格式
```

## 🔄 数据备份

定期备份 `src/data/post/` 目录中的文章文件，确保内容安全。

## 🆘 常见问题

### Q: 如何修改网站样式？
A: 编辑 `src/assets/styles/` 目录中的 CSS 文件或修改 Tailwind 配置。

### Q: 如何添加新页面？
A: 在 `src/pages/` 目录中添加新的 `.astro` 文件。

### Q: 图片不显示怎么办？
A: 确保图片路径正确，使用 `~/assets/images/` 前缀。

---

💡 **提示**: 这是一个完全本地化的博客系统，所有内容都存储在本地，便于开发和自定义。
