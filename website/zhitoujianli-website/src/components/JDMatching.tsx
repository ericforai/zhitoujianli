import { useRef, useState } from 'react';
import { sampleAnalysis, sampleJD, sampleResume } from '../data/sampleData';

interface MatchingResult {
  overallScore: number;
  overallLevel?: string;
  overallDescription?: string;
  skillMatch: {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
  };
  experienceMatch: {
    score: number;
    matchedExperience: string[];
    gaps: string[];
  };
  educationMatch: {
    score: number;
    matchedEducation: string[];
    suggestions: string[];
  };
  projectMatch: {
    score: number;
    matchedProjects: string[];
    recommendations: string[];
  };
}

const JDMatching = () => {
  const [isUsingExample, setIsUsingExample] = useState(true);
  const [resumeText, setResumeText] = useState(sampleResume);
  const [jdText, setJdText] = useState(sampleJD);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(sampleAnalysis);
  const resumeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const jdTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 清空示例内容
  const clearExample = () => {
    setResumeText('');
    setJdText('');
    setIsUsingExample(false);
    setMatchingResult(null);
  };

  // 处理输入框焦点
  const handleInputFocus = (field: 'resume' | 'jd') => {
    if (isUsingExample) {
      // 自动选中全部内容
      setTimeout(() => {
        if (field === 'resume' && resumeTextareaRef.current) {
          resumeTextareaRef.current.select();
        } else if (field === 'jd' && jdTextareaRef.current) {
          jdTextareaRef.current.select();
        }
      }, 0);
    }
  };

  // 处理输入框内容变更
  const handleInputChange = (field: 'resume' | 'jd', value: string) => {
    if (field === 'resume') {
      setResumeText(value);
    } else {
      setJdText(value);
    }
    setIsUsingExample(false);
    // 如果当前显示的是示例分析结果，清除它
    if (matchingResult === sampleAnalysis) {
      setMatchingResult(null);
    }
  };

  // 模拟分析结果
  const analyzeMatching = async () => {
    if (!resumeText.trim() || !jdText.trim()) {
      alert('请先输入简历内容和JD内容');
      return;
    }

    setIsAnalyzing(true);

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 模拟分析结果
    const result: MatchingResult = {
      overallScore: 82,
      skillMatch: {
        score: 85,
        matchedSkills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
        missingSkills: ['Vue.js', 'Docker', 'Kubernetes'],
      },
      experienceMatch: {
        score: 78,
        matchedExperience: ['3年前端开发经验', '电商项目经验', '团队协作经验'],
        gaps: ['大厂工作经验', '管理经验'],
      },
      educationMatch: {
        score: 90,
        matchedEducation: ['计算机相关专业', '本科学历'],
        suggestions: ['可以考虑相关认证证书'],
      },
      projectMatch: {
        score: 80,
        matchedProjects: ['电商平台开发', '移动端应用', '后台管理系统'],
        recommendations: ['增加开源项目贡献', '展示更多技术深度项目'],
      },
    };

    setMatchingResult(result);
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '高度匹配';
    if (score >= 60) return '基本匹配';
    return '需要提升';
  };

  return (
    <section id='jd-matching' className='py-20 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-chinese'>
            JD智能匹配度分析
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            精准解析简历与JD的契合度，提供详细的匹配分析和优化建议
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* 左侧：输入区域 */}
          <div className='space-y-4'>
            {/* 简历输入 */}
            <div className='bg-gray-50 p-6 rounded-lg'>
              <h3 className='text-lg font-semibold mb-4'>1. 输入简历内容</h3>
              {isUsingExample && (
                <div className='mb-2 flex items-center justify-between'>
                  <span className='text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full'>
                    📝 示例内容 - 点击可直接编辑
                  </span>
                  <button
                    onClick={clearExample}
                    className='text-sm text-gray-500 hover:text-gray-700 transition-colors'
                  >
                    清空内容
                  </button>
                </div>
              )}
              <textarea
                ref={resumeTextareaRef}
                value={resumeText}
                onChange={e => handleInputChange('resume', e.target.value)}
                onFocus={() => handleInputFocus('resume')}
                placeholder='请粘贴您的简历内容，包括个人信息、工作经历、技能、项目经验等...'
                className='w-full h-52 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none'
              />
              <p className='text-sm text-gray-500 mt-2'>
                支持文本格式，建议包含完整的工作经历和技能信息
              </p>
            </div>

            {/* JD输入 */}
            <div className='bg-gray-50 p-6 rounded-lg'>
              <h3 className='text-lg font-semibold mb-4'>2. 输入岗位JD</h3>
              {isUsingExample && (
                <div className='mb-2 flex items-center justify-between'>
                  <span className='text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full'>
                    📝 示例内容 - 点击可直接编辑
                  </span>
                  <button
                    onClick={clearExample}
                    className='text-sm text-gray-500 hover:text-gray-700 transition-colors'
                  >
                    清空内容
                  </button>
                </div>
              )}
              <textarea
                ref={jdTextareaRef}
                value={jdText}
                onChange={e => handleInputChange('jd', e.target.value)}
                onFocus={() => handleInputFocus('jd')}
                placeholder='请粘贴目标岗位的职位描述，包括岗位要求、技能要求、经验要求等...'
                className='w-full h-52 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none'
              />
              <p className='text-sm text-gray-500 mt-2'>详细的JD内容有助于更精准的匹配度分析</p>
            </div>

            {/* 分析按钮 */}
            <button
              onClick={analyzeMatching}
              disabled={isAnalyzing}
              className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
            >
              {isAnalyzing ? (
                <div className='flex items-center justify-center space-x-2'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  <span>AI分析中...</span>
                </div>
              ) : (
                '开始智能分析'
              )}
            </button>

            {/* 功能说明 */}
            <div className='bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4 text-center'>💡 分析说明</h3>
              <div className='space-y-4'>
                <div className='flex items-start space-x-3'>
                  <div className='w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0'>
                    <svg
                      className='w-4 h-4 text-indigo-600'
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
                  <div>
                    <h4 className='font-medium text-gray-900 mb-1'>AI智能分析</h4>
                    <p className='text-sm text-gray-600'>
                      基于深度学习的语义分析技术，精准匹配简历与岗位要求
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0'>
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
                        d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-medium text-gray-900 mb-1'>多维度评估</h4>
                    <p className='text-sm text-gray-600'>
                      从技能、经验、教育、项目四个维度全面评估匹配度
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
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
                        d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-medium text-gray-900 mb-1'>优化建议</h4>
                    <p className='text-sm text-gray-600'>
                      提供具体的技能提升和简历优化建议，提高求职成功率
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 使用技巧 */}
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg'>
              <h4 className='font-medium text-gray-900 mb-3 flex items-center'>
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
                使用技巧
              </h4>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>• 简历内容越详细，分析越精准</li>
                <li>• 建议包含工作经历、技能和项目经验</li>
                <li>• JD内容请粘贴完整的岗位描述</li>
                <li>• 支持中英文混合内容分析</li>
              </ul>
            </div>
          </div>

          {/* 右侧：分析结果 */}
          <div className='space-y-4 flex flex-col justify-between min-h-full'>
            {matchingResult ? (
              <>
                {/* 示例状态提示 */}
                {isUsingExample && (
                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                    <div className='flex items-center'>
                      <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3'>
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
                            d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-blue-900'>基于示例的分析结果</p>
                        <p className='text-xs text-blue-700'>输入您的简历和JD获取专属分析报告</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 总体匹配度 */}
                <div className='bg-white p-6 rounded-lg shadow-sm border'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold'>总体匹配度</h3>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(matchingResult.overallScore)}`}
                    >
                      {matchingResult.overallScore}分 -{' '}
                      {matchingResult.overallLevel || getScoreLabel(matchingResult.overallScore)}
                    </div>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-3'>
                    <div
                      className='bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-1000'
                      style={{ width: `${matchingResult.overallScore}%` }}
                    ></div>
                  </div>
                  <p className='text-sm text-gray-600 mt-2'>
                    {matchingResult.overallDescription ||
                      '基于技能、经验、教育背景和项目经历的综合评分'}
                  </p>
                </div>

                {/* 详细分析 */}
                <div className='space-y-4'>
                  {/* 技能匹配 */}
                  <div className='bg-white p-6 rounded-lg shadow-sm border'>
                    <div className='flex items-center justify-between mb-3'>
                      <h4 className='font-medium text-gray-900'>技能匹配</h4>
                      <span
                        className={`px-2 py-1 rounded text-sm ${getScoreColor(matchingResult.skillMatch.score)}`}
                      >
                        {matchingResult.skillMatch.score}分
                      </span>
                    </div>
                    <div className='space-y-2'>
                      <div>
                        <p className='text-sm font-medium text-green-700 mb-1'>匹配技能：</p>
                        <div className='flex flex-wrap gap-1'>
                          {matchingResult.skillMatch.matchedSkills.map((skill, index) => (
                            <span
                              key={index}
                              className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded'
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-red-700 mb-1'>缺失技能：</p>
                        <div className='flex flex-wrap gap-1'>
                          {matchingResult.skillMatch.missingSkills.map((skill, index) => (
                            <span
                              key={index}
                              className='px-2 py-1 bg-red-100 text-red-800 text-xs rounded'
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 经验匹配 */}
                  <div className='bg-white p-6 rounded-lg shadow-sm border'>
                    <div className='flex items-center justify-between mb-3'>
                      <h4 className='font-medium text-gray-900'>经验匹配</h4>
                      <span
                        className={`px-2 py-1 rounded text-sm ${getScoreColor(matchingResult.experienceMatch.score)}`}
                      >
                        {matchingResult.experienceMatch.score}分
                      </span>
                    </div>
                    <div className='space-y-2'>
                      <div>
                        <p className='text-sm font-medium text-green-700 mb-1'>匹配经验：</p>
                        <ul className='text-sm text-gray-600 space-y-1'>
                          {matchingResult.experienceMatch.matchedExperience.map((exp, index) => (
                            <li key={index} className='flex items-center space-x-2'>
                              <span className='w-1 h-1 bg-green-500 rounded-full'></span>
                              <span>{exp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-orange-700 mb-1'>经验差距：</p>
                        <ul className='text-sm text-gray-600 space-y-1'>
                          {matchingResult.experienceMatch.gaps.map((gap, index) => (
                            <li key={index} className='flex items-center space-x-2'>
                              <span className='w-1 h-1 bg-orange-500 rounded-full'></span>
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 教育背景 */}
                  <div className='bg-white p-6 rounded-lg shadow-sm border'>
                    <div className='flex items-center justify-between mb-3'>
                      <h4 className='font-medium text-gray-900'>教育背景</h4>
                      <span
                        className={`px-2 py-1 rounded text-sm ${getScoreColor(matchingResult.educationMatch.score)}`}
                      >
                        {matchingResult.educationMatch.score}分
                      </span>
                    </div>
                    <div className='space-y-2'>
                      <div>
                        <p className='text-sm font-medium text-green-700 mb-1'>匹配背景：</p>
                        <div className='flex flex-wrap gap-1'>
                          {matchingResult.educationMatch.matchedEducation.map((edu, index) => (
                            <span
                              key={index}
                              className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded'
                            >
                              {edu}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-blue-700 mb-1'>优化建议：</p>
                        <ul className='text-sm text-gray-600 space-y-1'>
                          {matchingResult.educationMatch.suggestions.map((suggestion, index) => (
                            <li key={index} className='flex items-center space-x-2'>
                              <span className='w-1 h-1 bg-blue-500 rounded-full'></span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 项目经历 */}
                  <div className='bg-white p-6 rounded-lg shadow-sm border'>
                    <div className='flex items-center justify-between mb-3'>
                      <h4 className='font-medium text-gray-900'>项目经历</h4>
                      <span
                        className={`px-2 py-1 rounded text-sm ${getScoreColor(matchingResult.projectMatch.score)}`}
                      >
                        {matchingResult.projectMatch.score}分
                      </span>
                    </div>
                    <div className='space-y-2'>
                      <div>
                        <p className='text-sm font-medium text-green-700 mb-1'>匹配项目：</p>
                        <ul className='text-sm text-gray-600 space-y-1'>
                          {matchingResult.projectMatch.matchedProjects.map((project, index) => (
                            <li key={index} className='flex items-center space-x-2'>
                              <span className='w-1 h-1 bg-green-500 rounded-full'></span>
                              <span>{project}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-purple-700 mb-1'>项目建议：</p>
                        <ul className='text-sm text-gray-600 space-y-1'>
                          {matchingResult.projectMatch.recommendations.map((rec, index) => (
                            <li key={index} className='flex items-center space-x-2'>
                              <span className='w-1 h-1 bg-purple-500 rounded-full'></span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 弹性空间 - 确保底部对齐 */}
                <div className='flex-grow'></div>
              </>
            ) : (
              /* 空状态 - 用户清空了示例内容 */
              <div className='bg-gray-50 p-8 rounded-lg text-center'>
                <div className='w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-8 h-8 text-indigo-600'
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
                <h3 className='text-lg font-medium text-gray-900 mb-2'>准备开始分析</h3>
                <p className='text-gray-600 text-sm mb-4'>
                  输入简历和JD内容后，点击"开始智能分析"按钮
                </p>
                <button
                  onClick={() => {
                    setResumeText(sampleResume);
                    setJdText(sampleJD);
                    setIsUsingExample(true);
                    setMatchingResult(sampleAnalysis);
                  }}
                  className='px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors'
                >
                  查看示例分析
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 注册引导CTA - 移到底部全宽展示 */}
        <div className='mt-12 p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl'>
          <h3 className='text-2xl font-semibold text-gray-900 mb-3 text-center'>
            想要获取您的专属分析报告？
          </h3>
          <p className='text-lg text-gray-600 text-center mb-6'>
            输入您的简历和目标岗位，AI将为您生成详细的匹配分析和优化建议
          </p>
          <div className='flex justify-center gap-6'>
            <button
              onClick={() => {
                if (resumeTextareaRef.current) {
                  resumeTextareaRef.current.focus();
                  resumeTextareaRef.current.select();
                }
              }}
              className='px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-medium'
            >
              尝试分析我的简历
            </button>
            <button className='px-10 py-4 border-2 border-indigo-500 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-200 text-lg font-medium shadow-md hover:shadow-lg'>
              注册保存报告
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JDMatching;
