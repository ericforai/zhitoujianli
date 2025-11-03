/**
 * 日志工具类
 *
 * 统一管理前端日志输出，支持根据环境自动开关
 * 生产环境自动禁用debug和info级别日志
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-10
 */

import { LOG_CONFIG } from '../config/env';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * 日志级别映射
 */
const LOG_LEVEL_MAP: Record<string, LogLevel> = {
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
  none: LogLevel.NONE,
};

/**
 * 日志颜色配置
 */
const LOG_COLORS = {
  debug: '#6366f1', // 蓝色
  info: '#10b981', // 绿色
  warn: '#f59e0b', // 橙色
  error: '#ef4444', // 红色
};

/**
 * 日志工具类
 */
class Logger {
  private level: LogLevel;
  private enabled: boolean;

  constructor() {
    this.level = LOG_LEVEL_MAP[LOG_CONFIG.level] || LogLevel.DEBUG;
    this.enabled = LOG_CONFIG.enabled;
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  /**
   * 输出日志
   */
  private log(
    level: LogLevel,
    levelName: string,
    message: string,
    ...args: any[]
  ): void {
    if (!this.enabled || this.level > level) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, message);
    const color = LOG_COLORS[levelName as keyof typeof LOG_COLORS];

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`%c${formattedMessage}`, `color: ${color}`, ...args);
        break;
      case LogLevel.INFO:
        console.info(`%c${formattedMessage}`, `color: ${color}`, ...args);
        break;
      case LogLevel.WARN:
        console.warn(`%c${formattedMessage}`, `color: ${color}`, ...args);
        break;
      case LogLevel.ERROR:
        console.error(`%c${formattedMessage}`, `color: ${color}`, ...args);
        break;
    }
  }

  /**
   * Debug级别日志
   * 用于详细的调试信息
   */
  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, 'debug', message, ...args);
  }

  /**
   * Info级别日志
   * 用于一般信息
   */
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, 'info', message, ...args);
  }

  /**
   * Warn级别日志
   * 用于警告信息
   */
  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, 'warn', message, ...args);
  }

  /**
   * Error级别日志
   * 用于错误信息
   */
  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, 'error', message, ...args);
  }

  /**
   * 创建带有前缀的子Logger
   */
  createChild(prefix: string): ChildLogger {
    return new ChildLogger(this, prefix);
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 启用/禁用日志
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

/**
 * 子Logger（带前缀）
 */
class ChildLogger {
  constructor(
    private parent: Logger,
    private prefix: string
  ) {}

  debug(message: string, ...args: any[]): void {
    this.parent.debug(`[${this.prefix}] ${message}`, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.parent.info(`[${this.prefix}] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.parent.warn(`[${this.prefix}] ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.parent.error(`[${this.prefix}] ${message}`, ...args);
  }
}

/**
 * 导出单例Logger
 */
const logger = new Logger();

export default logger;

/**
 * 便捷导出
 */
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  createChild: logger.createChild.bind(logger),
};
