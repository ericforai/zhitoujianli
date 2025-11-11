import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SEOHead from '../components/seo/SEOHead';

/**
 * 博客分类页面
 * 根据URL参数展示不同分类的博客文章
 */
const BlogCategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();

  // 分类配置
  const categoryConfig: Record<
    string,
    {
      title: string;
      description: string;
      color: string;
      icon: React.ReactNode;
      articles: Array<{
        id: string;
        title: string;
        summary: string; // 一句话摘要，显示在色块上
        excerpt: string; // 详细描述，显示在卡片内容区
        date: string;
        author: string;
        readTime: string;
      }>;
    }
  > = {
    'job-guide': {
      title: '求职指南',
      description: '专业的求职技巧和策略，帮助你在求职路上少走弯路',
      color: 'from-indigo-500 to-purple-600',
      icon: (
        <svg
          className='w-16 h-16'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
          />
        </svg>
      ),
      articles: [
        {
          id: '1',
          title: '如何打造一份脱颖而出的简历',
          summary: '让你的简历在众多候选人中脱颖而出',
          excerpt:
            '简历是求职的敲门砖，一份优秀的简历能让你在众多候选人中脱颖而出。本文将详细介绍如何从结构、内容、格式等方面优化你的简历。',
          date: '2025-11-01',
          author: '智投团队',
          readTime: '8分钟',
        },
        {
          id: '2',
          title: '简历中的关键词优化技巧',
          summary: '用正确的关键词通过ATS系统筛选',
          excerpt:
            '在AI招聘系统普及的今天，简历中的关键词优化变得尤为重要。学习如何使用正确的关键词，让你的简历通过ATS系统筛选。',
          date: '2025-10-28',
          author: '智投团队',
          readTime: '6分钟',
        },
        {
          id: '3',
          title: '不同行业简历的差异化策略',
          summary: '制作符合行业标准的专业简历',
          excerpt:
            'IT、金融、市场营销等不同行业对简历的要求各不相同。了解行业特点，制作符合行业标准的专业简历。',
          date: '2025-10-25',
          author: '智投团队',
          readTime: '10分钟',
        },
      ],
    },
    'career-advice': {
      title: '职场建议',
      description: '从面试准备到职场发展，全方位的职业发展建议',
      color: 'from-purple-500 to-pink-600',
      icon: (
        <svg
          className='w-16 h-16'
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
      articles: [
        {
          id: '1',
          title: '面试准备完全指南',
          summary: '从准备到成功的完整面试流程',
          excerpt:
            '从简历投递到面试成功，这是一个完整的流程。本文将介绍面试前的准备工作、常见面试问题应对、面试技巧等内容。',
          date: '2025-11-03',
          author: '智投团队',
          readTime: '12分钟',
        },
        {
          id: '2',
          title: '如何回答"你的优缺点是什么"',
          summary: '巧妙展示优点，将缺点转化为机会',
          excerpt:
            '这是面试中最常见的问题之一。学习如何巧妙地展示优点，同时将缺点转化为发展机会。',
          date: '2025-10-30',
          author: '智投团队',
          readTime: '5分钟',
        },
        {
          id: '3',
          title: '薪资谈判的艺术',
          summary: '掌握技巧，争取合理薪酬',
          excerpt:
            '薪资谈判是求职过程中的关键环节。掌握正确的谈判技巧，为自己争取合理的薪酬待遇。',
          date: '2025-10-27',
          author: '智投团队',
          readTime: '8分钟',
        },
      ],
    },
    'product-updates': {
      title: '产品动态',
      description: '智投简历的最新功能更新和产品资讯',
      color: 'from-green-500 to-teal-600',
      icon: (
        <svg
          className='w-16 h-16'
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
      articles: [
        {
          id: '1',
          title: '智投简历产品介绍',
          summary: 'AI驱动的智能求职自动化平台',
          excerpt:
            '智投简历是一款基于AI技术的智能求职助手，帮助求职者自动化完成简历投递、岗位匹配、打招呼语生成等工作。',
          date: '2025-11-05',
          author: '智投团队',
          readTime: '6分钟',
        },
        {
          id: '2',
          title: 'AI简历解析功能上线',
          summary: '智能提取关键信息，高效管理简历',
          excerpt:
            '新版本支持AI智能解析简历，自动提取关键信息，生成结构化数据，让简历管理更加高效。',
          date: '2025-11-02',
          author: '智投团队',
          readTime: '4分钟',
        },
        {
          id: '3',
          title: '智能打招呼语生成器',
          summary: '个性化打招呼语，提高回复率',
          excerpt:
            '基于岗位JD和个人简历，AI自动生成个性化打招呼语，提高HR回复率。',
          date: '2025-10-29',
          author: '智投团队',
          readTime: '5分钟',
        },
      ],
    },
  };

  const currentCategory = category ? categoryConfig[category] : null;

  // 如果分类不存在，显示404
  if (!currentCategory) {
    return (
      <div className='min-h-screen bg-white'>
        <Navigation />
        <main className='pt-24 pb-16'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>
              分类不存在
            </h1>
            <p className='text-xl text-gray-600 mb-8'>
              抱歉，您访问的博客分类不存在
            </p>
            <a
              href='/blog/'
              className='inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300'
            >
              返回博客首页
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white'>
      <SEOHead
        path={`/blog/${category}`}
        breadcrumbs={[
          { name: '首页', url: 'https://zhitoujianli.com/' },
          { name: '博客', url: 'https://zhitoujianli.com/blog' },
          {
            name: currentCategory.title,
            url: `https://zhitoujianli.com/blog/${category}`,
          },
        ]}
      />
      <Navigation />

      {/* 分类头部 */}
      <section
        className={`bg-gradient-to-br ${currentCategory.color} text-white pt-32 pb-20`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <div className='flex justify-center mb-6'>
              {currentCategory.icon}
            </div>
            <h1 className='text-4xl md:text-5xl font-bold mb-4 font-chinese'>
              {currentCategory.title}
            </h1>
            <p className='text-xl md:text-2xl text-white/90 max-w-2xl mx-auto'>
              {currentCategory.description}
            </p>
          </div>
        </div>
      </section>

      {/* 文章列表 */}
      <section className='py-16 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* 面包屑导航 - 分类快捷切换 */}
          <div className='mb-8'>
            <nav className='flex items-center flex-wrap gap-2'>
              <a
                href='/'
                className='text-gray-600 hover:text-indigo-600 transition-colors duration-200'
              >
                首页
              </a>
              <span className='text-gray-400'>/</span>
              <span className='text-gray-500 text-sm'>分类:</span>
              <a
                href='/blog/category/product-updates/'
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  category === 'product-updates'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                产品动态
              </a>
              <a
                href='/blog/category/job-guide/'
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  category === 'job-guide'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                求职指南
              </a>
              <a
                href='/blog/category/career-advice/'
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  category === 'career-advice'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                职场建议
              </a>
            </nav>
          </div>

          {/* 文章网格 */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {currentCategory.articles.map(article => (
              <article
                key={article.id}
                className='bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden'
              >
                <div
                  className={`h-48 bg-gradient-to-br ${currentCategory.color} flex items-center justify-center px-6`}
                >
                  <p className='text-white text-center text-lg font-medium leading-relaxed'>
                    {article.summary}
                  </p>
                </div>
                <div className='p-6'>
                  <h3 className='text-xl font-semibold text-gray-900 mb-3 line-clamp-2'>
                    {article.title}
                  </h3>
                  <p className='text-gray-600 mb-4 line-clamp-3'>
                    {article.excerpt}
                  </p>
                  <div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
                    <span>{article.date}</span>
                    <span>{article.readTime}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>
                      {article.author}
                    </span>
                    <button className='text-indigo-600 hover:text-indigo-800 font-medium'>
                      阅读全文 →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* 返回博客首页 */}
          <div className='mt-12 text-center'>
            <a
              href='/blog/'
              className='inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-medium'
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
                  d='M15 19l-7-7 7-7'
                />
              </svg>
              <span>返回博客首页</span>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogCategoryPage;
