import React from 'react';

/**
 * 价格方案组件
 * 展示智投简历的定价方案和套餐选择
 */
const Pricing: React.FC = () => {
  const pricingPlans = [
    {
      name: '基础版',
      price: '免费',
      period: '永久',
      description: '适合个人用户试用',
      features: [
        '简历解析和优化',
        '基础岗位匹配',
        '智能打招呼语生成',
        '每月10次投递机会',
        '基础数据分析',
      ],
      buttonText: '免费使用',
      buttonClass: 'bg-gray-600 hover:bg-gray-700',
      popular: false,
    },
    {
      name: '专业版',
      price: '¥99',
      period: '/月',
      description: '适合求职者深度使用',
      features: [
        '高级简历解析和优化',
        '精准岗位匹配算法',
        '个性化打招呼语生成',
        '每月100次投递机会',
        '详细数据分析报告',
        '简历模板库',
        '求职进度跟踪',
        '邮件通知服务',
      ],
      buttonText: '立即升级',
      buttonClass: 'bg-blue-600 hover:bg-blue-700',
      popular: true,
    },
    {
      name: '企业版',
      price: '¥299',
      period: '/月',
      description: '适合HR和企业用户',
      features: [
        '批量简历处理',
        '企业级岗位匹配',
        '团队协作功能',
        '无限制投递次数',
        '高级数据分析',
        'API接口调用',
        '专属客户经理',
        '定制化服务',
      ],
      buttonText: '联系销售',
      buttonClass: 'bg-green-600 hover:bg-green-700',
      popular: false,
    },
  ];

  return (
    <section id='pricing' className='py-20 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* 标题区域 */}
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            选择适合您的方案
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            从免费试用开始，逐步升级到专业版和企业版，满足不同用户的需求
          </p>
        </div>

        {/* 价格卡片 */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {/* 热门标签 */}
              {plan.popular && (
                <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                  <span className='bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium'>
                    最受欢迎
                  </span>
                </div>
              )}

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
              <ul className='space-y-4 mb-8'>
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
                className={`w-full ${plan.buttonClass} text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* 底部说明 */}
        <div className='text-center mt-16'>
          <p className='text-gray-600 mb-4'>
            所有方案都包含7天免费试用，不满意可随时取消
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
              7天免费试用
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
        </div>
      </div>
    </section>
  );
};

export default Pricing;
