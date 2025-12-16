import React, { useState } from 'react';
import { PlanType } from '../../services/planService';

/**
 * 升级确认对话框Props
 */
interface UpgradeConfirmDialogProps {
  /** 是否显示 */
  isOpen: boolean;
  /** 目标套餐 */
  targetPlan: PlanType;
  /** 目标套餐名称 */
  targetPlanName: string;
  /** 目标套餐价格 */
  targetPlanPrice: number;
  /** 当前套餐名称 */
  currentPlanName: string;
  /** 升级中状态 */
  loading: boolean;
  /** 确认升级 */
  onConfirm: () => void;
  /** 取消 */
  onCancel: () => void;
}

/**
 * 升级确认对话框
 */
export const UpgradeConfirmDialog: React.FC<UpgradeConfirmDialogProps> = ({
  isOpen,
  targetPlan,
  targetPlanName,
  targetPlanPrice,
  currentPlanName,
  loading,
  onConfirm,
  onCancel,
}) => {
  const [qrCodeError, setQrCodeError] = useState(false);

  if (!isOpen) return null;

  const getFeatures = (plan: PlanType) => {
    switch (plan) {
      case PlanType.BASIC:
        return [
          '简历基础优化 不限次',
          '简历高级优化 1次',
          '每日投递 30次',
          '详细数据分析',
        ];
      case PlanType.PROFESSIONAL:
        return [
          '简历基础优化 不限次',
          '简历高级优化 3次',
          '每日投递 100次',
          '深度数据分析',
          '优先客服支持',
        ];
      default:
        return [];
    }
  };

  const features = getFeatures(targetPlan);

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* 遮罩层 */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onCancel}
      />

      {/* 对话框 */}
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div className='relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8'>
          {/* 关闭按钮 */}
          <button
            onClick={onCancel}
            className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
          >
            <svg
              className='h-6 w-6'
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

          {/* 图标 */}
          <div className='flex justify-center mb-6'>
            <div className='h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center'>
              <svg
                className='h-8 w-8 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
            </div>
          </div>

          {/* 标题 */}
          <h3 className='text-2xl font-bold text-gray-900 text-center mb-2'>
            确认升级套餐
          </h3>
          <p className='text-gray-600 text-center mb-6'>
            从 <span className='font-semibold'>{currentPlanName}</span> 升级到{' '}
            <span className='font-semibold'>{targetPlanName}</span>
          </p>

          {/* 价格 */}
          <div className='bg-blue-50 rounded-lg p-6 mb-6 text-center'>
            <p className='text-sm text-gray-600 mb-2'>升级后价格</p>
            <p className='text-4xl font-bold text-blue-600'>
              ¥{targetPlanPrice}
              <span className='text-lg text-gray-600'>/月</span>
            </p>
          </div>

          {/* 功能列表 */}
          <div className='mb-6'>
            <p className='text-sm font-semibold text-gray-900 mb-3'>
              您将获得：
            </p>
            <ul className='space-y-2'>
              {features.map((feature, index) => (
                <li
                  key={index}
                  className='flex items-center text-sm text-gray-700'
                >
                  <svg
                    className='h-5 w-5 text-green-500 mr-2 flex-shrink-0'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* 付款二维码 */}
          <div className='bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6'>
            <div className='text-center'>
              <p className='text-base font-semibold text-gray-900 mb-4'>
                扫码支付开通套餐
              </p>
              <div className='w-72 h-72 mx-auto mb-4 bg-white rounded-lg p-4 shadow-md flex items-center justify-center'>
                {qrCodeError ? (
                  <div className='flex flex-col items-center justify-center h-full text-gray-400'>
                    <svg
                      className='h-16 w-16 mb-3'
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
                    <p className='text-sm text-center'>请上传付款二维码</p>
                  </div>
                ) : (
                  <img
                    src='/images/alipay-payment-qrcode.jpg'
                    alt='支付宝付款二维码'
                    className='w-full h-full object-contain'
                    loading='lazy'
                    onError={() => setQrCodeError(true)}
                    style={{ minWidth: '280px', minHeight: '280px' }}
                  />
                )}
              </div>
              <p className='text-sm text-gray-600 mb-2 font-medium'>
                使用支付宝扫码支付
              </p>
              <p className='text-xs text-gray-500'>
                支付成功后，套餐立即开通，配额自动更新
              </p>
            </div>
          </div>

          {/* 提示信息 */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
            <div className='flex items-start'>
              <svg
                className='h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                  clipRule='evenodd'
                />
              </svg>
              <div>
                <p className='text-sm font-semibold text-blue-900 mb-1'>
                  支付说明
                </p>
                <p className='text-sm text-blue-800'>
                  扫码支付后，系统将自动为您开通套餐。升级后配额立即生效，无需等待。
                </p>
              </div>
            </div>
          </div>

          {/* 按钮 */}
          <div className='flex space-x-3'>
            <button
              onClick={onCancel}
              className='flex-1 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium'
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className='flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? (
                <>
                  <svg
                    className='animate-spin h-5 w-5 mr-2'
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
                  处理中...
                </>
              ) : (
                <>
                  <svg
                    className='h-5 w-5 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
                    />
                  </svg>
                  我已支付
                </>
              )}
            </button>
          </div>

          {/* 底部说明 */}
          <p className='text-xs text-gray-500 text-center mt-4'>
            支付成功后，套餐立即开通，配额自动更新。如有问题请联系客服。
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeConfirmDialog;
