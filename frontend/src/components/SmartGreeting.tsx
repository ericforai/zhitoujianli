import React, { useRef, useState } from 'react';
import { aiResumeService, type ResumeParseResult } from '../services/aiService';

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
    } catch (error) {
      console.error('文件解析失败:', error);
      alert('文件解析失败，请重试');
    }
  };

  const generateGreeting = async () => {
    if (!resumeData || !jdText.trim()) {
      alert('请先上传简历并输入JD内容');
      return;
    }

    setIsAnalyzing(true);

    try {
      // 模拟AI生成打招呼语
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 生成示例打招呼语
      const greeting = `您好！我看到贵公司正在招聘${jdText.split(' ')[0]}相关职位。基于我的${resumeData.years_experience}年${resumeData.current_title}经验，特别是在${resumeData.skills.slice(0, 2).join('、')}方面的专业能力，我相信能够为团队带来价值。希望能有机会进一步沟通，谢谢！`;

      setGeneratedGreeting(greeting);
    } catch (error) {
      console.error('生成打招呼语失败:', error);
      alert('生成失败，请重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedGreeting);
    alert('已复制到剪贴板');
  };

  return (
    <section
      id='smart-greeting'
      className='py-20 bg-gradient-to-br from-blue-50 to-white'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16'>
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
            <div className='bg-gray-50 rounded-xl p-6 border-2 border-gray-200'>
              <div className='flex items-center mb-4'>
                <span className='text-2xl mr-3'>❌</span>
                <h4 className='text-lg font-bold text-gray-700'>传统方式</h4>
              </div>
              <ul className='space-y-3 text-gray-600'>
                <li className='flex items-start'>
                  <span className='mr-2'>•</span>
                  <span>手动编写每个打招呼语，平均耗时15-30分钟</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2'>•</span>
                  <span>容易陷入模板化表达，缺乏个性化</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2'>•</span>
                  <span>难以精准匹配JD关键词，错过核心亮点</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2'>•</span>
                  <span>HR回复率低，投递效果不理想</span>
                </li>
              </ul>
              <div className='mt-4 text-sm text-gray-500 text-center'>
                平均回复率：<span className='font-bold text-red-600'>12%</span>
              </div>
            </div>

            {/* AI智能方式 */}
            <div className='bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200 relative overflow-hidden'>
              <div className='absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-xs font-bold rounded-bl-lg'>
                推荐
              </div>
              <div className='flex items-center mb-4'>
                <span className='text-2xl mr-3'>✅</span>
                <h4 className='text-lg font-bold text-gray-900'>AI智能生成</h4>
              </div>
              <ul className='space-y-3 text-gray-700'>
                <li className='flex items-start'>
                  <span className='mr-2 text-green-600'>✓</span>
                  <span>秒级生成专业打招呼语，节省90%时间</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 text-green-600'>✓</span>
                  <span>AI分析简历亮点，精准匹配JD要求</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 text-green-600'>✓</span>
                  <span>突出核心优势，避免模板化表达</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 text-green-600'>✓</span>
                  <span>显著提升HR兴趣，回复率大幅上升</span>
                </li>
              </ul>
              <div className='mt-4 text-sm text-gray-700 text-center'>
                平均回复率：
                <span className='font-bold text-green-600'>68%</span>{' '}
                <span className='text-blue-600 font-semibold'>↑ 提升4.7倍</span>
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
                className='w-full h-40 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
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
              className='w-full bg-gradient-primary text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isAnalyzing ? 'AI分析中...' : '生成个性化打招呼语'}
            </button>
          </div>

          {/* 右侧：结果展示 */}
          <div className='space-y-6'>
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
            <div className='bg-blue-50 p-6 rounded-lg'>
              <h3 className='text-lg font-semibold text-blue-900 mb-3'>
                💡 使用建议
              </h3>
              <ul className='text-sm text-blue-800 space-y-2'>
                <li>• 确保简历信息完整准确，AI分析更精准</li>
                <li>• JD内容越详细，生成的打招呼语越个性化</li>
                <li>• 可根据不同公司调整打招呼语风格</li>
                <li>• 建议结合具体岗位要求微调内容</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartGreeting;
