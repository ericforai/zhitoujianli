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
    } catch (err: any) {
      loginLogger.error('登录失败', err);
      const errorMessage =
        err.response?.data?.message || err.message || '登录失败，请稍后重试';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4'>
      <div className='w-full max-w-md'>
        {/* Logo和标题 - 添加fade-in动画 */}
        <div className='text-center mb-10 animate-fade-in'>
          {/* Logo图标 */}
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4'>
            <svg
              className='w-8 h-8 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </div>
          <h1 className='text-4xl font-bold text-gray-900 mb-2 font-inter'>
            智投简历
          </h1>
          <p className='text-gray-600 text-lg font-medium'>
            智能化求职投递平台
          </p>
        </div>

        {/* 登录卡片 - 玻璃拟态效果 */}
        <div className='bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8'>
          <div className='text-center mb-8'>
            <h2 className='text-2xl font-bold text-gray-900 font-inter'>
              邮箱登录
            </h2>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className='mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl text-red-700 text-sm font-medium'>
              {error}
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className='mb-6 p-4 bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-xl text-green-700 text-sm font-medium'>
              {success}
            </div>
          )}

          {/* 邮箱登录表单 */}
          <form onSubmit={handleEmailLogin} className='space-y-6'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-semibold text-gray-700 mb-3 font-inter'
              >
                邮箱地址
              </label>
              <input
                id='email'
                type='email'
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full px-4 py-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 text-base font-inter placeholder-gray-400 hover:bg-white/80'
                placeholder='your@email.com'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-semibold text-gray-700 mb-3 font-inter'
              >
                密码
              </label>
              <input
                id='password'
                type='password'
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='w-full px-4 py-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 text-base font-inter placeholder-gray-400 hover:bg-white/80'
                placeholder='至少6位'
              />
            </div>

            {/* 自定义登录按钮 */}
            <button
              type='submit'
              disabled={loading}
              className='w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-inter text-lg'
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

          {/* 注册链接 */}
          <div className='mt-8 text-center'>
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
        </div>

        {/* 底部提示 */}
        <div className='text-center text-xs text-gray-500 mt-8 font-inter'>
          <p className='mb-2'>登录即表示同意</p>
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
  );
};

export default Login;
