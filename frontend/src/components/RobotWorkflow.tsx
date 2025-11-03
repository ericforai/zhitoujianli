import Card from './common/Card';
import Container from './common/Container';

const RobotWorkflow = () => {
  const steps = [
    {
      number: '01',
      title: '上传简历',
      subtitle: '机器人开始工作',
      description:
        'AI深度解析你的简历，提取核心优势、工作经验、技能特长，为你做出立体化分析',
      icon: (
        <svg
          className='w-12 h-12 text-blue-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
          />
        </svg>
      ),
    },
    {
      number: '02',
      title: '智能岗位匹配',
      subtitle: '找到最适合你的岗位',
      description:
        '机器人自动分析JD要求，用你的优势去匹配岗位需求，计算匹配度分数',
      icon: (
        <svg
          className='w-12 h-12 text-green-600'
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
      ),
    },
    {
      number: '03',
      title: '生成个性化打招呼语',
      subtitle: '让HR第一眼就感兴趣',
      description:
        '针对每个岗位定制开场白，突出你与岗位的匹配点，让HR产生进一步联系的冲动',
      icon: (
        <svg
          className='w-12 h-12 text-purple-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
          />
        </svg>
      ),
    },
    {
      number: '04',
      title: '专属机器人帮您投递',
      subtitle: '像真人一样操作',
      description:
        '机器人模拟真实用户行为投递，避免平台反爬机制，24小时不间断工作',
      icon: (
        <svg
          className='w-12 h-12 text-orange-600'
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
      ),
    },
  ];

  return (
    <section className='py-20 bg-gradient-to-b from-white to-gray-50'>
      <Container size='xl'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            机器人如何帮你投简历
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            专属AI投递机器人 · 全流程智能助力 · 让HR第一眼就记住你
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {steps.map((step, index) => (
            <Card key={index} hover padding='lg' className='relative'>
              <div className='flex gap-6'>
                {/* 图标 */}
                <div className='flex-shrink-0'>
                  <div className='w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center'>
                    {step.icon}
                  </div>
                </div>

                {/* 内容 */}
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <span className='text-2xl font-bold text-gray-300'>
                      {step.number}
                    </span>
                    <h3 className='text-xl font-semibold text-gray-900'>
                      {step.title}
                    </h3>
                  </div>
                  <p className='text-blue-600 font-medium mb-2'>
                    {step.subtitle}
                  </p>
                  <p className='text-gray-600 leading-relaxed'>
                    {step.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 底部说明 */}
        <div className='mt-12 text-center bg-blue-50 rounded-2xl p-8'>
          <div className='inline-flex items-center gap-2 mb-4'>
            <img
              src='/images/chat-bot.svg'
              alt='机器人'
              className='w-12 h-12'
            />
            <span className='text-lg font-semibold text-gray-900'>
              您的专属投递助手已就位
            </span>
          </div>
          <p className='text-gray-600 max-w-2xl mx-auto'>
            不是爬虫，像真人一样操作 · 避免平台封禁 · 每一份投递都经过精心匹配
            <br />
            <span className='text-blue-600 font-medium'>
              让机器人帮你投简历，把时间用在准备面试上
            </span>
          </p>
        </div>
      </Container>
    </section>
  );
};

export default RobotWorkflow;
