# 智投简历博客自动发布系统

## 🚀 一键发布流程

### 使用方法
```bash
./blog_publisher.sh "博客标题" "博客内容文件路径"
```

### 示例
```bash
# 发布简历优化博客
./blog_publisher.sh "你的简历，为什么总被刷掉？AI智能投递帮你逆转局面！" "/root/zhitoujianli/blog_updated.md"
```

## ⚙️ 自动化功能

### ✅ SEO优化
- 自动生成SEO友好的URL
- 完整的meta标签配置
- Open Graph和Twitter Card
- 结构化数据(JSON-LD)
- 自动提取描述和关键词

### ✅ 内容处理
- Markdown转HTML
- 自动添加内部链接
- 响应式设计
- 社交媒体分享功能

### ✅ 发布流程
- 生成完整HTML页面
- 自动部署到zhitoujianli.com
- 生成访问链接
- 更新sitemap

## 📁 文件结构

```
/root/zhitoujianli/
├── blog_publisher.sh          # 主发布脚本
├── blog_content/              # 博客内容目录
├── blog_templates/            # 模板目录
├── blog_output/              # 输出目录
└── blog_updated.md           # 示例博客内容
```

## 🔧 配置说明

### 域名配置
- 主域名: `zhitoujianli.com`
- 博客路径: `/blog`
- 自动生成URL: `https://zhitoujianli.com/blog/文章slug`

### SEO配置
- 自动提取标题和描述
- 关键词: 简历优化,AI智能投递,求职工具
- 作者: 智投简历团队
- 发布时间: 自动生成

### 部署配置
- 需要配置SSH密钥
- 服务器路径: `/var/www/html/blog/`
- 自动重载Nginx

## 📊 发布效果

### 自动生成内容
- ✅ 完整的HTML页面
- ✅ SEO优化的meta标签
- ✅ 响应式设计
- ✅ 社交媒体分享
- ✅ 内部链接结构
- ✅ 相关文章推荐

### 访问地址
- 博客URL: `https://zhitoujianli.com/blog/文章slug`
- 本地预览: `/root/zhitoujianli/blog_output/文章slug.html`

## 🎯 使用流程

1. **准备内容**: 将博客内容保存为Markdown文件
2. **执行发布**: 运行发布脚本
3. **自动处理**: 脚本自动完成SEO优化和HTML生成
4. **部署上线**: 自动部署到zhitoujianli.com
5. **访问验证**: 通过生成的URL访问博客

## 🔄 后续优化

- 添加图片自动处理
- 集成评论系统
- 添加阅读统计
- 自动生成sitemap
- 集成CDN加速
