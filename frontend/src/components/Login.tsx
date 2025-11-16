/**
 * 登录页面组件 - 现代化设计版本
 *
 * 采用玻璃拟态 + 微阴影 + 渐变主按钮的视觉风格
 * 支持邮箱密码登录，具有现代化的UI/UX设计
 *
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 * @updated 2025-01-15 - 全新现代化UI设计
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from './seo/SEOHead';
import logger from '../utils/logger';
import './Login.css';

const loginLogger = logger.createChild('Login');

const Login: React.FC = () => {
  const { login: authLogin } = useAuth();

  // 邮箱登录状态
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 通用状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * 邮箱密码登录
   * 🔧 修复：使用AuthContext的login方法，跳转由Context处理
   */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      loginLogger.info('开始邮箱登录', { email });

      // 使用AuthContext的login方法
      // 登录成功后会自动跳转，由AuthContext处理
      await authLogin(email, password);

      setSuccess('登录成功！正在跳转...');
      loginLogger.info('邮箱登录成功');
    } catch (err: unknown) {
      // ✅ 修复：定义错误类型，避免使用any
      interface ApiError {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      }

      const error = err as ApiError;
      loginLogger.error('登录失败', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        '登录失败，请稍后重试';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead path='/login' />
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-6 px-4'>
        <div className='w-full max-w-md'>
          {/* 返回首页按钮 */}
          <div className='mb-4'>
            <a
              href='/'
              className='inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200'
            >
              <svg
                className='w-5 h-5 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
              <span className='font-medium'>返回首页</span>
            </a>
          </div>

          {/* Logo和标题 - 水平排列 */}
          <a href='/' className='flex items-center gap-2 mb-6 animate-fade-in'>
            {/* Logo图片（与品牌统一） */}
            <img
              src='/images/logo-plane.png'
              alt='智投简历Logo'
              className='flex-shrink-0 align-middle w-10 h-10 rounded-xl shadow-lg object-contain'
            />
            {/* 文字内容 */}
            <div className='flex flex-col justify-center min-h-[40px] leading-none'>
              <h1 className='text-2xl md:text-3xl font-bold text-gray-900 font-inter leading-none'>
                智投简历
              </h1>
              <p className='text-gray-600 text-sm md:text-base font-medium leading-none'>
                智能化求职投递平台
              </p>
            </div>
          </a>

          {/* 登录卡片 - 玻璃拟态效果 */}
          <div className='bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6'>
            <div className='text-center mb-6'>
              <h2 className='text-xl font-bold text-gray-900 font-inter'>
                邮箱登录
              </h2>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className='mb-4 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl text-red-700 text-sm font-medium'>
                {error}
              </div>
            )}

            {/* 成功提示 */}
            {success && (
              <div className='mb-4 p-3 bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-xl text-green-700 text-sm font-medium'>
                {success}
              </div>
            )}

            {/* 邮箱登录表单 */}
            <form onSubmit={handleEmailLogin} className='space-y-4'>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-semibold text-gray-700 mb-2 font-inter'
                >
                  邮箱地址
                </label>
                <input
                  id='email'
                  type='email'
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className='w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 text-base font-inter placeholder-gray-400 hover:bg-white/80'
                  placeholder='your@email.com'
                />
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-semibold text-gray-700 mb-2 font-inter'
                >
                  密码
                </label>
                <input
                  id='password'
                  type='password'
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className='w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 text-base font-inter placeholder-gray-400 hover:bg-white/80'
                  placeholder='至少6位'
                />
              </div>

              {/* 自定义登录按钮 */}
              <button
                type='submit'
                disabled={loading}
                className='w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-inter text-base'
              >
                {loading ? (
                  <div className='flex items-center justify-center'>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    登录中...
                  </div>
                ) : (
                  '登录'
                )}
              </button>
            </form>

            {/* 注册链接和协议提示 */}
            <div className='mt-6 space-y-3'>
              <div className='text-center'>
                <span className='text-sm text-gray-600 font-inter'>
                  还没有账号？
                </span>
                <a
                  href='/register'
                  className='ml-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200 font-inter'
                >
                  立即注册
                </a>
              </div>
              {/* 底部提示 - 移入卡片内 */}
              <div className='text-center text-xs text-gray-500 font-inter pt-2 border-t border-gray-200/50'>
                <p className='mb-1'>登录即表示同意</p>
                <div className='space-x-1'>
                  <a
                    href='/terms'
                    className='text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200'
                  >
                    用户协议
                  </a>
                  <span>和</span>
                  <a
                    href='/privacy'
                    className='text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200'
                  >
                    隐私政策
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
