import { defineConfig } from 'vite';

export default defineConfig({
  preview: {
    host: true, // 允许所有主机访问
    port: 4321,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'blog.zhitoujianli.com',
      'zhitoujianli.com',
      'www.zhitoujianli.com'
    ],
  },
  server: {
    host: true, // 开发模式也允许所有主机访问
    port: 4321,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'blog.zhitoujianli.com',
      'zhitoujianli.com',
      'www.zhitoujianli.com'
    ],
  },
});
