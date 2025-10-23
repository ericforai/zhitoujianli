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
import Button from './common/Button';
import Card from './common/Card';
import Container from './common/Container';
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
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12'>
      <Container size='lg'>
        {/* Logo和标题 */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>智投简历</h1>
          <p className='text-gray-600'>智能化求职投递平台</p>
        </div>

        {/* 登录卡片 */}
        <Card padding='lg' className='max-w-xl mx-auto w-full sm:w-auto'>
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
          <form
            onSubmit={handleEmailLogin}
            className='space-y-6 max-w-md mx-auto'
          >
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                邮箱地址
              </label>
              <input
                id='email'
                type='email'
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-base min-h-[48px] sm:min-h-[52px]'
                placeholder='your@email.com'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                密码
              </label>
              <input
                id='password'
                type='password'
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-base min-h-[48px] sm:min-h-[52px]'
                placeholder='至少6位'
              />
            </div>

            <Button
              type='submit'
              disabled={loading}
              variant='primary'
              size='lg'
              className='w-full'
              loading={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          {/* 注册链接 */}
          <div className='mt-6 text-center'>
            <span className='text-sm text-gray-600'>还没有账号？</span>
            <a
              href='/register'
              className='ml-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200'
            >
              立即注册
            </a>
          </div>
        </Card>

        {/* 底部提示 */}
        <div className='text-center text-xs text-gray-500 mt-8'>
          <p className='mb-1'>登录即表示同意</p>
          <div>
            <a
              href='/terms'
              className='text-blue-600 hover:text-blue-700 transition-colors duration-200'
            >
              用户协议
            </a>
            <span className='mx-1'>和</span>
            <a
              href='/privacy'
              className='text-blue-600 hover:text-blue-700 transition-colors duration-200'
            >
              隐私政策
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Login;
