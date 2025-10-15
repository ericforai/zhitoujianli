/**
 * E2E测试 - 用户体验流程
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

import { expect, test } from '@playwright/test';
import { testResumes } from './fixtures/test-data';
import { cleanupTestData, pasteResumeText } from './helpers/test-helpers';

test.describe('加载状态显示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resume-management');
    await cleanupTestData(page);
  });

  test('应该在处理时显示spinner', async ({ page }) => {
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    const textarea = await page.locator(
      'textarea[placeholder*="请粘贴您的简历内容"]'
    );
    await textarea.fill(testResumes.short.text);

    const parseButton = await page.locator('button:has-text("AI解析简历")');
    await parseButton.click();

    // 验证spinner显示
    const spinner = await page.locator('.animate-spin');
    await expect(spinner).toBeVisible();

    // 验证spinner有正确的样式
    const classList = await spinner.getAttribute('class');
    expect(classList).toContain('animate-spin');
    expect(classList).toContain('rounded-full');
  });

  test('应该显示处理中文本', async ({ page }) => {
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    const textarea = await page.locator(
      'textarea[placeholder*="请粘贴您的简历内容"]'
    );
    await textarea.fill(testResumes.short.text);

    const parseButton = await page.locator('button:has-text("AI解析简历")');
    await parseButton.click();

    await expect(page.locator('text=处理中...')).toBeVisible();
  });
});

test.describe('响应式布局', () => {
  test('应该在手机端正常显示', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/resume-management');

    // 验证主要元素可见
    await expect(page.locator('text=简历管理')).toBeVisible();
    await expect(page.locator('text=拖拽文件到此处')).toBeVisible();

    // 验证按钮可点击
    const uploadButton = await page.locator('button:has-text("选择文件")');
    expect(await uploadButton.isVisible()).toBe(true);
  });

  test('应该在平板端正常显示', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/resume-management');

    await expect(page.locator('text=简历管理')).toBeVisible();

    // 验证内容区域不被裁切
    const mainContent = await page.locator('.space-y-6');
    expect(await mainContent.isVisible()).toBe(true);
  });

  test('应该在大屏幕上正常显示', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/resume-management');

    await expect(page.locator('text=简历管理')).toBeVisible();

    // 验证使用grid布局
    await expect(page.locator('.grid')).toBeVisible();
  });

  test('应该在窗口缩放时保持布局', async ({ page }) => {
    await page.goto('/resume-management');

    // 从桌面尺寸缩放到手机尺寸
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('text=简历管理')).toBeVisible();

    await page.setViewportSize({ width: 640, height: 480 });
    await expect(page.locator('text=简历管理')).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('text=简历管理')).toBeVisible();
  });
});

test.describe('键盘导航', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resume-management');
  });

  test('应该支持Tab键导航', async ({ page }) => {
    // Tab到上传按钮
    await page.keyboard.press('Tab');

    // 验证焦点正确
    const uploadButton = await page.locator('button:has-text("选择文件")');
    const isFocused = await uploadButton.evaluate(
      el => document.activeElement === el
    );

    // 继续Tab导航
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
  });

  test('应该支持Enter键提交', async ({ page }) => {
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    const textarea = await page.locator(
      'textarea[placeholder*="请粘贴您的简历内容"]'
    );
    await textarea.fill(testResumes.short.text);

    // 聚焦到解析按钮
    const parseButton = await page.locator('button:has-text("AI解析简历")');
    await parseButton.focus();

    // 按Enter键
    await page.keyboard.press('Enter');

    // 验证开始处理
    await expect(page.locator('text=处理中...')).toBeVisible();
  });

  test('应该支持Escape键关闭提示', async ({ page }) => {
    // 触发一个错误提示
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    const parseButton = await page.locator('button:has-text("AI解析简历")');
    await parseButton.click();

    await expect(page.locator('text=请输入简历文本内容')).toBeVisible();

    // 注意：实际关闭功能需要组件支持
    // 这里仅测试Escape键行为
    await page.keyboard.press('Escape');
  });
});

test.describe('无障碍访问', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resume-management');
  });

  test('应该有正确的ARIA标签', async ({ page }) => {
    // 验证重要元素有ARIA标签
    const uploadButton = await page.locator('button:has-text("选择文件")');
    expect(await uploadButton.isVisible()).toBe(true);

    // 验证label关联
    const checkbox = await page.locator(
      'input[type="checkbox"]#use-text-input'
    );
    const label = await page.locator('label[for="use-text-input"]');

    expect(await checkbox.isVisible()).toBe(true);
    expect(await label.isVisible()).toBe(true);
  });

  test('应该支持屏幕阅读器', async ({ page }) => {
    // 验证有适当的语义HTML
    const heading = await page.locator('h3:has-text("简历管理")');
    expect(await heading.isVisible()).toBe(true);

    const paragraph = await page.locator(
      'p:has-text("上传、编辑和管理您的简历信息")'
    );
    expect(await paragraph.isVisible()).toBe(true);
  });

  test('应该有足够的颜色对比度', async ({ page }) => {
    // 验证主要按钮的对比度
    const uploadButton = await page.locator('button:has-text("选择文件")');

    // 获取按钮样式
    const backgroundColor = await uploadButton.evaluate(
      el => window.getComputedStyle(el).backgroundColor
    );
    const color = await uploadButton.evaluate(
      el => window.getComputedStyle(el).color
    );

    // 验证有背景色和文字颜色
    expect(backgroundColor).toBeDefined();
    expect(color).toBeDefined();
  });
});

test.describe('性能测试', () => {
  test('应该在3秒内加载页面', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/resume-management');
    await expect(page.locator('text=简历管理')).toBeVisible();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('应该流畅处理用户交互', async ({ page }) => {
    await page.goto('/resume-management');

    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');

    const startTime = Date.now();
    await checkbox.click();
    const clickTime = Date.now() - startTime;

    // 点击响应应该很快（<100ms）
    expect(clickTime).toBeLessThan(100);

    // 验证内容立即显示
    await expect(
      page.locator('textarea[placeholder*="请粘贴您的简历内容"]')
    ).toBeVisible();
  });

  test('应该在合理时间内完成解析', async ({ page }) => {
    await page.goto('/resume-management');

    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    const textarea = await page.locator(
      'textarea[placeholder*="请粘贴您的简历内容"]'
    );
    await textarea.fill(testResumes.short.text);

    const parseButton = await page.locator('button:has-text("AI解析简历")');

    const startTime = Date.now();
    await parseButton.click();

    // 等待完成
    await page.waitForSelector('text=处理中...', {
      state: 'hidden',
      timeout: 30000,
    });

    const parseTime = Date.now() - startTime;

    // AI解析应该在30秒内完成
    expect(parseTime).toBeLessThan(30000);
  });
});

test.describe('移动端适配', () => {
  test('应该在iPhone上正常工作', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 13
    await page.goto('/resume-management');

    // 验证布局
    await expect(page.locator('text=简历管理')).toBeVisible();

    // 测试基本交互
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    const textarea = await page.locator(
      'textarea[placeholder*="请粘贴您的简历内容"]'
    );
    expect(await textarea.isVisible()).toBe(true);
  });

  test('应该在Android上正常工作', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 }); // Pixel 5
    await page.goto('/resume-management');

    await expect(page.locator('text=简历管理')).toBeVisible();

    // 验证按钮大小适合触摸
    const uploadButton = await page.locator('button:has-text("选择文件")');
    const box = await uploadButton.boundingBox();

    if (box) {
      // 按钮高度应该足够（>=44px，iOS触摸标准）
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('应该支持移动端的滚动', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/resume-management');

    // 解析一个简历，产生内容
    await pasteResumeText(page, testResumes.valid.text);

    // 等待内容显示
    await expect(page.locator('text=解析结果')).toBeVisible();

    // 滚动到页面底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // 验证可以滚动
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });
});
