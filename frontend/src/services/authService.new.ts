/**
 * 身份认证服务 - 重构版本
 *
 * 提供前端调用后端认证API的方法
 * 自动处理Token存储和请求头添加
 * 重构后消除重复代码，提高可维护性
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-10
 */

import { COOKIE_CONFIG, STORAGE_KEYS } from '../config/env';
import logger from '../utils/logger';
import { defaultClient } from './httpClient';

// 创建专用的auth logger
const authLogger = logger.createChild('Auth');

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
 * 认证服务类
 */
class AuthService {
  /**
   * 保存认证信息（统一处理）
   *
   * @param token - 访问令牌
   * @param user - 用户信息
   * @param refreshToken - 刷新令牌（可选）
   */
  private saveAuthData(
    token: string,
    user?: User,
    refreshToken?: string
  ): void {
    try {
      // 存储Token到localStorage
      localStorage.setItem(STORAGE_KEYS.token, token);
      localStorage.setItem(STORAGE_KEYS.authToken, token); // 兼容后端使用的key

      // 设置跨域Cookie
      const cookieValue = `${STORAGE_KEYS.authToken}=${token}; path=${COOKIE_CONFIG.path}; domain=${COOKIE_CONFIG.domain}; secure=${COOKIE_CONFIG.secure}; SameSite=${COOKIE_CONFIG.sameSite}`;
      document.cookie = cookieValue;

      authLogger.debug('已设置authToken Cookie', {
        domain: COOKIE_CONFIG.domain,
        secure: COOKIE_CONFIG.secure,
      });

      // 存储刷新令牌
      if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
      }

      // 存储用户信息
      if (user) {
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
      }

      authLogger.info('认证信息已保存', { userId: user?.userId });
    } catch (error) {
      authLogger.error('保存认证信息失败', error);
      throw new Error('保存认证信息失败');
    }
  }

  /**
   * 清除认证信息
   */
  private clearAuthData(): void {
    try {
      // 清除localStorage
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.authToken);
      localStorage.removeItem(STORAGE_KEYS.user);
      localStorage.removeItem(STORAGE_KEYS.refreshToken);

      // 清除Cookie
      document.cookie = `${STORAGE_KEYS.authToken}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      authLogger.info('认证信息已清除');
    } catch (error) {
      authLogger.error('清除认证信息失败', error);
    }
  }

  /**
   * 邮箱密码登录
   *
   * @param email - 邮箱地址
   * @param password - 密码
   * @returns Promise<LoginResponse> 登录响应
   */
  async loginByEmail(email: string, password: string): Promise<LoginResponse> {
    try {
      authLogger.debug('开始邮箱登录', { email });

      const response = await defaultClient.post<LoginResponse>(
        '/api/auth/login/email',
        { email, password }
      );

      if (response.data.success && response.data.token) {
        this.saveAuthData(
          response.data.token,
          response.data.user,
          response.data.refreshToken
        );
        authLogger.info('邮箱登录成功', { email });
      } else {
        authLogger.warn('邮箱登录失败', {
          email,
          message: response.data.message,
        });
      }

      return response.data;
    } catch (error: any) {
      authLogger.error('邮箱登录异常', { email, error: error.message });
      throw error;
    }
  }

  /**
   * 发送手机验证码
   *
   * @param phone - 手机号
   * @returns Promise 发送结果
   */
  async sendPhoneCode(
    phone: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      authLogger.debug('发送手机验证码', { phone });

      const response = await defaultClient.post('/api/auth/send-code', {
        phone,
      });

      authLogger.info('验证码发送成功', { phone });
      return response.data;
    } catch (error: any) {
      authLogger.error('验证码发送失败', { phone, error: error.message });
      throw error;
    }
  }

  /**
   * 手机号验证码登录
   *
   * @param phone - 手机号
   * @param code - 验证码
   * @returns Promise<LoginResponse> 登录响应
   */
  async loginByPhone(phone: string, code: string): Promise<LoginResponse> {
    try {
      authLogger.debug('开始手机号登录', { phone });

      const response = await defaultClient.post<LoginResponse>(
        '/api/auth/login/phone',
        { phone, code }
      );

      if (response.data.success && response.data.token) {
        this.saveAuthData(
          response.data.token,
          response.data.user,
          response.data.refreshToken
        );
        authLogger.info('手机号登录成功', { phone });
      } else {
        authLogger.warn('手机号登录失败', {
          phone,
          message: response.data.message,
        });
      }

      return response.data;
    } catch (error: any) {
      authLogger.error('手机号登录异常', { phone, error: error.message });
      throw error;
    }
  }

  /**
   * 验证邮箱验证码
   */
  async verifyEmailCode(
    email: string,
    verificationCode: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await defaultClient.post('/api/auth/verify-code', {
        email,
        code: verificationCode,
      });
      return response.data;
    } catch (error: any) {
      authLogger.error('邮箱验证码验证失败', error);
      throw error;
    }
  }

  /**
   * 验证手机验证码
   */
  async verifyPhoneCode(
    phone: string,
    verificationCode: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await defaultClient.post('/api/auth/verify-phone-code', {
        phone,
        code: verificationCode,
      });
      return response.data;
    } catch (error: any) {
      authLogger.error('手机验证码验证失败', error);
      throw error;
    }
  }

  /**
   * 邮箱密码注册
   */
  async register(
    email: string,
    password: string,
    username?: string
  ): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      authLogger.debug('开始邮箱注册', { email, username });

      const response = await defaultClient.post('/api/auth/register', {
        email,
        password,
        username,
      });

      authLogger.info('邮箱注册成功', { email });
      return response.data;
    } catch (error: any) {
      authLogger.error('邮箱注册失败', { email, error: error.message });
      throw error;
    }
  }

  /**
   * 手机号密码注册
   */
  async registerByPhone(
    phone: string,
    password: string,
    username?: string
  ): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      authLogger.debug('开始手机号注册', { phone, username });

      const response = await defaultClient.post('/api/auth/register/phone', {
        phone,
        password,
        username,
      });

      authLogger.info('手机号注册成功', { phone });
      return response.data;
    } catch (error: any) {
      authLogger.error('手机号注册失败', { phone, error: error.message });
      throw error;
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      authLogger.debug('开始登出');

      // 调用后端登出接口
      await defaultClient.post('/api/auth/logout');
    } catch (error) {
      authLogger.error('登出请求失败', error);
    } finally {
      // 无论请求是否成功，都清除本地数据
      this.clearAuthData();

      // 跳转到登录页
      window.location.href = '/login';
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await defaultClient.get<{
        success: boolean;
        user: User;
      }>('/api/auth/user/info');

      if (response.data.success && response.data.user) {
        // 更新本地缓存
        localStorage.setItem(
          STORAGE_KEYS.user,
          JSON.stringify(response.data.user)
        );
        authLogger.debug('获取用户信息成功', {
          userId: response.data.user.userId,
        });
        return response.data.user;
      }

      return null;
    } catch (error) {
      authLogger.error('获取用户信息失败', error);
      return null;
    }
  }

  /**
   * 刷新Token
   */
  async refreshToken(refreshToken: string): Promise<string | null> {
    try {
      authLogger.debug('开始刷新Token');

      const response = await defaultClient.post<LoginResponse>(
        '/api/auth/refresh',
        { refreshToken }
      );

      if (response.data.success && response.data.token) {
        localStorage.setItem(STORAGE_KEYS.token, response.data.token);
        authLogger.info('Token刷新成功');
        return response.data.token;
      }

      return null;
    } catch (error) {
      authLogger.error('刷新Token失败', error);
      return null;
    }
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    return localStorage.getItem(STORAGE_KEYS.token) !== null;
  }

  /**
   * 获取Token
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.token);
  }

  /**
   * 获取缓存的用户信息
   */
  getCachedUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.user);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        authLogger.error('解析用户信息失败', error);
        return null;
      }
    }
    return null;
  }

  /**
   * 检查Authing健康状态
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await defaultClient.get('/api/auth/health');
      return response.data.authingConfigured === true;
    } catch (error) {
      authLogger.error('检查健康状态失败', error);
      return false;
    }
  }
}

/**
 * 导出单例
 */
export const authService = new AuthService();

export default authService;
