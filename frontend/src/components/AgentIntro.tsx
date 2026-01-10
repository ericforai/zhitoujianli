/**
 * Agent概念介绍模块
 * 向用户科普什么是AI Agent，以及为什么这是一次有价值的体验
 */

import Container from './common/Container';

const AgentIntro = () => {
  return (
    <section className='py-20 bg-gradient-to-b from-white to-gray-50'>
      <Container size='lg'>
        {/* 标题 */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-purple-100 text-purple-700'>
            <span>🎓</span>
            <span className='text-sm font-medium'>了解前沿技术</span>
          </div>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            什么是 <span className='text-purple-600'>AI Agent</span>？
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            这不只是一个求职工具，更是你理解AI未来的一扇窗
          </p>
        </div>

        {/* 对比说明 */}
        <div className='grid md:grid-cols-2 gap-8 mb-16'>
          {/* 传统AI */}
          <div className='relative p-8 rounded-2xl bg-gray-100 border-2 border-gray-200'>
            <div className='absolute -top-4 left-6 px-4 py-1 bg-gray-500 text-white text-sm font-medium rounded-full'>
              传统AI工具
            </div>
            <div className='mt-4'>
              <div className='flex items-center gap-4 mb-6'>
                <div className='w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center'>
                  <span className='text-3xl'>🤖</span>
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-700'>被动响应</h3>
                  <p className='text-gray-500'>你问一句，它答一句</p>
                </div>
              </div>
              <ul className='space-y-3 text-gray-600'>
                <li className='flex items-start gap-2'>
                  <span className='text-gray-400 mt-1'>○</span>
                  <span>需要你不断下达指令</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-gray-400 mt-1'>○</span>
                  <span>只能完成单一任务</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-gray-400 mt-1'>○</span>
                  <span>无法记住上下文</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-gray-400 mt-1'>○</span>
                  <span>依赖你做决策</span>
                </li>
              </ul>
            </div>
          </div>

          {/* AI Agent */}
          <div className='relative p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 shadow-lg'>
            <div className='absolute -top-4 left-6 px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-full'>
              AI Agent（智能体）
            </div>
            <div className='mt-4'>
              <div className='flex items-center gap-4 mb-6'>
                <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg'>
                  <span className='text-3xl'>🧠</span>
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-900'>主动行动</h3>
                  <p className='text-purple-600'>自主思考，自主执行</p>
                </div>
              </div>
              <ul className='space-y-3 text-gray-700'>
                <li className='flex items-start gap-2'>
                  <span className='text-purple-500 mt-1'>●</span>
                  <span><strong>感知环境</strong>：分析职位信息、公司背景</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-purple-500 mt-1'>●</span>
                  <span><strong>自主决策</strong>：判断职位是否匹配</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-purple-500 mt-1'>●</span>
                  <span><strong>采取行动</strong>：自动发送投递、生成招呼语</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-purple-500 mt-1'>●</span>
                  <span><strong>持续学习</strong>：根据反馈优化策略</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 体验价值 */}
        <div className='bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white'>
          <div className='grid md:grid-cols-2 gap-8 items-center'>
            <div>
              <h3 className='text-2xl md:text-3xl font-bold mb-4'>
                为什么值得体验？
              </h3>
              <p className='text-gray-300 mb-6 leading-relaxed'>
                Agent技术正在重塑未来的工作方式。通过智投简历，你将：
              </p>
              <ul className='space-y-4'>
                <li className='flex items-start gap-3'>
                  <span className='w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0'>
                    <span className='text-blue-400'>1</span>
                  </span>
                  <span className='text-gray-200'>
                    <strong className='text-white'>亲手运行</strong>一个真正的AI Agent
                  </span>
                </li>
                <li className='flex items-start gap-3'>
                  <span className='w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0'>
                    <span className='text-purple-400'>2</span>
                  </span>
                  <span className='text-gray-200'>
                    <strong className='text-white'>理解</strong>Agent的工作原理（感知→思考→行动）
                  </span>
                </li>
                <li className='flex items-start gap-3'>
                  <span className='w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0'>
                    <span className='text-green-400'>3</span>
                  </span>
                  <span className='text-gray-200'>
                    <strong className='text-white'>获得</strong>可以写进简历的AI实践经验
                  </span>
                </li>
              </ul>
            </div>
            <div className='relative'>
              {/* Agent工作流程图 - 动态循环 */}
              <div className='bg-white/5 rounded-2xl p-6 border border-white/10 overflow-visible'>
                <div className='text-center mb-4'>
                  <span className='text-sm text-gray-400'>Agent 工作循环</span>
                </div>

                {/* 圆形循环管线 */}
                <div className='relative w-48 h-48 mx-auto my-8'>
                  {/* 背景圆环 */}
                  <svg className='absolute inset-0 w-full h-full' viewBox='0 0 200 200'>
                    <circle
                      cx='100'
                      cy='100'
                      r='70'
                      fill='none'
                      stroke='rgba(255,255,255,0.1)'
                      strokeWidth='4'
                    />
                    {/* 动态流动的渐变圆环 */}
                    <circle
                      cx='100'
                      cy='100'
                      r='70'
                      fill='none'
                      stroke='url(#flowGradient)'
                      strokeWidth='4'
                      strokeLinecap='round'
                      strokeDasharray='60 380'
                      className='animate-spin'
                      style={{ animationDuration: '4s', transformOrigin: 'center' }}
                    />
                    {/* 第二个流动点 */}
                    <circle
                      cx='100'
                      cy='100'
                      r='70'
                      fill='none'
                      stroke='url(#flowGradient2)'
                      strokeWidth='3'
                      strokeLinecap='round'
                      strokeDasharray='30 410'
                      className='animate-spin'
                      style={{ animationDuration: '4s', animationDelay: '2s', transformOrigin: 'center' }}
                    />
                    {/* 渐变定义 */}
                    <defs>
                      <linearGradient id='flowGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                        <stop offset='0%' stopColor='#3B82F6' stopOpacity='0' />
                        <stop offset='50%' stopColor='#8B5CF6' stopOpacity='1' />
                        <stop offset='100%' stopColor='#10B981' stopOpacity='0' />
                      </linearGradient>
                      <linearGradient id='flowGradient2' x1='0%' y1='0%' x2='100%' y2='0%'>
                        <stop offset='0%' stopColor='#10B981' stopOpacity='0' />
                        <stop offset='50%' stopColor='#3B82F6' stopOpacity='0.8' />
                        <stop offset='100%' stopColor='#8B5CF6' stopOpacity='0' />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* 三个节点 - 感知 (顶部) */}
                  <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                    <div className='relative group'>
                      <div className='absolute inset-0 bg-blue-500 rounded-full blur-sm opacity-40 group-hover:opacity-60 transition-opacity'></div>
                      <div className='relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border border-blue-400 flex items-center justify-center shadow-md'>
                        <span className='text-base'>👁️</span>
                      </div>
                      <div className='absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap'>
                        <span className='text-xs font-medium text-blue-300'>感知</span>
                      </div>
                    </div>
                  </div>

                  {/* 思考 (右下) */}
                  <div className='absolute bottom-2 right-2'>
                    <div className='relative group'>
                      <div className='absolute inset-0 bg-purple-500 rounded-full blur-sm opacity-40 group-hover:opacity-60 transition-opacity'></div>
                      <div className='relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 border border-purple-400 flex items-center justify-center shadow-md'>
                        <span className='text-base'>🧠</span>
                      </div>
                      <div className='absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap'>
                        <span className='text-xs font-medium text-purple-300'>思考</span>
                      </div>
                    </div>
                  </div>

                  {/* 行动 (左下) */}
                  <div className='absolute bottom-2 left-2'>
                    <div className='relative group'>
                      <div className='absolute inset-0 bg-green-500 rounded-full blur-sm opacity-40 group-hover:opacity-60 transition-opacity'></div>
                      <div className='relative w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 border border-green-400 flex items-center justify-center shadow-md'>
                        <span className='text-base'>🚀</span>
                      </div>
                      <div className='absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap'>
                        <span className='text-xs font-medium text-green-300'>行动</span>
                      </div>
                    </div>
                  </div>

                  {/* 中心文字 */}
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='text-center'>
                      <div className='text-lg mb-0.5'>🤖</div>
                      <div className='text-xs text-gray-500'>循环</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* 装饰性元素 */}
              <div className='absolute -top-4 -right-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl'></div>
              <div className='absolute -bottom-4 -left-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl'></div>
            </div>
          </div>
        </div>

        {/* 底部引导 */}
        <div className='text-center mt-12'>
          <p className='text-gray-500 mb-4'>
            准备好开始你的Agent之旅了吗？
          </p>
          <a
            href='/register'
            className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105'
          >
            <span>🚀</span>
            <span>开始体验</span>
          </a>
        </div>
      </Container>
    </section>
  );
};

export default AgentIntro;
