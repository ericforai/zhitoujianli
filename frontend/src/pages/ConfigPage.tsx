/**
 * 配置管理页面
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 * @updated 2025-11-04 - 集成完整的DeliveryConfig组件（包含黑名单管理）
 * @updated 2025-12-18 - 添加本地Agent配置Tab
 */

import React, { useEffect, useState } from 'react';
import DeliveryConfig from '../components/DeliveryConfig';
import Navigation from '../components/Navigation';
import SEOHead from '../components/seo/SEOHead';
import CompleteResumeManager from '../components/ResumeManagement/CompleteResumeManager';
import LocalAgentConfig from '../components/LocalAgentConfig';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';

// ✅ 修复：将authLogger移到组件外部，避免每次渲染创建新对象导致useEffect无限循环
const authLogger = logger.createChild('ConfigPage:Auth');

const ConfigPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'delivery' | 'resume' | 'local-agent'>('delivery');

  // 所有 useEffect 必须在这里，在任何 return 之前
  useEffect(() => {
    authLogger.debug('ConfigPage组件开始渲染', { isLoading, isAuthenticated });
  }, [isLoading, isAuthenticated]); // ✅ 修复：移除authLogger依赖，因为它是模块级常量

  // 现在可以安全地使用条件 return
  if (isLoading) {
    authLogger.debug('等待认证状态确认...');
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>加载中...</p>
        </div>
      </div>
    );
  }

  // 双重保险：理论上PrivateRoute已拦截，但作为防御性编程
  if (!isAuthenticated) {
    authLogger.warn('未认证用户尝试访问ConfigPage页面');
    return null;
  }

  // 认证确认，记录日志
  authLogger.info('ConfigPage认证检查通过，渲染组件', {
    userId: user?.userId,
    email: user?.email,
  });

  return (
    <div className='min-h-screen bg-gray-50'>
      <SEOHead path='/config' />
      <Navigation />

      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* 页面标题 */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>⚙️ 配置管理</h1>
          <p className='text-gray-600'>
            管理投递参数、黑名单和简历内容，优化求职效果
          </p>
        </div>

        {/* Tab切换 */}
        <div className='mb-8'>
          <div className='border-b border-gray-200'>
            <nav className='-mb-px flex space-x-8'>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'delivery'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 投递配置（含黑名单）
              </button>
              <button
                onClick={() => setActiveTab('resume')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'resume'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📄 简历内容管理
              </button>
              <button
                onClick={() => setActiveTab('local-agent')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'local-agent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🖥️ 本地投递
              </button>
            </nav>
          </div>
        </div>

        {/* 内容区域 */}
        <div>
          {activeTab === 'delivery' && <DeliveryConfig />}
          {activeTab === 'resume' && (
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <CompleteResumeManager />
            </div>
          )}
          {activeTab === 'local-agent' && <LocalAgentConfig />}
        </div>

        {/* 帮助信息 */}
        <div className='mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h3 className='text-sm font-medium text-blue-900 mb-2'>
            💡 使用提示
          </h3>
          <ul className='text-sm text-blue-800 space-y-1'>
            <li>
              • <strong>投递配置</strong>
              ：包含Boss直聘配置、投递策略、黑名单管理三个子模块
            </li>
            <li>
              • <strong>黑名单管理</strong>
              ：在投递配置中点击&ldquo;黑名单管理&rdquo;标签即可设置
            </li>
            <li>
              • <strong>简历内容管理</strong>
              ：上传和编辑简历，AI将基于简历内容生成个性化打招呼语
            </li>
            <li>
              • <strong>本地投递</strong>
              ：使用本地电脑运行Agent，通过家庭/办公IP投递，有效避免风控
            </li>
            <li>• 配置修改后会自动保存，立即生效</li>
            <li>• 建议定期更新简历内容和黑名单以获得更好的投递效果</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;
