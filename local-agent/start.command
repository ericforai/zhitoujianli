#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# macOS/Linux 双击启动入口
if command -v python3 >/dev/null 2>&1; then
  exec python3 "$SCRIPT_DIR/start_one_click.py" "$@"
fi

echo "[ERROR] 未找到 python3，请先安装 Python 3.8+"
read -r -p "按回车键退出..."
exit 1
