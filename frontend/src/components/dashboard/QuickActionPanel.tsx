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
  /** 状态消息 */
  message?: string;
  /** 刷新Boss状态回调 */
  onRefreshBossStatus?: () => void;
  /** Boss状态错误信息 */
  bossStatusError?: string | null;
  /** Boss状态加载中 */
  isBossStatusLoading?: boolean;
  /** 显示投递详情回调 */
  onShowDeliveryDetails?: () => void;
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
  message,
  onRefreshBossStatus,
  bossStatusError,
  isBossStatusLoading = false,
  onShowDeliveryDetails,
}) => {
  const { userPlan, getQuotaInfo } = usePlanPermission();

  // 获取每日投递配额信息
  const dailyQuota = getQuotaInfo('daily_job_application');
  const quotaLimit = dailyQuota?.limit || 0;
  // ✅ 统一使用Boss统计数据，确保数据一致性
  const quotaUsed = todayDeliveryCount;
  const remainingQuota = dailyQuota?.unlimited ? 999 : Math.max(0, quotaLimit - quotaUsed);

  // ✅ 判断配额是否已用完（已用数量 >= 配额限制）
  const isQuotaExceeded = !dailyQuota?.unlimited && quotaUsed >= quotaLimit;

  // 判断是否可以启动
  const canStart = isBossLoggedIn && !isRunning && !isQuotaExceeded && remainingQuota > 0;

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

            {/* 状态消息 - 显示在按钮下方，形成完整的投递状态组件 */}
            {message && (
              <div
                className={`mt-3 p-3 rounded-lg border ${
                  message.includes('成功')
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : message.includes('失败') || message.includes('错误')
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <p className='text-sm font-medium'>{message}</p>
              </div>
            )}

            {/* ✅ 配额用完升级提示 - 当配额已用完时显示 */}
            {isQuotaExceeded && (
              <div className='mt-3 p-4 rounded-lg border-2 border-orange-300 bg-orange-50'>
                <div className='flex items-start gap-3'>
                  <div className='text-2xl'>⚠️</div>
                  <div className='flex-1'>
                    <p className='text-sm font-semibold text-orange-900 mb-1'>
                      配额已用完
                    </p>
                    <p className='text-xs text-orange-700 mb-2'>
                      今日已投递 {quotaUsed} 个职位（配额：{quotaLimit}）
                    </p>
                    <a
                      href='/pricing'
                      className='inline-block text-xs px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors'
                    >
                      立即升级套餐 →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 关键指标区域 - 横向排列 */}
          <div className='lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Boss登录状态 - 增强版，整合刷新功能和详细状态 */}
          <div
            className={`rounded-lg p-4 border ${
              isBossLoggedIn
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-2'>
                <span className='text-lg'>
                  {isBossLoggedIn ? '✅' : '⚠️'}
                </span>
                <span className='text-sm font-medium text-gray-900'>
                  {isBossLoggedIn ? 'Boss账号已登录' : '需要扫码登录Boss'}
                </span>
              </div>
              {onRefreshBossStatus && (
                <button
                  onClick={onRefreshBossStatus}
                  disabled={isBossStatusLoading}
                  className='text-xs px-2 py-1 rounded-full bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 text-gray-700'
                  title='刷新Boss登录状态'
                >
                  {isBossStatusLoading ? '刷新中...' : '🔄 刷新'}
                </button>
              )}
            </div>
            {!isBossLoggedIn && (
              <p className='text-xs text-gray-600 mt-1'>点击上方按钮扫码登录</p>
            )}
            {bossStatusError && (
              <p className='text-xs mt-2 text-red-600'>
                检查状态失败: {bossStatusError}
              </p>
            )}
          </div>

          {/* 今日投递 - 可点击查看详情 */}
          <div
            onClick={onShowDeliveryDetails}
            className={`bg-white rounded-lg p-4 border border-gray-200 ${
              onShowDeliveryDetails
                ? 'cursor-pointer hover:shadow-md transition-shadow'
                : ''
            }`}
            title={onShowDeliveryDetails ? '点击查看今日投递详情' : undefined}
          >
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-600'>今日投递</span>
              <span className='text-2xl font-bold text-blue-600'>{quotaUsed}</span>
            </div>
            <div className='flex items-center text-xs text-gray-500'>
              <svg className='w-4 h-4 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z' />
              </svg>
              <span>已投递职位数量</span>
              {onShowDeliveryDetails && (
                <span className='ml-2 text-blue-600'>📊</span>
              )}
            </div>
          </div>

          {/* 配额剩余 */}
          <div className='bg-gray-50 rounded-lg p-4'>
            <div className='flex items-center justify-between mb-1'>
              <span className='text-sm font-medium text-gray-600'>配额剩余</span>
              <span
                className={`text-xl font-bold ${
                  isQuotaExceeded
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

