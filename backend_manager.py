#!/usr/bin/env python3
"""
后端服务管理工具 - 统一脚本

功能:
  - restart: 重启后端服务
  - start: 启动后端服务
  - stop: 停止后端服务
  - status: 检查服务状态
  - fix: 修复并重启服务

作者: ZhiTouJianLi Team
创建时间: 2025-01-11
"""

import argparse
import logging
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Optional, Tuple

# ============================================================================
# 配置部分 - 从环境变量读取，支持不同部署环境
# ============================================================================

PROJECT_ROOT = Path(os.getenv('ZHITOUJIANLI_ROOT', '/root/zhitoujianli'))
BACKEND_DIR = PROJECT_ROOT / 'backend' / 'get_jobs'
LOG_DIR = PROJECT_ROOT / 'logs'
BACKEND_LOG = LOG_DIR / 'backend.log'
JAR_FILE = BACKEND_DIR / 'target' / 'get_jobs-1.0-SNAPSHOT.jar'
ALTERNATIVE_JAR = BACKEND_DIR / 'target' / 'get_jobs-v2.0.1.jar'
BACKEND_PORT = int(os.getenv('BACKEND_PORT', '8080'))
STARTUP_WAIT = int(os.getenv('BACKEND_STARTUP_WAIT', '10'))

# ============================================================================
# 日志配置
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


# ============================================================================
# 核心功能函数
# ============================================================================

