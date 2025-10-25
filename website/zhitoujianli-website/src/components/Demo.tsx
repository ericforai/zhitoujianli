import { useEffect, useState } from 'react';

const Demo = () => {
  // 当前步骤
  const [currentStep, setCurrentStep] = useState<number>(0);

  // 步骤1：上传简历
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  // 步骤2：匹配JD
  const [matchingState, setMatchingState] = useState<'idle' | 'scanning' | 'analyzing' | 'success'>(
    'idle'
  );
  const [matchScore, setMatchScore] = useState(0);

  // 步骤3：生成打招呼
  const [greetingState, setGreetingState] = useState<'idle' | 'generating' | 'typing' | 'success'>(
    'idle'
  );
  const [displayedText, setDisplayedText] = useState('');

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 步骤1：上传简历动画
  const animateUpload = async () => {
    setCurrentStep(0);
    setUploadState('uploading');
    setUploadProgress(0);

    // 文档飘落（0.5秒）
    await delay(500);

    // 进度条填充（1.5秒）
    for (let i = 0; i <= 100; i += 5) {
      setUploadProgress(i);
      await delay(30);
    }

    // 成功提示
    setUploadState('success');
    await delay(500);
  };

  // 步骤2：匹配JD动画
  const animateMatching = async () => {
    setCurrentStep(1);
    setMatchingState('scanning');
    setMatchScore(0);

    // 扫描动画（2秒）
    await delay(2000);

    setMatchingState('analyzing');

    // 匹配度递增（1秒）
    for (let i = 0; i <= 85; i += 5) {
      setMatchScore(i);
      await delay(30);
    }

    setMatchingState('success');
    await delay(500);
  };

  // 步骤3：生成打招呼动画
  const animateGreeting = async () => {
    setCurrentStep(2);
    setGreetingState('generating');
    setDisplayedText('');

    // AI思考（1秒）
    await delay(1000);

    setGreetingState('typing');

    // 打字机效果（3秒）
    const text =
      '您好！我是一名前端工程师，看到贵公司的招聘信息非常感兴趣，我有3年React开发经验...';
    for (let i = 0; i <= text.length; i++) {
      setDisplayedText(text.slice(0, i));
      await delay(50);
    }

    setGreetingState('success');
    await delay(500);
  };

  // 完整演示流程
  const runFullDemo = async () => {
    while (true) {
      // 重置所有状态
      setUploadState('idle');
      setMatchingState('idle');
      setGreetingState('idle');

      // 步骤1：上传简历
      await animateUpload();
      await delay(500);

      // 步骤2：匹配JD
      await animateMatching();
      await delay(500);

      // 步骤3：生成打招呼
      await animateGreeting();

      // 等待2秒后重新开始
      await delay(2000);
    }
  };

  useEffect(() => {
    runFullDemo();
  }, []);

  return (
    <section id='demo' className='py-20 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-chinese'>
            只需三步，轻松开启智能求职
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>上传简历 → 匹配JD → 智能打招呼</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* 步骤1：上传简历 */}
          <div className='relative'>
            <div
              className={`text-center p-8 bg-white rounded-xl shadow-sm transition-all duration-500 min-h-[320px] flex flex-col justify-center ${
                currentStep === 0
                  ? 'shadow-2xl scale-105 ring-4 ring-primary-500 ring-opacity-50'
                  : 'hover:shadow-md'
              }`}
            >
              {/* 文档图标 - 飘落动画 */}
              <div className='flex justify-center mb-6'>
                <div
                  className={`transition-all duration-500 ${
                    uploadState === 'uploading' ? 'animate-bounce' : ''
                  } ${currentStep === 0 ? 'scale-110' : ''}`}
                >
                  <svg
                    className='w-12 h-12 text-primary-500'
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
                </div>
              </div>

              <div
                className={`text-4xl font-bold mb-4 transition-all duration-500 ${
                  currentStep === 0 ? 'text-primary-500 scale-110' : 'text-gray-300'
                }`}
              >
                01
              </div>

              <h3 className='text-xl font-semibold text-gray-900 mb-4 font-chinese'>上传简历</h3>

              {/* 动态内容区域 */}
              {uploadState === 'idle' && <p className='text-gray-600'>支持PDF、Word等多种格式</p>}

              {uploadState === 'uploading' && (
                <div className='space-y-3'>
                  <p className='text-primary-500 font-medium'>上传中...</p>
                  {/* 进度条 */}
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-primary-500 h-2 rounded-full transition-all duration-300'
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className='text-sm text-gray-500'>{uploadProgress}%</p>
                </div>
              )}

              {uploadState === 'success' && (
                <div className='text-green-500 font-medium animate-bounce'>✓ 简历已上传</div>
              )}
            </div>

            {/* 箭头 */}
            <div className='hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2'>
              <svg
                className={`w-8 h-8 transition-all duration-500 ${
                  currentStep === 0 ? 'text-primary-500 animate-pulse' : 'text-gray-400'
                }`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </div>
          </div>

          {/* 步骤2：匹配JD */}
          <div className='relative'>
            <div
              className={`text-center p-8 bg-white rounded-xl shadow-sm transition-all duration-500 min-h-[320px] flex flex-col justify-center ${
                currentStep === 1
                  ? 'shadow-2xl scale-105 ring-4 ring-secondary-500 ring-opacity-50'
                  : 'hover:shadow-md'
              }`}
            >
              {/* 闪电图标 */}
              <div className='flex justify-center mb-6'>
                <div
                  className={`transition-all duration-500 ${
                    matchingState === 'scanning' ? 'animate-spin' : ''
                  } ${currentStep === 1 ? 'scale-110' : ''}`}
                >
                  <svg
                    className='w-12 h-12 text-secondary-500'
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
              </div>

              <div
                className={`text-4xl font-bold mb-4 transition-all duration-500 ${
                  currentStep === 1 ? 'text-secondary-500 scale-110' : 'text-gray-300'
                }`}
              >
                02
              </div>

              <h3 className='text-xl font-semibold text-gray-900 mb-4 font-chinese'>匹配JD</h3>

              {/* 动态内容区域 */}
              {matchingState === 'idle' && <p className='text-gray-600'>AI智能分析岗位匹配度</p>}

              {matchingState === 'scanning' && (
                <div className='space-y-3'>
                  <p className='text-secondary-500 font-medium'>🔍 AI分析中...</p>
                  {/* 扫描线动画 */}
                  <div className='relative w-full h-1 bg-gray-200 rounded-full overflow-hidden'>
                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-secondary-500 to-transparent animate-scan' />
                  </div>
                </div>
              )}

              {(matchingState === 'analyzing' || matchingState === 'success') && (
                <div className='space-y-3'>
                  <div className='text-3xl font-bold text-secondary-500'>{matchScore}%</div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-secondary-500 h-2 rounded-full transition-all duration-300'
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                  {matchingState === 'success' && (
                    <p className='text-green-500 font-medium animate-bounce'>✓ 高度匹配</p>
                  )}
                </div>
              )}
            </div>

            {/* 箭头 */}
            <div className='hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2'>
              <svg
                className={`w-8 h-8 transition-all duration-500 ${
                  currentStep === 1 ? 'text-secondary-500 animate-pulse' : 'text-gray-400'
                }`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </div>
          </div>

          {/* 步骤3：智能打招呼 */}
          <div className='relative'>
            <div
              className={`text-center p-8 bg-white rounded-xl shadow-sm transition-all duration-500 min-h-[320px] flex flex-col justify-center ${
                currentStep === 2
                  ? 'shadow-2xl scale-105 ring-4 ring-accent-blue ring-opacity-50'
                  : 'hover:shadow-md'
              }`}
            >
              {/* 聊天图标 */}
              <div className='flex justify-center mb-6'>
                <div
                  className={`transition-all duration-500 ${
                    greetingState === 'generating' ? 'animate-pulse' : ''
                  } ${currentStep === 2 ? 'scale-110' : ''}`}
                >
                  <svg
                    className='w-12 h-12 text-accent-blue'
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
                </div>
              </div>

              <div
                className={`text-4xl font-bold mb-4 transition-all duration-500 ${
                  currentStep === 2 ? 'text-accent-blue scale-110' : 'text-gray-300'
                }`}
              >
                03
              </div>

              <h3 className='text-xl font-semibold text-gray-900 mb-4 font-chinese'>智能打招呼</h3>

              {/* 动态内容区域 */}
              {greetingState === 'idle' && <p className='text-gray-600'>生成个性化开场白</p>}

              {greetingState === 'generating' && (
                <div className='space-y-3'>
                  <p className='text-accent-blue font-medium'>🤖 AI生成中...</p>
                  <div className='flex justify-center space-x-1'>
                    <div className='w-2 h-2 bg-accent-blue rounded-full animate-bounce' />
                    <div className='w-2 h-2 bg-accent-blue rounded-full animate-bounce delay-100' />
                    <div className='w-2 h-2 bg-accent-blue rounded-full animate-bounce delay-200' />
                  </div>
                </div>
              )}

              {(greetingState === 'typing' || greetingState === 'success') && (
                <div className='space-y-3'>
                  <div className='bg-gray-50 p-4 rounded-lg text-left text-sm text-gray-700 min-h-[80px]'>
                    {displayedText}
                    {greetingState === 'typing' && (
                      <span className='inline-block w-0.5 h-4 bg-accent-blue ml-1 animate-blink' />
                    )}
                  </div>
                  {greetingState === 'success' && (
                    <p className='text-green-500 font-medium animate-bounce'>✓ 打招呼语已生成</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;
