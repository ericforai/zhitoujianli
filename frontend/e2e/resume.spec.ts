import { test, expect } from '@playwright/test';

test.describe('Resume module basic flows', () => {
  test('visit /resume shows CTA', async ({ page }) => {
    await page.goto('/resume');
    await expect(page.getByText('智能简历：模板生成 + 一键优化')).toBeVisible();
    await expect(page.getByText('登录后使用模板')).toBeVisible();
  });
});