def check_requirements() -> bool:
    """
    检查运行环境依赖

    Returns:
        bool: 环境检查是否通过
    """
    # 检查项目目录
    if not PROJECT_ROOT.exists():
        logger.error(f"项目目录不存在: {PROJECT_ROOT}")
        logger.info("请设置环境变量: export ZHITOUJIANLI_ROOT=/path/to/project")
        return False

    # 检查后端目录
    if not BACKEND_DIR.exists():
        logger.error(f"后端目录不存在: {BACKEND_DIR}")
        return False

    # 检查Maven
    try:
        subprocess.run(['mvn', '--version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        logger.error("Maven未安装或不在PATH中")
        return False

    # 确保日志目录存在
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    return True


def stop_backend() -> bool:
    """
    停止后端服务

    Returns:
        bool: 停止是否成功
    """
    logger.info("正在停止后端服务...")

    try:
        # 停止Java进程
        subprocess.run(['pkill', '-f', 'get_jobs'], check=False)
        subprocess.run(['pkill', '-f', 'WebApplication'], check=False)

        # 等待进程完全停止
        time.sleep(3)

        # 验证进程已停止
        result = subprocess.run(
            ['pgrep', '-f', 'get_jobs'],
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            logger.warning("部分进程可能未完全停止")
            return False

        logger.info("✅ 后端服务已停止")
        return True

    except Exception as e:
        logger.error(f"停止服务时出错: {e}")
        return False


def build_backend(clean: bool = False) -> bool:
    """
    编译后端项目

    Args:
        clean: 是否执行clean

    Returns:
        bool: 编译是否成功
    """
    logger.info("正在编译后端项目...")

    try:
        os.chdir(BACKEND_DIR)

        mvn_command = ['mvn']
        if clean:
            mvn_command.append('clean')
        mvn_command.extend(['package', '-DskipTests', '-q'])

        result = subprocess.run(
            mvn_command,
            capture_output=True,
            text=True,
            timeout=300  # 5分钟超时
        )

        if result.returncode == 0:
            logger.info("✅ 编译成功")
            return True
        else:
            logger.error(f"❌ 编译失败:\n{result.stderr}")
            return False

    except subprocess.TimeoutExpired:
        logger.error("编译超时（超过5分钟）")
        return False
    except Exception as e:
        logger.error(f"编译时出错: {e}")
        return False


def start_backend() -> bool:
    """
    启动后端服务

    Returns:
        bool: 启动是否成功
    """
    logger.info("正在启动后端服务...")

    # 确定JAR文件
    jar_file = JAR_FILE if JAR_FILE.exists() else ALTERNATIVE_JAR

    if not jar_file.exists():
        logger.error(f"JAR文件不存在: {jar_file}")
        logger.info("请先运行编译: python3 backend_manager.py build")
        return False

    try:
        # 启动服务
        with open(BACKEND_LOG, 'w', encoding='utf-8') as log_file:
            process = subprocess.Popen(
                ['java', '-jar', str(jar_file)],
                stdout=log_file,
                stderr=subprocess.STDOUT,
                cwd=str(BACKEND_DIR)
            )

        logger.info(f"✅ 后端服务已启动 (PID: {process.pid})")
        logger.info(f"📋 日志文件: {BACKEND_LOG}")
        logger.info(f"⏳ 等待{STARTUP_WAIT}秒让服务启动...")

        time.sleep(STARTUP_WAIT)

        return True

    except Exception as e:
        logger.error(f"启动服务失败: {e}")
        return False


def check_status() -> Tuple[bool, Optional[str]]:
    """
    检查服务状态

    Returns:
        Tuple[bool, Optional[str]]: (是否运行中, 状态信息)
    """
    logger.info("🔍 检查后端服务状态...")

    # 检查Java进程
    try:
        result = subprocess.run(
            ['pgrep', '-f', 'get_jobs'],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            logger.info("❌ 后端Java进程未运行")
            return False, "进程未运行"

        pids = result.stdout.strip().split('\n')
        logger.info(f"✅ 发现后端Java进程 (PID: {', '.join(pids)})")

    except Exception as e:
        logger.error(f"检查进程时出错: {e}")
        return False, f"检查进程失败: {e}"

    # 检查端口监听
    try:
        result = subprocess.run(
            ['netstat', '-tlnp'],
            capture_output=True,
            text=True
        )

        if f':{BACKEND_PORT}' in result.stdout:
            logger.info(f"✅ 端口 {BACKEND_PORT} 正在监听")
        else:
            logger.warning(f"⚠️ 端口 {BACKEND_PORT} 未监听")

    except Exception as e:
        logger.warning(f"检查端口时出错: {e}")

    # 测试HTTP响应
    try:
        import requests
        response = requests.get(
            f'http://localhost:{BACKEND_PORT}/api/status',
            timeout=5
        )

        if response.status_code == 200:
            logger.info("✅ HTTP服务响应正常")
            logger.info(f"   响应: {response.text[:100]}")
            return True, "服务正常运行"
        else:
            logger.warning(f"⚠️ HTTP响应异常: {response.status_code}")
            return True, f"服务运行但响应异常: {response.status_code}"

    except ImportError:
        logger.warning("未安装requests库，跳过HTTP测试")
        logger.info("安装方法: pip install requests")
        return True, "进程运行中（未验证HTTP）"
    except Exception as e:
        logger.warning(f"HTTP测试失败: {e}")
        return True, f"进程运行中，但HTTP测试失败: {e}"


# ============================================================================
# 组合操作
# ============================================================================

def restart_backend(clean: bool = False) -> bool:
    """
    重启后端服务（停止 → 编译 → 启动）

    Args:
        clean: 是否执行clean编译

    Returns:
        bool: 重启是否成功
    """
    logger.info("=" * 60)
    logger.info("开始重启后端服务")
    logger.info("=" * 60)

    # 停止
    stop_backend()

    # 编译
    if not build_backend(clean=clean):
        logger.error("编译失败，中止重启")
        return False

    # 启动
    if not start_backend():
        logger.error("启动失败")
        return False

    # 验证
    time.sleep(2)
    is_running, status_msg = check_status()

    if is_running:
        logger.info("=" * 60)
        logger.info("🎉 后端服务重启成功！")
        logger.info(f"🔗 服务地址: http://localhost:{BACKEND_PORT}")
        logger.info(f"📋 日志文件: {BACKEND_LOG}")
        logger.info("=" * 60)
        return True
    else:
        logger.error("=" * 60)
        logger.error("❌ 后端服务重启失败")
        logger.error(f"状态: {status_msg}")
        logger.error(f"请检查日志: {BACKEND_LOG}")
        logger.error("=" * 60)
        return False


def fix_backend() -> bool:
    """
    修复后端服务（强制清理 → 重新编译 → 重启）

    Returns:
        bool: 修复是否成功
    """
    logger.info("=" * 60)
    logger.info("🔧 开始修复后端服务（强制模式）")
    logger.info("=" * 60)

    # 强制停止
    logger.info("1. 强制停止所有Java进程...")
    try:
        subprocess.run(['pkill', '-9', '-f', 'java'], check=False)
        time.sleep(2)
    except Exception as e:
        logger.warning(f"强制停止时出错: {e}")

    # 释放端口
    logger.info(f"2. 释放端口 {BACKEND_PORT}...")
    try:
        result = subprocess.run(
            ['lsof', f'-ti:{BACKEND_PORT}'],
            capture_output=True,
            text=True
        )

        if result.stdout.strip():
            pids = result.stdout.strip().split('\n')
            for pid in pids:
                try:
                    subprocess.run(['kill', '-9', pid], check=True)
                    logger.info(f"   已杀死进程 {pid}")
                except subprocess.CalledProcessError:
                    pass
            time.sleep(2)

    except Exception as e:
        logger.warning(f"释放端口时出错: {e}")

    # Clean编译
    logger.info("3. Clean编译...")
    if not build_backend(clean=True):
        logger.error("Clean编译失败")
        return False

    # 启动
    logger.info("4. 启动服务...")
    if not start_backend():
        logger.error("启动失败")
        return False

    # 验证
    logger.info("5. 验证服务...")
    time.sleep(5)
    is_running, status_msg = check_status()

    if is_running:
        logger.info("=" * 60)
        logger.info("🎉 后端服务修复成功！")
        logger.info("=" * 60)
        return True
    else:
        logger.error("=" * 60)
        logger.error("❌ 修复失败")
        logger.error(f"状态: {status_msg}")
        logger.error("=" * 60)
        return False


# ============================================================================
# CLI入口
# ============================================================================

def main():
    """主函数 - CLI入口"""
    parser = argparse.ArgumentParser(
        description='后端服务管理工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
  # 重启服务
  python3 backend_manager.py restart

  # 重启并执行clean编译
  python3 backend_manager.py restart --clean

  # 修复服务（强制模式）
  python3 backend_manager.py fix

  # 检查服务状态
  python3 backend_manager.py status

  # 仅停止服务
  python3 backend_manager.py stop
        '''
    )

    parser.add_argument(
        'action',
        choices=['start', 'stop', 'restart', 'status', 'fix', 'build'],
        help='要执行的操作'
    )

    parser.add_argument(
        '--clean',
        action='store_true',
        help='执行clean编译（用于restart/build）'
    )

    args = parser.parse_args()

    # 检查环境
    if not check_requirements():
        logger.error("环境检查失败，退出")
        sys.exit(1)

    # 执行操作
    success = False

    if args.action == 'stop':
        success = stop_backend()

    elif args.action == 'build':
        success = build_backend(clean=args.clean)

    elif args.action == 'start':
        success = start_backend()
        if success:
            time.sleep(2)
            check_status()

    elif args.action == 'restart':
        success = restart_backend(clean=args.clean)

    elif args.action == 'status':
        is_running, status_msg = check_status()
        success = is_running
        if is_running:
            logger.info(f"\n状态: {status_msg}")
        else:
            logger.warning(f"\n状态: {status_msg}")

    elif args.action == 'fix':
        success = fix_backend()

    # 退出码
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()


