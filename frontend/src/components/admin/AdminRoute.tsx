/**
 * 管理员路由保护组件
 * 检查用户是否为管理员，如果不是则重定向到登录页
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-31
 */

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 AdminRoute组件已加载，开始检查管理员状态');
    console.log('📍 当前路径:', window.location.pathname);

    // 🔧 修复：简化检查逻辑，避免循环
    const checkAdminStatus = () => {
      try {
        const token =
          localStorage.getItem('authToken') || localStorage.getItem('token');
        const userType = localStorage.getItem('userType');

        console.log('🔍 AdminRoute检查:', {
          hasToken: !!token,
          userType,
          pathname: window.location.pathname,
        });

        // 检查token和userType
        if (!token || userType !== 'admin') {
          console.error('❌ 管理员认证失败，重定向到登录页');
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        console.log('✅ 管理员认证通过，渲染子组件');
        setIsAdmin(true);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ 检查管理员状态失败:', error);
        setIsAdmin(false);
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  console.log('🔄 AdminRoute渲染状态:', { isLoading, isAdmin });

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
          <p className='mt-4 text-gray-600'>检查管理员权限...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    console.warn('❌ AdminRoute: 认证失败，重定向到登录页');
    return <Navigate to='/login' replace />;
  }

  console.log('✅ AdminRoute: 认证通过，渲染管理后台');
  return <>{children}</>;
};

export default AdminRoute;
