/**
 * 身份认证服务
 *
 * 提供前端调用后端认证API的方法
 * 自动处理Token存储和请求头添加
 *
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 * @updated 2025-10-11 - 整合配置管理，改进安全策略
 */

import axios, { AxiosInstance } from 'axios';
import config, {
  CONFIG_CONSTANTS,
  getCookieDomain,
  getLoginUrl,
  isSecureContext,
} from '../config/environment';

/**
 * Token管理类
 */
class TokenManager {
  /**
   * 安全地存储Token
   */
  static saveToken(token: string): void {
    // 存储到localStorage
    localStorage.setItem(CONFIG_CONSTANTS.TOKEN_KEY, token);
    localStorage.setItem(CONFIG_CONSTANTS.AUTH_TOKEN_KEY, token);

    // 设置安全Cookie
    this.setSecureCookie(CONFIG_CONSTANTS.AUTH_TOKEN_KEY, token);
  }

  /**
   * 设置安全的Cookie
   */
  private static setSecureCookie(name: string, value: string): void {
    const domain = getCookieDomain();
    const secure = isSecureContext();
    const sameSite = secure ? 'Strict' : 'Lax';

    // 构建Cookie属性
    const cookieAttributes = [
      `${name}=${value}`,
      'path=/',
      `domain=${domain}`,
      `SameSite=${sameSite}`,
      `max-age=${CONFIG_CONSTANTS.COOKIE_MAX_AGE}`,
    ];

    // 仅在HTTPS环境下添加Secure标记
    if (secure) {
      cookieAttributes.push('Secure');
    } else if (config.isProduction) {
      // 生产环境必须使用HTTPS
      console.warn('⚠️  生产环境应使用HTTPS以确保Cookie安全');
    }

    document.cookie = cookieAttributes.join('; ');

    console.log(
      `🍪 已设置${secure ? '安全' : ''}Cookie: ${name}, domain: ${domain}`
    );
  }

  /**
   * 获取Token
   */
  static getToken(): string | null {
    return localStorage.getItem(CONFIG_CONSTANTS.TOKEN_KEY);
  }

  /**
   * 清除所有Token
   */
  static clearTokens(): void {
    // 清除localStorage
    localStorage.removeItem(CONFIG_CONSTANTS.TOKEN_KEY);
    localStorage.removeItem(CONFIG_CONSTANTS.AUTH_TOKEN_KEY);
    localStorage.removeItem(CONFIG_CONSTANTS.USER_KEY);
    localStorage.removeItem('userType'); // 🔧 清除管理员标识

    // 清除Cookie
    const domain = getCookieDomain();
    document.cookie = `${CONFIG_CONSTANTS.AUTH_TOKEN_KEY}=; path=/; domain=${domain}; max-age=0`;

    console.log('🧹 已清除所有认证信息');
  }

