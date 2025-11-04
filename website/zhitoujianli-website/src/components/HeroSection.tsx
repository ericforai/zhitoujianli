const HeroSection = () => {
  return (
    <section className='pt-20 pb-24 bg-gradient-hero'>
      <div className='max-w-7xl mx-auto px-6 sm:px-8 lg:px-12'>
        <div className='grid md:grid-cols-2 gap-8 items-center'>
          {/* 左侧：文本内容 */}
          <div className='text-center md:text-left'>
            <h1 className='text-3xl md:text-5xl font-bold text-gray-900 mb-6 font-chinese'>
              智投简历
              <span className='block text-xl md:text-2xl font-normal text-gray-600 mt-2'>
                智能投递 · 精准匹配
              </span>
            </h1>

            <p className='text-lg md:text-xl text-gray-600 mb-8'>
              用AI帮你更快拿到心仪Offer
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center md:justify-start'>
              <a
                href='http://115.190.182.95/login'
                className='bg-gradient-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg text-center'
              >
                立即体验
              </a>
              <a
                href='#pricing'
                className='border-2 border-primary-500 text-primary-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300 text-center'
              >
                免费开始
              </a>
            </div>

            <div className='mt-12'>
              <p className='text-sm text-gray-500 mb-4'>已有 10,000+ 用户选择智投简历</p>
              <div className='flex justify-center md:justify-start space-x-8 opacity-60'>
                <div className='text-center'>
                  <div className='text-xl font-bold text-primary-500'>95%</div>
                  <div className='text-sm text-gray-600'>投递成功率</div>
                </div>
                <div className='text-center'>
                  <div className='text-xl font-bold text-secondary-500'>3倍</div>
                  <div className='text-sm text-gray-600'>效率提升</div>
                </div>
                <div className='text-center'>
                  <div className='text-xl font-bold text-accent-green'>24h</div>
                  <div className='text-sm text-gray-600'>快速响应</div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：机器人图标 */}
          <div className='flex justify-center items-center'>
            <img 
              src='/images/chat-bot.svg' 
              alt='AI智能助手' 
              className='w-64 h-64 md:w-80 md:h-80 object-contain animate-float'
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
