/**
 * E2E测试：完整用户流程
 *
 * 使用Playwright进行端到端测试
 *
 * 测试流程：
 * 1. 用户注册
 * 2. 上传简历
 * 3. 生成打招呼语
 * 4. 设置投递选项
 * 5. 查看投递记录
 *
 * @author ZhiTouJianLi Test Team
 * @since 2025-10-22
 */

import { expect, Page, test } from '@playwright/test';
import * as path from 'path';

// 测试配置
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8080';

// 测试用户数据
const TEST_USER = {
  email: `test_${Date.now()}@example.com`,
  password: 'Test1234',
  username: '测试用户'
};

test.describe('完整用户流程E2E测试', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  // ==================== 测试用例 1: 用户注册流程 ====================

  test('步骤1: 用户注册', async () => {
    console.log('🔧 开始测试: 用户注册流程');

    // 1. 访问注册页面
    await page.goto(`${BASE_URL}/register`);
    await expect(page).toHaveTitle(/智投简历|注册/i);

    // 2. 填写注册信息
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.fill('input[name="confirmPassword"]', TEST_USER.password);

    // 3. 发送验证码
    await page.click('button:has-text("发送验证码")');

    // 等待验证码发送成功提示
    await expect(page.locator('text=验证码已发送')).toBeVisible({ timeout: 10000 });

    // 4. 输入验证码（在实际测试中，这里需要从邮箱或数据库获取验证码）
    // 这里使用演示模式的验证码
    const verificationCode = '123456'; // 演示模式下的固定验证码
    await page.fill('input[name="verificationCode"]', verificationCode);

    // 5. 验证验证码
    await page.click('button:has-text("验证")');
    await expect(page.locator('text=验证成功')).toBeVisible({ timeout: 5000 });

    // 6. 提交注册
    await page.click('button:has-text("注册")');

    // 7. 验证注册成功并跳转到首页
    await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });
    await expect(page).toHaveURL(`${BASE_URL}/`);

    console.log('✅ 测试通过: 用户注册成功');
  });

  // ==================== 测试用例 2: 简历上传与解析 ====================

  test('步骤2: 上传简历并AI解析', async () => {
    console.log('🔧 开始测试: 简历上传与解析');

    // 确保用户已登录
    await page.goto(`${BASE_URL}/resume`);

    // 1. 准备测试简历文件
    const resumePath = path.join(__dirname, '../fixtures/test_resume.txt');

    // 如果文件不存在，创建一个简单的测试简历
    const fs = require('fs');
    if (!fs.existsSync(resumePath)) {
      fs.mkdirSync(path.dirname(resumePath), { recursive: true });
      fs.writeFileSync(resumePath, `
姓名：张三
职位：高级Java工程师
工作年限：5年
技能：Java, Spring Boot, Kubernetes, MySQL, Redis
教育背景：本科
当前公司：某科技公司

核心优势：
1. 精通Spring Boot微服务架构设计与实现
2. 具备大型分布式系统开发经验
3. 熟悉云原生技术栈（Docker、K8s）
      `.trim());
    }

    // 2. 上传简历
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles(resumePath);

    // 3. 等待上传完成
    await expect(page.locator('text=上传成功')).toBeVisible({ timeout: 10000 });

    // 4. 等待AI解析完成
    await expect(page.locator('text=解析成功|解析完成')).toBeVisible({ timeout: 30000 });

    // 5. 验证解析结果
    await expect(page.locator('text=张三')).toBeVisible();
    await expect(page.locator('text=高级Java工程师')).toBeVisible();
    await expect(page.locator('text=5年')).toBeVisible();

    console.log('✅ 测试通过: 简历上传并解析成功');
  });

  // ==================== 测试用例 3: 生成默认打招呼语 ====================

  test('步骤3: 生成默认打招呼语', async () => {
    console.log('🔧 开始测试: 生成默认打招呼语');

    // 1. 点击生成打招呼语按钮（如果不是自动生成）
    const generateButton = page.locator('button:has-text("生成打招呼语")');
    if (await generateButton.isVisible()) {
      await generateButton.click();
    }

    // 2. 等待生成完成
    await expect(page.locator('[data-testid="greeting-text"]')).toBeVisible({ timeout: 10000 });

    // 3. 验证打招呼语内容
    const greetingText = await page.locator('[data-testid="greeting-text"]').textContent();
    expect(greetingText).toBeTruthy();
    expect(greetingText!.length).toBeGreaterThan(50);
    expect(greetingText!.length).toBeLessThan(300);

    // 4. 验证包含关键信息
    expect(greetingText).toContain('您好');

    console.log('✅ 测试通过: 默认打招呼语生成成功');
    console.log('📝 生成的打招呼语:', greetingText);
  });

  // ==================== 测试用例 4: 设置投递选项 ====================

  test('步骤4: 设置投递岗位选项', async () => {
    console.log('🔧 开始测试: 设置投递选项');

    // 1. 访问配置页面
    await page.goto(`${BASE_URL}/config`);

    // 2. 设置关键词
    await page.fill('input[name="keywords"]', 'Java工程师,后端开发');

    // 3. 选择城市
    await page.selectOption('select[name="city"]', '北京');

    // 4. 设置薪资范围
    await page.selectOption('select[name="salary"]', '20-50K');

    // 5. 设置工作经验
    await page.check('input[value="3-5年"]');

    // 6. 启用AI智能过滤
    await page.check('input[name="enableAI"]');

    // 7. 保存配置
    await page.click('button:has-text("保存配置")');

    // 8. 验证保存成功
    await expect(page.locator('text=保存成功')).toBeVisible({ timeout: 5000 });

    console.log('✅ 测试通过: 投递选项设置成功');
  });

  // ==================== 测试用例 5: 查看投递记录 ====================

  test('步骤5: 查看投递记录', async () => {
    console.log('🔧 开始测试: 查看投递记录');

    // 1. 访问投递记录页面
    await page.goto(`${BASE_URL}/delivery-records`);

    // 2. 等待页面加载
    await page.waitForLoadState('networkidle');

    // 3. 验证页面元素
    await expect(page.locator('h1, h2').filter({ hasText: /投递记录/ })).toBeVisible();

    // 4. 检查是否有投递记录表格
    const hasRecords = await page.locator('table, .record-list').count() > 0;

    if (hasRecords) {
      console.log('✅ 测试通过: 投递记录页面正常显示');
    } else {
      console.log('⚠️  当前无投递记录（这是正常的，因为还未实际投递）');
    }
  });

  // ==================== 测试用例 6: 用户登出 ====================

  test('步骤6: 用户登出', async () => {
    console.log('🔧 开始测试: 用户登出');

    // 1. 点击登出按钮
    await page.click('button:has-text("登出"), a:has-text("登出")');

    // 2. 等待跳转到登录页
    await page.waitForURL(/login|register/, { timeout: 5000 });

    // 3. 验证已登出（尝试访问受保护页面）
    await page.goto(`${BASE_URL}/resume`);

    // 应该重定向到登录页
    await expect(page).toHaveURL(/login/, { timeout: 5000 });

    console.log('✅ 测试通过: 用户登出成功');
  });
});

// ==================== 性能测试 ====================

test.describe('性能测试', () => {
  test('页面加载性能测试', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    console.log(`⏱️  页面加载时间: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000); // 页面应在3秒内加载完成
  });
});

// ==================== 响应式测试 ====================

test.describe('响应式布局测试', () => {
  test('移动端布局测试', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }, // iPhone SE
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
    });

    const page = await context.newPage();
    await page.goto(BASE_URL);

    // 验证移动端布局
    await expect(page).toHaveTitle(/智投简历/);

    // 检查是否有横向滚动条
    const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
    const viewportWidth = 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);

    console.log('✅ 移动端布局测试通过');

    await context.close();
  });

  test('平板布局测试', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 }, // iPad
    });

    const page = await context.newPage();
    await page.goto(BASE_URL);

    await expect(page).toHaveTitle(/智投简历/);

    console.log('✅ 平板布局测试通过');

    await context.close();
  });
});