  /**
   * 检查是否已认证
   */
  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

/**
 * 用户管理类
 */
class UserManager {
  /**
   * 保存用户信息
   */
  static saveUser(user: User): void {
    try {
      localStorage.setItem(CONFIG_CONSTANTS.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('保存用户信息失败', error);
    }
  }

  /**
   * 获取缓存的用户信息
   */
  static getCachedUser(): User | null {
    const userStr = localStorage.getItem(CONFIG_CONSTANTS.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('解析用户信息失败', error);
      return null;
    }
  }
}

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
 * 请求拦截器：自动添加Token
 */
apiClient.interceptors.request.use(
  requestConfig => {
    const token = TokenManager.getToken();
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
 * 响应拦截器：处理401错误（Token过期或无效）
 */
apiClient.interceptors.response.use(
  response => response,
  error => {
    // 检查是否是认证相关的错误
    if (
      error.response?.status === 401 ||
      (error.response?.data?.message &&
        (error.response.data.message.includes('需要登录认证') ||
          error.response.data.message.includes('用户未登录')))
    ) {
      console.log('🔐 检测到认证错误，清除本地存储并重定向到登录页');

      // Token过期或无效，清除所有认证信息
      TokenManager.clearTokens();

      // 如果不在登录页，跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = getLoginUrl();
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
  name?: string; // ✅ 修复：添加name属性以支持Navigation组件
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
 * 处理登录响应的通用逻辑
 */
const handleLoginResponse = (response: LoginResponse): LoginResponse => {
  if (response.success && response.token) {
    // 使用TokenManager安全保存Token
    TokenManager.saveToken(response.token);

    // 使用UserManager保存用户信息
    if (response.user) {
      UserManager.saveUser(response.user);
    }

    // ✅ 修复：登录时清理旧的全局存储数据（异步执行，不阻塞登录流程）
    import('./resumes')
      .then(({ cleanupAllOldStorage }) => {
        cleanupAllOldStorage();
      })
      .catch(error => {
        console.warn('清理旧存储失败:', error);
      });

    // 🔧 修复：检查响应中是否包含管理员信息，自动设置userType
    // 如果响应中包含adminType或isAdmin字段，说明是管理员登录
    const userData = response.user as any;
    if (
      userData?.adminType ||
      userData?.isAdmin ||
      (response as any).adminType
    ) {
      localStorage.setItem('userType', 'admin');
      console.log('✅ 检测到管理员登录，已设置userType=admin');
      // 触发自定义事件，通知Navigation组件更新
      window.dispatchEvent(new Event('userTypeChanged'));
    }
  }

  return response;
};

/**
 * 认证服务
 */
export const authService = {
  /**
   * 邮箱密码登录
   * 🔧 修复：自动检测管理员邮箱并调用对应API
   */
  loginByEmail: async (
    email: string,
    password: string
  ): Promise<LoginResponse> => {
    // 检测是否为管理员邮箱
    const isAdmin = email === 'admin@zhitoujianli.com';

    // 🔧 修复：在发送请求之前先设置管理员标识，确保时序正确
    if (isAdmin) {
      localStorage.setItem('userType', 'admin');
      console.log('✅ 预先设置管理员标识: userType=admin');
    }

    const loginEndpoint = isAdmin ? '/admin/auth/login' : '/auth/login/email';
    console.log(
      `🔐 登录检测: ${email} -> ${isAdmin ? '管理员' : '普通用户'} (API: ${loginEndpoint})`
    );

    const response = await apiClient.post<LoginResponse>(loginEndpoint, {
      email,
      password,
    });

    const result = handleLoginResponse(response.data);

    // 🔧 修复：如果使用管理员登录API，确保设置userType
    if (isAdmin && result.success) {
      localStorage.setItem('userType', 'admin');
      console.log('✅ 管理员登录成功，已确认设置userType=admin');
    }

    return result;
  },

  /**
   * 发送邮箱验证码
   */
  sendVerificationCode: async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/send-email-code', { email });
    return response.data;
  },

  /**
   * 发送手机验证码
   */
  sendPhoneCode: async (
    phone: string
  ): Promise<{ success: boolean; message: string }> => {
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

    return handleLoginResponse(response.data);
  },

  /**
   * 验证邮箱验证码
   */
  verifyEmailCode: async (
    email: string,
    verificationCode: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/verify-code', {
      email,
      code: verificationCode,
    });
    return response.data;
  },

  /**
   * 验证手机验证码
   */
  verifyPhoneCode: async (
    phone: string,
    verificationCode: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/verify-phone-code', {
      phone,
      code: verificationCode,
    });
    return response.data;
  },

  /**
   * 邮箱密码注册
   */
  register: async (
    email: string,
    password: string,
    username?: string
  ): Promise<{ success: boolean; message: string; userId?: string }> => {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      username,
    });
    return response.data;
  },

  /**
   * 手机号密码注册
   */
  registerByPhone: async (
    phone: string,
    password: string,
    username?: string
  ): Promise<{ success: boolean; message: string; userId?: string }> => {
    const response = await apiClient.post('/auth/register/phone', {
      phone,
      password,
      username,
    });
    return response.data;
  },

  /**
   * 登出
   * 🔒 安全修复：只清除认证状态，不负责页面跳转
   * 跳转逻辑由调用者（如AuthContext）统一处理，避免双重跳转冲突
   * ✅ 修复：登出时清理用户相关的localStorage数据
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('登出请求失败', error);
      // 即使API失败，也要清除本地状态
    } finally {
      // ✅ 修复：清理用户简历历史记录
      try {
        const { clearUserHistory } = await import('./resumes');
        clearUserHistory();
      } catch (error) {
        console.warn('清理简历历史记录失败:', error);
      }

      // 使用TokenManager清除所有认证信息
      TokenManager.clearTokens();
      // 🔒 安全修复：不在此处跳转，由调用者统一处理
    }
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get<{ success: boolean; user: User }>(
        '/auth/user/info'
      );

      if (response.data.success && response.data.user) {
        // 使用UserManager更新本地缓存
        UserManager.saveUser(response.data.user);
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
        TokenManager.saveToken(response.data.token);
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
    return TokenManager.isAuthenticated();
  },

  /**
   * 获取Token
   */
  getToken: (): string | null => {
    return TokenManager.getToken();
  },

  /**
   * 获取缓存的用户信息
   */
  getCachedUser: (): User | null => {
    return UserManager.getCachedUser();
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
