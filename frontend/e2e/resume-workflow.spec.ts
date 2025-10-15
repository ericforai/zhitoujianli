/**
 * E2E测试 - 完整简历处理流程
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

import { expect, test } from '@playwright/test';
import { testResumes } from './fixtures/test-data';
import {
  cleanupTestData,
  editGreeting,
  pasteResumeText,
  saveGreeting,
  verifyGreetingGenerated,
  verifyParseResult,
  verifySuccessMessage,
  waitForLoading,
} from './helpers/test-helpers';

test.describe('完整简历处理流程', () => {
  test.beforeEach(async ({ page }) => {
    // 访问简历管理页面
    await page.goto('/resume-management');

    // 清理之前的测试数据
    await cleanupTestData(page);
  });

  test('应该完成完整的简历上传到保存流程', async ({ page }) => {
    // 步骤1：粘贴简历文本
    await pasteResumeText(page, testResumes.valid.text);

    // 步骤2：验证解析结果
    await verifyParseResult(page, {
      current_title: '高级Java开发工程师',
      years_experience: 8,
      education: '本科',
    });

    // 步骤3：验证默认打招呼语生成
    await verifyGreetingGenerated(page);

    // 步骤4：编辑打招呼语
    const customGreeting =
      '您好！我是一名经验丰富的Java开发工程师，期待与您交流！';
    await editGreeting(page, customGreeting);

    // 步骤5：保存打招呼语
    await saveGreeting(page);

    // 步骤6：验证保存成功
    await verifySuccessMessage(page, '默认打招呼语保存成功');
  });

  test('应该支持文件上传流程', async ({ page }) => {
    // 注意：这个测试需要实际的PDF文件
    // 在实际运行时需要准备测试文件

    // 创建测试文件
    const testFileContent = testResumes.valid.text;

    // 点击文件选择按钮
    const uploadButton = await page.locator('button:has-text("选择文件")');
    await expect(uploadButton).toBeVisible();

    // 注意：文件上传需要在实际环境中测试
    // 这里仅验证按钮可见性
    expect(await uploadButton.isEnabled()).toBe(true);
  });

  test('应该支持重新生成打招呼语', async ({ page }) => {
    // 先解析简历
    await pasteResumeText(page, testResumes.short.text);

    // 获取第一次生成的打招呼语
    const greetingTextarea = await page.locator(
      'textarea[placeholder*="AI正在生成"]'
    );
    const firstGreeting = await greetingTextarea.inputValue();

    // 点击重新生成
    const regenerateButton = await page.locator('button:has-text("重新生成")');
    await regenerateButton.click();

    // 等待生成完成
    await waitForLoading(page);

    // 验证打招呼语已更新（可能相同也可能不同）
    const secondGreeting = await greetingTextarea.inputValue();
    expect(secondGreeting.length).toBeGreaterThan(0);
  });

  test('应该在解析成功后显示解析结果', async ({ page }) => {
    await pasteResumeText(page, testResumes.valid.text);

    // 验证解析结果卡片显示
    await expect(page.locator('text=解析结果')).toBeVisible();

    // 验证候选人信息显示
    await expect(page.locator('text=候选人信息')).toBeVisible();

    // 验证核心优势显示
    await expect(page.locator('text=核心优势')).toBeVisible();

    // 验证技能显示
    await expect(page.locator('text=技能')).toBeVisible();
  });

  test('应该在解析后自动生成默认打招呼语', async ({ page }) => {
    await pasteResumeText(page, testResumes.marketing.text);

    // 验证打招呼语区域显示
    await expect(page.locator('text=AI生成的默认打招呼语')).toBeVisible();

    // 验证打招呼语内容不为空
    const greetingTextarea = await page.locator(
      'textarea[placeholder*="AI正在生成"]'
    );
    const greeting = await greetingTextarea.inputValue();
    expect(greeting.length).toBeGreaterThan(10);
  });

  test('应该显示加载状态', async ({ page }) => {
    // 启用文本输入
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    // 填写文本
    const textarea = await page.locator(
      'textarea[placeholder*="请粘贴您的简历内容"]'
    );
    await textarea.fill(testResumes.short.text);

    // 点击解析
    const parseButton = await page.locator('button:has-text("AI解析简历")');
    await parseButton.click();

    // 验证加载状态显示
    await expect(page.locator('text=处理中...')).toBeVisible();

    // 等待完成
    await waitForLoading(page);

    // 验证加载状态消失
    await expect(page.locator('text=处理中...')).not.toBeVisible();
  });
});

test.describe('用户交互流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resume-management');
    await cleanupTestData(page);
  });

  test('应该支持拖拽上传', async ({ page }) => {
    const dropZone = await page.locator('text=拖拽文件到此处');
    await expect(dropZone).toBeVisible();

    // 验证拖拽区域可交互
    const isVisible = await dropZone.isVisible();
    expect(isVisible).toBe(true);
  });

  test('应该支持切换上传方式', async ({ page }) => {
    // 默认不显示文本输入
    await expect(
      page.locator('textarea[placeholder*="请粘贴您的简历内容"]')
    ).not.toBeVisible();

    // 点击checkbox启用文本输入
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    // 验证文本输入显示
    await expect(
      page.locator('textarea[placeholder*="请粘贴您的简历内容"]')
    ).toBeVisible();

    // 再次点击禁用
    await checkbox.click();

    // 验证文本输入隐藏
    await expect(
      page.locator('textarea[placeholder*="请粘贴您的简历内容"]')
    ).not.toBeVisible();
  });

  test('应该在加载时禁用按钮', async ({ page }) => {
    // 启用文本输入
    const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
    await checkbox.click();

    // 填写文本
    const textarea = await page.locator(
      'textarea[placeholder*="请粘贴您的简历内容"]'
    );
    await textarea.fill(testResumes.short.text);

    // 点击解析
    const parseButton = await page.locator('button:has-text("AI解析简历")');
    await parseButton.click();

    // 验证按钮被禁用
    await expect(parseButton).toBeDisabled();

    // 等待完成
    await waitForLoading(page);

    // 验证按钮恢复可用
    await expect(parseButton).toBeEnabled();
  });
});

test.describe('响应式设计', () => {
  test('应该在移动端正常显示', async ({ page }) => {
    // 设置移动端viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/resume-management');

    // 验证主要元素可见
    await expect(page.locator('text=简历管理')).toBeVisible();
    await expect(page.locator('text=拖拽文件到此处')).toBeVisible();
  });

  test('应该在平板端正常显示', async ({ page }) => {
    // 设置平板viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/resume-management');

    // 验证布局适配
    await expect(page.locator('text=简历管理')).toBeVisible();
  });

  test('应该在桌面端正常显示', async ({ page }) => {
    // 设置桌面viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/resume-management');

    // 验证完整布局
    await expect(page.locator('text=简历管理')).toBeVisible();
    await expect(page.locator('text=返回主页')).toBeVisible();
  });
});
