/**
 * 生产环境配置文件
 *
 * 用于在浏览器中动态设置生产环境的 API 配置
 * 确保所有请求都使用 HTTPS 协议
 */

(function () {
  'use strict';

  // 检查当前是否为生产环境
  const isProduction =
    window.location.hostname === 'zhitoujianli.com' ||
    window.location.hostname === 'www.zhitoujianli.com';

  if (isProduction) {
    // 生产环境配置
    window.__PRODUCTION_CONFIG__ = {
      API_BASE_URL: 'https://zhitoujianli.com/api',
      WS_BASE_URL: 'wss://zhitoujianli.com/ws',
      IS_SECURE: true,
      ENVIRONMENT: 'production',
    };

    console.log('🔧 生产环境配置已加载:', window.__PRODUCTION_CONFIG__);
  } else {
    // 开发环境配置
    window.__PRODUCTION_CONFIG__ = {
      API_BASE_URL: '/api',
      WS_BASE_URL: 'ws://localhost:3000/ws',
      IS_SECURE: false,
      ENVIRONMENT: 'development',
    };

    console.log('🔧 开发环境配置已加载:', window.__PRODUCTION_CONFIG__);
  }
})();

