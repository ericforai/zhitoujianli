# Google Analytics 4 集成指南

## 🎯 快速集成步骤

### 1. 创建 Google Analytics 4 账户

1. 访问 [Google Analytics](https://analytics.google.com/)
2. 点击"开始测量"
3. 创建账户名称：`智投简历博客`
4. 选择"网站"作为数据流
5. 输入网站URL：`https://blog.zhitoujianli.com`
6. 获取测量ID（格式：`G-XXXXXXXXXX`）

### 2. 配置博客集成

将获取的测量ID添加到配置文件中：

```yaml
# src/config.yaml
analytics:
  vendors:
    googleAnalytics:
      id: 'G-XXXXXXXXXX' # 替换为您的实际ID
      partytown: true # 启用Partytown优化
```

### 3. 验证集成

- 访问博客网站
- 在Google Analytics实时报告中查看数据
- 使用浏览器开发者工具检查网络请求

## 📊 高级配置选项

### 自定义事件跟踪

```javascript
// 在组件中添加自定义事件
gtag('event', 'blog_view', {
  blog_title: '文章标题',
  blog_category: '分类名称',
});
```

### 增强测量

- 页面浏览
- 滚动深度
- 出站点击
- 站点搜索
- 视频参与度

## 🔧 故障排除

### 常见问题

1. **数据不显示**：检查测量ID是否正确
2. **实时数据延迟**：等待5-10分钟
3. **跨域问题**：确保域名配置正确

### 调试工具

- Google Analytics Debugger (Chrome扩展)
- Google Tag Assistant
- 浏览器开发者工具网络面板

