import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  // 检查用户是否已登录
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 获取用户信息
  const userInfo = authService.getCachedUser();
  
  // 检查用户是否有管理员权限
  // 这里可以根据实际需求调整权限检查逻辑
  const isAdmin = userInfo?.userId === '68dba0e3d9c27ebb0d93aa42'; // 预设的超级管理员ID

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">访问被拒绝</h2>
          <p className="text-gray-600 mb-6">您没有访问管理员控制台的权限。</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;