/**
 * Authing 身份认证配置
 *
 * 按照Authing官方文档V4规范配置
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import { AuthenticationClient } from 'authing-js-sdk';

// Authing配置信息
const AUTHING_CONFIG = {
  // 应用ID - 在Authing控制台中获取
  appId: process.env.REACT_APP_AUTHING_APP_ID || '',

  // 应用域名 - 格式: https://your-domain.authing.cn
  appHost: process.env.REACT_APP_AUTHING_APP_HOST || '',

  // 重定向URI - 登录成功后的跳转地址
  redirectUri: process.env.REACT_APP_AUTHING_REDIRECT_URI || window.location.origin + '/login',

  // 登出重定向URI
  logoutRedirectUri: process.env.REACT_APP_AUTHING_LOGOUT_REDIRECT_URI || window.location.origin + '/login',

  // 作用域 - 请求的权限范围
  scope: 'openid profile email phone',

  // 响应类型
  responseType: 'code'
};

/**
 * 创建Authing认证客户端实例
 * 按照官方文档V4规范初始化
 */
export const createAuthingClient = (): AuthenticationClient => {
  try {
    // 检查必要的配置项
    if (!AUTHING_CONFIG.appId) {
      throw new Error('AUTHING_APP_ID未配置，请在.env文件中设置REACT_APP_AUTHING_APP_ID');
    }

    if (!AUTHING_CONFIG.appHost) {
      throw new Error('AUTHING_APP_HOST未配置，请在.env文件中设置REACT_APP_AUTHING_APP_HOST');
    }

    // 创建认证客户端 - 使用V4 API
    const authClient = new AuthenticationClient({
      appId: AUTHING_CONFIG.appId,
      appHost: AUTHING_CONFIG.appHost,
      redirectUri: AUTHING_CONFIG.redirectUri,
      logoutRedirectUri: AUTHING_CONFIG.logoutRedirectUri,
      scope: AUTHING_CONFIG.scope,
      responseType: AUTHING_CONFIG.responseType
    } as any);

    console.log('✅ Authing客户端初始化成功');
    console.log('📝 应用ID:', AUTHING_CONFIG.appId);
    console.log('🌐 应用域名:', AUTHING_CONFIG.appHost);
    console.log('🔗 重定向URI:', AUTHING_CONFIG.redirectUri);

    return authClient;
  } catch (error) {
    console.error('❌ Authing客户端初始化失败:', error);
    throw error;
  }
};

// 导出配置信息
export { AUTHING_CONFIG };

// 导出默认的认证客户端实例
export const authingClient = createAuthingClient();
