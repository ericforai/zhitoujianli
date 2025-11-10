/**
 * Boss服务器端扫码登录组件
 *
 * 使用服务器端扫码登录，无需手动提取Cookie
 * 扫码后Cookie自动保存
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-06
 */

import React, { useState, useEffect, useRef } from 'react';
import bossLoginService from '../services/bossLoginService';

interface BossServerLoginProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BossServerLogin: React.FC<BossServerLoginProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [status, setStatus] = useState<
    'idle' | 'starting' | 'waiting' | 'success' | 'failed'
  >('idle');
  const [qrcodeImage, setQrcodeImage] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const statusPollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const qrcodePollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 启动扫码登录
  const startLogin = async () => {
    setStatus('starting');
    setError(null);
    setMessage('正在启动扫码登录...');

    try {
      await bossLoginService.startServerLogin();
      setStatus('waiting');
      setMessage('等待二维码生成...');

      // 开始轮询二维码
      startQRCodePolling();
      // 开始轮询登录状态
      startStatusPolling();
    } catch (err: any) {
      setError(err.message || '启动扫码登录失败');
      setStatus('failed');
    }
  };

  // 轮询二维码
  const startQRCodePolling = () => {
    if (qrcodePollIntervalRef.current) {
      clearInterval(qrcodePollIntervalRef.current);
    }

    qrcodePollIntervalRef.current = setInterval(async () => {
      try {
        const result = await bossLoginService.getQRCode();
        if (result.hasQRCode && result.imageData) {
          setQrcodeImage(result.imageData);
          setMessage('请使用Boss直聘App扫描下方二维码');
          // 二维码获取成功后停止轮询
          if (qrcodePollIntervalRef.current) {
            clearInterval(qrcodePollIntervalRef.current);
            qrcodePollIntervalRef.current = null;
          }
        }
      } catch (err) {
        // 忽略错误，继续轮询
      }
    }, 2000); // 每2秒轮询一次
  };

  // 轮询登录状态
  const startStatusPolling = () => {
    if (statusPollIntervalRef.current) {
      clearInterval(statusPollIntervalRef.current);
    }

    statusPollIntervalRef.current = setInterval(async () => {
      try {
        const result = await bossLoginService.getLoginStatus();

        if (result.status === 'success') {
          setStatus('success');
          setMessage('登录成功！Cookie已自动保存');

          // 停止轮询
          if (statusPollIntervalRef.current) {
            clearInterval(statusPollIntervalRef.current);
            statusPollIntervalRef.current = null;
          }

          // 延迟1.5秒后触发成功回调
          setTimeout(() => {
            if (onSuccess) {
              onSuccess();
            }
          }, 1500);
        } else if (result.status === 'failed') {
          setStatus('failed');
          setMessage('登录失败，请重试');

          // 停止轮询
          if (statusPollIntervalRef.current) {
            clearInterval(statusPollIntervalRef.current);
            statusPollIntervalRef.current = null;
          }
        } else if (result.status === 'waiting') {
          setStatus('waiting');
          setMessage(result.message || '等待扫码登录...');
        }
      } catch (err) {
        // 忽略错误，继续轮询
      }
    }, 2000); // 每2秒轮询一次
  };

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (statusPollIntervalRef.current) {
        clearInterval(statusPollIntervalRef.current);
      }
      if (qrcodePollIntervalRef.current) {
        clearInterval(qrcodePollIntervalRef.current);
      }
    };
  }, []);

  // 组件挂载时自动启动登录
  useEffect(() => {
    startLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-2xl max-w-md w-full'>
        {/* 标题栏 */}
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl'>
          <h2 className='text-2xl font-bold text-gray-900'>
            📱 Boss直聘扫码登录
          </h2>
          <button
            onClick={onCancel}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className='p-6'>
          {/* 状态提示 */}
          {status === 'starting' && (
            <div className='mb-6 text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-gray-600'>{message}</p>
            </div>
          )}

          {status === 'waiting' && (
            <div className='mb-6'>
              <div className='text-center mb-4'>
                <p className='text-gray-700 font-medium mb-2'>{message}</p>
                {!qrcodeImage && (
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
                )}
              </div>

              {/* 二维码显示 */}
              {qrcodeImage && (
                <div className='bg-white p-6 rounded-lg border-2 border-blue-200 flex justify-center items-center'>
                  <img
                    src={qrcodeImage}
                    alt='Boss直聘登录二维码'
                    className='w-80 h-80 object-contain'
                    style={{ minWidth: '320px', minHeight: '320px' }}
                  />
                </div>
              )}

              {/* 使用说明 */}
              <div className='mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <p className='text-sm text-blue-800 mb-2'>
                  <strong>使用步骤：</strong>
                </p>
                <ol className='text-sm text-blue-700 list-decimal list-inside space-y-1'>
                  <li>打开Boss直聘手机App</li>
                  <li>点击&ldquo;扫一扫&rdquo;功能</li>
                  <li>扫描上方二维码</li>
                  <li>在手机上确认登录</li>
                </ol>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className='mb-6 text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <p className='text-green-700 font-medium text-lg'>{message}</p>
            </div>
          )}

          {status === 'failed' && (
            <div className='mb-6'>
              <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                <div className='flex items-start'>
                  <svg
                    className='h-5 w-5 text-red-400 flex-shrink-0 mt-0.5'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <div className='ml-3'>
                    <p className='text-sm font-medium text-red-800'>
                      {error || message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className='flex space-x-3'>
            {status === 'failed' && (
              <button
                onClick={startLogin}
                className='flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors'
              >
                重新尝试
              </button>
            )}
            <button
              onClick={onCancel}
              className='px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors'
            >
              {status === 'success' ? '完成' : '取消'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BossServerLogin;
