import React from 'react';
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import ApiTestPage from './components/ApiTestPage';
import AutoDelivery from './components/AutoDelivery';
import BlogSection from './components/BlogSection';
import Contact from './components/Contact';
import Demo from './components/Demo';
import DirectResumeEntry from './components/DirectResumeEntry';
// 新增：简历模块页面
import ResumeLanding from './pages/Resume/ResumeLanding';
import TemplatesPage from './pages/Resume/Templates/TemplatesPage';
import TemplatesPreview from './pages/Resume/Templates/TemplatesPreview';
import OptimizePage from './pages/Resume/Optimize/OptimizePage';
import HistoryPage from './pages/Resume/History/HistoryPage';
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
import UTMTracker from './components/UTMTracker';
import { AuthProvider } from './contexts/AuthContext';
import { PlanProvider } from './contexts/PlanContext';
// 博客已迁移到独立的Astro应用，通过 /blog 路径访问（Nginx代理）
import ConfigPage from './pages/ConfigPage';
import ContactPage from './pages/ContactPage';
import Dashboard from './pages/Dashboard';
import PricingPage from './pages/PricingPage';
import ScenesPage from './pages/ScenesPage';
import HelpPage from './pages/HelpPage';
import GuidePage from './pages/GuidePage';

// 管理员后台页面
import AdminRoute from './components/admin/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminLoginLogs from './pages/AdminLoginLogs';
import AdminFeatures from './pages/AdminFeatures';
import AdminSystem from './pages/AdminSystem';
import AdminUserBehavior from './pages/AdminUserBehavior';

// 主页组件
const HomePage: React.FC = () => {
  return (
    <div className='min-h-screen bg-white'>
      <SEOHead
        path='/'
        includeOrganizationSchema={true}
        includeSoftwareSchema={true}
      />
      <header>
        <Navigation />
      </header>
      <main>
        <HeroSection />
        <Features />
        <Demo />
        <AutoDelivery />
        <JDMatching />
        <SmartGreeting />
        <BlogSection />
        <Contact />
      </main>
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
        <UTMTracker />
        <AuthProvider>
          <PlanProvider>
          <Routes>
            {/* 重定向已删除的页面到新页面 */}
            <Route
              path='/boss-delivery'
              element={<Navigate to='/dashboard' replace />}
            />
            {/* 公开路由 */}
            <Route path='/' element={<HomePage />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {/* 页面路由 - 修复菜单点击问题 */}
            <Route path='/pricing' element={<PricingPage />} />
            <Route path='/scenes' element={<ScenesPage />} />
            {/* 博客路由：博客是独立的Astro应用，通过 /blog 路径访问（Nginx代理到 /var/www/zhitoujianli/blog） */}
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
            {/* 简历模块：/resume 公开，其余受保护 */}
            <Route path='/resume' element={<ResumeLanding />} />
            <Route
              path='/resume/templates'
              element={
                <PrivateRoute>
                  <TemplatesPage />
                </PrivateRoute>
              }
            />
            <Route
              path='/resume/templates/preview'
              element={
                <PrivateRoute>
                  <TemplatesPreview />
                </PrivateRoute>
              }
            />
            <Route
              path='/resume/optimize'
              element={
                <PrivateRoute>
                  <OptimizePage />
                </PrivateRoute>
              }
            />
            <Route
              path='/resume/history'
              element={
                <PrivateRoute>
                  <HistoryPage />
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
            <Route
              path='/admin/behavior'
              element={
                <AdminRoute>
                  <AdminUserBehavior />
                </AdminRoute>
              }
            />

            {/* 测试路由 - 开发环境使用 */}
            <Route path='/api-test' element={<ApiTestPage />} />
            <Route path='/standalone-test' element={<StandaloneApiTest />} />
            <Route path='/test-login' element={<TestLogin />} />
          </Routes>
          </PlanProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
