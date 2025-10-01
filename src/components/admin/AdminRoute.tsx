import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      // 直接检查预设的超级管理员
      const response = await fetch('/api/admin/test-admin');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.testIsAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          setError('您没有访问管理员控制台的权限');
        }
      } else {
        setIsAdmin(false);
        setError('无法验证管理员权限');
      }
    } catch (err) {
      setIsAdmin(false);
      setError('系统错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSuperAdmin = async () => {
    try {
      const response = await fetch('/api/admin/init-super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: '68dba0e3d9c27ebb0d93aa42',
          remarks: '通过管理员页面初始化'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('超级管理员初始化成功！\n用户ID: ' + result.data.userId + '\n管理员类型: ' + result.data.adminType);
          // 重新检查权限
          checkAdminStatus();
        } else {
          alert('初始化失败: ' + result.message);
        }
      } else {
        alert('初始化失败，请稍后重试');
      }
    } catch (err) {
      console.error('初始化超级管理员错误:', err);
      alert('初始化过程中发生错误');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在检查管理员权限...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">访问被拒绝</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              如果您是系统管理员，可以尝试初始化超级管理员账户：
            </p>
            <button
              onClick={initializeSuperAdmin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              初始化超级管理员
            </button>
            <p className="text-xs text-gray-400">
              这将为用户ID: 68dba0e3d9c27ebb0d93aa42 初始化超级管理员权限
            </p>
          </div>
          
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 text-blue-600 hover:text-blue-800 underline"
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