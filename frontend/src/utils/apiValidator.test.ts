/**
 * API参数验证工具函数单元测试
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */

import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateFileType,
  validateFileSize,
  validateRequiredFields,
  validateStringLength,
  validateNumberRange,
  validateUrl,
  combineValidators,
} from './apiValidator';

describe('apiValidator工具函数测试', () => {
  describe('validateEmail', () => {
    test('应该验证有效的邮箱地址', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@example.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    test('应该拒绝无效的邮箱地址', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null as unknown as string)).toBe(false);
      expect(validateEmail(undefined as unknown as string)).toBe(false);
    });
  });

  describe('validatePhone', () => {
    test('应该验证有效的手机号', () => {
      expect(validatePhone('13800138000')).toBe(true);
      expect(validatePhone('15912345678')).toBe(true);
      expect(validatePhone('18600000000')).toBe(true);
    });

    test('应该拒绝无效的手机号', () => {
      expect(validatePhone('1234567890')).toBe(false); // 不是1开头
      expect(validatePhone('1380013800')).toBe(false); // 长度不足
      expect(validatePhone('138001380001')).toBe(false); // 长度过长
      expect(validatePhone('')).toBe(false);
      expect(validatePhone(null as unknown as string)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('应该验证有效的密码', () => {
      const result1 = validatePassword('password123');
      expect(result1.valid).toBe(true);

      const result2 = validatePassword('P@ssw0rd', 6);
      expect(result2.valid).toBe(true);
    });

    test('应该拒绝无效的密码', () => {
      const result1 = validatePassword('short');
      expect(result1.valid).toBe(false);
      expect(result1.message).toContain('长度不能少于');

      const result2 = validatePassword('12345678'); // 只有数字
      expect(result2.valid).toBe(false);
      expect(result2.message).toContain('必须包含字母和数字');

      const result3 = validatePassword('abcdefgh'); // 只有字母
      expect(result3.valid).toBe(false);
      expect(result3.message).toContain('必须包含字母和数字');

      const result4 = validatePassword('');
      expect(result4.valid).toBe(false);
      expect(result4.message).toContain('不能为空');
    });
  });

  describe('validateFileType', () => {
    test('应该验证有效的文件类型', () => {
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });
      const allowedTypes = ['application/pdf', 'text/plain'];
      const result = validateFileType(file, allowedTypes);
      expect(result.valid).toBe(true);
    });

    test('应该拒绝不支持的文件类型', () => {
      const file = new File(['content'], 'test.exe', {
        type: 'application/x-msdownload',
      });
      const allowedTypes = ['application/pdf', 'text/plain'];
      const result = validateFileType(file, allowedTypes);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('不支持的文件类型');
    });

    test('应该处理无效的文件对象', () => {
      const result = validateFileType(null as unknown as File, [
        'application/pdf',
      ]);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('文件对象无效');
    });
  });

  describe('validateFileSize', () => {
    test('应该验证有效的文件大小', () => {
      const file = new File(['x'.repeat(1024)], 'test.txt', {
        type: 'text/plain',
      });
      const maxSize = 10 * 1024 * 1024; // 10MB
      const result = validateFileSize(file, maxSize);
      expect(result.valid).toBe(true);
    });

    test('应该拒绝超大文件', () => {
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      const file = new File([largeContent], 'test.txt', { type: 'text/plain' });
      const maxSize = 10 * 1024 * 1024; // 10MB
      const result = validateFileSize(file, maxSize);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('不能超过');
    });
  });

  describe('validateRequiredFields', () => {
    test('应该验证所有必填字段存在', () => {
      const data = {
        name: 'Test',
        email: 'test@example.com',
        age: 25,
      };
      const result = validateRequiredFields(data, ['name', 'email']);
      expect(result.valid).toBe(true);
    });

    test('应该拒绝缺少必填字段', () => {
      const data: { name: string; email: string; age?: number } = {
        name: 'Test',
        email: '',
      };
      const result = validateRequiredFields(data, ['name', 'email', 'age']);
      expect(result.valid).toBe(false);
      // 验证消息包含缺失的字段（可能是email或age，取决于验证顺序）
      expect(result.message).toMatch(/字段 (email|age) 为必填项/);
    });
  });

  describe('validateStringLength', () => {
    test('应该验证有效的字符串长度', () => {
      const result1 = validateStringLength('test', 2, 10);
      expect(result1.valid).toBe(true);

      const result2 = validateStringLength('test', undefined, 10);
      expect(result2.valid).toBe(true);
    });

    test('应该拒绝长度不符合要求的字符串', () => {
      const result1 = validateStringLength('t', 2, 10);
      expect(result1.valid).toBe(false);
      expect(result1.message).toContain('不能少于');

      const result2 = validateStringLength('very long string', 2, 5);
      expect(result2.valid).toBe(false);
      expect(result2.message).toContain('不能超过');
    });
  });

  describe('validateNumberRange', () => {
    test('应该验证有效的数字范围', () => {
      const result1 = validateNumberRange(5, 1, 10);
      expect(result1.valid).toBe(true);

      const result2 = validateNumberRange(5, undefined, 10);
      expect(result2.valid).toBe(true);
    });

    test('应该拒绝超出范围的数字', () => {
      const result1 = validateNumberRange(0, 1, 10);
      expect(result1.valid).toBe(false);
      expect(result1.message).toContain('不能小于');

      const result2 = validateNumberRange(11, 1, 10);
      expect(result2.valid).toBe(false);
      expect(result2.message).toContain('不能大于');
    });
  });

  describe('validateUrl', () => {
    test('应该验证有效的URL', () => {
      expect(validateUrl('https://www.example.com')).toBe(true);
      expect(validateUrl('http://example.com/path')).toBe(true);
      expect(validateUrl('https://example.com:8080/path?query=1')).toBe(true);
    });

    test('应该拒绝无效的URL', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('')).toBe(false);
      expect(validateUrl(null as unknown as string)).toBe(false);
    });
  });

  describe('combineValidators', () => {
    test('应该在所有验证器通过时返回成功', () => {
      const validators = [{ valid: true }, { valid: true }, { valid: true }];
      const result = combineValidators(...validators);
      expect(result.valid).toBe(true);
    });

    test('应该返回第一个失败的验证器结果', () => {
      const validators = [
        { valid: true },
        { valid: false, message: '第二个验证失败' },
        { valid: false, message: '第三个验证失败' },
      ];
      const result = combineValidators(...validators);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('第二个验证失败');
    });
  });
});
