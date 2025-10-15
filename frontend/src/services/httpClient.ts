/**
 * 统一的HTTP客户端
 *
 * 提供统一的axios实例配置和拦截器
 * 避免在多个service中重复创建axios实例
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-10
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../config/env';
import logger from '../utils/logger';

/**
 * HTTP客户端类
 */
class HttpClient {
  private client: AxiosInstance;

  constructor(config?: AxiosRequestConfig) {
    // 创建axios实例
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout.default,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    });

    // 设置拦截器
    this.setupInterceptors();
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器：自动添加Token
    this.client.interceptors.request.use(
      config => {
        const token =
          localStorage.getItem(STORAGE_KEYS.token) ||
          localStorage.getItem(STORAGE_KEYS.authToken);

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        logger.debug(`API请求: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      error => {
        logger.error('请求拦截器错误:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器：处理通用错误
    this.client.interceptors.response.use(
      response => {
        logger.debug(`API响应: ${response.config.url}`, response.data);
        return response;
      },
      (error: AxiosError) => {
        return this.handleError(error);
      }
    );
  }

  /**
   * 统一错误处理
   *
   * 🔧 修复：移除自动跳转逻辑，由组件层处理
   */
  private handleError(error: AxiosError): Promise<never> {
    const status = error.response?.status;
    const message = (error.response?.data as any)?.message;

    // 401 未授权 - 静默处理，不显示"需要登录认证"错误
    if (
      status === 401 ||
      (message &&
        (message.includes('需要登录认证') || message.includes('用户未登录')))
    ) {
      logger.warn('检测到401认证错误，清除本地Token');
      // 只清除本地存储，不跳转
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.authToken);
      localStorage.removeItem(STORAGE_KEYS.user);
      localStorage.removeItem(STORAGE_KEYS.refreshToken);

      // 对于注册页面等公开页面，不显示认证错误
      // 直接抛出原始错误，让调用方处理
    }

    // 403 禁止访问
    if (status === 403) {
      logger.error('权限不足，禁止访问');
    }

    // 404 资源不存在
    if (status === 404) {
      logger.error('请求的资源不存在');
    }

    // 500 服务器错误
    if (status === 500) {
      logger.error('服务器内部错误');
    }

    // 网络错误
    if (!error.response) {
      logger.error('网络连接失败，请检查网络设置');
    }

    logger.error('API请求失败:', error.message);
    return Promise.reject(error);
  }

  /**
   * 获取axios实例
   */
  public getInstance(): AxiosInstance {
    return this.client;
  }
}

/**
 * 创建不同超时配置的HTTP客户端
 */

// 默认客户端（10秒超时）
export const defaultClient = new HttpClient().getInstance();

// 上传客户端（60秒超时）
export const uploadClient = new HttpClient({
  timeout: API_CONFIG.timeout.upload,
}).getInstance();

// 解析客户端（30秒超时）
export const parseClient = new HttpClient({
  timeout: API_CONFIG.timeout.parse,
}).getInstance();

// 投递客户端（120秒超时）
export const deliveryClient = new HttpClient({
  timeout: API_CONFIG.timeout.delivery,
}).getInstance();

/**
 * 默认导出
 */
export default defaultClient;
