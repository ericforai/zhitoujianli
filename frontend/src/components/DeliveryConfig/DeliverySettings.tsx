/**
 * 投递设置组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import React, { useEffect, useState } from 'react';
import { deliveryConfigValidator } from '../../services/deliveryService';
import { DeliveryStrategy as DeliveryStrategyType, MatchingSchemes } from '../../types/api';

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

  // 匹配策略预设配置
  const matchingModePresets = {
    STRICT: {
      name: '严格模式',
      description: '只匹配完全符合关键词的岗位，精准度高',
      schemes: { scheme1: true, scheme2: false, scheme3: false, scheme4: false, scheme5: false },
    },
    STANDARD: {
      name: '标准模式',
      description: '平衡精准度和覆盖面，推荐使用',
      schemes: { scheme1: true, scheme2: true, scheme3: true, scheme4: false, scheme5: false },
    },
    FLEXIBLE: {
      name: '灵活模式',
      description: '最大化匹配覆盖面，可能包含相关岗位',
      schemes: { scheme1: true, scheme2: true, scheme3: true, scheme4: true, scheme5: true },
    },
  };

  // 匹配方案说明
  const schemeDescriptions = [
    {
      id: 'scheme1',
      name: '方案1：开头匹配',
      description: '岗位名称以关键词开头',
      example: '关键词"市场总监" → 匹配"市场总监（北京）"',
      score: '100%',
    },
    {
      id: 'scheme2',
      name: '方案2：关键词+职位词组合',
      description: '关键词后面跟着职位相关词汇',
      example: '关键词"市场" → 匹配"市场总监"、"市场经理"',
      score: '80%',
    },
    {
      id: 'scheme3',
      name: '方案3：完整词匹配',
      description: '关键词是完整词（词边界检查）',
      example: '关键词"营销" → 匹配"数字营销总监"（完整词）',
      score: '70%',
    },
    {
      id: 'scheme4',
      name: '方案4：拆分匹配',
      description: '长关键词拆分匹配（适用于包含职位词的关键词）',
      example: '关键词"营销总监" → 匹配"营销运营总监"',
      score: '60%',
    },
    {
      id: 'scheme5',
      name: '方案5：短词+职位组合',
      description: '短关键词与职位词组合匹配',
      example: '关键词"市场" → 匹配"市场销售总监"',
      score: '60%',
    },
  ];

  useEffect(() => {
    // 处理向后兼容：为旧配置提供默认值
    const normalizedStrategy: DeliveryStrategyType = {
      enableAutoDelivery: strategy.enableAutoDelivery || false,
      deliveryFrequency: strategy.deliveryFrequency || 10,
      maxDailyDelivery: strategy.maxDailyDelivery || 50,
      deliveryInterval: strategy.deliveryInterval || 300,
      matchThreshold: strategy.matchThreshold || 0.7,
      deliveryTimeRange: strategy.deliveryTimeRange || {
        startTime: '09:00',
        endTime: '18:00',
      },
      keywordMatchingMode: strategy.keywordMatchingMode || 'STANDARD',
      matchingSchemes: strategy.matchingSchemes || {
        scheme1: true,
        scheme2: true,
        scheme3: true,
        scheme4: false,
        scheme5: false,
      },
    };
    setFormData(normalizedStrategy);
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
   * 处理匹配模式变化
   */
  const handleMatchingModeChange = (mode: 'STRICT' | 'STANDARD' | 'FLEXIBLE' | 'CUSTOM') => {
    if (mode === 'CUSTOM') {
      // 自定义模式：保持现有schemes配置
      setFormData(prev => ({
        ...prev,
        keywordMatchingMode: 'CUSTOM',
      }));
    } else {
      // 预设模式：应用对应的schemes配置
      const preset = matchingModePresets[mode];
      setFormData(prev => ({
        ...prev,
        keywordMatchingMode: mode,
        matchingSchemes: preset.schemes,
      }));
    }
  };

  /**
   * 处理匹配方案开关变化
   */
  const handleSchemeToggle = (schemeId: keyof MatchingSchemes, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      keywordMatchingMode: 'CUSTOM', // 切换到自定义模式
      matchingSchemes: {
        ...prev.matchingSchemes,
        [schemeId]: enabled,
      },
    }));
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

        {/* 关键词匹配策略 */}
        <div className='border-t border-gray-200 pt-6'>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-900 mb-1'>
              关键词匹配策略
            </label>
            <p className='text-xs text-gray-500'>
              选择匹配方式，控制哪些岗位会被投递。匹配度会根据启用的方案自动计算。
            </p>
          </div>

          {/* 预设模式选择 */}
          <div className='mb-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              {(['STRICT', 'STANDARD', 'FLEXIBLE'] as const).map(mode => {
                const preset = matchingModePresets[mode];
                const isSelected = formData.keywordMatchingMode === mode;
                return (
                  <button
                    key={mode}
                    type='button'
                    onClick={() => handleMatchingModeChange(mode)}
                    disabled={loading}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className='flex items-center justify-between mb-1'>
                      <span className='text-sm font-medium text-gray-900'>
                        {preset.name}
                      </span>
                      {isSelected && (
                        <svg
                          className='w-5 h-5 text-blue-600'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 0116 0zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                            clipRule='evenodd'
                          />
                        </svg>
                      )}
                    </div>
                    <p className='text-xs text-gray-600'>{preset.description}</p>
                  </button>
                );
              })}
            </div>
            <button
              type='button'
              onClick={() => handleMatchingModeChange('CUSTOM')}
              disabled={loading}
              className={`mt-3 px-4 py-2 text-sm border-2 rounded-lg transition-all ${
                formData.keywordMatchingMode === 'CUSTOM'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              自定义匹配方案
            </button>
          </div>

          {/* 匹配方案详细配置（自定义模式或展开查看） */}
          <div className='bg-gray-50 rounded-lg p-4 space-y-3'>
            <div className='text-sm font-medium text-gray-900 mb-3'>
              匹配方案详情
              {formData.keywordMatchingMode !== 'CUSTOM' && (
                <span className='ml-2 text-xs font-normal text-gray-500'>
                  （当前使用{formData.keywordMatchingMode === 'STRICT' ? '严格' : formData.keywordMatchingMode === 'FLEXIBLE' ? '灵活' : '标准'}模式预设）
                </span>
              )}
            </div>
            {schemeDescriptions.map(scheme => {
              const schemeKey = scheme.id as keyof MatchingSchemes;
              // 计算是否启用：优先使用matchingSchemes配置，否则根据模式推断
              let isEnabled = false;
              if (formData.matchingSchemes && formData.matchingSchemes[schemeKey] !== undefined) {
                isEnabled = formData.matchingSchemes[schemeKey] || false;
              } else {
                // 根据匹配模式推断
                const mode = formData.keywordMatchingMode || 'STANDARD';
                if (mode === 'STRICT') {
                  isEnabled = schemeKey === 'scheme1';
                } else if (mode === 'FLEXIBLE') {
                  isEnabled = true;
                } else {
                  // STANDARD 或默认
                  isEnabled = ['scheme1', 'scheme2', 'scheme3'].includes(schemeKey);
                }
              }
              const canToggle = (formData.keywordMatchingMode || 'STANDARD') === 'CUSTOM';

              return (
                <div
                  key={scheme.id}
                  className={`p-3 border rounded-lg ${
                    isEnabled ? 'border-blue-200 bg-white' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between mb-1'>
                        <div className='flex items-center space-x-2'>
                          <span className='text-sm font-medium text-gray-900'>
                            {scheme.name}
                          </span>
                          <span className='text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded'>
                            {scheme.score}
                          </span>
                        </div>
                        {canToggle && (
                          <label className='relative inline-flex items-center cursor-pointer'>
                            <input
                              type='checkbox'
                              checked={isEnabled}
                              onChange={e =>
                                handleSchemeToggle(schemeKey, e.target.checked)
                              }
                              disabled={loading}
                              className='sr-only peer'
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        )}
                        {!canToggle && (
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              isEnabled
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {isEnabled ? '已启用' : '未启用'}
                          </span>
                        )}
                      </div>
                      <p className='text-xs text-gray-600 mb-1'>{scheme.description}</p>
                      <p className='text-xs text-gray-500 italic'>{scheme.example}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 匹配度阈值（保留作为兜底） */}
          <div className='mt-4 pt-4 border-t border-gray-200'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              匹配度阈值（兜底设置）
            </label>
            <div className='flex items-center space-x-4'>
              <input
                type='range'
                min='0'
                max='1'
                step='0.1'
                value={formData.matchThreshold || 0.7}
                onChange={e =>
                  handleInputChange('matchThreshold', parseFloat(e.target.value))
                }
                className='flex-1'
                disabled={loading}
              />
              <span className='text-sm font-medium text-gray-700 w-12'>
                {Math.round((formData.matchThreshold || 0.7) * 100)}%
              </span>
            </div>
            <p className='mt-1 text-xs text-gray-500'>
              最终匹配度必须高于此阈值才会投递（建议70%）
            </p>
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
