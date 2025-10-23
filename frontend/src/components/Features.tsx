import Card from './common/Card';
import Container from './common/Container';

const Features = () => {
  const features = [
    {
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
            d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4'
          />
        </svg>
      ),
      title: '自动化投递简历',
      description: '一键批量投递，节省宝贵时间',
    },
    {
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
            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
          />
        </svg>
      ),
      title: 'JD智能匹配度分析',
      description: '精准解析简历与JD的契合度',
    },
    {
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
            d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
          />
        </svg>
      ),
      title: '智能化打招呼语',
      description: '基于JD和简历生成个性化、高匹配度的开场白',
    },
  ];

  return (
    <section id='features' className='py-20 bg-gray-50'>
      <Container size='xl'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold text-gray-900 mb-4'>
            三大核心功能
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            让AI成为你的求职助手，提升求职效率
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {features.map((feature, index) => (
            <Card key={index} hover padding='lg'>
              <div className='text-center'>
                <div className='flex justify-center mb-6'>{feature.icon}</div>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                  {feature.title}
                </h3>
                <p className='text-gray-600 leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Features;
