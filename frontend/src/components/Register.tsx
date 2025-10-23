/**
 * 注册页面组件
 *
 * 仅支持邮箱注册
 *
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */

import React, { useEffect, useState } from 'react';
import config from '../config/environment';
import { authService } from '../services/authService';
import Button from './common/Button';
import Card from './common/Card';
import Container from './common/Container';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
    } catch (err: any) {
      console.error('发送验证码失败:', err);
      console.error('错误详情:', err);

      // 更详细的错误处理
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('网络连接失败，请检查网络或稍后重试');
      } else if (
        err.name === 'TypeError' &&
        err.message.includes('Mixed Content')
      ) {
        setError('安全错误：请使用 HTTPS 访问');
      } else if (err.message.includes('HTTP')) {
        setError(`服务器错误：${err.message}`);
      } else {
        setError('网络错误，请稍后重试');
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
    } catch (err: any) {
      console.error('验证邮箱验证码失败:', err);
      console.error('错误详情:', err.response?.data);

      // 显示具体的后端错误信息，而不是通用的网络错误
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('网络错误，请稍后重试');
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
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12'>
      <Container size='md'>
        {/* Logo和标题 */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>智投简历</h1>
          <p className='text-gray-600'>创建账号，开启智能求职之旅</p>
        </div>

        {/* 注册卡片 */}
        <Card padding='lg'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6 text-center'>
            注册新账号
          </h2>

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
            {/* 邮箱输入 */}
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
                  className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-base'
                  placeholder='your@email.com'
                />
                <Button
                  type='button'
                  onClick={handleSendVerificationCode}
                  disabled={loading || codeCountdown > 0}
                  variant='primary'
                  size='sm'
                >
                  {codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码'}
                </Button>
              </div>
            </div>

            {codeSent && (
              <div>
                <label
                  htmlFor='verificationCode'
                  className='block text-sm font-medium text-gray-700 mb-1'
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
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-colors duration-200'
                    placeholder='请输入6位验证码'
                    maxLength={6}
                    disabled={emailVerified}
                  />
                  <Button
                    type='button'
                    onClick={handleVerifyEmailCode}
                    disabled={!verificationCode || loading || emailVerified}
                    variant='primary'
                    size='sm'
                  >
                    {emailVerified ? '已验证' : '验证'}
                  </Button>
                </div>
                <p className='mt-1 text-xs text-gray-500'>
                  验证码已发送到 {email}，请在5分钟内输入
                </p>
                {emailVerified && (
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
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-base'
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
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-base'
                placeholder='再次输入密码'
                minLength={6}
              />
            </div>

            <Button
              type='submit'
              disabled={loading}
              variant='primary'
              className='w-full'
              loading={loading}
            >
              {loading ? '注册中...' : '注册'}
            </Button>
          </form>

          {/* 登录链接 */}
          <div className='mt-6 text-center'>
            <span className='text-sm text-gray-600'>已有账号？</span>
            <a
              href='/login'
              className='ml-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200'
            >
              立即登录
            </a>
          </div>
        </Card>

        {/* 底部提示 */}
        <div className='text-center text-xs text-gray-500 mt-8'>
          <p className='mb-1'>注册即表示同意</p>
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

export default Register;
