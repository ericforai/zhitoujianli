/**
 * 环境配置文件
 *
 * 统一管理所有环境相关的配置，避免硬编码
 * 支持开发、测试、生产环境的自动切换
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-10
 */

/**
 * 环境类型
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * API配置接口
 */
interface ApiConfig {
  baseURL: string;
  domain: string;
  isProduction: boolean;
  isSecure: boolean;
  timeout: {
    default: number;
    upload: number;
    parse: number;
    delivery: number;
  };
}

/**
 * 获取当前环境
 */
function getCurrentEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV;
  const customEnv = process.env.REACT_APP_ENV;

  if (customEnv === 'production') return 'production';
  if (customEnv === 'staging') return 'staging';
  if (nodeEnv === 'production') return 'production';

  return 'development';
}

/**
 * 环境配置
 */
const ENV = getCurrentEnvironment();

/**
 * 根据环境自动配置API地址和域名
 */
function getApiConfig(): ApiConfig {
  const hostname =
    typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const protocol =
    typeof window !== 'undefined' ? window.location.protocol : 'http:';

  // 开发环境配置
  if (ENV === 'development') {
    return {
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
      domain: 'localhost',
      isProduction: false,
      isSecure: false,
      timeout: {
        default: 20000,
        upload: 90000,
        parse: 45000,
        delivery: 180000,
      },
    };
  }

  // 生产环境配置
  if (ENV === 'production') {
    return {
      // 🔧 修复：使用 /api 路径，由 Nginx 代理到后端 8080 端口
      baseURL: process.env.REACT_APP_API_URL || '/api',
      domain: hostname,
      isProduction: true,
      isSecure: protocol === 'https:',
      timeout: {
        default: 30000,
        upload: 120000,
        parse: 60000,
        delivery: 300000,
      },
    };
  }

  // 测试环境配置
  return {
    baseURL:
      process.env.REACT_APP_API_URL || 'http://staging.zhitoujianli.com:8080',
    domain: 'staging.zhitoujianli.com',
    isProduction: false,
    isSecure: false,
    timeout: {
      default: 10000,
      upload: 60000,
      parse: 30000,
      delivery: 120000,
    },
  };
}

/**
 * API配置导出
 */
export const API_CONFIG = getApiConfig();

/**
 * 当前环境
 */
export const CURRENT_ENV = ENV;

/**
 * 是否为开发环境
 */
export const isDevelopment = ENV === 'development';

/**
 * 是否为生产环境
 */
export const isProduction = ENV === 'production';

/**
 * 是否为测试环境
 */
export const isStaging = ENV === 'staging';

/**
 * 获取完整的API URL
 */
export function getApiUrl(path: string): string {
  // 确保path以/开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_CONFIG.baseURL}${normalizedPath}`;
}

/**
 * 获取WebSocket URL
 */
export function getWebSocketUrl(path: string): string {
  const wsProtocol = API_CONFIG.isSecure ? 'wss:' : 'ws:';
  const baseUrl = API_CONFIG.baseURL.replace(/^https?:/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${wsProtocol}${baseUrl}${normalizedPath}`;
}

/**
 * 日志配置
 */
export const LOG_CONFIG = {
  enabled: !isProduction, // 生产环境禁用console日志
  level: isProduction ? 'error' : 'debug',
};

/**
 * Cookie配置
 */
export const COOKIE_CONFIG = {
  domain: API_CONFIG.domain,
  secure: API_CONFIG.isSecure,
  sameSite: 'Lax' as const,
  path: '/',
};

/**
 * 存储键名
 */
export const STORAGE_KEYS = {
  token: 'token',
  authToken: 'authToken',
  user: 'user',
  refreshToken: 'refreshToken',
} as const;

/**
 * 应用配置
 */
export const APP_CONFIG = {
  name: '智投简历',
  version: '1.0.0',
  description: '智能化求职投递平台',
} as const;

export default API_CONFIG;
