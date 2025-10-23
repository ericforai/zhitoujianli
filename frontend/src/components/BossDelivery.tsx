import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBossDelivery } from '../hooks/useBossDelivery';
import { useBossLoginStatus } from '../hooks/useBossLoginStatus';
import { useQRCodeLogin } from '../hooks/useQRCodeLogin';
import logger from '../utils/logger';
import Navigation from './Navigation';
import WorkflowTimeline, { WorkflowStep } from './WorkflowTimeline';

/**
 * Boss直聘投递组件 - 优化版UI
 * 集成工作流程时间线和现代化设计
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-22
 */

const BossDelivery: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showLogs, setShowLogs] = useState(false);

  // 创建认证日志记录器
  const authLogger = logger.createChild('BossDelivery:Auth');

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
    message,
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

  // 认证状态检查和日志记录
  authLogger.debug('组件开始渲染', { isLoading, isAuthenticated });

  // 在认证完成前显示加载界面
  if (isLoading) {
    authLogger.debug('等待认证状态确认...');
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>加载中...</p>
        </div>
      </div>
    );
  }

  // 双重保险：理论上PrivateRoute已拦截，但作为防御性编程
  if (!isAuthenticated) {
    authLogger.warn('未认证用户尝试访问受保护页面');
    return null;
  }

  // 认证确认，记录日志
  authLogger.info('认证检查通过，渲染组件', {
    userId: user?.userId,
    email: user?.email,
  });

  // 记录数据加载开始
  authLogger.debug('开始加载Boss投递数据');

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

  // 状态卡片组件
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    color: string;
    bgColor: string;
  }> = ({ title, value, icon, color, bgColor }) => (
    <div className={`${bgColor} rounded-lg p-6 shadow-sm`}>
      <div className='flex items-center justify-between'>
        <div>
          <p className={`text-sm font-medium ${color}`}>{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`text-3xl ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navigation />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* 页面标题 */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 flex items-center'>
            <span className='text-red-500 mr-2'>🚀</span>
            Boss直聘自动投递
          </h1>
          <p className='mt-2 text-gray-600'>智能化求职投递平台，让求职更高效</p>
        </div>

        {/* 状态卡片 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <StatCard
            title='今日投递'
            value={bossStatus.deliveryCount || 0}
            icon='📊'
            color='text-blue-600'
            bgColor='bg-white'
          />
          <StatCard
            title='运行状态'
            value={bossStatus.isRunning ? '运行中' : '已停止'}
            icon='🟢'
            color='text-green-600'
            bgColor='bg-green-50'
          />
          <StatCard
            title='智能匹配'
            value='AI'
            icon='🤖'
            color='text-purple-600'
            bgColor='bg-purple-50'
          />
          <StatCard
            title='持续运行'
            value='24/7'
            icon='⏰'
            color='text-orange-600'
            bgColor='bg-orange-50'
          />
        </div>

        {/* Boss登录状态显示 */}
        {!isBossStatusLoading && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              isBossLoggedIn
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <span className='text-lg mr-2'>
                  {isBossLoggedIn ? '✅' : '⚠️'}
                </span>
                <p className='text-sm font-medium'>
                  {isBossLoggedIn ? 'Boss账号已登录' : '需要扫码登录Boss'}
                </p>
              </div>
              <button
                onClick={refreshBossStatus}
                className='text-xs px-3 py-1 rounded-full bg-white hover:bg-gray-50 transition-colors'
              >
                🔄 刷新状态
              </button>
            </div>
            {bossStatusError && (
              <p className='text-xs mt-1 text-red-600'>
                检查状态失败: {bossStatusError}
              </p>
            )}
          </div>
        )}

        {/* 工作流程时间线 */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-8'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
            <span className='text-blue-500 mr-2'>📋</span>
            工作流程
          </h2>
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
        </div>

        {/* 消息提示 */}
        {message && (
          <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <p className='text-blue-800'>{message}</p>
          </div>
        )}

        {/* 功能说明 */}
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
            <span className='text-yellow-500 mr-2'>💡</span>
            功能说明
          </h2>
          <ul className='space-y-2 text-gray-600'>
            <li className='flex items-center'>
              <span className='text-green-500 mr-2'>✓</span>
              AI智能匹配职位，提高投递成功率
            </li>
            <li className='flex items-center'>
              <span className='text-green-500 mr-2'>✓</span>
              自动生成个性化打招呼语
            </li>
            <li className='flex items-center'>
              <span className='text-green-500 mr-2'>✓</span>
              支持批量投递，24/7持续运行
            </li>
            <li className='flex items-center'>
              <span className='text-green-500 mr-2'>✓</span>
              实时监控投递状态和统计
            </li>
            <li className='flex items-center'>
              <span className='text-green-500 mr-2'>✓</span>
              智能过滤黑名单公司和无效岗位
            </li>
          </ul>
        </div>
      </div>

      {/* 二维码登录弹窗 - 优化版 */}
      {showQRModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-8 max-w-2xl w-full mx-4'>
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
              {qrCodeUrl ? (
                <div>
                  <div className='mb-6 flex justify-center'>
                    <img
                      src={qrCodeUrl}
                      alt='登录二维码'
                      className='rounded-xl shadow-2xl'
                      style={{
                        width: '600px',
                        height: '600px',
                        objectFit: 'cover',
                        objectPosition: 'center center',
                      }}
                    />
                  </div>
                  <p className='text-lg text-gray-600 mb-6'>
                    📱 请使用Boss直聘App扫描上方二维码登录
                  </p>
                  <div className='flex justify-center space-x-4'>
                    <button
                      onClick={refreshQRCode}
                      className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium'
                    >
                      🔄 刷新二维码
                    </button>
                    <button
                      onClick={closeQRModal}
                      className='px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-lg font-medium'
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className='py-12'>
                  <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6'></div>
                  <p className='text-lg text-gray-600'>正在生成二维码...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 日志查看弹窗 */}
      {showLogs && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-hidden'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold'>投递日志</h3>
              <button
                onClick={() => setShowLogs(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                ✕
              </button>
            </div>
            <div className='bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm'>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className='mb-1'>
                    {log}
                  </div>
                ))
              ) : (
                <div>暂无日志数据</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BossDelivery;
