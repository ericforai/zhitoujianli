# 智投简历 - UTM参数追踪配置指南

## 📊 什么是UTM参数？

UTM（Urchin Tracking Module）参数是添加在URL末尾的标签，用于追踪营销活动的效果。

**作用：**
- 📈 追踪流量来源
- 💰 分析转化率
- 🎯 优化营销策略
- 💡 计算ROI

---

## 🔧 UTM参数结构

完整URL格式：
```
https://www.zhitoujianli.com?utm_source=XXX&utm_medium=XXX&utm_campaign=XXX&utm_content=XXX&utm_term=XXX
```

### 必填参数（Required）

| 参数 | 说明 | 示例 |
|------|------|------|
| `utm_source` | 流量来源 | wechat, weibo, xiaohongshu |
| `utm_medium` | 媒介类型 | article, video, image, cpc |
| `utm_campaign` | 营销活动 | ai_job_hunting, spring_promo |

### 可选参数（Optional）

| 参数 | 说明 | 示例 |
|------|------|------|
| `utm_content` | 内容标识 | read_original, button_top, qrcode |
| `utm_term` | 关键词 | ai_resume, smart_delivery |

---

## 📱 公众号文章UTM配置

### 1. 阅读原文链接

```
https://www.zhitoujianli.com?utm_source=wechat&utm_medium=article&utm_campaign=ai_job_hunting&utm_content=read_original
```

**参数解释：**
- `utm_source=wechat` - 来源：微信公众号
- `utm_medium=article` - 媒介：文章
- `utm_campaign=ai_job_hunting` - 活动：AI求职文章
- `utm_content=read_original` - 位置：阅读原文按钮

---

### 2. 文中CTA链接（多个位置）

**顶部CTA：**
```
https://www.zhitoujianli.com?utm_source=wechat&utm_medium=article&utm_campaign=ai_job_hunting&utm_content=cta_top
```

**中部案例后CTA：**
```
https://www.zhitoujianli.com?utm_source=wechat&utm_medium=article&utm_campaign=ai_job_hunting&utm_content=cta_case
```

**底部CTA：**
```
https://www.zhitoujianli.com?utm_source=wechat&utm_medium=article&utm_campaign=ai_job_hunting&utm_content=cta_bottom
```

---

### 3. 二维码链接

**小程序码/H5二维码：**
```
https://www.zhitoujianli.com?utm_source=wechat&utm_medium=article&utm_campaign=ai_job_hunting&utm_content=qrcode_main
```

**客服微信二维码：**
```
https://www.zhitoujianli.com?utm_source=wechat&utm_medium=article&utm_campaign=ai_job_hunting&utm_content=qrcode_service
```

---

## 🌐 其他渠道UTM配置

### 朋友圈分享

```
https://www.zhitoujianli.com?utm_source=wechat&utm_medium=moments&utm_campaign=ai_job_hunting&utm_content=share
```

### 微信群分享

```
https://www.zhitoujianli.com?utm_source=wechat&utm_medium=group&utm_campaign=ai_job_hunting&utm_content=share
```

### 知乎文章

```
https://www.zhitoujianli.com?utm_source=zhihu&utm_medium=article&utm_campaign=ai_job_hunting&utm_content=read_original
```

### 小红书笔记

```
https://www.zhitoujianli.com?utm_source=xiaohongshu&utm_medium=note&utm_campaign=ai_job_hunting&utm_content=bio_link
```

### 抖音视频

```
https://www.zhitoujianli.com?utm_source=douyin&utm_medium=video&utm_campaign=ai_job_hunting&utm_content=description
```

### B站视频

```
https://www.zhitoujianli.com?utm_source=bilibili&utm_medium=video&utm_campaign=ai_job_hunting&utm_content=description
```

### 微博

```
https://www.zhitoujianli.com?utm_source=weibo&utm_medium=post&utm_campaign=ai_job_hunting&utm_content=link
```

---

## 📧 邮件营销

```
https://www.zhitoujianli.com?utm_source=email&utm_medium=newsletter&utm_campaign=weekly_tips&utm_content=header_cta
```

---

## 💰 付费广告

### 百度推广

```
https://www.zhitoujianli.com?utm_source=baidu&utm_medium=cpc&utm_campaign=brand_keywords&utm_term={keyword}
```

### 腾讯广告

```
https://www.zhitoujianli.com?utm_source=tencent_ads&utm_medium=display&utm_campaign=recruitment_season
```

### 字节跳动广告

```
https://www.zhitoujianli.com?utm_source=bytedance_ads&utm_medium=video&utm_campaign=ai_job_hunting
```

---

## 🛠️ UTM参数命名规范

### source（来源）命名规范

| 平台 | source值 | 说明 |
|------|----------|------|
| 微信公众号 | `wechat` | 微信生态统一用wechat |
| 朋友圈 | `wechat` | 使用medium区分 |
| 微信群 | `wechat` | 使用medium区分 |
| 知乎 | `zhihu` | 全小写 |
| 小红书 | `xiaohongshu` | 拼音 |
| 抖音 | `douyin` | 拼音 |
| B站 | `bilibili` | 英文名 |
| 微博 | `weibo` | 拼音 |
| 百度 | `baidu` | 拼音 |

---

### medium（媒介）命名规范

