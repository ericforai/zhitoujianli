/**
 * E2E测试 - 文本解析流程
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

import { expect, test } from '@playwright/test';
import { testResumes } from './fixtures/test-data';
import {
  cleanupTestData,
  pasteResumeText,
  verifyParseResult,
} from './helpers/test-helpers';

test.describe('文本解析流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resume-management');
    await cleanupTestData(page);
  });

  test('应该成功解析标准简历文本', async ({ page }) => {
    await pasteResumeText(page, testResumes.valid.text);

    await verifyParseResult(page, {
      current_title: '高级Java开发工程师',
      years_experience: 8,
      education: '本科',
    });

    // 验证技能标签显示
    await expect(page.locator('text=Java')).toBeVisible();
    await expect(page.locator('text=Spring Boot')).toBeVisible();
  });

  test('应该成功解析简短简历', async ({ page }) => {
    await pasteResumeText(page, testResumes.short.text);

    await verifyParseResult(page, {
      current_title: '产品经理',
      years_experience: 3,
    });
  });

  test('应该成功解析市场营销简历', async ({ page }) => {
    await pasteResumeText(page, testResumes.marketing.text);

    await verifyParseResult(page, {
      current_title: '市场营销经理',
      years_experience: 6,
      education: '硕士',
    });
  });

  test('应该处理包含特殊字符的简历', async ({ page }) => {
    await pasteResumeText(page, testResumes.withSpecialChars.text);

    // 应该能成功解析，不会崩溃
    await expect(page.locator('text=解析结果')).toBeVisible({ timeout: 30000 });
  });

  test('应该拒绝空文本', async ({ page }) => {
    // 启用文本输入
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    // 不填写任何内容，直接点击解析
    const parseButton = await page.locator('button:has-text("AI解析简历")');
    await parseButton.click();

    // 验证错误提示
    await expect(page.locator('text=请输入简历文本内容')).toBeVisible();
  });

  test('应该拒绝只包含空格的文本', async ({ page }) => {
    // 启用文本输入
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    // 填写纯空格
    const textarea = await page.locator(
      'textarea[placeholder*="请粘贴您的简历内容"]'
    );
    await textarea.fill('   \n\t   ');

    const parseButton = await page.locator('button:has-text("AI解析简历")');
    await parseButton.click();

    // 验证错误提示
    await expect(page.locator('text=请输入简历文本内容')).toBeVisible();
  });

  test('应该显示解析进度', async ({ page }) => {
    // 启用文本输入
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    const textarea = await page.locator(
      'textarea[placeholder*="请粘贴您的简历内容"]'
    );
    await textarea.fill(testResumes.valid.text);

    const parseButton = await page.locator('button:has-text("AI解析简历")');
    await parseButton.click();

    // 验证加载动画显示
    await expect(page.locator('.animate-spin')).toBeVisible();
    await expect(page.locator('text=处理中...')).toBeVisible();

    // 等待完成
    await page.waitForSelector('text=处理中...', {
      state: 'hidden',
      timeout: 30000,
    });

    // 验证解析成功
    await expect(page.locator('text=简历解析成功')).toBeVisible();
  });

  test('应该正确展示所有解析字段', async ({ page }) => {
    await pasteResumeText(page, testResumes.valid.text);

    // 验证所有必需字段都展示
    await expect(page.locator('text=当前职位')).toBeVisible();
    await expect(page.locator('text=工作年限')).toBeVisible();
    await expect(page.locator('text=学历')).toBeVisible();
    await expect(page.locator('text=公司')).toBeVisible();
    await expect(page.locator('text=核心优势')).toBeVisible();
    await expect(page.locator('text=技能')).toBeVisible();
  });

  test('应该支持解析后的编辑功能', async ({ page }) => {
    await pasteResumeText(page, testResumes.short.text);

    // 等待打招呼语生成
    await expect(page.locator('text=AI生成的默认打招呼语')).toBeVisible();

    // 编辑打招呼语
    const greetingTextarea = await page.locator(
      'textarea[placeholder*="AI正在生成"]'
    );

    const newGreeting = '这是修改后的打招呼语内容！';
    await greetingTextarea.fill(newGreeting);

    // 验证内容已更新
    const value = await greetingTextarea.inputValue();
    expect(value).toBe(newGreeting);
  });

  test('应该提供帮助提示', async ({ page }) => {
    // 启用文本输入
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    // 验证帮助提示显示
    await expect(page.locator('text=建议包含')).toBeVisible();
    await expect(page.locator('text=个人信息')).toBeVisible();
    await expect(page.locator('text=工作经历')).toBeVisible();
    await expect(page.locator('text=核心技能')).toBeVisible();
    await expect(page.locator('text=主要成就')).toBeVisible();
    await expect(page.locator('text=教育背景')).toBeVisible();
  });
});

test.describe('解析结果可视化', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resume-management');
    await cleanupTestData(page);
  });

  test('应该使用渐变背景展示解析结果', async ({ page }) => {
    await pasteResumeText(page, testResumes.valid.text);

    const resultCard = await page.locator('.bg-gradient-to-r').first();
    await expect(resultCard).toBeVisible();
  });

  test('应该以标签形式展示技能', async ({ page }) => {
    await pasteResumeText(page, testResumes.valid.text);

    // 验证技能标签样式
    const skillTags = await page.locator('.bg-white.bg-opacity-20');
    const count = await skillTags.count();
    expect(count).toBeGreaterThan(0);
  });

  test('应该显示信息图标和说明', async ({ page }) => {
    await pasteResumeText(page, testResumes.valid.text);

    // 验证说明区域
    await expect(page.locator('.bg-blue-50')).toBeVisible();
    await expect(page.locator('text=说明: 基于您的简历')).toBeVisible();
  });
});
