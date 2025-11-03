/**
 * 投递设置组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import React, { useEffect, useState } from 'react';
import { deliveryConfigValidator } from '../../services/deliveryService';
import { DeliveryStrategy as DeliveryStrategyType } from '../../types/api';

interface DeliverySettingsProps {
  strategy: DeliveryStrategyType;
  onStrategyChange: (strategy: DeliveryStrategyType) => void;
  loading?: boolean;
}

const DeliverySettings: React.FC<DeliverySettingsProps> = ({
  strategy,
  onStrategyChange,
  loading = false,
}) => {
  const [formData, setFormData] = useState<DeliveryStrategyType>(strategy);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(strategy);
  }, [strategy]);

  /**
   * 处理输入变化
   */
  const handleInputChange = (field: keyof DeliveryStrategyType, value: any) => {
    setFormData((prev: DeliveryStrategyType) => ({
      ...prev,
      [field]: value,
    }));

    // 清除该字段的错误
    if (errors[field as string]) {
      setErrors(prev => ({
        ...prev,
        [field as string]: '',
      }));
    }
  };

  /**
   * 处理时间范围变化
   */
  const handleTimeRangeChange = (
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const timeRange = {
      ...formData.deliveryTimeRange,
      [field]: value,
    };
    handleInputChange('deliveryTimeRange', timeRange);
  };

  /**
   * 表单验证
   */
  const validateForm = (): boolean => {
    const validation =
      deliveryConfigValidator.validateDeliveryStrategy(formData);
    if (!validation.valid) {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach((error, index) => {
        newErrors[`error_${index}`] = error;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  /**
   * 保存配置
   */
  const handleSave = () => {
    if (validateForm()) {
      onStrategyChange(formData);
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900'>投递策略设置</h3>
        <p className='text-sm text-gray-500'>
          配置投递频率、时间范围等策略参数
        </p>
      </div>

      <div className='space-y-6'>
        {/* 自动投递开关 */}
        <div>
          <div className='flex items-center'>
            <input
              type='checkbox'
              id='enableAutoDelivery'
              checked={formData.enableAutoDelivery || false}
              onChange={e =>
                handleInputChange('enableAutoDelivery', e.target.checked)
              }
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              disabled={loading}
            />
            <label
              htmlFor='enableAutoDelivery'
              className='ml-2 block text-sm text-gray-700'
            >
              启用自动投递
            </label>
          </div>
          <p className='mt-1 text-xs text-gray-500'>
            开启后系统将根据配置的策略自动投递简历
          </p>
        </div>

        {/* 投递频率 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            投递频率（次/小时） <span className='text-red-500'>*</span>
          </label>
          <div className='flex items-center space-x-4'>
            <input
              type='number'
              min='1'
              max='60'
              value={formData.deliveryFrequency || ''}
              onChange={e =>
                handleInputChange(
                  'deliveryFrequency',
                  parseInt(e.target.value) || 1
                )
              }
              className='w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              disabled={loading}
            />
            <span className='text-sm text-gray-500'>次/小时</span>
          </div>
          <p className='mt-1 text-xs text-gray-500'>
            建议设置10-20次/小时，避免过于频繁被平台限制
          </p>
          {errors.error_0 && (
            <p className='text-sm text-red-600'>{errors.error_0}</p>
          )}
        </div>

        {/* 每日最大投递数 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            每日最大投递数 <span className='text-red-500'>*</span>
          </label>
          <div className='flex items-center space-x-4'>
            <input
              type='number'
              min='1'
              max='200'
              value={formData.maxDailyDelivery || ''}
              onChange={e =>
                handleInputChange(
                  'maxDailyDelivery',
                  parseInt(e.target.value) || 1
                )
              }
              className='w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              disabled={loading}
            />
            <span className='text-sm text-gray-500'>次/天</span>
          </div>
          <p className='mt-1 text-xs text-gray-500'>
            建议设置50-100次/天，确保投递质量
          </p>
          {errors.error_1 && (
            <p className='text-sm text-red-600'>{errors.error_1}</p>
          )}
        </div>

        {/* 投递间隔 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            投递间隔（秒） <span className='text-red-500'>*</span>
          </label>
          <div className='flex items-center space-x-4'>
            <input
              type='number'
              min='0'
              max='3600'
              value={formData.deliveryInterval || ''}
              onChange={e =>
                handleInputChange(
                  'deliveryInterval',
                  parseInt(e.target.value) || 0
                )
              }
              className='w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              disabled={loading}
            />
            <span className='text-sm text-gray-500'>秒</span>
          </div>
          <p className='mt-1 text-xs text-gray-500'>
            建议设置300-600秒（5-10分钟），避免被平台检测为机器人
          </p>
          {errors.error_2 && (
            <p className='text-sm text-red-600'>{errors.error_2}</p>
          )}
        </div>

        {/* 投递时间范围 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            投递时间范围
          </label>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-xs font-medium text-gray-500 mb-1'>
                开始时间
              </label>
              <input
                type='time'
                value={formData.deliveryTimeRange?.startTime || '09:00'}
                onChange={e =>
                  handleTimeRangeChange('startTime', e.target.value)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                disabled={loading}
              />
            </div>
            <div>
              <label className='block text-xs font-medium text-gray-500 mb-1'>
                结束时间
              </label>
              <input
                type='time'
                value={formData.deliveryTimeRange?.endTime || '18:00'}
                onChange={e => handleTimeRangeChange('endTime', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                disabled={loading}
              />
            </div>
          </div>
          <p className='mt-1 text-xs text-gray-500'>
            只在指定时间范围内进行投递，建议设置为工作日9:00-18:00
          </p>
        </div>

        {/* 匹配度阈值 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            匹配度阈值 <span className='text-red-500'>*</span>
          </label>
          <div className='space-y-3'>
            <div className='flex items-center space-x-4'>
              <input
                type='range'
                min='0'
                max='1'
                step='0.1'
                value={formData.matchThreshold || 0.7}
                onChange={e =>
                  handleInputChange(
                    'matchThreshold',
                    parseFloat(e.target.value)
                  )
                }
                className='flex-1'
                disabled={loading}
              />
              <span className='text-sm font-medium text-gray-700 w-12'>
                {Math.round((formData.matchThreshold || 0.7) * 100)}%
              </span>
            </div>
            <div className='flex justify-between text-xs text-gray-500'>
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <p className='text-xs text-gray-500'>
              只投递匹配度高于此阈值的职位，建议设置为70%
            </p>
            {errors.error_3 && (
              <p className='text-sm text-red-600'>{errors.error_3}</p>
            )}
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className='flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200'>
        <button
          type='button'
          onClick={handleSave}
          disabled={loading}
          className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? '保存中...' : '保存设置'}
        </button>
      </div>
    </div>
  );
};

export default DeliverySettings;
