/**
 * 直接访问简历管理页面 - 无需登录
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import React, { useState } from 'react';
import AutoDelivery from './AutoDelivery';
import DeliveryConfig from './DeliveryConfig';
import ResumeManagement from './ResumeManagement';

const DirectResumeEntry: React.FC = () => {
  const [activeTab, setActiveTab] = useState('resume');

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 顶部导航栏 */}
      <nav className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div className='flex items-center'>
              <h1 className='text-2xl font-bold text-indigo-600'>智投简历</h1>
              <span className='ml-4 text-sm text-gray-500'>访客模式</span>
            </div>
            <div className='flex items-center space-x-4'>
              <span className='text-sm text-gray-700'>欢迎，访客用户</span>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* 页面标题 */}
        <div className='mb-8'>
          <h2 className='text-3xl font-bold text-gray-900'>智能简历管理</h2>
          <p className='mt-2 text-gray-600'>使用AI智能匹配，找到最适合的职位</p>
        </div>

        {/* 功能标签页 */}
        <div className='border-b border-gray-200 mb-8'>
          <nav className='-mb-px flex space-x-8'>
            {[
              { id: 'resume', name: '简历管理', icon: '📄' },
              { id: 'config', name: '投递配置', icon: '⚙️' },
              { id: 'delivery', name: '自动投递', icon: '🚀' },
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
          {activeTab === 'resume' && <ResumeManagement />}
          {activeTab === 'config' && <DeliveryConfig />}
          {activeTab === 'delivery' && <AutoDelivery />}
        </div>
      </div>
    </div>
  );
};

export default DirectResumeEntry;
