import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import SEOHead from '../components/seo/SEOHead';

/**
 * 联系我们页面
 * 展示智投简历的联系方式和反馈表单
 * 支持通过URL参数显示不同的咨询场景（?plan=pro 或 ?plan=enterprise）
 */
const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan');

  // 验证plan参数，只接受'pro'和'enterprise'
  const validPlan = plan === 'pro' || plan === 'enterprise' ? plan : undefined;

  // 根据plan参数调整页面标题
  const getPageTitle = () => {
    if (validPlan === 'pro') {
      return '专业版升级咨询';
    } else if (validPlan === 'enterprise') {
      return '企业版咨询';
    }
    return '联系我们';
  };

  return (
    <div className='min-h-screen bg-white'>
      <SEOHead
        path='/contact'
        breadcrumbs={[
          { name: '首页', url: 'https://zhitoujianli.com/' },
          { name: getPageTitle(), url: 'https://zhitoujianli.com/contact' },
        ]}
      />
      <Navigation />
      <main className='pt-16'>
        <Contact plan={validPlan} />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
