/**
 * Agent启动步骤展示
 * 用可视化的方式展示Agent的3步启动流程
 */

import Container from './common/Container';

const AgentSetupSteps = () => {
  const steps = [
    {
      number: '01',
      icon: '📥',
      title: '下载Agent程序',
      description: '一个轻量级的Python程序，只有几十KB',
      detail: '无需安装，解压即用',
      color: 'blue',
    },
    {
      number: '02',
      icon: '🔑',
      title: '运行并登录',
      description: '输入智投简历账号密码即可',
      detail: 'Agent会记住登录状态',
      color: 'purple',
    },
    {
      number: '03',
      icon: '🚀',
      title: '开始投递',
      description: '回到网站点击「开始投递」',
      detail: 'Agent会自动帮你沟通HR',
      color: 'green',
    },
  ];

  const colorClasses: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      glow: 'shadow-blue-100',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      glow: 'shadow-purple-100',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      glow: 'shadow-green-100',
    },
  };

  return (
    <section className='py-20 bg-white'>
      <Container size='lg'>
        {/* 标题 */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-green-100 text-green-700'>
            <span>⚡</span>
            <span className='text-sm font-medium'>简单三步</span>
          </div>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            10分钟，启动你的Agent
          </h2>
          <p className='text-lg text-gray-600 max-w-xl mx-auto'>
            不需要编程基础，跟着步骤走就行
          </p>
        </div>

        {/* 步骤卡片 */}
        <div className='relative'>
          {/* 连接线 - 桌面端 */}
          <div className='hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 -translate-y-1/2 z-0'></div>

          <div className='grid md:grid-cols-3 gap-8 relative z-10'>
            {steps.map((step, index) => {
              const colors = colorClasses[step.color];
              return (
                <div
                  key={index}
                  className={`relative p-8 rounded-2xl ${colors.bg} border-2 ${colors.border} shadow-lg ${colors.glow} hover:shadow-xl transition-shadow duration-300`}
                >
                  {/* 步骤编号 */}
                  <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white border-2 ${colors.border} flex items-center justify-center shadow-md`}>
                    <span className={`text-lg font-bold ${colors.text}`}>{step.number}</span>
                  </div>

                  {/* 图标 */}
                  <div className='text-center mb-6 mt-2'>
                    <span className='text-5xl'>{step.icon}</span>
                  </div>

                  {/* 内容 */}
                  <h3 className='text-xl font-semibold text-gray-900 text-center mb-3'>
                    {step.title}
                  </h3>
                  <p className='text-gray-600 text-center mb-2'>
                    {step.description}
                  </p>
                  <p className={`text-sm ${colors.text} text-center font-medium`}>
                    {step.detail}
                  </p>

                  {/* 箭头 - 移动端 */}
                  {index < steps.length - 1 && (
                    <div className='md:hidden flex justify-center mt-6'>
                      <span className='text-gray-300 text-2xl'>↓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 补充说明 */}
        <div className='mt-16 bg-gray-50 rounded-2xl p-8'>
          <div className='grid md:grid-cols-3 gap-6 text-center'>
            <div className='flex flex-col items-center'>
              <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3'>
                <span className='text-xl'>🔒</span>
              </div>
              <h4 className='font-semibold text-gray-900 mb-1'>安全可靠</h4>
              <p className='text-sm text-gray-600'>代码开源，运行在你自己的电脑上</p>
            </div>
            <div className='flex flex-col items-center'>
              <div className='w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3'>
                <span className='text-xl'>🌐</span>
              </div>
              <h4 className='font-semibold text-gray-900 mb-1'>本地IP</h4>
              <p className='text-sm text-gray-600'>使用你的真实网络环境，不触发风控</p>
            </div>
            <div className='flex flex-col items-center'>
              <div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3'>
                <span className='text-xl'>🎮</span>
              </div>
              <h4 className='font-semibold text-gray-900 mb-1'>可视化</h4>
              <p className='text-sm text-gray-600'>看着Agent自动操作浏览器，了解AI如何工作</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className='text-center mt-12'>
          <a
            href='/register'
            className='inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg'
          >
            <span>🚀</span>
            <span>立即开始</span>
          </a>
          <p className='mt-4 text-sm text-gray-500'>
            完全免费，无需信用卡
          </p>
        </div>
      </Container>
    </section>
  );
};

export default AgentSetupSteps;
