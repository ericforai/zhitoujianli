/**
 * 测试登录跳转组件
 * 用于验证登录后的跳转逻辑
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const TestLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('1@1.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setMessage('正在登录...');

    try {
      const result = await authService.loginByEmail(email, password);

      if (result.success) {
        setMessage('登录成功！正在跳转到简历投递页面...');
        setTimeout(() => {
          navigate('/resume-delivery');
        }, 1000);
      } else {
        setMessage(`登录失败: ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`登录错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = () => {
    const isAuth = authService.isAuthenticated();
    const user = authService.getCachedUser();
    setMessage(`登录状态: ${isAuth ? '已登录' : '未登录'}, 用户: ${user?.email || '无'}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">测试登录跳转</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登录中...' : '测试登录'}
          </button>

          <button
            onClick={checkAuth}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            检查登录状态
          </button>

          {message && (
            <div className="p-3 bg-gray-100 rounded-md text-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestLogin;

