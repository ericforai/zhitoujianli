import { test, expect } from '@playwright/test';

test.describe('Resume module basic flows', () => {
  test('visit /resume shows CTA', async ({ page }) => {
    await page.goto('/resume');
    await expect(page.getByText('智能简历：模板生成 + 一键优化')).toBeVisible();
    await expect(page.getByText('登录后使用模板')).toBeVisible();
  });

  test.skip('after login go to /resume/templates, fill minimal form, submit to preview', async ({ page }) => {
    // TODO: 依赖登录与 devMock 环境，后续打通再启用
  });

  test.skip('preview page shows score and export button (mock backend)', async ({ page }) => {
    // TODO: 待后端或 devMock 环境稳定后启用
  });

  test.skip('optimize flow: upload txt, show diagnose, generate revision, export', async ({ page }) => {
    // TODO: 文件上传在CI环境需准备fixture，后续启用
  });

  test.skip('history page shows records with download link', async ({ page }) => {
    // TODO: 依赖前序生成记录，后续串联
  });
});


