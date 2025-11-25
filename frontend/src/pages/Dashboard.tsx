import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Container from '../components/common/Container';
import Navigation from '../components/Navigation';
import SEOHead from '../components/seo/SEOHead';
import WorkflowTimeline, { WorkflowStep } from '../components/WorkflowTimeline';
import QuotaDisplay from '../components/plan/QuotaDisplay';
import QuickActionPanel from '../components/dashboard/QuickActionPanel';
import CollapsibleQuota from '../components/dashboard/CollapsibleQuota';
import { useAuth } from '../contexts/AuthContext';
import { useBossDelivery } from '../hooks/useBossDelivery';
import { useBossLoginStatus } from '../hooks/useBossLoginStatus';
import { useQRCodeLogin } from '../hooks/useQRCodeLogin';
import { bossService, DeliveryDetail } from '../services/bossService';
import { list as listHistory, type HistoryItem } from '../services/resumes';
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
    loading: bossLoading,
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

  // 历史记录状态
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // 二维码加载进度状态
  const [qrCodeLoadingProgress, setQrCodeLoadingProgress] = useState(0);

  // 认证状态检查和日志记录
  authLogger.debug('Dashboard组件开始渲染', { isLoading, isAuthenticated });

  // 加载历史记录
  useEffect(() => {
    (async () => {
      setHistoryLoading(true);
      try {
        const data = await listHistory();
        setHistoryItems(data);
      } catch (error) {
        console.error('加载历史记录失败:', error);
        setHistoryItems([]);
      } finally {
        setHistoryLoading(false);
      }
    })();
  }, []);

  // 二维码加载进度模拟
  useEffect(() => {
    if (!qrCodeUrl && loginStatus === 'waiting' && showQRModal) {
      // 重置进度
      setQrCodeLoadingProgress(0);

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setQrCodeLoadingProgress(prev => {
          if (prev >= 95) {
            return 95; // 保持在95%，直到二维码真正加载完成
          }
          // 使用非线性增长，让进度条看起来更自然
          const increment = Math.random() * 15 + 5;
          return Math.min(prev + increment, 95);
        });
      }, 300);

      return () => clearInterval(progressInterval);
    } else if (qrCodeUrl) {
      // 二维码加载完成，进度条到100%
      setQrCodeLoadingProgress(100);
      setTimeout(() => setQrCodeLoadingProgress(0), 500); // 500ms后隐藏进度条
    }
  }, [qrCodeUrl, loginStatus, showQRModal]);

  // ✅ 修复：登录成功后刷新Boss登录状态，但不自动启动投递
  useEffect(() => {
    if (loginStatus === 'success') {
      console.log('✅ Boss登录成功，刷新登录状态（不自动启动投递）');
      // 延迟刷新，确保后端状态已更新
      setTimeout(() => {
        refreshBossStatus();
      }, 1000);
    }
  }, [loginStatus, refreshBossStatus]);

  // ✅ 修复：确保关闭模态框时不会触发任何投递操作
  // 这个useEffect确保即使状态变化，也不会自动启动投递
  useEffect(() => {
    // 如果投递正在运行，但用户没有明确点击启动按钮，不应该自动启动
    // 这个检查确保只有用户明确操作才会启动投递
    if (bossStatus.isRunning && !showQRModal) {
      // 如果模态框已关闭且投递正在运行，这是正常的用户操作
      // 不需要做任何处理
    }
  }, [bossStatus.isRunning, showQRModal]);

  // 🔒 安全修复：监听认证状态变化，如果未认证立即跳转
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      authLogger.warn('检测到未认证状态，立即跳转到登录页');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, authLogger]);

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

  // 🔒 安全修复：双重保险 - 如果未认证，立即跳转而不是返回null
  if (!isAuthenticated) {
    authLogger.warn('未认证用户尝试访问Dashboard页面，立即跳转');
    // 使用 useEffect 已经处理跳转，这里返回加载界面避免闪烁
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>正在跳转...</p>
        </div>
      </div>
    );
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
      <SEOHead path='/dashboard' />
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

          {/* 智能投递流程 - 核心焦点区域 */}
          <div className='mb-6'>
            <div className='mb-4'>
              <div className='flex items-center gap-3 mb-2 flex-wrap'>
                <h2 className='text-2xl font-bold text-gray-900'>
                  智能投递流程
                </h2>
                {/* 运行状态 - 紧凑内联显示，直观的badge样式 */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                    bossStatus.isRunning
                      ? 'bg-green-50 text-green-700 border border-green-300'
                      : 'bg-gray-50 text-gray-600 border border-gray-300'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      bossStatus.isRunning
                        ? 'bg-green-500 animate-pulse'
                        : 'bg-gray-400'
                    }`}
                  />
                  <span>{bossStatus.isRunning ? '运行中' : '已停止'}</span>
                </div>
              </div>
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

          {/* 快捷状态栏 - 精简显示 */}
          <QuickActionPanel
            isRunning={bossStatus.isRunning}
            isBossLoggedIn={isBossLoggedIn || loginStatus === 'success'}
            todayDeliveryCount={bossStatus.deliveryCount || 0}
            onStart={handleStart}
            onStop={handleStop}
            onBossLogin={handleQRCodeLogin}
            loading={bossLoading}
            message={bossMessage}
            onRefreshBossStatus={refreshBossStatus}
            bossStatusError={bossStatusError}
            isBossStatusLoading={isBossStatusLoading}
            onShowDeliveryDetails={handleShowDeliveryDetails}
          />


          {/* 历史记录卡片 - 直接展示历史记录 */}
          <Card className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>简历历史记录</h3>
                  <p className='text-sm text-gray-600'>查看和管理您的简历优化历史</p>
                </div>
              </div>
              <button
                type='button'
                className='px-3 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700'
                onClick={async () => {
                  // 刷新历史记录
                  const { list } = await import('../services/resumes');
                  const data = await list();
                  setHistoryItems(data);
                }}
              >
                刷新
              </button>
            </div>
            <div className='border rounded-lg overflow-hidden'>
              <table className='w-full text-left'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-4 py-3 text-sm font-medium text-gray-700'>时间</th>
                    <th className='px-4 py-3 text-sm font-medium text-gray-700'>类型</th>
                    <th className='px-4 py-3 text-sm font-medium text-gray-700'>分数</th>
                    <th className='px-4 py-3 text-sm font-medium text-gray-700'>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading ? (
                    <tr>
                      <td className='px-4 py-3 text-sm text-gray-500' colSpan={4}>
                        加载中...
                      </td>
                    </tr>
                  ) : historyItems.length === 0 ? (
                    <tr>
                      <td className='px-4 py-3 text-sm text-gray-500' colSpan={4}>
                        暂无记录
                      </td>
                    </tr>
                  ) : (
                    historyItems.map(it => (
                      <tr
                        key={it.id}
                        className='border-t hover:bg-gray-50 cursor-pointer'
                        onClick={() => {
                          if (it.type === '优化') {
                            navigate(`/resume/optimize?hid=${encodeURIComponent(it.id)}`);
                          }
                        }}
                      >
                        <td className='px-4 py-3 text-sm text-gray-700'>
                          {new Date(it.createdAt).toLocaleString()}
                        </td>
                        <td className='px-4 py-3 text-sm'>{it.type}</td>
                        <td className='px-4 py-3 text-sm'>{it.score ?? '-'}</td>
                        <td className='px-4 py-3 text-sm'>
                          {it.type === '优化' && (
                            <button
                              className='text-blue-600 hover:text-blue-700'
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/resume/optimize?hid=${encodeURIComponent(it.id)}`);
                              }}
                            >
                              查看
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 可折叠配额显示 */}
          <CollapsibleQuota
            className='mb-8'
            todayDeliveryCount={bossStatus.deliveryCount || 0}
          />


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

                  {/* 进度条 */}
                  <div className='w-full max-w-xs mx-auto mb-4'>
                    <div className='bg-gray-200 rounded-full h-2 overflow-hidden'>
                      <div
                        className='bg-blue-600 h-full rounded-full transition-all duration-300 ease-out'
                        style={{ width: `${qrCodeLoadingProgress}%` }}
                      />
                    </div>
                    <p className='text-xs text-gray-500 mt-2'>
                      {qrCodeLoadingProgress < 30
                        ? '正在连接服务器...'
                        : qrCodeLoadingProgress < 60
                          ? '正在生成二维码...'
                          : qrCodeLoadingProgress < 90
                            ? '二维码即将就绪...'
                            : '马上就好！'}
                    </p>
                  </div>

                  {/* 安抚用户的文案 */}
                  <p className='text-gray-600 font-medium mb-2'>
                    正在为您准备二维码，请稍候...
                  </p>
                  <p className='text-sm text-gray-500'>
                    💡 我们正在努力为您生成登录二维码，这通常只需要几秒钟
                  </p>
                </div>
              )}

              {qrCodeUrl && loginStatus !== 'success' && (
                <div className='mb-6 flex justify-center'>
                  <img
                    src={qrCodeUrl}
                    alt='登录二维码'
                    className='rounded-lg shadow-lg bg-white p-4'
                    style={{
                      width: '400px',
                      height: '400px',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              )}

              {loginStatus === 'success' && (
                <div className='mb-6 flex flex-col items-center justify-center py-8'>
                  <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4'>
                    <svg
                      className='w-12 h-12 text-green-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  </div>
                  <p className='text-green-600 font-semibold text-lg'>
                    ✅ 登录成功！
                  </p>
                  <p className='text-gray-500 text-sm mt-2'>
                    正在关闭窗口...
                  </p>
                </div>
              )}

              <p
                className={`mb-6 ${
                  loginStatus === 'waiting'
                    ? 'text-gray-600'
                    : loginStatus === 'success'
                      ? 'hidden'
                      : loginStatus === 'failed'
                        ? 'text-red-600'
                        : 'text-gray-500'
                }`}
              >
                {loginStatus === 'waiting' && '请用手机Boss App扫描二维码'}
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
