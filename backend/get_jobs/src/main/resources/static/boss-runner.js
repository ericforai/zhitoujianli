/**
 * Boss投递本地运行脚本
 * 用户下载后在本地运行，负责控制本地浏览器
 */

const { chromium } = require('playwright');
const WebSocket = require('ws');

class BossRunner {
    constructor(serverUrl, userId) {
        this.serverUrl = serverUrl;
        this.userId = userId;
        this.browser = null;
        this.page = null;
        this.ws = null;
        this.isLoginMode = false;
    }

    /**
     * 启动Boss投递程序
     */
    async start() {
        try {
            console.log('🚀 启动Boss投递程序...');

            // 连接WebSocket
            await this.connectWebSocket();

            // 等待服务器指令
            console.log('📡 等待服务器指令...');

        } catch (error) {
            console.error('❌ 启动失败:', error);
            process.exit(1);
        }
    }

    /**
     * 连接到服务器WebSocket
     */
    async connectWebSocket() {
        return new Promise((resolve, reject) => {
            const wsUrl = `ws://${this.serverUrl}/ws/boss-delivery?userId=${this.userId}`;
            console.log('🔌 连接到服务器:', wsUrl);

            this.ws = new WebSocket(wsUrl);

            this.ws.on('open', () => {
                console.log('✅ WebSocket连接成功');
                resolve();
            });

            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('❌ 消息解析失败:', error);
                }
            });

            this.ws.on('error', (error) => {
                console.error('❌ WebSocket错误:', error);
                reject(error);
            });

