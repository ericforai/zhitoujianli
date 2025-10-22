import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import WorkflowTimeline, { WorkflowStep } from '../components/WorkflowTimeline';
import { useBossDelivery } from '../hooks/useBossDelivery';
import { useQRCodeLogin } from '../hooks/useQRCodeLogin';
import { authService } from '../services/authService';

/**
 * Dashboard页面 - 后台管理主页
 * ✅ 修复：创建真正的Dashboard页面，不再通过URL传递token
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 使用自定义Hooks
  const {
    showQRModal,
    qrCodeUrl,
    loginStatus,
    handleQRCodeLogin,
    closeQRModal,
    refreshQRCode,
  } = useQRCodeLogin();

  const {
    status: bossStatus,
    message: bossMessage,
    logs,
    fetchLogs,
    handleStart,
    handleStop,
  } = useBossDelivery();

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
    };

    checkAuth();
  }, [navigate]);

  // 定义工作流程步骤
  const getWorkflowSteps = (): WorkflowStep[] => {
    const isLoggedIn = loginStatus === 'success';
    const isRunning = bossStatus.isRunning;

    return [
      {
        id: 'config',
        label: '配置管理',
        icon: '⚙️',
        description: '设置投递参数和简历内容',
        status: 'completed',
        action: () => navigate('/config'),
      },
      {
        id: 'login',
        label: '扫码登录Boss',
        icon: '📱',
        description: '使用手机App扫描二维码登录',
        status: isLoggedIn ? 'completed' : 'active',
        action: handleQRCodeLogin,
      },
      {
        id: 'start',
        label: '启动自动投递',
        icon: '▶️',
        description: '开始智能投递简历',
        status: isRunning ? 'completed' : isLoggedIn ? 'active' : 'pending',
        disabled: !isLoggedIn || isRunning,
        action: handleStart,
      },
      {
        id: 'logs',
        label: '查看日志',
        icon: '📋',
        description: '监控投递状态和结果',
        status: isRunning ? 'active' : 'pending',
        action: async () => {
          await fetchLogs();
          setShowLogs(true);
        },
      },
      {
        id: 'stop',
        label: '停止投递',
        icon: '⏹️',
        description: '停止自动投递任务',
        status: isRunning ? 'active' : 'pending',
        disabled: !isRunning,
        action: handleStop,
      },
    ];
  };

  // 日志弹窗状态
  const [showLogs, setShowLogs] = useState(false);

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
            title='今日投递'
            value={bossStatus.deliveryCount || 0}
            icon='📊'
            color='blue'
          />
          <StatCard
            title='运行状态'
            value={bossStatus.isRunning ? 1 : 0}
            icon='✅'
            color='green'
          />
          <StatCard
            title='智能匹配'
            value='AI'
            icon='🤖'
            color='purple'
          />
          <StatCard
            title='持续运行'
            value='24/7'
            icon='⏰'
            color='yellow'
          />
        </div>

        {/* 工作流程时间线 */}
        <div className='mb-8'>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>🚀 智能投递流程</h2>
            <p className='text-gray-600'>按照以下步骤完成简历投递设置，让AI帮您自动投递</p>
          </div>

          <div className='bg-white rounded-lg shadow-sm p-6'>
            <WorkflowTimeline
              steps={getWorkflowSteps()}
              currentStep={bossStatus.isRunning ? 3 : loginStatus === 'success' ? 2 : 1}
            />
          </div>
        </div>

        {/* 消息提示 */}
        {bossMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            bossMessage.includes('成功')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <p className='text-sm'>{bossMessage}</p>
          </div>
        )}
      </div>

      {/* 日志弹窗 */}
      {showLogs && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>📋 投递日志</h3>
              <button
                onClick={() => setShowLogs(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                ✕
              </button>
            </div>

            <div className='bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm'>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className='mb-1'>
                    {log}
                  </div>
                ))
              ) : (
                <div className='text-gray-500'>暂无日志记录</div>
              )}
            </div>

            <div className='flex justify-end mt-4'>
              <button
                onClick={() => setShowLogs(false)}
                className='bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors'
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 二维码登录模态框 */}
      {showQRModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                扫码登录Boss直聘
              </h3>
              <button
                onClick={closeQRModal}
                className='text-gray-400 hover:text-gray-600'
              >
                ✕
              </button>
            </div>

            <div className='text-center'>
              {!qrCodeUrl && loginStatus === 'waiting' && (
                <div className='py-8'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                  <p className='text-gray-600'>正在加载二维码...</p>
                </div>
              )}

              {qrCodeUrl && (
                <div className='mb-4 flex justify-center'>
                  <img
                    src={qrCodeUrl}
                    alt='登录二维码'
                    className='border-2 border-gray-300 rounded-lg shadow-lg'
                    style={{
                      width: '400px',
                      height: '400px',
                      minWidth: '400px',
                      minHeight: '400px',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              )}

              <p
                className={`text-sm mb-4 ${
                  loginStatus === 'waiting'
                    ? 'text-gray-600'
                    : loginStatus === 'success'
                      ? 'text-green-600 font-semibold'
                      : loginStatus === 'failed'
                        ? 'text-red-600'
                        : 'text-gray-500'
                }`}
              >
                {loginStatus === 'waiting' &&
                  '请用手机Boss App或微信扫描二维码'}
                {loginStatus === 'success' && '✅ 登录成功！'}
                {loginStatus === 'failed' && '❌ 登录失败，请重试'}
                {loginStatus === 'not_started' && '正在启动登录流程...'}
              </p>

              <div className='flex gap-3 justify-center'>
                <button
                  onClick={closeQRModal}
                  className='bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors'
                >
                  取消
                </button>
                <button
                  onClick={refreshQRCode}
                  className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                >
                  刷新二维码
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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


export default Dashboard;
