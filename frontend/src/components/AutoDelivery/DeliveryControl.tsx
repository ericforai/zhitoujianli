/**
 * 投递控制面板组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import React, { useState } from 'react';
import { useDelivery } from '../../hooks/useDelivery';
import { useWebSocket } from '../../hooks/useWebSocket';

const DeliveryControl: React.FC = () => {
  const {
    isRunning,
    status,
    loading,
    error,
    startDelivery,
    stopDelivery,
    refreshStatus,
  } = useDelivery();

  const { isConnected } = useWebSocket();
  const [confirmStop, setConfirmStop] = useState(false);

  /**
   * 处理启动投递
   */
  const handleStartDelivery = async () => {
    try {
      await startDelivery();
    } catch (error: any) {
      console.error('启动投递失败:', error);
    }
  };

  /**
   * 处理停止投递
   */
  const handleStopDelivery = async () => {
    if (!confirmStop) {
      setConfirmStop(true);
      return;
    }

    try {
      await stopDelivery();
      setConfirmStop(false);
    } catch (error: any) {
      console.error('停止投递失败:', error);
    }
  };

  /**
   * 取消停止确认
   */
  const cancelStop = () => {
    setConfirmStop(false);
  };

  /**
   * 格式化时间
   */
  const formatTime = (timestamp?: number): string => {
    if (!timestamp) return '--';
    return new Date(timestamp).toLocaleString();
  };

  /**
   * 格式化持续时间
   */
  const formatDuration = (startTime?: number): string => {
    if (!startTime) return '--';
    const duration = Date.now() - startTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}小时${minutes}分钟`;
  };

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900'>投递控制面板</h3>
        <p className='text-sm text-gray-500'>
          启动或停止自动投递，监控投递状态
        </p>
      </div>

      {/* WebSocket连接状态 */}
      <div className='mb-6'>
        <div className='flex items-center space-x-2'>
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          ></div>
          <span className='text-sm text-gray-600'>
            {isConnected ? '实时连接已建立' : '实时连接已断开'}
          </span>
        </div>
      </div>

      {/* 投递状态概览 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <div className='bg-blue-50 p-4 rounded-lg'>
          <div className='text-2xl font-bold text-blue-600'>
            {status?.totalDelivered || 0}
          </div>
          <div className='text-sm text-gray-600'>总投递数</div>
        </div>
        <div className='bg-green-50 p-4 rounded-lg'>
          <div className='text-2xl font-bold text-green-600'>
            {status?.successfulDelivered || 0}
          </div>
          <div className='text-sm text-gray-600'>成功投递</div>
        </div>
        <div className='bg-red-50 p-4 rounded-lg'>
          <div className='text-2xl font-bold text-red-600'>
            {status?.failedDelivered || 0}
          </div>
          <div className='text-sm text-gray-600'>失败投递</div>
        </div>
        <div className='bg-yellow-50 p-4 rounded-lg'>
          <div className='text-2xl font-bold text-yellow-600'>
            {/* ✅ 优化：直接使用isRunning状态，确保乐观更新能立即反映在UI上 */}
            {isRunning ? '运行中' : '已停止'}
          </div>
          <div className='text-sm text-gray-600'>当前状态</div>
        </div>
      </div>

      {/* 投递详情 */}
      {status && (
        <div className='bg-gray-50 rounded-lg p-4 mb-6'>
          <h4 className='font-medium text-gray-900 mb-3'>投递详情</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-gray-600'>当前职位:</span>
              <span className='ml-2 font-medium'>
                {status.currentJob || '无'}
              </span>
            </div>
            <div>
              <span className='text-gray-600'>最后投递时间:</span>
              <span className='ml-2 font-medium'>
                {formatTime(status.lastDeliveryTime)}
              </span>
            </div>
            <div>
              <span className='text-gray-600'>下次投递时间:</span>
              <span className='ml-2 font-medium'>
                {formatTime(status.nextDeliveryTime)}
              </span>
            </div>
            <div>
              <span className='text-gray-600'>运行时长:</span>
              <span className='ml-2 font-medium'>
                {formatDuration(status.lastDeliveryTime)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className='flex justify-center space-x-4'>
        {!isRunning ? (
          <button
            onClick={handleStartDelivery}
            disabled={loading}
            className='px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? '启动中...' : '启动自动投递'}
          </button>
        ) : (
          <div className='flex space-x-4'>
            {!confirmStop ? (
              <button
                onClick={handleStopDelivery}
                disabled={loading}
                className='px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? '停止中...' : '停止自动投递'}
              </button>
            ) : (
              <div className='flex space-x-2'>
                <button
                  onClick={handleStopDelivery}
                  disabled={loading}
                  className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  确认停止
                </button>
                <button
                  onClick={cancelStop}
                  className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  取消
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={refreshStatus}
          disabled={loading}
          className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          刷新状态
        </button>
      </div>

      {/* 错误消息 */}
      {error && (
        <div className='mt-6 bg-red-50 border border-red-200 rounded-md p-4'>
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

      {/* 使用提示 */}
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
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='ml-3'>
            <h4 className='text-sm font-medium text-blue-800'>使用提示</h4>
            <div className='mt-2 text-sm text-blue-700'>
              <ul className='list-disc list-inside space-y-1'>
                <li>启动前请确保已上传简历并完成投递配置</li>
                <li>系统会根据配置的策略自动搜索和投递职位</li>
                <li>投递状态会实时更新，可通过WebSocket查看进度</li>
                <li>建议在投递高峰期（工作日9:00-18:00）启动投递</li>
                <li>如遇到问题可随时停止投递并检查配置</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryControl;
