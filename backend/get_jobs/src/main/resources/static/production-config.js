/**
 * 生产环境配置文件
 *
 * 用于在浏览器中动态设置生产环境的 API 配置
 * 确保所有请求都使用 HTTPS 协议
 */

(function () {
  'use strict';

  const hostname = window.location.hostname;

  // 检查是否为生产域名
  const isProductionDomain =
    hostname === 'zhitoujianli.com' || hostname === 'www.zhitoujianli.com';

  // 检查是否为IP地址（包括公网IP和内网IP）
  const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);

  if (isProductionDomain || isIPAddress) {
    // 生产环境或IP访问：使用相对路径
    window.__PRODUCTION_CONFIG__ = {
      API_BASE_URL: '/api',
      WS_BASE_URL: 'ws://' + hostname + '/ws',
      IS_SECURE: window.location.protocol === 'https:',
      ENVIRONMENT: isProductionDomain ? 'production' : 'development',
    };

    console.log('🔧 配置已加载:', window.__PRODUCTION_CONFIG__);
  } else {
    // 开发环境
    window.__PRODUCTION_CONFIG__ = {
      API_BASE_URL: '/api',
      WS_BASE_URL: 'ws://localhost:3000/ws',
      IS_SECURE: false,
      ENVIRONMENT: 'development',
    };

    console.log('🔧 开发环境配置已加载:', window.__PRODUCTION_CONFIG__);
  }
})();
