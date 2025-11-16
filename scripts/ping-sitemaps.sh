#!/bin/bash

# 提交 sitemap 到搜索引擎（可选）
# 使用方法：
#   ENABLE_SITEMAP_PING=true SITEMAP_URL="https://zhitoujianli.com/sitemap.xml" bash scripts/ping-sitemaps.sh
#
# 环境变量：
#   ENABLE_SITEMAP_PING=true|false  是否启用（默认false）
#   SITEMAP_URL                     完整sitemap地址（默认 https://zhitoujianli.com/sitemap.xml）
#   USER_AGENT                      自定义UA（可选）
#
# 说明：
#   - Google 的 ping 接口已宣布废弃，但多数情况下仍会返回 200，作为“尽力而为”处理；
#   - Bing 的 ping 接口有效；
#   - Baidu 需要站点验证与独立推送API token，这里仅预留变量，不默认调用。

set -e

ENABLE="${ENABLE_SITEMAP_PING:-false}"
SITEMAP_URL="${SITEMAP_URL:-https://zhitoujianli.com/sitemap.xml}"
UA="${USER_AGENT:-ZhitouJianliBot/1.0 (+https://www.zhitoujianli.com))}"

if [ "$ENABLE" != "true" ]; then
  echo "ℹ️  ENABLE_SITEMAP_PING!=true，跳过搜索引擎Ping（SITEMAP_URL=$SITEMAP_URL）"
  exit 0
fi

echo "🔔 开始提交 Sitemap: $SITEMAP_URL"

curl_opts=( -A "$UA" -sS -m 10 -w " => %{http_code}\n" )

echo "• Bing"
curl "${curl_opts[@]}" "https://www.bing.com/ping?sitemap=${SITEMAP_URL}" || true

echo "• Google（接口已废弃，尽力Ping）"
curl "${curl_opts[@]}" "https://www.google.com/ping?sitemap=${SITEMAP_URL}" || true

echo "• Baidu（需独立token接口，此处仅提示）"
echo "  请在百度搜索资源平台提交或配置专用推送API。"

echo "✅ 提交完成"


