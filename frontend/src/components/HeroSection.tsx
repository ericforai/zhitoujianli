import Button from './common/Button';
import Container from './common/Container';

const HeroSection = () => {
  return (
    <section className='pt-32 pb-20 bg-white'>
      <Container size='xl'>
        <div className='text-center'>
          <h1 className='text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight'>
            智投简历
          </h1>
          <p className='text-2xl md:text-3xl text-gray-600 mb-6'>
            智能投递 · 精准匹配
          </p>

          <p className='text-xl text-gray-500 mb-10 max-w-2xl mx-auto'>
            用AI帮你更快拿到心仪Offer
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center mb-16'>
            <Button as='a' href='/login' variant='primary' size='lg'>
              立即体验
            </Button>
            <Button as='a' href='/register' variant='secondary' size='lg'>
              免费开始
            </Button>
          </div>

          {/* 统计数据 */}
          <div className='border-t border-gray-200 pt-12'>
            <p className='text-sm text-gray-500 mb-8'>
              已有 10,000+ 用户选择智投简历
            </p>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto'>
              <div className='text-center'>
                <div className='text-4xl font-bold text-blue-600 mb-2'>95%</div>
                <div className='text-sm text-gray-600'>投递成功率</div>
              </div>
              <div className='text-center'>
                <div className='text-4xl font-bold text-blue-600 mb-2'>3倍</div>
                <div className='text-sm text-gray-600'>效率提升</div>
              </div>
              <div className='text-center'>
                <div className='text-4xl font-bold text-blue-600 mb-2'>24h</div>
                <div className='text-sm text-gray-600'>快速响应</div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;