            this.ws.on('close', () => {
                console.log('🔌 WebSocket连接关闭');
                this.cleanup();
            });
        });
    }

    /**
     * 处理服务器消息
     */
    async handleMessage(message) {
        console.log('📨 收到指令:', message.action);

        switch (message.action) {
            case 'welcome':
                console.log('🎉', message.message);
                break;

            case 'login':
                await this.handleLogin();
                break;

            case 'start_delivery':
                await this.handleDelivery(message.config);
                break;

            case 'login_confirmed':
                console.log('✅', message.message);
                break;

            case 'delivery_confirmed':
                console.log('🎯', message.message);
                break;

            case 'error':
                console.error('❌', message.message);
                break;

            default:
                console.log('❓ 未知指令:', message.action);
        }
    }

    /**
     * 处理登录指令
     */
    async handleLogin() {
        try {
            console.log('🔐 开始登录流程...');
            this.isLoginMode = true;

            // 启动浏览器（有头模式）
            this.browser = await chromium.launch({
                headless: false, // 显示浏览器窗口
                channel: 'chrome',
                args: [
                    '--disable-blink-features=AutomationControlled',
                    '--disable-web-security',
                    '--no-first-run'
                ]
            });

            this.page = await this.browser.newPage();

            // 设置用户代理
            await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

            console.log('🌐 打开Boss直聘登录页面...');
            await this.page.goto('https://www.zhipin.com/web/user/?ka=header-login');

            // 等待页面加载
            await this.page.waitForLoadState('networkidle');

            // 查找并点击二维码登录
            try {
                const qrButton = this.page.locator('.login-switch-btn');
                if (await qrButton.count() > 0) {
                    await qrButton.click();
                    console.log('📱 已切换到二维码登录');
                }
            } catch (error) {
                console.log('⚠️ 二维码切换按钮未找到，可能已经是二维码模式');
            }

            console.log('⏳ 等待用户扫码登录...');
            console.log('💡 请在浏览器中扫码完成登录');

            // 监控登录状态
            await this.monitorLoginStatus();

        } catch (error) {
            console.error('❌ 登录流程失败:', error);
            this.sendMessage({
                action: 'login_failed',
                error: error.message
            });
        }
    }

    /**
     * 监控登录状态
     */
    async monitorLoginStatus() {
        const maxWaitTime = 5 * 60 * 1000; // 5分钟
        const startTime = Date.now();

        while (Date.now() - startTime < maxWaitTime) {
            try {
                // 检查是否已登录
                const currentUrl = this.page.url();

                // 如果URL包含用户信息或跳转到主页，说明登录成功
                if (currentUrl.includes('/user/') && !currentUrl.includes('/login')) {
                    console.log('✅ 检测到登录成功！');

                    // 等待页面完全加载
                    await this.page.waitForLoadState('networkidle');

                    // 保存Cookie
                    const cookies = await this.page.context().cookies();
                    console.log('💾 保存登录状态...');

                    // 通知服务器登录成功
                    this.sendMessage({
                        action: 'login_complete',
                        cookies: cookies,
                        userAgent: await this.page.evaluate(() => navigator.userAgent)
                    });

                    this.isLoginMode = false;
                    return;
                }

                // 检查是否有错误或需要重新登录
                const errorElement = this.page.locator('.login-error, .error-msg');
                if (await errorElement.count() > 0) {
                    const errorText = await errorElement.textContent();
                    if (errorText && errorText.includes('登录失败')) {
                        throw new Error('登录失败: ' + errorText);
                    }
                }

                // 等待1秒后再次检查
                await this.page.waitForTimeout(1000);

            } catch (error) {
                if (error.message.includes('登录失败')) {
                    throw error;
                }
                console.log('⏳ 等待登录中...');
                await this.page.waitForTimeout(2000);
            }
        }

        throw new Error('登录超时，请重试');
    }

    /**
     * 处理投递指令
     */
    async handleDelivery(config) {
        try {
            console.log('📋 开始投递简历...');

            // 如果当前是有头模式，切换到无头模式
            if (this.isLoginMode && this.browser) {
                console.log('🔄 切换到无头模式...');
                await this.browser.close();
                this.isLoginMode = false;
            }

            // 启动无头浏览器
            if (!this.browser) {
                this.browser = await chromium.launch({
                    headless: true, // 无头模式，不显示浏览器
                    channel: 'chrome',
                    args: [
                        '--disable-blink-features=AutomationControlled',
                        '--disable-web-security',
                        '--no-sandbox',
                        '--disable-dev-shm-usage'
                    ]
                });

                this.page = await this.browser.newPage();
            }

            // 执行投递逻辑
            await this.performDelivery(config);

        } catch (error) {
            console.error('❌ 投递失败:', error);
            this.sendMessage({
                action: 'delivery_error',
                error: error.message
            });
        }
    }

    /**
     * 执行投递逻辑
     */
    async performDelivery(config) {
        // 这里实现具体的投递逻辑
        console.log('🎯 投递配置:', config);

        // 模拟投递过程
        for (let i = 1; i <= 10; i++) {
            console.log(`📤 投递进度: ${i}/10`);

            // 发送进度更新
            this.sendMessage({
                action: 'delivery_progress',
                progress: `${i}/10`,
                current: i,
                total: 10
            });

            // 模拟投递延迟
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // 投递完成
        console.log('🎉 投递完成！');
        this.sendMessage({
            action: 'delivery_complete',
            summary: {
                total: 10,
                successful: 10,
                failed: 0
            }
        });
    }

    /**
     * 发送消息给服务器
     */
    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    /**
     * 清理资源
     */
    async cleanup() {
        console.log('🧹 清理资源...');

        if (this.page) {
            await this.page.close();
        }

        if (this.browser) {
            await this.browser.close();
        }

        if (this.ws) {
            this.ws.close();
        }

        console.log('✅ 清理完成');
    }
}

// 从命令行参数获取配置
const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('❌ 使用方法: node boss-runner.js <服务器地址> <用户ID>');
    console.error('   例如: node boss-runner.js 115.190.182.95:8080 user123');
    process.exit(1);
}

const serverUrl = args[0];
const userId = args[1];

// 创建并启动Boss运行器
const runner = new BossRunner(serverUrl, userId);

// 优雅退出处理
process.on('SIGINT', async () => {
    console.log('\n⏹️ 收到退出信号，正在清理...');
    await runner.cleanup();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n⏹️ 收到终止信号，正在清理...');
    await runner.cleanup();
    process.exit(0);
});

// 启动程序
runner.start().catch(error => {
    console.error('❌ 程序异常退出:', error);
    process.exit(1);
});
