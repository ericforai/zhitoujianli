#!/bin/bash
################################################################################
# 智投简历 - 本地Agent下载包校验脚本
# 功能：校验 local-agent.zip 的关键文件、权限位与文案一致性
################################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ZIP_PATH="$PROJECT_ROOT/backend/get_jobs/src/main/resources/static/downloads/local-agent.zip"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
  echo -e "${BLUE}ℹ️  $*${NC}"
}

log_ok() {
  echo -e "${GREEN}✅ $*${NC}"
}

log_warn() {
  echo -e "${YELLOW}⚠️  $*${NC}"
}

log_err() {
  echo -e "${RED}❌ $*${NC}"
}

usage() {
  cat <<'EOF'
用法:
  ./scripts/verify-local-agent-package.sh [--check-url URL]

示例:
  ./scripts/verify-local-agent-package.sh
  ./scripts/verify-local-agent-package.sh --check-url https://www.zhitoujianli.com/api/local-agent/download
EOF
}

CHECK_URL=""
if [[ "${1:-}" == "--check-url" ]]; then
  CHECK_URL="${2:-}"
  if [[ -z "$CHECK_URL" ]]; then
    usage
    exit 1
  fi
elif [[ "${1:-}" != "" ]]; then
  usage
  exit 1
fi

if [[ ! -f "$ZIP_PATH" ]]; then
  log_err "未找到下载包: $ZIP_PATH"
  exit 1
fi

log_info "开始校验本地Agent下载包: $ZIP_PATH"

python3 - "$ZIP_PATH" <<'PY'
import io
import sys
import zipfile
from pathlib import Path

zip_path = Path(sys.argv[1])
required_files = {
    "boss_local_agent.py",
    "requirements.txt",
    "README.md",
    "start_one_click.py",
    "start.command",
    "start.bat",
}
required_exec = {"start.command", "start_one_click.py"}

with zipfile.ZipFile(zip_path) as zf:
    names = set(zf.namelist())
    missing = sorted(required_files - names)
    if missing:
        print(f"缺失关键文件: {missing}")
        sys.exit(2)

    for name in sorted(required_exec):
        info = zf.getinfo(name)
        mode = (info.external_attr >> 16) & 0o777
        if (mode & 0o111) == 0:
            print(f"文件缺少可执行权限: {name}, mode={oct(mode)}")
            sys.exit(3)

    readme = zf.read("README.md").decode("utf-8", errors="ignore")
    required_keywords = ["start.command", "start.bat", "start_one_click.py", "3步开始投递"]
    for kw in required_keywords:
        if kw not in readme:
            print(f"README未包含关键提示: {kw}")
            sys.exit(4)

print("ZIP_CONTENT_OK")
PY

log_ok "本地zip内容校验通过"

if [[ -n "$CHECK_URL" ]]; then
  log_info "校验线上下载接口: $CHECK_URL"
  python3 - "$CHECK_URL" <<'PY'
import io
import sys
import zipfile
import requests

url = sys.argv[1]
resp = requests.get(url, timeout=25)
if resp.status_code != 200:
    print(f"下载接口状态异常: {resp.status_code}")
    sys.exit(5)

content_type = resp.headers.get("content-type", "")
if "application/octet-stream" not in content_type:
    print(f"下载接口 content-type 异常: {content_type}")
    sys.exit(6)

required = {"start.command", "start.bat", "start_one_click.py", "README.md"}
zf = zipfile.ZipFile(io.BytesIO(resp.content))
missing = sorted(required - set(zf.namelist()))
if missing:
    print(f"线上zip缺失关键文件: {missing}")
    sys.exit(7)

for name in ("start.command", "start_one_click.py"):
    info = zf.getinfo(name)
    mode = (info.external_attr >> 16) & 0o777
    if (mode & 0o111) == 0:
        print(f"线上zip文件缺少可执行权限: {name}, mode={oct(mode)}")
        sys.exit(8)

print("REMOTE_DOWNLOAD_OK")
PY
  log_ok "线上下载接口校验通过"
else
  log_warn "未执行线上接口校验（可使用 --check-url 开启）"
fi

log_ok "本地Agent下载包校验完成"
