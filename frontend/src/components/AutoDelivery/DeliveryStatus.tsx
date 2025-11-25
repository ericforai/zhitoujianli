/**
 * 投递状态监控组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import React, { useEffect, useState } from 'react';
import { useDelivery } from '../../hooks/useDelivery';
import { useWebSocket } from '../../hooks/useWebSocket';
import {
  DeliveryProgressMessage,
  DeliveryStatusMessage,
  VerificationCodeMessage,
} from '../../types/api';
import VerificationCodeDialog from '../VerificationCodeDialog';
import { webSocketService } from '../../services/webSocketService';

const DeliveryStatus: React.FC = () => {
  const { statistics, loading, error, refreshStatistics } = useDelivery();

  const { subscribeDeliveryStatus, subscribeDeliveryProgress, subscribeError } =
    useWebSocket();

  const [realTimeStatus, setRealTimeStatus] =
    useState<DeliveryStatusMessage | null>(null);
  const [realTimeProgress, setRealTimeProgress] =
    useState<DeliveryProgressMessage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 验证码对话框状态
  const [verificationCodeDialog, setVerificationCodeDialog] = useState<{
    open: boolean;
    requestId: string;
    jobName: string;
    screenshotUrl: string | null;
    taskId: string;
  } | null>(null);

  /**
   * 订阅WebSocket消息
   */
  useEffect(() => {
    const handleStatusUpdate = (data: DeliveryStatusMessage) => {
      setRealTimeStatus(data);
    };

    const handleProgressUpdate = (data: DeliveryProgressMessage) => {
      setRealTimeProgress(data);
    };

    const handleError = (data: any) => {
      setErrorMessage(data.message);
      setTimeout(() => setErrorMessage(null), 5000);
    };

    // 处理验证码请求
    const handleVerificationCode = (data: VerificationCodeMessage) => {
      console.log('收到验证码请求:', data);
      setVerificationCodeDialog({
        open: true,
        requestId: data.requestId,
        jobName: data.jobName,
        screenshotUrl: data.screenshotUrl,
        taskId: data.taskId,
      });
    };

    subscribeDeliveryStatus(handleStatusUpdate);
    subscribeDeliveryProgress(handleProgressUpdate);
    subscribeError(handleError);
    webSocketService.subscribeVerificationCode(handleVerificationCode);

    return () => {
      // 清理订阅
      webSocketService.unsubscribeVerificationCode(handleVerificationCode);
    };
  }, [subscribeDeliveryStatus, subscribeDeliveryProgress, subscribeError]);

  /**
   * 格式化百分比
   */
  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  /**
   * 格式化时间
   */
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  /**
   * 格式化持续时间
   */
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  };

  return (
    <div className='space-y-6'>
      {/* 实时状态卡片 */}
      {realTimeStatus && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>
              实时投递状态
            </h3>
            <div className='flex items-center space-x-2'>
              <div
                className={`w-2 h-2 rounded-full ${realTimeStatus.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
              ></div>
              <span className='text-sm text-gray-600'>
                {realTimeStatus.isRunning ? '运行中' : '已停止'}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='text-center p-4 bg-blue-50 rounded-lg'>
              <div className='text-2xl font-bold text-blue-600'>
                {realTimeStatus.totalDelivered}
              </div>
              <div className='text-sm text-gray-600'>总投递数</div>
            </div>
            <div className='text-center p-4 bg-green-50 rounded-lg'>
              <div className='text-2xl font-bold text-green-600'>
                {realTimeStatus.successfulDelivered}
              </div>
              <div className='text-sm text-gray-600'>成功投递</div>
            </div>
            <div className='text-center p-4 bg-red-50 rounded-lg'>
              <div className='text-2xl font-bold text-red-600'>
                {realTimeStatus.failedDelivered}
              </div>
              <div className='text-sm text-gray-600'>失败投递</div>
            </div>
            <div className='text-center p-4 bg-yellow-50 rounded-lg'>
              <div className='text-2xl font-bold text-yellow-600'>
                {realTimeStatus.currentJob ? '处理中' : '等待中'}
              </div>
              <div className='text-sm text-gray-600'>当前状态</div>
            </div>
          </div>

          {realTimeStatus.currentJob && (
            <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
              <p className='text-sm text-gray-700'>
                <span className='font-medium'>当前职位:</span>{' '}
                {realTimeStatus.currentJob}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 实时进度卡片 */}
      {realTimeProgress && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>投递进度</h3>

          <div className='space-y-4'>
            {/* 进度条 */}
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium text-gray-700'>
                  总体进度
                </span>
                <span className='text-sm text-gray-600'>
                  {realTimeProgress.processedJobs} /{' '}
                  {realTimeProgress.totalJobs}
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${realTimeProgress.progressPercentage}%` }}
                ></div>
              </div>
              <div className='flex justify-between text-xs text-gray-500 mt-1'>
                <span>0%</span>
                <span className='font-medium'>
                  {formatPercentage(realTimeProgress.progressPercentage / 100)}
                </span>
                <span>100%</span>
              </div>
            </div>

            {/* 统计信息 */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='text-center p-3 bg-green-50 rounded-lg'>
                <div className='text-lg font-bold text-green-600'>
                  {realTimeProgress.successfulJobs}
                </div>
                <div className='text-xs text-gray-600'>成功</div>
              </div>
              <div className='text-center p-3 bg-red-50 rounded-lg'>
                <div className='text-lg font-bold text-red-600'>
                  {realTimeProgress.failedJobs}
                </div>
                <div className='text-xs text-gray-600'>失败</div>
              </div>
              <div className='text-center p-3 bg-blue-50 rounded-lg'>
                <div className='text-lg font-bold text-blue-600'>
                  {formatDuration(realTimeProgress.estimatedTimeRemaining)}
                </div>
                <div className='text-xs text-gray-600'>预计剩余时间</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 投递统计 */}
      {statistics && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>投递统计</h3>
            <button
              onClick={() => refreshStatistics()}
              disabled={loading}
              className='px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              刷新
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='text-center p-4 bg-blue-50 rounded-lg'>
              <div className='text-2xl font-bold text-blue-600'>
                {statistics.totalDeliveries}
              </div>
              <div className='text-sm text-gray-600'>总投递数</div>
            </div>
            <div className='text-center p-4 bg-green-50 rounded-lg'>
              <div className='text-2xl font-bold text-green-600'>
                {formatPercentage(statistics.deliverySuccessRate)}
              </div>
              <div className='text-sm text-gray-600'>投递成功率</div>
            </div>
            <div className='text-center p-4 bg-yellow-50 rounded-lg'>
              <div className='text-2xl font-bold text-yellow-600'>
                {formatPercentage(statistics.hrReplyRate)}
              </div>
              <div className='text-sm text-gray-600'>HR回复率</div>
            </div>
            <div className='text-center p-4 bg-purple-50 rounded-lg'>
              <div className='text-2xl font-bold text-purple-600'>
                {formatPercentage(statistics.interviewInvitationRate)}
              </div>
              <div className='text-sm text-gray-600'>面试邀请率</div>
            </div>
          </div>

          {/* 详细统计 */}
          <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-4 bg-gray-50 rounded-lg'>
              <h4 className='font-medium text-gray-900 mb-2'>今日统计</h4>
              <div className='space-y-1 text-sm text-gray-600'>
                <p>投递数: {statistics.todayDeliveries}</p>
                <p>成功数: {statistics.successfulDeliveries}</p>
                <p>失败数: {statistics.failedDeliveries}</p>
              </div>
            </div>
            <div className='p-4 bg-gray-50 rounded-lg'>
              <h4 className='font-medium text-gray-900 mb-2'>本周统计</h4>
              <div className='space-y-1 text-sm text-gray-600'>
                <p>投递数: {statistics.weeklyDeliveries}</p>
                <p>HR回复: {statistics.hrReplies}</p>
                <p>面试邀请: {statistics.interviewInvitations}</p>
              </div>
            </div>
            <div className='p-4 bg-gray-50 rounded-lg'>
              <h4 className='font-medium text-gray-900 mb-2'>本月统计</h4>
              <div className='space-y-1 text-sm text-gray-600'>
                <p>投递数: {statistics.monthlyDeliveries}</p>
                <p>
                  平均匹配度: {formatPercentage(statistics.averageMatchScore)}
                </p>
                <p>最后更新: {formatTime(statistics.lastUpdated)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 错误消息 */}
      {errorMessage && (
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
              <p className='text-sm font-medium text-red-800'>{errorMessage}</p>
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

      {/* 验证码对话框 */}
      {verificationCodeDialog && (
        <VerificationCodeDialog
          open={verificationCodeDialog.open}
          onClose={() => setVerificationCodeDialog(null)}
          requestId={verificationCodeDialog.requestId}
          jobName={verificationCodeDialog.jobName}
          screenshotUrl={verificationCodeDialog.screenshotUrl}
          taskId={verificationCodeDialog.taskId}
        />
      )}
    </div>
  );
};

export default DeliveryStatus;
