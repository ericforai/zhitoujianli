import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanPermission } from '../../hooks/usePlanPermission';

/**
 * 升级提示组件Props
 */
interface UpgradePromptProps {
  /** 功能名称 */
  featureName?: string;
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示为内联模式 */
  inline?: boolean;
}

/**
 * 升级提示组件
 *
 * 当用户配额不足或权限不够时，显示升级提示
 */
export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  featureName = '此功能',
  className = '',
  inline = false,
}) => {
  const navigate = useNavigate();
  const { getRecommendedUpgrade, userPlan } = usePlanPermission();

  const recommendedPlan = getRecommendedUpgrade();

  const getPlanName = (planType: string) => {
    switch (planType) {
      case 'BASIC':
        return '高效求职版';
      case 'PROFESSIONAL':
        return '极速上岸版';
      default:
        return '高级版本';
    }
  };

  const getPlanPrice = (planType: string) => {
    switch (planType) {
      case 'BASIC':
        return '¥49';
      case 'PROFESSIONAL':
        return '¥99';
      default:
        return '';
    }
  };

  if (inline) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className='text-sm text-gray-600'>
          {featureName}需要升级到
          {recommendedPlan && getPlanName(recommendedPlan)}
        </span>
        <button
          onClick={() => navigate('/pricing')}
          className='text-sm text-blue-600 hover:text-blue-700 font-medium underline'
        >
          立即升级
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 ${className}`}
    >
      <div className='flex items-start'>
        {/* 图标 */}
        <div className='flex-shrink-0'>
          <div className='h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center'>
            <svg
              className='h-6 w-6 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 10V3L4 14h7v7l9-11h-7z'
              />
            </svg>
          </div>
        </div>

        {/* 内容 */}
        <div className='ml-4 flex-1'>
          <h3 className='text-lg font-semibold text-gray-900'>
            升级解锁{featureName}
          </h3>
          <p className='mt-2 text-sm text-gray-600'>
            您当前使用的是{userPlan?.planName}，{featureName}需要升级到
            {recommendedPlan && getPlanName(recommendedPlan)}
            {recommendedPlan &&
              getPlanPrice(recommendedPlan) &&
              `（${getPlanPrice(recommendedPlan)}/月）`}
            才能使用。
          </p>

          {/* 功能亮点 */}
          {recommendedPlan && (
            <div className='mt-4 space-y-2'>
              <p className='text-sm font-medium text-gray-900'>
                升级后您将获得：
              </p>
              <ul className='space-y-1'>
                {recommendedPlan === 'BASIC' && (
                  <>
                    <li className='text-sm text-gray-600 flex items-center'>
                      <svg
                        className='h-4 w-4 text-green-500 mr-2'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                          clipRule='evenodd'
                        />
                      </svg>
                      简历基础优化不限次数
                    </li>
                    <li className='text-sm text-gray-600 flex items-center'>
                      <svg
                        className='h-4 w-4 text-green-500 mr-2'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                          clipRule='evenodd'
                        />
                      </svg>
                      简历高级优化 1次
                    </li>
                    <li className='text-sm text-gray-600 flex items-center'>
                      <svg
                        className='h-4 w-4 text-green-500 mr-2'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                          clipRule='evenodd'
                        />
                      </svg>
                      每日投递 30次
                    </li>
                  </>
                )}
                {recommendedPlan === 'PROFESSIONAL' && (
                  <>
                    <li className='text-sm text-gray-600 flex items-center'>
                      <svg
                        className='h-4 w-4 text-green-500 mr-2'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                          clipRule='evenodd'
                        />
                      </svg>
                      简历基础优化不限次数
                    </li>
                    <li className='text-sm text-gray-600 flex items-center'>
                      <svg
                        className='h-4 w-4 text-green-500 mr-2'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                          clipRule='evenodd'
                        />
                      </svg>
                      简历高级优化 3次
                    </li>
                    <li className='text-sm text-gray-600 flex items-center'>
                      <svg
                        className='h-4 w-4 text-green-500 mr-2'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                          clipRule='evenodd'
                        />
                      </svg>
                      每日投递 100次
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}

          {/* 升级按钮 */}
          <div className='mt-6 flex items-center space-x-3'>
            <button
              onClick={() => navigate('/pricing')}
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
            >
              立即升级
            </button>
            <button
              onClick={() => navigate('/scenes')}
              className='px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
            >
              了解更多
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
