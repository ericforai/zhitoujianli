import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Container from '../components/common/Container';
import Navigation from '../components/Navigation';
import WorkflowTimeline, { WorkflowStep } from '../components/WorkflowTimeline';
import { useAuth } from '../contexts/AuthContext';
import { useBossDelivery } from '../hooks/useBossDelivery';
import { useBossLoginStatus } from '../hooks/useBossLoginStatus';
import { useQRCodeLogin } from '../hooks/useQRCodeLogin';
import { bossService, DeliveryDetail } from '../services/bossService';
import logger from '../utils/logger';

/**
 * Dashboard页面 - 后台管理主页
 * ✅ 修复：创建真正的Dashboard页面，不再通过URL传递token
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  // 创建认证日志记录器
  const authLogger = logger.createChild('Dashboard:Auth');

  // 使用自定义Hooks - 必须在组件顶层调用
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

  // Boss登录状态检查
  const {
    isLoggedIn: isBossLoggedIn,
    isLoading: isBossStatusLoading,
    error: bossStatusError,
    refreshStatus: refreshBossStatus,
  } = useBossLoginStatus();

  // 日志弹窗状态
  const [showLogs, setShowLogs] = useState(false);

  // 投递详情弹窗状态
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // 认证状态检查和日志记录
  authLogger.debug('Dashboard组件开始渲染', { isLoading, isAuthenticated });

  // 在认证完成前显示加载界面
  if (isLoading) {
    authLogger.debug('等待认证状态确认...');
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>加载中...</p>
        </div>
      </div>
    );
  }

  // 双重保险：理论上PrivateRoute已拦截，但作为防御性编程
  if (!isAuthenticated) {
    authLogger.warn('未认证用户尝试访问Dashboard页面');
    return null;
  }

  // 认证确认，记录日志
  authLogger.info('Dashboard认证检查通过，渲染组件', {
    userId: user?.userId,
    email: user?.email,
  });

  // 记录数据加载开始
  authLogger.debug('开始加载Dashboard数据');

  // 获取今日投递详情
  const handleShowDeliveryDetails = async () => {
    setLoadingDetails(true);
    setShowDeliveryDetails(true);
    try {
      const response = await bossService.getTodayDeliveryDetails();
      if (response.success && response.data) {
        setDeliveryDetails(response.data.deliveries);
      } else {
        setDeliveryDetails([]);
      }
    } catch (error) {
      console.error('获取投递详情失败:', error);
      setDeliveryDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  // 定义工作流程步骤
  const getWorkflowSteps = (): WorkflowStep[] => {
    const isLoggedIn = loginStatus === 'success';
    const isRunning = bossStatus.isRunning;

    // 根据Boss登录状态动态显示
    const bossLoginStep: WorkflowStep = {
      id: 'login',
      label: isBossLoggedIn ? '已登录Boss' : '扫码登录Boss',
      icon: isBossLoggedIn ? '✅' : '📱',
      description: isBossLoggedIn
        ? 'Boss账号已登录，可直接启动投递'
        : '使用手机App扫描二维码登录',
      status: isBossLoggedIn ? 'completed' : 'active',
      action: isBossLoggedIn ? undefined : handleQRCodeLogin,
    };

    return [
      {
        id: 'config',
        label: '配置管理',
        icon: '⚙️',
        description: '设置投递参数和简历内容',
        status: 'completed',
        action: () => navigate('/config'),
      },
      bossLoginStep,
      {
        id: 'start',
        label: '启动自动投递',
        icon: '▶️',
        description: '开始智能投递简历',
        status: isRunning
          ? 'completed'
          : isBossLoggedIn || isLoggedIn
            ? 'active'
            : 'pending',
        disabled: !(isBossLoggedIn || isLoggedIn) || isRunning,
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

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navigation />

      {/* 主内容区 */}
      <Container size='xl' paddingY>
        <div className='mt-16'>
          {/* 欢迎标题 */}
          <div className='mb-8'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>
                  欢迎回来，{user?.username || user?.email || '用户'}！
                </h1>
                <p className='mt-2 text-gray-600'>
                  这是您的工作台，管理您的求职信息
                </p>
              </div>

              {/* 返回主页按钮 */}
              <Button as='a' href='/' variant='ghost' size='sm'>
                ← 返回主页
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
            <StatCard
              title='今日投递'
              value={bossStatus.deliveryCount || 0}
              icon='📊'
              color='blue'
              onClick={handleShowDeliveryDetails}
              clickable
            />
            <StatCard
              title='运行状态'
              value={bossStatus.isRunning ? '运行中' : '已停止'}
              icon='✅'
              color='green'
            />
            <StatCard title='智能匹配' value='AI' icon='🤖' color='blue' />
            <StatCard title='持续运行' value='24/7' icon='⏰' color='blue' />
          </div>

          {/* 工作流程时间线 */}
          <div className='mb-8'>
            <div className='mb-6'>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                智能投递流程
              </h2>
              <p className='text-gray-600'>按照以下步骤完成简历投递设置</p>
            </div>

            <Card padding='lg'>
              <WorkflowTimeline
                steps={getWorkflowSteps()}
                currentStep={
                  bossStatus.isRunning
                    ? 3
                    : isBossLoggedIn || loginStatus === 'success'
                      ? 2
                      : 1
                }
              />
            </Card>
          </div>

          {/* Boss登录状态显示 */}
          {!isBossStatusLoading && (
            <Card
              className={`mb-6 ${
                isBossLoggedIn
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <span className='text-lg mr-2'>
                    {isBossLoggedIn ? '✅' : '⚠️'}
                  </span>
                  <p className='text-sm font-medium text-gray-900'>
                    {isBossLoggedIn ? 'Boss账号已登录' : '需要扫码登录Boss'}
                  </p>
                </div>
                <Button onClick={refreshBossStatus} variant='ghost' size='sm'>
                  刷新状态
                </Button>
              </div>
              {bossStatusError && (
                <p className='text-xs mt-2 text-red-600'>
                  检查状态失败: {bossStatusError}
                </p>
              )}
            </Card>
          )}

          {/* 消息提示 */}
          {bossMessage && (
            <Card
              className={`mb-6 ${
                bossMessage.includes('成功')
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <p className='text-sm text-gray-900'>{bossMessage}</p>
            </Card>
          )}
        </div>
      </Container>

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

      {/* 二维码登录模态框 - 简约版 */}
      {showQRModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-8 max-w-md w-full'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-semibold text-gray-900'>
                扫码登录Boss直聘
              </h3>
              <button
                onClick={closeQRModal}
                className='text-gray-400 hover:text-gray-600 text-2xl'
              >
                ✕
              </button>
            </div>

            <div className='text-center'>
              {!qrCodeUrl && loginStatus === 'waiting' && (
                <div className='py-12'>
                  <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6'></div>
                  <p className='text-gray-600'>正在加载二维码...</p>
                </div>
              )}

              {qrCodeUrl && (
                <div className='mb-6 flex justify-center'>
                  <img
                    src={qrCodeUrl}
                    alt='登录二维码'
                    className='rounded-lg shadow-lg'
                    style={{
                      width: '300px',
                      height: '300px',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              )}

              <p
                className={`mb-6 ${
                  loginStatus === 'waiting'
                    ? 'text-gray-600'
                    : loginStatus === 'success'
                      ? 'text-green-600 font-semibold'
                      : loginStatus === 'failed'
                        ? 'text-red-600'
                        : 'text-gray-500'
                }`}
              >
                {loginStatus === 'waiting' && '请用手机Boss App扫描二维码'}
                {loginStatus === 'success' && '✅ 登录成功！'}
                {loginStatus === 'failed' && '❌ 登录失败，请重试'}
                {loginStatus === 'not_started' && '正在启动登录流程...'}
              </p>

              <div className='flex gap-3 justify-center'>
                <Button onClick={refreshQRCode} variant='primary'>
                  刷新二维码
                </Button>
                <Button onClick={closeQRModal} variant='ghost'>
                  取消
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 今日投递详情弹窗 */}
      {showDeliveryDetails && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>📊 今日投递详情</h3>
              <button
                onClick={() => setShowDeliveryDetails(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                ✕
              </button>
            </div>

            <div className='overflow-y-auto max-h-[60vh]'>
              {loadingDetails ? (
                <div className='flex justify-center items-center py-12'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
                </div>
              ) : deliveryDetails.length > 0 ? (
                <div className='space-y-3'>
                  {deliveryDetails.map((delivery, index) => (
                    <div
                      key={index}
                      className='bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <h4 className='font-semibold text-gray-900 mb-1'>
                            {delivery.position}
                          </h4>
                          <p className='text-sm text-gray-600 mb-1'>
                            🏢 {delivery.company}
                          </p>
                          <p className='text-xs text-gray-500'>
                            ⏰ {delivery.time}
                          </p>
                        </div>
                        <div className='ml-4'>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                            已投递
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-12'>
                  <div className='text-4xl mb-4'>📭</div>
                  <p className='text-gray-600'>今日暂无投递记录</p>
                </div>
              )}
            </div>

            <div className='flex justify-between items-center mt-4 pt-4 border-t'>
              <div className='text-sm text-gray-600'>
                共 {deliveryDetails.length} 条投递记录
              </div>
              <button
                onClick={() => setShowDeliveryDetails(false)}
                className='bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors'
              >
                关闭
              </button>
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
  color: 'blue' | 'green';
  onClick?: () => void;
  clickable?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  onClick,
  clickable,
}) => {
  const cardClass = clickable
    ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200'
    : '';

  return (
    <div onClick={onClick} className={cardClass}>
      <Card>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-600 mb-1'>{title}</p>
            <p className='text-2xl font-bold text-gray-900'>{value}</p>
          </div>
          <div className='text-3xl'>{icon}</div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
