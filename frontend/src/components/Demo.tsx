import React from 'react';

const Demo = () => {
  const steps = [
    {
      number: '01',
      title: '上传简历',
      description: '支持PDF、Word等多种格式',
      colorTheme: {
        icon: 'text-blue-500',
        number: 'text-blue-200',
        title: 'text-blue-600',
        bg: 'bg-blue-50',
        hoverBorder: 'hover:border-blue-200',
      },
      icon: (
        <svg
          className='w-8 h-8 text-blue-500'
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
      title: '匹配JD',
      description: 'AI智能分析岗位匹配度',
      colorTheme: {
        icon: 'text-emerald-500',
        number: 'text-emerald-200',
        title: 'text-emerald-600',
        bg: 'bg-emerald-50',
        hoverBorder: 'hover:border-emerald-200',
      },
      icon: (
        <svg
          className='w-8 h-8 text-emerald-500'
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
      ),
    },
    {
      number: '03',
      title: '智能打招呼',
      description: '生成个性化开场白',
      colorTheme: {
        icon: 'text-purple-500',
        number: 'text-purple-200',
        title: 'text-purple-600',
        bg: 'bg-purple-50',
        hoverBorder: 'hover:border-purple-200',
      },
      icon: (
        <svg
          className='w-8 h-8 text-purple-500'
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
  ];

  return (
    <section id='demo' className='py-28 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-20'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-chinese'>
            只需三步，轻松开启智能求职
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            上传简历 → 匹配JD → 智能打招呼
          </p>
        </div>

        <div className='flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6'>
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className='w-full md:w-auto flex-1 max-w-sm'>
                <div
                  className={`text-center p-8 ${step.colorTheme.bg} rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-2 border-transparent ${step.colorTheme.hoverBorder}`}
                >
                  <div className='flex justify-center mb-6'>{step.icon}</div>
                  <div
                    className={`text-4xl font-bold ${step.colorTheme.number} mb-4`}
                  >
                    {step.number}
                  </div>
                  <h3
                    className={`text-xl font-semibold ${step.colorTheme.title} mb-4 font-chinese`}
                  >
                    {step.title}
                  </h3>
                  <p className='text-gray-600'>{step.description}</p>
                </div>
              </div>

              {/* Arrow */}
              {index < steps.length - 1 && (
                <div className='hidden md:flex items-center justify-center flex-shrink-0'>
                  <span className='text-3xl text-gray-400 inline-block animate-flow-right'>
                    ⇢
                  </span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Demo;
