#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Boss直聘本地Agent - 在用户本地执行投递任务，避免服务器风控

使用方法:
    python boss_local_agent.py

特点:
    1. 使用本地Chrome浏览器（真实指纹）
    2. 使用本地IP（分散请求来源）
    3. WebSocket与服务器通信
    4. 支持有头/无头模式切换
    5. 使用账号密码登录，无需Token
"""

import asyncio
import json
import logging
import os
import sys
import time
import uuid
import argparse
import signal
import getpass
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, asdict
from enum import Enum

# HTTP请求
try:
    import aiohttp
except ImportError:
    print("请先安装依赖: pip install aiohttp")
    sys.exit(1)

# Playwright 和 WebSocket
try:
    from playwright.async_api import async_playwright, Browser, BrowserContext, Page
    import websockets
except ImportError:
    print("请先安装依赖: pip install playwright websockets")
    print("然后安装浏览器: playwright install chromium")
    sys.exit(1)


# ================== 配置 ==================

@dataclass
class AgentConfig:
    """Agent配置"""
    server_url: str = "wss://www.zhitoujianli.com/ws/local-agent"  # WebSocket地址
    api_url: str = "https://www.zhitoujianli.com"  # API地址
    email: str = ""  # 登录邮箱
    password: str = ""  # 登录密码
    access_token: str = ""  # JWT Token（登录后获取）
    headless: bool = False  # 默认有头模式，更安全
    user_data_dir: str = ""  # Chrome用户数据目录，复用登录状态
    reconnect_interval: int = 5  # 重连间隔（秒）
    heartbeat_interval: int = 30  # 心跳间隔（秒）
    task_timeout: int = 300  # 单个任务超时（秒）
    log_level: str = "INFO"


class TaskType(Enum):
    """任务类型"""
    DELIVERY = "delivery"  # 投递任务
    LOGIN = "login"  # 登录任务（获取Cookie）
    VERIFY = "verify"  # 验证码处理


class AgentStatus(Enum):
    """Agent状态"""
    OFFLINE = "offline"
    CONNECTING = "connecting"
    ONLINE = "online"
    BUSY = "busy"
    ERROR = "error"


# ================== 日志配置 ==================

def get_script_dir() -> Path:
    """获取脚本所在目录（支持从任意目录启动）"""
    return Path(__file__).parent.resolve()


def setup_logging(level: str = "INFO"):
    """配置日志"""
    log_format = "%(asctime)s [%(levelname)s] %(message)s"

    # 日志文件保存在脚本所在目录
    log_file = get_script_dir() / "boss_agent.log"

    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(str(log_file), encoding="utf-8")
        ]
    )
    return logging.getLogger("BossAgent")


logger = setup_logging()


# ================== 消息定义 ==================

@dataclass
class Message:
    """WebSocket消息"""
    type: str
    payload: Dict[str, Any]
    request_id: str = ""
    timestamp: int = 0

    def __post_init__(self):
        if not self.request_id:
            self.request_id = str(uuid.uuid4())
        if not self.timestamp:
            self.timestamp = int(time.time() * 1000)

    def to_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=False)

    @classmethod
    def from_json(cls, data: str) -> "Message":
        obj = json.loads(data)
        return cls(**obj)


@dataclass
class DeliveryTask:
    """投递任务"""
    task_id: str
    job_url: str
    job_name: str
    company_name: str
    greeting_message: str
    config: Dict[str, Any]  # 用户配置（黑名单、过滤规则等）
    task_type: str = "delivery"  # 任务类型: delivery（单个职位）或 search（搜索页面）


# ================== Playwright 控制器 ==================

class PlaywrightController:
    """Playwright浏览器控制器"""

    def __init__(self, config: AgentConfig):
        self.config = config
        self.playwright = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self._initialized = False

    async def initialize(self):
        """初始化浏览器"""
        if self._initialized:
            return

        logger.info("正在初始化Playwright...")
        self.playwright = await async_playwright().start()

        # 启动参数 - 模拟真实用户
        launch_args = [
            "--disable-blink-features=AutomationControlled",
            "--disable-dev-shm-usage",
            "--no-sandbox",
            "--disable-web-security",
            "--disable-features=IsolateOrigins,site-per-process",
        ]

        # 使用持久化上下文（复用登录状态）
        # 如果用户指定了目录则使用，否则使用脚本所在目录下的chrome-data
        if self.config.user_data_dir:
            user_data_dir = self.config.user_data_dir
        else:
            user_data_dir = str(get_script_dir() / "chrome-data")
        Path(user_data_dir).mkdir(parents=True, exist_ok=True)

        logger.info(f"Chrome用户数据目录: {user_data_dir}")
        logger.info(f"模式: {'无头' if self.config.headless else '有头'}")

        # 创建持久化浏览器上下文
        self.context = await self.playwright.chromium.launch_persistent_context(
            user_data_dir=user_data_dir,
            headless=self.config.headless,
            args=launch_args,
            viewport={"width": 1920, "height": 1080},
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
            # 反检测设置
            ignore_default_args=["--enable-automation"],
            chromium_sandbox=False,
        )

        # 注入反检测脚本
        await self.context.add_init_script("""
            // 隐藏 webdriver 标识
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });

            // 隐藏 Playwright 特征
            delete window.__playwright;
            delete window.__pw_manual;

            // 模拟真实的 Chrome 插件
            Object.defineProperty(navigator, 'plugins', {
                get: () => [
                    { name: 'Chrome PDF Plugin' },
                    { name: 'Chrome PDF Viewer' },
                    { name: 'Native Client' }
                ]
            });

            // 模拟真实的语言设置
            Object.defineProperty(navigator, 'languages', {
                get: () => ['zh-CN', 'zh', 'en-US', 'en']
            });
        """)

        self.page = await self.context.new_page()
        self._initialized = True
        logger.info("Playwright初始化完成")

        # 自动打开Boss直聘登录页，方便用户登录
        await self._open_login_page()

    async def _open_login_page(self):
        """打开Boss直聘并检查登录状态"""
        try:
            logger.info("正在打开Boss直聘...")
            await self.page.goto("https://www.zhipin.com", wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(2)

            # 检查是否已登录
            cookies = await self.context.cookies()
            has_wt2 = any(c["name"] == "wt2" for c in cookies)

            if has_wt2:
                logger.info("✅ 检测到已登录Boss直聘，可以开始投递")
            else:
                logger.info("=" * 50)
                logger.info("⚠️  请在浏览器中扫码登录Boss直聘")
                logger.info("   登录成功后，即可在网站开始投递")
                logger.info("=" * 50)
        except Exception as e:
            logger.warning(f"打开登录页失败: {e}，可稍后手动登录")

    async def close(self):
        """关闭浏览器"""
        if self.context:
            await self.context.close()
        if self.playwright:
            await self.playwright.stop()
        self._initialized = False
        logger.info("Playwright已关闭")

    async def navigate(self, url: str, wait_until: str = "domcontentloaded"):
        """导航到页面

        Args:
            url: 目标URL
            wait_until: 等待策略，默认使用domcontentloaded（更快更稳定）
                - domcontentloaded: DOM加载完成即可
                - load: 所有资源加载完成
                - networkidle: 网络空闲（Boss直聘页面可能永远不会达到）
        """
        try:
            await self.page.goto(url, wait_until=wait_until, timeout=30000)
        except Exception as e:
            # 如果超时但页面已经部分加载，继续执行
            if "Timeout" in str(e):
                logger.warning(f"⚠️ 页面加载超时，尝试继续: {url}")
                await asyncio.sleep(2)
            else:
                raise

    async def random_delay(self, min_ms: int = 1000, max_ms: int = 3000):
        """随机延迟，模拟人类行为"""
        import random
        delay = random.randint(min_ms, max_ms) / 1000
        await asyncio.sleep(delay)

    async def human_type(self, selector: str, text: str):
        """模拟人类打字"""
        import random
        element = self.page.locator(selector)
        await element.click()
        await self.random_delay(200, 500)

        for char in text:
            await element.press_sequentially(char, delay=random.randint(50, 150))
            # 偶尔停顿
            if random.random() < 0.1:
                await self.random_delay(200, 500)

    async def check_login_status(self) -> bool:
        """检查Boss直聘登录状态"""
        try:
            await self.navigate("https://www.zhipin.com")
            await self.random_delay(1000, 2000)

            # 检查是否有登录状态标识
            cookies = await self.context.cookies()
            has_wt2 = any(c["name"] == "wt2" for c in cookies)

            if has_wt2:
                logger.info("检测到登录Cookie (wt2)，已登录")
                return True

            # 检查页面元素
            login_btn = self.page.locator("a[ka='header-login']")
            if await login_btn.count() > 0:
                logger.info("检测到登录按钮，未登录")
                return False

            return True
        except Exception as e:
            logger.error(f"检查登录状态失败: {e}")
            return False

    async def execute_delivery(self, task: DeliveryTask) -> Dict[str, Any]:
        """执行投递任务（支持单个职位和搜索页面两种模式）"""
        result = {
            "task_id": task.task_id,
            "success": False,
            "message": "",
            "job_name": task.job_name,
            "company_name": task.company_name,
            "delivered_count": 0,  # 投递数量（搜索模式时有多个）
        }

        try:
            # 根据任务类型选择不同的执行逻辑
            if task.task_type == "search":
                # 搜索模式：打开搜索页面，自动投递多个职位
                return await self._execute_search_delivery(task, result)
            else:
                # 单个职位模式：直接投递指定职位
                return await self._execute_single_delivery(task, result)

        except Exception as e:
            logger.error(f"投递任务执行失败: {e}")
            result["message"] = str(e)
            return result

    async def _execute_search_delivery(self, task: DeliveryTask, result: Dict[str, Any]) -> Dict[str, Any]:
        """执行搜索页面投递（批量投递）"""
        logger.info(f"开始搜索投递: 关键词={task.job_name}")

        # 1. 导航到搜索页面
        await self.navigate(task.job_url)
        await self.random_delay(2000, 4000)

        # 2. 检查登录状态
        cookies = await self.context.cookies()
        has_wt2 = any(c["name"] == "wt2" for c in cookies)
        if not has_wt2:
            result["message"] = "需要登录，请先在浏览器中扫码登录Boss直聘"
            result["need_login"] = True
            logger.warning("未检测到登录状态，请先登录")
            return result

        # 3. 查找职位列表
        job_cards = self.page.locator(".job-card-wrapper, .job-list li, .search-job-result .job-card")
        job_count = await job_cards.count()
        logger.info(f"找到 {job_count} 个职位")

        if job_count == 0:
            result["message"] = "未找到职位列表，请检查搜索条件"
            return result

        # 4. 遍历职位进行投递
        delivered_count = 0
        max_delivery = task.config.get("maxDelivery", 10)  # 单次最多投递数量

        for i in range(min(job_count, max_delivery)):
            try:
                # 重新获取职位卡片（页面可能已更新）
                job_cards = self.page.locator(".job-card-wrapper, .job-list li, .search-job-result .job-card")
                if await job_cards.count() <= i:
                    break

                job_card = job_cards.nth(i)

                # 获取职位信息
                job_name_elem = job_card.locator(".job-name, .job-title, h3")
                company_elem = job_card.locator(".company-name, .company-text")

                job_name = await job_name_elem.first.text_content() if await job_name_elem.count() > 0 else "未知职位"
                company = await company_elem.first.text_content() if await company_elem.count() > 0 else "未知公司"

                logger.info(f"正在投递 [{i+1}/{min(job_count, max_delivery)}]: {company} - {job_name}")

                # 点击职位卡片
                await job_card.click()
                await self.random_delay(1500, 3000)

                # 查找并点击"立即沟通"按钮
                chat_btn = self.page.locator("a.btn-startchat, a.op-btn-chat, .job-detail-box a[ka='job-commu'], .btn-container .btn")

                if await chat_btn.count() > 0:
                    btn_text = await chat_btn.first.text_content()
                    if "沟通" in btn_text or "聊" in btn_text:
                        await chat_btn.first.click()
                        await self.random_delay(2000, 4000)

                        # 检查是否打开了聊天框或跳转到聊天页面
                        current_url = self.page.url
                        if "/chat/" in current_url or "/im/" in current_url:
                            # 发送打招呼语
                            if task.greeting_message:
                                input_elem = self.page.locator("div[contenteditable='true']")
                                if await input_elem.count() > 0:
                                    await input_elem.first.click()
                                    await self.random_delay(300, 600)
                                    await input_elem.first.fill(task.greeting_message)
                                    await self.random_delay(500, 1000)

                                    # 点击发送
                                    send_btn = self.page.locator(".chat-op .btn, .send-message, button.btn-send")
                                    if await send_btn.count() > 0:
                                        await send_btn.first.click()
                                        await self.random_delay(1000, 2000)

                            delivered_count += 1
                            logger.info(f"✅ 投递成功: {company} - {job_name}")

                            # 返回搜索页面继续下一个
                            await self.page.go_back()
                            await self.random_delay(1500, 3000)
                        else:
                            # 可能是弹窗形式
                            dialog = self.page.locator(".dialog-container, .greet-boss-dialog")
                            if await dialog.count() > 0:
                                delivered_count += 1
                                logger.info(f"✅ 已开始沟通: {company} - {job_name}")
                                # 关闭弹窗
                                close_btn = self.page.locator(".dialog-close, .close-btn, .icon-close")
                                if await close_btn.count() > 0:
                                    await close_btn.first.click()
                                await self.random_delay(1000, 2000)
                    else:
                        logger.debug(f"按钮状态异常: {btn_text}")
                else:
                    logger.debug(f"未找到沟通按钮: {company} - {job_name}")

                # 随机延迟，避免被检测
                await self.random_delay(2000, 5000)

            except Exception as e:
                logger.warning(f"投递第{i+1}个职位失败: {e}")
                continue

        result["success"] = delivered_count > 0
        result["message"] = f"完成搜索投递，成功投递 {delivered_count} 个职位"
        result["delivered_count"] = delivered_count
        logger.info(f"搜索投递完成: 总计={min(job_count, max_delivery)}, 成功={delivered_count}")
        return result

    async def execute_batch_search_delivery(
        self,
        task: DeliveryTask,
        max_delivery: int = 5,
        delivery_interval: int = 30
    ) -> Dict[str, Any]:
        """
        执行批量搜索投递（带人类化间隔）

        Args:
            task: 搜索任务
            max_delivery: 最大投递数量
            delivery_interval: 每次投递间隔（秒）
        """
        result = {
            "task_id": task.task_id,
            "success": False,
            "message": "",
            "job_name": task.job_name,
            "company_name": task.company_name,
            "delivered_count": 0,
        }

        try:
            logger.info(f"🔍 开始批量搜索投递: 关键词={task.job_name}, 最大投递={max_delivery}, 间隔={delivery_interval}秒")

            # 1. 导航到搜索页面
            await self.navigate(task.job_url)
            await self.random_delay(2000, 4000)

            # 2. 检查登录状态
            cookies = await self.context.cookies()
            has_wt2 = any(c["name"] == "wt2" for c in cookies)
            if not has_wt2:
                result["message"] = "需要登录，请先在浏览器中扫码登录Boss直聘"
                result["need_login"] = True
                logger.warning("⚠️ 未检测到登录状态，请先登录")
                return result

            # 3. 等待页面加载完成，查找职位列表
            await self.random_delay(2000, 3000)  # 额外等待JS渲染

            # Boss直聘职位卡片选择器（多种可能的选择器）
            selectors = [
                ".job-card-wrapper",           # 新版职位卡片
                ".job-list-box .job-card-wrapper",  # 搜索结果页
                "li.job-card-wrapper",         # 列表项形式
                ".search-job-result li",       # 旧版搜索结果
                "[class*='job-card']",         # 包含job-card的类名
                ".job-list li",                # 旧版列表
            ]

            job_cards = None
            job_count = 0

            for selector in selectors:
                try:
                    cards = self.page.locator(selector)
                    count = await cards.count()
                    if count > 0:
                        job_cards = cards
                        job_count = count
                        logger.info(f"📋 使用选择器 '{selector}' 找到 {job_count} 个职位")
                        break
                except Exception as e:
                    logger.debug(f"选择器 {selector} 失败: {e}")
                    continue

            if job_count == 0:
                # 打印页面内容帮助调试
                try:
                    page_content = await self.page.content()
                    if "job" in page_content.lower():
                        logger.warning("⚠️ 页面包含job相关内容，但未能匹配选择器")
                    # 尝试截图保存
                    await self.page.screenshot(path="debug_no_jobs.png")
                    logger.info("📸 已保存调试截图: debug_no_jobs.png")
                except:
                    pass

            logger.info(f"📋 找到 {job_count} 个职位")

            if job_count == 0:
                result["message"] = "未找到职位列表，请检查搜索条件"
                return result

            # 记住成功匹配的选择器
            matched_selector = None
            for selector in selectors:
                try:
                    cards = self.page.locator(selector)
                    if await cards.count() > 0:
                        matched_selector = selector
                        break
                except:
                    continue

            if not matched_selector:
                matched_selector = "[class*='job-card']"  # 默认选择器

            # 4. 遍历职位进行投递（带人类化间隔）
            delivered_count = 0
            actual_max = min(job_count, max_delivery)

            for i in range(actual_max):
                try:
                    # 重新获取职位卡片（使用匹配成功的选择器）
                    job_cards = self.page.locator(matched_selector)
                    current_count = await job_cards.count()
                    if current_count <= i:
                        logger.warning(f"职位卡片数量不足 (当前{current_count}个，需要第{i+1}个)，停止投递")
                        break

                    job_card = job_cards.nth(i)

                    # 获取职位信息
                    job_name_elem = job_card.locator(".job-name, .job-title, h3")
                    company_elem = job_card.locator(".company-name, .company-text")

                    job_name = await job_name_elem.first.text_content() if await job_name_elem.count() > 0 else "未知职位"
                    company = await company_elem.first.text_content() if await company_elem.count() > 0 else "未知公司"

                    logger.info(f"\n📤 [{i+1}/{actual_max}] 正在投递: {company} - {job_name}")

                    # 点击职位卡片
                    await job_card.click()
                    await self.random_delay(1500, 3000)

                    # 查找并点击"立即沟通"按钮
                    chat_btn = self.page.locator("a.btn-startchat, a.op-btn-chat, .job-detail-box a[ka='job-commu'], .btn-container .btn")

                    if await chat_btn.count() > 0:
                        btn_text = await chat_btn.first.text_content()
                        if "沟通" in btn_text or "聊" in btn_text:
                            await chat_btn.first.click()
                            await self.random_delay(2000, 4000)

                            # 检查是否打开了聊天框或跳转到聊天页面
                            current_url = self.page.url
                            if "/chat/" in current_url or "/im/" in current_url:
                                # 发送打招呼语
                                if task.greeting_message:
                                    input_elem = self.page.locator("div[contenteditable='true']")
                                    if await input_elem.count() > 0:
                                        await input_elem.first.click()
                                        await self.random_delay(300, 600)
                                        await input_elem.first.fill(task.greeting_message)
                                        await self.random_delay(500, 1000)

                                        # 点击发送
                                        send_btn = self.page.locator(".chat-op .btn, .send-message, button.btn-send")
                                        if await send_btn.count() > 0:
                                            await send_btn.first.click()
                                            await self.random_delay(1000, 2000)

                                delivered_count += 1
                                logger.info(f"✅ 投递成功: {company} - {job_name}")

                                # 返回搜索页面继续下一个
                                await self.page.go_back()
                                await self.random_delay(1500, 3000)
                            else:
                                # 可能是弹窗形式
                                dialog = self.page.locator(".dialog-container, .greet-boss-dialog")
                                if await dialog.count() > 0:
                                    delivered_count += 1
                                    logger.info(f"✅ 已开始沟通: {company} - {job_name}")
                                    # 关闭弹窗
                                    close_btn = self.page.locator(".dialog-close, .close-btn, .icon-close")
                                    if await close_btn.count() > 0:
                                        await close_btn.first.click()
                                    await self.random_delay(1000, 2000)
                        else:
                            logger.debug(f"按钮状态异常: {btn_text}")
                    else:
                        logger.debug(f"未找到沟通按钮: {company} - {job_name}")

                    # ⏰ 人类化间隔：如果不是最后一个，等待指定间隔
                    if i < actual_max - 1:
                        # 添加随机偏移，使间隔更自然
                        import random
                        actual_interval = delivery_interval + random.randint(-5, 10)
                        actual_interval = max(10, actual_interval)  # 至少10秒
                        logger.info(f"⏰ 等待 {actual_interval} 秒后投递下一个...")
                        await asyncio.sleep(actual_interval)

                except Exception as e:
                    logger.warning(f"❌ 投递第{i+1}个职位失败: {e}")
                    # 出错后也要等待一下再继续
                    await self.random_delay(3000, 5000)
                    continue

            result["success"] = delivered_count > 0
            result["message"] = f"完成搜索投递，成功投递 {delivered_count} 个职位"
            result["delivered_count"] = delivered_count
            logger.info(f"📊 搜索投递完成: 总计尝试={actual_max}, 成功={delivered_count}")
            return result

        except Exception as e:
            logger.error(f"批量搜索投递失败: {e}")
            result["message"] = str(e)
            return result

    async def _execute_single_delivery(self, task: DeliveryTask, result: Dict[str, Any]) -> Dict[str, Any]:
        """执行单个职位投递"""
        logger.info(f"开始投递: {task.company_name} - {task.job_name}")

        # 1. 导航到职位页面
        await self.navigate(task.job_url)
        await self.random_delay(2000, 4000)

        # 2. 检查是否需要登录
        if not await self.check_login_status():
            result["message"] = "需要登录，请先完成登录"
            result["need_login"] = True
            return result

        # 3. 查找"立即沟通"按钮
        chat_btn = self.page.locator("a.btn-startchat, a.op-btn-chat")
        if await chat_btn.count() == 0:
            result["message"] = "未找到立即沟通按钮"
            return result

        # 检查按钮文本
        btn_text = await chat_btn.first.text_content()
        if "沟通" not in btn_text:
            result["message"] = f"按钮状态异常: {btn_text}"
            return result

        # 4. 点击沟通按钮
        await chat_btn.first.click()
        await self.random_delay(3000, 5000)

        # 5. 等待聊天对话框
        dialog_selectors = [
            ".dialog-container",
            ".chat-dialog",
            "div[contenteditable='true']",
        ]

        input_found = False
        input_element = None

        for selector in dialog_selectors:
            try:
                element = self.page.locator(selector)
                if await element.count() > 0:
                    input_found = True
                    if "contenteditable" in selector:
                        input_element = element.first
                    break
            except:
                continue

        if not input_found:
            # 检查是否跳转到聊天页面
            current_url = self.page.url
            if "/chat/" in current_url or "/im/" in current_url:
                input_found = True
                input_element = self.page.locator("div[contenteditable='true']").first

        if not input_found:
            result["message"] = "未找到聊天输入框"
            return result

        # 6. 输入打招呼语
        if input_element and task.greeting_message:
            await input_element.click()
            await self.random_delay(500, 1000)

            # 模拟人类打字
            await self.human_type(
                "div[contenteditable='true']",
                task.greeting_message
            )
            await self.random_delay(1000, 2000)

        # 7. 点击发送按钮
        send_btn = self.page.locator("div.send-message, button.btn-send")
        if await send_btn.count() > 0:
            await send_btn.first.click()
            await self.random_delay(2000, 4000)

            # 8. 验证发送成功
            # 检查是否有发送成功的消息
            success_indicators = [
                ".message-item.self",  # 自己发送的消息
                ".msg-item.mine",
                "[class*='message'][class*='self']",
            ]

            for indicator in success_indicators:
                try:
                    if await self.page.locator(indicator).count() > 0:
                        result["success"] = True
                        result["message"] = "投递成功"
                        result["delivered_count"] = 1
                        logger.info(f"投递成功: {task.company_name} - {task.job_name}")
                        return result
                except:
                    continue

            # 如果没有明确的成功标识，但也没有错误，认为成功
            result["success"] = True
            result["message"] = "投递完成（未验证）"
            result["delivered_count"] = 1
        else:
            result["message"] = "未找到发送按钮"

        return result


# ================== 账号登录服务 ==================

class AuthService:
    """账号认证服务"""

    def __init__(self, config: AgentConfig):
        self.config = config
        self.access_token: Optional[str] = None
        self.user_info: Optional[Dict[str, Any]] = None

    async def login(self, email: str, password: str) -> bool:
        """使用账号密码登录，获取JWT Token"""
        logger.info(f"正在登录: {email}")

        try:
            async with aiohttp.ClientSession() as session:
                login_url = f"{self.config.api_url}/api/auth/login"
                payload = {
                    "email": email,
                    "password": password
                }

                async with session.post(login_url, json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get("success"):
                            # 兼容两种响应格式:
                            # 格式1: {"success":true,"token":"xxx","user":{...}}
                            # 格式2: {"success":true,"data":{"accessToken":"xxx","user":{...}}}
                            if data.get("token"):
                                self.access_token = data.get("token")
                                self.user_info = data.get("user", {})
                            elif data.get("data"):
                                self.access_token = data["data"].get("accessToken") or data["data"].get("token")
                                self.user_info = data["data"].get("user", {})
                            else:
                                logger.error("❌ 登录失败: 响应格式不正确")
                                return False

                            self.config.access_token = self.access_token
                            logger.info(f"✅ 登录成功: {self.user_info.get('username', email)}")
                            return True
                        else:
                            error_msg = data.get("message", "登录失败")
                            logger.error(f"❌ 登录失败: {error_msg}")
                            return False
                    elif response.status == 401:
                        logger.error("❌ 登录失败: 账号或密码错误")
                        return False
                    else:
                        text = await response.text()
                        logger.error(f"❌ 登录失败: HTTP {response.status} - {text}")
                        return False

        except aiohttp.ClientError as e:
            logger.error(f"❌ 网络错误: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ 登录异常: {e}")
            return False

    def get_token(self) -> Optional[str]:
        """获取JWT Token"""
        return self.access_token


# ================== WebSocket 客户端 ==================

class AgentWebSocketClient:
    """Agent WebSocket客户端"""

    def __init__(self, config: AgentConfig, controller: PlaywrightController):
        self.config = config
        self.controller = controller
        self.websocket = None
        self.status = AgentStatus.OFFLINE
        self._running = False
        self._heartbeat_task = None
        self._receive_task = None

    async def connect(self):
        """连接服务器"""
        self.status = AgentStatus.CONNECTING
        logger.info(f"正在连接服务器: {self.config.server_url}")

        try:
            # 使用JWT Token认证
            url = f"{self.config.server_url}?token={self.config.access_token}"

            # 根据协议决定是否使用SSL
            use_ssl = url.startswith("wss://")

            connect_kwargs = {
                "ping_interval": 20,
                "ping_timeout": 10,
                "close_timeout": 5,
                "additional_headers": {
                    "Origin": "https://zhitoujianli.com",
                    "User-Agent": "BossLocalAgent/2.0",
                    "Authorization": f"Bearer {self.config.access_token}",
                },
            }

            # 只有wss才添加ssl参数
            if use_ssl:
                import ssl
                ssl_context = ssl.create_default_context()
                connect_kwargs["ssl"] = ssl_context

            self.websocket = await websockets.connect(url, **connect_kwargs)

            # 发送认证消息（使用JWT Token）
            auth_msg = Message(
                type="auth",
                payload={
                    "token": self.config.access_token,
                    "auth_type": "jwt",  # 标识使用JWT认证
                    "client_type": "local_agent",
                    "version": "2.0.0",
                    "platform": sys.platform,
                }
            )
            await self.websocket.send(auth_msg.to_json())

            # 等待认证响应（先处理welcome消息）
            while True:
                response = await asyncio.wait_for(
                    self.websocket.recv(),
                    timeout=10
                )
                resp_msg = Message.from_json(response)

                if resp_msg.type == "welcome":
                    # 收到欢迎消息，等待认证结果
                    logger.debug("收到服务器欢迎消息，等待认证结果...")
                    continue
                elif resp_msg.type == "auth_success":
                    self.status = AgentStatus.ONLINE
                    logger.info("认证成功，已连接到服务器")
                    return True
                elif resp_msg.type == "auth_failed":
                    logger.error(f"认证失败: {resp_msg.payload}")
                    return False
                else:
                    logger.warning(f"收到未知消息类型: {resp_msg.type}")
                    # 继续等待认证结果
                    continue

        except Exception as e:
            # 详细的错误处理
            error_type = type(e).__name__
            error_msg = str(e)
            
            # 检查是否是WebSocket相关异常
            if "InvalidStatusCode" in error_type or "status_code" in error_msg.lower():
                # 尝试提取状态码
                status_code = None
                if hasattr(e, 'status_code'):
                    status_code = e.status_code
                elif "200" in error_msg:
                    status_code = 200
                elif "401" in error_msg:
                    status_code = 401
                elif "403" in error_msg:
                    status_code = 403
                
                if status_code == 200:
                    logger.error("❌ 连接失败: 服务器返回HTTP 200，但WebSocket握手失败")
                    logger.error("可能原因:")
                    logger.error("  1) Token无效或过期 - 请在网站重新生成Token")
                    logger.error("  2) 服务器未正确配置WebSocket端点")
                    logger.error("  3) 拦截器拒绝了连接但返回了错误的状态码")
                elif status_code == 401:
                    logger.error("❌ 认证失败: Token无效或未提供")
                    logger.error("请检查:")
                    logger.error("  1) Token是否正确复制（完整字符串）")
                    logger.error("  2) Token是否已过期（24小时有效期）")
                    logger.error("  3) 是否在网站重新生成了Token（旧Token会失效）")
                elif status_code == 403:
                    logger.error("❌ 访问被拒绝: 可能Token已过期或权限不足")
                elif status_code:
                    logger.error(f"❌ 服务器返回HTTP {status_code}，请检查服务器配置")
                else:
                    logger.error(f"❌ WebSocket握手失败: {error_msg}")
            elif "InvalidURI" in error_type or "invalid" in error_msg.lower() and "uri" in error_msg.lower():
                logger.error(f"❌ 连接失败: 无效的WebSocket URL: {self.config.server_url}")
                logger.error(f"错误详情: {error_msg}")
            elif "ConnectionClosed" in error_type:
                close_code = getattr(e, 'code', 'N/A')
                close_reason = getattr(e, 'reason', 'N/A')
                logger.error(f"❌ 连接失败: 连接被关闭 (code={close_code}, reason={close_reason})")
            else:
                logger.error(f"❌ 连接失败: {error_type}: {error_msg}")
                logger.error(f"连接URL: {self.config.server_url}?token={self.config.token[:8] if len(self.config.token) > 8 else '***'}...")
            
            # 调试模式下显示详细堆栈
            if self.config.log_level == "DEBUG":
                import traceback
                logger.debug(f"详细错误堆栈:\n{traceback.format_exc()}")
            
            self.status = AgentStatus.ERROR
            return False

    async def disconnect(self):
        """断开连接"""
        self._running = False

        if self._heartbeat_task:
            self._heartbeat_task.cancel()
        if self._receive_task:
            self._receive_task.cancel()

        if self.websocket:
            await self.websocket.close()

        self.status = AgentStatus.OFFLINE
        logger.info("已断开连接")

    async def send_message(self, msg: Message):
        """发送消息"""
        # websockets 12.x+ 使用 state 属性，旧版本使用 open 属性
        is_open = False
        if self.websocket:
            try:
                # websockets 12.x+
                from websockets.protocol import State
                is_open = self.websocket.state == State.OPEN
            except (ImportError, AttributeError):
                # 旧版本 fallback
                is_open = getattr(self.websocket, 'open', False)

        if is_open:
            await self.websocket.send(msg.to_json())

    async def send_status(self, status: AgentStatus):
        """发送状态更新"""
        self.status = status
        msg = Message(
            type="status",
            payload={"status": status.value}
        )
        await self.send_message(msg)

    async def send_result(self, task_id: str, result: Dict[str, Any]):
        """发送任务结果"""
        msg = Message(
            type="task_result",
            payload={
                "task_id": task_id,
                "result": result,
            }
        )
        await self.send_message(msg)

    async def send_log(self, level: str, message: str):
        """发送日志"""
        msg = Message(
            type="log",
            payload={
                "level": level,
                "message": message,
                "timestamp": datetime.now().isoformat(),
            }
        )
        await self.send_message(msg)

    async def _heartbeat_loop(self):
        """心跳循环"""
        while self._running:
            try:
                msg = Message(type="heartbeat", payload={})
                await self.send_message(msg)
                await asyncio.sleep(self.config.heartbeat_interval)
            except Exception as e:
                logger.error(f"心跳发送失败: {e}")
                break

    async def _receive_loop(self):
        """接收消息循环"""
        while self._running:
            try:
                data = await self.websocket.recv()
                msg = Message.from_json(data)
                await self._handle_message(msg)
            except websockets.ConnectionClosed:
                logger.warning("连接已关闭")
                break
            except Exception as e:
                logger.error(f"接收消息失败: {e}")

    async def _handle_message(self, msg: Message):
        """处理服务器消息"""
        logger.debug(f"收到消息: {msg.type}")

        if msg.type == "ping":
            # 响应心跳
            pong = Message(type="pong", payload={})
            await self.send_message(pong)

        elif msg.type == "task":
            # 处理投递任务
            await self._handle_task(msg.payload)

        elif msg.type == "task_cancel":
            # 取消任务
            logger.info(f"任务已取消: {msg.payload.get('task_id')}")

        elif msg.type == "config_update":
            # 配置更新
            logger.info("收到配置更新")

    async def _handle_task(self, payload: Dict[str, Any]):
        """处理投递任务"""
        # 支持三种任务类型: delivery（单个职位）、search（搜索页面）、batch_search（批量搜索）
        task_type_in_payload = payload.get("task_type", "delivery")
        config = payload.get("config", {})

        # 检查是否是批量搜索任务
        if config.get("taskType") == "batch_search":
            await self._handle_batch_search_task(payload)
            return

        # 创建任务对象
        task = DeliveryTask(
            task_id=payload["task_id"],
            job_url=payload["job_url"],
            job_name=payload["job_name"],
            company_name=payload["company_name"],
            greeting_message=payload.get("greeting_message", ""),
            config=config,
            task_type=task_type_in_payload,  # 传递任务类型
        )

        logger.info(f"收到任务: type={task_type_in_payload}, keyword={task.job_name}")

        # 更新状态为忙碌
        await self.send_status(AgentStatus.BUSY)

        try:
            # 执行投递
            result = await asyncio.wait_for(
                self.controller.execute_delivery(task),
                timeout=self.config.task_timeout
            )
            await self.send_result(task.task_id, result)
        except asyncio.TimeoutError:
            await self.send_result(task.task_id, {
                "task_id": task.task_id,
                "success": False,
                "message": "任务超时",
            })
        except Exception as e:
            await self.send_result(task.task_id, {
                "task_id": task.task_id,
                "success": False,
                "message": str(e),
            })
        finally:
            # 恢复在线状态
            await self.send_status(AgentStatus.ONLINE)

    async def _handle_batch_search_task(self, payload: Dict[str, Any]):
        """
        处理批量搜索任务
        按照人类化的节奏依次处理每个关键词的投递
        """
        task_id = payload["task_id"]
        config = payload.get("config", {})

        # 获取批量任务配置
        search_tasks = config.get("searchTasks", [])
        delivery_interval = config.get("deliveryInterval", 30)  # 每次投递间隔（秒）
        max_delivery_per_keyword = config.get("maxDeliveryPerKeyword", 5)  # 每个关键词最多投递数
        keyword_interval = config.get("keywordInterval", 60)  # 关键词切换间隔（秒）
        default_greeting = config.get("defaultGreeting", "您好，我对贵公司的职位很感兴趣！")

        logger.info("=" * 50)
        logger.info(f"📋 收到批量搜索任务")
        logger.info(f"   关键词数量: {len(search_tasks)}")
        logger.info(f"   每个关键词最多投递: {max_delivery_per_keyword} 个")
        logger.info(f"   投递间隔: {delivery_interval} 秒")
        logger.info(f"   关键词切换间隔: {keyword_interval} 秒")
        logger.info(f"   打招呼语: {default_greeting[:50]}..." if len(default_greeting) > 50 else f"   打招呼语: {default_greeting}")
        logger.info("=" * 50)

        if not search_tasks:
            logger.warning("⚠️ 没有搜索任务")
            await self.send_result(task_id, {
                "task_id": task_id,
                "success": False,
                "message": "没有搜索任务",
                "delivered_count": 0,
            })
            return

        # 更新状态为忙碌
        await self.send_status(AgentStatus.BUSY)

        total_delivered = 0
        keyword_results = []

        try:
            for idx, search_task in enumerate(search_tasks):
                keyword = search_task.get("keyword", search_task.get("jobName", "未知关键词"))
                url = search_task.get("url", "")
                city = search_task.get("city", "")

                logger.info(f"\n🔍 [{idx + 1}/{len(search_tasks)}] 开始搜索关键词: {keyword}")

                # 创建单个搜索任务
                task = DeliveryTask(
                    task_id=f"{task_id}_{idx}",
                    job_url=url,
                    job_name=keyword,
                    company_name="Boss直聘",
                    greeting_message=default_greeting,
                    config={
                        "maxDelivery": max_delivery_per_keyword,
                        "deliveryInterval": delivery_interval,
                    },
                    task_type="search",
                )

                # 执行搜索投递（带人类化间隔）
                result = await self.controller.execute_batch_search_delivery(
                    task,
                    max_delivery=max_delivery_per_keyword,
                    delivery_interval=delivery_interval
                )

                delivered = result.get("delivered_count", 0)
                total_delivered += delivered
                keyword_results.append({
                    "keyword": keyword,
                    "delivered": delivered,
                    "message": result.get("message", ""),
                })

                logger.info(f"✅ 关键词 [{keyword}] 完成，投递 {delivered} 个")

                # 发送中间进度
                await self.send_log("INFO", f"关键词 [{keyword}] 完成，已投递 {delivered} 个职位")

                # 如果不是最后一个关键词，等待切换间隔
                if idx < len(search_tasks) - 1:
                    logger.info(f"⏰ 等待 {keyword_interval} 秒后处理下一个关键词...")
                    await asyncio.sleep(keyword_interval)

            # 发送最终结果
            await self.send_result(task_id, {
                "task_id": task_id,
                "success": total_delivered > 0,
                "message": f"批量投递完成，共投递 {total_delivered} 个职位",
                "delivered_count": total_delivered,
                "keyword_results": keyword_results,
            })

            logger.info("=" * 50)
            logger.info(f"🎉 批量投递完成！总计: {total_delivered} 个职位")
            logger.info("=" * 50)

        except Exception as e:
            logger.error(f"批量投递失败: {e}")
            await self.send_result(task_id, {
                "task_id": task_id,
                "success": total_delivered > 0,
                "message": f"批量投递中断: {str(e)}，已投递 {total_delivered} 个",
                "delivered_count": total_delivered,
                "keyword_results": keyword_results,
            })
        finally:
            # 恢复在线状态
            await self.send_status(AgentStatus.ONLINE)

    async def run(self):
        """运行Agent"""
        self._running = True

        while self._running:
            try:
                # 初始化浏览器
                await self.controller.initialize()

                # 连接服务器
                if not await self.connect():
                    logger.error("连接失败，等待重连...")
                    await asyncio.sleep(self.config.reconnect_interval)
                    continue

                # 启动心跳和接收任务
                self._heartbeat_task = asyncio.create_task(self._heartbeat_loop())
                self._receive_task = asyncio.create_task(self._receive_loop())

                # 等待任务完成
                await asyncio.gather(
                    self._heartbeat_task,
                    self._receive_task,
                    return_exceptions=True
                )

            except Exception as e:
                logger.error(f"Agent运行异常: {e}")

            finally:
                self.status = AgentStatus.OFFLINE

            # 重连
            if self._running:
                logger.info(f"等待 {self.config.reconnect_interval} 秒后重连...")
                await asyncio.sleep(self.config.reconnect_interval)

    async def stop(self):
        """停止Agent"""
        logger.info("正在停止Agent...")
        self._running = False
        await self.disconnect()
        await self.controller.close()


# ================== 主程序 ==================

class BossLocalAgent:
    """Boss本地Agent主类"""

    def __init__(self, config: AgentConfig):
        self.config = config
        self.auth_service = AuthService(config)
        self.controller = PlaywrightController(config)
        self.client = AgentWebSocketClient(config, self.controller)

    async def login(self, email: str, password: str) -> bool:
        """登录智投简历账号"""
        return await self.auth_service.login(email, password)

    async def run(self):
        """运行Agent"""
        logger.info("=" * 50)
        logger.info("Boss直聘本地Agent 启动")
        logger.info("=" * 50)
        logger.info(f"服务器: {self.config.server_url}")
        logger.info(f"模式: {'无头' if self.config.headless else '有头（可见浏览器）'}")
        logger.info("=" * 50)

        await self.client.run()

    async def stop(self):
        """停止Agent"""
        await self.client.stop()


def load_saved_credentials() -> tuple[Optional[str], Optional[str]]:
    """加载保存的登录凭证"""
    config_file = get_script_dir() / "agent_config.json"
    if config_file.exists():
        try:
            with open(config_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("email"), data.get("password")
        except:
            pass
    return None, None


def save_credentials(email: str, password: str):
    """保存登录凭证（可选）"""
    config_file = get_script_dir() / "agent_config.json"
    try:
        with open(config_file, "w", encoding="utf-8") as f:
            json.dump({"email": email, "password": password}, f)
        logger.info(f"✅ 登录信息已保存到 {config_file}")
    except Exception as e:
        logger.warning(f"保存登录信息失败: {e}")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="Boss直聘本地Agent")
    parser.add_argument(
        "--email", "-e",
        help="登录邮箱"
    )
    parser.add_argument(
        "--password", "-p",
        help="登录密码"
    )
    parser.add_argument(
        "--server", "-s",
        default="wss://www.zhitoujianli.com/ws/local-agent",
        help="WebSocket服务器地址"
    )
    parser.add_argument(
        "--api", "-a",
        default="https://www.zhitoujianli.com",
        help="API服务器地址"
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        help="使用无头模式（不显示浏览器窗口）"
    )
    parser.add_argument(
        "--user-data-dir",
        default="",
        help="Chrome用户数据目录"
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="日志级别"
    )
    parser.add_argument(
        "--save",
        action="store_true",
        help="保存登录信息（下次自动登录）"
    )

    args = parser.parse_args()

    # 重新配置日志
    global logger
    logger = setup_logging(args.log_level)

    # 获取登录信息
    email = args.email
    password = args.password

    # 尝试加载保存的凭证
    if not email or not password:
        saved_email, saved_password = load_saved_credentials()
        if saved_email and saved_password:
            logger.info(f"检测到已保存的账号: {saved_email}")
            use_saved = input("是否使用已保存的账号登录？(Y/n): ").strip().lower()
            if use_saved != 'n':
                email = saved_email
                password = saved_password

    # 如果还没有登录信息，交互式输入
    if not email:
        print("\n" + "=" * 50)
        print("欢迎使用 Boss直聘本地Agent")
        print("请输入您的智投简历账号")
        print("=" * 50 + "\n")
        email = input("邮箱: ").strip()

    if not password:
        password = getpass.getpass("密码: ")

    if not email or not password:
        logger.error("❌ 请提供邮箱和密码")
        sys.exit(1)

    # 创建配置
    config = AgentConfig(
        server_url=args.server,
        api_url=args.api,
        email=email,
        password=password,
        headless=args.headless,
        user_data_dir=args.user_data_dir,
        log_level=args.log_level,
    )

    # 创建Agent
    agent = BossLocalAgent(config)

    # 异步登录和运行
    async def run_agent():
        nonlocal email, password

        # 登录重试循环
        max_retries = 3
        for attempt in range(max_retries):
            if await agent.login(email, password):
                break

            # 登录失败
            if attempt < max_retries - 1:
                print(f"\n❌ 登录失败，还可以重试 {max_retries - attempt - 1} 次")
                print("请重新输入账号密码：\n")
                email = input("邮箱: ").strip()
                password = getpass.getpass("密码: ")
                if not email or not password:
                    logger.error("❌ 账号密码不能为空")
                    continue
            else:
                logger.error("❌ 登录失败次数过多，请稍后重试")
                return

        # 保存登录信息
        if args.save or input("\n是否保存登录信息？下次自动登录 (y/N): ").strip().lower() == 'y':
            save_credentials(email, password)

        # 运行Agent
        await agent.run()

    # 信号处理
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    def signal_handler(sig, frame):
        logger.info("收到退出信号，正在停止...")
        loop.create_task(agent.stop())

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # 运行
    try:
        loop.run_until_complete(run_agent())
    except KeyboardInterrupt:
        logger.info("用户中断")
    finally:
        loop.run_until_complete(agent.stop())
        loop.close()


if __name__ == "__main__":
    main()
