#!/usr/bin/env bash
# ==========================================================
# 🧩 Cursor + Codex 登录修复脚本
# 适配环境：Cursor 1.7.x / Codex (gpt-5-codex)
# 功能：自动检测 → 清理 → 登录 → 验证
# ==========================================================

set -e

echo "==============================="
echo "🚀 Cursor Codex 登录修复工具"
echo "==============================="

# Step 1. 检查 Cursor CLI 是否存在
if ! command -v cursor &> /dev/null; then
  echo "❌ 未检测到 cursor CLI，请先执行: curl -fsSL https://cursor.sh/install.sh | bash"
  exit 1
fi

# Step 2. 检查版本
VERSION=$(cursor --version | head -n1)
echo "🧩 当前 Cursor 版本: $VERSION"

# Step 3. 清理旧配置（防止残留 token 导致 403）
echo "🧹 清理旧的 Cursor/Codex 缓存..."
rm -rf ~/.cursor/codex_settings.json ~/.cursor/session.json ~/.cursor/tmp 2>/dev/null || true

# Step 4. 检查网络可达性
echo "🌐 测试与 Codex 授权服务器的连接..."
if ! curl -s --max-time 5 https://auth.cursor.sh >/dev/null; then
  echo "⚠️ 无法访问 auth.cursor.sh，请检查服务器是否能访问公网。"
  echo "提示：若在内网环境，请执行 export CURSOR_AUTH_MODE=offline"
  exit 1
fi

# Step 5. 检查当前登录状态
echo "🔍 检查 Cursor 登录状态..."
if cursor whoami &>/dev/null; then
  echo "✅ Cursor 登录有效。"
else
  echo "⚠️ Cursor 未登录，执行登录流程..."
  cursor login
fi

# Step 6. 登录 Codex
echo "🔐 初始化 Codex 授权..."
if cursor codex login &>/dev/null; then
  echo "✅ Codex 登录命令执行成功。"
else
  echo "⚠️ 自动登录失败，请手动打开浏览器完成授权："
  cursor codex login
fi

# Step 7. 验证连接状态
echo "🔎 验证 Codex 状态..."
if cursor codex status 2>/dev/null | grep -q "connected"; then
  echo "🎯 Codex 连接成功 ✅"
else
  echo "❌ Codex 授权仍有问题，请查看 ~/.cursor/logs/latest.log"
  echo "常见原因："
  echo " - Session token 已过期"
  echo " - 服务器防火墙阻止 token exchange"
  echo " - Root 用户权限导致环境变量未继承"
  exit 1
fi

# Step 8. 显示结论
echo ""
echo "========================================"
echo "✅ Codex 授权已恢复，可在 Cursor 中使用。"
echo "✨ 若问题复现，可执行："
echo "   bash fix_codex_auth.sh --force"
echo "========================================"
