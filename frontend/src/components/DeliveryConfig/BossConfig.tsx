/**
 * Boss直聘配置组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import React, { useEffect, useState } from 'react';
import { deliveryConfigValidator } from '../../services/deliveryService';
import { BossConfig as BossConfigType } from '../../types/api';
import BossServerLogin from '../BossServerLogin';
import bossLoginService from '../../services/bossLoginService';

interface BossConfigProps {
  config: BossConfigType;
  onConfigChange: (config: BossConfigType) => void;
  loading?: boolean;
}

const BossConfig: React.FC<BossConfigProps> = ({
  config,
  onConfigChange,
  loading = false,
}) => {
  const [formData, setFormData] = useState<BossConfigType>(config);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newKeyword, setNewKeyword] = useState('');
  const [newCity, setNewCity] = useState('');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isReLogging, setIsReLogging] = useState(false);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  /**
   * 处理输入变化
   */
  const handleInputChange = (field: keyof BossConfigType, value: any) => {
    setFormData((prev: BossConfigType) => ({
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
   * 添加关键词
   */
  const addKeyword = () => {
    if (newKeyword.trim()) {
      const keywords = [...(formData.keywords || []), newKeyword.trim()];
      handleInputChange('keywords', keywords);
      setNewKeyword('');
    }
  };

  /**
   * 删除关键词
   */
  const removeKeyword = (index: number) => {
    const keywords =
      formData.keywords?.filter((_: string, i: number) => i !== index) || [];
    handleInputChange('keywords', keywords);
  };

  /**
   * 添加城市
   */
  const addCity = () => {
    if (newCity.trim()) {
      const cities = [...(formData.cities || []), newCity.trim()];
      handleInputChange('cities', cities);
      setNewCity('');
    }
  };

  /**
   * 删除城市
   */
  const removeCity = (index: number) => {
    const cities =
      formData.cities?.filter((_: string, i: number) => i !== index) || [];
    handleInputChange('cities', cities);
  };

  /**
   * 处理薪资范围变化
   */
  const handleSalaryRangeChange = (
    field: 'minSalary' | 'maxSalary' | 'unit',
    value: any
  ) => {
    const salaryRange = {
      ...formData.salaryRange,
      [field]: value,
    };
    handleInputChange('salaryRange', salaryRange);
  };

  /**
   * 表单验证
   */
  const validateForm = (): boolean => {
    const validation = deliveryConfigValidator.validateBossConfig(formData);
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
      onConfigChange(formData);
    }
  };

  /**
   * 处理重新登录
   * 先清除Cookie，然后显示登录对话框
   */
  const handleReLogin = async () => {
    setIsReLogging(true);
    try {
      // 先清除现有Cookie
      await bossLoginService.clearCookie();
      console.log('✅ Cookie已清除，准备重新登录');

      // 显示登录对话框
      setShowLoginDialog(true);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('❌ 清除Cookie失败:', err);
      alert('清除Cookie失败: ' + (err.message || '未知错误'));
    } finally {
      setIsReLogging(false);
    }
  };

  /**
   * 登录成功回调
   */
  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    console.log('✅ Boss登录成功');
    // 可以在这里添加成功提示
  };

  /**
   * 取消登录回调
   */
  const handleLoginCancel = () => {
    setShowLoginDialog(false);
    console.log('❌ 用户取消了登录');
  };

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>Boss直聘配置</h3>
            <p className='text-sm text-gray-500'>
              配置搜索关键词、城市、薪资等投递参数
            </p>
          </div>
          <button
            type='button'
            onClick={handleReLogin}
            disabled={loading || isReLogging}
            className='px-4 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            title='清除Cookie并重新登录Boss直聘'
          >
            {isReLogging ? (
              <>
                <span className='inline-block animate-spin mr-2'>⏳</span>
                准备中...
              </>
            ) : (
              <>
                🔄 重新登录
              </>
            )}
          </button>
        </div>
      </div>

      <div className='space-y-6'>
        {/* 搜索关键词 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            搜索关键词 <span className='text-red-500'>*</span>
          </label>
          <p className='text-xs text-gray-500 mb-3'>
            💡 系统将搜索包含以下任意关键词的岗位（或的关系）
          </p>
          <div className='space-y-3'>
            <div className='flex space-x-2'>
              <input
                type='text'
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addKeyword()}
                className='flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='输入关键词，如：Java开发、前端工程师'
                disabled={loading}
              />
              <button
                type='button'
                onClick={addKeyword}
                disabled={loading || !newKeyword.trim()}
                className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                添加
              </button>
            </div>

            {/* 关键词列表 - 更清晰的显示 */}
            {formData.keywords && formData.keywords.length > 0 && (
              <div className='bg-gray-50 rounded-lg p-4'>
                <div className='flex items-center mb-2'>
                  <span className='text-sm font-medium text-gray-700'>
                    已添加的关键词：
                  </span>
                  <span className='ml-2 text-xs text-gray-500'>
                    (共{formData.keywords.length}个)
                  </span>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {formData.keywords.map((keyword: string, index: number) => (
                    <div
                      key={index}
                      className='inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200'
                    >
                      <span className='mr-2'>🔍</span>
                      {keyword}
                      <button
                        type='button'
                        onClick={() => removeKeyword(index)}
                        className='ml-2 text-blue-600 hover:text-red-600 hover:bg-red-100 rounded-full p-1 transition-colors'
                        disabled={loading}
                        title='删除此关键词'
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className='mt-2 text-xs text-gray-500'>
                  💡 系统将搜索包含以上任意关键词的岗位
                </div>
              </div>
            )}

            {errors.error_0 && (
              <p className='text-sm text-red-600'>{errors.error_0}</p>
            )}
          </div>
        </div>

        {/* 城市选择 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            目标城市 <span className='text-red-500'>*</span>
          </label>
          <p className='text-xs text-gray-500 mb-3'>
            💡 系统将搜索以下任意城市的岗位（或的关系）
          </p>
          <div className='space-y-3'>
            <div className='flex space-x-2'>
              <input
                type='text'
                value={newCity}
                onChange={e => setNewCity(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addCity()}
                className='flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='输入城市名称，如：北京、上海、深圳'
                disabled={loading}
              />
              <button
                type='button'
                onClick={addCity}
                disabled={loading || !newCity.trim()}
                className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                添加
              </button>
            </div>

            {/* 城市列表 - 更清晰的显示 */}
            {formData.cities && formData.cities.length > 0 && (
              <div className='bg-gray-50 rounded-lg p-4'>
                <div className='flex items-center mb-2'>
                  <span className='text-sm font-medium text-gray-700'>
                    已添加的城市：
                  </span>
                  <span className='ml-2 text-xs text-gray-500'>
                    (共{formData.cities.length}个)
                  </span>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {formData.cities.map((city: string, index: number) => (
                    <div
                      key={index}
                      className='inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 border border-green-200'
                    >
                      <span className='mr-2'>📍</span>
                      {city}
                      <button
                        type='button'
                        onClick={() => removeCity(index)}
                        className='ml-2 text-green-600 hover:text-red-600 hover:bg-red-100 rounded-full p-1 transition-colors'
                        disabled={loading}
                        title='删除此城市'
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className='mt-2 text-xs text-gray-500'>
                  💡 系统将搜索以上任意城市的岗位
                </div>
              </div>
            )}

            {errors.error_1 && (
              <p className='text-sm text-red-600'>{errors.error_1}</p>
            )}
          </div>
        </div>

        {/* 薪资范围 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            薪资范围
          </label>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-xs font-medium text-gray-500 mb-1'>
                最低薪资
              </label>
              <input
                type='number'
                min='0'
                value={formData.salaryRange?.minSalary || ''}
                onChange={e =>
                  handleSalaryRangeChange(
                    'minSalary',
                    parseInt(e.target.value) || 0
                  )
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='如：10'
                disabled={loading}
              />
            </div>
            <div>
              <label className='block text-xs font-medium text-gray-500 mb-1'>
                最高薪资
              </label>
              <input
                type='number'
                min='0'
                value={formData.salaryRange?.maxSalary || ''}
                onChange={e =>
                  handleSalaryRangeChange(
                    'maxSalary',
                    parseInt(e.target.value) || 0
                  )
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='如：30'
                disabled={loading}
              />
            </div>
            <div>
              <label className='block text-xs font-medium text-gray-500 mb-1'>
                单位
              </label>
              <select
                value={formData.salaryRange?.unit || 'K'}
                onChange={e => handleSalaryRangeChange('unit', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                disabled={loading}
              >
                <option value='K'>K</option>
                <option value='W'>W</option>
              </select>
            </div>
          </div>
          {errors.error_2 && (
            <p className='text-sm text-red-600'>{errors.error_2}</p>
          )}
        </div>

        {/* 工作经验要求 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            工作经验要求
          </label>
          <select
            value={formData.experienceRequirement || ''}
            onChange={e =>
              handleInputChange('experienceRequirement', e.target.value)
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            disabled={loading}
          >
            <option value=''>不限</option>
            <option value='1年以下'>1年以下</option>
            <option value='1-3年'>1-3年</option>
            <option value='3-5年'>3-5年</option>
            <option value='5-10年'>5-10年</option>
            <option value='10年以上'>10年以上</option>
          </select>
        </div>

        {/* 学历要求 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            学历要求
          </label>
          <select
            value={formData.educationRequirement || ''}
            onChange={e =>
              handleInputChange('educationRequirement', e.target.value)
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            disabled={loading}
          >
            <option value=''>不限</option>
            <option value='高中'>高中</option>
            <option value='大专'>大专</option>
            <option value='本科'>本科</option>
            <option value='硕士'>硕士</option>
            <option value='博士'>博士</option>
          </select>
        </div>

        {/* 智能打招呼语 */}
        <div>
          <div className='flex items-center'>
            <input
              type='checkbox'
              id='enableSmartGreeting'
              checked={formData.enableSmartGreeting || false}
              onChange={e =>
                handleInputChange('enableSmartGreeting', e.target.checked)
              }
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              disabled={loading}
            />
            <label
              htmlFor='enableSmartGreeting'
              className='ml-2 block text-sm text-gray-700'
            >
              启用智能打招呼语生成（基于简历+JD）
            </label>
          </div>
        </div>

        {/* 默认打招呼语 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            默认打招呼语
          </label>
          <textarea
            value={formData.defaultGreeting || ''}
            onChange={e => handleInputChange('defaultGreeting', e.target.value)}
            rows={4}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='请输入默认的打招呼语内容...'
            disabled={loading}
          />
          <p className='mt-1 text-xs text-gray-500'>
            当智能打招呼语生成失败时，将使用此默认内容
          </p>
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
          {loading ? '保存中...' : '保存配置'}
        </button>
      </div>

      {/* Boss登录对话框 */}
      {showLoginDialog && (
        <BossServerLogin
          onSuccess={handleLoginSuccess}
          onCancel={handleLoginCancel}
        />
      )}
    </div>
  );
};

export default BossConfig;
