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
 * @updated 2025-12-19 - 修复504错误和路径重写问题
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // 代理所有 /api 开头的请求到后端服务器
  // ✅ 前端运行在3000，后端在8081（本地开发环境）
  // ⚠️ 注意：如果环境变量设置了错误的URL，强制使用8081
  let backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081';
  
  // ✅ 修复：确保后端URL指向8081端口（本地开发环境）
  if (backendUrl.includes(':8080')) {
    console.warn(`⚠️ 检测到错误的后端URL: ${backendUrl}，强制改为8081`);
    backendUrl = 'http://localhost:8081';
  }
  
  console.log(`[代理配置] 后端URL: ${backendUrl}`);
  
  // ✅ 修复：使用正确的代理配置
  // 当使用app.use('/api', ...)时，http-proxy-middleware会自动移除/api前缀
  // 例如：请求 /api/health -> 传递给代理的路径是 /health
  // 后端期望的路径是 /api/health，所以需要重新添加/api前缀
  app.use(
    '/api',
    createProxyMiddleware({
      target: backendUrl,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug', // 启用详细日志以便调试
      ws: true, // 支持WebSocket
      // ✅ 关键修复：重新添加/api前缀
      // 当使用app.use('/api', ...)时，http-proxy-middleware会移除/api前缀
      // 传入pathRewrite的path参数已经是移除了/api前缀的，例如：/health
      // 需要重新添加/api前缀变成：/api/health
      pathRewrite: function (path, req) {
        // ✅ 修复：统一处理path参数
        // http-proxy-middleware的行为可能不一致：
        // - 有时path是移除了/api前缀的：/local-agent/token
        // - 有时path还包含/api前缀：/api/local-agent/token
        // 需要统一处理，确保最终路径是 /api/xxx 格式
        
        let cleanPath = path;
        
        // 如果path已经以/api开头，先移除
        if (cleanPath.startsWith('/api/')) {
          cleanPath = cleanPath.substring(5); // 移除 '/api/'
        } else if (cleanPath.startsWith('/api')) {
          cleanPath = cleanPath.substring(4); // 移除 '/api'
        }
        
        // 确保cleanPath以/开头
        if (!cleanPath.startsWith('/')) {
          cleanPath = '/' + cleanPath;
        }
        
        // 重新添加/api前缀
        const newPath = '/api' + cleanPath;
        
        // 只在调试时输出日志
        if (path.includes('local-agent') || path.includes('token') || path.includes('status')) {
          console.log(`[路径重写] path: "${path}" -> cleanPath: "${cleanPath}" -> newPath: "${newPath}"`);
        }
        
        return newPath;
      },
      // ✅ 修复504超时问题：增加超时时间
      timeout: 60000, // 60秒超时
      proxyTimeout: 60000, // 代理超时60秒
      // ✅ 添加错误处理
      onError: (err, req, res) => {
        console.error(`❌ 代理错误 [${req.url}]:`, err.message);
        if (!res.headersSent) {
          res.status(500).json({ 
            success: false,
            error: '代理服务器错误', 
            message: err.message 
          });
        }
      },
      // ✅ 添加代理请求监听
      onProxyReq: (proxyReq, req, res) => {
        console.log(`[代理请求] ${req.method} ${req.url} -> ${backendUrl}${req.url}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`[代理响应] ${req.url} -> ${proxyRes.statusCode}`);
      },
    })
  );

  // ✅ 代理 /downloads 请求到后端（用于下载本地Agent等文件）
  app.use(
    '/downloads',
    createProxyMiddleware({
      target: backendUrl,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error(`❌ 下载代理错误 [${req.url}]:`, err.message);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: '下载代理错误',
            message: err.message
          });
        }
      },
    })
  );
};
