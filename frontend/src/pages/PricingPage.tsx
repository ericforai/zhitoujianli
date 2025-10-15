import React from 'react';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import Pricing from '../components/Pricing';

/**
 * 价格方案页面
 * 展示智投简历的定价方案
 */
const PricingPage: React.FC = () => {
  return (
    <div className='min-h-screen bg-white'>
      <Navigation />
      <main className='pt-16'>
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
