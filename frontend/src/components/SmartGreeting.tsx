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
    <section id='smart-greeting' className='py-20 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-chinese'>
            智能化打招呼语
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            基于您的简历和JD，生成个性化、高匹配度的打招呼语，提升投递成功率
          </p>
        </div>

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
