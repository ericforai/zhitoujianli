import { useState } from 'react';

interface MatchingResult {
  overallScore: number;
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
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(
    null
  );

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
    <section id='jd-matching' className='py-28 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-20'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-chinese'>
            JD智能匹配度分析
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            精准解析简历与JD的契合度，提供详细的匹配分析和优化建议
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-start'>
          {/* 左侧：输入区域 */}
          <div className='space-y-6 flex flex-col'>
            {/* 使用说明卡片 - 新增 */}
            <div className='bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 shadow-sm'>
              <div className='flex items-center mb-4'>
                <div className='w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3'>
                  <svg
                    className='w-6 h-6 text-indigo-600'
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
                <h3 className='text-lg font-bold text-gray-900'>使用说明</h3>
              </div>
              <ul className='space-y-2 text-sm text-gray-700'>
                <li className='flex items-start'>
                  <span className='mr-2 text-indigo-600 font-bold'>1.</span>
                  <span>在下方输入框中粘贴您的简历内容和目标岗位JD</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 text-indigo-600 font-bold'>2.</span>
                  <span>
                    确保内容完整，包含工作经历、技能、项目经验等关键信息
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 text-indigo-600 font-bold'>3.</span>
                  <span>
                    点击&ldquo;开始智能分析&rdquo;按钮，AI将为您生成详细的匹配度报告
                  </span>
                </li>
              </ul>
            </div>

            {/* 简历输入 */}
            <div className='bg-white p-7 rounded-xl shadow-md border border-gray-100'>
              <div className='flex items-center mb-4'>
                <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3'>
                  <span className='text-blue-600 font-bold text-lg'>1</span>
                </div>
                <h3 className='text-lg font-bold text-gray-900'>
                  输入简历内容
                </h3>
              </div>
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder='请粘贴您的简历内容，包括个人信息、工作经历、技能、项目经验等...'
                className='w-full h-40 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all'
              />
              <div className='mt-3 flex items-start'>
                <svg
                  className='w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0'
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
                <p className='text-sm text-gray-600 leading-relaxed'>
                  支持文本格式，建议包含完整的工作经历和技能信息，内容越详细分析越精准
                </p>
              </div>
            </div>

            {/* JD输入 */}
            <div className='bg-white p-7 rounded-xl shadow-md border border-gray-100'>
              <div className='flex items-center mb-4'>
                <div className='w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3'>
                  <span className='text-purple-600 font-bold text-lg'>2</span>
                </div>
                <h3 className='text-lg font-bold text-gray-900'>输入岗位JD</h3>
              </div>
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                placeholder='请粘贴目标岗位的职位描述，包括岗位要求、技能要求、经验要求等...'
                className='w-full h-40 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all'
              />
              <div className='mt-3 flex items-start'>
                <svg
                  className='w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0'
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
                <p className='text-sm text-gray-600 leading-relaxed'>
                  详细的JD内容有助于更精准的匹配度分析，建议包含岗位职责、技能要求、经验要求等
                </p>
              </div>
            </div>

            {/* 分析按钮 */}
            <button
              onClick={analyzeMatching}
              disabled={isAnalyzing || !resumeText.trim() || !jdText.trim()}
              className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
            >
              {isAnalyzing ? (
                <div className='flex items-center justify-center space-x-2'>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  <span>AI分析中...</span>
                </div>
              ) : (
                <div className='flex items-center justify-center space-x-2'>
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
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                  <span>开始智能分析</span>
                </div>
              )}
            </button>

