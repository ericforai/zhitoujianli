/**
 * 认证测试辅助函数
 *
 * 提供用户注册、登录、数据隔离测试的辅助方法
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-14
 */

import { APIRequestContext, Page, expect } from '@playwright/test';
import { authApiEndpoints, testConfig } from '../fixtures/auth-test-data';

/**
 * 注册新用户（测试接口，跳过邮箱验证）
 */
export async function registerUser(
  request: APIRequestContext,
  email: string,
  password: string,
  username: string
) {
  const response = await request.post(authApiEndpoints.registerTest, {
    data: {
      email,
      password,
      username,
    },
    timeout: testConfig.apiTimeout,
  });

  const data = await response.json();

  expect(response.ok()).toBeTruthy();
  expect(data.success).toBe(true);
  expect(data.token).toBeDefined();
  expect(data.user).toBeDefined();
  expect(data.user.email).toBe(email);

  return {
    token: data.token,
    user: data.user,
  };
}

/**
 * 用户登录
 */
export async function loginUser(
  request: APIRequestContext,
  email: string,
  password: string
) {
  const response = await request.post(authApiEndpoints.login, {
    data: {
      email,
      password,
    },
    timeout: testConfig.apiTimeout,
  });

  const data = await response.json();

  expect(response.ok()).toBeTruthy();
  expect(data.success).toBe(true);
  expect(data.token).toBeDefined();
  expect(data.user).toBeDefined();

  return {
    token: data.token,
    user: data.user,
  };
}

/**
 * 在页面中设置认证Token
 */
export async function setAuthToken(page: Page, token: string) {
  // 设置localStorage
  await page.evaluate(
    ({ token, tokenKey, userKey }) => {
      localStorage.setItem(tokenKey, token);
      localStorage.setItem('auth_token', token);
    },
    { token, tokenKey: testConfig.tokenKey, userKey: testConfig.userKey }
  );

  // 设置Cookie
  await page.context().addCookies([
    {
      name: testConfig.tokenKey,
      value: token,
      domain: testConfig.cookieDomain,
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}

/**
 * 清除认证信息
 */
export async function clearAuth(page: Page) {
  // 先导航到about:blank以确保可以访问存储
  await page.goto('about:blank');

  // 清除localStorage（需要在有效页面上下文中）
  try {
    await page.evaluate(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
    });
  } catch (e) {
    // 如果localStorage不可用，忽略错误
    console.log('localStorage清除跳过（不可用）');
  }

  // 清除所有cookies
  await page.context().clearCookies();
}

/**
 * 保存用户配置
 */
export async function saveUserConfig(
  request: APIRequestContext,
  token: string,
  config: any
) {
  const response = await request.post(authApiEndpoints.saveConfig, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: config,
    timeout: testConfig.apiTimeout,
  });

  const data = await response.json();

  expect(response.ok()).toBeTruthy();
  expect(data.success).toBe(true);

  return data;
}

/**
 * 获取用户配置
 */
export async function getUserConfig(request: APIRequestContext, token: string) {
  const response = await request.get(authApiEndpoints.getConfig, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: testConfig.apiTimeout,
  });

  const data = await response.json();

  if (!response.ok()) {
    console.error('获取用户配置失败:', response.status(), data);
  }

  expect(response.ok()).toBeTruthy();
  expect(data.success).toBe(true);
  expect(data.config).toBeDefined();

  return data.config;
}

/**
 * 保存用户AI配置
 */
export async function saveUserAiConfig(
  request: APIRequestContext,
  token: string,
  aiConfig: any
) {
  const response = await request.post(authApiEndpoints.saveAiConfig, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: aiConfig,
    timeout: testConfig.apiTimeout,
  });

  const data = await response.json();

  expect(response.ok()).toBeTruthy();
  expect(data.success).toBe(true);

  return data;
}

/**
 * 获取用户AI配置
 */
export async function getUserAiConfig(
  request: APIRequestContext,
  token: string
) {
  const response = await request.get(authApiEndpoints.getAiConfig, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: testConfig.apiTimeout,
  });

  const data = await response.json();

  if (!response.ok()) {
    console.error('获取AI配置失败:', response.status(), data);
  }

  expect(response.ok()).toBeTruthy();
  expect(data.success).toBe(true);
  expect(data.config).toBeDefined();

  return data.config;
}

