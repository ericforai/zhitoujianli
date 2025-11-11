/**
 * 黑名单管理组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 * @updated 2025-11-04 - 直接集成黑名单API
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  blacklistService,
  BlacklistData,
} from '../../services/blacklistService';
import type { ApiError } from '../../hooks/useErrorHandler';

interface BlacklistManagerProps {
  blacklistConfig?: BlacklistData;
  onBlacklistChange?: (config: BlacklistData) => void;
  loading?: boolean;
}

const BlacklistManager: React.FC<BlacklistManagerProps> = () => {
  const [formData, setFormData] = useState<BlacklistData>({
    companyBlacklist: [],
    positionBlacklist: [],
    enableBlacklistFilter: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newCompany, setNewCompany] = useState('');
  const [newPosition, setNewPosition] = useState('');

  /**
   * 加载黑名单配置
   */
  const loadBlacklist = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const response = await blacklistService.getBlacklist();
      if (response.code === 200 && response.data) {
        setFormData(response.data);
      } else {
        setErrorMessage(response.message);
      }
    } catch (error: unknown) {
      // ✅ 修复：使用unknown类型替代any
      console.error('加载黑名单配置失败:', error);
      const apiError = error as ApiError | Error;
      const errorMessage =
        apiError instanceof Error
          ? apiError.message
          : apiError?.response?.data?.message || '加载黑名单配置失败';
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 保存黑名单配置
   */
  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const response = await blacklistService.updateBlacklist(formData);
      if (response.code === 200) {
        setSuccessMessage('黑名单配置保存成功！');
        setTimeout(() => setSuccessMessage(null), 3000);
        // 重新加载以确保数据一致
        await loadBlacklist();
      } else {
        setErrorMessage(response.message);
      }
    } catch (error: unknown) {
      // ✅ 修复：使用unknown类型替代any
      console.error('保存黑名单配置失败:', error);
      const apiError = error as ApiError | Error;
      const errorMessage =
        apiError instanceof Error
          ? apiError.message
          : apiError?.response?.data?.message || '保存黑名单配置失败';
      setErrorMessage(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  /**
   * 添加公司黑名单
   */
  const addCompany = useCallback(() => {
    if (newCompany.trim()) {
      setFormData(prev => ({
        ...prev,
        companyBlacklist: [...(prev.companyBlacklist || []), newCompany.trim()],
      }));
      setNewCompany('');
    }
  }, [newCompany]);

  /**
   * 删除公司黑名单
   */
  const removeCompany = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      companyBlacklist:
        prev.companyBlacklist?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  /**
   * 添加职位黑名单
   */
  const addPosition = useCallback(() => {
    if (newPosition.trim()) {
      setFormData(prev => ({
        ...prev,
        positionBlacklist: [
          ...(prev.positionBlacklist || []),
          newPosition.trim(),
        ],
      }));
      setNewPosition('');
    }
  }, [newPosition]);

  /**
   * 删除职位黑名单
   */
  const removePosition = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      positionBlacklist:
        prev.positionBlacklist?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  /**
   * 切换黑名单过滤开关
   */
  const toggleFilter = useCallback((checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      enableBlacklistFilter: checked,
    }));
  }, []);

  // 组件挂载时加载黑名单
  useEffect(() => {
    loadBlacklist();
  }, [loadBlacklist]);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2 text-gray-600'>加载黑名单配置中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900'>黑名单管理</h3>
        <p className='text-sm text-gray-500'>
          设置需要过滤的公司、职位关键词，避免投递不合适的岗位
        </p>
      </div>

      {/* 成功消息 */}
      {successMessage && (
        <div className='mb-6 bg-green-50 border border-green-200 rounded-md p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-green-400'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 0016 0zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-green-800'>
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 错误消息 */}
      {errorMessage && (
        <div className='mb-6 bg-red-50 border border-red-200 rounded-md p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-red-400'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-red-800'>{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className='space-y-6'>
        {/* 黑名单开关 */}
        <div>
          <div className='flex items-center'>
            <input
              type='checkbox'
              id='enableBlacklistFilter'
              checked={formData.enableBlacklistFilter}
              onChange={e => toggleFilter(e.target.checked)}
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              disabled={saving}
            />
            <label
              htmlFor='enableBlacklistFilter'
              className='ml-2 block text-sm font-medium text-gray-700'
            >
              启用黑名单过滤
            </label>
          </div>
          <p className='mt-1 text-xs text-gray-500'>
            开启后系统将自动过滤黑名单中的公司和职位，避免浪费投递机会
          </p>
        </div>

        {/* 公司黑名单 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            公司黑名单 <span className='text-xs text-gray-500'>(模糊匹配)</span>
          </label>
          <div className='space-y-3'>
            <div className='flex space-x-2'>
              <input
                type='text'
                value={newCompany}
                onChange={e => setNewCompany(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addCompany()}
                className='flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='输入公司名称，如：外包、猎头'
                disabled={saving}
              />
              <button
                type='button'
                onClick={addCompany}
                disabled={saving || !newCompany.trim()}
                className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                添加
              </button>
            </div>
            <div className='flex flex-wrap gap-2'>
              {formData.companyBlacklist &&
              formData.companyBlacklist.length > 0 ? (
                formData.companyBlacklist.map(
                  (company: string, index: number) => (
                    <span
                      key={index}
                      className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800'
                    >
                      🏢 {company}
                      <button
                        type='button'
                        onClick={() => removeCompany(index)}
                        className='ml-2 text-red-600 hover:text-red-800 font-bold'
                        disabled={saving}
                      >
                        ×
                      </button>
                    </span>
                  )
                )
              ) : (
                <p className='text-sm text-gray-400 italic'>暂无公司黑名单</p>
              )}
            </div>
          </div>
        </div>

        {/* 职位黑名单 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            职位关键词黑名单{' '}
            <span className='text-xs text-gray-500'>(模糊匹配)</span>
          </label>
          <div className='bg-blue-50 border border-blue-200 rounded-md p-3 mb-3'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-blue-400'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <p className='text-sm text-blue-700'>
                  💡 模糊匹配规则：岗位名称包含关键词即会被过滤
                </p>
                <p className='text-xs text-blue-600 mt-1'>
                  例如：&quot;销售&quot;会过滤&quot;销售总监&quot;、&quot;大客户销售&quot;等所有包含&quot;销售&quot;的岗位
                </p>
              </div>
            </div>
          </div>
          <div className='space-y-3'>
            <div className='flex space-x-2'>
              <input
                type='text'
                value={newPosition}
                onChange={e => setNewPosition(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addPosition()}
                className='flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='输入关键词，如：销售代表、客服'
                disabled={saving}
              />
              <button
                type='button'
                onClick={addPosition}
                disabled={saving || !newPosition.trim()}
                className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                添加
              </button>
            </div>
            <div className='flex flex-wrap gap-2'>
              {formData.positionBlacklist &&
              formData.positionBlacklist.length > 0 ? (
                formData.positionBlacklist.map(
                  (position: string, index: number) => (
                    <span
                      key={index}
                      className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800'
                    >
                      🚫 {position}
                      <button
                        type='button'
                        onClick={() => removePosition(index)}
                        className='ml-2 text-red-600 hover:text-red-800 font-bold'
                        disabled={saving}
                      >
                        ×
                      </button>
                    </span>
                  )
                )
              ) : (
                <p className='text-sm text-gray-400 italic'>暂无职位黑名单</p>
              )}
            </div>
          </div>
        </div>

        {/* 当前配置统计 */}
        <div className='bg-gray-50 rounded-lg p-4'>
          <h4 className='font-medium text-gray-900 mb-3'>黑名单统计</h4>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-gray-600'>公司黑名单:</span>
              <span className='ml-2 font-semibold text-red-600'>
                {formData.companyBlacklist?.length || 0} 个
              </span>
            </div>
            <div>
              <span className='text-gray-600'>职位黑名单:</span>
              <span className='ml-2 font-semibold text-red-600'>
                {formData.positionBlacklist?.length || 0} 个
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className='flex justify-between items-center mt-8 pt-6 border-t border-gray-200'>
        <button
          type='button'
          onClick={loadBlacklist}
          disabled={loading || saving}
          className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          刷新
        </button>
        <button
          type='button'
          onClick={handleSave}
          disabled={loading || saving}
          className='px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {saving ? '保存中...' : '保存黑名单'}
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
                <li>
                  <strong>模糊匹配规则：</strong>只要岗位名称
                  <strong>包含</strong>黑名单关键词就会被过滤
                </li>
                <li>
                  例如：添加&quot;销售&quot;会过滤&quot;销售总监&quot;、&quot;大客户销售&quot;、&quot;销售代表&quot;等
                </li>
                <li>
                  建议使用<strong>精确关键词</strong>
                  ：如&quot;销售代表&quot;而不是&quot;销售&quot;
                </li>
                <li>
                  保留市场导向的复合型岗位：如&quot;市场销售总监&quot;不会被&quot;销售代表&quot;过滤
                </li>
                <li>
                  配置修改后<strong>立即生效</strong>，下次投递时自动应用
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 推荐黑名单配置 */}
      <div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <div className='flex'>
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-blue-400'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1 a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='ml-3'>
            <h4 className='text-sm font-medium text-blue-800'>
              推荐配置（市场营销方向）
            </h4>
            <div className='mt-2 text-sm text-blue-700'>
              <p className='font-medium mb-2'>职位黑名单建议：</p>
              <div className='flex flex-wrap gap-2'>
                {[
                  '销售代表',
                  '销售经理',
                  '大客户经理',
                  '渠道经理',
                  '投资总监',
                  '投资经理',
                  '融资总监',
                ].map((keyword, index) => (
                  <span
                    key={index}
                    className='inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200'
                    onClick={() => {
                      if (!formData.positionBlacklist?.includes(keyword)) {
                        setFormData(prev => ({
                          ...prev,
                          positionBlacklist: [
                            ...(prev.positionBlacklist || []),
                            keyword,
                          ],
                        }));
                      }
                    }}
                    title='点击快速添加'
                  >
                    + {keyword}
                  </span>
                ))}
              </div>
              <p className='text-xs text-blue-600 mt-2'>
                💡 点击上方标签快速添加到黑名单
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlacklistManager;
