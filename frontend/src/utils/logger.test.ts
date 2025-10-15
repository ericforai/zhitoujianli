/**
 * Logger 工具类单元测试
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

import logger, { log, LogLevel } from './logger';

// Mock console methods
const originalConsole = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

describe('Logger', () => {
  beforeEach(() => {
    // Mock console methods
    console.debug = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();

    // Reset logger state
    logger.setEnabled(true);
    logger.setLevel(LogLevel.DEBUG);
  });

  afterEach(() => {
    // Restore console methods
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  describe('基本日志功能', () => {
    test('应该输出debug级别日志', () => {
      logger.debug('测试debug日志');
      expect(console.debug).toHaveBeenCalled();
    });

    test('应该输出info级别日志', () => {
      logger.info('测试info日志');
      expect(console.info).toHaveBeenCalled();
    });

    test('应该输出warn级别日志', () => {
      logger.warn('测试warn日志');
      expect(console.warn).toHaveBeenCalled();
    });

    test('应该输出error级别日志', () => {
      logger.error('测试error日志');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('日志级别控制', () => {
    test('设置为WARN级别时，不应输出DEBUG和INFO', () => {
      logger.setLevel(LogLevel.WARN);

      logger.debug('debug消息');
      logger.info('info消息');
      logger.warn('warn消息');
      logger.error('error消息');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    test('设置为ERROR级别时，只应输出ERROR', () => {
      logger.setLevel(LogLevel.ERROR);

      logger.debug('debug消息');
      logger.info('info消息');
      logger.warn('warn消息');
      logger.error('error消息');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    test('设置为NONE级别时，不应输出任何日志', () => {
      logger.setLevel(LogLevel.NONE);

      logger.debug('debug消息');
      logger.info('info消息');
      logger.warn('warn消息');
      logger.error('error消息');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('日志启用/禁用', () => {
    test('禁用后不应输出任何日志', () => {
      logger.setEnabled(false);

      logger.debug('debug消息');
      logger.info('info消息');
      logger.warn('warn消息');
      logger.error('error消息');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    test('启用后应正常输出日志', () => {
      logger.setEnabled(false);
      logger.debug('不应输出');
      expect(console.debug).not.toHaveBeenCalled();

      logger.setEnabled(true);
      logger.debug('应该输出');
      expect(console.debug).toHaveBeenCalled();
    });
  });

  describe('带参数的日志', () => {
    test('应该支持额外参数', () => {
      const obj = { key: 'value' };
      const arr = [1, 2, 3];

      logger.debug('测试对象', obj, arr);

      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('测试对象'),
        expect.any(String),
        obj,
        arr
      );
    });

    test('应该支持多个参数', () => {
      logger.info('消息', 1, 2, 3, 'test');

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('消息'),
        expect.any(String),
        1,
        2,
        3,
        'test'
      );
    });
  });

  describe('子Logger', () => {
    test('应该创建带前缀的子Logger', () => {
      const childLogger = logger.createChild('测试模块');

      childLogger.debug('子日志消息');

      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('[测试模块] 子日志消息'),
        expect.any(String)
      );
    });

    test('子Logger应该继承父Logger的配置', () => {
      logger.setLevel(LogLevel.WARN);
      const childLogger = logger.createChild('子模块');

      childLogger.debug('debug消息');
      childLogger.info('info消息');
      childLogger.warn('warn消息');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
    });

    test('应该支持多层级子Logger前缀', () => {
      const parent = logger.createChild('父模块');
      const child = logger.createChild('父模块.子模块');

      parent.info('父模块消息');
      child.info('子模块消息');

      expect(console.info).toHaveBeenCalledTimes(2);
    });
  });

  describe('便捷导出log对象', () => {
    test('应该支持log.debug', () => {
      log.debug('测试debug');
      expect(console.debug).toHaveBeenCalled();
    });

    test('应该支持log.info', () => {
      log.info('测试info');
      expect(console.info).toHaveBeenCalled();
    });

    test('应该支持log.warn', () => {
      log.warn('测试warn');
      expect(console.warn).toHaveBeenCalled();
    });

    test('应该支持log.error', () => {
      log.error('测试error');
      expect(console.error).toHaveBeenCalled();
    });

    test('应该支持log.createChild', () => {
      const childLogger = log.createChild('便捷模块');
      childLogger.info('便捷子日志');

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[便捷模块] 便捷子日志'),
        expect.any(String)
      );
    });
  });

  describe('边界情况', () => {
    test('应该处理空字符串消息', () => {
      logger.info('');
      expect(console.info).toHaveBeenCalled();
    });

    test('应该处理特殊字符', () => {
      logger.debug('测试<特殊>字符&符号#@!');
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('测试<特殊>字符&符号#@!'),
        expect.any(String)
      );
    });

    test('应该处理长消息', () => {
      const longMessage = 'a'.repeat(1000);
      logger.warn(longMessage);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(longMessage),
        expect.any(String)
      );
    });

    test('应该处理undefined和null参数', () => {
      logger.error('测试', undefined, null);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('测试'),
        expect.any(String),
        undefined,
        null
      );
    });
  });
});
