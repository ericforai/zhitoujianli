# 百度URL提交使用指南

## 📋 功能概述

本系统实现了从 `sitemap.xml` 读取URL并通过百度普通收录API自动提交的功能。

### 主要特性

- ✅ 自动从 sitemap.xml 读取URL
- ✅ 过滤掉需要登录的页面（仅提交公开页面）
- ✅ 批量提交到百度收录API
- ✅ 记录详细的提交日志
- ✅ 支持手动触发和定时自动执行
- ✅ 错误处理和重试机制

## 🚀 快速开始

### 1. 配置检查

确保以下配置文件已正确设置：

**backend/get_jobs/src/main/resources/application.yml:**

```yaml
baidu:
  submit:
    enabled: true
    api-url: http://data.zz.baidu.com/urls
    site: https://www.zhitoujianli.com
    token: wds5zmJ4sTAPlxuN
    sitemap-path: /root/zhitoujianli/frontend/public/sitemap.xml
    exclude-paths: /dashboard,/resume-delivery,/auto-delivery,/boss-delivery,/smart-greeting,/jd-matching,/config
```

### 2. 构建项目

```bash
cd /root/zhitoujianli/backend/get_jobs
mvn clean package
```

### 3. 手动执行测试

执行一次测试确保功能正常：

```bash
bash /root/zhitoujianli/backend/get_jobs/scripts/submit_baidu_urls.sh
```

查看执行日志：

```bash
tail -f /root/zhitoujianli/backend/get_jobs/logs/baidu-submit.log
```

## ⏰ 配置定时任务

### 使用自动配置脚本（推荐）

```bash
bash /root/zhitoujianli/scripts/setup-baidu-submit-cron.sh
```

这将配置每天凌晨3:00自动执行。

### 手动配置Cron

```bash
# 编辑crontab
crontab -e

# 添加以下行（每天凌晨3点执行）
0 3 * * * /root/zhitoujianli/backend/get_jobs/scripts/submit_baidu_urls.sh >> /root/zhitoujianli/backend/get_jobs/logs/baidu-submit-cron.log 2>&1
```

### 修改执行时间

编辑 cron 任务：

```bash
crontab -e
```

Cron 时间格式说明：

```
分钟 小时 日 月 星期几
*    *   *  *   *
```

示例：

- `0 3 * * *` - 每天凌晨3点
- `0 */6 * * *` - 每6小时执行一次
- `0 9,15 * * *` - 每天上午9点和下午3点

## 🔍 查看执行日志

### 实时日志

```bash
tail -f /root/zhitoujianli/backend/get_jobs/logs/baidu-submit.log
```

### Cron执行日志

```bash
tail -f /root/zhitoujianli/backend/get_jobs/logs/baidu-submit-cron.log
```

### 查看最近的执行记录

```bash
grep "===" /root/zhitoujianli/backend/get_jobs/logs/baidu-submit.log | tail -20
```

## 🌐 API接口

### 手动触发提交

如果您需要在后端服务运行的情况下手动触发提交：

```bash
curl -X POST http://localhost:8080/api/baidu/submit-urls
```

### 检查服务状态

```bash
curl -X POST http://localhost:8080/api/baidu/status
```

## 📊 预期结果

### 成功响应示例

```
[2025-01-28 03:00:00] [INFO] === 开始百度URL提交任务 ===
[2025-01-28 03:00:01] [INFO] 从sitemap解析到 18 个URL
[2025-01-28 03:00:02] [INFO] 过滤后剩余 11 个公开URL
[2025-01-28 03:00:03] [INFO] 调用百度API...
[2025-01-28 03:00:04] [INFO] URL提交成功: 11 个
[2025-01-28 03:00:04] [INFO] 剩余配额: 99989
[2025-01-28 03:00:04] [INFO] === 百度URL提交任务结束 ===
```

### 百度API响应格式

```json
{
  "success": 11,
  "remain": 99989,
  "not_same_site": [],
  "not_valid": []
}
```

## ⚙️ 工作原理

### 1. 读取Sitemap

系统从指定的 `sitemap.xml` 文件中读取所有URL。

支持以下标签：

- `<loc>` - URL地址
- `<priority>` - 优先级（只提交 priority >= 0.6 的URL）
- `<lastmod>` - 最后修改时间

### 2. URL过滤

系统会过滤掉以下需要登录的页面：

- `/dashboard`
- `/resume-delivery`
- `/auto-delivery`
- `/boss-delivery`
- `/smart-greeting`
- `/jd-matching`
- `/config`

### 3. 调用百度API

- API地址：`http://data.zz.baidu.com/urls`
- 参数：`site` 和 `token`
- 请求体：每行一个URL
- 方法：POST

### 4. 结果处理

系统会记录：

- ✅ 提交成功的URL数量
- ✅ 剩余配额
- ⚠️ 失败的URL列表（如果有）
- 📝 详细日志

## 🔧 故障排查

### 问题1：找不到sitemap文件

**错误信息：**

```
无法找到sitemap文件: /root/zhitoujianli/frontend/public/sitemap.xml
```

**解决方案：**

1. 检查文件是否存在
2. 更新 `application.yml` 中的 `sitemap-path` 配置

### 问题2：百度API调用失败

**错误信息：**

```
百度API调用失败，状态码: 400
```

**可能原因：**

- Token无效或已过期
- URL格式不正确
- 配额已用完

**解决方案：**

1. 检查Token是否正确
2. 查看百度搜索资源平台确认配额
3. 检查URL格式是否符合要求

### 问题3：没有可提交的URL

**错误信息：**

```
没有可提交的URL
```

**可能原因：**

- 所有URL都已被过滤（需要登录）
- sitemap优先级设置过低

**解决方案：**

1. 检查 `exclude-paths` 配置是否过多
2. 调整 sitemap 中的 `<priority>` 值

## 📝 注意事项

1. **配额限制**：百度普通收录每日有配额限制，请合理使用
2. **Token安全**：妥善保管Token，不要泄露
3. **执行频率**：建议每天执行1-2次，避免过于频繁
4. **日志监控**：定期检查日志，及时发现问题

## 📞 支持

如有问题，请查看项目日志或联系技术支持。

---

**最后更新：2025-01-28**
