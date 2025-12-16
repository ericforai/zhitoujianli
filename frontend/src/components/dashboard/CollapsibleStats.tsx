import React, { useState } from 'react';

/**
 * 统计卡片数据类型
 */
interface StatCardData {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'red' | 'orange';
  onClick?: () => void;
  clickable?: boolean;
}

/**
 * 可折叠统计Props
 */
interface CollapsibleStatsProps {
  /** 统计卡片数据 */
  stats: StatCardData[];
  /** 默认是否展开 */
  defaultExpanded?: boolean;
  /** 自定义className */
  className?: string;
}

/**
 * 可折叠统计组件
 *
 * 将统计卡片整合到可折叠区域，减少首屏信息密度
 */
export const CollapsibleStats: React.FC<CollapsibleStatsProps> = ({
  stats,
  defaultExpanded = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'green':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'red':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'orange':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* 折叠/展开控制栏 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors'
      >
        <div className='flex items-center space-x-2'>
          <span className='text-xl'>📊</span>
          <h3 className='text-lg font-semibold text-gray-900'>详细统计</h3>
          <span className='text-sm text-gray-500'>({stats.length}项指标)</span>
        </div>
        <div className='flex items-center space-x-2'>
          {!isExpanded && (
            <span className='text-sm text-gray-500'>点击查看详情</span>
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
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className='px-6 pb-6 pt-2'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {stats.map((stat, index) => (
              <div
                key={index}
                onClick={stat.clickable ? stat.onClick : undefined}
                className={`rounded-lg p-4 border ${getColorClasses(stat.color)} ${
                  stat.clickable
                    ? 'cursor-pointer hover:shadow-md transition-shadow'
                    : ''
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600 mb-1'>
                      {stat.title}
                    </p>
                    <p className='text-2xl font-bold'>{stat.value}</p>
                  </div>
                  <span className='text-3xl'>{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleStats;
