import React from 'react';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

/**
 * 联系我们页面
 * 展示智投简历的联系方式和反馈表单
 */
const ContactPage: React.FC = () => {
  return (
    <div className='min-h-screen bg-white'>
      <Navigation />
      <main className='pt-16'>
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
