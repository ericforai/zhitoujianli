/**
 * 登录页面组件
 * 
 * 支持多种登录方式：
 * 1. 邮箱密码登录
 * 2. 手机号验证码登录
 * 3. 微信扫码登录（通过Authing）
 * 4. 支付宝登录（通过Authing）
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */

import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import './Login.css';

type LoginMode = 'email' | 'phone';

const Login: React.FC = () => {
  const [mode, setMode] = useState<LoginMode>('email');
  
  // 邮箱登录状态
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 手机号登录状态
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  // 通用状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  /**
   * 邮箱密码登录
   */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.loginByEmail(email, password);
      
      if (result.success) {
        setSuccess('登录成功！正在跳转...');
        setTimeout(() => {
          // 跳转到后端应用程序
          window.location.href = 'http://localhost:8080/';
        }, 1000);
      } else {
        setError(result.message || '登录失败，请检查邮箱和密码');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 发送手机验证码
   */
  const handleSendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await authService.sendPhoneCode(phone);
      
      if (result.success) {
        setSuccess('验证码已发送，请注意查收');
        setCountdown(60); // 60秒倒计时
      } else {
        setError(result.message || '发送失败');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '发送失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 手机号验证码登录
   */
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.loginByPhone(phone, code);
      
      if (result.success) {
        setSuccess('登录成功！正在跳转...');
        setTimeout(() => {
          // 跳转到后端应用程序
          window.location.href = 'http://localhost:8080/';
        }, 1000);
      } else {
        setError(result.message || '登录失败，请检查验证码');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo和标题 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">智投简历</h1>
          <p className="mt-2 text-sm text-gray-600">
            智能化求职投递平台
          </p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 登录方式切换 */}
          <div className="flex border-b mb-6">
            <button
              className={`flex-1 py-2 text-center ${
                mode === 'email'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold'
                  : 'text-gray-500'
              }`}
              onClick={() => setMode('email')}
            >
              邮箱登录
            </button>
            <button
              className={`flex-1 py-2 text-center ${
                mode === 'phone'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold'
                  : 'text-gray-500'
              }`}
              onClick={() => setMode('phone')}
            >
              手机号登录
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* 邮箱登录表单 */}
          {mode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱地址
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="至少6位"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </form>
          )}

          {/* 手机号登录表单 */}
          {mode === 'phone' && (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  手机号
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="13800138000"
                  pattern="^1[3-9]\d{9}$"
                />
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  验证码
                </label>
                <div className="flex space-x-2">
                  <input
                    id="code"
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="6位验证码"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || loading}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {countdown > 0 ? `${countdown}s` : '发送验证码'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </form>
          )}

          {/* 社交登录分割线 */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或使用以下方式登录</span>
              </div>
            </div>
          </div>

          {/* 社交登录按钮 */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              onClick={() => {
                alert('请在Authing控制台配置微信登录后使用此功能');
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#09BB07">
                <path d="M8.5 10c.83 0 1.5-.67 1.5-1.5S9.33 7 8.5 7 7 7.67 7 8.5 7.67 10 8.5 10zm7 0c.83 0 1.5-.67 1.5-1.5S16.33 7 15.5 7 14 7.67 14 8.5s.67 1.5 1.5 1.5z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">微信</span>
            </button>

            <button
              type="button"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              onClick={() => {
                alert('请在Authing控制台配置支付宝登录后使用此功能');
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#1677FF">
                <path d="M3 3h18v18H3V3zm16 14.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">支付宝</span>
            </button>
          </div>

          {/* 注册链接 */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">还没有账号？</span>
            <a
              href="/register"
              className="ml-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              立即注册
            </a>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="text-center text-xs text-gray-500">
          <p>登录即表示同意</p>
          <a href="/terms" className="text-indigo-600 hover:underline">用户协议</a>
          <span> 和 </span>
          <a href="/privacy" className="text-indigo-600 hover:underline">隐私政策</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
