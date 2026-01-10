import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BossServerLogin from '../components/BossServerLogin';
import Navigation from '../components/Navigation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Container from '../components/common/Container';
import CollapsibleQuota from '../components/dashboard/CollapsibleQuota';
import DeliveryControl from '../components/dashboard/DeliveryControl';
import SEOHead from '../components/seo/SEOHead';
import { useAuth } from '../contexts/AuthContext';
import { useBossDelivery } from '../hooks/useBossDelivery';
import { useBossLoginStatus } from '../hooks/useBossLoginStatus';
import { DeliveryDetail, bossService } from '../services/bossService';
import { list as listHistory, type HistoryItem } from '../services/resumes';
import { localAgentService } from '../services/localAgentService';
import logger from '../utils/logger';

// ✅ 修复：将authLogger移到组件外部，避免每次渲染创建新对象导致useEffect无限循环
const authLogger = logger.createChild('Dashboard:Auth');

/**
 * Dashboard页面 - 后台管理主页
 * ✅ 修复：使用手动Cookie上传替代服务器端二维码扫码
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Boss登录弹窗状态
  const [showBossLoginModal, setShowBossLoginModal] = useState(false);

  const {
    status: bossStatus,
    loading: bossLoading,
    message: bossMessage,
    logs,
    fetchLogs,
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

  // 认证状态检查和日志记录
  authLogger.debug('Dashboard组件开始渲染', { isLoading, isAuthenticated });

  // 处理Agent回调 - 自动生成Token并回调给本地Agent
  useEffect(() => {
    const agentCallback = searchParams.get('agent_callback');
    if (agentCallback && isAuthenticated) {
      (async () => {
        try {
          authLogger.info('检测到Agent回调请求，正在生成Token...');
          const result = await localAgentService.generateToken();

          // 构建回调URL
          const callbackUrl = new URL(agentCallback);
          callbackUrl.searchParams.set('token', result.token);
          callbackUrl.searchParams.set('server', result.serverUrl);

          // 跳转到回调URL
          window.location.href = callbackUrl.toString();
        } catch (error) {
          console.error('生成Agent Token失败:', error);
          // 清除URL参数
          navigate('/dashboard', { replace: true });
        }
      })();
    }
  }, [searchParams, isAuthenticated, navigate]); // ✅ 修复：移除authLogger依赖，因为它是模块级常量

  // 打开Boss登录弹窗
  const handleBossLogin = () => {
    setShowBossLoginModal(true);
  };

  // Boss登录成功回调
  const handleBossLoginSuccess = () => {
    setShowBossLoginModal(false);
    refreshBossStatus(); // 刷新登录状态
  };

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

  // 🔒 安全修复：监听认证状态变化，如果未认证立即跳转
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      logger.createChild('Dashboard:Auth').warn('检测到未认证状态，立即跳转到登录页');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]); // ✅ 修复：移除authLogger依赖，避免无限循环

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

          {/* 智能投递控制面板 - 核心焦点区域 */}
          <div className='mb-6'>
            <DeliveryControl
              isBossLoggedIn={isBossLoggedIn}
              onBossLogin={handleBossLogin}
            />
          </div>

          {/* 快捷操作：查看日志、投递详情 */}
          <div className='mb-6 flex gap-4'>
            <button
              type='button'
              onClick={async () => {
                await fetchLogs();
                setShowLogs(true);
              }}
              className='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm'
            >
              📋 查看投递日志
            </button>
            <button
              type='button'
              onClick={handleShowDeliveryDetails}
              className='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm'
            >
              📊 今日投递详情 ({bossStatus.deliveryCount || 0})
            </button>
            <button
              type='button'
              onClick={() => navigate('/config')}
              className='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm'
            >
              ⚙️ 配置管理
            </button>
          </div>

          {/* 历史记录卡片 */}
          <Card className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <svg
                    className='w-6 h-6 text-blue-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    简历历史记录
                  </h3>
                  <p className='text-sm text-gray-600'>
                    查看和管理您的简历优化历史
                  </p>
                </div>
              </div>
              <button
                type='button'
                className='px-3 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700'
                onClick={async () => {
                  const data = await listHistory();
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
                    <th className='px-4 py-3 text-sm font-medium text-gray-700'>
                      时间
                    </th>
                    <th className='px-4 py-3 text-sm font-medium text-gray-700'>
                      类型
                    </th>
                    <th className='px-4 py-3 text-sm font-medium text-gray-700'>
                      分数
                    </th>
                    <th className='px-4 py-3 text-sm font-medium text-gray-700'>
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading ? (
                    <tr>
                      <td
                        className='px-4 py-3 text-sm text-gray-500'
                        colSpan={4}
                      >
                        加载中...
                      </td>
                    </tr>
                  ) : historyItems.length === 0 ? (
                    <tr>
                      <td
                        className='px-4 py-3 text-sm text-gray-500'
                        colSpan={4}
                      >
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
                            navigate(
                              `/resume/optimize?hid=${encodeURIComponent(it.id)}`
                            );
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
                              onClick={e => {
                                e.stopPropagation();
                                navigate(
                                  `/resume/optimize?hid=${encodeURIComponent(it.id)}`
                                );
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

      {/* Boss登录弹窗 - 服务器端扫码登录 */}
      {showBossLoginModal && (
        <BossServerLogin
          onSuccess={handleBossLoginSuccess}
          onCancel={() => setShowBossLoginModal(false)}
        />
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

export default Dashboard;
