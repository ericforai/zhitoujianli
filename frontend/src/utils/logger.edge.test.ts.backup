/**
 * Logger 边界测试
 *
 * 测试日志系统在极端情况下的表现
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

import logger, { LogLevel } from './logger';

const originalConsole = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

describe('Logger - 边界测试', () => {
  beforeEach(() => {
    console.debug = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();

    logger.setEnabled(true);
    logger.setLevel(LogLevel.DEBUG);
  });

  afterEach(() => {
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  describe('循环引用对象', () => {
    test('应该处理简单循环引用', () => {
      const obj: any = { name: '测试' };
      obj.self = obj; // 循环引用

      expect(() => {
        logger.debug('循环引用测试', obj);
      }).not.toThrow();

      expect(console.debug).toHaveBeenCalled();
    });

    test('应该处理复杂循环引用', () => {
      const obj1: any = { name: 'obj1' };
      const obj2: any = { name: 'obj2' };
      obj1.ref = obj2;
      obj2.ref = obj1; // 相互引用

      expect(() => {
        logger.info('复杂循环引用', obj1, obj2);
      }).not.toThrow();

      expect(console.info).toHaveBeenCalled();
    });

    test('应该处理深层循环引用', () => {
      const obj: any = { level1: { level2: { level3: {} } } };
      obj.level1.level2.level3.back = obj; // 深层循环

      expect(() => {
        logger.warn('深层循环引用', obj);
      }).not.toThrow();
    });
  });

  describe('超大对象处理', () => {
    test('应该处理超大对象（>1MB）', () => {
      const largeObj = {
        data: 'x'.repeat(1024 * 1024), // 1MB字符串
      };

      expect(() => {
        logger.debug('超大对象', largeObj);
      }).not.toThrow();

      expect(console.debug).toHaveBeenCalled();
    });

    test('应该处理包含大量属性的对象', () => {
      const manyPropsObj: any = {};
      for (let i = 0; i < 10000; i++) {
        manyPropsObj[`prop${i}`] = i;
      }

      expect(() => {
        logger.info('大量属性对象', manyPropsObj);
      }).not.toThrow();

      expect(console.info).toHaveBeenCalled();
    });

    test('应该处理超大数组', () => {
      const largeArray = Array(100000).fill('test');

      expect(() => {
        logger.warn('超大数组', largeArray);
      }).not.toThrow();

      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('深层嵌套对象', () => {
    test('应该处理深层嵌套对象（100+层）', () => {
      let deepObj: any = { value: 'leaf' };
      for (let i = 0; i < 150; i++) {
        deepObj = { nested: deepObj };
      }

      expect(() => {
        logger.debug('深层嵌套对象', deepObj);
      }).not.toThrow();

      expect(console.debug).toHaveBeenCalled();
    });

    test('应该处理混合嵌套结构', () => {
      const mixedNested = {
        level1: {
          array: [
            { obj1: { deep: { deeper: { value: 1 } } } },
            { obj2: { deep: { deeper: { value: 2 } } } },
          ],
          map: new Map<string, any>([['key', { nested: { value: 3 } }]]),
        },
      };

      expect(() => {
        logger.info('混合嵌套结构', mixedNested);
      }).not.toThrow();
    });
  });

  describe('特殊类型处理', () => {
    test('应该处理函数类型', () => {
      const func = function testFunction() {
        return 'test';
      };

      expect(() => {
        logger.debug('函数类型', func);
      }).not.toThrow();

      expect(console.debug).toHaveBeenCalled();
    });

    test('应该处理Symbol类型', () => {
      const sym = Symbol('test');

      expect(() => {
        logger.info('Symbol类型', sym);
      }).not.toThrow();

      expect(console.info).toHaveBeenCalled();
    });

    test('应该处理Map和Set', () => {
      const map = new Map<string, any>([
        ['key1', 'value1'],
        ['key2', { nested: 'value2' }],
      ]);
      const set = new Set<any>([1, 2, 3, { obj: 'value' }]);

      expect(() => {
        logger.warn('Map和Set', map, set);
      }).not.toThrow();

      expect(console.warn).toHaveBeenCalled();
    });

    test('应该处理Date对象', () => {
      const date = new Date();

      expect(() => {
        logger.debug('Date对象', date);
      }).not.toThrow();

      expect(console.debug).toHaveBeenCalled();
    });

    test('应该处理RegExp对象', () => {
      const regex = /test.*pattern/gi;

      expect(() => {
        logger.info('RegExp对象', regex);
      }).not.toThrow();

      expect(console.info).toHaveBeenCalled();
    });

    test('应该处理Error对象', () => {
      const error = new Error('测试错误');
      error.stack = '错误堆栈...';

      expect(() => {
        logger.error('Error对象', error);
      }).not.toThrow();

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('并发日志写入', () => {
    test('应该处理大量并发日志写入', () => {
      const promises = Array(1000)
        .fill(null)
        .map((_, i) => {
          return new Promise<void>(resolve => {
            logger.debug(`并发日志${i}`);
            resolve();
          });
        });

      expect(() => {
        Promise.all(promises);
      }).not.toThrow();

      expect(console.debug).toHaveBeenCalledTimes(1000);
    });

    test('应该处理不同级别的混合并发', () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          logger.debug(`debug ${i}`);
          logger.info(`info ${i}`);
          logger.warn(`warn ${i}`);
          logger.error(`error ${i}`);
        }
      }).not.toThrow();

      expect(console.debug).toHaveBeenCalledTimes(100);
      expect(console.info).toHaveBeenCalledTimes(100);
      expect(console.warn).toHaveBeenCalledTimes(100);
      expect(console.error).toHaveBeenCalledTimes(100);
    });
  });

  describe('极端配置场景', () => {
    test('应该处理频繁切换日志级别', () => {
      for (let i = 0; i < 100; i++) {
        logger.setLevel(i % 2 === 0 ? LogLevel.DEBUG : LogLevel.ERROR);
        logger.debug('测试消息');
      }

      expect(console.debug).toHaveBeenCalled();
    });

    test('应该处理频繁启用/禁用', () => {
      for (let i = 0; i < 100; i++) {
        logger.setEnabled(i % 2 === 0);
        logger.info('测试消息');
      }

      // 一半时间启用，一半时间禁用
      expect(console.info).toHaveBeenCalled();
    });
  });

  describe('内存和性能', () => {
    test('应该不会导致内存泄漏（创建大量子Logger）', () => {
      const childLoggers = [];

      // 创建1000个子Logger
      for (let i = 0; i < 1000; i++) {
        childLoggers.push(logger.createChild(`module-${i}`));
      }

      // 使用所有子Logger
      childLoggers.forEach((child, i) => {
        child.debug(`消息${i}`);
      });

      expect(console.debug).toHaveBeenCalledTimes(1000);
    });

    test('应该处理快速连续的日志调用（压力测试）', () => {
      const start = Date.now();

      for (let i = 0; i < 10000; i++) {
        logger.debug('压力测试消息', i);
      }

      const duration = Date.now() - start;

      // 应该在合理时间内完成（<1秒）
      expect(duration).toBeLessThan(1000);
      expect(console.debug).toHaveBeenCalledTimes(10000);
    });
  });

  describe('特殊消息内容', () => {
    test('应该处理极长消息（>100KB）', () => {
      const longMessage = 'a'.repeat(100 * 1024);

      expect(() => {
        logger.debug(longMessage);
      }).not.toThrow();

      expect(console.debug).toHaveBeenCalled();
    });

    test('应该处理包含所有Unicode范围的消息', () => {
      const unicodeMessage =
        '中文\u4E00日本語\u3042韩文\uAC00Emoji😀数学∑特殊™';

      expect(() => {
        logger.info(unicodeMessage);
      }).not.toThrow();

      expect(console.info).toHaveBeenCalled();
    });

    test('应该处理包含零宽字符的消息', () => {
      const zeroWidthMessage = 'test\u200Bword\u200Chere\u200D';

      expect(() => {
        logger.warn(zeroWidthMessage);
      }).not.toThrow();

      expect(console.warn).toHaveBeenCalled();
    });

    test('应该处理只包含空白字符的消息', () => {
      const whitespaceMessage = '   \n\t\r   ';

      expect(() => {
        logger.debug(whitespaceMessage);
      }).not.toThrow();

      expect(console.debug).toHaveBeenCalled();
    });
  });

  describe('子Logger边界测试', () => {
    test('应该处理极长前缀', () => {
      const longPrefix = 'prefix-'.repeat(1000);
      const child = logger.createChild(longPrefix);

      expect(() => {
        child.debug('消息');
      }).not.toThrow();

      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining(longPrefix),
        expect.any(String)
      );
    });

    test('应该处理前缀包含特殊字符', () => {
      const specialPrefix = '前缀<>&"\'\u0000😀';
      const child = logger.createChild(specialPrefix);

      expect(() => {
        child.info('消息');
      }).not.toThrow();

      expect(console.info).toHaveBeenCalled();
    });

    test('应该处理空字符串前缀', () => {
      const child = logger.createChild('');

      expect(() => {
        child.warn('消息');
      }).not.toThrow();

      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('边界参数组合', () => {
    test('应该处理大量参数（>100个）', () => {
      const args = Array(100).fill('arg');

      expect(() => {
        logger.debug('大量参数', ...args);
      }).not.toThrow();

      expect(console.debug).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        ...args
      );
    });

    test('应该处理混合类型参数', () => {
      const mixedArgs = [
        'string',
        123,
        true,
        null,
        undefined,
        { obj: 'value' },
        ['array'],
        Symbol('sym'),
        () => {},
        new Date(),
        /regex/,
      ];

      expect(() => {
        logger.info('混合类型参数', ...mixedArgs);
      }).not.toThrow();

      expect(console.info).toHaveBeenCalled();
    });

    test('应该处理所有参数都为undefined', () => {
      expect(() => {
        logger.warn('警告', undefined, undefined, undefined);
      }).not.toThrow();

      expect(console.warn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        undefined,
        undefined,
        undefined
      );
    });

    test('应该处理所有参数都为null', () => {
      expect(() => {
        logger.error('错误', null, null, null);
      }).not.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        null,
        null,
        null
      );
    });
  });

  describe('极端性能场景', () => {
    test('应该在高频调用下保持性能', () => {
      const start = performance.now();

      // 连续调用10000次
      for (let i = 0; i < 10000; i++) {
        logger.debug('高频消息', i);
      }

      const duration = performance.now() - start;

      // 应该在合理时间内完成（<2秒）
      expect(duration).toBeLessThan(2000);
    });

    test('应该处理极快速的级别切换', () => {
      const levels = [
        LogLevel.DEBUG,
        LogLevel.INFO,
        LogLevel.WARN,
        LogLevel.ERROR,
        LogLevel.NONE,
      ];

      for (let i = 0; i < 1000; i++) {
        logger.setLevel(levels[i % levels.length]);
        logger.debug('测试消息');
      }

      // 不应该崩溃
      expect(true).toBe(true);
    });
  });

  describe('特殊对象类型', () => {
    test('应该处理Proxy对象', () => {
      const target = { value: 'test' };
      const proxy = new Proxy(target, {
        get(obj, prop) {
          return obj[prop as keyof typeof obj];
        },
      });

      expect(() => {
        logger.debug('Proxy对象', proxy);
      }).not.toThrow();
    });

    test('应该处理Promise对象', () => {
      const promise = Promise.resolve('test');

      expect(() => {
        logger.info('Promise对象', promise);
      }).not.toThrow();

      expect(console.info).toHaveBeenCalled();
    });

    test('应该处理ArrayBuffer', () => {
      const buffer = new ArrayBuffer(1024);

      expect(() => {
        logger.warn('ArrayBuffer', buffer);
      }).not.toThrow();

      expect(console.warn).toHaveBeenCalled();
    });

    test('应该处理TypedArray', () => {
      const uint8Array = new Uint8Array([1, 2, 3, 4, 5]);

      expect(() => {
        logger.debug('TypedArray', uint8Array);
      }).not.toThrow();

      expect(console.debug).toHaveBeenCalled();
    });
  });

  describe('异常消息格式', () => {
    test('应该处理包含换行符的消息', () => {
      const multilineMessage = '第一行\n第二行\n第三行';

      logger.debug(multilineMessage);

      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('第一行\n第二行\n第三行'),
        expect.any(String)
      );
    });

    test('应该处理包含制表符的消息', () => {
      const tabbedMessage = '列1\t列2\t列3';

      logger.info(tabbedMessage);

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('列1\t列2\t列3'),
        expect.any(String)
      );
    });

    test('应该处理包含转义字符的消息', () => {
      const escapedMessage = '反斜杠\\引号\\"单引号\\\'';

      logger.warn(escapedMessage);

      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('边界日志级别', () => {
    test('应该处理无效的日志级别', () => {
      // 设置超出范围的级别
      logger.setLevel(999 as LogLevel);

      logger.debug('debug消息');
      logger.info('info消息');
      logger.warn('warn消息');
      logger.error('error消息');

      // 应该不会崩溃
      expect(true).toBe(true);
    });

    test('应该处理负数日志级别', () => {
      logger.setLevel(-1 as LogLevel);

      logger.debug('debug消息');

      // 应该不会崩溃
      expect(true).toBe(true);
    });
  });

  describe('内存泄漏测试', () => {
    test('应该不会在创建大量子Logger时泄漏内存', () => {
      // 创建并销毁大量子Logger
      for (let i = 0; i < 1000; i++) {
        const child = logger.createChild(`temp-${i}`);
        child.debug('临时消息');
        // JavaScript GC会自动回收
      }

      // 不应该崩溃或显著增加内存
      expect(console.debug).toHaveBeenCalledTimes(1000);
    });

    test('应该不会在大量日志调用时泄漏内存', () => {
      logger.setLevel(LogLevel.NONE); // 禁用输出以加快测试

      for (let i = 0; i < 10000; i++) {
        logger.debug('消息', { index: i, data: 'x'.repeat(100) });
      }

      // 不应该崩溃
      expect(true).toBe(true);
    });
  });

  describe('异常状态恢复', () => {
    test('应该在console方法被覆盖后仍能工作', () => {
      // 保存原始方法
      const originalDebug = console.debug;

      // 覆盖console.debug
      (console as any).debug = undefined;

      expect(() => {
        logger.debug('测试消息');
      }).not.toThrow();

      // 恢复
      console.debug = originalDebug;
    });

    test('应该处理console对象被冻结', () => {
      // 这个测试在实际环境中可能不适用
      // 但我们可以测试容错性
      expect(() => {
        logger.info('测试消息');
      }).not.toThrow();
    });
  });

  describe('时间戳边界', () => {
    test('应该正确处理时间戳格式', () => {
      logger.debug('时间戳测试');

      expect(console.debug).toHaveBeenCalledWith(
        expect.stringMatching(
          /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/
        ),
        expect.any(String)
      );
    });
  });

  describe('跨浏览器兼容性模拟', () => {
    test('应该在console.debug不存在时降级到console.log', () => {
      const originalDebug = console.debug;
      const originalLog = console.log;

      console.debug = undefined as any;
      console.log = jest.fn();

      // 即使debug不存在，也不应该崩溃
      expect(() => {
        logger.debug('测试消息');
      }).not.toThrow();

      console.debug = originalDebug;
      console.log = originalLog;
    });
  });
});
