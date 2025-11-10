import React from 'react';
import Features from '../components/Features';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import SEOHead from '../components/seo/SEOHead';

/**
 * 功能特色页面
 * 展示智投简历的核心功能特性
 */
const FeaturesPage: React.FC = () => {
  return (
    <div className='min-h-screen bg-white'>
      <SEOHead
        path='/features'
        breadcrumbs={[
          { name: '首页', url: 'https://zhitoujianli.com/' },
          { name: '产品功能', url: 'https://zhitoujianli.com/features' },
        ]}
        includeSoftwareSchema={true}
      />
      <Navigation />
      <main className='pt-16'>
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
