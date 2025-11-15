import React from 'react';
import BlogSection from '../components/BlogSection';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import SEOHead from '../components/seo/SEOHead';

/**
 * 博客页面
 * 展示智投简历的博客内容
 */
const BlogPage: React.FC = () => {
  return (
    <div className='min-h-screen bg-white'>
      <SEOHead
        path='/blog'
        breadcrumbs={[
          { name: '首页', url: 'https://zhitoujianli.com/' },
          { name: '求职干货博客', url: 'https://zhitoujianli.com/blog' },
        ]}
      />
      <Navigation />
      <main className='pt-20 md:pt-16'>
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
