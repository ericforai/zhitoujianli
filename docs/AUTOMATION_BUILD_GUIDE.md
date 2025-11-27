# 自动化构建链使用指南

## 概述

本文档介绍智投简历项目的自动化构建链，包括：
- Markdown → HTML 自动转换
- Sitemap 自动生成和合并
- CI/CD 集成和验证

## 自动化构建流程

### 1. 主站Sitemap生成

主站sitemap从配置文件自动生成，无需手动维护：

```bash
# 从配置文件生成sitemap-main.xml
npm run sitemap:generate

# 或直接使用Python脚本
python3 scripts/generate-sitemap-main.py
```

**配置文件**: `config/site-pages.json`

### 2. Astro博客构建

Astro博客构建时会自动生成博客sitemap：

```bash
npm run build:blog
```

生成的sitemap位于: `blog/zhitoujianli-blog/dist/sitemap-*.xml`

### 3. Sitemap合并

自动合并主站和博客sitemap：

```bash
npm run sitemap:merge

# 或直接使用Python脚本
python3 scripts/merge-sitemaps.py
```

### 4. 完整构建流程

一键执行完整构建和验证：

```bash
npm run build:validate

# 或使用脚本
./scripts/build-and-validate.sh
```

这个脚本会：
1. 构建Astro博客
2. 生成主站sitemap
3. 合并sitemap
4. 验证sitemap格式

## 配置文件

### site-pages.json

主站页面配置，用于生成sitemap-main.xml：

```json
{
  "site_url": "https://zhitoujianli.com",
  "pages": [
    {
      "path": "/",
      "priority": 1.0,
      "changefreq": "weekly",
      "lastmod": "2025-11-26"
    }
  ]
}
```

### navigation-config.json

导航和页脚配置，避免在组件中硬编码路径：

```json
{
  "navigation": {
    "main": [
      {"label": "首页", "path": "/"},
      {"label": "定价", "path": "/pricing"}
    ]
  },
  "footer": {
    "links": [...]
  }
}
```

## CI/CD 集成

### GitHub Actions

项目包含以下CI工作流：

1. **代码质量检查** (`.github/workflows/code-quality.yml`)
   - 前端代码质量检查
   - 后端代码质量检查
   - 构建检查（包含sitemap生成）

2. **Sitemap和链接验证** (`.github/workflows/sitemap-and-links-validation.yml`)
   - Sitemap XML格式验证
   - 重复URL检查
   - 静态文件存在性检查
   - 死链检查

### 本地验证

在提交代码前，可以本地运行验证：

```bash
# 验证sitemap格式
npm run sitemap:validate

# 完整构建和验证
npm run build:validate
```

## 组件配置化

### Navigation组件

使用共享配置而非硬编码路径：

```typescript
import { getNavigationConfig } from '../config/navigationConfig';

const config = getNavigationConfig();
// 使用config.navigation.main渲染导航
```

### Footer组件

同样使用共享配置：

```typescript
import { getNavigationConfig } from '../config/navigationConfig';

const config = getNavigationConfig();
// 使用config.footer渲染页脚
```

## 添加新页面

### 步骤1: 添加到site-pages.json

在 `config/site-pages.json` 中添加新页面：

```json
{
  "path": "/new-page",
  "priority": 0.7,
  "changefreq": "monthly",
  "lastmod": "2025-11-26"
}
```

### 步骤2: 创建静态HTML文件（如需要）

如果需要静态HTML重定向页面：

```bash
# 创建 frontend/public/new-page.html
```

### 步骤3: 更新导航配置（如需要）

在 `config/navigation-config.json` 中添加导航项：

```json
{
  "label": "新页面",
  "path": "/new-page"
}
```

### 步骤4: 重新生成sitemap

```bash
npm run sitemap:generate
npm run sitemap:merge
```

## 常见问题

### Q: 如何更新页面最后修改时间？

A: 更新 `config/site-pages.json` 中的 `lastmod` 字段，然后重新生成sitemap。

### Q: 博客文章会自动添加到sitemap吗？

A: 是的，Astro博客构建时会自动生成博客sitemap，合并脚本会自动包含。

### Q: 如何验证sitemap是否正确？

A: 运行 `npm run sitemap:validate` 或 `npm run build:validate`。

### Q: CI中链接验证失败怎么办？

A: 检查：
1. 静态HTML文件是否存在
2. URL路径是否正确
3. Sitemap格式是否正确

## 最佳实践

1. **定期更新lastmod**: 页面内容更新后，及时更新sitemap中的lastmod
2. **使用配置文件**: 避免在代码中硬编码路径，使用配置文件统一管理
3. **CI验证**: 每次提交前运行本地验证，确保CI通过
4. **版本控制**: 配置文件纳入版本控制，方便协作

## 相关文件

- `scripts/generate-sitemap-main.py` - 主站sitemap生成脚本
- `scripts/merge-sitemaps.py` - Sitemap合并脚本
- `scripts/build-and-validate.sh` - 构建和验证脚本
- `config/site-pages.json` - 主站页面配置
- `config/navigation-config.json` - 导航和页脚配置
- `.github/workflows/sitemap-and-links-validation.yml` - CI验证工作流



