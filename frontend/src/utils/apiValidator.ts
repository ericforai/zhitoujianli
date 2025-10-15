/**
 * API响应验证工具
 * 确保API响应的数据结构和类型安全
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

import { ApiResponse } from '../types/api';

/**
 * 验证API响应是否有效
 */
export function validateApiResponse<T>(
  response: any,
  expectedDataShape?: (data: any) => boolean
): response is ApiResponse<T> {
  // 基本结构检查
  if (!response || typeof response !== 'object') {
    console.warn('API响应不是对象:', response);
    return false;
  }

  // 检查必需字段
  if (typeof response.code !== 'number') {
    console.warn('API响应缺少code字段或类型错误:', response);
    return false;
  }

  if (typeof response.message !== 'string') {
    console.warn('API响应缺少message字段或类型错误:', response);
    return false;
  }

  if (typeof response.timestamp !== 'number') {
    console.warn('API响应缺少timestamp字段或类型错误:', response);
    return false;
  }

  // 检查data字段是否存在
  if (!('data' in response)) {
    console.warn('API响应缺少data字段:', response);
    return false;
  }

  // 自定义数据形状验证
  if (expectedDataShape && !expectedDataShape(response.data)) {
    console.warn('API响应数据形状不符合预期:', response.data);
    return false;
  }

  return true;
}

/**
 * 验证简历检查响应
 */
export function validateResumeCheckResponse(
  response: any
): response is ApiResponse<{ hasResume: boolean }> {
  return validateApiResponse(response, data => {
    return data && typeof data.hasResume === 'boolean';
  });
}

/**
 * 验证简历信息响应
 */
export function validateResumeInfoResponse(
  response: any
): response is ApiResponse<any> {
  return validateApiResponse(response, data => {
    return data && typeof data === 'object';
  });
}

/**
 * 安全获取API响应数据
 */
export function safeGetApiData<T>(
  response: any,
  validator: (response: any) => response is ApiResponse<T>,
  fallback: T
): T {
  if (validator(response)) {
    return response.data;
  }
  return fallback;
}

/**
 * 创建安全的API调用包装器
 */
export function createSafeApiCall<T>(
  apiCall: () => Promise<any>,
  validator: (response: any) => response is ApiResponse<T>,
  fallback: T
): Promise<T> {
  return apiCall()
    .then(response => {
      if (validator(response)) {
        return response.data;
      }
      console.warn('API响应验证失败，使用fallback值:', response);
      return fallback;
    })
    .catch(error => {
      console.error('API调用失败:', error);
      return fallback;
    });
}

/**
 * 检查对象属性是否存在且类型正确
 */
export function hasValidProperty<T>(
  obj: any,
  property: string,
  typeCheck: (value: any) => value is T
): obj is { [K in typeof property]: T } {
  return obj && Object.prototype.hasOwnProperty.call(obj, property) && typeCheck(obj[property]);
}

/**
 * 类型守卫：检查是否为布尔值
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 类型守卫：检查是否为字符串
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * 类型守卫：检查是否为数字
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 类型守卫：检查是否为对象
 */
export function isObject(value: any): value is object {
  return value !== null && typeof value === 'object';
}
