# 智投简历博客服务技术文档

## 🎯 服务概述

智投简历博客服务是基于 **Astro** 构建的现代化博客系统，采用 **TypeScript** 开发，支持 **MDX** 内容格式，集成 **Tailwind CSS** 样式框架。

### 🚀 技术栈

- **前端框架**: Astro 5.12.9
- **开发语言**: TypeScript 5.8.3
- **样式框架**: Tailwind CSS 3.4.17
- **内容格式**: MDX (Markdown + JSX)
- **构建工具**: Vite (内置于Astro)
- **图标系统**: Astro Icon + Iconify

## 📁 项目结构

```
zhitoujianli-blog/
├── src/
│   ├── components/           # 可复用组件
│   │   ├── blog/            # 博客专用组件
│   │   ├── common/          # 通用组件
│   │   └── widgets/         # 小部件组件
│   ├── content/             # 内容集合
│   │   └── post/           # 博客文章
│   ├── layouts/            # 页面布局
│   ├── pages/              # 页面路由
│   │   ├── blog/           # 博客页面
│   │   └── [...]/          # 其他页面
│   ├── utils/              # 工具函数
│   └── config.yaml         # 站点配置
├── public/                 # 静态资源
│   ├── images/            # 图片资源
│   └── favicon.ico        # 网站图标
├── astro.config.ts        # Astro配置
├── tailwind.config.js     # Tailwind配置
└── package.json           # 项目依赖
```

## ⚙️ 配置详解

### Astro 配置 (astro.config.ts)

```typescript
export default defineConfig({
  output: 'static',                    // 静态站点生成
  site: 'http://localhost:4321',       // 站点基础URL
  base: '/blog/',                      // 子路径部署

  integrations: [
    tailwind({
      applyBaseStyles: false,          // 自定义样式基础
    }),
    sitemap(),                         // 自动生成站点地图
    mdx(),                            // MDX内容支持
    icon({                            // 图标集成
      include: {
        tabler: ['*'],
        'flat-color-icons': [...]
      },
    }),
    compress({                        // 资源压缩
      CSS: true,
      HTML: true,
      JavaScript: true,
      SVG: false,
    }),
  ],

  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin],     // 阅读时间
    rehypePlugins: [
      responsiveTablesRehypePlugin,               // 响应式表格
      lazyImagesRehypePlugin                      // 图片懒加载
    ],
  },
});
```

### 包管理配置 (package.json)

```json
{
  "scripts": {
    "dev": "astro dev",                 // 开发服务器
    "start": "astro dev",               // 启动别名
    "build": "astro build",             // 生产构建
    "preview": "astro preview",         // 预览构建结果
    "blog": "node manage-blog.js",      // 博客管理工具
    "blog:list": "ls -la src/data/post/" // 文章列表
  }
}
```

## 🛠️ 开发指南

### 本地开发

```bash
# 进入博客目录
cd zhitoujianli-blog

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 服务地址: http://localhost:4321/blog/
```

### 内容管理

#### 1. 创建新文章

```bash
# 使用博客管理工具
npm run blog

# 或手动创建
mkdir -p src/content/post/
touch src/content/post/new-article.mdx
```

#### 2. 文章格式

```mdx
---
publishDate: 2024-01-01T00:00:00Z
title: '文章标题'
excerpt: '文章摘要'
image: ~/assets/images/article-image.jpg
category: '分类'
tags:
  - 标签1
  - 标签2
metadata:
  canonical: https://example.com/article-url
---

# 文章内容

这里是文章正文内容...

## 二级标题

支持所有Markdown语法和JSX组件。

```

#### 3. 图片资源管理

```
public/images/
├── blog/              # 博客专用图片
│   ├── covers/       # 文章封面
│   └── content/      # 文章内容图片
└── common/           # 通用图片
```

### 组件开发

#### 创建博客组件

```typescript
// src/components/blog/BlogCard.astro
---
export interface Props {
  title: string;
  excerpt: string;
  publishDate: Date;
  category: string;
  image?: string;
}

const { title, excerpt, publishDate, category, image } = Astro.props;
---

<article class="blog-card">
  {image && (
    <img 
      src={image} 
      alt={title}
      class="w-full h-48 object-cover rounded-lg"
      loading="lazy"
    />
  )}
  
  <div class="p-6">
    <span class="text-sm text-blue-600 font-medium">{category}</span>
    <h3 class="text-xl font-bold mt-2 mb-3">{title}</h3>
    <p class="text-gray-600 mb-4">{excerpt}</p>
    <time class="text-sm text-gray-500">
      {publishDate.toLocaleDateString('zh-CN')}
    </time>
  </div>
</article>

<style>
.blog-card {
  @apply bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300;
}
</style>
```

### 样式系统

#### Tailwind 配置

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            // 自定义排版样式
          }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

## 🚀 部署配置

### 生产构建

```bash
# 构建静态文件
npm run build

# 预览构建结果
npm run preview

# 构建输出目录: dist/
```

### Nginx 配置

