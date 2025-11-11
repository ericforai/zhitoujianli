/**
 * 注册页面组件 - 现代化设计版本
 *
 * 采用玻璃拟态 + 微阴影 + 渐变主按钮的视觉风格
 * 仅支持邮箱注册，具有现代化的UI/UX设计
 *
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 * @updated 2025-01-15 - 全新现代化UI设计
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import config from '../config/environment';
import SEOHead from './seo/SEOHead';
import { authService } from '../services/authService';
import analyticsService from '../services/analyticsService';
// ✅ 修复：暂时注释，后续统一错误处理时启用
// import { useErrorHandler } from '../hooks/useErrorHandler';
import type { ApiError } from '../hooks/useErrorHandler';
import './Register.css';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // ✅ 修复：使用统一的错误处理Hook（暂时保留，后续可能使用）
  // const { handleError: handleApiError } = useErrorHandler();

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
   * 发送邮箱验证码
   */
  const handleSendVerificationCode = async () => {
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

      // 使用统一的环境配置
      // 🔧 临时修复：确保API URL正确构建
      const baseUrl = config.apiBaseUrl || '/api';
      const apiUrl = `${baseUrl}/auth/send-verification-code`;

      console.log('🔗 发送验证码请求到:', apiUrl);
      console.log('🔧 当前环境:', {
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        apiBaseUrl: config.apiBaseUrl,
        fullUrl: apiUrl,
        environment: config.isProduction ? 'production' : 'development',
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        // ✅ 添加 credentials 以支持跨域 Cookie 传递
        credentials: 'include',
      });

      console.log('📊 响应状态:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 请求失败:', errorText);
        throw new Error(
          `HTTP ${response.status}: ${errorText || response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setSuccess('验证码已发送到邮箱，请查看邮件');
        setCodeSent(true);
        setCodeCountdown(60); // 60秒倒计时
        setEmailVerified(false); // 重置验证状态
        setVerificationCode(''); // 清空验证码输入框
        console.log('✅ 验证码发送成功，状态已重置');
      } else {
        setError(result.message || '发送验证码失败');
      }
    } catch (err: unknown) {
      // ✅ 修复：使用unknown类型替代any
      console.error('发送验证码失败:', err);

      const error = err as ApiError | Error;
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as ApiError)?.response?.data?.message || '发送验证码失败';

      // 更详细的错误处理
      if (error instanceof Error) {
        if (
          error.name === 'TypeError' &&
          error.message.includes('Failed to fetch')
        ) {
          setError('网络连接失败，请检查网络或稍后重试');
        } else if (
          error.name === 'TypeError' &&
          error.message.includes('Mixed Content')
        ) {
          setError('安全错误：请使用 HTTPS 访问');
        } else if (error.message.includes('HTTP')) {
          setError(`服务器错误：${error.message}`);
        } else {
          setError(errorMessage);
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
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

      // 添加详细的状态调试信息
      console.log('🔍 调试信息 - 当前状态值:');
      console.log('  email:', email);
      console.log('  verificationCode:', verificationCode);
      console.log('  codeSent:', codeSent);
      console.log('  emailVerified:', emailVerified);

      // 使用统一的环境配置
      const baseUrl = config.apiBaseUrl || '/api';
      const verifyUrl = `${baseUrl}/auth/verify-code`;

      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: verificationCode }),
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        setEmailVerified(true);
        setSuccess('邮箱验证成功');
      } else {
        setError(result.message || '验证码验证失败');
      }
    } catch (err: unknown) {
      // ✅ 修复：使用unknown类型替代any
      console.error('验证邮箱验证码失败:', err);
      const error = err as ApiError | Error;
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as ApiError)?.response?.data?.message || '验证码验证失败';
      console.error('错误详情:', (error as ApiError)?.response?.data);

      // 显示具体的后端错误信息，而不是通用的网络错误
      if ((error as ApiError)?.response?.data?.message) {
        setError((error as ApiError).response!.data!.message!);
      } else {
        setError(errorMessage);
      }
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
      const result = await authService.register(email, password);

      if (result.success) {
        setSuccess('注册成功！3秒后跳转到登录页...');

        // 📊 跟踪注册转化事件
        analyticsService.trackConversion('sign_up', {
          method: 'email',
          email: email, // 注意：实际应用中可能需要脱敏处理
        });

        // 3秒后跳转到登录页
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        setError(result.message || '注册失败');
      }
    } catch (err: unknown) {
      // ✅ 修复：使用unknown类型替代any
      const error = err as ApiError | Error;
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as ApiError)?.response?.data?.message ||
            '注册失败，请稍后重试';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead path='/register' />
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-6 px-4'>
        <div className='w-full max-w-md'>
          {/* Logo和标题 - 水平排列，可点击返回首页 */}
          <Link
            to='/'
            className='flex items-center gap-3 mb-6 animate-fade-in cursor-pointer hover:opacity-80 transition-opacity duration-200'
          >
            {/* Logo图标 */}
            <div className='flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg'>
              <svg
                className='w-6 h-6 text-white'
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
            {/* 文字内容 */}
            <div className='flex flex-col'>
              <h1 className='text-3xl font-bold text-gray-900 mb-1 font-inter'>
                智投简历
              </h1>
              <p className='text-gray-600 text-base font-medium'>
                免费注册，开启智能求职之旅
              </p>
            </div>
          </Link>

          {/* 注册卡片 - 玻璃拟态效果 */}
          <div className='bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6'>
            <div className='text-center mb-6'>
              <h2 className='text-xl font-bold text-gray-900 font-inter'>
                AI帮你自动投递简历
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

            {/* 注册表单 */}
            <form onSubmit={handleRegister} className='space-y-4'>
              {/* 邮箱输入 */}
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-semibold text-gray-700 mb-2 font-inter'
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
                    className='flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 text-base font-inter placeholder-gray-400 hover:bg-white/80'
                    placeholder='your@email.com'
                  />
                  <button
                    type='button'
                    onClick={handleSendVerificationCode}
                    disabled={loading || codeCountdown > 0}
                    className='px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-inter text-xs whitespace-nowrap'
                  >
                    {codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码'}
                  </button>
                </div>
              </div>

              {codeSent && (
                <div>
                  <label
                    htmlFor='verificationCode'
                    className='block text-sm font-semibold text-gray-700 mb-2 font-inter'
                  >
                    邮箱验证码 <span className='text-red-500'>*</span>
                  </label>
                  <div className='flex space-x-2'>
                    <input
                      id='verificationCode'
                      type='text'
                      required
                      value={verificationCode}
                      onChange={e => setVerificationCode(e.target.value)}
                      className='flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 text-base font-inter placeholder-gray-400 hover:bg-white/80 disabled:bg-gray-100/60'
                      placeholder='请输入6位验证码'
                      maxLength={6}
                      disabled={emailVerified}
                    />
                    <button
                      type='button'
                      onClick={handleVerifyEmailCode}
                      disabled={!verificationCode || loading || emailVerified}
                      className='px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-inter text-xs whitespace-nowrap'
                    >
                      {emailVerified ? '已验证' : '验证'}
                    </button>
                  </div>
                  <p className='mt-1 text-xs text-gray-600 font-inter'>
                    验证码已发送到 {email}，请在5分钟内输入
                  </p>
                  {emailVerified && (
                    <p className='mt-1 text-xs text-green-600 font-medium'>
                      ✓ 邮箱验证成功，可以继续注册
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-semibold text-gray-700 mb-2 font-inter'
                >
                  密码 <span className='text-red-500'>*</span>
                </label>
                <input
                  id='password'
                  type='password'
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className='w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 text-base font-inter placeholder-gray-400 hover:bg-white/80'
                  placeholder='至少6位'
                  minLength={6}
                />
              </div>

              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-semibold text-gray-700 mb-2 font-inter'
                >
                  确认密码 <span className='text-red-500'>*</span>
                </label>
                <input
                  id='confirmPassword'
                  type='password'
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className='w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 text-base font-inter placeholder-gray-400 hover:bg-white/80'
                  placeholder='再次输入密码'
                  minLength={6}
                />
              </div>

              {/* 自定义注册按钮 */}
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
                    注册中...
                  </div>
                ) : (
                  '免费注册'
                )}
              </button>
            </form>

            {/* 登录链接和协议提示 */}
            <div className='mt-6 space-y-3'>
              <div className='text-center'>
                <span className='text-sm text-gray-600 font-inter'>
                  已有账号？
                </span>
                <a
                  href='/login'
                  className='ml-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200 font-inter'
                >
                  立即登录
                </a>
              </div>
              {/* 底部提示 - 移入卡片内 */}
              <div className='text-center text-xs text-gray-500 font-inter pt-2 border-t border-gray-200/50'>
                <p className='mb-1'>注册即表示同意</p>
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

export default Register;
