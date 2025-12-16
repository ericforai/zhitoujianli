/**
 * 管理员仪表盘页面
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-31
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import config from '../config/environment';

interface DashboardData {
  totalUsers?: number;
  todayNewUsers?: number;
  totalLogins?: number;
  todayLogins?: number;
  activeUsers?: number;
  [key: string]: any;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('📊 AdminDashboard组件开始加载');
    console.log('📍 当前URL:', window.location.href);
    console.log('📍 当前路径:', window.location.pathname);

    // 诊断：检查管理员认证状态
    const token =
      localStorage.getItem('authToken') || localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    console.log('📊 AdminDashboard加载:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      userType,
      pathname: window.location.pathname,
      localStorageKeys: Object.keys(localStorage).filter(
        k => k.includes('token') || k.includes('Type') || k === 'userType'
      ),
      allLocalStorage: Object.keys(localStorage).reduce((acc, k) => {
        if (k.includes('token') || k === 'userType') {
          acc[k] = localStorage.getItem(k)?.substring(0, 30) + '...';
        }
        return acc;
      }, {} as any),
    });

    // 🔧 修复：移除重复的权限检查，因为AdminRoute已经处理了
    // 如果到达这里，说明AdminRoute已经验证通过
    // 只需要确保有token即可，userType的检查由AdminRoute负责

    if (!token) {
      console.error('❌ AdminDashboard: 没有token，等待AdminRoute处理');
      // 不在这里重定向，让AdminRoute处理
      return;
    }

    // 🔧 修复：如果userType不是admin，尝试恢复
    if (userType !== 'admin') {
      console.warn('⚠️ AdminDashboard: userType不是admin，尝试恢复...');
      // 尝试从Token中解析
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          if (payload.isAdmin === true || payload.adminType) {
            localStorage.setItem('userType', 'admin');
            console.log('✅ 已从Token恢复userType=admin');
          }
        }
      } catch (e) {
        console.warn('⚠️ 无法从Token恢复，等待AdminRoute处理');
      }
      // 不在这里重定向，让AdminRoute处理
      return;
    }

    console.log('✅ AdminDashboard: 认证通过，开始获取数据');
    fetchDashboardData();

    // 🔧 修复：监听用户删除事件，自动刷新仪表盘数据
    const handleUsersChanged = () => {
      console.log('📊 收到用户变更事件，刷新仪表盘数据');
      fetchDashboardData();
    };

    window.addEventListener('adminUsersChanged', handleUsersChanged);

    // 清理事件监听器
    return () => {
      window.removeEventListener('adminUsersChanged', handleUsersChanged);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiBaseUrl}/admin/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setDashboardData(result.data);
      } else {
        setError(result.message || '获取仪表盘数据失败');
      }
    } catch (err: any) {
      console.error('获取仪表盘数据失败:', err);
      setError(err.message || '获取仪表盘数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
            <p className='mt-4 text-gray-600'>加载中...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700'>
          {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className='space-y-6'>
        <h1 className='text-2xl font-bold text-gray-900'>仪表盘</h1>

        {/* 统计卡片 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <StatCard
            title='总用户数'
            value={dashboardData?.totalUsers || 0}
            icon='👥'
            color='blue'
            onClick={() => navigate('/admin/users')}
          />
          <StatCard
            title='今日新增'
            value={dashboardData?.todayNewUsers || 0}
            icon='📈'
            color='green'
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              navigate(`/admin/users?date=${today}`);
            }}
          />
          <StatCard
            title='总登录次数'
            value={dashboardData?.totalLogins || 0}
            icon='🔐'
            color='purple'
            onClick={() => navigate('/admin/login-logs')}
          />
          <StatCard
            title='今日登录'
            value={dashboardData?.todayLogins || 0}
            icon='📊'
            color='orange'
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              navigate(`/admin/login-logs?date=${today}`);
            }}
          />
        </div>

        {/* 详细信息 */}
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>系统概览</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='p-4 bg-gray-50 rounded-lg'>
              <p className='text-sm text-gray-600'>活跃用户</p>
              <p className='text-2xl font-bold text-gray-900'>
                {dashboardData?.activeUsers || 0}
              </p>
            </div>
            <div className='p-4 bg-gray-50 rounded-lg'>
              <p className='text-sm text-gray-600'>系统状态</p>
              <p className='text-2xl font-bold text-green-600'>运行中</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  onClick,
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow border ${colorClasses[color]} p-6 hover:shadow-lg transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium opacity-75'>{title}</p>
          <p className='text-3xl font-bold mt-2'>{value.toLocaleString()}</p>
          {onClick && (
            <p className='text-xs text-gray-500 mt-1'>点击查看详情 →</p>
          )}
        </div>
        <span className='text-4xl'>{icon}</span>
      </div>
    </div>
  );
};

export default AdminDashboard;
