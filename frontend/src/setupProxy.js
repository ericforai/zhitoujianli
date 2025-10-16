/**
 * 开发环境代理配置
 *
 * 将前端的 /api 请求代理到后端服务器
 * 解决跨域问题，统一API请求路径
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // 代理所有 /api 开头的请求到后端服务器
  app.use(
    '/api',
    createProxyMiddleware({
      // 优先使用环境变量，否则使用默认的本地后端地址
      target: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onError: function (err) {
        console.error('代理错误:', err);
      },
      onProxyReq: function (proxyReq, req) {
        console.log(
          '代理请求:',
          req.method,
          req.url,
          '->',
          process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'
        );
      },
      onProxyRes: function (proxyRes, req) {
        console.log('代理响应:', proxyRes.statusCode, req.url);
      },
    })
  );
};
