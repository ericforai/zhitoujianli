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
import Register from './components/Register';
import ResumeDelivery from './components/ResumeDelivery';
import StandaloneApiTest from './components/StandaloneApiTest';
import TestLogin from './components/TestLogin';
import ErrorBoundary from './components/common/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';

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

// 后台管理入口组件 - 无需登录直接访问
const DashboardEntry: React.FC = () => {
  React.useEffect(() => {
<<<<<<< HEAD
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
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
        <p className='mt-4 text-gray-600'>正在跳转到后台管理...</p>
      </div>
    </div>
  );
};

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
                  <DashboardEntry />
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
