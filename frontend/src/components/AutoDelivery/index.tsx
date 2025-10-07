/**
 * 自动投递主组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import React, { useState } from 'react';
import DeliveryControl from './DeliveryControl';
import DeliveryRecords from './DeliveryRecords';
import DeliveryStatus from './DeliveryStatus';

const AutoDelivery: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'control' | 'status' | 'records'>(
    'control'
  );

  return (
    <div className='space-y-6'>
      {/* 页面标题 */}
      <div>
        <h3 className='text-xl font-semibold text-gray-900'>自动投递</h3>
        <p className='mt-1 text-sm text-gray-600'>
          启动自动投递，实时监控投递状态和结果
        </p>
      </div>

      {/* 标签页导航 */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          {[
            { id: 'control', name: '投递控制', icon: '🎮' },
            { id: 'status', name: '状态监控', icon: '📊' },
            { id: 'records', name: '投递记录', icon: '📋' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
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
        {activeTab === 'control' && <DeliveryControl />}
        {activeTab === 'status' && <DeliveryStatus />}
        {activeTab === 'records' && <DeliveryRecords />}
      </div>
    </div>
  );
};

export default AutoDelivery;
