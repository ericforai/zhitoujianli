/**
 * 环境配置管理模块
 *
 * 统一管理API地址、Cookie域、端口等配置
 * 支持开发、测试、生产环境自动切换
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

/**
 * 环境类型枚举
 */
export enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

/**
 * 环境配置接口
 */
export interface EnvironmentConfig {
  /** API基础URL */
  apiBaseUrl: string;
  /** WebSocket基础URL */
  wsBaseUrl: string;
  /** Cookie域名 */
  cookieDomain: string;
  /** 是否使用HTTPS */
  isSecure: boolean;
  /** 是否为生产环境 */
  isProduction: boolean;
  /** 请求超时时间（毫秒） */
  requestTimeout: number;
  /** WebSocket重连次数 */
  wsMaxReconnectAttempts: number;
  /** WebSocket重连间隔（毫秒） */
  wsReconnectInterval: number;
}

/**
 * 获取当前环境
 */
const getCurrentEnvironment = (): Environment => {
  // 优先使用环境变量
  const env = process.env.REACT_APP_ENV;
  if (env) {
    return env as Environment;
  }

  // 根据hostname判断
  const hostname =
    typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  // 如果是zhitoujianli.com域名，强制使用生产环境配置
  if (hostname === 'zhitoujianli.com' || hostname === 'www.zhitoujianli.com') {
    return Environment.Production;
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return Environment.Development;
  }

  if (hostname.includes('staging') || hostname.includes('test')) {
    return Environment.Staging;
  }

  return Environment.Production;
};

/**
 * 检查是否为HTTPS环境
 */
const isSecureContext = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:';
};

/**
 * 获取Cookie域名
 */
const getCookieDomain = (): string => {
  if (typeof window === 'undefined') return 'localhost';

  const hostname = window.location.hostname;

  // 本地开发环境
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'localhost';
  }

  // IP地址（开发/测试服务器）
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return hostname;
  }

  // 域名环境：返回主域名（支持子域名共享Cookie）
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join('.')}`;
  }

  return hostname;
};

/**
 * 获取API基础URL
 */
const getApiBaseUrl = (env: Environment): string => {
  // 🔧 修复：在浏览器环境中，优先检查是否为localhost
  // 如果是localhost，默认走前端代理 /api（代理目标 8080）
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && env === Environment.Development) {
      // localhost开发环境：使用代理路径，必要时可通过环境变量覆盖
      return process.env.REACT_APP_DEV_API_URL || '/api';
    }
  }

  // 优先使用环境变量（但localhost环境已在上面的逻辑中处理）
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 根据环境返回默认值
  switch (env) {
    case Environment.Development:
      // 开发环境：默认使用前端代理 /api，若需要直连可通过 REACT_APP_DEV_API_URL 指定
      return process.env.REACT_APP_DEV_API_URL || '/api';
    case Environment.Staging:
      // 测试环境
      return 'https://staging-api.zhitoujianli.com/api';
    case Environment.Production:
      // 生产环境：使用相对路径，由Nginx代理
      return '/api';
    default:
      return '/api';
  }
};

/**
 * 获取WebSocket基础URL
 */
const getWsBaseUrl = (env: Environment): string => {
  // 优先使用环境变量
  if (process.env.REACT_APP_WS_URL) {
    return process.env.REACT_APP_WS_URL;
  }

  const protocol = isSecureContext() ? 'wss:' : 'ws:';
  const host =
    typeof window !== 'undefined' ? window.location.host : 'localhost';

  // 根据环境返回默认值
  switch (env) {
    case Environment.Development:
      return `${protocol}//${host}/ws`;
    case Environment.Staging:
      return 'wss://staging.zhitoujianli.com/ws';
    case Environment.Production:
      return `wss://${host}/ws`;
    default:
      return `${protocol}//${host}/ws`;
  }
};

/**
 * 创建环境配置
 */
const createConfig = (env: Environment): EnvironmentConfig => {
  const isSecure = isSecureContext();
  const isProduction = env === Environment.Production;

  return {
    apiBaseUrl: getApiBaseUrl(env),
    wsBaseUrl: getWsBaseUrl(env),
    cookieDomain: getCookieDomain(),
    isSecure,
    isProduction,
    requestTimeout: isProduction ? 60000 : 30000, // 生产环境更长的超时时间
    wsMaxReconnectAttempts: 5,
    wsReconnectInterval: 3000,
  };
};

/**
 * 当前环境
 */
const currentEnvironment = getCurrentEnvironment();

/**
 * 当前环境配置（单例）
 */
const config: EnvironmentConfig = createConfig(currentEnvironment);

/**
 * 导出配置
 */
export default config;

/**
 * 导出辅助函数
 */
export { getCookieDomain, getCurrentEnvironment, isSecureContext };

/**
 * 配置常量
 */
export const CONFIG_CONSTANTS = {
  /** Token存储键名 */
  TOKEN_KEY: 'token',
  /** 认证Token存储键名（后端兼容） */
  AUTH_TOKEN_KEY: 'authToken',
  /** 用户信息存储键名 */
  USER_KEY: 'user',
  /** Cookie最大存活时间（7天） */
  COOKIE_MAX_AGE: 604800,
} as const;

/**
 * 获取登录页面URL
 */
export const getLoginUrl = (): string => {
  if (typeof window === 'undefined') return '/login';

  const hostname = window.location.hostname;

  // 本地开发环境
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/login';
  }

  // 其他环境统一使用相对路径
  return '/login';
};

/**
 * 打印当前配置（仅开发环境）
 */
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Environment Config:', {
    environment: currentEnvironment,
    ...config,
  });
}
