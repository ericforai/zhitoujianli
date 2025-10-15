/**
 * Playwright E2E 测试配置
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',

  // 测试超时时间
  timeout: 30000,

  // 全局超时
  globalTimeout: 60 * 60 * 1000, // 1小时

  // 期望超时
  expect: {
    timeout: 5000,
  },

  // 失败重试
  retries: process.env.CI ? 2 : 0,

  // 并行worker数量
  workers: process.env.CI ? 1 : undefined,

  // 测试报告
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list'],
  ],

  use: {
    // 基础URL
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',

    // 截图设置
    screenshot: 'only-on-failure',

    // 视频录制
    video: 'retain-on-failure',

    // 追踪
    trace: 'on-first-retry',

    // 浏览器上下文选项
    viewport: { width: 1280, height: 720 },

    // 忽略HTTPS错误
    ignoreHTTPSErrors: true,

    // 等待元素超时
    actionTimeout: 10000,

    // 导航超时
    navigationTimeout: 30000,
  },

  // 不同浏览器配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // 移动端测试
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 启动开发服务器（如果需要）
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm start',
        port: 3000,
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
      },
});
