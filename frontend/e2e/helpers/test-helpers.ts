/**
 * E2E测试辅助函数
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

import { Page, expect } from '@playwright/test';

/**
 * 等待加载完成
 */
export async function waitForLoading(page: Page, timeout = 30000) {
  await page.waitForSelector('text=处理中...', { state: 'hidden', timeout });
}

/**
 * 等待元素出现
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 10000
) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * 等待API响应
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 30000
) {
  const response = await page.waitForResponse(urlPattern, { timeout });
  return response;
}

/**
 * 上传简历文件
 */
export async function uploadResumeFile(page: Page, filePath: string) {
  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);

  // 等待上传完成
  await waitForLoading(page);
}

/**
 * 粘贴简历文本
 */
export async function pasteResumeText(page: Page, text: string) {
  // 启用文本输入模式
  const checkbox = await page.locator('label:has-text("或直接粘贴简历文本")');
  await checkbox.click();

  // 填写文本
  const textarea = await page.locator(
    'textarea[placeholder*="请粘贴您的简历内容"]'
  );
  await textarea.fill(text);

  // 点击解析按钮
  const parseButton = await page.locator('button:has-text("AI解析简历")');
  await parseButton.click();

  // 等待解析完成
  await waitForLoading(page);
}

/**
 * 验证解析结果
 */
export async function verifyParseResult(page: Page, expectedData: any) {
  // 验证解析结果区域可见
  await expect(page.locator('text=解析结果')).toBeVisible();

  // 验证关键字段
  if (expectedData.current_title) {
    await expect(
      page.locator(`text=${expectedData.current_title}`)
    ).toBeVisible();
  }

  if (expectedData.years_experience) {
    await expect(
      page.locator(`text=${expectedData.years_experience}年`)
    ).toBeVisible();
  }

  if (expectedData.education) {
    await expect(page.locator(`text=${expectedData.education}`)).toBeVisible();
  }
}

/**
 * 验证打招呼语生成
 */
export async function verifyGreetingGenerated(page: Page) {
  await expect(page.locator('text=AI生成的默认打招呼语')).toBeVisible();

  const greetingTextarea = await page.locator(
    'textarea[placeholder*="AI正在生成"]'
  );

  // 验证打招呼语不为空
  const value = await greetingTextarea.inputValue();
  expect(value.length).toBeGreaterThan(0);
}

/**
 * 编辑打招呼语
 */
export async function editGreeting(page: Page, newGreeting: string) {
  const greetingTextarea = await page.locator(
    'textarea[placeholder*="AI正在生成"]'
  );
  await greetingTextarea.fill(newGreeting);
}

/**
 * 保存打招呼语
 */
export async function saveGreeting(page: Page) {
  const saveButton = await page.locator('button:has-text("保存为默认招呼语")');
  await saveButton.click();

  // 等待保存完成
  await expect(page.locator('text=默认打招呼语保存成功')).toBeVisible({
    timeout: 10000,
  });
}

/**
 * 重新生成打招呼语
 */
export async function regenerateGreeting(page: Page) {
  const regenerateButton = await page.locator('button:has-text("重新生成")');
  await regenerateButton.click();

  // 等待生成完成
  await waitForLoading(page);
}

/**
 * 删除简历
 */
export async function deleteResume(page: Page) {
  // 监听确认对话框
  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('confirm');
    await dialog.accept();
  });

  const deleteButton = await page.locator('button:has-text("删除简历")');
  await deleteButton.click();

  // 等待删除完成
  await expect(page.locator('text=简历删除成功')).toBeVisible({
    timeout: 10000,
  });
}

/**
 * 验证错误提示
 */
export async function verifyErrorMessage(page: Page, expectedMessage: string) {
  const errorDiv = await page.locator('.bg-red-50');
  await expect(errorDiv).toBeVisible();
  await expect(errorDiv).toContainText(expectedMessage);
}

/**
 * 验证成功提示
 */
export async function verifySuccessMessage(
  page: Page,
  expectedMessage: string
) {
  const successDiv = await page.locator('.bg-green-50');
  await expect(successDiv).toBeVisible();
  await expect(successDiv).toContainText(expectedMessage);
}

/**
 * 清除测试数据
 */
export async function cleanupTestData(page: Page) {
  // 如果有简历，先删除
  const deleteButton = await page.locator('button:has-text("删除简历")');
  const isVisible = await deleteButton.isVisible().catch(() => false);

  if (isVisible) {
    page.on('dialog', async dialog => await dialog.accept());
    await deleteButton.click();
    await page.waitForTimeout(1000);
  }
}

/**
 * 模拟网络慢速
 */
export async function simulateSlowNetwork(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (500 * 1024) / 8, // 500kb/s
    uploadThroughput: (500 * 1024) / 8,
    latency: 100,
  });
}

/**
 * 模拟网络离线
 */
export async function simulateOffline(page: Page) {
  await page.context().setOffline(true);
}

/**
 * 恢复网络
 */
export async function restoreNetwork(page: Page) {
  await page.context().setOffline(false);
}

/**
 * 截图保存
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
}

/**
 * 等待指定时间
 */
export async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