| 类型 | medium值 | 说明 |
|------|----------|------|
| 文章 | `article` | 图文内容 |
| 视频 | `video` | 视频内容 |
| 图片 | `image` | 图片/海报 |
| 朋友圈 | `moments` | 微信朋友圈 |
| 群聊 | `group` | 微信群/QQ群 |
| 邮件 | `email` | 邮件营销 |
| 付费广告 | `cpc`/`cpm`/`display` | 按类型区分 |

---

### campaign（活动）命名规范

格式：`主题_时间段_版本`

示例：
- `ai_job_hunting` - AI求职主题
- `spring_promo_2025` - 2025春季推广
- `double11_sale` - 双11活动
- `new_feature_launch` - 新功能发布

---

### content（内容）命名规范

格式：`位置_类型`

示例：
- `read_original` - 阅读原文按钮
- `cta_top` - 顶部行动号召
- `cta_bottom` - 底部行动号召
- `qrcode_main` - 主要二维码
- `banner_header` - 头部横幅

---

## 📊 数据追踪与分析

### Google Analytics 4 (GA4)

在GA4中查看UTM数据：
1. 报告 → 获客 → 流量获取
2. 维度：会话来源/媒介
3. 指标：用户数、会话数、转化次数

### 百度统计

1. 来源分析 → 推广链接
2. 查看自定义UTM参数
3. 分析转化漏斗

### 自定义追踪脚本

在网站中添加事件追踪：

```javascript
// 获取URL参数
const urlParams = new URLSearchParams(window.location.search);
const utmSource = urlParams.get('utm_source');
const utmMedium = urlParams.get('utm_medium');
const utmCampaign = urlParams.get('utm_campaign');

// 发送到后端
if (utmSource) {
  fetch('/api/track-utm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: utmSource,
      medium: utmMedium,
      campaign: utmCampaign,
      timestamp: new Date().toISOString()
    })
  });
}
```

---

## 🎯 关键转化事件追踪

### 需要追踪的转化点

1. **注册**
   - 事件名：`user_register`
   - 携带UTM参数

2. **上传简历**
   - 事件名：`resume_upload`
   - 携带UTM参数

3. **付费转化**
   - 事件名：`purchase`
   - 携带UTM参数和金额

4. **分享行为**
   - 事件名：`share`
   - 携带UTM参数和分享平台

---

## 📈 数据分析报表示例

### 每日追踪表格

| 日期 | 来源 | 媒介 | 活动 | 点击数 | 注册数 | 转化率 |
|------|------|------|------|--------|--------|--------|
| 2025-11-12 | wechat | article | ai_job_hunting | 5,234 | 142 | 2.71% |
| 2025-11-12 | zhihu | article | ai_job_hunting | 1,823 | 67 | 3.68% |
| 2025-11-12 | xiaohongshu | note | ai_job_hunting | 892 | 28 | 3.14% |

---

## 🔗 UTM生成工具

### 在线工具

1. **Google Campaign URL Builder**
   - https://ga-dev-tools.google/campaign-url-builder/

2. **UTM.io**
   - https://utm.io/

### Excel模板

创建Excel表格，公式：
```
=CONCATENATE("https://www.zhitoujianli.com?utm_source=", A2, "&utm_medium=", B2, "&utm_campaign=", C2, "&utm_content=", D2)
```

---

## ⚠️ 注意事项

### DO（应该做的）

✅ **使用小写字母**
   - 正确：`utm_source=wechat`
   - 错误：`utm_source=WeChat`

✅ **使用下划线分隔**
   - 正确：`ai_job_hunting`
   - 错误：`ai-job-hunting` 或 `aijobhunting`

✅ **保持一致性**
   - 微信公众号始终用 `wechat`，不要混用 `weixin`、`wx`

✅ **URL编码特殊字符**
   - 空格用 `%20` 或 `+`
   - 中文需要URL编码

---

### DON'T（不应该做的）

❌ **混用大小写**
   - 会导致数据分散

❌ **使用特殊字符**
   - 避免使用 `&`、`=`、`?`

❌ **参数值过长**
   - 建议不超过50字符

❌ **忘记测试**
   - 发布前必须点击测试链接

---

## 🧪 测试清单

发布前必须完成：

- [ ] 所有链接可正常访问
- [ ] UTM参数正确拼写
- [ ] 在GA4/百度统计中能看到数据
- [ ] 测试转化追踪功能
- [ ] 检查移动端兼容性
- [ ] 验证跳转逻辑正确

---

## 📋 快速复制模板

### 公众号文章标准链接

```
阅读原文：
https://www.zhitoujianli.com?utm_source=wechat&utm_medium=article&utm_campaign=ai_job_hunting&utm_content=read_original

文中CTA：
https://www.zhitoujianli.com?utm_source=wechat&utm_medium=article&utm_campaign=ai_job_hunting&utm_content=cta_middle

二维码：
https://www.zhitoujianli.com?utm_source=wechat&utm_medium=article&utm_campaign=ai_job_hunting&utm_content=qrcode
```

---

## 📞 技术支持

如需帮助配置UTM追踪，请联系：
- 📧 tech@zhitoujianli.com
- 💬 技术支持微信：zhitoujianli_tech

---

**更新日期：2025-11-12**
**版本：v1.0**