/**
 * 验证用户信息
 */
export async function verifyUserInfo(
  request: APIRequestContext,
  token: string,
  expectedEmail: string
) {
  const response = await request.get(authApiEndpoints.getUserInfo, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: testConfig.apiTimeout,
  });

  const data = await response.json();

  expect(response.ok()).toBeTruthy();
  expect(data.userId).toBeDefined();
  expect(data.email).toBe(expectedEmail);

  return data;
}

/**
 * 验证用户数据隔离
 *
 * 检查用户A的配置与用户B的配置完全不同
 */
export async function verifyUserIsolation(
  configA: any,
  configB: any,
  userIdA: string,
  userIdB: string
) {
  // 验证配置对象存在
  expect(configA).toBeDefined();
  expect(configB).toBeDefined();

  // 验证userId不同
  expect(configA.userId).toBe(userIdA);
  expect(configB.userId).toBe(userIdB);
  expect(configA.userId).not.toBe(configB.userId);

  // 验证boss配置中的sayHi不同（关键隔离指标）
  if (configA.boss && configB.boss) {
    expect(configA.boss.sayHi).toBeDefined();
    expect(configB.boss.sayHi).toBeDefined();
    expect(configA.boss.sayHi).not.toBe(configB.boss.sayHi);
  }

  // 验证ai配置中的introduce不同
  if (configA.ai && configB.ai) {
    expect(configA.ai.introduce).toBeDefined();
    expect(configB.ai.introduce).toBeDefined();
    expect(configA.ai.introduce).not.toBe(configB.ai.introduce);
  }

  console.log('✅ 用户数据隔离验证通过');
}

/**
 * 验证Token存储
 */
export async function verifyTokenStorage(page: Page, expectedToken: string) {
  // 验证localStorage
  const storedToken = await page.evaluate(() => {
    return localStorage.getItem('auth_token');
  });

  expect(storedToken).toBe(expectedToken);

  // 验证Cookie
  const cookies = await page.context().cookies();
  const authCookie = cookies.find(c => c.name === testConfig.tokenKey);

  // Cookie可能不存在（取决于实现），但如果存在应该匹配
  if (authCookie) {
    expect(authCookie.value).toBe(expectedToken);
  }

  console.log('✅ Token存储验证通过');
}

/**
 * 等待API响应
 */
export async function waitForAuthApiResponse(
  page: Page,
  endpoint: string,
  timeout = 10000
) {
  const response = await page.waitForResponse(
    response => response.url().includes(endpoint) && response.status() !== 0,
    { timeout }
  );

  return response;
}

/**
 * 模拟注册失败（弱密码）
 */
export async function attemptRegisterWithWeakPassword(
  request: APIRequestContext,
  email: string,
  weakPassword: string,
  username: string
) {
  const response = await request.post(authApiEndpoints.registerTest, {
    data: {
      email,
      password: weakPassword,
      username,
    },
    timeout: testConfig.apiTimeout,
  });

  const data = await response.json();

  // 应该失败
  expect(data.success).toBe(false);
  expect(data.message).toContain('密码');

  return data;
}

/**
 * 模拟登录失败（错误密码）
 */
export async function attemptLoginWithWrongPassword(
  request: APIRequestContext,
  email: string,
  wrongPassword: string
) {
  const response = await request.post(authApiEndpoints.login, {
    data: {
      email,
      password: wrongPassword,
    },
    timeout: testConfig.apiTimeout,
  });

  const data = await response.json();

  // 应该失败
  expect(data.success).toBe(false);

  return data;
}

/**
 * 模拟登录失败（不存在的邮箱）
 */
export async function attemptLoginWithNonexistentEmail(
  request: APIRequestContext,
  nonexistentEmail: string,
  password: string
) {
  const response = await request.post(authApiEndpoints.login, {
    data: {
      email: nonexistentEmail,
      password,
    },
    timeout: testConfig.apiTimeout,
  });

  const data = await response.json();

  // 应该失败
  expect(data.success).toBe(false);

  return data;
}

/**
 * 截图保存（用于调试）
 */
export async function takeDebugScreenshot(page: Page, name: string) {
  const timestamp = Date.now();
  await page.screenshot({
    path: `test-results/debug-${name}-${timestamp}.png`,
    fullPage: true,
  });
}
