# 百度质量白皮书优化 - 后续维护指南

## 一、链接有效性检查指南

### 1.1 使用百度站长工具检查

1. 访问: https://ziyuan.baidu.com/
2. 登录百度站长平台
3. 进入「数据监控」→「链接分析」
4. 查看死链报告
5. 修复发现的404链接

### 1.2 使用命令行工具检查（推荐）

```bash
# 安装链接检查工具
npm install -g broken-link-checker

# 检查网站链接
blc https://zhitoujianli.com -ro
```

### 1.3 需要定期检查的链接

**内部链接**:
- `/pricing` - 定价页面
- `/blog/` - 博客首页
- `/contact` - 联系我们
- `/terms` - 用户协议
- `/privacy` - 隐私政策
- `/help` - 帮助中心
- `/guide` - 用户指南

**外部链接**:
- 社交媒体链接
- 第三方服务链接
- API文档链接

### 1.4 修复死链的方法

1. 如果页面已删除，设置301重定向到相关页面
2. 如果页面暂时不可用，返回503状态码
3. 更新所有引用该链接的地方
4. 在百度站长工具中提交死链删除

---

## 二、Meta标签优化指南

### 2.1 确认og:image图片

**检查步骤**:
1. 访问: https://zhitoujianli.com/og-image.jpg
2. 如果404，需要创建图片

**创建og:image图片**:
- 尺寸: 1200×630px
- 格式: JPG或PNG
- 内容: 包含网站Logo、标题、描述
- 保存路径: `frontend/public/og-image.jpg`

### 2.2 博客文章Meta标签

**需要在博客系统中添加**:
- `article:author` - 文章作者
- `article:published_time` - 发布时间
- `article:modified_time` - 修改时间
- `article:section` - 文章分类
- `article:tag` - 文章标签

**示例**:
```html
<meta property="article:author" content="智投简历团队" />
<meta property="article:published_time" content="2025-01-15T10:00:00+08:00" />
<meta property="article:modified_time" content="2025-01-15T10:00:00+08:00" />
<meta property="article:section" content="求职技巧" />
<meta property="article:tag" content="简历优化" />
```

---

## 三、性能优化检查清单

### 3.1 图片优化

- [ ] 使用WebP格式（现代浏览器）
- [ ] 提供JPEG/PNG降级方案
- [ ] 压缩图片大小
- [ ] 使用响应式图片（srcset）
- [ ] 非首屏图片使用懒加载 ✅ 已完成

### 3.2 代码优化

- [ ] 实现代码分割（React.lazy）
- [ ] 压缩JavaScript和CSS
- [ ] 移除未使用的代码
- [ ] 使用Tree Shaking

### 3.3 资源加载优化

- [ ] 关键CSS内联
- [ ] 非关键CSS延迟加载
- [ ] 使用preload预加载关键资源
- [ ] 使用prefetch预取可能需要的资源
- [ ] DNS Prefetch ✅ 已配置

### 3.4 缓存策略

- [ ] 设置合理的Cache-Control头
- [ ] 使用ETag或Last-Modified
- [ ] 实现Service Worker缓存
- [ ] CDN缓存配置

---

## 四、定期检查计划

### 每周检查
- [ ] 检查网站可访问性
- [ ] 检查主要功能是否正常
- [ ] 查看错误日志

### 每月检查
- [ ] 链接有效性检查
- [ ] 页面加载速度测试
- [ ] 移动端适配验证
- [ ] SEO排名变化

### 每季度检查
- [ ] 全面性能审计
- [ ] 安全漏洞扫描
- [ ] 内容更新检查
- [ ] 竞争对手分析

---

## 五、百度站长工具使用指南

### 5.1 提交网站地图

1. 访问: https://ziyuan.baidu.com/
2. 进入「数据引入」→「链接提交」
3. 选择「sitemap」
4. 提交sitemap.xml URL: `https://zhitoujianli.com/sitemap.xml`

### 5.2 使用抓取诊断

1. 进入「抓取诊断」
2. 输入要检查的URL
3. 点击「开始诊断」
4. 查看抓取结果和移动友好性

### 5.3 监控索引量

1. 进入「数据监控」→「索引量」
2. 查看索引量趋势
3. 分析索引量下降原因
4. 及时处理问题

### 5.4 提交死链

1. 进入「数据引入」→「死链提交」
2. 上传死链列表文件
3. 或手动输入死链URL
4. 等待百度处理

---

## 六、验证工具推荐

### 6.1 结构化数据验证
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org/

### 6.2 移动端适配验证
- Google Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
- 百度移动友好性检测: https://ziyuan.baidu.com/mobiletools/index

### 6.3 性能测试
- Google PageSpeed Insights: https://pagespeed.web.dev/
- Lighthouse (Chrome DevTools)
- WebPageTest: https://www.webpagetest.org/

### 6.4 可访问性测试
- WAVE: https://wave.webaim.org/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- axe DevTools: Chrome扩展

---

## 七、常见问题处理

### 7.1 页面不被百度收录

**可能原因**:
- robots.txt阻止了爬虫
- 页面需要登录才能访问
- 页面内容质量低
- 网站被惩罚

**解决方法**:
1. 检查robots.txt配置
2. 确保主要内容无需登录即可访问
3. 提升内容质量
4. 在百度站长工具中提交URL

### 7.2 移动端适配问题

**检查项**:
- viewport meta标签是否正确
- 响应式CSS是否生效
- 触摸目标是否足够大
- 字体大小是否合适

**解决方法**:
1. 确认viewport设置: `<meta name="viewport" content="width=device-width, initial-scale=1">`
2. 使用响应式设计框架（Tailwind CSS ✅）
3. 测试不同设备尺寸

### 7.3 页面加载速度慢

**优化方法**:
1. 压缩图片和资源
2. 使用CDN加速
3. 启用Gzip/Brotli压缩
4. 优化JavaScript和CSS
5. 使用浏览器缓存

---

## 八、优化效果监控

### 8.1 关键指标

- **索引量**: 百度收录的页面数量
- **流量**: 来自百度的访问量
- **排名**: 关键词搜索排名
- **点击率**: 搜索结果点击率
- **跳出率**: 用户访问后立即离开的比例

### 8.2 监控工具

- 百度站长工具
- Google Analytics
- 百度统计
- 自定义监控脚本

### 8.3 报告周期

- **日报**: 流量、错误日志
- **周报**: 排名变化、新收录页面
- **月报**: 全面数据分析、优化建议

---

**最后更新**: 2025-01-XX
**维护负责人**: 开发团队
**下次检查**: 建议每月执行一次全面检查

