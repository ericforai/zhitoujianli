import React from 'react';
import BlogSection from '../components/BlogSection';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

/**
 * 博客页面
 * 展示智投简历的博客内容
 */
const BlogPage: React.FC = () => {
  return (
    <div className='min-h-screen bg-white'>
      <Navigation />
      <main className='pt-16'>
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
