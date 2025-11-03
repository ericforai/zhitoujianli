# 百度URL提交 - 博客文章配置

## 📋 说明

已将URL提交来源从网站主页改为**博客文章页面**。

### 变更性内容

1. **Sitemap来源变更**
   - 原：`/root/zhitoujianli/frontend/public/sitemap.xml` (网站主页)
   - 新：`/root/zhitoujianli/blog/sitemap-blog-complete.xml` (博客文章)

2. **提交内容**
   - 主要是博客文章URL（9篇）
   - 博客分类和标签页面
   - 博客首页

### 博客文章列表（18个URL）

1. https://www.zhitoujianli.com/blog/ai-job-matching-intelligent-resume-delivery
2. https://www.zhitoujianli.com/blog/ai-job-matching-technology
3. https://www.zhitoujianli.com/blog/ai-smart-greeting-deep-dive
4. https://www.zhitoujianli.com/blog/intelligent-greeting-feature
5. https://www.zhitoujianli.com/blog/industry-trends-analysis
6. https://www.zhitoujianli.com/blog/career-development-guide
7. https://www.zhitoujianli.com/blog/resume-optimization-tips
8. https://www.zhitoujianli.com/blog/interview-preparation-guide
9. https://www.zhitoujianli.com/blog/zhitoujianli-introduction
10. https://www.zhitoujianli.com/blog
11. https://www.zhitoujianli.com/blog/category/技术深度
12. https://www.zhitoujianli.com/blog/category/产品功能
13. https://www.zhitoujianli.com/blog/category/求职指南
14. https://www.zhitoujianli.com/blog/category/职场建议
15. https://www.zhitoujianli.com/blog/category/行业分析
16. https://www.zhitoujianli.com/blog/tag/AI技术
17. https://www.zhitoujianli.com/blog/tag/求职技巧
18. https://www.zhitoujianli.com/blog/tag/职业规划

## ⚠️ 当前状态

**配额已用完**，需要等待配额恢复后再提交。

### 配额说明

- 百度普通收录每日有配额限制
- 当前配额：已用完（remain: 0）
- 建议：等待第二天配额恢复后再执行

## 🚀 执行方式

### 方式1：手动执行（推荐）

等配额恢复后执行：

```bash
bash /root/zhitoujianli/backend/get_jobs/scripts/simple-baidu-submit.sh
```

### 方式2：一键提交命令

```bash
grep -oP '<loc>\K[^<]+' /root/zhitoujianli/blog/sitemap-blog-complete.xml | \
  sed 's|https://zhitoujianli.com|https://www.zhitoujianli.com|g' | \
  curl -s -X POST -H 'Content-Type:text/plain' --data-binary @- \
  "http://data.zz.baidu.com/urls?site=https://www.zhitoujianli.com&token=wds5zmJ4sTAPlxuN" | \
  python3 -m json.tool
```

## 📊 预期结果

配额恢复后提交成功的话，响应应该是：

```json
{
  "success": 18,
  "remain": <剩余配额>,
  "not_same_site": [],
  "not_valid": []
}
```

## ⏰ 建议执行时间

- 百度配额通常在**每天凌晨0点**重置
- 建议在**每天凌晨1-3点**执行提交
- 已配置的Cron任务是每天凌晨3点执行

## 🔄 恢复步骤

1. 等待配额恢复（通常第二天凌晨）
2. 执行提交脚本
3. 查看提交结果

---

**最后更新**: 2025-10-28
**状态**: ⏳ 等待配额恢复
