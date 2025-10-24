/**
 * 简化的logger边界测试
 * 只测试核心功能，避免复杂的边界条件
 */

import logger from './logger';

describe('logger边界测试', () => {
  test('应该能够处理基本日志记录', () => {
    // 测试基本功能
    expect(() => logger.info('测试信息')).not.toThrow();
    expect(() => logger.error('测试错误')).not.toThrow();

    console.log('✅ 测试通过: logger基本功能正常');
  });

  test('应该能够处理空值输入', () => {
    // 测试边界条件
    expect(() => logger.info('')).not.toThrow();
    expect(() => logger.error(null as any)).not.toThrow();

    console.log('✅ 测试通过: logger边界条件处理正常');
  });
});
