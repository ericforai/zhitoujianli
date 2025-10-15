/**
 * API空安全验证工具测试
 *
 * 测试API响应验证和空安全处理
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

import {
  safeGetApiData,
  validateApiResponse,
  validateResumeCheckResponse,
} from '../utils/apiValidator';

describe('API空安全验证工具测试', () => {
  test('应该正确验证有效的API响应', () => {
    const validResponse = {
      code: 200,
      message: 'success',
      data: { hasResume: true },
      timestamp: Date.now(),
    };

    expect(validateApiResponse(validResponse)).toBe(true);
  });

  test('应该拒绝无效的API响应', () => {
    const invalidResponses = [
      undefined,
      null,
      {},
      { code: 200 },
      { code: '200', message: 'success', data: {}, timestamp: Date.now() },
      { code: 200, message: 123, data: {}, timestamp: Date.now() },
      { code: 200, message: 'success', timestamp: Date.now() }, // 缺少data
    ];

    invalidResponses.forEach(response => {
      expect(validateApiResponse(response)).toBe(false);
    });
  });

  test('应该正确验证简历检查响应', () => {
    const validResponse = {
      code: 200,
      message: 'success',
      data: { hasResume: true },
      timestamp: Date.now(),
    };

    const invalidResponse = {
      code: 200,
      message: 'success',
      data: {}, // 缺少hasResume字段
      timestamp: Date.now(),
    };

    expect(validateResumeCheckResponse(validResponse)).toBe(true);
    expect(validateResumeCheckResponse(invalidResponse)).toBe(false);
  });

  test('应该安全获取API数据', () => {
    const validResponse = {
      code: 200,
      message: 'success',
      data: { hasResume: true },
      timestamp: Date.now(),
    };

    const fallback = { hasResume: false };

    // 有效响应
    const result1 = safeGetApiData(
      validResponse,
      validateResumeCheckResponse,
      fallback
    );
    expect(result1).toEqual({ hasResume: true });

    // 无效响应
    const result2 = safeGetApiData(null, validateResumeCheckResponse, fallback);
    expect(result2).toEqual(fallback);

    // 缺少data字段
    const result3 = safeGetApiData(
      { code: 200 },
      validateResumeCheckResponse,
      fallback
    );
    expect(result3).toEqual(fallback);
  });

  test('应该处理hasResume字段类型错误', () => {
    const invalidResponses = [
      {
        code: 200,
        message: 'success',
        data: { hasResume: 'yes' },
        timestamp: Date.now(),
      },
      {
        code: 200,
        message: 'success',
        data: { hasResume: 1 },
        timestamp: Date.now(),
      },
      {
        code: 200,
        message: 'success',
        data: { hasResume: null },
        timestamp: Date.now(),
      },
    ];

    invalidResponses.forEach(response => {
      expect(validateResumeCheckResponse(response)).toBe(false);
    });
  });
});
