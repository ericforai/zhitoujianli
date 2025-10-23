# 首页问题解决方案

## 问题描述

Astro 无法正确构建 `src/pages/index.astro` 文件，导致首页无法访问，显示404错误。

## 根本原因

经过深入调试，发现 Astro 构建器会跳过 `src/pages/index.astro` 文件，不会生成对应的 `dist/index.html` 文件。

具体表现：

- `src/pages/index.astro` 文件存在且语法正确
- 其他页面（如 `about.astro`, `blog.astro`）都能正常构建
- 在构建日志中找不到 `index.astro` 的构建记录
- `dist` 目录中没有 `index.html` 文件

## 解决方案

采用"迂回"策略解决此问题：

### 1. 创建 home.astro 作为首页内容

将首页内容放在 `src/pages/home.astro` 文件中（内容与原 `index.astro` 相同）。

### 2. 创建构建后脚本

创建 `postbuild.sh` 脚本，在构建完成后自动将 `dist/home/index.html` 复制到 `dist/index.html`。

```bash
#!/bin/bash
echo "开始执行构建后处理..."

if [ -f "dist/home/index.html" ]; then
  echo "✓ 找到 dist/home/index.html"
  cp dist/home/index.html dist/index.html
  echo "✓ 已复制 dist/home/index.html 到 dist/index.html"
  echo "✓ 构建后处理完成"
else
  echo "✗ 错误：找不到 dist/home/index.html"
  exit 1
fi
```

### 3. 更新构建脚本

修改 `package.json` 中的 `build` 脚本：

```json
{
  "scripts": {
    "build": "astro build && ./postbuild.sh",
    "build:astro": "astro build"
  }
}
```

## 使用方法

### 开发环境

```bash
npm run dev
# 访问 http://localhost:4321/home/ 查看首页
```

### 生产环境构建

```bash
npm run build
# 构建完成后，首页会自动生成到 dist/index.html
```

### 预览构建结果

```bash
npm run preview
# 访问 http://localhost:4321/ 查看首页
```

## 注意事项

1. **不要删除 `src/pages/home.astro` 文件** - 这是首页的源文件
2. **不要删除 `postbuild.sh` 脚本** - 构建过程依赖此脚本
3. **首页内容修改** - 修改 `src/pages/home.astro` 文件，而不是 `index.astro`
4. **构建失败** - 即使 Astro 构建失败（如图片超时），只要生成了 `dist/home/index.html`，就可以手动执行 `./postbuild.sh` 完成首页生成

## 文件清单

- `src/pages/home.astro` - 首页源文件
- `postbuild.sh` - 构建后脚本
- `package.json` - 更新了 build 脚本

## 验证方法

1. 构建项目：`npm run build`
2. 检查 `dist/index.html` 是否存在
3. 启动预览：`npm run preview`
4. 访问 `http://localhost:4321/` 应该显示首页

## 未来改进

如果 Astro 官方修复了 `index.astro` 的构建问题，可以：

1. 将 `home.astro` 的内容复制到 `index.astro`
2. 删除 `home.astro` 文件
3. 删除 `postbuild.sh` 脚本
4. 恢复 `package.json` 中的 build 脚本

## 相关链接

- Astro 官方文档：https://docs.astro.build/
- 问题追踪：待创建 GitHub Issue
