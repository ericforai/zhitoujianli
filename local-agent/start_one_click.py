#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Boss 本地 Agent 一键启动器

目标：把用户侧操作压缩为「双击/单命令启动」。
功能：
1) 自动创建并使用 .venv
2) 自动安装 requirements.txt
3) 自动安装 Playwright Chromium
4) 启动 boss_local_agent.py（参数透传）
"""

from __future__ import annotations

import hashlib
import os
import platform
import subprocess
import sys
import venv
from pathlib import Path
from typing import List


SCRIPT_DIR = Path(__file__).parent.resolve()
VENV_DIR = SCRIPT_DIR / ".venv"
REQUIREMENTS_FILE = SCRIPT_DIR / "requirements.txt"
DEPS_STAMP = VENV_DIR / ".deps.sha256"
PW_STAMP = VENV_DIR / ".playwright.chromium.ok"


def _venv_python() -> Path:
    if platform.system().lower().startswith("win"):
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python"


def _run(cmd: List[str]) -> None:
    print(f"[RUN] {' '.join(cmd)}")
    subprocess.check_call(cmd, cwd=str(SCRIPT_DIR))


def _file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def _ensure_venv_and_reexec() -> None:
    if not VENV_DIR.exists():
        print("[INFO] 首次运行：正在创建 Python 虚拟环境 .venv ...")
        venv.EnvBuilder(with_pip=True).create(str(VENV_DIR))

    vpy = _venv_python()
    if not vpy.exists():
        raise RuntimeError(f"虚拟环境 Python 不存在: {vpy}")

    current = Path(sys.executable).resolve()
    target = vpy.resolve()

    if current != target:
        print("[INFO] 切换到虚拟环境解释器...")
        os.execv(str(target), [str(target), str(__file__), *sys.argv[1:]])


def _ensure_dependencies() -> None:
    if not REQUIREMENTS_FILE.exists():
        raise RuntimeError(f"缺少依赖文件: {REQUIREMENTS_FILE}")

    expected_sha = _file_sha256(REQUIREMENTS_FILE)
    installed_sha = DEPS_STAMP.read_text(encoding="utf-8").strip() if DEPS_STAMP.exists() else ""

    deps_ok = False
    if installed_sha == expected_sha:
        probe = subprocess.run(
            [
                sys.executable,
                "-c",
                "import playwright, websockets, aiohttp; print('ok')",
            ],
            cwd=str(SCRIPT_DIR),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        deps_ok = probe.returncode == 0

    if not deps_ok:
        print("[INFO] 正在安装/更新 Python 依赖...")
        _run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
        _run([sys.executable, "-m", "pip", "install", "-r", str(REQUIREMENTS_FILE)])
        DEPS_STAMP.write_text(expected_sha, encoding="utf-8")
    else:
        print("[INFO] Python 依赖已是最新，跳过安装")


def _ensure_playwright_chromium() -> None:
    if PW_STAMP.exists():
        probe = subprocess.run(
            [
                sys.executable,
                "-c",
                "from pathlib import Path; "
                "from playwright.sync_api import sync_playwright; "
                "p=sync_playwright().start(); "
                "ok=Path(p.chromium.executable_path).exists(); "
                "p.stop(); "
                "raise SystemExit(0 if ok else 1)",
            ],
            cwd=str(SCRIPT_DIR),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        if probe.returncode == 0:
            print("[INFO] Playwright Chromium 已安装，跳过安装")
            return
        print("[WARN] 检测到浏览器缓存异常，准备重新安装 Chromium")

    print("[INFO] 正在安装 Playwright Chromium（首次需要）...")
    _run([sys.executable, "-m", "playwright", "install", "chromium"])
    PW_STAMP.write_text("ok\n", encoding="utf-8")


def _launch_agent() -> int:
    agent_py = SCRIPT_DIR / "boss_local_agent.py"
    if not agent_py.exists():
        raise RuntimeError(f"缺少主程序: {agent_py}")

    forwarded_args = list(sys.argv[1:])
    cmd = [sys.executable, str(agent_py), *forwarded_args]

    # 默认加 --save：首次交互登录后会提示保存，后续更省事
    if "--save" not in forwarded_args:
        cmd.append("--save")

    print("\n========================================")
    print("  Boss 本地 Agent 一键启动")
    print("========================================")
    print("提示：首次运行会要求登录智投简历账号，并在浏览器扫码登录 Boss。")
    print("后续启动会更快。\n")
    # Windows：launcher 用 subprocess 再启一层 Python 时，控制台 stdin 与 getpass 链路易异常，
    # 表现为「密码」行键入完全无响应（并非不回显）。execv 用主程序替换当前进程，保持同一交互会话。
    os.chdir(SCRIPT_DIR)
    argv = [str(x) for x in cmd]
    os.execv(argv[0], argv)


def main() -> int:
    try:
        _ensure_venv_and_reexec()
        _ensure_dependencies()
        _ensure_playwright_chromium()
        return _launch_agent()
    except KeyboardInterrupt:
        print("\n[INFO] 已取消启动")
        return 130
    except Exception as e:
        print(f"\n[ERROR] 启动失败: {e}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
