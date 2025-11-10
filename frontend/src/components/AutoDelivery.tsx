import { useState } from 'react';

const AutoDelivery = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [deliverySettings, setDeliverySettings] = useState({
    keywords: '',
    cities: '',
    maxPages: 3,
    enableSmartGreeting: true,
    enableResumeUpload: true,
  });

  const platforms = [
    {
      id: 'boss',
      name: 'Boss直聘',
      description: '专注互联网行业的招聘平台',
      icon: '💼',
      features: ['智能打招呼语', '批量投递', '实时状态跟踪'],
    },
    {
      id: 'zhilian',
      name: '智联招聘',
      description: '传统招聘平台的领军者',
      icon: '🌐',
      features: ['全选投递', '行业筛选', '职位匹配'],
    },
    {
      id: 'job51',
      name: '前程无忧',
      description: '综合性招聘服务平台',
      icon: '🎯',
      features: ['批量申请', '简历优化', '投递统计'],
    },
    {
      id: 'liepin',
      name: '猎聘网',
      description: '中高端人才招聘平台',
      icon: '🎖️',
      features: ['精准匹配', '猎头推荐', '职业规划'],
    },
  ];

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  // 已废弃：直接在按钮中处理跳转
  // const handleStartDelivery = () => {
  //   if (selectedPlatforms.length === 0) {
  //     alert('请至少选择一个招聘平台');
  //     return;
  //   }
  //   window.open('http://115.190.182.95/login', '_blank');
  // };

  return (
    <section id='auto-delivery' className='py-28 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-20'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-chinese'>
            自动化投递简历
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            一键批量投递，智能匹配岗位，节省宝贵时间，提升求职效率
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* 左侧：平台选择 */}
          <div className='space-y-6'>
            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <h3 className='text-lg font-semibold mb-4'>1. 选择招聘平台</h3>
              <div className='space-y-4'>
                {platforms.map(platform => (
                  <div
                    key={platform.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePlatformToggle(platform.id)}
                  >
                    <div className='flex items-center space-x-3'>
                      <span className='text-2xl'>{platform.icon}</span>
                      <div className='flex-1'>
                        <h4 className='font-medium text-gray-900'>
                          {platform.name}
                        </h4>
                        <p className='text-sm text-gray-600'>
                          {platform.description}
                        </p>
                        <div className='flex flex-wrap gap-1 mt-2'>
                          {platform.features.map((feature, index) => (
                            <span
                              key={index}
                              className='px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded'
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPlatforms.includes(platform.id)
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedPlatforms.includes(platform.id) && (
                          <svg
                            className='w-3 h-3 text-white'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 投递设置 */}
            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <h3 className='text-lg font-semibold mb-4'>2. 投递设置</h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    关键词设置
                  </label>
                  <input
                    type='text'
                    value={deliverySettings.keywords}
                    onChange={e =>
                      setDeliverySettings(prev => ({
                        ...prev,
                        keywords: e.target.value,
                      }))
                    }
                    placeholder='例如：前端开发、Java工程师、产品经理'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    目标城市
                  </label>
                  <input
                    type='text'
                    value={deliverySettings.cities}
                    onChange={e =>
                      setDeliverySettings(prev => ({
                        ...prev,
                        cities: e.target.value,
                      }))
                    }
                    placeholder='例如：北京、上海、深圳'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    最大页数: {deliverySettings.maxPages}
                  </label>
                  <input
                    type='range'
                    min='1'
                    max='10'
                    value={deliverySettings.maxPages}
                    onChange={e =>
                      setDeliverySettings(prev => ({
                        ...prev,
                        maxPages: parseInt(e.target.value),
                      }))
                    }
                    className='w-full'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：功能说明和使用建议 */}
          <div className='space-y-6'>
            {/* 核心优势 */}
            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <h3 className='text-lg font-semibold mb-4'>🚀 核心优势</h3>
              <div className='space-y-3'>
                <div className='flex items-start space-x-3'>
                  <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
                    <svg
                      className='w-4 h-4 text-green-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-medium text-gray-900'>批量投递</h4>
                    <p className='text-sm text-gray-600'>
                      一次设置，自动投递数百个岗位，效率提升10倍
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-3'>
                  <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                    <svg
                      className='w-4 h-4 text-blue-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-medium text-gray-900'>智能筛选</h4>
                    <p className='text-sm text-gray-600'>
                      AI自动过滤不匹配岗位，只投递高匹配度职位
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-3'>
                  <div className='w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0'>
                    <svg
                      className='w-4 h-4 text-purple-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-medium text-gray-900'>个性化招呼</h4>
                    <p className='text-sm text-gray-600'>
                      基于JD生成个性化打招呼语，提升HR回复率
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-3'>
                  <div className='w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0'>
                    <svg
                      className='w-4 h-4 text-orange-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-medium text-gray-900'>实时监控</h4>
                    <p className='text-sm text-gray-600'>
                      投递进度实时跟踪，成功率统计分析
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 使用建议 */}
            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <h3 className='text-lg font-semibold mb-4'>💡 使用建议</h3>
              <div className='space-y-3 text-sm text-gray-600'>
                <div className='flex items-start space-x-2'>
                  <span className='text-indigo-600 font-bold'>1.</span>
                  <span>建议先上传简历并生成智能打招呼语，提升投递成功率</span>
                </div>
                <div className='flex items-start space-x-2'>
                  <span className='text-indigo-600 font-bold'>2.</span>
                  <span>关键词设置要精准，避免投递不相关岗位</span>
                </div>
                <div className='flex items-start space-x-2'>
                  <span className='text-indigo-600 font-bold'>3.</span>
                  <span>建议从较少页数开始测试，确认效果后再增加</span>
                </div>
                <div className='flex items-start space-x-2'>
                  <span className='text-indigo-600 font-bold'>4.</span>
                  <span>定期查看投递结果，根据反馈调整策略</span>
                </div>
                <div className='flex items-start space-x-2'>
                  <span className='text-indigo-600 font-bold'>5.</span>
                  <span>每个平台建议设置不同的关键词，提高覆盖面</span>
                </div>
                <div className='flex items-start space-x-2'>
                  <span className='text-indigo-600 font-bold'>6.</span>
                  <span>避免在深夜投递，工作时间投递回复率更高</span>
                </div>
              </div>
            </div>

            {/* 投递效果展示 */}
            <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg'>
              <h3 className='text-lg font-semibold mb-4 text-gray-900 flex items-center'>
                <svg
                  className='w-5 h-5 mr-2 text-indigo-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
                投递效果
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-white p-4 rounded-lg text-center'>
                  <div className='text-2xl font-bold text-blue-600 mb-1'>
                    95%
                  </div>
                  <div className='text-sm text-gray-600'>投递成功率</div>
                </div>
                <div className='bg-white p-4 rounded-lg text-center'>
                  <div className='text-2xl font-bold text-green-600 mb-1'>
                    10x
                  </div>
                  <div className='text-sm text-gray-600'>效率提升</div>
                </div>
                <div className='bg-white p-4 rounded-lg text-center'>
                  <div className='text-2xl font-bold text-purple-600 mb-1'>
                    500+
                  </div>
                  <div className='text-sm text-gray-600'>日均投递</div>
                </div>
                <div className='bg-white p-4 rounded-lg text-center'>
                  <div className='text-2xl font-bold text-orange-600 mb-1'>
                    24h
                  </div>
                  <div className='text-sm text-gray-600'>快速响应</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA - 引导注册（全宽） */}
        <div className='mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-lg text-white text-center'>
          <h3 className='text-2xl font-semibold mb-2'>准备开始投递？</h3>
          <p className='text-base opacity-90 mb-6'>
            注册后即可使用所有自动化投递功能，让求职更高效
          </p>
          <a
            href='/register'
            className='inline-block bg-white text-indigo-600 py-3 px-8 rounded-lg font-medium hover:bg-gray-100 transition-colors'
          >
            立即注册
          </a>
        </div>
      </div>
    </section>
  );
};

export default AutoDelivery;
