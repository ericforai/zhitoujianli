import Button from './common/Button';
import Container from './common/Container';

const HeroSection = () => {
  return (
    <section className='pt-40 pb-32 bg-white'>
      <Container size='xl'>
        <div className='text-center'>
          <h1 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight'>
            智投简历
          </h1>
          <p className='text-2xl md:text-3xl text-gray-600 mb-8'>
            AI帮你自动投递简历
          </p>

          <p className='text-xl text-gray-500 mb-12 max-w-2xl mx-auto'>
            免费注册，开启智能求职之旅
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button as='a' href='/login' variant='primary' size='lg'>
              立即体验
            </Button>
            <Button as='a' href='/register' variant='secondary' size='lg'>
              免费开始
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;
