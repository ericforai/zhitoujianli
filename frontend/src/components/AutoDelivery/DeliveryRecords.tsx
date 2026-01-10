/**
 * 投递记录组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import React, { useEffect, useState, useRef } from 'react';
import { useDelivery } from '../../hooks/useDelivery';
import { useWebSocket } from '../../hooks/useWebSocket';
import {
  DeliveryRecord,
  DeliveryRecordQuery,
  DeliveryStatus,
} from '../../types/api';

const DeliveryRecords: React.FC = () => {
  const { records, loading, error, refreshRecords, manualDelivery } =
    useDelivery();

  const { subscribeDeliveryRecord } = useWebSocket();

  const [query, setQuery] = useState<DeliveryRecordQuery>({
    page: 0,
    size: 20,
  });
  const [selectedRecord, setSelectedRecord] = useState<DeliveryRecord | null>(
    null
  );
  const [showManualDelivery, setShowManualDelivery] = useState(false);
  const [manualJobData, setManualJobData] = useState({
    jobId: '',
    jobTitle: '',
    companyName: '',
    jobUrl: '',
  });

  /**
   * 订阅WebSocket消息
   * ✅ 修复：使用ref保存最新的query，避免闭包问题
   */
  const queryRef = React.useRef(query);
  React.useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    const handleRecordUpdate = () => {
      // 刷新记录列表（使用最新的query，通过ref获取）
      refreshRecords(queryRef.current);
    };

    subscribeDeliveryRecord(handleRecordUpdate);

    return () => {
      // 清理订阅（在组件卸载时）
    };
    // ✅ 修复：移除函数依赖，避免无限循环
    // query变化时通过ref自动更新，不需要重新订阅
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 加载记录
   */
  useEffect(() => {
    refreshRecords(query);
    // ✅ 修复：refreshRecords是稳定的useCallback，但为了安全，只在query变化时执行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  /**
   * 处理查询参数变化
   */
  const handleQueryChange = (newQuery: Partial<DeliveryRecordQuery>) => {
    setQuery(prev => ({
      ...prev,
      ...newQuery,
      page: 0, // 重置页码
    }));
  };

  /**
   * 处理手动投递
   */
  const handleManualDelivery = async () => {
    if (
      !manualJobData.jobId ||
      !manualJobData.jobTitle ||
      !manualJobData.companyName
    ) {
      alert('请填写完整的职位信息');
      return;
    }

    try {
      await manualDelivery(manualJobData);
      setShowManualDelivery(false);
      setManualJobData({
        jobId: '',
        jobTitle: '',
        companyName: '',
        jobUrl: '',
      });
      // 刷新记录
      refreshRecords(query);
    } catch (error: any) {
      console.error('手动投递失败:', error);
    }
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: DeliveryStatus): string => {
    switch (status) {
      case DeliveryStatus.DELIVERED:
        return 'bg-blue-100 text-blue-800';
      case DeliveryStatus.REPLIED:
        return 'bg-green-100 text-green-800';
      case DeliveryStatus.INTERVIEW_INVITED:
        return 'bg-purple-100 text-purple-800';
      case DeliveryStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case DeliveryStatus.FAILED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  /**
   * 获取平台图标
   */
  const getPlatformIcon = (platform: string): string => {
    switch (platform) {
      case 'boss':
        return '🚀';
      case 'lagou':
        return '🐸';
      case 'liepin':
        return '💼';
      case 'zhilian':
        return '📊';
      default:
        return '📋';
    }
  };

  /**
   * 格式化时间
   */
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  /**
   * 格式化匹配度
   */
  const formatMatchScore = (score?: number): string => {
    if (!score) return '--';
    return `${Math.round(score * 100)}%`;
  };

  return (
    <div className='space-y-6'>
      {/* 页面标题和操作 */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-semibold text-gray-900'>投递记录</h3>
          <p className='text-sm text-gray-600'>查看和管理所有投递记录</p>
        </div>
        <button
          onClick={() => setShowManualDelivery(true)}
          className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        >
          手动投递
        </button>
      </div>

      {/* 筛选条件 */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              状态筛选
            </label>
            <select
              value={query.status || ''}
              onChange={e =>
                handleQueryChange({
                  status: (e.target.value as DeliveryStatus) || undefined,
                })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>全部状态</option>
              <option value={DeliveryStatus.PENDING}>待投递</option>
              <option value={DeliveryStatus.DELIVERED}>已投递</option>
              <option value={DeliveryStatus.REPLIED}>已回复</option>
              <option value={DeliveryStatus.INTERVIEW_INVITED}>面试邀请</option>
              <option value={DeliveryStatus.REJECTED}>已拒绝</option>
              <option value={DeliveryStatus.FAILED}>投递失败</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              平台筛选
            </label>
            <select
              value={query.platform || ''}
              onChange={e =>
                handleQueryChange({ platform: e.target.value || undefined })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>全部平台</option>
              <option value='boss'>Boss直聘</option>
              <option value='lagou'>拉勾网</option>
              <option value='liepin'>猎聘网</option>
              <option value='zhilian'>智联招聘</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              关键词搜索
            </label>
            <input
              type='text'
              value={query.keyword || ''}
              onChange={e =>
                handleQueryChange({ keyword: e.target.value || undefined })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='搜索职位或公司'
            />
          </div>
          <div className='flex items-end'>
            <button
              onClick={() => refreshRecords(query)}
              disabled={loading}
              className='w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              刷新
            </button>
          </div>
        </div>
      </div>

      {/* 记录列表 */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            <span className='ml-2 text-gray-600'>加载中...</span>
          </div>
        ) : records.length === 0 ? (
          <div className='text-center py-12'>
            <svg
              className='mx-auto h-12 w-12 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
              />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              暂无投递记录
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              开始自动投递后，记录将显示在这里
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    职位信息
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    状态
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    平台
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    匹配度
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    投递时间
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {records.map(record => (
                  <tr key={record.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {record.jobTitle}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {record.companyName}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <span className='text-lg mr-2'>
                          {getPlatformIcon(record.platform)}
                        </span>
                        <span className='text-sm text-gray-900 capitalize'>
                          {record.platform}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {formatMatchScore(record.matchScore)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatTime(record.deliveryTime)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className='text-blue-600 hover:text-blue-900'
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 手动投递弹窗 */}
      {showManualDelivery && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
          <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
            <div className='mt-3'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                手动投递
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    职位ID
                  </label>
                  <input
                    type='text'
                    value={manualJobData.jobId}
                    onChange={e =>
                      setManualJobData(prev => ({
                        ...prev,
                        jobId: e.target.value,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='请输入职位ID'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    职位名称
                  </label>
                  <input
                    type='text'
                    value={manualJobData.jobTitle}
                    onChange={e =>
                      setManualJobData(prev => ({
                        ...prev,
                        jobTitle: e.target.value,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='请输入职位名称'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    公司名称
                  </label>
                  <input
                    type='text'
                    value={manualJobData.companyName}
                    onChange={e =>
                      setManualJobData(prev => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='请输入公司名称'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    职位链接（可选）
                  </label>
                  <input
                    type='url'
                    value={manualJobData.jobUrl}
                    onChange={e =>
                      setManualJobData(prev => ({
                        ...prev,
                        jobUrl: e.target.value,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='请输入职位链接'
                  />
                </div>
              </div>
              <div className='flex justify-end space-x-3 mt-6'>
                <button
                  onClick={() => setShowManualDelivery(false)}
                  className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  取消
                </button>
                <button
                  onClick={handleManualDelivery}
                  className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  确认投递
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 记录详情弹窗 */}
      {selectedRecord && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
          <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
            <div className='mt-3'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                投递详情
              </h3>
              <div className='space-y-3'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    职位名称
                  </label>
                  <p className='text-sm text-gray-900'>
                    {selectedRecord.jobTitle}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    公司名称
                  </label>
                  <p className='text-sm text-gray-900'>
                    {selectedRecord.companyName}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    投递状态
                  </label>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRecord.status)}`}
                  >
                    {selectedRecord.status}
                  </span>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    投递时间
                  </label>
                  <p className='text-sm text-gray-900'>
                    {formatTime(selectedRecord.deliveryTime)}
                  </p>
                </div>
                {selectedRecord.replyTime && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      回复时间
                    </label>
                    <p className='text-sm text-gray-900'>
                      {formatTime(selectedRecord.replyTime)}
                    </p>
                  </div>
                )}
                {selectedRecord.replyContent && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      回复内容
                    </label>
                    <p className='text-sm text-gray-900'>
                      {selectedRecord.replyContent}
                    </p>
                  </div>
                )}
                {selectedRecord.greetingContent && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      打招呼语
                    </label>
                    <p className='text-sm text-gray-900'>
                      {selectedRecord.greetingContent}
                    </p>
                  </div>
                )}
                {selectedRecord.matchScore && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      匹配度
                    </label>
                    <p className='text-sm text-gray-900'>
                      {formatMatchScore(selectedRecord.matchScore)}
                    </p>
                  </div>
                )}
                {selectedRecord.jobUrl && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      职位链接
                    </label>
                    <a
                      href={selectedRecord.jobUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm text-blue-600 hover:text-blue-800'
                    >
                      查看职位
                    </a>
                  </div>
                )}
              </div>
              <div className='flex justify-end mt-6'>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 错误消息 */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-md p-4'>
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
              <p className='text-sm font-medium text-red-800'>{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryRecords;
