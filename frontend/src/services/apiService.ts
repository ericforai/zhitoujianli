import axios, { AxiosInstance } from 'axios';

/**
 * API服务配置
 *
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */

// 获取API基础URL
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

/**
 * 创建axios实例
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器：添加认证Token
 */
apiClient.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器：处理401错误（Token过期或无效）
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      // 如果不在登录页，跳转到登录页
      if (window.location.pathname !== '/login') {
        // 动态检测环境并跳转
        if (window.location.hostname === 'localhost') {
          // 本地开发环境
          if (window.location.port === '3000') {
            window.location.href = 'http://115.190.182.95:8080/login';
          } else {
            window.location.href = '/login';
          }
        } else {
          // 生产环境
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
