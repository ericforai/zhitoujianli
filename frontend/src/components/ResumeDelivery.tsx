/**
 * 投递简历页面组件
 *
 * 用户登录后的主要功能页面，包含：
 * 1. 简历管理
 * 2. 投递配置
 * 3. 自动投递
 * 4. 智能匹配
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';
import AutoDelivery from './AutoDelivery';
import DeliveryConfig from './DeliveryConfig';
import ResumeManagement from './ResumeManagement';

const ResumeDelivery: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // 创建认证日志记录器
  const authLogger = logger.createChild('ResumeDelivery:Auth');

  // 认证状态检查和日志记录
  authLogger.debug('ResumeDelivery组件开始渲染', { isLoading, isAuthenticated });

  // 在认证完成前显示加载界面
  if (isLoading) {
    authLogger.debug('等待认证状态确认...');
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>加载中...</p>
        </div>
      </div>
    );
  }

  // 双重保险：理论上PrivateRoute已拦截，但作为防御性编程
  if (!isAuthenticated) {
    authLogger.warn('未认证用户尝试访问ResumeDelivery页面');
    return null;
  }

  // 认证确认，记录日志
  authLogger.info('ResumeDelivery认证检查通过，渲染组件', {
    userId: user?.userId,
    email: user?.email
  });

  const handleLogout = () => {
    authLogger.info('用户退出登录');
    // 这里应该调用authService.logout()，但由于我们使用AuthContext，应该通过context处理
    // 暂时保留原有逻辑，后续可以优化
    window.location.href = '/login';
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 顶部导航栏 */}
      <nav className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            {/* Logo */}
            <div className='flex items-center'>
              <div className='flex-shrink-0 flex items-center space-x-2'>
                <div className='w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-white'
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
                <h1 className='text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                  智投简历
                </h1>
              </div>
            </div>

            {/* 用户信息 */}
            <div className='flex items-center space-x-4'>
              <span className='text-gray-700'>
                欢迎，{user?.username || user?.email || '用户'}
              </span>
              <button
                onClick={handleLogout}
                className='bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors'
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* 页面标题 */}
        <div className='mb-8'>
          <h2 className='text-3xl font-bold text-gray-900'>投递简历</h2>
          <p className='mt-2 text-gray-600'>使用AI智能匹配，找到最适合的职位</p>
        </div>

        {/* 功能标签页 */}
        <div className='border-b border-gray-200 mb-8'>
          <nav className='-mb-px flex space-x-8'>
            {[
              { id: 'dashboard', name: '工作台', icon: '📊' },
              { id: 'resume', name: '简历管理', icon: '📄' },
              { id: 'config', name: '投递配置', icon: '⚙️' },
              { id: 'delivery', name: '自动投递', icon: '🚀' },
              { id: 'matching', name: '智能匹配', icon: '🎯' },
            ].map(tab => (
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
        <div>
          {activeTab === 'dashboard' && (
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                工作台概览
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='bg-blue-50 p-6 rounded-lg'>
                  <div className='text-2xl font-bold text-blue-600'>0</div>
                  <div className='text-gray-600'>今日投递</div>
                </div>
                <div className='bg-green-50 p-6 rounded-lg'>
                  <div className='text-2xl font-bold text-green-600'>0</div>
                  <div className='text-gray-600'>待回复</div>
                </div>
                <div className='bg-purple-50 p-6 rounded-lg'>
                  <div className='text-2xl font-bold text-purple-600'>0</div>
                  <div className='text-gray-600'>面试邀请</div>
                </div>
              </div>
              <div className='mt-8'>
                <p className='text-gray-600'>
                  开始使用智投简历，让AI帮你找到心仪的工作！
                </p>
                <div className='mt-4 flex space-x-4'>
                  <button
                    onClick={() => setActiveTab('resume')}
                    className='bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors'
                  >
                    上传简历
                  </button>
                  <button
                    onClick={() => setActiveTab('config')}
                    className='bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors'
                  >
                    配置投递
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 简历管理 Tab */}
          {activeTab === 'resume' && <ResumeManagement />}

          {/* 投递配置 Tab */}
          {activeTab === 'config' && <DeliveryConfig />}

          {/* 自动投递 Tab */}
          {activeTab === 'delivery' && <AutoDelivery />}

          {/* 智能匹配 Tab */}
          {activeTab === 'matching' && (
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                智能匹配分析
              </h3>
              <div className='space-y-6'>
                {/* AI匹配功能展示 */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  <div className='bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-6'>
                    <h4 className='font-semibold text-blue-900 mb-3'>
                      🎯 智能匹配原理
                    </h4>
                    <ul className='space-y-2 text-blue-800 text-sm'>
                      <li>
                        • <strong>简历解析：</strong>
                        AI自动提取技能、经验、项目等关键信息
                      </li>
                      <li>
                        • <strong>职位分析：</strong>
                        深度分析JD要求，识别核心技能和偏好
                      </li>
                      <li>
                        • <strong>匹配算法：</strong>
                        多维度计算匹配度，智能排序推荐
                      </li>
                      <li>
                        • <strong>个性化投递：</strong>
                        生成定制化打招呼语，提升回复率
                      </li>
                    </ul>
                  </div>

                  <div className='bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-lg p-6'>
                    <h4 className='font-semibold text-green-900 mb-3'>
                      📊 匹配效果
                    </h4>
                    <div className='space-y-3'>
                      <div className='flex justify-between items-center'>
                        <span className='text-green-800 text-sm'>
                          投递成功率
                        </span>
                        <span className='text-2xl font-bold text-green-600'>
                          95%
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-green-800 text-sm'>HR回复率</span>
                        <span className='text-2xl font-bold text-green-600'>
                          78%
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-green-800 text-sm'>
                          面试邀请率
                        </span>
                        <span className='text-2xl font-bold text-green-600'>
                          45%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 功能特色 */}
                <div className='bg-white border border-gray-200 rounded-lg p-6'>
                  <h4 className='font-semibold text-gray-900 mb-4'>
                    ✨ 核心功能特色
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='text-center p-4'>
                      <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                        <span className='text-2xl'>🤖</span>
                      </div>
                      <h5 className='font-semibold text-gray-900 mb-2'>
                        AI简历解析
                      </h5>
                      <p className='text-gray-600 text-sm'>
                        智能提取关键信息，精准匹配岗位要求
                      </p>
                    </div>
                    <div className='text-center p-4'>
                      <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                        <span className='text-2xl'>💬</span>
                      </div>
                      <h5 className='font-semibold text-gray-900 mb-2'>
                        智能打招呼
                      </h5>
                      <p className='text-gray-600 text-sm'>
                        基于简历和JD生成个性化投递内容
                      </p>
                    </div>
                    <div className='text-center p-4'>
                      <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                        <span className='text-2xl'>⚡</span>
                      </div>
                      <h5 className='font-semibold text-gray-900 mb-2'>
                        自动投递
                      </h5>
                      <p className='text-gray-600 text-sm'>
                        全流程自动化，24小时不间断投递
                      </p>
                    </div>
                  </div>
                </div>

                {/* 使用指南 */}
                <div className='bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6'>
                  <h4 className='font-semibold text-yellow-900 mb-3'>
                    📖 智能匹配使用指南
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <h5 className='font-medium text-yellow-800 mb-2'>
                        第一步：上传简历
                      </h5>
                      <p className='text-yellow-700 text-sm mb-3'>
                        在简历管理页面上传您的简历，AI会自动解析关键信息
                      </p>
                      <button
                        onClick={() => setActiveTab('resume')}
                        className='bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors'
                      >
                        去上传简历
                      </button>
                    </div>
                    <div>
                      <h5 className='font-medium text-yellow-800 mb-2'>
                        第二步：配置投递
                      </h5>
                      <p className='text-yellow-700 text-sm mb-3'>
                        在投递配置页面设置搜索条件和投递策略
                      </p>
                      <button
                        onClick={() => setActiveTab('config')}
                        className='bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors'
                      >
                        去配置投递
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeDelivery;
