/**
 * useErrorHandler Hook单元测试
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */

import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from './useErrorHandler';

describe('useErrorHandler Hook测试', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('应该初始化错误状态为空', () => {
    const { result } = renderHook(() => useErrorHandler());
    expect(result.current.error.hasError).toBe(false);
    expect(result.current.error.error).toBe(null);
  });

  test('应该能够设置错误', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.setError('测试错误');
    });

    expect(result.current.error.hasError).toBe(true);
    expect(result.current.error.error).toBe('测试错误');
    expect(result.current.error.timestamp).toBeGreaterThan(0);
  });

  test('应该能够清除错误', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.setError('测试错误');
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error.hasError).toBe(false);
    expect(result.current.error.error).toBe(null);
  });

  test('应该自动清除错误（5秒后）', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.setError('测试错误');
    });

    expect(result.current.error.hasError).toBe(true);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.error.hasError).toBe(false);
  });

  test('应该处理字符串错误', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError('字符串错误');
    });

    expect(result.current.error.error).toBe('字符串错误');
  });

  test('应该处理Error对象', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Error对象错误');

    act(() => {
      result.current.handleError(error);
    });

    expect(result.current.error.error).toBe('Error对象错误');
  });

  test('应该处理API错误格式', () => {
    const { result } = renderHook(() => useErrorHandler());
    const apiError = {
      response: {
        data: {
          message: 'API错误消息',
        },
      },
    };

    act(() => {
      result.current.handleError(apiError);
    });

    expect(result.current.error.error).toBe('API错误消息');
  });

  test('应该处理没有response的API错误', () => {
    const { result } = renderHook(() => useErrorHandler());
    const apiError = {
      message: '直接消息',
    };

    act(() => {
      result.current.handleError(apiError);
    });

    expect(result.current.error.error).toBe('直接消息');
  });

  test('应该处理未知错误格式', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError({ someUnknown: 'format' });
    });

    expect(result.current.error.error).toBe('发生未知错误');
  });
});
