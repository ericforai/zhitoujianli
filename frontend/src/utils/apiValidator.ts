/**
 * API请求参数验证工具函数
 *
 * 提供常用的API请求参数验证方法，确保数据格式正确
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式（中国大陆）
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证密码强度
 * @param password 密码
 * @param minLength 最小长度，默认8
 * @returns 验证结果和错误信息
 */
export function validatePassword(
  password: string,
  minLength: number = 8
): { valid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: '密码不能为空' };
  }

  if (password.length < minLength) {
    return { valid: false, message: `密码长度不能少于${minLength}位` };
  }

  // 检查是否包含字母和数字
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return { valid: false, message: '密码必须包含字母和数字' };
  }

  return { valid: true };
}

/**
 * 验证文件类型
 * @param file 文件对象
 * @param allowedTypes 允许的文件类型数组
 * @returns 验证结果和错误信息
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): { valid: boolean; message?: string } {
  if (!file || !(file instanceof File)) {
    return { valid: false, message: '文件对象无效' };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `不支持的文件类型，允许的类型：${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * 验证文件大小
 * @param file 文件对象
 * @param maxSize 最大文件大小（字节）
 * @returns 验证结果和错误信息
 */
export function validateFileSize(
  file: File,
  maxSize: number
): { valid: boolean; message?: string } {
  if (!file || !(file instanceof File)) {
    return { valid: false, message: '文件对象无效' };
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return { valid: false, message: `文件大小不能超过${maxSizeMB}MB` };
  }

  return { valid: true };
}

/**
 * 验证必填字段
 * @param data 数据对象
 * @param requiredFields 必填字段数组
 * @returns 验证结果和错误信息
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): { valid: boolean; message?: string } {
  for (const field of requiredFields) {
    const value = data[field];
    if (value === null || value === undefined || value === '') {
      return { valid: false, message: `字段 ${String(field)} 为必填项` };
    }
  }
  return { valid: true };
}

/**
 * 验证字符串长度
 * @param str 字符串
 * @param minLength 最小长度
 * @param maxLength 最大长度
 * @returns 验证结果和错误信息
 */
export function validateStringLength(
  str: string,
  minLength?: number,
  maxLength?: number
): { valid: boolean; message?: string } {
  if (typeof str !== 'string') {
    return { valid: false, message: '必须是字符串类型' };
  }

  if (minLength !== undefined && str.length < minLength) {
    return { valid: false, message: `长度不能少于${minLength}个字符` };
  }

  if (maxLength !== undefined && str.length > maxLength) {
    return { valid: false, message: `长度不能超过${maxLength}个字符` };
  }

  return { valid: true };
}

/**
 * 验证数字范围
 * @param num 数字
 * @param min 最小值
 * @param max 最大值
 * @returns 验证结果和错误信息
 */
export function validateNumberRange(
  num: number,
  min?: number,
  max?: number
): { valid: boolean; message?: string } {
  if (typeof num !== 'number' || isNaN(num)) {
    return { valid: false, message: '必须是有效数字' };
  }

  if (min !== undefined && num < min) {
    return { valid: false, message: `值不能小于${min}` };
  }

  if (max !== undefined && num > max) {
    return { valid: false, message: `值不能大于${max}` };
  }

  return { valid: true };
}

/**
 * 验证URL格式
 * @param url URL字符串
 * @returns 验证结果
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 组合验证器
 * 依次执行多个验证器，返回第一个失败的结果
 */
export function combineValidators(
  ...validators: Array<{ valid: boolean; message?: string }>
): { valid: boolean; message?: string } {
  for (const validator of validators) {
    if (!validator.valid) {
      return validator;
    }
  }
  return { valid: true };
}
