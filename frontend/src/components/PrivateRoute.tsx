/**
 * 路由守卫组件 - 增强版
 *
 * 🔧 修复：使用AuthContext统一管理认证状态
 * - 不再直接使用authService.isAuthenticated()
 * - 使用AuthContext的认证状态
 * - 保存原始访问路径，登录后返回
 * - 添加加载状态显示
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-10
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * 私有路由组件
 *
 * 使用方法：
 * <PrivateRoute>
 *   <Dashboard />
 * </PrivateRoute>
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 正在加载认证状态时，显示加载界面
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>加载中...</p>
        </div>
      </div>
    );
  }

  // 未认证时，跳转到登录页，并保存原始路径
  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // 已登录，渲染子组件
  return <>{children}</>;
};

export default PrivateRoute;
