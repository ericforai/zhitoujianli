import React, { useState } from 'react';
import QuotaDisplay from '../plan/QuotaDisplay';
import { usePlanPermission } from '../../hooks/usePlanPermission';

/**
 * 可折叠配额显示Props
 */
interface CollapsibleQuotaProps {
  /** 默认是否展开 */
  defaultExpanded?: boolean;
  /** 自定义className */
  className?: string;
  /** 今日投递数量（用于数据一致性） */
  todayDeliveryCount?: number;
}

/**
 * 可折叠配额显示组件
 *
 * 在折叠状态显示关键配额信息，展开后显示完整QuotaDisplay
 */
export const CollapsibleQuota: React.FC<CollapsibleQuotaProps> = ({
  defaultExpanded = false,
  className = '',
  todayDeliveryCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { userPlan, getQuotaInfo } = usePlanPermission();

  // 获取关键配额
  const dailyQuota = getQuotaInfo('daily_job_application');
  const advancedQuota = getQuotaInfo('resume_advanced_optimize');

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* 折叠/展开控制栏 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors'
      >
        <div className='flex items-center space-x-3'>
          <span className='text-xl'>💳</span>
          <div className='text-left'>
            <h3 className='text-lg font-semibold text-gray-900'>
              {userPlan?.planName || '套餐详情'}
            </h3>
            {!isExpanded && (
              <div className='flex items-center space-x-4 mt-1 text-sm text-gray-600'>
                {dailyQuota && (
                  <span>
                    📮 每日投递:{' '}
                    <span className='font-medium text-gray-900'>
                      {dailyQuota.unlimited ? '∞' : `${dailyQuota.used}/${dailyQuota.limit}`}
                    </span>
                  </span>
                )}
                {advancedQuota && advancedQuota.limit > 0 && (
                  <span>
                    ✨ 高级优化:{' '}
                    <span className='font-medium text-gray-900'>
                      {advancedQuota.used}/{advancedQuota.limit}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          {!isExpanded && (
            <span className='text-sm text-gray-500'>查看完整配额</span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </div>
      </button>

      {/* 可折叠内容区域 */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className='px-6 pb-6 pt-2'>
          {/* 使用现有的QuotaDisplay组件，传递Boss统计数据确保一致性 */}
          <QuotaDisplay
            showUpgradeButton={false}
            overrideDailyDeliveryCount={todayDeliveryCount}
          />
        </div>
      </div>
    </div>
  );
};

export default CollapsibleQuota;

