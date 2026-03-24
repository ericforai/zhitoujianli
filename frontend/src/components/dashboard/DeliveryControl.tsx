/**
 * 统一投递控制组件
 * 整合本地Agent投递和服务器投递，提供统一的操作入口
 *
 * 更新：移除Token概念，Agent使用账号密码登录
 *
 * @author ZhiTouJianLi Team
 * @since 2025-12-19
 */

import React, { useState } from 'react';
import { useLocalAgent } from '../../hooks/useLocalAgent';
import { useBossDelivery } from '../../hooks/useBossDelivery';

type DeliveryMode = 'local' | 'server';

interface DeliveryControlProps {
  isBossLoggedIn: boolean;
  onBossLogin: () => void;
}

const DeliveryControl: React.FC<DeliveryControlProps> = ({
  isBossLoggedIn,
  onBossLogin,
}) => {
  // 投递方式选择
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('local');

  // 本地Agent状态
  const {
    isOnline: isAgentOnline,
    isLoading: agentLoading,
    error: agentError,
    isDelivering: isLocalDelivering,
    deliveryMessage: localDeliveryMessage,
    startDelivery: startLocalDelivery,
    stopDelivery: stopLocalDelivery,
  } = useLocalAgent();

  // 服务器投递状态
  const {
    status: serverStatus,
    loading: serverLoading,
    message: serverMessage,
    handleStart: handleServerStart,
    handleStop: handleServerStop,
  } = useBossDelivery();

  // 当前是否正在投递（本地或服务器）
  const isDelivering =
    deliveryMode === 'local' ? isLocalDelivering : serverStatus.isRunning;

  // 开始投递
  const handleStartDelivery = async () => {
    if (deliveryMode === 'local') {
      if (!isAgentOnline) {
        return;
      }
      await startLocalDelivery();
    } else {
      handleServerStart();
    }
  };

  // 停止投递
  const handleStopDelivery = async () => {
    if (deliveryMode === 'local') {
      await stopLocalDelivery();
    } else {
      handleServerStop();
    }
  };

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
      {/* 标题栏 */}
      <div className='px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center'>
              <span className='text-white text-xl'>🚀</span>
            </div>
            <div>
              <h2 className='text-lg font-bold text-gray-900'>智能投递</h2>
              <p className='text-sm text-gray-600'>
                选择投递方式，开始自动投递简历
              </p>
            </div>
          </div>

          {/* 运行状态指示器 */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              isDelivering
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isDelivering ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            {isDelivering ? '投递中' : '未运行'}
          </div>
        </div>
      </div>

      <div className='p-6'>
        {/* 投递方式选择 */}
        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 mb-3'>
            选择投递方式
          </label>
          <div className='grid grid-cols-2 gap-4'>
            {/* 本地投递选项 */}
            <button
              type='button'
              onClick={() => setDeliveryMode('local')}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                deliveryMode === 'local'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {/* 推荐标签 */}
              <div className='absolute -top-2 -right-2'>
                <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white'>
                  推荐
                </span>
              </div>

              <div className='flex items-start gap-3'>
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    deliveryMode === 'local' ? 'bg-green-100' : 'bg-gray-100'
                  }`}
                >
                  <span className='text-xl'>🖥️</span>
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-semibold text-gray-900'>本地投递</h3>
                    {isAgentOnline ? (
                      <span className='inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700'>
                        在线
                      </span>
                    ) : (
                      <span className='inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600'>
                        离线
                      </span>
                    )}
                  </div>
                  <p className='text-sm text-gray-500 mt-1'>
                    使用本地IP，几乎不会被风控
                  </p>
                </div>
              </div>
            </button>

            {/* 服务器投递选项 */}
            <button
              type='button'
              onClick={() => setDeliveryMode('server')}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                deliveryMode === 'server'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className='flex items-start gap-3'>
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    deliveryMode === 'server' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}
                >
                  <span className='text-xl'>☁️</span>
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-gray-900'>服务器投递</h3>
                  <p className='text-sm text-gray-500 mt-1'>
                    无需本地运行，可能被风控
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 本地Agent离线时显示快速启动 */}
        {deliveryMode === 'local' && !isAgentOnline && (
          <div className='mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl'>
            <div className='flex items-start gap-3'>
              <div className='w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                <span className='text-amber-600'>⚡</span>
              </div>
              <div className='flex-1'>
                <h4 className='font-medium text-amber-900 mb-3'>
                  首次使用？2步快速启动
                </h4>

                {/* 简化的2步指引 - 无需Token */}
                <div className='space-y-3'>
                  {/* 步骤1: 下载 */}
                  <div className='flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200'>
                    <span className='w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'>
                      1
                    </span>
                    <div className='flex-1'>
                      <a
                        href='/api/local-agent/download'
                        className='inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium'
                      >
                        📥 下载Agent程序
                      </a>
                      <p className='text-xs text-gray-500 mt-2'>
                        下载后解压到任意位置
                      </p>
                    </div>
                  </div>

                  {/* 步骤2: 运行并登录 */}
                  <div className='flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200'>
                    <span className='w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'>
                      2
                    </span>
                    <div className='flex-1'>
                      <p className='text-sm text-amber-900 font-medium mb-1'>
                        双击运行{' '}
                        <code className='bg-amber-100 px-1.5 py-0.5 rounded text-amber-800'>
                          start.command
                        </code>
                        （Mac/Linux）或{' '}
                        <code className='bg-amber-100 px-1.5 py-0.5 rounded text-amber-800'>
                          start.bat
                        </code>
                        （Windows）
                      </p>
                      <p className='text-xs text-gray-600'>
                        首次按提示登录智投简历账号 → 扫码登录Boss直聘 →
                        回来点「开始投递」
                      </p>
                      <p className='text-xs text-gray-500 mt-1'>
                        高级模式可用命令行：
                        <code className='bg-gray-100 px-1 rounded'>
                          python3 start_one_click.py
                        </code>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 状态提示 */}
                <div className='mt-4 p-2 bg-gray-100 rounded-lg'>
                  <div className='flex items-center gap-2 text-sm'>
                    <div className='w-2 h-2 rounded-full bg-gray-400 animate-pulse'></div>
                    <span className='text-gray-600'>等待Agent连接...</span>
                    <span className='text-xs text-gray-400'>
                      （连接成功后此处会变绿）
                    </span>
                  </div>
                </div>

                {/* 提示信息 */}
                <div className='mt-3 text-xs text-gray-500'>
                  💡 提示：Agent会记住你的登录信息，下次启动自动登录
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Boss登录状态 */}
        {!isBossLoggedIn && (
          <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <span className='text-2xl'>📱</span>
                <div>
                  <p className='font-medium text-blue-900'>需要登录Boss直聘</p>
                  <p className='text-sm text-blue-700'>登录后才能开始投递</p>
                </div>
              </div>
              <button
                type='button'
                onClick={onBossLogin}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
              >
                登录Boss
              </button>
            </div>
          </div>
        )}

        {/* 操作按钮区域 */}
        <div className='flex items-center gap-4'>
          {isDelivering ? (
            <>
              <button
                type='button'
                onClick={handleStopDelivery}
                disabled={agentLoading || serverLoading}
                className='flex-1 py-3 px-6 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-lg disabled:opacity-50'
              >
                {agentLoading || serverLoading ? '停止中...' : '⏹️ 停止投递'}
              </button>
              <div className='text-sm text-gray-500'>
                {deliveryMode === 'local' ? (
                  <span>本地投递中...</span>
                ) : (
                  <span>
                    今日已投递:{' '}
                    <span className='font-semibold text-gray-900'>
                      {serverStatus.deliveryCount || 0}
                    </span>{' '}
                    个
                  </span>
                )}
              </div>
            </>
          ) : (
            <button
              type='button'
              onClick={handleStartDelivery}
              disabled={
                agentLoading ||
                serverLoading ||
                !isBossLoggedIn ||
                (deliveryMode === 'local' && !isAgentOnline)
              }
              className={`flex-1 py-3 px-6 rounded-xl font-medium text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                deliveryMode === 'local'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {agentLoading || serverLoading
                ? '启动中...'
                : deliveryMode === 'local'
                  ? '🖥️ 开始本地投递'
                  : '☁️ 开始服务器投递'}
            </button>
          )}
        </div>

        {/* 提示消息 */}
        {(serverMessage || localDeliveryMessage) && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              (serverMessage || localDeliveryMessage || '').includes('失败') ||
              (serverMessage || localDeliveryMessage || '').includes('错误') ||
              (serverMessage || localDeliveryMessage || '').includes('❌')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : (serverMessage || localDeliveryMessage || '').includes(
                      '成功'
                    ) ||
                    (serverMessage || localDeliveryMessage || '').includes(
                      '✅'
                    ) ||
                    (serverMessage || localDeliveryMessage || '').includes(
                      '已下发'
                    )
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {localDeliveryMessage || serverMessage}
          </div>
        )}

        {/* Agent错误 */}
        {agentError && (
          <div className='mt-4 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200'>
            {agentError}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryControl;
