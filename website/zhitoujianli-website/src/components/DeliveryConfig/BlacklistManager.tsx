/**
 * 黑名单管理组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import React, { useEffect, useState } from 'react';
import { BlacklistConfig as BlacklistConfigType } from '../../types/api';

interface BlacklistManagerProps {
  blacklistConfig: BlacklistConfigType;
  onBlacklistChange: (blacklistConfig: BlacklistConfigType) => void;
  loading?: boolean;
}

const BlacklistManager: React.FC<BlacklistManagerProps> = ({
  blacklistConfig,
  onBlacklistChange,
  loading = false,
}) => {
  const [formData, setFormData] =
    useState<BlacklistConfigType>(blacklistConfig);
  const [newCompany, setNewCompany] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    setFormData(blacklistConfig);
  }, [blacklistConfig]);

  /**
   * 处理输入变化
   */
  const handleInputChange = (field: keyof BlacklistConfigType, value: any) => {
    setFormData((prev: BlacklistConfigType) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * 添加公司黑名单
   */
  const addCompany = () => {
    if (newCompany.trim()) {
      const companies = [
        ...(formData.companyBlacklist || []),
        newCompany.trim(),
      ];
      handleInputChange('companyBlacklist', companies);
      setNewCompany('');
    }
  };

  /**
   * 删除公司黑名单
   */
  const removeCompany = (index: number) => {
    const companies =
      formData.companyBlacklist?.filter(
        (_: string, i: number) => i !== index
      ) || [];
    handleInputChange('companyBlacklist', companies);
  };

  /**
   * 添加职位黑名单
   */
  const addPosition = () => {
    if (newPosition.trim()) {
      const positions = [
        ...(formData.positionBlacklist || []),
        newPosition.trim(),
      ];
      handleInputChange('positionBlacklist', positions);
      setNewPosition('');
    }
  };

  /**
   * 删除职位黑名单
   */
  const removePosition = (index: number) => {
    const positions =
      formData.positionBlacklist?.filter(
        (_: string, i: number) => i !== index
      ) || [];
    handleInputChange('positionBlacklist', positions);
  };

  /**
   * 添加关键词黑名单
   */
  const addKeyword = () => {
    if (newKeyword.trim()) {
      const keywords = [
        ...(formData.keywordBlacklist || []),
        newKeyword.trim(),
      ];
      handleInputChange('keywordBlacklist', keywords);
      setNewKeyword('');
    }
  };

  /**
   * 删除关键词黑名单
   */
  const removeKeyword = (index: number) => {
    const keywords =
      formData.keywordBlacklist?.filter(
        (_: string, i: number) => i !== index
      ) || [];
    handleInputChange('keywordBlacklist', keywords);
  };

  /**
   * 保存配置
   */
  const handleSave = () => {
    onBlacklistChange(formData);
  };

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900'>黑名单管理</h3>
        <p className='text-sm text-gray-500'>
          设置需要过滤的公司、职位和关键词
        </p>
      </div>

      <div className='space-y-6'>
        {/* 黑名单开关 */}
        <div>
          <div className='flex items-center'>
            <input
              type='checkbox'
              id='enableBlacklistFilter'
              checked={formData.enableBlacklistFilter || false}
              onChange={e =>
                handleInputChange('enableBlacklistFilter', e.target.checked)
              }
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              disabled={loading}
            />
            <label
              htmlFor='enableBlacklistFilter'
              className='ml-2 block text-sm text-gray-700'
            >
              启用黑名单过滤
            </label>
          </div>
          <p className='mt-1 text-xs text-gray-500'>
            开启后系统将自动过滤黑名单中的公司、职位和关键词
          </p>
        </div>

        {/* 公司黑名单 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            公司黑名单
          </label>
          <div className='space-y-3'>
            <div className='flex space-x-2'>
              <input
                type='text'
                value={newCompany}
                onChange={e => setNewCompany(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addCompany()}
                className='flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='输入公司名称，如：某外包公司'
                disabled={loading}
              />
              <button
                type='button'
                onClick={addCompany}
                disabled={loading || !newCompany.trim()}
                className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                添加
              </button>
            </div>
            <div className='flex flex-wrap gap-2'>
              {formData.companyBlacklist?.map(
                (company: string, index: number) => (
                  <span
                    key={index}
                    className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800'
                  >
                    {company}
                    <button
                      type='button'
                      onClick={() => removeCompany(index)}
                      className='ml-2 text-red-600 hover:text-red-800'
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                )
              )}
            </div>
            {formData.companyBlacklist?.length === 0 && (
              <p className='text-sm text-gray-500'>暂无公司黑名单</p>
            )}
          </div>
        </div>

        {/* 职位黑名单 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            职位黑名单
          </label>
          <div className='space-y-3'>
            <div className='flex space-x-2'>
              <input
                type='text'
                value={newPosition}
                onChange={e => setNewPosition(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addPosition()}
                className='flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='输入职位名称，如：销售、客服'
                disabled={loading}
              />
              <button
                type='button'
                onClick={addPosition}
                disabled={loading || !newPosition.trim()}
                className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                添加
              </button>
            </div>
            <div className='flex flex-wrap gap-2'>
              {formData.positionBlacklist?.map(
                (position: string, index: number) => (
                  <span
                    key={index}
                    className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800'
                  >
                    {position}
                    <button
                      type='button'
                      onClick={() => removePosition(index)}
                      className='ml-2 text-red-600 hover:text-red-800'
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                )
              )}
            </div>
            {formData.positionBlacklist?.length === 0 && (
              <p className='text-sm text-gray-500'>暂无职位黑名单</p>
            )}
          </div>
        </div>

        {/* 关键词黑名单 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            关键词黑名单
          </label>
          <div className='space-y-3'>
            <div className='flex space-x-2'>
              <input
                type='text'
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addKeyword()}
                className='flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='输入关键词，如：外包、派遣'
                disabled={loading}
              />
              <button
                type='button'
                onClick={addKeyword}
                disabled={loading || !newKeyword.trim()}
                className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                添加
              </button>
            </div>
            <div className='flex flex-wrap gap-2'>
              {formData.keywordBlacklist?.map(
                (keyword: string, index: number) => (
                  <span
                    key={index}
                    className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800'
                  >
                    {keyword}
                    <button
                      type='button'
                      onClick={() => removeKeyword(index)}
                      className='ml-2 text-red-600 hover:text-red-800'
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                )
              )}
            </div>
            {formData.keywordBlacklist?.length === 0 && (
              <p className='text-sm text-gray-500'>暂无关键词黑名单</p>
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
          {loading ? '保存中...' : '保存黑名单'}
        </button>
      </div>

      {/* 使用提示 */}
      <div className='mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
        <div className='flex'>
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-yellow-400'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='ml-3'>
            <h4 className='text-sm font-medium text-yellow-800'>使用提示</h4>
            <div className='mt-2 text-sm text-yellow-700'>
              <ul className='list-disc list-inside space-y-1'>
                <li>黑名单过滤会在投递前进行，避免浪费投递机会</li>
                <li>
                  公司名称支持模糊匹配，如&quot;外包&quot;会过滤所有包含&quot;外包&quot;的公司
                </li>
                <li>职位名称和关键词同样支持模糊匹配</li>
                <li>建议定期更新黑名单，提高投递质量</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlacklistManager;
