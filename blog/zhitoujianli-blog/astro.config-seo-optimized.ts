import { defineConfig } from 'astro/config';
import path from 'path';
import { fileURLToPath } from 'url';

// Astro Integrations
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import type { AstroIntegration } from 'astro';
import compress from 'astro-compress';
import icon from 'astro-icon';

// Custom Integration
import astrowind from './vendor/integration';

// Remark/Rehype Plugins
import { lazyImagesRehypePlugin, readingTimeRemarkPlugin, responsiveTablesRehypePlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hasExternalScripts = true; // ✅ 启用外部脚本（Google Analytics等）
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
  hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

export default defineConfig({
  output: 'static',

  // ========================================
  // SEO优化：基础配置
  // ========================================

  // ✅ SEO优化：使用HTTPS和正式域名
  site:
    process.env.NODE_ENV === 'production'
      ? 'https://zhitoujianli.com' // ← 改为HTTPS和正式域名
      : 'http://localhost:4321',

  base: '/blog/',

  // ✅ SEO优化：统一URL格式
  trailingSlash: 'always', // ← 所有URL以/结尾

  // ✅ SEO优化：构建优化
  build: {
    inlineStylesheets: 'auto', // ← 内联小CSS提升性能
    format: 'directory', // ← 生成目录结构（SEO友好）
  },

  // ========================================
  // SEO优化：集成插件
  // ========================================
  integrations: [
    // Tailwind CSS
    tailwind({
      applyBaseStyles: false,
    }),

    // ✅ SEO优化：Sitemap完整配置
    sitemap({
      // 自定义sitemap
      filter: (page) => {
        // 排除管理页面和私有页面
        return !page.includes('/admin') && !page.includes('/private') && !page.includes('/404');
      },

      // 自定义每个URL的属性
      serialize(item) {
        const url = item.url;

        // 博客首页 - 最高优先级
        if (url.endsWith('/blog/')) {
          return {
            ...item,
            priority: 1.0,
            changefreq: 'daily',
          };
        }

        // 博客文章 - 高优先级
        if (url.includes('/blog/') && !url.includes('/category/') && !url.includes('/tag/')) {
          return {
            ...item,
            priority: 0.9,
            changefreq: 'weekly',
          };
        }

        // 分类和标签页 - 中等优先级
        if (url.includes('/category/') || url.includes('/tag/')) {
          return {
            ...item,
            priority: 0.7,
            changefreq: 'weekly',
          };
        }

        // 其他页面 - 默认优先级
        return {
          ...item,
          priority: 0.5,
          changefreq: 'monthly',
        };
      },

      // ✅ SEO优化：i18n支持
      i18n: {
        defaultLocale: 'zh-CN',
        locales: {
          'zh-CN': 'zh-CN',
          en: 'en-US',
        },
      },
    }),

    // MDX支持
    mdx(),

    // Icon支持
    icon({
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
        ],
      },
    }),

    // ✅ SEO优化：Partytown（Analytics性能优化）
    ...whenExternalScripts(() =>
      partytown({
        config: {
          forward: ['dataLayer.push'], // Google Analytics
          debug: process.env.NODE_ENV !== 'production',
        },
      })
    ),

    // ✅ SEO优化：压缩优化
    compress({
      CSS: true,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
          removeComments: true, // ← 移除HTML注释
          collapseWhitespace: true, // ← 压缩空白
          minifyCSS: true, // ← 压缩CSS
          minifyJS: true, // ← 压缩JS
        },
      },
      Image: false, // 图片单独优化
      JavaScript: true,
      SVG: true, // ✅ 启用SVG压缩
      Logger: 1,
    }),

    // 自定义集成
    astrowind({
      config: './src/config.yaml',
    }),
  ],

  // ========================================
  // SEO优化：图片配置
  // ========================================
  image: {
    // ✅ 添加CDN域名
    domains: ['cdn.pixabay.com', 'cdn.zhitoujianli.com', 'images.zhitoujianli.com'],

    // ✅ 使用Sharp进行图片优化
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      },
    },
  },

  // ========================================
  // SEO优化：Markdown配置
  // ========================================
  markdown: {
    // Remark plugins（处理markdown语法）
    remarkPlugins: [
      readingTimeRemarkPlugin, // ✅ 阅读时间计算
      // 可以添加更多：
      // - remarkToc（目录生成）
      // - remarkGfm（GitHub Flavored Markdown）
    ],

    // Rehype plugins（处理HTML输出）
    rehypePlugins: [
      responsiveTablesRehypePlugin, // ✅ 响应式表格
      lazyImagesRehypePlugin, // ✅ 图片懒加载
      // 可以添加更多：
      // - rehypeAutolinkHeadings（标题自动链接）
      // - rehypeSlug（标题ID生成）
      // - rehypeExternalLinks（外链处理）
    ],

    // ✅ SEO优化：代码高亮
    shikiConfig: {
      theme: 'github-dark',
      wrap: true, // 代码换行
    },

    // ✅ SEO优化：启用GFM
    extendDefaultPlugins: true,
  },

  // ========================================
  // SEO优化：Vite配置
  // ========================================
  vite: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },

    // ✅ SEO优化：构建优化
    build: {
      cssCodeSplit: true, // CSS代码分割
      minify: 'terser', // 使用Terser压缩
      rollupOptions: {
        output: {
          // 手动代码分割
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'ui-components': ['astro-icon'],
          },
        },
      },
    },

    // ✅ SEO优化：SSR优化
    ssr: {
      noExternal: ['@astrolib/seo', '@astrolib/analytics'],
    },
  },

  // ========================================
  // SEO优化：实验性功能
  // ========================================
  experimental: {
    optimizeHoistedScript: true, // ✅ 优化脚本提升
    contentCollectionCache: true, // ✅ 内容集合缓存
  },

  // ========================================
  // SEO优化：服务器配置（预览）
  // ========================================
  server: {
    port: 4321,
    host: true, // 监听所有网络接口
    headers: {
      // ✅ 安全头部
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },

  // ========================================
  // SEO优化：适配器配置（如果使用SSR）
  // ========================================
  // adapter: vercel({
  //   analytics: true,  // Vercel Analytics
  //   speedInsights: true,  // Speed Insights
  // }),
});


