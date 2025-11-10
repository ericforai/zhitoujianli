import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ApiTestPage from './components/ApiTestPage';
import AutoDelivery from './components/AutoDelivery';
import BlogSection from './components/BlogSection';
import BossDelivery from './components/BossDelivery';
import Contact from './components/Contact';
import Demo from './components/Demo';
import DirectResumeEntry from './components/DirectResumeEntry';
import Features from './components/Features';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import JDMatching from './components/JDMatching';
import Login from './components/Login';
import Navigation from './components/Navigation';
import PrivateRoute from './components/PrivateRoute';
import Register from './components/Register';
import ResumeDelivery from './components/ResumeDelivery';
import SmartGreeting from './components/SmartGreeting';
import StandaloneApiTest from './components/StandaloneApiTest';
import TestLogin from './components/TestLogin';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import SEOHead from './components/seo/SEOHead';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './contexts/AuthContext';
import BlogPage from './pages/BlogPage';
import BlogCategoryPage from './pages/BlogCategoryPage';
import ConfigPage from './pages/ConfigPage';
import ContactPage from './pages/ContactPage';
import Dashboard from './pages/Dashboard';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import HelpPage from './pages/HelpPage';
import GuidePage from './pages/GuidePage';

// 管理员后台页面
import AdminRoute from './components/admin/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminLoginLogs from './pages/AdminLoginLogs';
import AdminFeatures from './pages/AdminFeatures';
import AdminSystem from './pages/AdminSystem';

// 主页组件
const HomePage: React.FC = () => {
  return (
    <div className='min-h-screen bg-white'>
      <SEOHead
        path='/'
        includeOrganizationSchema={true}
        includeSoftwareSchema={true}
      />
      <Navigation />
      <HeroSection />
      <Features />
      <Demo />
      <AutoDelivery />
      <JDMatching />
      <SmartGreeting />
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
        <ScrollToTop />
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
            <Route path='/blog/:category' element={<BlogCategoryPage />} />
            <Route path='/contact' element={<ContactPage />} />

            {/* 法律文档页面 */}
            <Route path='/terms' element={<Terms />} />
            <Route path='/privacy' element={<Privacy />} />

            {/* 帮助和指南页面 */}
            <Route path='/help' element={<HelpPage />} />
            <Route path='/guide' element={<GuidePage />} />

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
              path='/boss-delivery'
              element={
                <PrivateRoute>
                  <BossDelivery />
                </PrivateRoute>
              }
            />
            <Route path='/resume' element={<DirectResumeEntry />} />
            <Route
              path='/dashboard'
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path='/config'
              element={
                <PrivateRoute>
                  <ConfigPage />
                </PrivateRoute>
              }
            />

            {/* 管理员后台路由 - 需要管理员权限 */}
            <Route
              path='/admin/dashboard'
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path='/admin/users'
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path='/admin/login-logs'
              element={
                <AdminRoute>
                  <AdminLoginLogs />
                </AdminRoute>
              }
            />
            <Route
              path='/admin/features'
              element={
                <AdminRoute>
                  <AdminFeatures />
                </AdminRoute>
              }
            />
            <Route
              path='/admin/system'
              element={
                <AdminRoute>
                  <AdminSystem />
                </AdminRoute>
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
