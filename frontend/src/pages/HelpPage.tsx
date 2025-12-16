import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Container from '../components/common/Container';
import SEOHead from '../components/seo/SEOHead';

/**
 * 帮助中心页面
 *
 * 功能：
 * - 常见问题解答
 * - 使用教程链接
 * - 联系支持方式
 */
const HelpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');

  const faqs = [
    {
      category: '账号相关',
      questions: [
        {
          q: '如何注册智投简历账号？',
          a: '点击首页右上角的"注册"按钮，填写邮箱和密码即可完成注册。',
        },
        {
          q: '忘记密码怎么办？',
          a: '在登录页面点击"忘记密码"，输入注册邮箱，我们会发送重置密码链接到您的邮箱。',
        },
        {
          q: '如何修改个人信息？',
          a: '登录后进入"个人中心"，在"账号设置"页面可以修改您的个人信息。',
        },
      ],
    },
    {
      category: '简历相关',
      questions: [
        {
          q: '支持哪些简历格式？',
          a: '目前支持PDF、Word（.doc/.docx）和TXT格式的简历文件，文件大小不超过10MB。',
        },
        {
          q: '如何上传简历？',
          a: '登录后进入"简历管理"页面，点击"上传简历"按钮，选择本地简历文件即可。',
        },
        {
          q: '可以上传多份简历吗？',
          a: '可以，您可以上传多份简历，针对不同岗位使用不同的简历版本。',
        },
      ],
    },
    {
      category: '投递相关',
      questions: [
        {
          q: '如何开始自动投递？',
          a: '上传简历后，在"自动投递"页面选择招聘平台，设置筛选条件，点击"开始投递"即可。',
        },
        {
          q: '自动投递安全吗？',
          a: '非常安全。我们使用加密技术保护您的账号信息，且投递过程完全模拟人工操作。',
        },
        {
          q: '投递失败怎么办？',
          a: '系统会自动记录失败原因，您可以在"投递记录"中查看详情并重新投递。',
        },
      ],
    },
    {
      category: 'AI功能相关',
      questions: [
        {
          q: 'AI打招呼语如何生成？',
          a: 'AI会分析您的简历和目标岗位JD，提取核心匹配点，生成个性化的打招呼语。',
        },
        {
          q: 'JD匹配分析准确吗？',
          a: '我们使用先进的AI技术，匹配准确率超过90%，会从技能、经验、教育等多维度分析。',
        },
        {
          q: '生成的内容可以修改吗？',
          a: '当然可以！所有AI生成的内容都支持手动编辑和调整。',
        },
      ],
    },
    {
      category: '费用相关',
      questions: [
        {
          q: '智投简历是免费的吗？',
          a: '我们提供基础免费版本和高级付费版本，免费版本可以体验核心功能。',
        },
        {
          q: '如何升级到付费版本？',
          a: '登录后进入"会员中心"，选择合适的套餐即可升级。',
        },
        {
          q: '支持哪些支付方式？',
          a: '支持微信支付、支付宝、银行卡等多种支付方式。',
        },
      ],
    },
  ];

  // 根据分类过滤FAQ
  const getFilteredFaqs = () => {
    if (!category) return faqs;

    const categoryMap: Record<string, string> = {
      account: '账号相关',
      resume: '简历相关',
      ai: 'AI功能相关',
    };

    const targetCategory = categoryMap[category];
    if (!targetCategory) return faqs;

    return faqs.filter(faq => faq.category === targetCategory);
  };

  const filteredFaqs = getFilteredFaqs();

  return (
    <div className='min-h-screen bg-gray-50'>
      <SEOHead
        path='/help'
        breadcrumbs={[
          { name: '首页', url: 'https://zhitoujianli.com/' },
          { name: '帮助中心', url: 'https://zhitoujianli.com/help' },
        ]}
      />
      <Navigation />

      {/* Hero Section */}
      <section className='pt-32 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100'>
        <Container size='xl'>
          <div className='text-center'>
            <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
              帮助中心
            </h1>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              有任何问题？我们来帮您解答
            </p>
          </div>
        </Container>
      </section>

      {/* Help Categories Section */}
      <section className='py-16 bg-white'>
        <Container size='xl'>
          <div className='max-w-6xl mx-auto'>
            <div className='grid gap-6 md:grid-cols-3 mb-16'>
              <a
                href='/help?category=account'
                className='bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300 block'
              >
                <h3 className='text-xl font-bold text-gray-900 mb-3'>
                  账户问题
                </h3>
                <p className='text-gray-600 text-sm'>注册、登录、密码重置等</p>
              </a>
              <a
                href='/help?category=resume'
                className='bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300 block'
              >
                <h3 className='text-xl font-bold text-gray-900 mb-3'>
                  简历功能
                </h3>
                <p className='text-gray-600 text-sm'>上传、解析、优化等</p>
              </a>
              <a
                href='/help?category=ai'
                className='bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300 block'
              >
                <h3 className='text-xl font-bold text-gray-900 mb-3'>AI匹配</h3>
                <p className='text-gray-600 text-sm'>智能匹配、评分等</p>
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQs Section */}
      <section className='py-16'>
        <Container size='xl'>
          <div className='max-w-4xl mx-auto'>
            {filteredFaqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className='mb-12'>
                <h2 className='text-2xl font-bold text-gray-900 mb-6 flex items-center'>
                  <span className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm'>
                    {categoryIndex + 1}
                  </span>
                  {category.category}
                </h2>
                <div className='space-y-6'>
                  {category.questions.map((faq, faqIndex) => (
                    <div
                      key={faqIndex}
                      className='bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200'
                    >
                      <h3 className='text-lg font-semibold text-gray-900 mb-2 flex items-start'>
                        <span className='text-blue-600 mr-2'>Q:</span>
                        {faq.q}
                      </h3>
                      <p className='text-gray-700 ml-6'>
                        <span className='text-green-600 font-semibold mr-2'>
                          A:
                        </span>
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Contact Support Section */}
      <section className='py-16 bg-white'>
        <Container size='xl'>
          <div className='max-w-3xl mx-auto text-center'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              还有其他问题？
            </h2>
            <p className='text-xl text-gray-600 mb-8'>
              我们的客服团队随时为您服务
            </p>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='bg-gray-50 p-6 rounded-lg'>
                <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-6 h-6 text-blue-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  邮件支持
                </h3>
                <p className='text-gray-600 text-sm mb-3'>发送邮件至客服邮箱</p>
                <a
                  href='mailto:zhitoujianli@qq.com'
                  className='text-blue-600 hover:text-blue-700 font-medium'
                >
                  zhitoujianli@qq.com
                </a>
              </div>

              <div className='bg-gray-50 p-6 rounded-lg'>
                <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
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
                      d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  电话支持
                </h3>
                <p className='text-gray-600 text-sm mb-3'>工作日 9:00-18:00</p>
                <a
                  href='tel:15317270756'
                  className='text-blue-600 hover:text-blue-700 font-medium'
                >
                  15317270756
                </a>
              </div>

              <div className='bg-gray-50 p-6 rounded-lg'>
                <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
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
                      d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  用户指南
                </h3>
                <p className='text-gray-600 text-sm mb-3'>查看详细使用教程</p>
                <Link
                  to='/guide'
                  className='text-blue-600 hover:text-blue-700 font-medium'
                >
                  查看指南 →
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default HelpPage;
