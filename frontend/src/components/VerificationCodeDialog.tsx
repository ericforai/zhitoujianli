/**
 * 验证码对话框组件
 * 用于显示Boss直聘验证码截图并接收用户输入
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-22
 */

import React, { useState, useEffect } from 'react';
import config from '../config/environment';
import apiClient from '../services/apiService';

interface VerificationCodeDialogProps {
  /** 是否显示对话框 */
  open: boolean;
  /** 关闭对话框的回调 */
  onClose: () => void;
  /** 验证码请求ID */
  requestId: string;
  /** 岗位名称 */
  jobName: string;
  /** 验证码截图URL */
  screenshotUrl: string | null;
  /** 任务ID */
  taskId: string;
}

const VerificationCodeDialog: React.FC<VerificationCodeDialogProps> = ({
  open,
  onClose,
  requestId,
  jobName,
  screenshotUrl,
  taskId,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // 当对话框打开时，重置状态
  useEffect(() => {
    if (open) {
      setCode('');
      setError(null);
      setImageError(false);
    }
  }, [open]);

  /**
   * 提交验证码
   */
  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('请输入验证码');
      return;
    }

    if (code.length < 4) {
      setError('验证码长度不正确');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/verification-code/submit', {
        requestId,
        code: code.trim(),
      });

      if (response.data.success) {
        // 提交成功，关闭对话框
        onClose();
        // 显示成功提示
        alert('验证码提交成功，投递将继续进行');
      } else {
        setError(response.data.message || '提交验证码失败');
      }
    } catch (err: any) {
      console.error('提交验证码失败:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          '提交验证码失败，请重试'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理键盘事件
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
        {/* 头部 */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>
              🔐 Boss直聘验证码验证
            </h2>
            <p className='text-sm text-gray-600 mt-1'>
              岗位: <span className='font-medium'>{jobName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
            disabled={loading}
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

        {/* 内容 */}
        <div className='p-6 space-y-4'>
          {/* 提示信息 */}
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
            <div className='flex items-start'>
              <svg
                className='w-5 h-5 text-yellow-600 mt-0.5 mr-3'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              <div className='flex-1'>
                <p className='text-sm text-yellow-800'>
                  Boss直聘要求验证码验证，请查看下方截图并输入验证码。
                  验证码输入后，投递任务将继续进行。
                </p>
              </div>
            </div>
          </div>

          {/* 验证码截图 */}
          <div className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
            <h3 className='text-sm font-medium text-gray-700 mb-3'>
              验证码截图：
            </h3>
            {screenshotUrl && !imageError ? (
              <div className='relative'>
                <img
                  src={`${config.apiBaseUrl}${screenshotUrl}`}
                  alt='验证码截图'
                  className='w-full h-auto rounded border border-gray-300'
                  onError={() => setImageError(true)}
                />
                <div className='mt-2 text-xs text-gray-500 text-center'>
                  如果图片无法显示，请刷新页面或联系客服
                </div>
              </div>
            ) : (
              <div className='flex items-center justify-center h-48 bg-gray-100 rounded border border-gray-300'>
                <div className='text-center'>
                  <svg
                    className='w-12 h-12 text-gray-400 mx-auto mb-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  <p className='text-sm text-gray-500'>
                    {imageError
                      ? '图片加载失败，请刷新页面重试'
                      : '正在加载验证码截图...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 验证码输入 */}
          <div>
            <label
              htmlFor='verification-code'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              请输入验证码：
            </label>
            <input
              id='verification-code'
              type='text'
              value={code}
              onChange={e => {
                setCode(e.target.value);
                setError(null);
              }}
              onKeyPress={handleKeyPress}
              placeholder='请输入验证码'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
              disabled={loading}
              autoFocus
            />
            <p className='mt-1 text-xs text-gray-500'>
              请输入图片中显示的验证码，按Enter键提交
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
              <div className='flex items-center'>
                <svg
                  className='w-5 h-5 text-red-600 mr-2'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
                <p className='text-sm text-red-800'>{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className='flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50'>
          <button
            onClick={onClose}
            disabled={loading}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !code.trim()}
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
          >
            {loading ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                提交中...
              </>
            ) : (
              '提交验证码'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationCodeDialog;

