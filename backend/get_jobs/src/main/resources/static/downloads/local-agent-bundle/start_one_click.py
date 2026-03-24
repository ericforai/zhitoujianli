#!/usr/bin/env python3
"""
One-click launcher for local agent.

Responsibilities:
1) Ensure Python virtual environment exists.
2) Install dependencies from requirements.txt when missing.
3) Forward CLI args to boss_local_agent.py.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
VENV_DIR = ROOT / ".venv"
REQ_FILE = ROOT / "requirements.txt"
AGENT_FILE = ROOT / "boss_local_agent.py"


def _venv_python() -> Path:
    if os.name == "nt":
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python3"


def _run(cmd: list[str]) -> None:
    subprocess.check_call(cmd, cwd=str(ROOT))


def _ensure_venv() -> Path:
    py = _venv_python()
    if py.exists():
        return py
    print("[local-agent] Creating virtual environment...")
    _run([sys.executable, "-m", "venv", str(VENV_DIR)])
    return py


def _ensure_deps(py: Path) -> None:
    print("[local-agent] Upgrading pip...")
    _run([str(py), "-m", "pip", "install", "--upgrade", "pip"])
    if REQ_FILE.exists():
        print("[local-agent] Installing dependencies...")
        _run([str(py), "-m", "pip", "install", "-r", str(REQ_FILE)])
        print("[local-agent] Installing Playwright Chromium...")
        _run([str(py), "-m", "playwright", "install", "chromium"])


def main() -> int:
    if not AGENT_FILE.exists():
        print("[local-agent] ERROR: boss_local_agent.py not found.")
        return 1

    py = _ensure_venv()
    marker = VENV_DIR / ".deps_installed"
    if not marker.exists():
        _ensure_deps(py)
        marker.write_text("ok", encoding="utf-8")

    cmd = [str(py), str(AGENT_FILE), *sys.argv[1:]]
    print("[local-agent] Starting agent...")
    return subprocess.call(cmd, cwd=str(ROOT))


if __name__ == "__main__":
    raise SystemExit(main())
