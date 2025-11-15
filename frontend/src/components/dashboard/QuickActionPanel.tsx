import React from 'react';
import { usePlanPermission } from '../../hooks/usePlanPermission';

/**
 * 快捷操作面板Props
 */
interface QuickActionPanelProps {
  /** 是否正在运行 */
  isRunning: boolean;
  /** Boss是否已登录 */
  isBossLoggedIn: boolean;
  /** 今日投递数量 */
  todayDeliveryCount: number;
  /** 启动投递回调 */
  onStart: () => void;
  /** 停止投递回调 */
  onStop: () => void;
  /** Boss登录回调 */
  onBossLogin: () => void;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 快捷操作面板组件
 *
 * 核心功能区，包含大号启动按钮和关键状态指标
 */
export const QuickActionPanel: React.FC<QuickActionPanelProps> = ({
  isRunning,
  isBossLoggedIn,
  todayDeliveryCount,
  onStart,
  onStop,
  onBossLogin,
  loading = false,
}) => {
  const { userPlan, getQuotaInfo, getRemainingQuota } = usePlanPermission();

  // 获取每日投递配额信息
  const dailyQuota = getQuotaInfo('daily_job_application');
  const quotaLimit = dailyQuota?.limit || 0;
  // ✅ 统一使用Boss统计数据，确保数据一致性
  const quotaUsed = todayDeliveryCount;
  const remainingQuota = dailyQuota?.unlimited ? 999 : Math.max(0, quotaLimit - quotaUsed);

  // 判断是否可以启动
  const canStart = isBossLoggedIn && !isRunning && remainingQuota > 0;

  return (
    <div className='bg-white rounded-lg border border-gray-200 shadow-sm mb-6'>
      <div className='p-6'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>
          {/* 操作按钮区域 - 精简版 */}
          <div className='lg:col-span-1'>
            {isRunning ? (
              <button
                onClick={onStop}
                disabled={loading}
                className='w-full h-14 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2'
              >
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                  <rect x='6' y='4' width='8' height='12' rx='1' />
                </svg>
                <span>停止投递</span>
              </button>
            ) : (
              <button
                onClick={canStart ? onStart : onBossLogin}
                disabled={loading || (!canStart && isBossLoggedIn)}
                className={`w-full h-14 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                  canStart
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : isBossLoggedIn
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {canStart ? (
                  <>
                    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z' />
                    </svg>
                    <span>启动投递</span>
                  </>
                ) : isBossLoggedIn ? (
                  <span>配额已用完</span>
                ) : (
                  <>
                    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z' />
                    </svg>
                    <span>登录Boss</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* 关键指标区域 - 横向排列 */}
          <div className='lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Boss登录状态 */}
          <div className='bg-white rounded-lg p-4 border border-gray-200'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-600'>Boss状态</span>
              {isBossLoggedIn ? (
                <span className='px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full'>
                  ✓ 已登录
                </span>
              ) : (
                <span className='px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full'>
                  未登录
                </span>
              )}
            </div>
            {!isBossLoggedIn && (
              <p className='text-xs text-gray-500'>点击上方按钮扫码登录</p>
            )}
          </div>

          {/* 今日投递 */}
          <div className='bg-white rounded-lg p-4 border border-gray-200'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-600'>今日投递</span>
              <span className='text-2xl font-bold text-blue-600'>{quotaUsed}</span>
            </div>
            <div className='flex items-center text-xs text-gray-500'>
              <svg className='w-4 h-4 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z' />
              </svg>
              <span>已投递职位数量</span>
            </div>
          </div>

          {/* 配额剩余 */}
          <div className='bg-gray-50 rounded-lg p-4'>
            <div className='flex items-center justify-between mb-1'>
              <span className='text-sm font-medium text-gray-600'>配额剩余</span>
              <span
                className={`text-xl font-bold ${
                  remainingQuota <= 0
                    ? 'text-red-600'
                    : remainingQuota <= quotaLimit * 0.2
                      ? 'text-orange-600'
                      : 'text-green-600'
                }`}
              >
                {dailyQuota?.unlimited ? '∞' : `${quotaUsed}/${quotaLimit}`}
              </span>
            </div>
            <div className='text-xs text-gray-500'>
              {userPlan?.planName || '求职入门版'}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionPanel;

