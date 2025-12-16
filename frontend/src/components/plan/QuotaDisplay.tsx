import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanPermission } from '../../hooks/usePlanPermission';

/**
 * 配额显示组件Props
 */
interface QuotaDisplayProps {
  /** 是否显示升级按钮 */
  showUpgradeButton?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 覆盖每日投递次数的显示值（用于数据一致性） */
  overrideDailyDeliveryCount?: number;
}

/**
 * 配额显示组件
 *
 * 显示用户当前套餐和配额使用情况
 */
export const QuotaDisplay: React.FC<QuotaDisplayProps> = ({
  showUpgradeButton = true,
  className = '',
  overrideDailyDeliveryCount,
}) => {
  const navigate = useNavigate();
  const { userPlan, quotaUsage, getQuotaInfo, refreshPlan, refreshQuota } =
    usePlanPermission();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshPlan(), refreshQuota()]);
    } catch (error) {
      console.error('刷新套餐信息失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!userPlan || !quotaUsage) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/2 mb-4'></div>
          <div className='space-y-3'>
            <div className='h-4 bg-gray-200 rounded'></div>
            <div className='h-4 bg-gray-200 rounded'></div>
            <div className='h-4 bg-gray-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  const mainQuotas = [
    {
      key: 'resume_basic_optimize',
      name: '简历基础优化',
      icon: '📝',
      description: '优化简历基本内容',
    },
    {
      key: 'resume_advanced_optimize',
      name: '简历高级优化',
      icon: '✨',
      description: '深度优化简历结构',
    },
    {
      key: 'daily_job_application',
      name: '每日投递次数',
      icon: '📮',
      description: '每日可投递职位数量',
    },
  ];

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* 套餐信息头部 */}
      <div className='p-6 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              {userPlan.planName}
            </h3>
            <p className='text-sm text-gray-600 mt-1'>
              {userPlan.planType === 'FREE' && '免费版用户'}
              {userPlan.planType === 'BASIC' && `¥${userPlan.monthlyPrice}/月`}
              {userPlan.planType === 'PROFESSIONAL' &&
                `¥${userPlan.monthlyPrice}/月`}
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              title='刷新套餐信息'
            >
              <svg
                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                />
              </svg>
            </button>
            {showUpgradeButton && userPlan.planType !== 'PROFESSIONAL' && (
              <button
                onClick={() => navigate('/pricing')}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                升级套餐
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 配额列表 */}
      <div className='p-6 space-y-6'>
        {mainQuotas.map(quota => {
          const quotaInfo = getQuotaInfo(quota.key);
          if (!quotaInfo) return null;

          // ✅ 如果是每日投递且有override值，使用Boss统计数据
          const actualUsed =
            quota.key === 'daily_job_application' &&
            overrideDailyDeliveryCount !== undefined
              ? overrideDailyDeliveryCount
              : quotaInfo.used;
          const actualRemaining = quotaInfo.unlimited
            ? 999
            : quotaInfo.limit - actualUsed;
          const actualPercentage = quotaInfo.unlimited
            ? 0
            : (actualUsed / quotaInfo.limit) * 100;

          const isUnlimited = quotaInfo.unlimited;
          const isExceeded = actualPercentage >= 100;

          return (
            <div key={quota.key} className='space-y-2'>
              {/* 配额名称和剩余数量 */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <span className='text-2xl'>{quota.icon}</span>
                  <div>
                    <h4 className='text-sm font-medium text-gray-900'>
                      {quota.name}
                    </h4>
                    <p className='text-xs text-gray-500'>{quota.description}</p>
                  </div>
                </div>
                <div className='text-right'>
                  {isUnlimited ? (
                    <span className='text-sm font-semibold text-green-600'>
                      无限使用
                    </span>
                  ) : (
                    <span
                      className={`text-sm font-semibold ${
                        isExceeded
                          ? 'text-red-600'
                          : actualRemaining === 0
                            ? 'text-orange-600'
                            : 'text-gray-900'
                      }`}
                    >
                      {actualUsed} / {quotaInfo.limit}
                    </span>
                  )}
                </div>
              </div>

              {/* 进度条 */}
              {!isUnlimited && (
                <div className='relative'>
                  <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
                    <div
                      className={`h-full transition-all duration-300 ${
                        isExceeded
                          ? 'bg-red-500'
                          : actualPercentage > 80
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(actualPercentage, 100)}%` }}
                    />
                  </div>
                  {isExceeded && (
                    <p className='text-xs text-red-600 mt-1'>
                      配额已用完，请升级套餐或等待重置
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 提示信息 */}
      {userPlan.isExpiringSoon && (
        <div className='px-6 pb-6'>
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
            <p className='text-sm text-yellow-800'>
              ⚠️ 您的套餐即将过期，请及时续费以继续使用高级功能
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotaDisplay;
