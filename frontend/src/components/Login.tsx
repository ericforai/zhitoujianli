/**
 * 登录页面组件
 *
 * 支持邮箱密码登录
 *
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 * @updated 2025-10-16 - 简化登录方式，只保留邮箱登录
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
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        {/* Logo和标题 */}
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-gray-900'>智投简历</h1>
          <p className='mt-2 text-sm text-gray-600'>智能化求职投递平台</p>
        </div>

        {/* 登录卡片 */}
        <div className='bg-white rounded-lg shadow-lg p-8'>
          {/* 登录标题 */}
          <div className='text-center mb-6'>
            <h2 className='text-2xl font-bold text-gray-900'>邮箱登录</h2>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm'>
              {error}
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm'>
              {success}
            </div>
          )}

          {/* 邮箱登录表单 */}
          <form onSubmit={handleEmailLogin} className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                邮箱地址
              </label>
              <input
                id='email'
                type='email'
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                placeholder='your@email.com'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                密码
              </label>
              <input
                id='password'
                type='password'
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                placeholder='至少6位'
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          {/* 注册链接 */}
          <div className='mt-6 text-center'>
            <span className='text-sm text-gray-600'>还没有账号？</span>
            <a
              href='/register'
              className='ml-1 text-sm font-medium text-indigo-600 hover:text-indigo-500'
            >
              立即注册
            </a>
          </div>
        </div>

        {/* 底部提示 */}
        <div className='text-center text-xs text-gray-500'>
          <p>登录即表示同意</p>
          <a href='/terms' className='text-indigo-600 hover:underline'>
            用户协议
          </a>
          <span> 和 </span>
          <a href='/privacy' className='text-indigo-600 hover:underline'>
            隐私政策
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