            {/* 分析维度说明 - 新增 */}
            <div className='bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200'>
              <h4 className='text-base font-semibold text-gray-900 mb-4 flex items-center'>
                <svg
                  className='w-5 h-5 text-gray-600 mr-2'
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
                分析维度
              </h4>
              <div className='grid grid-cols-2 gap-3'>
                <div className='bg-white p-3 rounded-lg text-center shadow-sm'>
                  <div className='text-lg font-bold text-blue-600 mb-1'>
                    技能
                  </div>
                  <div className='text-xs text-gray-600'>技能匹配度</div>
                </div>
                <div className='bg-white p-3 rounded-lg text-center shadow-sm'>
                  <div className='text-lg font-bold text-purple-600 mb-1'>
                    经验
                  </div>
                  <div className='text-xs text-gray-600'>工作经验匹配</div>
                </div>
                <div className='bg-white p-3 rounded-lg text-center shadow-sm'>
                  <div className='text-lg font-bold text-green-600 mb-1'>
                    教育
                  </div>
                  <div className='text-xs text-gray-600'>教育背景匹配</div>
                </div>
                <div className='bg-white p-3 rounded-lg text-center shadow-sm'>
                  <div className='text-lg font-bold text-orange-600 mb-1'>
                    项目
                  </div>
                  <div className='text-xs text-gray-600'>项目经历匹配</div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：分析结果 */}
          <div className='space-y-6 flex flex-col min-h-[600px]'>
            {matchingResult ? (
              <>
                {/* 总体匹配度 */}
                <div className='bg-white p-6 rounded-lg shadow-sm border'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold'>总体匹配度</h3>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(matchingResult.overallScore)}`}
                    >
                      {matchingResult.overallScore}分 -{' '}
                      {getScoreLabel(matchingResult.overallScore)}
                    </div>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-3'>
                    <div
                      className='bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-1000'
                      style={{ width: `${matchingResult.overallScore}%` }}
                    ></div>
                  </div>
                  <p className='text-sm text-gray-600 mt-2'>
                    基于技能、经验、教育背景和项目经历的综合评分
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
                        <p className='text-sm font-medium text-green-700 mb-1'>
                          匹配技能：
                        </p>
                        <div className='flex flex-wrap gap-1'>
                          {matchingResult.skillMatch.matchedSkills.map(
                            (skill, index) => (
                              <span
                                key={index}
                                className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded'
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-red-700 mb-1'>
                          缺失技能：
                        </p>
                        <div className='flex flex-wrap gap-1'>
                          {matchingResult.skillMatch.missingSkills.map(
                            (skill, index) => (
                              <span
                                key={index}
                                className='px-2 py-1 bg-red-100 text-red-800 text-xs rounded'
                              >
                                {skill}
                              </span>
                            )
                          )}
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
                        <p className='text-sm font-medium text-green-700 mb-1'>
                          匹配经验：
                        </p>
                        <ul className='text-sm text-gray-600 space-y-1'>
                          {matchingResult.experienceMatch.matchedExperience.map(
                            (exp, index) => (
                              <li
                                key={index}
                                className='flex items-center space-x-2'
                              >
                                <span className='w-1 h-1 bg-green-500 rounded-full'></span>
                                <span>{exp}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-orange-700 mb-1'>
                          经验差距：
                        </p>
                        <ul className='text-sm text-gray-600 space-y-1'>
                          {matchingResult.experienceMatch.gaps.map(
                            (gap, index) => (
                              <li
                                key={index}
                                className='flex items-center space-x-2'
                              >
                                <span className='w-1 h-1 bg-orange-500 rounded-full'></span>
                                <span>{gap}</span>
                              </li>
                            )
                          )}
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
                        <p className='text-sm font-medium text-green-700 mb-1'>
                          匹配背景：
                        </p>
                        <div className='flex flex-wrap gap-1'>
                          {matchingResult.educationMatch.matchedEducation.map(
                            (edu, index) => (
                              <span
                                key={index}
                                className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded'
                              >
                                {edu}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-blue-700 mb-1'>
                          优化建议：
                        </p>
                        <ul className='text-sm text-gray-600 space-y-1'>
                          {matchingResult.educationMatch.suggestions.map(
                            (suggestion, index) => (
                              <li
                                key={index}
                                className='flex items-center space-x-2'
                              >
                                <span className='w-1 h-1 bg-blue-500 rounded-full'></span>
                                <span>{suggestion}</span>
                              </li>
                            )
                          )}
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
                        <p className='text-sm font-medium text-green-700 mb-1'>
                          匹配项目：
                        </p>
                        <ul className='text-sm text-gray-600 space-y-1'>
                          {matchingResult.projectMatch.matchedProjects.map(
                            (project, index) => (
                              <li
                                key={index}
                                className='flex items-center space-x-2'
                              >
                                <span className='w-1 h-1 bg-green-500 rounded-full'></span>
                                <span>{project}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-purple-700 mb-1'>
                          项目建议：
                        </p>
                        <ul className='text-sm text-gray-600 space-y-1'>
                          {matchingResult.projectMatch.recommendations.map(
                            (rec, index) => (
                              <li
                                key={index}
                                className='flex items-center space-x-2'
                              >
                                <span className='w-1 h-1 bg-purple-500 rounded-full'></span>
                                <span>{rec}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* 默认状态 */
              <>
                {/* 等待分析状态 - 增强视觉重量 */}
                <div className='bg-gradient-to-br from-indigo-50 to-purple-50 p-10 rounded-xl text-center border-2 border-indigo-100 shadow-md'>
                  <div className='w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg'>
                    <svg
                      className='w-12 h-12 text-white'
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
                  <h3 className='text-2xl font-bold text-gray-900 mb-3'>
                    等待分析
                  </h3>
                  <p className='text-gray-700 text-base leading-relaxed max-w-sm mx-auto'>
                    输入简历和JD内容后，点击&ldquo;开始智能分析&rdquo;按钮，AI将为您提供详细的匹配度分析报告
                  </p>
                </div>

                {/* 分析优势展示 - 增强视觉重量 */}
                <div className='bg-white p-8 rounded-xl shadow-lg border border-gray-100'>
                  <div className='flex items-center mb-6'>
                    <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3'>
                      <svg
                        className='w-6 h-6 text-green-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </div>
                    <h3 className='text-xl font-bold text-gray-900'>
                      为什么要做匹配分析？
                    </h3>
                  </div>
                  <div className='space-y-4'>
                    <div className='flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                      <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                        <svg
                          className='w-4 h-4 text-green-600'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                      <div>
                        <span className='text-base font-medium text-gray-900 block mb-1'>
                          提前了解自己的竞争力
                        </span>
                        <span className='text-sm text-gray-600'>
                          通过数据化分析，清晰了解与目标岗位的匹配程度
                        </span>
                      </div>
                    </div>
                    <div className='flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                      <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                        <svg
                          className='w-4 h-4 text-blue-600'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                      <div>
                        <span className='text-base font-medium text-gray-900 block mb-1'>
                          发现技能短板，针对性提升
                        </span>
                        <span className='text-sm text-gray-600'>
                          识别缺失的关键技能，制定精准的学习和提升计划
                        </span>
                      </div>
                    </div>
                    <div className='flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                      <div className='w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                        <svg
                          className='w-4 h-4 text-purple-600'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                      <div>
                        <span className='text-base font-medium text-gray-900 block mb-1'>
                          优化简历，提高通过率
                        </span>
                        <span className='text-sm text-gray-600'>
                          根据匹配分析结果，有针对性地优化简历内容
                        </span>
                      </div>
                    </div>
                    <div className='flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                      <div className='w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                        <svg
                          className='w-4 h-4 text-orange-600'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                      <div>
                        <span className='text-base font-medium text-gray-900 block mb-1'>
                          节省盲目投递的时间
                        </span>
                        <span className='text-sm text-gray-600'>
                          精准定位匹配度高的岗位，避免无效投递，提高求职效率
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 示例预览卡片 - 新增 */}
                <div className='bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100'>
                  <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                    <svg
                      className='w-5 h-5 text-indigo-600 mr-2'
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
                    分析报告预览
                  </h4>
                  <div className='space-y-3'>
                    <div className='bg-white p-4 rounded-lg shadow-sm'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium text-gray-700'>
                          总体匹配度
                        </span>
                        <span className='text-lg font-bold text-green-600'>
                          82分
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full'
                          style={{ width: '82%' }}
                        ></div>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='bg-white p-3 rounded-lg shadow-sm text-center'>
                        <div className='text-2xl font-bold text-blue-600 mb-1'>
                          85分
                        </div>
                        <div className='text-xs text-gray-600'>技能匹配</div>
                      </div>
                      <div className='bg-white p-3 rounded-lg shadow-sm text-center'>
                        <div className='text-2xl font-bold text-purple-600 mb-1'>
                          78分
                        </div>
                        <div className='text-xs text-gray-600'>经验匹配</div>
                      </div>
                    </div>
                    <p className='text-xs text-gray-600 text-center mt-2'>
                      * 以上为示例数据，实际分析结果以AI分析为准
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 功能说明 */}
        <div className='mt-16 bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-xl'>
          <h3 className='text-xl font-semibold text-gray-900 mb-4 text-center'>
            💡 分析说明
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='text-center'>
              <div className='w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                <svg
                  className='w-6 h-6 text-indigo-600'
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
              <h4 className='font-medium text-gray-900 mb-2'>AI智能分析</h4>
              <p className='text-sm text-gray-600'>
                基于深度学习的语义分析技术，精准匹配简历与岗位要求
              </p>
            </div>
            <div className='text-center'>
              <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                <svg
                  className='w-6 h-6 text-purple-600'
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
              <h4 className='font-medium text-gray-900 mb-2'>多维度评估</h4>
              <p className='text-sm text-gray-600'>
                从技能、经验、教育、项目四个维度全面评估匹配度
              </p>
            </div>
            <div className='text-center'>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                <svg
                  className='w-6 h-6 text-green-600'
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
              <h4 className='font-medium text-gray-900 mb-2'>优化建议</h4>
              <p className='text-sm text-gray-600'>
                提供具体的技能提升和简历优化建议，提高求职成功率
              </p>
            </div>
          </div>
        </div>

        {/* 底部CTA - 引导注册 */}
        <div className='mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-lg text-white text-center'>
          <h3 className='text-2xl font-semibold mb-2'>
            想要体验完整的匹配分析？
          </h3>
          <p className='text-base opacity-90 mb-6'>
            注册后即可使用AI智能匹配分析，提升求职成功率
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

export default JDMatching;
