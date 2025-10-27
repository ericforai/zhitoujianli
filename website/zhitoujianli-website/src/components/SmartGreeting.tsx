import React, { useRef, useState } from 'react';
import {
  analyzeResumeAndJD,
  parseResumeFile,
  type AnalysisResult,
  type GreetingSettings,
  type ResumeData,
} from '../services/aiService';

const SmartGreeting = () => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [jdText, setJdText] = useState('');
  const [greetingSettings, setGreetingSettings] = useState<GreetingSettings>({
    type: 'professional',
    maxLength: 200,
  });
  const [generatedGreeting, setGeneratedGreeting] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsedData = await parseResumeFile(file);
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
      const { analysis, greeting } = await analyzeResumeAndJD(resumeData, jdText, greetingSettings);

      setAnalysisResult(analysis);
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
    <section id='smart-greeting' className='py-28 bg-gray-50'>
      <div className='max-w-5xl mx-auto px-6 sm:px-8 lg:px-12'>
        <div className='text-center mb-16'>
          <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-chinese'>
            智能化打招呼语
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            基于您的简历和JD，生成个性化、高匹配度的打招呼语，提升投递成功率
          </p>
        </div>

        {/* 横向流程图 - 全宽布局 */}
        <div className='bg-white p-6 rounded-lg shadow-sm mb-8'>
          <h3 className='text-lg font-semibold mb-6 text-center'>操作流程</h3>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* 步骤1：上传简历 */}
            <div className='relative'>
              <div className='text-center p-6 bg-blue-50 rounded-xl border-2 border-blue-200'>
                <div className='flex justify-center mb-4'>
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
                      d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                    />
                  </svg>
                </div>
                <div className='text-3xl font-bold text-blue-300 mb-3'>01</div>
                <h4 className='text-lg font-semibold text-gray-900 mb-2'>上传简历</h4>
                <p className='text-sm text-gray-600'>支持PDF、Word格式</p>
              </div>

              {/* 箭头 */}
              <div className='hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2'>
                <svg
                  className='w-6 h-6 text-gray-400'
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

            {/* 步骤2：输入JD */}
            <div className='relative'>
              <div className='text-center p-6 bg-green-50 rounded-xl border-2 border-green-200'>
                <div className='flex justify-center mb-4'>
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
                <div className='text-3xl font-bold text-green-300 mb-3'>02</div>
                <h4 className='text-lg font-semibold text-gray-900 mb-2'>输入岗位JD</h4>
                <p className='text-sm text-gray-600'>AI智能分析匹配度</p>
              </div>

              {/* 箭头 */}
              <div className='hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2'>
                <svg
                  className='w-6 h-6 text-gray-400'
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

            {/* 步骤3：智能打招呼 - 重点突出 */}
            <div className='relative'>
              <div className='text-center p-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-300 shadow-lg transform scale-105'>
                <div className='flex justify-center mb-4'>
                  <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-white'
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
                <div className='text-4xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent mb-3'>
                  03
                </div>
                <h4 className='text-xl font-bold text-gray-900 mb-2'>智能打招呼</h4>
                <p className='text-sm text-gray-700 font-medium'>AI生成个性化开场白</p>
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* 左侧：功能区域 */}
          <div className='space-y-4'>
            {/* 简历上传区域 */}
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
                <p className='text-sm text-gray-500 mt-2'>支持 PDF、Word 格式</p>
                {resumeData && (
                  <div className='mt-4 p-3 bg-green-50 rounded-lg'>
                    <p className='text-green-800 text-sm'>✅ 简历解析成功：{resumeData.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* JD输入区域 */}
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
                  <label className='block text-sm font-medium text-gray-700 mb-2'>风格类型</label>
                  <div className='space-y-2'>
                    {[
                      { value: 'professional', label: '专业型', desc: '突出专业能力和岗位匹配度' },
                      { value: 'sincere', label: '真诚型', desc: '语气亲和，表达对公司价值的认同' },
                      { value: 'concise', label: '简短有力型', desc: '一句话直击核心优势' },
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

            {/* 使用建议 - 移到左侧 */}
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg'>
              <h3 className='text-lg font-semibold text-blue-900 mb-4 flex items-center'>
                <svg
                  className='w-5 h-5 text-blue-600 mr-2'
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
                <li>• 确保简历信息完整准确，AI分析更精准</li>
                <li>• JD内容越详细，生成的打招呼语越个性化</li>
                <li>• 可根据不同公司调整打招呼语风格</li>
                <li>• 建议结合具体岗位要求微调内容</li>
              </ul>
            </div>
          </div>

          {/* 右侧：结果展示 */}
          <div className='space-y-4'>
            {/* 匹配度分析 */}
            {analysisResult && (
              <div className='bg-white p-6 rounded-lg shadow-sm'>
                <h3 className='text-lg font-semibold mb-4'>匹配度分析</h3>
                <div className='mb-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium'>匹配度</span>
                    <span className='text-lg font-bold text-green-600'>
                      {analysisResult.matchScore}%
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-green-500 h-2 rounded-full'
                      style={{ width: `${analysisResult.matchScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className='space-y-3'>
                  <div>
                    <h4 className='font-medium text-green-800 mb-2'>匹配优势</h4>
                    <ul className='text-sm space-y-1'>
                      {analysisResult.matchPoints.map((point: string, index: number) => (
                        <li key={index} className='flex items-start'>
                          <span className='text-green-500 mr-2'>✓</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className='font-medium text-orange-800 mb-2'>需要关注</h4>
                    <ul className='text-sm space-y-1'>
                      {analysisResult.gaps.map((gap: string, index: number) => (
                        <li key={index} className='flex items-start'>
                          <span className='text-orange-500 mr-2'>!</span>
                          {gap}
                        </li>
                      ))}
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
                  <textarea
                    value={generatedGreeting}
                    readOnly
                    className='w-full h-52 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 resize-none focus:outline-none text-gray-800 leading-relaxed'
                  />
                </div>
                <div className='mt-3 text-xs text-gray-500'>
                  字数：{generatedGreeting.length} / {greetingSettings.maxLength}
                </div>
              </div>
            )}

            {/* 示例打招呼语展示 */}
            <div className='bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg'>
              <h3 className='text-lg font-semibold text-purple-900 mb-4 flex items-center'>
                <svg
                  className='w-5 h-5 text-purple-600 mr-2'
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
                示例效果
              </h3>

              <div className='space-y-4'>
                <div className='bg-white p-4 rounded-lg shadow-sm'>
                  <div className='flex items-center mb-2'>
                    <span className='px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mr-2'>
                      专业型
                    </span>
                    <span className='text-sm text-gray-500'>前端开发工程师</span>
                  </div>
                  <textarea
                    readOnly
                    value='您好！我是一名具有3年React开发经验的前端工程师，看到贵公司正在招聘前端开发岗位。我在电商平台开发方面有丰富经验，熟悉Vue.js和Node.js技术栈，相信能为团队带来价值。期待与您进一步沟通！'
                    className='w-full h-32 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 resize-none focus:outline-none text-sm text-gray-700 leading-relaxed'
                  />
                </div>

                <div className='bg-white p-4 rounded-lg shadow-sm'>
                  <div className='flex items-center mb-2'>
                    <span className='px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mr-2'>
                      真诚型
                    </span>
                    <span className='text-sm text-gray-500'>产品经理</span>
                  </div>
                  <textarea
                    readOnly
                    value="您好！我对贵公司的产品理念非常认同，特别是'让求职更智能'的愿景深深打动了我。作为一名有5年产品经验的产品经理，我希望能够加入团队，共同打造更优秀的求职产品。期待有机会与您交流！"
                    className='w-full h-32 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 resize-none focus:outline-none text-sm text-gray-700 leading-relaxed'
                  />
                </div>

                <div className='bg-white p-4 rounded-lg shadow-sm'>
                  <div className='flex items-center mb-2'>
                    <span className='px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mr-2'>
                      简短有力型
                    </span>
                    <span className='text-sm text-gray-500'>数据分析师</span>
                  </div>
                  <textarea
                    readOnly
                    value='您好！我是一名数据分析师，擅长Python和SQL，有丰富的用户行为分析经验，期待为贵公司的数据驱动决策贡献力量！'
                    className='w-full h-32 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 resize-none focus:outline-none text-sm text-gray-700 leading-relaxed'
                  />
                </div>

                <div className='bg-white p-4 rounded-lg shadow-sm'>
                  <div className='flex items-center mb-2'>
                    <span className='px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full mr-2'>
                      创新型
                    </span>
                    <span className='text-sm text-gray-500'>UI/UX设计师</span>
                  </div>
                  <textarea
                    readOnly
                    value='您好！我是一名UI/UX设计师，专注于用户体验设计和界面创新。看到贵公司正在招聘设计岗位，我对您的产品设计理念很感兴趣。我有丰富的移动端和Web端设计经验，希望能为团队带来创新的设计思维。期待与您深入交流！'
                    className='w-full h-32 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 resize-none focus:outline-none text-sm text-gray-700 leading-relaxed'
                  />
                </div>
              </div>

              <div className='mt-4 p-3 bg-indigo-50 rounded-lg'>
                <p className='text-xs text-indigo-700 text-center'>
                  💡 以上仅为示例，AI会根据您的简历和JD生成专属的个性化打招呼语
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 注册引导CTA - 全宽底部展示 */}
        <div className='mt-12 p-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl'>
          <h3 className='text-2xl font-semibold text-gray-900 mb-3 text-center'>
            想要生成更多个性化打招呼语？
          </h3>
          <p className='text-lg text-gray-600 text-center mb-6'>
            注册账号，保存您的打招呼语模板，支持批量生成和个性化定制
          </p>
          <div className='flex justify-center gap-6'>
            <button className='px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-medium'>
              立即注册体验
            </button>
            <button className='px-10 py-4 border-2 border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200 text-lg font-medium shadow-md hover:shadow-lg'>
              了解更多功能
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartGreeting;
