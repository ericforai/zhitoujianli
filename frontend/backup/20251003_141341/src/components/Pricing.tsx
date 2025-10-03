import React from 'react';

const Pricing = () => {
  const plans = [
    {
      name: "基础版",
      price: "免费",
      description: "适合应届生/轻量用户",
      features: [
        "每日10次投递",
        "基础匹配分析",
        "标准打招呼语",
        "邮件支持"
      ],
      buttonText: "免费开始",
      popular: false
    },
    {
      name: "专业版",
      price: "¥99",
      period: "/月",
      description: "提升投递成功率，适合活跃求职者",
      features: [
        "每日100次投递",
        "高级匹配分析",
        "个性化打招呼语",
        "AI优化建议",
        "优先客服支持"
      ],
      buttonText: "立即升级",
      popular: true
    },
    {
      name: "企业版",
      price: "¥299",
      period: "/月",
      description: "支持团队与猎头，批量投递",
      features: [
        "无限次投递",
        "团队协作功能",
        "批量简历管理",
        "数据分析报告",
        "专属客户经理"
      ],
      buttonText: "联系销售",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-chinese">
            选择适合你的版本
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            从免费体验到企业级解决方案
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className={`relative p-8 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
              plan.popular 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 bg-white'
            }`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    推荐
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 font-chinese">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600">
                      {plan.period}
                    </span>
                  )}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <a href={plan.name === "基础版" ? "#contact" : plan.name === "专业版" ? "#contact" : "#contact"} className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 block text-center ${
                  plan.popular
                    ? 'bg-gradient-primary text-white hover:opacity-90 transform hover:scale-105'
                    : 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white'
                }`}>
                  {plan.buttonText}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
