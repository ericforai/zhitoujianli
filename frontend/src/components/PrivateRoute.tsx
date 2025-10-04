/**
 * 路由守卫组件
 *
 * 用于保护需要登录才能访问的路由
 * 如果用户未登录，自动重定向到登录页
 *
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

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
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // 未登录，重定向到登录页
    // replace=true 表示替换历史记录，防止用户点击后退回到受保护页面
    return <Navigate to='/login' replace />;
  }

  // 已登录，渲染子组件
  return <>{children}</>;
};

export default PrivateRoute;
