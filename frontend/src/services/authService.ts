/**
 * 身份认证服务
 *
 * 提供前端调用后端认证API的方法
 * 自动处理Token存储和请求头添加
 *
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */

import axios, { AxiosInstance } from 'axios';

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
 * 请求拦截器：自动添加Token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('authToken'); // 清除后端使用的key
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

/**
 * 用户信息接口
 */
export interface User {
  userId: string;
  email?: string;
  phone?: string;
  username?: string;
  avatar?: string;
}

/**
 * 登录响应接口
 */
export interface LoginResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: User;
  message?: string;
}

/**
 * 认证服务
 */
export const authService = {

  /**
   * 邮箱密码登录
   */
  loginByEmail: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login/email', {
      email,
      password,
    });

    if (response.data.success && response.data.token) {
      // 保存Token和用户信息到本地
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('authToken', response.data.token); // 兼容后端使用的key

      // 设置跨域Cookie以便后台管理能够读取Token
      const domain = window.location.hostname === 'localhost' ? 'localhost' : '.115.190.182.95';
      const secure = window.location.protocol === 'https:';
      document.cookie = `authToken=${response.data.token}; path=/; domain=${domain}; secure=${secure}; SameSite=Lax`;
      console.log('🍪 authService: 已设置authToken Cookie为跨域访问, domain:', domain);

      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }

    return response.data;
  },

  /**
   * 发送手机验证码
   */
  sendPhoneCode: async (phone: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/send-code', { phone });
    return response.data;
  },

  /**
   * 手机号验证码登录
   */
  loginByPhone: async (phone: string, code: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login/phone', {
      phone,
      code,
    });

    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('authToken', response.data.token); // 兼容后端使用的key

      // 设置跨域Cookie以便后台管理能够读取Token
      const domain = window.location.hostname === 'localhost' ? 'localhost' : '.115.190.182.95';
      const secure = window.location.protocol === 'https:';
      document.cookie = `authToken=${response.data.token}; path=/; domain=${domain}; secure=${secure}; SameSite=Lax`;
      console.log('🍪 authService: 已设置authToken Cookie为跨域访问, domain:', domain);

      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }

    return response.data;
  },

  /**
   * 邮箱密码注册
   */
  register: async (
    email: string,
    password: string,
    username?: string,
    verificationCode?: string
  ): Promise<{ success: boolean; message: string; userId?: string }> => {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      username,
      verificationCode,
    });
    return response.data;
  },

  /**
   * 登出
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('登出请求失败', error);
    } finally {
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('authToken'); // 清除后端使用的key
      localStorage.removeItem('user');

      // 跳转到登录页
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
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get<{ success: boolean; user: User }>('/auth/user/info');

      if (response.data.success && response.data.user) {
        // 更新本地缓存
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }

      return null;
    } catch (error) {
      console.error('获取用户信息失败', error);
      return null;
    }
  },

  /**
   * 刷新Token
   */
  refreshToken: async (refreshToken: string): Promise<string | null> => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/refresh', {
        refreshToken,
      });

      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        return response.data.token;
      }

      return null;
    } catch (error) {
      console.error('刷新Token失败', error);
      return null;
    }
  },

  /**
   * 检查是否已登录
   */
  isAuthenticated: (): boolean => {
    return localStorage.getItem('token') !== null;
  },

  /**
   * 获取Token
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  /**
   * 获取缓存的用户信息
   */
  getCachedUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('解析用户信息失败', error);
        return null;
      }
    }
    return null;
  },

  /**
   * 检查Authing健康状态
   */
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/auth/health');
      return response.data.authingConfigured === true;
    } catch (error) {
      console.error('检查健康状态失败', error);
      return false;
    }
  },
};

export default apiClient;
