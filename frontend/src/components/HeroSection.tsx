import React from 'react';

const HeroSection = () => {
  return (
    <section className="pt-20 pb-16 bg-gradient-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-chinese">
            智投简历
            <span className="block text-2xl md:text-3xl font-normal text-gray-600 mt-2">
              智能投递 · 精准匹配
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            用AI帮你更快拿到心仪Offer
          </p>
          
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <a href="#contact" className="bg-gradient-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg text-center">
                     立即体验
                   </a>
                   <a href="#pricing" className="border-2 border-primary-500 text-primary-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300 text-center">
                     免费开始
                   </a>
                 </div>
          
          <div className="mt-12">
            <p className="text-sm text-gray-500 mb-4">已有 10,000+ 用户选择智投简历</p>
            <div className="flex justify-center space-x-8 opacity-60">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-500">95%</div>
                <div className="text-sm text-gray-600">投递成功率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-500">3倍</div>
                <div className="text-sm text-gray-600">效率提升</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-green">24h</div>
                <div className="text-sm text-gray-600">快速响应</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
