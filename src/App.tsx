import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeroSection from './components/HeroSection';
import Features from './components/Features';
import Demo from './components/Demo';
import SmartGreeting from './components/SmartGreeting';
import Pricing from './components/Pricing';
import BlogSection from './components/BlogSection';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';

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
      const url = `http://localhost:8080?token=${encodeURIComponent(token)}`;
      window.open(url, '_blank');
      // 跳转回首页
      window.location.href = '/';
    } else {
      // 未登录，跳转到登录页
      // 检查当前是否在前端域名，如果是则跳转到后端登录页面
      if (window.location.hostname === 'localhost' && window.location.port === '3000') {
        window.location.href = 'http://localhost:8080/login';
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
        <Route path="/dashboard" element={<DashboardEntry />} />
      </Routes>
    </Router>
  );
}

export default App;