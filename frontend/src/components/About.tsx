import Container from './common/Container';

const About = () => {
  return (
    <section id='about' className='py-20 bg-white'>
      <Container size='xl'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-chinese'>
            关于智投简历
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            用AI技术让求职更智能，让每一次投递都更精准
          </p>
        </div>

        <div className='max-w-5xl mx-auto'>
          {/* 公司简介 */}
          <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl mb-8'>
            <h3 className='text-2xl font-bold text-gray-900 mb-4'>公司简介</h3>
            <p className='text-gray-700 leading-relaxed mb-4'>
              智投简历成立于2024年，是一家专注于AI求职服务的创新型科技公司。我们致力于运用人工智能技术，
              为求职者提供智能化的简历优化、职位匹配和投递服务，让求职过程更加高效、精准。
            </p>
            <p className='text-gray-700 leading-relaxed'>
              凭借先进的大语言模型技术和深度学习算法，我们已经帮助数万名求职者提升了求职成功率，
              平均投递成功率提升300%以上。我们的愿景是成为全球领先的AI求职服务平台，
              让每个人都能找到心仪的工作。
            </p>
          </div>

          {/* 使命愿景 */}
          <div className='grid md:grid-cols-2 gap-6 mb-12'>
            <div className='bg-white border-2 border-blue-100 p-6 rounded-xl'>
              <div className='flex items-center mb-4'>
                <svg
                  className='w-8 h-8 text-blue-600 mr-3'
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
                <h3 className='text-xl font-bold text-gray-900'>我们的使命</h3>
              </div>
              <p className='text-gray-700 leading-relaxed'>
                运用人工智能技术，为求职者提供智能化、个性化的求职服务，
                让每一次简历投递都更加精准有效，帮助更多人实现职业梦想。
              </p>
            </div>

            <div className='bg-white border-2 border-indigo-100 p-6 rounded-xl'>
              <div className='flex items-center mb-4'>
                <svg
                  className='w-8 h-8 text-indigo-600 mr-3'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                  />
                </svg>
                <h3 className='text-xl font-bold text-gray-900'>我们的愿景</h3>
              </div>
              <p className='text-gray-700 leading-relaxed'>
                成为全球领先的AI求职服务平台，让AI技术惠及每一位求职者，
                构建更加智能、高效的求职生态系统。
              </p>
            </div>
          </div>

          {/* 核心价值 */}
          <div>
            <h3 className='text-2xl font-bold text-gray-900 mb-6 text-center'>
              核心价值
            </h3>
            <div className='grid md:grid-cols-4 gap-6'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-8 h-8 text-blue-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                    />
                  </svg>
                </div>
                <h4 className='font-semibold text-gray-900 mb-2'>技术创新</h4>
                <p className='text-sm text-gray-600'>
                  持续投入AI技术研发，不断提升服务智能化水平
                </p>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-8 h-8 text-green-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
                    />
                  </svg>
                </div>
                <h4 className='font-semibold text-gray-900 mb-2'>用户至上</h4>
                <p className='text-sm text-gray-600'>
                  以用户需求为导向，提供优质的服务体验
                </p>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-8 h-8 text-purple-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                    />
                  </svg>
                </div>
                <h4 className='font-semibold text-gray-900 mb-2'>安全可靠</h4>
                <p className='text-sm text-gray-600'>
                  严格保护用户隐私，确保数据安全
                </p>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-8 h-8 text-orange-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                </div>
                <h4 className='font-semibold text-gray-900 mb-2'>持续改进</h4>
                <p className='text-sm text-gray-600'>
                  不断优化产品功能，追求卓越品质
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default About;
