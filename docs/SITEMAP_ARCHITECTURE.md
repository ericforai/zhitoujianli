# 智投简历 - Sitemap架构文档

## 📋 当前架构（2025-11-12更新）

### 统一Sitemap架构

我们采用**Sitemap Index**架构，将整个网站的sitemap统一在一个入口：

```
https://zhitoujianli.com/sitemap.xml (索引文件)
├── https://zhitoujianli.com/sitemap-main.xml (主站页面，手动维护)
└── https://zhitoujianli.com/blog/sitemap-0.xml (博客页面，Astro自动生成)
```

### 为什么使用Sitemap Index？

1. **模块化管理**：主站和博客分开管理，互不干扰
2. **自动化更新**：博客sitemap由Astro自动生成，无需手动维护
3. **SEO最佳实践**：Google推荐大型网站使用Sitemap Index
4. **扩展性好**：未来可以轻松添加新的子sitemap

### 文件说明

#### 1. sitemap.xml（索引文件）
**路径**：`frontend/public/sitemap.xml`
**类型**：Sitemap Index
**内容**：引用子sitemap列表
**维护方式**：手动维护

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://zhitoujianli.com/sitemap-main.xml</loc>
    <lastmod>2025-11-12T00:00:00+00:00</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://zhitoujianli.com/blog/sitemap-0.xml</loc>
    <lastmod>2025-11-12T00:00:00+00:00</lastmod>
  </sitemap>
</sitemapindex>
```

#### 2. sitemap-main.xml（主站页面）
**路径**：`frontend/public/sitemap-main.xml`
**类型**：URL Set
**内容**：主站所有页面URL
**维护方式**：手动维护

**包含页面**：
- 首页 (priority: 1.0)
- 功能页面 (priority: 0.9)
- 定价页面 (priority: 0.9)
- 注册/登录 (priority: 0.8/0.6)
- 联系我们 (priority: 0.7)
- 帮助中心 (priority: 0.7)
- 服务条款 (priority: 0.5)
- 隐私政策 (priority: 0.5)

#### 3. blog/sitemap-0.xml（博客页面）
**路径**：`blog/zhitoujianli-blog/dist/sitemap-0.xml`
**类型**：URL Set
**内容**：所有博客文章和分类页面
**维护方式**：Astro自动生成

**包含内容**：
- 博客首页和分页
- 所有博客文章（~20篇）
- 分类页面（求职指南、职场建议等）
- 标签页面
- 其他博客相关页面

**自动更新**：每次运行 `npm run build` 时自动更新

### Robots.txt配置

**主站robots.txt**：`frontend/public/robots.txt`
```txt
Sitemap: https://zhitoujianli.com/sitemap.xml
```

**博客robots.txt**：`blog/zhitoujianli-blog/public/robots.txt`
```txt
Sitemap: https://zhitoujianli.com/sitemap.xml
```

**注意**：两个robots.txt都指向同一个统一的sitemap入口

### 搜索引擎提交

只需提交一个sitemap URL：

**Google Search Console**：
```
https://zhitoujianli.com/sitemap.xml
```

**百度站长平台**：
```
https://zhitoujianli.com/sitemap.xml
```

### 更新流程

#### 主站页面更新
1. 编辑 `frontend/public/sitemap-main.xml`
2. 更新对应的URL、lastmod、priority
3. 重新部署前端

#### 博客内容更新
1. 添加/修改博客文章
2. 运行 `npm run build` (Astro自动更新sitemap)
3. 重新部署博客

#### Sitemap索引更新
通常不需要更新，除非：
- 添加新的子sitemap
- 修改子sitemap的URL结构

### 验证方法

#### 1. 验证索引文件
```bash
curl https://zhitoujianli.com/sitemap.xml
```

应该看到包含两个子sitemap的XML

#### 2. 验证主站sitemap
```bash
curl https://zhitoujianli.com/sitemap-main.xml
```

应该看到所有主站页面URL

#### 3. 验证博客sitemap
```bash
curl https://zhitoujianli.com/blog/sitemap-0.xml
```

应该看到所有博客文章URL

#### 4. 使用Google工具验证
访问：https://search.google.com/test/rich-results
输入：`https://zhitoujianli.com/sitemap.xml`

### 常见问题

#### Q1: 为什么不直接把博客URL加到sitemap-main.xml？
**A**: 博客内容频繁更新，手动维护不现实。使用Astro自动生成可以确保sitemap始终是最新的。

#### Q2: 搜索引擎会自动发现子sitemap吗？
**A**: 是的，当搜索引擎抓取 `sitemap.xml` 时，会自动发现并抓取所有子sitemap。

#### Q3: 可以有多少个子sitemap？
**A**: Sitemap Index最多可以包含50,000个子sitemap，完全够用。

#### Q4: 旧的 blog/sitemap-index.xml 还需要吗？
**A**: 不需要了。Astro生成的sitemap-0.xml直接被主sitemap.xml引用。

#### Q5: 需要更新搜索引擎提交的sitemap URL吗？
**A**: 是的，需要重新提交统一的 `https://zhitoujianli.com/sitemap.xml`

### 架构优势

✅ **统一管理**：一个入口管理所有sitemap
✅ **自动化**：博客sitemap自动更新
✅ **SEO友好**：符合Google最佳实践
✅ **易维护**：主站和博客分开维护
✅ **可扩展**：方便未来添加新模块（如：帮助中心、API文档等）

### 未来扩展

如果需要添加新模块，只需：

1. 创建新的子sitemap：`sitemap-[module].xml`
2. 在 `sitemap.xml` 中添加引用
3. 部署上线

例如：
```xml
<sitemap>
  <loc>https://zhitoujianli.com/sitemap-help.xml</loc>
  <lastmod>2025-11-12T00:00:00+00:00</lastmod>
</sitemap>
```

### 相关文档

- **迁移总结**：`docs/BLOG_DOMAIN_MIGRATION_SUMMARY.md`
- **Astro配置**：`blog/zhitoujianli-blog/astro.config.ts`
- **搜索引擎提交指南**：`docs/marketing/SEARCH_ENGINE_SUBMISSION_GUIDE.md`

---

**最后更新**：2025-11-12
**维护者**：智投简历技术团队

