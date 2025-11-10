import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBossDelivery } from '../hooks/useBossDelivery';
import { useBossLoginStatus } from '../hooks/useBossLoginStatus';
import { useBossLocalLogin } from '../hooks/useBossLocalLogin';
import { bossService, DeliveryDetail } from '../services/bossService';
import logger from '../utils/logger';
import Navigation from './Navigation';
import WorkflowTimeline, { WorkflowStep } from './WorkflowTimeline';
import BossCookieUpload from './BossCookieUpload';

/**
 * Boss直聘投递组件 - 本地登录版本
 * 集成工作流程时间线和现代化设计
 * 使用本地登录方案，确保多租户隔离
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-22
 * @updated 2025-11-06 - 重构为本地登录模式
 */

const BossDelivery: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showLogs, setShowLogs] = useState(false);

  // 创建认证日志记录器
  const authLogger = logger.createChild('BossDelivery:Auth');

  // 使用本地登录Hook
  const {
    showUploadModal,
    hasCookie,
    isValid,
    openUploadModal,
    closeUploadModal,
    handleUploadSuccess,
    checkCookieStatus,
  } = useBossLocalLogin();

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
    // refreshStatus: refreshBossStatus, // 暂未使用
  } = useBossLoginStatus();

  // 投递详情弹窗状态
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
    const isRunning = bossStatus.isRunning;
    const isBossLoggedIn = hasCookie && isValid; // 使用本地登录状态

    // 根据Boss登录状态动态显示
    const bossLoginStep: WorkflowStep = {
      id: 'login',
      label: isBossLoggedIn ? '已登录Boss' : '本地登录Boss',
      icon: isBossLoggedIn ? '✅' : '🔐',
      description: isBossLoggedIn
        ? 'Boss账号已登录，可直接启动投递'
        : '在本地浏览器登录并上传Cookie',
      status: isBossLoggedIn ? 'completed' : 'active',
      action: isBossLoggedIn ? undefined : openUploadModal,
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
        status: isRunning ? 'completed' : isBossLoggedIn ? 'active' : 'pending',
        disabled: !isBossLoggedIn || isRunning,
        action: handleStart,
      },
      {
        id: 'logs',
        label: '查看日志',
        icon: '📋',
        description: `${bossStatus.successCount !== undefined ? `✅ 成功${bossStatus.successCount}个 ${bossStatus.blacklistCount ? `⚠️ 黑名单过滤${bossStatus.blacklistCount}个` : ''}${bossStatus.errorCount ? ` ❌ 错误${bossStatus.errorCount}个` : ''}` : '监控投递状态和结果'}`,
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
          <div
            onClick={handleShowDeliveryDetails}
            className='cursor-pointer hover:shadow-lg transition-shadow duration-200'
          >
            <StatCard
              title='今日投递'
              value={bossStatus.deliveryCount || 0}
              icon='📊'
              color='text-blue-600'
              bgColor='bg-white'
            />
          </div>
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
                  {hasCookie && isValid ? '✅' : '⚠️'}
                </span>
                <p className='text-sm font-medium'>
                  {hasCookie && isValid
                    ? 'Boss账号已登录（使用您自己的账号）'
                    : '需要本地登录Boss（确保使用您自己的账号）'}
                </p>
              </div>
              <button
                onClick={checkCookieStatus}
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
              bossStatus.isRunning ? 3 : hasCookie && isValid ? 2 : 1
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

      {/* Boss本地登录弹窗 - 新方案 */}
      {showUploadModal && (
        <BossCookieUpload
          onSuccess={handleUploadSuccess}
          onCancel={closeUploadModal}
        />
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

export default BossDelivery;
