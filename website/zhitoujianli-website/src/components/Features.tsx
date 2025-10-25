const Features = () => {
  const features = [
    {
      icon: '🎯',
      title: '自动投递',
      description: '一键投递100+岗位，AI自动筛选最匹配的机会',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '🤖',
      title: 'AI智能匹配',
      description: '85%匹配度精准筛选，只投递高质量岗位',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: '💬',
      title: '个性化打招呼',
      description: '基于JD生成专属开场白，提升3倍HR回复率',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: '📊',
      title: '实时数据分析',
      description: '投递进度可视化追踪，优化求职策略',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section className='py-24 bg-white'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>核心功能</h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            AI驱动的智能求职系统，让每一次投递都精准高效
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {features.map((feature, index) => (
            <div
              key={index}
              className='bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 group'
            >
              <div className='mb-6'>
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white text-4xl transform group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>{feature.title}</h3>
              <p className='text-gray-600 leading-relaxed'>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
