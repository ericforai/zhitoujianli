import React from 'react';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import Pricing from '../components/Pricing';
import SEOHead from '../components/seo/SEOHead';

/**
 * 价格方案页面
 * 展示智投简历的定价方案
 */
const PricingPage: React.FC = () => {
  return (
    <div className='min-h-screen bg-white'>
      <SEOHead
        path='/pricing'
        breadcrumbs={[
          { name: '首页', url: 'https://zhitoujianli.com/' },
          { name: '价格方案', url: 'https://zhitoujianli.com/pricing' },
        ]}
      />
      <Navigation />
      <main className='pt-20 md:pt-16'>
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
