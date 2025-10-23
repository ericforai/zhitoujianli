# 🎯 Google Analytics 4 快速设置指南

## 📋 第一步：创建 Google Analytics 账户

### 1. 访问 Google Analytics

- 打开浏览器，访问：https://analytics.google.com/
- 使用您的Google账号登录

### 2. 创建账户

- 点击"开始测量"
- 输入账户名称：`智投简历博客`
- 选择数据共享设置（建议保持默认）
- 点击"下一步"

### 3. 创建媒体资源

- 选择"网站"作为平台
- 输入媒体资源名称：`智投简历博客`
- 选择报告时区：`中国标准时间`
- 选择货币：`人民币 (CNY)`
- 点击"下一步"

### 4. 创建数据流

- 选择"网站"
- 输入网站URL：`https://blog.zhitoujianli.com`
- 输入流名称：`智投简历博客网站`
- 点击"创建流"

### 5. 获取测量ID

- 在数据流详情页面，找到"测量ID"
- 复制以`G-`开头的ID（例如：`G-XXXXXXXXXX`）

## 🚀 第二步：集成到博客

### 方法一：使用自动化脚本（推荐）

```bash
cd /root/zhitoujianli/blog/zhitoujianli-blog
npm run analytics:setup
```

然后输入您获取的测量ID

### 方法二：手动配置

1. 编辑配置文件：

```bash
nano src/config.yaml
```

2. 找到以下部分并修改：

```yaml
analytics:
  vendors:
    googleAnalytics:
      id: 'G-XXXXXXXXXX' # 替换为您的实际ID
      partytown: true
```

3. 重新构建和部署：

```bash
npm run build
npm run deploy:blog
```

## ✅ 第三步：验证集成

### 1. 检查网站代码

- 访问博客网站
- 右键 → 查看页面源代码
- 搜索 `gtag` 或您的测量ID

### 2. 使用浏览器开发者工具

- 按F12打开开发者工具
- 切换到"网络"标签
- 刷新页面
- 查找 `googletagmanager.com` 请求

### 3. 查看Google Analytics实时数据

- 登录Google Analytics
- 点击"实时"报告
- 访问您的博客网站
- 在GA中查看是否有实时访问数据

## 🔧 故障排除

### 常见问题

1. **数据不显示**：等待5-10分钟，GA数据有延迟
2. **测量ID错误**：检查ID格式是否为`G-XXXXXXXXXX`
3. **网站无法访问**：检查SSL证书和域名配置

### 调试工具

- Google Analytics Debugger (Chrome扩展)
- Google Tag Assistant
- 浏览器开发者工具网络面板

## 📊 高级配置

### 自定义事件跟踪

```javascript
// 在组件中添加自定义事件
gtag('event', 'blog_view', {
  blog_title: '文章标题',
  blog_category: '分类名称',
});
```

### 增强测量功能

- 页面浏览跟踪
- 滚动深度分析
- 出站点击跟踪
- 站点搜索跟踪
- 视频参与度分析

## 🎉 完成！

设置完成后，您将能够：

- 跟踪网站访问量
- 分析用户行为
- 监控页面性能
- 优化SEO效果
- 了解用户来源

需要帮助？运行 `npm run analytics:check` 检查当前配置状态。

