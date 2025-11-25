import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePlanPermission } from '../hooks/usePlanPermission';
import { PlanType } from '../services/planService';
import UpgradeConfirmDialog from './plan/UpgradeConfirmDialog';

/**
 * 价格方案组件
 * 展示智投简历的定价方案和套餐选择
 */
const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { userPlan, isPlanType } = usePlanPermission();

  // 升级对话框状态
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  /**
   * 处理免费使用按钮点击
   */
  const handleFreePlan = () => {
    if (isAuthenticated) {
      if (isPlanType(PlanType.FREE)) {
        navigate('/dashboard');
      } else {
        alert('您已经是付费用户');
      }
    } else {
      navigate('/register');
    }
  };

  /**
   * 处理升级按钮点击（高效版）
   */
  const handleBasicPlan = () => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    if (isPlanType(PlanType.BASIC)) {
      alert('您已经是高效求职版用户');
      return;
    }

    if (isPlanType(PlanType.PROFESSIONAL)) {
      alert('您已经是极速上岸版用户，无需降级');
      return;
    }

    // 显示升级确认对话框
    setSelectedPlan(PlanType.BASIC);
    setShowUpgradeDialog(true);
  };

  /**
   * 处理升级按钮点击（极速版）
   */
  const handleProfessionalPlan = () => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    if (isPlanType(PlanType.PROFESSIONAL)) {
      alert('您已经是极速上岸版用户');
      return;
    }

    // 显示升级确认对话框
    setSelectedPlan(PlanType.PROFESSIONAL);
    setShowUpgradeDialog(true);
  };

  /**
   * 点击"联系客服开通"按钮
   */
  const handleContactService = () => {
    // 关闭对话框
    setShowUpgradeDialog(false);

    // 跳转到联系页面，带上套餐参数
    const planParam = selectedPlan === PlanType.BASIC ? 'basic' : 'professional';
    navigate(`/contact?plan=${planParam}&action=upgrade`);
  };

  /**
   * 取消对话框
   */
  const handleCancelDialog = () => {
    setShowUpgradeDialog(false);
    setSelectedPlan(null);
  };

  /**
   * 获取套餐名称
   */
  const getPlanName = (plan: PlanType): string => {
    switch (plan) {
      case PlanType.FREE:
        return '求职入门版';
      case PlanType.BASIC:
        return '高效求职版';
      case PlanType.PROFESSIONAL:
        return '极速上岸版';
      default:
        return '';
    }
  };

  /**
   * 获取套餐价格
   */
  const getPlanPrice = (plan: PlanType): number => {
    switch (plan) {
      case PlanType.FREE:
        return 0;
      case PlanType.BASIC:
        return 49;
      case PlanType.PROFESSIONAL:
        return 99;
      default:
        return 0;
    }
  };


  const pricingPlans = [
    {
      type: PlanType.FREE,
      name: '求职入门版',
      price: '免费',
      period: '永久使用',
      description: '适合应届生和轻度求职者',
      userGroup: '应届生',
      features: [
        '简历基础优化 1次',
        '每日投递 5次',
        '基础岗位匹配',
        '智能打招呼语生成',
        '基础数据分析',
      ],
      buttonText: '免费使用',
      buttonClass: 'bg-gray-600 hover:bg-gray-700',
      popular: false,
      onClick: handleFreePlan,
    },
    {
      type: PlanType.BASIC,
      name: '高效求职版',
      price: '¥49',
      period: '/月',
      description: '适合在职求职者',
      userGroup: '在职求职者',
      features: [
        '简历基础优化 不限次',
        '简历高级优化 1次',
        '每日投递 30次',
        '精准岗位匹配',
        '个性化打招呼语生成',
        '详细数据分析报告',
      ],
      buttonText: '立即升级',
      buttonClass: 'bg-blue-600 hover:bg-blue-700',
      popular: true,
      onClick: handleBasicPlan,
    },
    {
      type: PlanType.PROFESSIONAL,
      name: '极速上岸版',
      price: '¥99',
      period: '/月',
      description: '适合急找工作者',
      userGroup: '急找工作者',
      features: [
        '简历基础优化 不限次',
        '简历高级优化 3次',
        '每日投递 100次',
        '智能岗位匹配',
        '高级打招呼语生成',
        '深度数据分析',
        '优先客服支持',
        '求职进度可视化',
      ],
      buttonText: '立即升级',
      buttonClass: 'bg-green-600 hover:bg-green-700',
      popular: false,
      onClick: handleProfessionalPlan,
    },
  ];

  /**
   * 判断是否是当前套餐
   */
  const isCurrentPlan = (planType: PlanType): boolean => {
    return isAuthenticated && isPlanType(planType);
  };

  return (
    <section id='pricing' className='py-20 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* 标题区域 */}
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            选择适合您的方案
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            根据您的求职阶段，选择最合适的版本
          </p>

          {/* 当前套餐提示 */}
          {isAuthenticated && userPlan && (
            <div className='mt-6 inline-block'>
              <div className='bg-blue-50 border border-blue-200 rounded-lg px-6 py-3'>
                <span className='text-sm text-blue-800'>
                  您当前使用的是：
                  <span className='font-semibold ml-2'>{userPlan.planName}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 价格卡片 */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch'>
          {pricingPlans.map((plan, index) => {
            const isCurrentUserPlan = isCurrentPlan(plan.type);

            return (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg p-8 flex flex-col h-full min-h-0 ${
                  plan.popular ? 'ring-2 ring-blue-500' : ''
                } ${isCurrentUserPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {/* 热门标签 */}
                {plan.popular && !isCurrentUserPlan && (
                  <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                    <span className='bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium'>
                      最受欢迎
                    </span>
                  </div>
                )}

                {/* 当前套餐标签 */}
                {isCurrentUserPlan && (
                  <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                    <span className='bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium'>
                      当前套餐
                    </span>
                  </div>
                )}

                {/* 用户群体标签 */}
                <div className='mb-4'>
                  <span className='inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full'>
                    {plan.userGroup}
                  </span>
                </div>

                {/* 套餐名称和价格 */}
                <div className='text-center mb-8'>
                  <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                    {plan.name}
                  </h3>
                  <p className='text-gray-600 mb-4'>{plan.description}</p>
                  <div className='flex items-baseline justify-center'>
                    <span className='text-4xl font-bold text-gray-900'>
                      {plan.price}
                    </span>
                    <span className='text-xl text-gray-600 ml-1'>
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* 功能列表 */}
                <ul className='space-y-4 mb-8 flex-grow'>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className='flex items-start'>
                      <svg
                        className='w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0'
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
                      <span className='text-gray-700'>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* 按钮 */}
                <button
                  onClick={plan.onClick}
                  disabled={isCurrentUserPlan}
                  className={`w-full ${
                    isCurrentUserPlan
                      ? 'bg-gray-300 cursor-not-allowed'
                      : plan.buttonClass
                  } text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 mt-auto flex-shrink-0 ${
                    !isCurrentUserPlan ? 'hover:opacity-90' : ''
                  }`}
                >
                  {isCurrentUserPlan ? '当前套餐' : plan.buttonText}
                </button>
              </div>
            );
          })}
        </div>

        {/* 底部说明 */}
        <div className='text-center mt-16'>
          <p className='text-gray-600 mb-4'>
            所有方案都包含基础功能，随时可以升级或取消
          </p>
          <div className='flex justify-center items-center space-x-8 text-sm text-gray-500'>
            <div className='flex items-center'>
              <svg
                className='w-4 h-4 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                />
              </svg>
              安全支付
            </div>
            <div className='flex items-center'>
              <svg
                className='w-4 h-4 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              立即生效
            </div>
            <div className='flex items-center'>
              <svg
                className='w-4 h-4 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z'
                />
              </svg>
              随时取消
            </div>
          </div>

          {/* 场景引导 */}
          <div className='mt-12'>
            <button
              onClick={() => navigate('/scenes')}
              className='inline-flex items-center text-blue-600 hover:text-blue-700 font-medium'
            >
              不确定选哪个？查看适合您的场景
              <svg
                className='w-5 h-5 ml-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 升级确认对话框 - 引导用户联系客服 */}
      {selectedPlan && (
        <UpgradeConfirmDialog
          isOpen={showUpgradeDialog}
          targetPlan={selectedPlan}
          targetPlanName={getPlanName(selectedPlan)}
          targetPlanPrice={getPlanPrice(selectedPlan)}
          currentPlanName={userPlan?.planName || '求职入门版'}
          loading={false}
          onConfirm={handleContactService}
          onCancel={handleCancelDialog}
        />
      )}
    </section>
  );
};

export default Pricing;
