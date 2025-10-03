import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import BlogSection from './components/BlogSection';
import Contact from './components/Contact';
import Demo from './components/Demo';
import Features from './components/Features';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import Login from './components/Login';
import Navigation from './components/Navigation';
import Pricing from './components/Pricing';
import Register from './components/Register';
import ResumeDelivery from './components/ResumeDelivery';
import SmartGreeting from './components/SmartGreeting';

// 主页组件
const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <Features />
      <Demo />
      <SmartGreeting />
      <BlogSection />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
};

// 后台管理入口组件
const DashboardEntry: React.FC = () => {
  React.useEffect(() => {
    // 获取Token并跳转到后台管理
    const token = localStorage.getItem('token');
    if (token) {
      // 在新窗口打开后台管理，并通过URL传递token
      const url = `/?token=${encodeURIComponent(token)}`;
      window.open(url, '_blank');
      // 跳转回首页
      window.location.href = '/';
    } else {
      // 未登录，跳转到登录页
      // 动态检测环境并跳转
      if (window.location.hostname === 'localhost') {
        window.location.href = '/login';
      } else {
        window.location.href = '/login';
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在跳转到后台管理...</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/resume-delivery" element={<ResumeDelivery />} />
        <Route path="/dashboard" element={<DashboardEntry />} />
      </Routes>
    </Router>
  );
}

export default App;
