#!/usr/bin/env bash
# =============================================================================
# 在 JDK 21 下执行 Maven（避免本机默认 Java 23 导致 Mockito / 字节码增强失败）
# 用法：在项目根目录
#   bash scripts/mvn-java21.sh test
#   bash scripts/mvn-java21.sh clean package -DskipTests
# =============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT/backend/get_jobs"

java_home_is_21() {
  local java_bin="$1/bin/java"
  [[ -x "$java_bin" ]] || return 1
  "$java_bin" -version 2>&1 | grep -qE 'version "21|version "1\.21' || return 1
  return 0
}

export_java21_home() {
  # 已指向 21 则沿用
  if [[ -n "${JAVA_HOME:-}" ]] && java_home_is_21 "$JAVA_HOME"; then
    return 0
  fi

  if [[ "$(uname -s)" == "Darwin" ]]; then
    local jh
    jh="$(/usr/libexec/java_home -v 21 2>/dev/null || true)"
    if [[ -n "$jh" ]] && java_home_is_21 "$jh"; then
      export JAVA_HOME="$jh"
      return 0
    fi
  fi

  # Linux / 通用：常见安装路径
  local candidates=(
    "/usr/lib/jvm/java-21-openjdk-amd64"
    "/usr/lib/jvm/java-21-openjdk"
    "/usr/lib/jvm/temurin-21-jdk-amd64"
    "/usr/lib/jvm/java-21-amazon-corretto"
  )
  for c in "${candidates[@]}"; do
    if [[ -d "$c" ]] && java_home_is_21 "$c"; then
      export JAVA_HOME="$c"
      return 0
    fi
  done

  return 1
}

if ! export_java21_home; then
  echo "错误: 未检测到 JDK 21。" >&2
  echo "  • macOS: 安装 Temurin 21 后执行 /usr/libexec/java_home -v 21" >&2
  echo "  • 或手动: export JAVA_HOME=/path/to/jdk-21" >&2
  echo "  • 下载: https://adoptium.net/temurin/releases/?version=21" >&2
  exit 1
fi

echo "[mvn-java21] JAVA_HOME=$JAVA_HOME" >&2
exec mvn "$@"
