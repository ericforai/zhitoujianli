import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Container from '../components/common/Container';
import SEOHead from '../components/seo/SEOHead';

/**
 * 用户指南页面
 *
 * 功能：
 * - 快速开始指南
 * - 功能使用说明
 * - 最佳实践建议
 */
const GuidePage: React.FC = () => {
  const guides = [
    {
      title: '快速开始',
      icon: (
        <svg
          className='w-8 h-8'
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
      color: 'blue',
      steps: [
        {
          title: '1. 注册账号',
          description: '使用邮箱注册智投简历账号，快速开始您的智能求职之旅。',
          tips: ['建议使用常用邮箱，方便接收通知', '设置强密码保护账号安全'],
        },
        {
          title: '2. 上传简历',
          description: '上传您的简历文件，系统会自动解析简历内容。',
          tips: [
            '支持PDF、Word格式',
            '建议简历内容完整清晰',
            '可以上传多份简历',
          ],
        },
        {
          title: '3. 配置投递',
          description: '设置筛选条件、目标城市、期望薪资等投递参数。',
          tips: ['关键词要精准', '可以设置多个城市', '合理设置投递页数'],
        },
        {
          title: '4. 开始投递',
          description: '点击开始投递，系统会自动批量投递简历到目标岗位。',
          tips: ['建议先小范围测试', '定期查看投递结果', '及时调整策略'],
        },
      ],
    },
    {
      title: 'AI功能使用',
      icon: (
        <svg
          className='w-8 h-8'
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
      ),
      color: 'purple',
      steps: [
        {
          title: 'JD智能匹配',
          description: '输入简历和岗位JD，AI会分析匹配度并给出优化建议。',
          tips: ['简历内容要完整', 'JD描述要详细', '关注匹配度分析结果'],
        },
        {
          title: 'AI打招呼语',
          description: 'AI会根据简历和JD生成个性化的打招呼语，提升HR回复率。',
          tips: ['选择合适的风格', '可以手动调整', '针对不同公司定制'],
        },
        {
          title: '智能简历优化',
          description: 'AI会分析简历短板，提供针对性的优化建议。',
          tips: ['重点优化技能描述', '突出项目亮点', '量化工作成果'],
        },
      ],
    },
    {
      title: '自动投递平台',
      icon: (
        <svg
          className='w-8 h-8'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
          />
        </svg>
      ),
      color: 'green',
      steps: [
        {
          title: 'Boss直聘',
          description: '支持批量投递、智能打招呼、实时状态跟踪。',
          tips: ['需要登录Boss账号', '建议使用智能打招呼', '定期更新简历'],
        },
        {
          title: '智联招聘',
          description: '支持全选投递、行业筛选、职位匹配。',
          tips: ['完善个人信息', '设置求职意向', '及时回复面试邀请'],
        },
        {
          title: '前程无忧',
          description: '支持批量申请、简历优化、投递统计。',
          tips: ['上传最新简历', '关注投递反馈', '优化简历关键词'],
        },
        {
          title: '猎聘网',
          description: '支持精准匹配、猎头推荐、职业规划。',
          tips: ['完善职业背景', '展示核心竞争力', '主动联系猎头'],
        },
      ],
    },
  ];

  const bestPractices = [
    {
      title: '简历优化建议',
      items: [
        '使用清晰的格式和排版',
        '突出核心技能和项目经验',
        '用数据量化工作成果',
        '针对不同岗位定制简历',
        '定期更新简历内容',
      ],
    },
    {
      title: '投递策略建议',
      items: [
        '设置精准的关键词',
        '选择合适的投递时间',
        '避免重复投递同一岗位',
        '定期查看投递反馈',
        '及时调整投递策略',
      ],
    },
    {
      title: '提升成功率',
      items: [
        '使用AI生成的打招呼语',
        '关注岗位匹配度分析',
        '完善个人信息和技能标签',
        '保持简历信息的真实性',
        '及时响应面试邀请',
      ],
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <SEOHead
        path='/guide'
        breadcrumbs={[
          { name: '首页', url: 'https://zhitoujianli.com/' },
          { name: '快速入门指南', url: 'https://zhitoujianli.com/guide' },
        ]}
      />
      <Navigation />

      {/* Hero Section */}
      <section className='pt-32 pb-16 bg-gradient-to-br from-purple-50 to-pink-100'>
        <Container size='xl'>
          <div className='text-center'>
            <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
              用户指南
            </h1>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              从零开始，掌握智投简历的所有功能
            </p>
          </div>
        </Container>
      </section>

      {/* Guides Section */}
      <section className='py-16'>
        <Container size='xl'>
          {guides.map((guide, index) => (
            <div key={index} className='mb-16'>
              <div className='flex items-center mb-8'>
                <div
                  className={`w-16 h-16 bg-${guide.color}-100 rounded-full flex items-center justify-center text-${guide.color}-600 mr-4`}
                >
                  {guide.icon}
                </div>
                <h2 className='text-3xl font-bold text-gray-900'>
                  {guide.title}
                </h2>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {guide.steps.map((step, stepIndex) => (
                  <div
                    key={stepIndex}
                    className='bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200'
                  >
                    <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                      {step.title}
                    </h3>
                    <p className='text-gray-700 mb-4'>{step.description}</p>
                    {step.tips && (
                      <div className='bg-blue-50 p-4 rounded-lg'>
                        <h4 className='text-sm font-semibold text-blue-900 mb-2'>
                          💡 小贴士
                        </h4>
                        <ul className='text-sm text-blue-800 space-y-1'>
                          {step.tips.map((tip, tipIndex) => (
                            <li key={tipIndex}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* Best Practices Section */}
      <section className='py-16 bg-white'>
        <Container size='xl'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              最佳实践建议
            </h2>
            <p className='text-xl text-gray-600'>
              遵循这些建议，提升您的求职成功率
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {bestPractices.map((practice, index) => (
              <div
                key={index}
                className='bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg'
              >
                <h3 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
                  <span className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm'>
                    {index + 1}
                  </span>
                  {practice.title}
                </h3>
                <ul className='space-y-3'>
                  {practice.items.map((item, itemIndex) => (
                    <li key={itemIndex} className='flex items-start'>
                      <svg
                        className='w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                      <span className='text-gray-700'>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className='py-16 bg-gradient-to-r from-blue-600 to-indigo-600'>
        <Container size='xl'>
          <div className='text-center text-white'>
            <h2 className='text-3xl font-bold mb-4'>准备开始了吗？</h2>
            <p className='text-xl mb-8 opacity-90'>
              立即注册，开启您的智能求职之旅
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                to='/register'
                className='inline-block bg-white text-blue-600 py-3 px-8 rounded-lg font-medium hover:bg-gray-100 transition-colors'
              >
                立即注册
              </Link>
              <Link
                to='/help'
                className='inline-block bg-transparent border-2 border-white text-white py-3 px-8 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors'
              >
                查看帮助中心
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default GuidePage;
