/**
 * 投递简历页面组件
 *
 * 用户登录后的主要功能页面，包含：
 * 1. 简历管理
 * 2. 职位搜索和投递
 * 3. 投递记录
 * 4. 智能匹配
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-03
 */

import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';

const ResumeDelivery: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // 检查登录状态
    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    const userData = authService.getCachedUser();
    setUser(userData);
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  智投简历
                </h1>
              </div>
            </div>

            {/* 用户信息 */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">欢迎，{user.username || user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">投递简历</h2>
          <p className="mt-2 text-gray-600">使用AI智能匹配，找到最适合的职位</p>
        </div>

        {/* 功能标签页 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: '工作台', icon: '📊' },
              { id: 'resume', name: '简历管理', icon: '📄' },
              { id: 'jobs', name: '职位搜索', icon: '🔍' },
              { id: 'delivery', name: '投递记录', icon: '📤' },
              { id: 'matching', name: '智能匹配', icon: '🎯' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 标签页内容 */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'dashboard' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">工作台概览</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-gray-600">今日投递</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-gray-600">待回复</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-gray-600">面试邀请</div>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-gray-600">开始使用智投简历，让AI帮你找到心仪的工作！</p>
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={() => setActiveTab('resume')}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    上传简历
                  </button>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    搜索职位
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resume' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">简历管理</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="mt-4">
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      拖拽文件到此处，或
                      <span className="text-indigo-600 hover:text-indigo-500">点击选择文件</span>
                    </span>
                    <input id="resume-upload" name="resume-upload" type="file" className="sr-only" accept=".pdf,.doc,.docx" />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">支持 PDF, DOC, DOCX 格式，最大 10MB</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">职位搜索</h3>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="搜索职位、公司或关键词"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    搜索
                  </button>
                </div>
                <div className="text-center py-12 text-gray-500">
                  <p>搜索功能正在开发中，敬请期待...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">投递记录</h3>
              <div className="text-center py-12 text-gray-500">
                <p>暂无投递记录</p>
                <p className="text-sm mt-2">开始投递简历后，记录将显示在这里</p>
              </div>
            </div>
          )}

          {activeTab === 'matching' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">智能匹配</h3>
              <div className="text-center py-12 text-gray-500">
                <p>AI智能匹配功能正在开发中...</p>
                <p className="text-sm mt-2">将根据您的简历和偏好，智能推荐最适合的职位</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeDelivery;
