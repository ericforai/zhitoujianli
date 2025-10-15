/**
 * E2E性能测试
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

import { expect, test } from '@playwright/test';
import { testResumes } from './fixtures/test-data';
import { cleanupTestData, pasteResumeText } from './helpers/test-helpers';

test.describe('性能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resume-management');
    await cleanupTestData(page);
  });

  test('页面加载时间应小于3秒', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/resume-management');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    console.log(`页面加载时间: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('简历解析响应时间应合理', async ({ page }) => {
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    const textarea = await page.locator(
      'textarea[placeholder*="请粘贴您的简历内容"]'
    );
    await textarea.fill(testResumes.short.text);

    const parseButton = await page.locator('button:has-text("AI解析简历")');

    const startTime = Date.now();
    await parseButton.click();

    await page.waitForSelector('text=处理中...', {
      state: 'hidden',
      timeout: 30000,
    });

    const parseTime = Date.now() - startTime;

    console.log(`解析时间: ${parseTime}ms`);

    // AI解析可能需要较长时间，设置合理的期望值
    expect(parseTime).toBeLessThan(30000);
  });

  test('UI交互响应应该流畅', async ({ page }) => {
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');

    const startTime = Date.now();
    await checkbox.click();
    const clickTime = Date.now() - startTime;

    console.log(`点击响应时间: ${clickTime}ms`);

    // 点击响应应该很快
    expect(clickTime).toBeLessThan(200);

    // 验证内容立即显示
    await expect(
      page.locator('textarea[placeholder*="请粘贴您的简历内容"]')
    ).toBeVisible({ timeout: 1000 });
  });

  test('应该测量首次内容绘制时间(FCP)', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/resume-management');

    // 等待第一个有意义的内容显示
    await page.waitForSelector('text=简历管理');

    const fcpTime = Date.now() - startTime;

    console.log(`首次内容绘制时间: ${fcpTime}ms`);

    // FCP应该在2秒内
    expect(fcpTime).toBeLessThan(2000);
  });

  test('应该测量交互时间(TTI)', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/resume-management');

    // 等待页面完全可交互
    await page.waitForLoadState('networkidle');
    const uploadButton = await page.locator('button:has-text("选择文件")');
    await uploadButton.waitFor({ state: 'visible' });

    const ttiTime = Date.now() - startTime;

    console.log(`交互时间: ${ttiTime}ms`);

    // TTI应该在5秒内
    expect(ttiTime).toBeLessThan(5000);
  });

  test('应该在处理大文本时不卡顿', async ({ page }) => {
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    const textarea = await page.locator(
      'textarea[placeholder*="请粘贴您的简历内容"]'
    );

    // 输入大量文本
    const startTime = Date.now();
    await textarea.fill(testResumes.veryLong.text);
    const fillTime = Date.now() - startTime;

    console.log(`填充大文本时间: ${fillTime}ms`);

    // 填充应该很快
    expect(fillTime).toBeLessThan(2000);
  });

  test('应该测量内存使用', async ({ page }) => {
    await page.goto('/resume-management');

    // 执行多次操作
    for (let i = 0; i < 3; i++) {
      await pasteResumeText(page, testResumes.short.text);
      await page.waitForTimeout(1000);
    }

    // 获取性能指标
    const metrics = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
        };
      }
      return null;
    });

    if (metrics) {
      console.log(
        `内存使用: ${Math.round(metrics.usedJSHeapSize / 1024 / 1024)}MB`
      );

      // 内存使用应该合理（<100MB）
      expect(metrics.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
    }
  });
});

test.describe('并发性能测试', () => {
  test('应该处理快速连续的API调用', async ({ page }) => {
    await page.goto('/resume-management');

    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    const textarea = await page.locator(
      'textarea[placeholder*="请粘贴您的简历内容"]'
    );
    const parseButton = await page.locator('button:has-text("AI解析简历")');

    // 快速连续提交3次
    for (let i = 0; i < 3; i++) {
      await textarea.fill(`简历内容 ${i}`);
      await parseButton.click();

      // 短暂等待
      await page.waitForTimeout(500);
    }

    // 验证系统没有崩溃
    await page.waitForSelector('text=处理中...', {
      state: 'hidden',
      timeout: 60000,
    });
  });
});

test.describe('网络性能测试', () => {
  test('应该在慢速网络下正常工作', async ({ page }) => {
    // 模拟慢速3G网络
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (750 * 1024) / 8,
      uploadThroughput: (250 * 1024) / 8,
      latency: 100,
    });

    await page.goto('/resume-management');

    // 验证页面仍能加载
    await expect(page.locator('text=简历管理')).toBeVisible({ timeout: 10000 });

    // 测试功能
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    const textarea = await page.locator(
      'textarea[placeholder*="请粘贴您的简历内容"]'
    );
    await textarea.fill(testResumes.short.text);

    const parseButton = await page.locator('button:has-text("AI解析简历")');
    await parseButton.click();

    // 在慢速网络下也应该能完成
    await page.waitForSelector('text=处理中...', {
      state: 'hidden',
      timeout: 60000,
    });
  });
});
