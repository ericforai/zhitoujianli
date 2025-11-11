import React, { useRef, useState } from 'react';
import { aiResumeService, type ResumeParseResult } from '../services/aiService';
import { useErrorHandler } from '../hooks/useErrorHandler';

// 定义组件内部类型
interface GreetingSettings {
  type: 'professional' | 'sincere' | 'concise';
  maxLength: number;
}

const SmartGreeting = () => {
  const [resumeData, setResumeData] = useState<ResumeParseResult | null>(null);
  const [jdText, setJdText] = useState('');
  const [greetingSettings, setGreetingSettings] = useState<GreetingSettings>({
    type: 'professional',
    maxLength: 200,
  });
  const [generatedGreeting, setGeneratedGreeting] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ✅ 修复：使用统一的错误处理Hook替代alert
  const { error: errorState, handleError, clearError } = useErrorHandler();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // 读取文件内容
      const text = await file.text();
      const parsedData = await aiResumeService.parseResume(text);
      setResumeData(parsedData);
      clearError(); // 清除之前的错误
    } catch (error) {
      // ✅ 修复：使用统一的错误处理替代alert
      handleError(error);
    }
  };

  const generateGreeting = async () => {
    if (!resumeData || !jdText.trim()) {
      // ✅ 修复：使用统一的错误处理替代alert
      handleError('请先上传简历并输入JD内容');
      return;
    }

    setIsAnalyzing(true);

    try {
      // 模拟AI生成打招呼语
      await new Promise(resolve => setTimeout(resolve, 2000));

      // ✅ 修复：添加空值检查和默认值，防止运行时错误
      const jobKeyword = jdText.split(' ')[0] || '相关';
      const yearsExperience = resumeData.years_experience || 0;
      const currentTitle = resumeData.current_title || '相关';
      const skills = (resumeData.skills || []).slice(0, 2);
      const skillsText = skills.length > 0 ? skills.join('、') : '相关技能';

      // 生成示例打招呼语
      const greeting = `您好！我看到贵公司正在招聘${jobKeyword}相关职位。基于我的${yearsExperience}年${currentTitle}经验，特别是在${skillsText}方面的专业能力，我相信能够为团队带来价值。希望能有机会进一步沟通，谢谢！`;

      setGeneratedGreeting(greeting);
      clearError(); // 清除之前的错误
    } catch (error) {
      // ✅ 修复：使用统一的错误处理替代alert
      handleError(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedGreeting);
      // ✅ 修复：使用统一的错误处理替代alert
      handleError('已复制到剪贴板'); // 这里可以改为success消息，但useErrorHandler目前只支持error
      // 临时方案：使用setTimeout清除错误消息，显示成功提示
      setTimeout(() => {
        clearError();
      }, 2000);
    } catch (error) {
      handleError('复制失败，请手动复制');
    }
  };

  return (
    <section
      id='smart-greeting'
      className='py-28 bg-gradient-to-br from-blue-50 to-white'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* ✅ 修复：添加错误提示UI */}
        {errorState.hasError && errorState.error && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between'>
            <div className='flex items-center'>
              <svg
                className='w-5 h-5 text-red-600 mr-3'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <span className='text-red-800'>{errorState.error}</span>
            </div>
            <button
              onClick={clearError}
              className='text-red-600 hover:text-red-800'
              aria-label='关闭错误提示'
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        )}

        <div className='text-center mb-20'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-chinese'>
            智能化打招呼语
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            AI深度分析简历亮点，针对性生成打招呼语，让HR第一眼就对你感兴趣
          </p>
        </div>

        {/* 核心优势展示 */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
          <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto'>
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
            <h3 className='text-xl font-bold text-gray-900 mb-3 text-center'>
              个性化定制
            </h3>
            <p className='text-gray-600 text-center mb-4'>
              深度分析简历核心优势，精准匹配JD要求，生成独一无二的打招呼语
            </p>
            <div className='text-center'>
              <span className='inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold'>
                AI智能分析
              </span>
            </div>
          </div>

          <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto'>
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
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-3 text-center'>
              提升回复率
            </h3>
            <p className='text-gray-600 text-center mb-4'>
              突出匹配亮点，避免模板化表达，显著提升HR查看和回复概率
            </p>
            <div className='text-center'>
              <span className='inline-block bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold'>
                回复率提升68%
              </span>
            </div>
          </div>

          <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
            <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto'>
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
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-3 text-center'>
              秒级生成
            </h3>
            <p className='text-gray-600 text-center mb-4'>
              告别手动编写，AI秒级生成专业打招呼语，节省90%的时间
            </p>
            <div className='text-center'>
              <span className='inline-block bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold'>
                平均2.8秒完成
              </span>
            </div>
          </div>
        </div>

        {/* 对比数据展示 */}
        <div className='bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16'>
          <h3 className='text-2xl font-bold text-gray-900 text-center mb-8'>
            为什么选择AI打招呼语？
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* 传统方式 */}
            <div className='bg-gray-50 rounded-xl p-8 border-2 border-gray-200 flex flex-col min-h-[400px]'>
              <div className='flex items-center mb-6'>
                <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-xl'>❌</span>
                </div>
                <h4 className='text-xl font-bold text-gray-700'>传统方式</h4>
              </div>
              <ul className='space-y-4 text-gray-600 flex-grow'>
                <li className='flex items-start'>
                  <span className='mr-3 text-red-500 font-bold text-lg'>•</span>
                  <span className='text-base leading-relaxed'>
                    手动编写每个打招呼语，平均耗时15-30分钟，效率低下
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-red-500 font-bold text-lg'>•</span>
                  <span className='text-base leading-relaxed'>
                    容易陷入模板化表达，缺乏个性化，难以脱颖而出
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-red-500 font-bold text-lg'>•</span>
                  <span className='text-base leading-relaxed'>
                    难以精准匹配JD关键词，错过核心亮点，匹配度低
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-red-500 font-bold text-lg'>•</span>
                  <span className='text-base leading-relaxed'>
                    HR回复率低，投递效果不理想，浪费大量时间
                  </span>
                </li>
              </ul>
              <div className='mt-6 pt-4 border-t border-gray-300'>
                <div className='text-center'>
                  <div className='text-xs text-gray-500 mb-1'>平均回复率</div>
                  <div className='text-2xl font-bold text-red-600'>12%</div>
                </div>
              </div>
            </div>

            {/* AI智能方式 */}
            <div className='bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-blue-200 relative overflow-hidden flex flex-col min-h-[400px]'>
              <div className='absolute top-0 right-0 bg-blue-600 text-white px-4 py-1.5 text-xs font-bold rounded-bl-lg shadow-md'>
                推荐
              </div>
              <div className='flex items-center mb-6'>
                <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-xl'>✅</span>
                </div>
                <h4 className='text-xl font-bold text-gray-900'>AI智能生成</h4>
              </div>
              <ul className='space-y-4 text-gray-700 flex-grow'>
                <li className='flex items-start'>
                  <span className='mr-3 text-green-600 font-bold text-lg'>
                    ✓
                  </span>
                  <span className='text-base leading-relaxed'>
                    秒级生成专业打招呼语，节省90%时间，效率极高
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-green-600 font-bold text-lg'>
                    ✓
                  </span>
                  <span className='text-base leading-relaxed'>
                    AI分析简历亮点，精准匹配JD要求，个性化强
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-green-600 font-bold text-lg'>
                    ✓
                  </span>
                  <span className='text-base leading-relaxed'>
                    突出核心优势，避免模板化表达，吸引HR注意
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-green-600 font-bold text-lg'>
                    ✓
                  </span>
                  <span className='text-base leading-relaxed'>
                    显著提升HR兴趣，回复率大幅上升，效果显著
                  </span>
                </li>
              </ul>
              <div className='mt-6 pt-4 border-t border-blue-300'>
                <div className='text-center'>
                  <div className='text-xs text-gray-600 mb-1'>平均回复率</div>
                  <div className='text-2xl font-bold text-green-600 mb-1'>
                    68%
                  </div>
                  <div className='text-sm text-blue-600 font-semibold'>
                    ↑ 提升4.7倍
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 原有的功能演示区域 */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* 左侧：输入区域 */}
          <div className='space-y-6'>
            {/* 简历上传 */}
            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <h3 className='text-lg font-semibold mb-4'>1. 上传简历</h3>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.pdf,.doc,.docx'
                  onChange={handleFileUpload}
                  className='hidden'
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className='bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors'
                >
                  选择简历文件
                </button>
                <p className='text-sm text-gray-500 mt-2'>
                  支持 PDF、Word 格式
                </p>
                {resumeData && (
                  <div className='mt-4 p-3 bg-green-50 rounded-lg'>
                    <p className='text-green-800 text-sm'>
                      ✅ 简历解析成功：{resumeData.name} -{' '}
                      {resumeData.current_title}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* JD输入 */}
            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <h3 className='text-lg font-semibold mb-4'>2. 输入岗位JD</h3>
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                placeholder='请粘贴目标岗位的职位描述...'
                className='w-full h-32 max-h-48 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent overflow-y-auto'
              />
            </div>

            {/* 设置选项 */}
            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <h3 className='text-lg font-semibold mb-4'>3. 打招呼语风格</h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    风格类型
                  </label>
                  <div className='space-y-2'>
                    {[
                      {
                        value: 'professional',
                        label: '专业型',
                        desc: '突出专业能力和岗位匹配度',
                      },
                      {
                        value: 'sincere',
                        label: '真诚型',
                        desc: '语气亲和，表达对公司价值的认同',
                      },
                      {
                        value: 'concise',
                        label: '简短有力型',
                        desc: '一句话直击核心优势',
                      },
                    ].map(option => (
                      <label key={option.value} className='flex items-center'>
                        <input
                          type='radio'
                          name='greetingType'
                          value={option.value}
                          checked={greetingSettings.type === option.value}
                          onChange={e =>
                            setGreetingSettings({
                              ...greetingSettings,
                              type: e.target.value as any,
                            })
                          }
                          className='mr-3'
                        />
                        <div>
                          <span className='font-medium'>{option.label}</span>
                          <p className='text-sm text-gray-500'>{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 生成按钮 */}
            <button
              onClick={generateGreeting}
              disabled={isAnalyzing || !resumeData || !jdText.trim()}
              className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isAnalyzing ? 'AI分析中...' : '生成个性化打招呼语'}
            </button>
          </div>

          {/* 右侧：结果展示 */}
          <div className='space-y-6 flex flex-col min-h-[600px]'>
            {/* 匹配度分析 */}
            {generatedGreeting && (
              <div className='bg-white p-6 rounded-lg shadow-sm'>
                <h3 className='text-lg font-semibold mb-4'>匹配度分析</h3>
                <div className='mb-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium'>匹配度</span>
                    <span className='text-lg font-bold text-green-600'>
                      85%
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-green-500 h-2 rounded-full'
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                </div>

                <div className='space-y-3'>
                  <div>
                    <h4 className='font-medium text-green-800 mb-2'>
                      匹配优势
                    </h4>
                    <ul className='text-sm space-y-1'>
                      <li className='flex items-start'>
                        <span className='text-green-500 mr-2'>✓</span>
                        技能匹配度高
                      </li>
                      <li className='flex items-start'>
                        <span className='text-green-500 mr-2'>✓</span>
                        经验符合要求
                      </li>
                      <li className='flex items-start'>
                        <span className='text-green-500 mr-2'>✓</span>
                        教育背景匹配
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className='font-medium text-orange-800 mb-2'>
                      需要关注
                    </h4>
                    <ul className='text-sm space-y-1'>
                      <li className='flex items-start'>
                        <span className='text-orange-500 mr-2'>!</span>
                        需要更多行业经验
                      </li>
                      <li className='flex items-start'>
                        <span className='text-orange-500 mr-2'>!</span>
                        部分技能需要提升
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 生成的打招呼语 */}
            {generatedGreeting && (
              <div className='bg-white p-6 rounded-lg shadow-sm'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold'>个性化打招呼语</h3>
                  <button
                    onClick={copyToClipboard}
                    className='text-indigo-600 hover:text-indigo-800 text-sm font-medium'
                  >
                    复制
                  </button>
                </div>
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <p className='text-gray-800 leading-relaxed'>
                    {generatedGreeting}
                  </p>
                </div>
                <div className='mt-3 text-xs text-gray-500'>
                  字数：{generatedGreeting.length} /{' '}
                  {greetingSettings.maxLength}
                </div>
              </div>
            )}

            {/* 使用提示 */}
            <div className='bg-blue-50 p-5 rounded-lg border border-blue-100'>
              <h3 className='text-lg font-semibold text-blue-900 mb-3 flex items-center'>
                <svg
                  className='w-5 h-5 mr-2 text-blue-600'
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
                使用建议
              </h3>
              <ul className='text-sm text-blue-800 space-y-2'>
                <li className='flex items-start'>
                  <span className='mr-2 text-blue-600 font-bold'>•</span>
                  <span>简历信息越完整，AI分析越精准</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 text-blue-600 font-bold'>•</span>
                  <span>JD内容越详细，打招呼语越个性化</span>
                </li>
              </ul>
            </div>

            {/* 成功案例 */}
            <div className='bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-lg border border-green-100'>
              <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center'>
                <svg
                  className='w-5 h-5 mr-2 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
                  />
                </svg>
                成功案例
              </h3>
              <div className='space-y-2'>
                <div className='bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-sm font-semibold text-gray-900'>
                      互联网大厂
                    </span>
                    <span className='text-sm text-green-600 font-bold'>
                      回复率 85%
                    </span>
                  </div>
                  <p className='text-xs text-gray-600'>
                    专业型 · 突出技术能力和项目经验
                  </p>
                </div>
                <div className='bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-sm font-semibold text-gray-900'>
                      创业公司
                    </span>
                    <span className='text-sm text-green-600 font-bold'>
                      回复率 78%
                    </span>
                  </div>
                  <p className='text-xs text-gray-600'>
                    真诚型 · 表达对公司价值观的认同
                  </p>
                </div>
                <div className='bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-sm font-semibold text-gray-900'>
                      外企
                    </span>
                    <span className='text-sm text-green-600 font-bold'>
                      回复率 72%
                    </span>
                  </div>
                  <p className='text-xs text-gray-600'>
                    简短有力型 · 一句话直击核心优势
                  </p>
                </div>
              </div>
            </div>

            {/* AI优势说明 - 新增模块 */}
            <div className='bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-lg border border-purple-100 flex-grow'>
              <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center'>
                <svg
                  className='w-5 h-5 mr-2 text-purple-600'
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
                AI打招呼语优势
              </h3>
              <div className='grid grid-cols-1 gap-3'>
                <div className='bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all'>
                  <div className='flex items-start'>
                    <div className='w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center mr-2 flex-shrink-0'>
                      <svg
                        className='w-4 h-4 text-blue-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900 text-sm mb-0.5'>
                        高效便捷
                      </h4>
                      <p className='text-xs text-gray-600'>
                        秒级生成，节省90%时间
                      </p>
                    </div>
                  </div>
                </div>
                <div className='bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all'>
                  <div className='flex items-start'>
                    <div className='w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center mr-2 flex-shrink-0'>
                      <svg
                        className='w-4 h-4 text-purple-600'
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
                    <div>
                      <h4 className='font-semibold text-gray-900 text-sm mb-0.5'>
                        个性定制
                      </h4>
                      <p className='text-xs text-gray-600'>
                        分析简历与JD，避免模板化
                      </p>
                    </div>
                  </div>
                </div>
                <div className='bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all'>
                  <div className='flex items-start'>
                    <div className='w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center mr-2 flex-shrink-0'>
                      <svg
                        className='w-4 h-4 text-green-600'
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
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900 text-sm mb-0.5'>
                        提升回复率
                      </h4>
                      <p className='text-xs text-gray-600'>回复率提升4.7倍</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部CTA - 引导注册 */}
        <div className='mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-lg text-white text-center'>
          <h3 className='text-2xl font-semibold mb-2'>
            让AI帮你写出完美打招呼语
          </h3>
          <p className='text-base opacity-90 mb-6'>
            注册后即可使用AI智能生成个性化打招呼语，提升HR回复率
          </p>
          <a
            href='/register'
            className='inline-block bg-white text-indigo-600 py-3 px-8 rounded-lg font-medium hover:bg-gray-100 transition-colors'
          >
            立即注册
          </a>
        </div>
      </div>
    </section>
  );
};

export default SmartGreeting;
