/**
 * 管理员后台布局组件
 * 包含侧边栏导航和主内容区
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-31
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 导航菜单项
  const menuItems = [
    { path: '/admin/dashboard', label: '仪表盘', icon: '📊' },
    { path: '/admin/users', label: '用户管理', icon: '👥' },
    { path: '/admin/login-logs', label: '登录日志', icon: '📝' },
    { path: '/admin/behavior', label: '用户行为', icon: '📈' },
    { path: '/admin/features', label: '功能开关', icon: '⚙️' },
    { path: '/admin/system', label: '系统配置', icon: '🔧' },
  ];

  // 返回工作台
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 侧边栏 */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo区域 */}
        <div className='h-16 flex items-center justify-between px-4 border-b border-gray-200'>
          {sidebarOpen && (
            <h1 className='text-xl font-bold text-gray-900'>管理后台</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
          >
            <svg
              className='w-5 h-5 text-gray-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d={
                  sidebarOpen
                    ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7'
                    : 'M13 5l7 7-7 7M5 5l7 7-7 7'
                }
              />
            </svg>
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className='p-4 space-y-2'>
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className='text-xl'>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* 底部操作 */}
        <div className='absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-2'>
          <button
            onClick={handleBackToDashboard}
            className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors'
            title='返回用户工作台'
          >
            <span className='text-xl'>🏠</span>
            {sidebarOpen && <span>返回工作台</span>}
          </button>
          <button
            onClick={handleLogout}
            className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors'
          >
            <span className='text-xl'>🚪</span>
            {sidebarOpen && <span>退出登录</span>}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* 顶部栏 */}
        <header className='h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6'>
          <h2 className='text-lg font-semibold text-gray-900'>
            {menuItems.find(item => isActive(item.path))?.label || '管理后台'}
          </h2>
          <div className='flex items-center gap-4'>
            <span className='text-sm text-gray-600'>
              {localStorage.getItem('userType') === 'admin'
                ? '超级管理员'
                : '管理员'}
            </span>
          </div>
        </header>

        {/* 页面内容 */}
        <main className='p-6'>{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
