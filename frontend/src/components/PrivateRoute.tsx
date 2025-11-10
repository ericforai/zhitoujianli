/**
 * 路由守卫组件 - 增强版
 *
 * 🔧 修复：使用AuthContext统一管理认证状态
 * 🔒 安全修复：确保认证状态变化时立即响应并跳转
 * - 不再直接使用authService.isAuthenticated()
 * - 使用AuthContext的认证状态
 * - 保存原始访问路径，登录后返回
 * - 添加加载状态显示
 * - 立即响应认证状态变化
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-10
 */

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';

const routeLogger = logger.createChild('PrivateRoute');

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

  // 🔒 安全修复：监听认证状态变化，确保立即响应
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      routeLogger.warn('检测到未认证状态，立即跳转到登录页', {
        path: location.pathname,
      });
    }
  }, [isAuthenticated, isLoading, location.pathname]);

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

  // 🔒 安全修复：未认证时，立即跳转到登录页，使用 replace 避免返回
  if (!isAuthenticated) {
    routeLogger.info('未认证用户访问受保护路由，跳转到登录页', {
      from: location.pathname,
    });
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // 已登录，渲染子组件
  return <>{children}</>;
};

export default PrivateRoute;
