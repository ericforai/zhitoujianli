import axios, { AxiosInstance } from 'axios';
import config, { CONFIG_CONSTANTS, getLoginUrl } from '../config/environment';

/**
 * API服务配置
 *
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 * @updated 2025-10-11 - 使用统一配置管理
 */

/**
 * 创建axios实例
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.requestTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器：添加认证Token
 */
apiClient.interceptors.request.use(
  requestConfig => {
    // 从localStorage获取token
    const token =
      localStorage.getItem(CONFIG_CONSTANTS.TOKEN_KEY) ||
      localStorage.getItem(CONFIG_CONSTANTS.AUTH_TOKEN_KEY);

    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    return requestConfig;
  },
  error => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器：处理401错误和302重定向
 */
apiClient.interceptors.response.use(
  response => response,
  error => {
    // 处理网络错误或者无响应的情况
    if (!error.response) {
      console.error('网络错误或服务器无响应:', error.message);
      return Promise.reject(error);
    }

    // 检查是否是认证相关的错误
    if (
      error.response?.status === 401 ||
      error.response?.status === 302 ||
      (error.response?.data?.message &&
        (error.response.data.message.includes('需要登录认证') ||
          error.response.data.message.includes('用户未登录')))
    ) {
      console.log('🔐 检测到认证错误，清除本地存储并重定向到登录页');

      // Token过期或无效，清除本地存储
      localStorage.removeItem(CONFIG_CONSTANTS.TOKEN_KEY);
      localStorage.removeItem(CONFIG_CONSTANTS.AUTH_TOKEN_KEY);
      localStorage.removeItem(CONFIG_CONSTANTS.USER_KEY);

      // 如果不在登录页，跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = getLoginUrl();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
