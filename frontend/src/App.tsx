import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ApiTestPage from './components/ApiTestPage';
import BlogSection from './components/BlogSection';
import Contact from './components/Contact';
import Demo from './components/Demo';
import DirectResumeEntry from './components/DirectResumeEntry';
import Features from './components/Features';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import Login from './components/Login';
import Navigation from './components/Navigation';
import PrivateRoute from './components/PrivateRoute';
import Register from './components/Register';
import ResumeDelivery from './components/ResumeDelivery';
import StandaloneApiTest from './components/StandaloneApiTest';
import TestLogin from './components/TestLogin';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import Dashboard from './pages/Dashboard';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';

// 主页组件
const HomePage: React.FC = () => {
  return (
    <div className='min-h-screen bg-white'>
      <Navigation />
      <HeroSection />
      <Features />
      <Demo />
      <BlogSection />
      <Contact />
      <Footer />
    </div>
  );
};

// Dashboard入口组件已移除，直接使用Dashboard页面

/**
 * 应用主组件 - 增强版
 *
 * 🔧 修复：使用AuthProvider统一管理认证状态
 * - 在Router内部使用AuthProvider（需要访问useNavigate）
 * - 为需要保护的路由添加PrivateRoute
 * - 保持ErrorBoundary在最外层
 */
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            {/* 公开路由 */}
            <Route path='/' element={<HomePage />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {/* 页面路由 - 修复菜单点击问题 */}
            <Route path='/features' element={<FeaturesPage />} />
            <Route path='/pricing' element={<PricingPage />} />
            <Route path='/blog' element={<BlogPage />} />
            <Route path='/contact' element={<ContactPage />} />

            {/* 受保护的路由 - 需要登录 */}
            <Route
              path='/resume-delivery'
              element={
                <PrivateRoute>
                  <ResumeDelivery />
                </PrivateRoute>
              }
            />
            <Route
              path='/resume'
              element={
                <PrivateRoute>
                  <DirectResumeEntry />
                </PrivateRoute>
              }
            />
            <Route
              path='/dashboard'
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* 测试路由 - 开发环境使用 */}
            <Route path='/api-test' element={<ApiTestPage />} />
            <Route path='/standalone-test' element={<StandaloneApiTest />} />
            <Route path='/test-login' element={<TestLogin />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
