/**
 * 投递配置主组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import React, { useState } from 'react';
import { useDeliveryConfig } from '../../hooks/useDelivery';
import type {
  BossConfig as BossConfigType,
  DeliveryStrategy,
  BlacklistConfig,
} from '../../types/api';
import type { BlacklistData } from '../../services/blacklistService';
import type { ApiError } from '../../hooks/useErrorHandler';
import BlacklistManager from './BlacklistManager';
import BossConfig from './BossConfig';
import DeliverySettings from './DeliverySettings';

const DeliveryConfig: React.FC = () => {
  const { config, loading, error, updateConfig } = useDeliveryConfig();

  const [activeTab, setActiveTab] = useState<'boss' | 'strategy' | 'blacklist'>(
    'boss'
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * 处理Boss配置变化
   */
  const handleBossConfigChange = async (bossConfig: BossConfigType) => {
    try {
      if (!config) return;
      const updatedConfig = {
        ...config,
        bossConfig,
        updatedAt: Date.now(),
      };
      await updateConfig(updatedConfig);
      setSuccessMessage('Boss直聘配置保存成功！');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: unknown) {
      // ✅ 修复：使用unknown类型替代any
      console.error('保存Boss配置失败:', error);
      const apiError = error as ApiError | Error;
      console.error(
        '错误详情:',
        apiError instanceof Error
          ? apiError.message
          : apiError?.response?.data?.message
      );
    }
  };

  /**
   * 处理投递策略变化
   */
  const handleStrategyChange = async (strategy: DeliveryStrategy) => {
    try {
      if (!config) return;
      const updatedConfig = {
        ...config,
        deliveryStrategy: strategy,
        updatedAt: Date.now(),
      };
      await updateConfig(updatedConfig);
      setSuccessMessage('投递策略保存成功！');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: unknown) {
      // ✅ 修复：使用unknown类型替代any
      console.error('保存投递策略失败:', error);
      const apiError = error as ApiError | Error;
      console.error(
        '错误详情:',
        apiError instanceof Error
          ? apiError.message
          : apiError?.response?.data?.message
      );
    }
  };

  /**
   * 处理黑名单配置变化
   * ✅ 修复：使用BlacklistData类型（与BlacklistManager一致）
   */
  const handleBlacklistChange = async (blacklistConfig: BlacklistData) => {
    try {
      if (!config) return;
      // ✅ 修复：转换BlacklistData为BlacklistConfig格式
      const blacklistConfigForUpdate: BlacklistConfig = {
        ...blacklistConfig,
        keywordBlacklist: [], // BlacklistData没有keywordBlacklist，使用空数组
      };
      const updatedConfig = {
        ...config,
        blacklistConfig: blacklistConfigForUpdate,
        updatedAt: Date.now(),
      };
      await updateConfig(updatedConfig);
      setSuccessMessage('黑名单配置保存成功！');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: unknown) {
      // ✅ 修复：使用unknown类型替代any
      console.error('保存黑名单配置失败:', error);
      const apiError = error as ApiError | Error;
      console.error(
        '错误详情:',
        apiError instanceof Error
          ? apiError.message
          : apiError?.response?.data?.message
      );
    }
  };

  if (!config || loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2 text-gray-600'>加载配置中...</p>
        </div>
      </div>
    );
  }

  // 确保配置对象有默认值
  const safeConfig = {
    bossConfig: config.bossConfig || {
      keywords: [],
      cities: [],
      salaryRange: { minSalary: 0, maxSalary: 100 },
      experienceRequirement: '不限',
      educationRequirement: '不限',
      enableSmartGreeting: true,
    },
    deliveryStrategy: config.deliveryStrategy || {
      enableAutoDelivery: false,
      deliveryFrequency: 10,
      maxDailyDelivery: 50,
      deliveryInterval: 300,
      matchThreshold: 0.7,
    },
    blacklistConfig: (config.blacklistConfig
      ? {
          companyBlacklist: config.blacklistConfig.companyBlacklist || [],
          positionBlacklist: config.blacklistConfig.positionBlacklist || [],
          enableBlacklistFilter:
            config.blacklistConfig.enableBlacklistFilter || false,
        }
      : {
          companyBlacklist: [],
          positionBlacklist: [],
          enableBlacklistFilter: false,
        }) as BlacklistData,
  };

  return (
    <div className='space-y-6'>
      {/* 页面标题 */}
      <div>
        <h3 className='text-xl font-semibold text-gray-900'>投递配置</h3>
        <p className='mt-1 text-sm text-gray-600'>
          配置投递参数、策略和黑名单，优化投递效果
        </p>
      </div>

      {/* 成功消息 */}
      {successMessage && (
        <div className='bg-green-50 border border-green-200 rounded-md p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-green-400'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 0116 0zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-green-800'>
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 错误消息 */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-md p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-red-400'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-red-800'>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 标签页导航 */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          {[
            { id: 'boss', name: 'Boss直聘配置', icon: '🚀' },
            { id: 'strategy', name: '投递策略', icon: '⚙️' },
            { id: 'blacklist', name: '黑名单管理', icon: '🚫' },
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
        {activeTab === 'boss' && (
          <BossConfig
            config={safeConfig.bossConfig}
            onConfigChange={handleBossConfigChange}
            loading={loading}
          />
        )}

        {activeTab === 'strategy' && (
          <DeliverySettings
            strategy={safeConfig.deliveryStrategy}
            onStrategyChange={handleStrategyChange}
            loading={loading}
          />
        )}

        {activeTab === 'blacklist' && (
          <BlacklistManager
            blacklistConfig={safeConfig.blacklistConfig}
            onBlacklistChange={handleBlacklistChange}
            loading={loading}
          />
        )}
      </div>

      {/* 配置概览 */}
      <div className='bg-gray-50 rounded-lg p-6'>
        <h4 className='text-lg font-medium text-gray-900 mb-4'>配置概览</h4>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-white rounded-lg p-4'>
            <h5 className='font-medium text-gray-900 mb-2'>Boss直聘</h5>
            <div className='space-y-1 text-sm text-gray-600'>
              <p>关键词: {safeConfig.bossConfig.keywords?.length || 0} 个</p>
              <p>城市: {safeConfig.bossConfig.cities?.length || 0} 个</p>
              <p>
                智能打招呼:{' '}
                {safeConfig.bossConfig.enableSmartGreeting
                  ? '已启用'
                  : '未启用'}
              </p>
            </div>
          </div>
          <div className='bg-white rounded-lg p-4'>
            <h5 className='font-medium text-gray-900 mb-2'>投递策略</h5>
            <div className='space-y-1 text-sm text-gray-600'>
              <p>
                自动投递:{' '}
                {safeConfig.deliveryStrategy.enableAutoDelivery
                  ? '已启用'
                  : '未启用'}
              </p>
              <p>
                投递频率: {safeConfig.deliveryStrategy.deliveryFrequency}{' '}
                次/小时
              </p>
              <p>每日限额: {safeConfig.deliveryStrategy.maxDailyDelivery} 次</p>
            </div>
          </div>
          <div className='bg-white rounded-lg p-4'>
            <h5 className='font-medium text-gray-900 mb-2'>黑名单</h5>
            <div className='space-y-1 text-sm text-gray-600'>
              <p>
                过滤开关:{' '}
                {safeConfig.blacklistConfig.enableBlacklistFilter
                  ? '已启用'
                  : '未启用'}
              </p>
              <p>
                公司黑名单:{' '}
                {safeConfig.blacklistConfig.companyBlacklist?.length || 0} 个
              </p>
              <p>
                职位黑名单:{' '}
                {safeConfig.blacklistConfig.positionBlacklist?.length || 0} 个
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
        <div className='flex'>
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-blue-400'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='ml-3'>
            <h4 className='text-sm font-medium text-blue-800'>配置建议</h4>
            <div className='mt-2 text-sm text-blue-700'>
              <ul className='list-disc list-inside space-y-1'>
                <li>建议设置3-5个相关关键词，提高搜索精准度</li>
                <li>选择1-3个目标城市，避免投递范围过广</li>
                <li>投递频率建议设置为10-20次/小时，避免被平台限制</li>
                <li>启用黑名单过滤，提高投递质量</li>
                <li>定期更新配置，根据投递效果调整参数</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryConfig;
