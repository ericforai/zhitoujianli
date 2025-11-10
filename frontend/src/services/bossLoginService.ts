/**
 * Boss本地登录服务
 *
 * 提供Boss直聘本地登录和Cookie管理功能
 * 支持完整的多租户隔离
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-06
 */

import axios from 'axios';
import config, { CONFIG_CONSTANTS } from '../config/environment';

/**
 * Cookie数据接口
 */
export interface BossCookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
}

/**
 * Cookie上传请求
 */
export interface CookieUploadRequest {
  cookies: BossCookie[];
}

/**
 * Cookie上传响应
 */
export interface CookieUploadResponse {
  success: boolean;
  message: string;
  userId?: string;
  safeUserId?: string;
  cookiePath?: string;
  cookieCount?: number;
}

/**
 * Cookie状态响应
 */
export interface CookieStatusResponse {
  success: boolean;
  hasCookie: boolean;
  isValid?: boolean;
  userId?: string;
  cookiePath?: string;
  cookieCount?: number;
  message?: string;
}

/**
 * 登录引导信息
 */
export interface LoginGuide {
  success: boolean;
  userId?: string;
  guide?: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
    step6: string;
  };
  loginUrl?: string;
  extractScript?: string;
}

/**
 * 创建Boss登录服务专用的axios实例
 */
const bossLoginApiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.requestTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器：添加认证Token
 */
bossLoginApiClient.interceptors.request.use(
  requestConfig => {
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
 * Boss本地登录服务
 */
export const bossLoginService = {
  /**
   * 上传Boss Cookie
   *
   * @param cookies Cookie列表
   * @returns 上传结果
   */
  uploadCookie: async (
    cookies: BossCookie[]
  ): Promise<CookieUploadResponse> => {
    try {
      const response = await bossLoginApiClient.post<CookieUploadResponse>(
        '/boss/local-login/cookie/upload',
        { cookies }
      );
      console.log('✅ Cookie上传成功:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Cookie上传失败:', error);
      throw new Error(
        error.response?.data?.message || 'Cookie上传失败，请重试'
      );
    }
  },

  /**
   * 检查Cookie状态
   *
   * @returns Cookie状态信息
   */
  checkCookieStatus: async (): Promise<CookieStatusResponse> => {
    try {
      const response = await bossLoginApiClient.get<CookieStatusResponse>(
        '/boss/local-login/cookie/status'
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ 检查Cookie状态失败:', error);
      throw new Error(error.response?.data?.message || '检查Cookie状态失败');
    }
  },

  /**
   * 清除Boss Cookie
   *
   * @returns 清除结果
   */
  clearCookie: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await bossLoginApiClient.delete(
        '/boss/local-login/cookie/clear'
      );
      console.log('✅ Cookie已清除:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ 清除Cookie失败:', error);
      throw new Error(error.response?.data?.message || '清除Cookie失败');
    }
  },

  /**
   * 获取登录引导信息
   *
   * @returns 登录引导
   */
  getLoginGuide: async (): Promise<LoginGuide> => {
    try {
      const response = await bossLoginApiClient.get<LoginGuide>(
        '/boss/local-login/guide'
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ 获取登录引导失败:', error);
      throw new Error(error.response?.data?.message || '获取登录引导失败');
    }
  },

  /**
   * 在新窗口打开Boss登录页
   */
  openBossLoginPage: (): void => {
    const loginUrl = 'https://www.zhipin.com/web/user/?ka=header-login';
    const width = 1200;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      loginUrl,
      'BossLogin',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );
  },

  /**
   * 解析Cookie字符串为Cookie对象数组
   *
   * @param cookieString Cookie字符串或JSON
   * @returns Cookie数组
   */
  parseCookieString: (cookieString: string): BossCookie[] => {
    try {
      // 尝试解析为JSON
      const parsed = JSON.parse(cookieString);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      // 如果是单个对象，转为数组
      return [parsed];
    } catch (e) {
      // 不是JSON，尝试解析Cookie字符串格式
      return cookieString.split(';').map(cookie => {
        const trimmed = cookie.trim();
        const index = trimmed.indexOf('=');
        if (index === -1) {
          return { name: trimmed, value: '' };
        }
        return {
          name: trimmed.substring(0, index).trim(),
          value: trimmed.substring(index + 1).trim(),
          domain: '.zhipin.com',
          path: '/',
        };
      });
    }
  },

  /**
   * 验证Cookie是否有效
   *
   * @param cookies Cookie列表
   * @returns 是否有效
   */
  validateCookies: (
    cookies: BossCookie[]
  ): {
    valid: boolean;
    message: string;
  } => {
    if (!cookies || cookies.length === 0) {
      return { valid: false, message: 'Cookie列表为空' };
    }

    // 检查是否包含关键Cookie
    const hasWt2 = cookies.some(c => c.name === 'wt2');

    if (!hasWt2) {
      return {
        valid: false,
        message: '缺少关键Cookie: wt2，请确保已成功登录Boss直聘',
      };
    }

    return { valid: true, message: 'Cookie有效' };
  },

  /**
   * 获取Cookie提取脚本
   *
   * @returns JavaScript代码片段
   */
  getCookieExtractScript: (): string => {
    return `// 在Boss登录页的Console中执行以下代码
JSON.stringify(
  document.cookie.split('; ').map(c => {
    const [name, value] = c.split('=');
    return {
      name,
      value,
      domain: '.zhipin.com',
      path: '/'
    };
  })
)`;
  },

  /**
   * 启动服务器端扫码登录
   *
   * @returns 启动结果
   */
  startServerLogin: async (): Promise<{
    success: boolean;
    message: string;
    userId?: string;
    logFile?: string;
  }> => {
    try {
      const response = await bossLoginApiClient.post<{
        success: boolean;
        message: string;
        userId?: string;
        logFile?: string;
      }>('/boss/local-login/start-server-login');
      console.log('✅ 服务器端扫码登录已启动:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ 启动服务器端扫码登录失败:', error);
      throw new Error(
        error.response?.data?.message || '启动扫码登录失败，请重试'
      );
    }
  },

  /**
   * 获取二维码图片
   *
   * @returns 二维码图片数据
   */
  getQRCode: async (): Promise<{
    success: boolean;
    hasQRCode: boolean;
    imageData?: string;
    message?: string;
  }> => {
    try {
      const response = await bossLoginApiClient.get<{
        success: boolean;
        hasQRCode: boolean;
        imageData?: string;
        message?: string;
      }>('/boss/local-login/qrcode');
      return response.data;
    } catch (error: any) {
      console.error('❌ 获取二维码失败:', error);
      throw new Error(
        error.response?.data?.message || '获取二维码失败，请重试'
      );
    }
  },

  /**
   * 获取登录状态
   *
   * @returns 登录状态信息
   */
  getLoginStatus: async (): Promise<{
    success: boolean;
    status: string;
    message?: string;
    hasCookie?: boolean;
  }> => {
    try {
      const response = await bossLoginApiClient.get<{
        success: boolean;
        status: string;
        message?: string;
        hasCookie?: boolean;
      }>('/boss/local-login/login-status');
      return response.data;
    } catch (error: any) {
      console.error('❌ 获取登录状态失败:', error);
      throw new Error(
        error.response?.data?.message || '获取登录状态失败，请重试'
      );
    }
  },
};

export default bossLoginService;
