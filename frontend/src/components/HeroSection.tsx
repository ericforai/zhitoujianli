import { useRef } from 'react';
import Button from './common/Button';
import Container from './common/Container';

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);

  return (
    <section
      ref={sectionRef}
      className='relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden'
    >
      {/* 🎨 背景装饰层 - 优化光斑融合 */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50'>
        {/* 左侧光斑（蓝色） */}
        <div className='absolute left-0 top-1/3 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-glow-pulse'></div>
        {/* 右侧光斑（紫色） */}
        <div
          className='absolute right-0 top-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-glow-pulse'
          style={{ animationDelay: '2s' }}
        ></div>
        {/* 中央光斑（薄荷绿） */}
        <div
          className='absolute left-1/2 bottom-1/4 w-72 h-72 bg-green-300/10 rounded-full blur-3xl animate-glow-pulse'
          style={{ animationDelay: '1s' }}
        ></div>
        {/* 径向渐变光晕 */}
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-blue-50/30 to-transparent'></div>
        {/* 微妙网格纹理 */}
        <div
          className='absolute inset-0 opacity-[0.03]'
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      <Container size='xl' className='relative z-10'>
        {/* ✨ 视觉连接层 - 从按钮到插图的光线流动 */}
        <div
          className='absolute inset-0 hidden lg:block pointer-events-none'
          style={{ zIndex: 5 }}
        >
          {/* 渐变光线1 - 主光束 */}
          <div
            className='absolute left-[25%] top-1/2 w-1/2 h-0.5 animate-gradient-beam'
            style={{
              background:
                'linear-gradient(90deg, rgba(72, 115, 209, 0) 0%, rgba(72, 115, 209, 0.6) 50%, rgba(139, 92, 246, 0) 100%)',
              backgroundSize: '200% 100%',
            }}
          ></div>

          {/* 渐变光线2 - 辅助光束 */}
          <div
            className='absolute left-[25%] top-[52%] w-1/2 h-px animate-gradient-beam'
            style={{
              background:
                'linear-gradient(90deg, rgba(139, 92, 246, 0) 0%, rgba(139, 92, 246, 0.4) 50%, rgba(72, 115, 209, 0) 100%)',
              backgroundSize: '200% 100%',
              animationDelay: '1s',
            }}
          ></div>

          {/* 纸飞机动效 */}
          <div className='absolute left-[30%] top-[45%]'>
            <div className='animate-paper-plane text-2xl'>✈️</div>
          </div>

          {/* 数据流动点 */}
          <div className='absolute left-[35%] top-[40%]'>
            <div className='animate-data-flow'>
              <div className='w-2 h-2 bg-blue-400 rounded-full'></div>
            </div>
          </div>
          <div className='absolute left-[40%] top-[48%]'>
            <div className='animate-data-flow' style={{ animationDelay: '1s' }}>
              <div className='w-2 h-2 bg-purple-400 rounded-full'></div>
            </div>
          </div>
          <div className='absolute left-[45%] top-[44%]'>
            <div className='animate-data-flow' style={{ animationDelay: '2s' }}>
              <div className='w-2 h-2 bg-green-400 rounded-full'></div>
            </div>
          </div>
        </div>

        <div className='grid lg:grid-cols-5 gap-12 lg:gap-8 items-center relative'>
          {/* 左侧内容区（60%）- 右移5%形成对角线视觉 */}
          <div
            className='lg:col-span-3 text-center lg:text-left relative lg:pl-8'
            style={{ zIndex: 10 }}
          >
            {/* Badge标签 */}
            <div className='inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200/50 animate-fade-in-up animate-pulse-subtle'>
              <span className='text-2xl'>✨</span>
              <span className='text-sm font-medium text-purple-700'>
                免费使用 · 智能求职
              </span>
            </div>

            {/* 主标题行 - 标题+竖向功能标签 */}
            <div className='mb-6 animate-fade-in-up animation-delay-100'>
              <div className='flex items-center gap-6'>
                <h1 className='text-6xl md:text-7xl lg:text-7xl font-bold leading-tight'>
                  <span className='text-gradient'>智投简历</span>
                </h1>

                {/* 功能标签 - 竖向排列，与右侧文字框同步发光，淡化描边 */}
                <div className='hidden lg:flex flex-col gap-2.5'>
                  <div
                    id='feature-ai'
                    className='relative flex items-center gap-2 px-3 py-1.5 bg-blue-50/60 backdrop-blur-sm rounded-lg border border-blue-200/30 shadow-sm animate-glow-blue'
                  >
                    <span className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></span>
                    <span className='text-xs font-medium text-blue-700 whitespace-nowrap'>
                      🤖 AI分析简历
                    </span>
                  </div>
                  <div
                    id='feature-greeting'
                    className='relative flex items-center gap-2 px-3 py-1.5 bg-purple-50/60 backdrop-blur-sm rounded-lg border border-purple-200/30 shadow-sm animate-glow-purple'
                  >
                    <span className='w-2 h-2 bg-purple-500 rounded-full animate-pulse'></span>
                    <span className='text-xs font-medium text-purple-700 whitespace-nowrap'>
                      💬 AI生成招呼语
                    </span>
                  </div>
                  <div
                    id='feature-delivery'
                    className='relative flex items-center gap-2 px-3 py-1.5 bg-green-50/60 backdrop-blur-sm rounded-lg border border-green-200/30 shadow-sm animate-glow-green'
                  >
                    <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
                    <span className='text-xs font-medium text-green-700 whitespace-nowrap'>
                      🚀 AI智能投递
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 副标题 - 优化颜色层级 */}
            <p className='text-2xl md:text-3xl text-gray-700 mb-3 animate-fade-in-up animation-delay-200'>
              AI帮你自动投递简历
            </p>

            {/* 辅助说明 - 更新文案，增强行动感 */}
            <p className='text-lg text-gray-500 mb-8 animate-fade-in-up animation-delay-200'>
              让每一次投递都精准触达理想岗位
            </p>

            {/* CTA按钮组 - 上移，紧凑节奏 */}
            <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6 animate-fade-in-up animation-delay-300'>
              <Button
                as='a'
                href='/login'
                variant='primary'
                size='lg'
                className='group relative overflow-hidden transform hover:scale-105 active:scale-95 transition-all duration-200'
              >
                <span className='relative z-10'>立即体验</span>
                {/* 按钮光晕效果 */}
                <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>
              </Button>
              <Button
                as='a'
                href='/register'
                variant='secondary'
                size='lg'
                className='transform hover:scale-105 hover:bg-blue-50 hover:border-blue-200 active:scale-95 transition-all duration-200'
              >
                免费开始
              </Button>
            </div>

            {/* 社会证明 - 新增 */}
            <p className='text-sm text-gray-400 animate-fade-in-up animation-delay-400'>
              ✓ 预计帮助超 1 万+ 求职者智能投递简历
            </p>
          </div>

          {/* 右侧视觉区（40%）*/}
          <div
            className='lg:col-span-2 relative animate-fade-in-up animation-delay-600'
            style={{ zIndex: 10 }}
          >
            {/* 插图容器 */}
            <div className='relative mx-auto max-w-md lg:max-w-none'>
              {/* SVG插图 - 添加浮动动画 */}
              <img
                src='/images/chat-bot.svg'
                alt='AI智能求职助手'
                className='w-full h-auto drop-shadow-2xl animate-float'
              />

              {/* 功能标注1 - 右上（AI分析简历）+ 装饰性虚线 + 滑入动画 */}
              <div
                data-label='ai'
                className='absolute -top-8 -right-4 hidden lg:block animate-slide-in-top animation-delay-800'
              >
                <div className='bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-xl px-4 py-2 shadow-lg animate-glow-blue animate-bubble-float'>
                  <div className='flex items-center gap-2 whitespace-nowrap'>
                    <span className='text-xl'>🧠</span>
                    <span className='text-sm font-medium text-blue-700'>
                      AI分析简历
                    </span>
                  </div>
                </div>
                {/* 装饰性虚线：从文字框中心向下指向机器人 */}
                <div className='absolute left-1/2 -translate-x-1/2 top-full w-0.5 h-16 border-l-2 border-dashed border-blue-300/40'></div>
              </div>

              {/* 功能标注2 - 左中（AI生成招呼语）+ 装饰性虚线 + 滑入动画 */}
              <div
                data-label='greeting'
                className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden lg:block animate-slide-in-left animation-delay-1000'
              >
                <div className='bg-white/90 backdrop-blur-sm border border-purple-200/50 rounded-xl px-4 py-2 shadow-lg animate-glow-purple animate-bubble-float'>
                  <div className='flex items-center gap-2 whitespace-nowrap'>
                    <span className='text-xl'>💬</span>
                    <span className='text-sm font-medium text-purple-700'>
                      AI生成招呼语
                    </span>
                  </div>
                </div>
                {/* 装饰性虚线：从文字框右侧向右指向机器人 */}
                <div className='absolute left-full top-1/2 -translate-y-1/2 w-8 h-0.5 border-t-2 border-dashed border-purple-300/40'></div>
              </div>

              {/* 功能标注3 - 右下（AI智能投递）+ 装饰性虚线 + 滑入动画 */}
              <div
                data-label='delivery'
                className='absolute -bottom-8 -right-4 hidden lg:block animate-slide-in-bottom animation-delay-1200'
              >
                <div className='bg-white/90 backdrop-blur-sm border border-green-200/50 rounded-xl px-4 py-2 shadow-lg animate-glow-green animate-bubble-float'>
                  <div className='flex items-center gap-2 whitespace-nowrap'>
                    <span className='text-xl'>🚀</span>
                    <span className='text-sm font-medium text-green-700'>
                      AI智能投递
                    </span>
                  </div>
                </div>
                {/* 装饰性虚线：从文字框中心向上指向机器人 */}
                <div className='absolute left-1/2 -translate-x-1/2 bottom-full w-0.5 h-16 border-l-2 border-dashed border-green-300/40'></div>
              </div>

              {/* 移动端标注（横向排列）*/}
              <div className='lg:hidden mt-8 flex flex-wrap justify-center gap-3'>
                <div className='bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-lg px-3 py-2 shadow-md'>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-base'>🧠</span>
                    <span className='text-xs font-medium text-blue-700'>
                      AI分析简历
                    </span>
                  </div>
                </div>
                <div className='bg-white/90 backdrop-blur-sm border border-purple-200/50 rounded-lg px-3 py-2 shadow-md'>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-base'>💬</span>
                    <span className='text-xs font-medium text-purple-700'>
                      AI生成招呼语
                    </span>
                  </div>
                </div>
                <div className='bg-white/90 backdrop-blur-sm border border-green-200/50 rounded-lg px-3 py-2 shadow-md'>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-base'>🚀</span>
                    <span className='text-xs font-medium text-green-700'>
                      AI智能投递
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;
