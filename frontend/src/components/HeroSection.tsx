import { useRef } from 'react';
import Button from './common/Button';
import Container from './common/Container';

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);

  return (
    <section
      ref={sectionRef}
      className='relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden'
    >
      {/* 🎨 背景装饰层 */}
      <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900'>
        {/* 星空效果 */}
        <div className='absolute inset-0 opacity-30'>
          <div className='absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse'></div>
          <div className='absolute top-1/3 left-1/2 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse' style={{ animationDelay: '0.5s' }}></div>
          <div className='absolute top-1/2 left-3/4 w-1 h-1 bg-purple-300 rounded-full animate-pulse' style={{ animationDelay: '1s' }}></div>
          <div className='absolute top-2/3 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse' style={{ animationDelay: '1.5s' }}></div>
          <div className='absolute top-3/4 left-2/3 w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse' style={{ animationDelay: '2s' }}></div>
          <div className='absolute top-1/5 left-4/5 w-1 h-1 bg-white rounded-full animate-pulse' style={{ animationDelay: '0.3s' }}></div>
          <div className='absolute top-4/5 left-1/5 w-1 h-1 bg-purple-200 rounded-full animate-pulse' style={{ animationDelay: '0.8s' }}></div>
        </div>
        {/* 光晕效果 */}
        <div className='absolute left-1/4 top-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-glow-pulse'></div>
        <div className='absolute right-1/4 bottom-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-glow-pulse' style={{ animationDelay: '2s' }}></div>
      </div>

      <Container size='xl' className='relative z-10'>
        {/* 主内容区 */}
        <div className='text-center max-w-4xl mx-auto'>
          {/* Agent标签 */}
          <div className='inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 backdrop-blur-sm animate-fade-in-up'>
            <span className='relative flex h-3 w-3'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-3 w-3 bg-green-500'></span>
            </span>
            <span className='text-sm font-medium text-blue-200'>
              2025年最火的AI技术 · 亲手体验真正的Agent
            </span>
          </div>

          {/* 主标题 */}
          <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up animation-delay-100'>
            <span className='text-white'>你的专属</span>
            <br className='md:hidden' />
            <span className='bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'> AI求职Agent</span>
          </h1>

          {/* 副标题 */}
          <p className='text-xl md:text-2xl text-blue-100/90 mb-4 animate-fade-in-up animation-delay-200'>
            不只是自动投递，更是一次AI前沿体验
          </p>

          {/* Agent科普 */}
          <div className='max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-300'>
            <p className='text-base text-blue-200/70 leading-relaxed'>
              Agent（智能体）是2025年最热门的AI概念——它能自主感知、思考、行动。
              <br className='hidden md:block' />
              在这里，你将亲手运行一个真正的Agent，让它帮你完成求职投递。
            </p>
          </div>

          {/* CTA按钮 */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animation-delay-400'>
            <Button
              as='a'
              href='/register'
              variant='primary'
              size='lg'
              className='group relative overflow-hidden transform hover:scale-105 active:scale-95 transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 px-8'
            >
              <span className='relative z-10 flex items-center gap-2'>
                <span>🚀</span>
                <span>激活我的Agent</span>
              </span>
            </Button>
            <Button
              as='a'
              href='/login'
              variant='secondary'
              size='lg'
              className='transform hover:scale-105 active:scale-95 transition-all duration-200 bg-white/10 border-white/30 text-white hover:bg-white/20'
            >
              已有账号？登录
            </Button>
          </div>

          {/* Agent特性卡片 */}
          <div className='grid md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in-up animation-delay-500'>
            {/* 特性1 */}
            <div className='group relative p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm hover:border-blue-400/50 transition-all duration-300'>
              <div className='w-12 h-12 mb-4 mx-auto rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform'>
                <span className='text-2xl'>🖥️</span>
              </div>
              <h3 className='text-lg font-semibold text-white mb-2'>在你电脑上运行</h3>
              <p className='text-sm text-blue-200/70'>
                Agent运行在本地，使用你的真实IP，几乎不会被平台风控
              </p>
            </div>

            {/* 特性2 */}
            <div className='group relative p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300'>
              <div className='w-12 h-12 mb-4 mx-auto rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform'>
                <span className='text-2xl'>🧠</span>
              </div>
              <h3 className='text-lg font-semibold text-white mb-2'>AI智能决策</h3>
              <p className='text-sm text-blue-200/70'>
                分析职位匹配度，生成个性化招呼语，像真人一样思考
              </p>
            </div>

            {/* 特性3 */}
            <div className='group relative p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm hover:border-green-400/50 transition-all duration-300'>
              <div className='w-12 h-12 mb-4 mx-auto rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform'>
                <span className='text-2xl'>⚡</span>
              </div>
              <h3 className='text-lg font-semibold text-white mb-2'>10分钟启动</h3>
              <p className='text-sm text-blue-200/70'>
                下载、配置、运行，开启你的AI求职之旅
              </p>
            </div>
          </div>

          {/* 底部提示 */}
          <div className='mt-12 animate-fade-in-up animation-delay-600'>
            <p className='text-sm text-blue-300/60 flex items-center justify-center gap-2'>
              <span>💡</span>
              <span>完全免费 · 开源透明 · 数据安全</span>
            </p>
          </div>
        </div>
      </Container>

      {/* 底部渐变过渡 */}
      <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent'></div>
    </section>
  );
};

export default HeroSection;