```nginx
# /etc/nginx/sites-available/zhitoujianli-blog
server {
    listen 80;
    server_name localhost;
    
    location /blog/ {
        alias /var/www/zhitoujianli-blog/dist/;
        try_files $uri $uri/ $uri.html /blog/404.html;
        
        # 缓存静态资源
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html/blog
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

## 📊 性能优化

### 1. 图片优化

```astro
---
// 使用 Astro 的内置图片优化
import { Image } from 'astro:assets';
import heroImage from '~/assets/images/hero.jpg';
---

<Image 
  src={heroImage} 
  alt="描述文字"
  width={800}
  height={400}
  format="webp"
  quality={80}
  loading="lazy"
/>
```

### 2. 代码分离

```astro
---
// 按需加载组件
const BlogSearch = lazy(() => import('~/components/blog/BlogSearch.astro'));
---

<BlogSearch client:load />
```

### 3. 缓存策略

```javascript
// astro.config.ts
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['astro'],
            utils: ['lodash.merge', 'limax']
          }
        }
      }
    }
  }
});
```

## 🔧 开发工具

### ESLint 配置

```javascript
// eslint.config.js
export default [
  {
    files: ['**/*.{js,ts,astro}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      'astro/no-unused-css-selector': 'warn',
    }
  }
];
```

### Prettier 配置

```javascript
// .prettierrc.cjs
module.exports = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};
```

## 📈 SEO 优化

### 1. 元数据管理

```astro
---
// src/layouts/BlogPost.astro
import { SEO } from '@astrolib/seo';

export interface Props {
  frontmatter: {
    title: string;
    description: string;
    publishDate: Date;
    image?: string;
  };
}

const { frontmatter } = Astro.props;
---

<html lang="zh-CN">
<head>
  <SEO
    title={frontmatter.title}
    description={frontmatter.description}
    canonical={Astro.url}
    openGraph={{
      basic: {
        title: frontmatter.title,
        type: 'article',
        image: frontmatter.image,
      },
      article: {
        publishedTime: frontmatter.publishDate.toISOString(),
        authors: ['智投简历团队'],
      }
    }}
    twitter={{
      creator: '@zhitoujianli',
      card: 'summary_large_image',
    }}
  />
</head>
<body>
  <slot />
</body>
</html>
```

### 2. 结构化数据

```astro
---
// 添加JSON-LD结构化数据
const jsonLD = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": frontmatter.title,
  "description": frontmatter.description,
  "datePublished": frontmatter.publishDate.toISOString(),
  "author": {
    "@type": "Organization",
    "name": "智投简历"
  }
};
---

<script type="application/ld+json" set:html={JSON.stringify(jsonLD)} />
```

## 🧪 测试策略

### 单元测试

```javascript
// 使用 Vitest 进行组件测试
import { describe, it, expect } from 'vitest';
import { render } from '@astrojs/test-utils';
import BlogCard from '~/components/blog/BlogCard.astro';

describe('BlogCard', () => {
  it('renders blog card with correct content', async () => {
    const result = await render(BlogCard, {
      props: {
        title: 'Test Article',
        excerpt: 'Test excerpt',
        publishDate: new Date('2024-01-01'),
        category: 'Technology'
      }
    });

    expect(result.html).toContain('Test Article');
    expect(result.html).toContain('Technology');
  });
});
```

### 性能测试

```bash
# 使用 Lighthouse CI
npm install -g @lhci/cli

# 运行性能测试
lhci autorun --collect.url=http://localhost:4321/blog/
```

## 🛡️ 安全配置

### 内容安全策略

```astro
---
// src/layouts/BaseLayout.astro
const csp = [
  "default-src 'self'",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self'",
  "font-src 'self' https://fonts.gstatic.com"
].join('; ');
---

<html>
<head>
  <meta http-equiv="Content-Security-Policy" content={csp} />
</head>
</html>
```

## 📚 常用命令

```bash
# 开发相关
npm run dev              # 启动开发服务器
npm run build           # 生产构建
npm run preview         # 预览构建结果

# 代码质量
npm run check           # 类型检查 + ESLint + Prettier
npm run fix             # 自动修复代码格式

# 内容管理
npm run blog            # 博客管理工具
npm run blog:list       # 查看文章列表

# 部署相关
npm run build           # 构建静态文件
```

## 🎯 最佳实践

1. **内容组织**: 使用清晰的分类和标签系统
2. **图片优化**: 优先使用 WebP 格式，启用懒加载
3. **SEO优化**: 完善元数据和结构化数据
4. **性能监控**: 定期进行Lighthouse测试
5. **代码质量**: 保持ESLint和Prettier配置的一致性
6. **用户体验**: 确保响应式设计和快速加载

## 🔗 相关链接

- [Astro 官方文档](https://astro.build/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [MDX 文档](https://mdxjs.com/)
- [TypeScript 文档](https://www.typescriptlang.org/)

---

*本文档与三层访问权限控制系统配合使用，博客服务作为公开访问层的重要组成部分。*