import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { authService } from '../services/authService';

/**
 * Dashboard页面 - 后台管理主页
 * ✅ 修复：创建真正的Dashboard页面，不再通过URL传递token
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    appliedJobs: 0,
    pendingJobs: 0,
    successRate: 0,
  });

  useEffect(() => {
    // 检查登录状态
    const checkAuth = () => {
      if (!authService.isAuthenticated()) {
        navigate('/login', { replace: true });
        return;
      }

      const userData = authService.getCachedUser();
      setUser(userData);
      setLoading(false);

      // 加载统计数据
      loadStats();
    };

    checkAuth();
  }, [navigate]);

  const loadStats = async () => {
    try {
      // TODO: 从API加载实际统计数据
      setStats({
        totalJobs: 150,
        appliedJobs: 45,
        pendingJobs: 105,
        successRate: 30,
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  // const handleLogout = () => {
  //   authService.logout();
  //   navigate('/login');
  // };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navigation />

      {/* 主内容区 */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16'>
        {/* 欢迎标题 */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>
            欢迎回来，{user?.username || user?.email || '用户'}！
          </h1>
          <p className='mt-2 text-gray-600'>这是您的工作台，管理您的求职信息</p>
        </div>

        {/* 统计卡片 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <StatCard
            title='总岗位数'
            value={stats.totalJobs}
            icon='📊'
            color='blue'
          />
          <StatCard
            title='已投递'
            value={stats.appliedJobs}
            icon='✅'
            color='green'
          />
          <StatCard
            title='待处理'
            value={stats.pendingJobs}
            icon='⏳'
            color='yellow'
          />
          <StatCard
            title='成功率'
            value={`${stats.successRate}%`}
            icon='📈'
            color='purple'
          />
        </div>

        {/* 功能卡片 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <FeatureCard
            title='简历管理'
            description='上传和管理您的简历'
            icon='📄'
            link='/resume'
          />
          <FeatureCard
            title='岗位投递'
            description='智能匹配并投递岗位'
            icon='🎯'
            link='/resume-delivery'
          />
          <FeatureCard
            title='投递记录'
            description='查看投递历史和状态'
            icon='📋'
            link='/applications'
          />
          <FeatureCard
            title='AI助手'
            description='AI优化简历和打招呼语'
            icon='🤖'
            link='/ai-assistant'
          />
          <FeatureCard
            title='账户设置'
            description='管理您的个人信息'
            icon='⚙️'
            link='/settings'
          />
          <FeatureCard
            title='帮助中心'
            description='查看使用指南和FAQ'
            icon='❓'
            link='/help'
          />
        </div>

        {/* 最近活动 */}
        <div className='mt-8 bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-4'>最近活动</h2>
          <div className='space-y-4'>
            <ActivityItem
              action='投递简历'
              target='前端开发工程师 - 字节跳动'
              time='2小时前'
              status='success'
            />
            <ActivityItem
              action='更新简历'
              target='个人简历.pdf'
              time='5小时前'
              status='info'
            />
            <ActivityItem
              action='收到回复'
              target='React开发工程师 - 腾讯'
              time='1天前'
              status='success'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 统计卡片组件
interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='mt-2 text-3xl font-semibold text-gray-900'>{value}</p>
        </div>
        <div className={`text-4xl ${colorClasses[color]} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// 功能卡片组件
interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  link,
}) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(link)}
      className='bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow'
    >
      <div className='text-4xl mb-4'>{icon}</div>
      <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
      <p className='text-gray-600'>{description}</p>
    </div>
  );
};

// 活动项组件
interface ActivityItemProps {
  action: string;
  target: string;
  time: string;
  status: 'success' | 'info' | 'warning';
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  action,
  target,
  time,
  status,
}) => {
  const statusClasses = {
    success: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className='flex items-center justify-between py-3 border-b last:border-b-0'>
      <div className='flex items-center space-x-4'>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status]}`}
        >
          {action}
        </span>
        <span className='text-gray-900'>{target}</span>
      </div>
      <span className='text-gray-500 text-sm'>{time}</span>
    </div>
  );
};

export default Dashboard;
