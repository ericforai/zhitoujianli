import type { NextConfig } from "next";

// 启动时安全检查
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('❌ 致命错误: 环境变量 JWT_SECRET 未设置或长度小于32个字符。');
    console.error('出于安全原因，应用将无法启动。');
    throw new Error('JWT_SECRET is not configured correctly. Halting application startup.');
  }
  console.log('✅ JWT_SECRET 环境变量验证通过。');
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
