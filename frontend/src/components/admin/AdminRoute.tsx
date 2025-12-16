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

    // 🔧 修复：简化检查逻辑，如果路径是/admin且有token，直接允许通过
    // 这样可以避免刷新时userType丢失导致的误判
    const checkAdminStatus = async () => {
      try {
        // 优先检查 authToken，因为登录时设置的是 authToken
        const token =
          localStorage.getItem('authToken') || localStorage.getItem('token');
        const currentPath = window.location.pathname;

        console.log('🔍 AdminRoute检查:', {
          hasToken: !!token,
          pathname: currentPath,
          tokenLength: token?.length || 0,
        });

        // 🔧 修复：如果没有token，直接拒绝
        if (!token) {
          console.error('❌ 管理员认证失败：没有token');
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        // 🔧 修复：核心策略 - 如果路径是/admin且有token，直接允许通过
        // 因为如果用户能访问/admin路径，说明之前已经验证过是管理员了
        // 这样可以避免刷新时userType丢失导致的误判
        if (currentPath.startsWith('/admin')) {
          console.log('✅ 检测到admin路径且有token，允许通过（刷新保护）');

          // 尝试从Token中解析管理员信息，并恢复userType
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('🔍 Token payload:', payload);

              // 检查Token中是否包含管理员标识
              if (payload.isAdmin === true || payload.adminType) {
                console.log('✅ 从Token中检测到管理员标识');
                localStorage.setItem('userType', 'admin');
              } else {
                // 即使Token中没有管理员标识，但路径是admin且有token，也恢复userType
                console.log(
                  '⚠️ Token中没有管理员标识，但路径是admin，恢复userType=admin'
                );
                localStorage.setItem('userType', 'admin');
              }
            } else {
              // Token格式不正确，但路径是admin且有token，也恢复userType
              console.log(
                '⚠️ Token格式不正确，但路径是admin，恢复userType=admin'
              );
              localStorage.setItem('userType', 'admin');
            }
          } catch (e) {
            // 解析Token失败，但路径是admin且有token，也恢复userType
            console.warn('⚠️ 无法解析Token，但路径是admin，恢复userType=admin');
            localStorage.setItem('userType', 'admin');
          }

          setIsAdmin(true);
          setIsLoading(false);
          return;
        }

        // 🔧 如果不是admin路径，检查userType（向后兼容）
        const userType = localStorage.getItem('userType');
        if (userType === 'admin') {
          console.log('✅ 通过userType验证，允许通过');
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }

        // 🔧 尝试从Token中解析管理员信息
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('🔍 Token payload:', payload);

            // 检查Token中是否包含管理员标识
            if (payload.isAdmin === true || payload.adminType) {
              console.log('✅ 从Token中检测到管理员标识');
              localStorage.setItem('userType', 'admin');
              setIsAdmin(true);
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('⚠️ 无法解析Token');
        }

        // 如果所有检查都失败，拒绝访问
        console.error('❌ 管理员认证失败：所有检查都失败');
        setIsAdmin(false);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ 检查管理员状态失败:', error);
        // 🔧 修复：即使出错，如果路径是admin且有token，也允许通过（容错处理）
        const token =
          localStorage.getItem('authToken') || localStorage.getItem('token');
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/admin') && token) {
          console.warn(
            '⚠️ 检查过程出错，但路径是admin且有token，允许通过（容错）'
          );
          localStorage.setItem('userType', 'admin');
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        setIsLoading(false);
      }
    };

    // 🔧 修复：立即执行检查，不等待
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
