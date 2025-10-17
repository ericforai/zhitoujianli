/**
 * 开发环境代理配置
 *
 * 将前端的 /api 请求代理到后端服务器
 * 解决跨域问题，统一API请求路径
 *
 * ✅ 修复 CORS 问题：
 * - 自动转发所有 /api 请求到后端
 * - 修改 Origin 头部，避免跨域限制
 * - 支持 HTTPS 和 HTTP 后端
 *
 * @updated 2025-10-16
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // 代理所有 /api 开头的请求到后端服务器
  app.use(
    '/api',
    createProxyMiddleware({
      // 优先使用环境变量，否则使用默认的本地后端地址
      target: process.env.REACT_APP_BACKEND_URL || 'https://zhitoujianli.com',
      changeOrigin: true, // ✅ 修改 Origin 头部为目标 URL
      secure: false, // ✅ 支持自签名 SSL 证书
      logLevel: 'debug',
      // ✅ 支持 WebSocket（如果需要）
      ws: true,
      // ✅ 错误处理
      onError: function (err, req, res) {
        console.error('❌ 代理错误:', err.message);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(
          JSON.stringify({
            success: false,
            message: '代理服务器错误，请检查后端是否运行',
            error: err.message,
          })
        );
      },
      // ✅ 请求日志
      onProxyReq: function (proxyReq, req) {
        const target =
          process.env.REACT_APP_BACKEND_URL || 'https://zhitoujianli.com';
        console.log(
          '🔄 代理请求:',
          req.method,
          req.url,
          '->',
          target + req.url
        );
      },
      // ✅ 响应日志
      onProxyRes: function (proxyRes, req) {
        console.log('✅ 代理响应:', proxyRes.statusCode, req.url);
        // 添加 CORS 头部（作为备份保护）
        proxyRes.headers['Access-Control-Allow-Origin'] =
          'http://localhost:3000';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      },
    })
  );
};
