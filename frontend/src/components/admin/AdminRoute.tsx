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
    console.log('📋 localStorage内容:', {
      token: !!localStorage.getItem('token'),
      authToken: !!localStorage.getItem('authToken'),
      userType: localStorage.getItem('userType'),
      allKeys: Object.keys(localStorage),
    });

    // 检查是否为管理员
    const checkAdminStatus = async () => {
      try {
        // 多次尝试获取，确保localStorage已保存
        let token =
          localStorage.getItem('authToken') || localStorage.getItem('token');
        let userType = localStorage.getItem('userType');

        // 如果第一次没获取到，等待一下再试
        if (!token || userType !== 'admin') {
          console.warn('⚠️ 第一次检查失败，等待100ms后重试...');
          await new Promise(resolve => setTimeout(resolve, 100));
          token =
            localStorage.getItem('authToken') || localStorage.getItem('token');
          userType = localStorage.getItem('userType');
        }

        console.log('🔍 AdminRoute检查:', {
          token: !!token,
          tokenLength: token?.length || 0,
          userType,
          pathname: window.location.pathname,
          allKeys: Object.keys(localStorage).filter(
            k => k.includes('token') || k.includes('Type') || k === 'userType'
          ),
        });

        // 检查token和userType
        if (!token || userType !== 'admin') {
          console.error('❌ 管理员认证失败:', {
            hasToken: !!token,
            hasAuthToken: !!localStorage.getItem('authToken'),
            hasToken2: !!localStorage.getItem('token'),
            userType,
            currentPath: window.location.pathname,
            allLocalStorage: Object.keys(localStorage).reduce((acc, k) => {
              if (k.includes('token') || k === 'userType') {
                acc[k] = localStorage.getItem(k)?.substring(0, 30) + '...';
              }
              return acc;
            }, {} as any),
          });

          // 延迟重定向，给localStorage更多时间恢复
          console.warn('⚠️ 等待500ms后再检查...');
          await new Promise(resolve => setTimeout(resolve, 500));

          // 最后一次检查
          const finalToken =
            localStorage.getItem('authToken') || localStorage.getItem('token');
          const finalUserType = localStorage.getItem('userType');

          if (!finalToken || finalUserType !== 'admin') {
            console.error('❌ 最终认证失败，将重定向到登录页');
            setIsAdmin(false);
            setIsLoading(false);
            return;
          }

          console.log('✅ 延迟检查通过，继续渲染');
        }

        // 验证token是否有效（可选，可以调用后端API验证）
        // 这里简化处理，只要token存在且userType是admin就认为合法
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
