/**
 * 注册页面组件
 *
 * 支持邮箱和手机号注册
 *
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */

import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';

type RegisterMode = 'email' | 'phone';

const Register: React.FC = () => {
  const [mode, setMode] = useState<RegisterMode>('email');

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 验证码状态
  const [verificationCode, setVerificationCode] = useState('');
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // 验证码倒计时效果
  useEffect(() => {
    if (codeCountdown > 0) {
      const timer = setTimeout(() => setCodeCountdown(codeCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [codeCountdown]);

  /**
   * 发送验证码（邮箱或手机号）
   */
  const handleSendVerificationCode = async () => {
    if (mode === 'email') {
      if (!email) {
        setError('请先输入邮箱地址');
        return;
      }

      if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
        setError('邮箱格式不正确');
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://115.190.182.95:8080/api'}/auth/send-verification-code`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          }
        );

        const result = await response.json();

        if (result.success) {
          setSuccess('验证码已发送到邮箱');
          setCodeSent(true);
          setCodeCountdown(60); // 60秒倒计时
          setEmailVerified(false); // 重置验证状态
          console.log('验证码:', result.code); // 仅用于演示
        } else {
          setError(result.message || '发送验证码失败');
        }
      } catch (err: any) {
        console.error('发送验证码失败:', err);
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    } else {
      // 手机号验证码
      if (!phone) {
        setError('请先输入手机号');
        return;
      }

      if (!phone.match(/^1[3-9]\d{9}$/)) {
        setError('手机号格式不正确');
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://115.190.182.95:8080/api'}/auth/send-phone-code`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone }),
          }
        );

        const result = await response.json();

        if (result.success) {
          setSuccess('验证码已发送到手机');
          setCodeSent(true);
          setCodeCountdown(60); // 60秒倒计时
          console.log('验证码:', result.code); // 仅用于演示
        } else {
          setError(result.message || '发送验证码失败');
        }
      } catch (err: any) {
        console.error('发送验证码失败:', err);
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * 验证邮箱验证码
   */
  const handleVerifyEmailCode = async () => {
    if (!email || !verificationCode) {
      setError('请先输入邮箱和验证码');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await authService.verifyEmailCode(email, verificationCode);

      if (result.success) {
        setEmailVerified(true);
        setSuccess('邮箱验证成功');
      } else {
        setError(result.message || '验证码验证失败');
      }
    } catch (err: any) {
      console.error('验证邮箱验证码失败:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理注册
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 表单验证
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    if (!verificationCode) {
      setError('请输入验证码');
      return;
    }

    if (!codeSent) {
      setError('请先发送验证码');
      return;
    }

    if (!emailVerified) {
      setError('请先验证邮箱验证码');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (mode === 'email') {
        result = await authService.register(email, password, username);
      } else {
        // 手机号注册 - 暂时不支持，提示用户使用邮箱注册
        setError('手机号注册功能暂未开放，请使用邮箱注册');
        return;
      }

      if (result.success) {
        setSuccess('注册成功！3秒后跳转到登录页...');

        // 3秒后跳转到登录页
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        setError(result.message || '注册失败');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || '注册失败，请稍后重试';
      setError(errorMsg);
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
          <p className='mt-2 text-sm text-gray-600'>
            创建账号，开启智能求职之旅
          </p>
        </div>

        {/* 注册卡片 */}
        <div className='bg-white rounded-lg shadow-lg p-8'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
            注册新账号
          </h2>

          {/* 注册方式切换 */}
          <div className='mb-6'>
            <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg'>
              <button
                type='button'
                onClick={() => setMode('email')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  mode === 'email'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                邮箱注册
              </button>
              <button
                type='button'
                onClick={() => setMode('phone')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  mode === 'phone'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                手机注册
              </button>
            </div>
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

          {/* 注册表单 */}
          <form onSubmit={handleRegister} className='space-y-4'>
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                用户名（可选）
              </label>
              <input
                id='username'
                type='text'
                value={username}
                onChange={e => setUsername(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                placeholder='张三'
              />
            </div>

            {/* 邮箱或手机号输入 */}
            {mode === 'email' ? (
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  邮箱地址 <span className='text-red-500'>*</span>
                </label>
                <div className='flex space-x-2'>
                  <input
                    id='email'
                    type='email'
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    placeholder='your@email.com'
                  />
                  <button
                    type='button'
                    onClick={handleSendVerificationCode}
                    disabled={loading || codeCountdown > 0}
                    className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    {codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor='phone'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  手机号 <span className='text-red-500'>*</span>
                </label>
                <div className='flex space-x-2'>
                  <input
                    id='phone'
                    type='tel'
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    placeholder='13800138000'
                    maxLength={11}
                  />
                  <button
                    type='button'
                    onClick={handleSendVerificationCode}
                    disabled={loading || codeCountdown > 0}
                    className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    {codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码'}
                  </button>
                </div>
              </div>
            )}

            {codeSent && (
              <div>
                <label
                  htmlFor='verificationCode'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  {mode === 'email' ? '邮箱' : '手机'}验证码{' '}
                  <span className='text-red-500'>*</span>
                </label>
                <div className='flex space-x-2'>
                  <input
                    id='verificationCode'
                    type='text'
                    required
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100'
                    placeholder='请输入6位验证码'
                    maxLength={6}
                    disabled={mode === 'email' ? emailVerified : false}
                  />
                  {mode === 'email' && (
                    <button
                      type='button'
                      onClick={handleVerifyEmailCode}
                      disabled={!verificationCode || loading || emailVerified}
                      className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm'
                    >
                      {emailVerified ? '已验证' : '验证'}
                    </button>
                  )}
                </div>
                <p className='mt-1 text-xs text-gray-500'>
                  验证码已发送到 {mode === 'email' ? email : phone}
                  ，请在5分钟内输入
                </p>
                {mode === 'email' && emailVerified && (
                  <p className='mt-1 text-xs text-green-600'>
                    ✓ 邮箱验证成功，可以继续注册
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                密码 <span className='text-red-500'>*</span>
              </label>
              <input
                id='password'
                type='password'
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                placeholder='至少6位'
                minLength={6}
              />
            </div>

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                确认密码 <span className='text-red-500'>*</span>
              </label>
              <input
                id='confirmPassword'
                type='password'
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                placeholder='再次输入密码'
                minLength={6}
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          {/* 登录链接 */}
          <div className='mt-6 text-center'>
            <span className='text-sm text-gray-600'>已有账号？</span>
            <a
              href='/login'
              className='ml-1 text-sm font-medium text-indigo-600 hover:text-indigo-500'
            >
              立即登录
            </a>
          </div>
        </div>

        {/* 底部提示 */}
        <div className='text-center text-xs text-gray-500'>
          <p>注册即表示同意</p>
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

export default Register;
