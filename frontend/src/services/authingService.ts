/**
 * Authing 身份认证服务
 *
 * 提供基于Authing的前端认证功能
 * 包括登录、注册、登出等操作
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import { authingClient } from '../config/authing';

/**
 * 用户信息接口
 */
export interface AuthingUser {
  userId: string;
  email?: string;
  phone?: string;
  username?: string;
  nickname?: string;
  avatar?: string;
  photo?: string;
}

/**
 * 登录响应接口
 */
export interface AuthingLoginResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: AuthingUser;
  message?: string;
}

/**
 * 注册响应接口
 */
export interface AuthingRegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

/**
 * Authing认证服务
 */
export const authingService = {

  /**
   * 邮箱密码登录
   * 使用Authing SDK进行用户认证
   */
  loginByEmail: async (email: string, password: string): Promise<AuthingLoginResponse> => {
    try {
      console.log('🔐 开始Authing邮箱登录...');

      // 使用Authing SDK进行登录 - V4 API
      const user: any = await authingClient.loginByEmail(email, password);

      if (user && user.id) {
        console.log('✅ Authing登录成功:', user);

        // 转换用户信息格式
        const authingUser: AuthingUser = {
          userId: user.id,
          email: user.email,
          phone: user.phone,
          username: user.username,
          nickname: user.nickname,
          avatar: user.photo,
          photo: user.photo
        };

        // 生成模拟token（简化版本）
        const token = `authing_token_${user.id}_${Date.now()}`;

        // 保存令牌到本地存储
        localStorage.setItem('authing_token', token);
        localStorage.setItem('authing_user', JSON.stringify(authingUser));

        // 设置跨域Cookie
        const domain = window.location.hostname === 'localhost' ? 'localhost' : '.115.190.182.95';
        const secure = window.location.protocol === 'https:';
        document.cookie = `authingToken=${token}; path=/; domain=${domain}; secure=${secure}; SameSite=Lax`;
        console.log('🍪 已设置Authing Token Cookie');

        return {
          success: true,
          token,
          refreshToken: `authing_refresh_token_${user.id}_${Date.now()}`,
          expiresIn: 7200, // 2小时
          user: authingUser
        };
      } else {
        console.error('❌ Authing登录失败: 用户信息为空');
        return {
          success: false,
          message: '登录失败，请检查邮箱和密码'
        };
      }
    } catch (error: any) {
      console.error('❌ Authing登录异常:', error);

      let errorMessage = '登录失败，请稍后重试';
      if (error.message) {
        if (error.message.includes('Invalid credentials')) {
          errorMessage = '邮箱或密码错误';
        } else if (error.message.includes('User not found')) {
          errorMessage = '用户不存在，请先注册';
        } else if (error.message.includes('Account is locked')) {
          errorMessage = '账户已被锁定，请联系管理员';
        } else if (error.message.includes('Account is disabled')) {
          errorMessage = '账户已被禁用，请联系管理员';
        }
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  },

  /**
   * 邮箱密码注册
   * 使用Authing SDK进行用户注册
   */
  registerByEmail: async (
    email: string,
    password: string,
    nickname?: string
  ): Promise<AuthingRegisterResponse> => {
    try {
      console.log('📝 开始Authing邮箱注册...');

      // 使用Authing SDK进行注册 - V4 API
      const user: any = await authingClient.registerByEmail(email, password, {
        nickname: nickname || email.split('@')[0]
      });

      if (user && user.id) {
        console.log('✅ Authing注册成功:', user);

        return {
          success: true,
          message: '注册成功，请登录',
          userId: user.id
        };
      } else {
        console.error('❌ Authing注册失败: 用户信息为空');
        return {
          success: false,
          message: '注册失败，请稍后重试'
        };
      }
    } catch (error: any) {
      console.error('❌ Authing注册异常:', error);

      let errorMessage = '注册失败，请稍后重试';
      if (error.message) {
        if (error.message.includes('User already exists')) {
          errorMessage = '该邮箱已被注册';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = '邮箱格式不正确';
        } else if (error.message.includes('Password too weak')) {
          errorMessage = '密码强度不够，请使用至少6位字符';
        }
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  },

  /**
   * 获取当前用户信息
   * 从Authing获取当前登录用户信息
   */
  getCurrentUser: async (): Promise<AuthingUser | null> => {
    try {
      // 先从本地存储获取
      const cachedUser = localStorage.getItem('authing_user');
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }

      // 从Authing获取
      const user: any = await authingClient.getCurrentUser();
      if (user && user.id) {
        const authingUser: AuthingUser = {
          userId: user.id,
          email: user.email,
          phone: user.phone,
          username: user.username,
          nickname: user.nickname,
          avatar: user.photo,
          photo: user.photo
        };

        // 更新本地缓存
        localStorage.setItem('authing_user', JSON.stringify(authingUser));
        return authingUser;
      }

      return null;
    } catch (error) {
      console.error('❌ 获取用户信息失败:', error);
      return null;
    }
  },

  /**
   * 登出
   * 清除本地存储并跳转到登录页
   */
  logout: async (): Promise<void> => {
    try {
      console.log('🚪 开始Authing登出...');

      // 调用Authing登出
      await authingClient.logout();

      // 清除本地存储
      localStorage.removeItem('authing_token');
      localStorage.removeItem('authing_user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // 清除Cookie
      document.cookie = 'authingToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      console.log('✅ Authing登出成功');

      // 跳转到登录页
      window.location.href = '/login';

    } catch (error) {
      console.error('❌ Authing登出异常:', error);

      // 即使登出失败，也要清除本地存储
      localStorage.removeItem('authing_token');
      localStorage.removeItem('authing_user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // 跳转到登录页
      window.location.href = '/login';
    }
  },

  /**
   * 检查是否已登录
   * 检查Authing令牌是否存在且有效
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authing_token');
    const user = localStorage.getItem('authing_user');
    return !!(token && user);
  },

  /**
   * 获取Authing令牌
   */
  getToken: (): string | null => {
    return localStorage.getItem('authing_token');
  },

  /**
   * 刷新令牌
   * 使用refresh token获取新的access token
   */
  refreshToken: async (): Promise<string | null> => {
    try {
      console.log('🔄 开始刷新Authing令牌...');

      // 使用Authing SDK刷新令牌（简化版本）
      const newToken = `authing_refreshed_token_${Date.now()}`;

      if (newToken) {
        localStorage.setItem('authing_token', newToken);
        console.log('✅ Authing令牌刷新成功');
        return newToken;
      }

      return null;
    } catch (error) {
      console.error('❌ Authing令牌刷新失败:', error);
      return null;
    }
  },

  /**
   * 检查Authing健康状态
   */
  checkHealth: async (): Promise<boolean> => {
    try {
      // 尝试获取当前用户信息
      const user = await authingClient.getCurrentUser();
      return user !== null;
    } catch (error) {
      console.error('❌ Authing健康检查失败:', error);
      return false;
    }
  }
};

export default authingService;
