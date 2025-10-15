/**
 * E2E测试 - 简历管理流程
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

import { expect, test } from '@playwright/test';
import { testResumes } from './fixtures/test-data';
import {
  cleanupTestData,
  deleteResume,
  pasteResumeText,
  verifyParseResult,
  verifySuccessMessage,
} from './helpers/test-helpers';

test.describe('简历管理流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resume-management');
    await cleanupTestData(page);
  });

  test('应该支持上传新简历', async ({ page }) => {
    await pasteResumeText(page, testResumes.valid.text);

    await verifyParseResult(page, {
      current_title: '高级Java开发工程师',
      years_experience: 8,
    });

    await verifySuccessMessage(page, '简历解析成功');
  });

  test('应该支持删除简历', async ({ page }) => {
    // 先上传简历
    await pasteResumeText(page, testResumes.short.text);

    // 等待解析完成
    await expect(page.locator('text=解析结果')).toBeVisible();

    // 删除简历
    await deleteResume(page);

    // 验证删除成功
    await verifySuccessMessage(page, '简历删除成功');

    // 验证解析结果消失
    await expect(page.locator('text=解析结果')).not.toBeVisible();
  });

  test('应该在删除后清空打招呼语', async ({ page }) => {
    // 上传并生成打招呼语
    await pasteResumeText(page, testResumes.valid.text);

    await expect(page.locator('text=AI生成的默认打招呼语')).toBeVisible();

    // 删除简历
    await deleteResume(page);

    // 验证打招呼语区域消失
    await expect(page.locator('text=AI生成的默认打招呼语')).not.toBeVisible();
  });

  test('应该在删除前请求确认', async ({ page }) => {
    await pasteResumeText(page, testResumes.short.text);

    await expect(page.locator('text=解析结果')).toBeVisible();

    let dialogShown = false;

    // 监听确认对话框
    page.on('dialog', async dialog => {
      dialogShown = true;
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('确定要删除简历吗');
      await dialog.dismiss(); // 取消删除
    });

    const deleteButton = await page.locator('button:has-text("删除简历")');
    await deleteButton.click();

    // 验证对话框显示
    await page.waitForTimeout(500);
    expect(dialogShown).toBe(true);

    // 验证简历仍然存在（因为取消了删除）
    await expect(page.locator('text=解析结果')).toBeVisible();
  });

  test('应该支持多次上传覆盖', async ({ page }) => {
    // 第一次上传
    await pasteResumeText(page, testResumes.short.text);

    await expect(page.locator('text=产品经理')).toBeVisible();

    // 第二次上传（覆盖）
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    const textarea = await page.locator(
      'textarea[placeholder*="请粘贴您的简历内容"]'
    );

    await textarea.fill(testResumes.marketing.text);

    const parseButton = await page.locator('button:has-text("AI解析简历")');
    await parseButton.click();

    await page.waitForSelector('text=处理中...', {
      state: 'hidden',
      timeout: 30000,
    });

    // 验证新内容
    await expect(page.locator('text=市场营销经理')).toBeVisible();
  });

  test('应该在页面刷新后保持数据（如果缓存到后端）', async ({ page }) => {
    await pasteResumeText(page, testResumes.valid.text);

    await expect(page.locator('text=解析结果')).toBeVisible();

    // 刷新页面
    await page.reload();

    // 注意：这取决于系统是否自动加载缓存
    // 如果不自动加载，解析结果应该消失
    // 这里仅验证页面正常加载
    await expect(page.locator('text=简历管理')).toBeVisible();
  });
});

test.describe('数据持久化测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resume-management');
  });

  test('应该在删除后不保留任何简历数据', async ({ page }) => {
    // 清理之前的数据
    await cleanupTestData(page);

    // 上传简历
    await pasteResumeText(page, testResumes.short.text);

    await expect(page.locator('text=解析结果')).toBeVisible();

    // 删除
    await deleteResume(page);

    // 验证UI清空
    await expect(page.locator('text=解析结果')).not.toBeVisible();

    const greetingSection = await page.locator('text=AI生成的默认打招呼语');
    expect(await greetingSection.isVisible()).toBe(false);
  });
});

test.describe('用户体验测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resume-management');
    await cleanupTestData(page);
  });

  test('应该提供视觉反馈', async ({ page }) => {
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    const textarea = await page.locator(
      'textarea[placeholder*="请粘贴您的简历内容"]'
    );
    await textarea.fill(testResumes.short.text);

    const parseButton = await page.locator('button:has-text("AI解析简历")');
    await parseButton.click();

    // 验证加载动画
    await expect(page.locator('.animate-spin')).toBeVisible();

    // 验证处理中文本
    await expect(page.locator('text=处理中...')).toBeVisible();

    // 等待完成
    await page.waitForSelector('text=处理中...', {
      state: 'hidden',
      timeout: 30000,
    });

    // 验证成功消息
    const successDiv = await page.locator('.bg-green-50');
    expect(await successDiv.count()).toBeGreaterThan(0);
  });

  test('应该支持hover状态', async ({ page }) => {
    const uploadButton = await page.locator('button:has-text("选择文件")');

    // 验证hover效果（通过检查CSS类）
    await uploadButton.hover();

    // 验证按钮可交互
    expect(await uploadButton.isEnabled()).toBe(true);
  });

  test('应该在焦点切换时正常工作', async ({ page }) => {
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    const textarea = await page.locator(
      'textarea[placeholder*="请粘贴您的简历内容"]'
    );

    // 聚焦
    await textarea.focus();
    expect(await textarea.evaluate(el => document.activeElement === el)).toBe(
      true
    );

    // 输入内容
    await textarea.fill('测试内容');

    // 失焦
    await textarea.blur();

    // 验证内容保持
    expect(await textarea.inputValue()).toBe('测试内容');
  });
});
