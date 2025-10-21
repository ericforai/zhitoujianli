import React, { useEffect, useState } from 'react';
import { BossStatus, bossService } from '../services/bossService';

/**
 * Boss直聘投递组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */

const BossDelivery: React.FC = () => {
  const [status, setStatus] = useState<BossStatus>({ isRunning: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // 二维码登录相关状态
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loginStatus, setLoginStatus] = useState('not_started');
  const [qrcodeCheckInterval, setQrcodeCheckInterval] =
    useState<NodeJS.Timeout | null>(null);

  // 获取状态
  const fetchStatus = async () => {
    try {
      const statusData = await bossService.getBossStatus();
      setStatus(statusData);
    } catch (error: any) {
      console.error('获取状态失败:', error);
    }
  };

  // 获取日志
  const fetchLogs = async () => {
    try {
      // 调用Boss投递专用日志API
      const response = await fetch('/api/delivery/logs?lines=100', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success && data.data.logs) {
        setLogs(data.data.logs);
      } else {
        setLogs(['暂无日志数据']);
      }
    } catch (error: any) {
      console.error('获取日志失败:', error);
      setLogs(['获取日志失败: ' + error.message]);
    }
  };

  // 启动投递任务
  const handleStart = async () => {
    setLoading(true);
    setMessage('');

    try {
      // 调用新的自动投递API
      const response = await fetch('/api/delivery/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setMessage('Boss投递任务启动成功！开始自动投递简历...');
        // 立即刷新状态
        setTimeout(() => {
          fetchStatus();
        }, 1000);
      } else {
        setMessage(`启动失败: ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`启动失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 停止投递任务
  const handleStop = async () => {
    setLoading(true);
    setMessage('');

    try {
      // 调用停止投递API
      const response = await fetch('/api/delivery/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setMessage('Boss投递任务已停止');
        // 立即刷新状态
        setTimeout(() => {
          fetchStatus();
        }, 1000);
      } else {
        setMessage(`停止失败: ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`停止失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 查看日志
  const handleViewLogs = async () => {
    setShowLogs(true);
    await fetchLogs();
  };

  // 启动二维码登录流程
  const handleQRCodeLogin = async () => {
    try {
      setShowQRModal(true);
      setQrCodeUrl('');
      setLoginStatus('not_started');

      // 调用后端启动登录
      const response = await fetch('/api/boss/login/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.success) {
        console.log('登录流程已启动');
        setLoginStatus('waiting');
        // 开始轮询二维码和登录状态
        startQRCodePolling();
      } else {
        setMessage('启动登录失败：' + result.message);
        setShowQRModal(false);
      }
    } catch (error: any) {
      console.error('启动登录失败:', error);
      setMessage('启动登录失败，请检查网络连接');
      setShowQRModal(false);
    }
  };

  // 开始轮询二维码和登录状态
  const startQRCodePolling = () => {
    // 清除旧的定时器
    if (qrcodeCheckInterval) {
      clearInterval(qrcodeCheckInterval);
    }

    // 立即加载一次
    loadQRCode();
    checkLoginStatus();

    // 每2秒轮询一次
    const interval = setInterval(() => {
      loadQRCode();
      checkLoginStatus();
    }, 2000);

    setQrcodeCheckInterval(interval);
  };

  // 指数退避重试工具
  const retry = async <T,>(fn: () => Promise<T>, max = 5): Promise<T> => {
    let attempt = 0;
    let lastError: any;
    while (attempt < max) {
      try {
        return await fn();
      } catch (err: any) {
        lastError = err;
        // 对协议错误与5xx进行重试，404不重试（表示未生成）
        const msg = err?.message || '';
        const isProtocolError = msg.includes('ERR_HTTP2_PROTOCOL_ERROR');
        const status = err?.response?.status;
        if (status && status < 500 && !isProtocolError) break;
        const delay = Math.min(4000, 500 * Math.pow(2, attempt));
        await new Promise(res => setTimeout(res, delay));
        attempt += 1;
      }
    }
    throw lastError;
  };

  // 加载二维码（base64 JSON，更稳健）
  const loadQRCode = async () => {
    try {
      const timestamp = new Date().getTime();
      const url = `/api/boss/login/qrcode?format=base64&t=${timestamp}`;
      const exec = async () => {
        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
        });
        if (response.status === 404) {
          throw new Error('404');
        }
        if (!response.ok) {
          throw new Error(`status:${response.status}`);
        }
        return response.json();
      };
      const data = await retry(exec, 4).catch(e => {
        if (String(e?.message).includes('404')) {
          // 尚未生成二维码，保持静默
          return null;
        }
        throw e;
      });

      if (data && data.success && data.data?.qrcodeBase64) {
        const src = `data:image/png;base64,${data.data.qrcodeBase64}`;
        setQrCodeUrl(src);
        console.log('二维码已加载(base64)');
      } else {
        // 未生成则继续等待
      }
    } catch (error) {
      console.error('加载二维码失败:', error);
      try {
        // 将 traceId 展示给用户（若后端返回）
        const trace = (error as any)?.response?.headers?.get?.('X-Request-Id');
        if (trace) {
          setMessage(`加载二维码失败，请重试。问题追踪ID：${trace}`);
        } else {
          setMessage('加载二维码失败，请重试或点击“刷新二维码”');
        }
      } catch (_) {
        setMessage('加载二维码失败，请重试或点击“刷新二维码”');
      }
    }
  };

  // 检查登录状态
  const checkLoginStatus = async () => {
    try {
      const response = await fetch('/api/boss/login/status');
      const result = await response.json();

      setLoginStatus(result.status);

      switch (result.status) {
        case 'success':
          setMessage('✅ 登录成功！现在可以开始投递了');
          // 停止轮询
          if (qrcodeCheckInterval) {
            clearInterval(qrcodeCheckInterval);
            setQrcodeCheckInterval(null);
          }
          // 2秒后关闭模态框
          setTimeout(() => {
            setShowQRModal(false);
          }, 2000);
          break;

        case 'failed':
          setMessage('❌ 登录失败，请重试');
          // 停止轮询
          if (qrcodeCheckInterval) {
            clearInterval(qrcodeCheckInterval);
            setQrcodeCheckInterval(null);
          }
          break;

        default:
          // 继续等待
          break;
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  };

  // 关闭二维码模态框
  const closeQRModal = () => {
    setShowQRModal(false);
    if (qrcodeCheckInterval) {
      clearInterval(qrcodeCheckInterval);
      setQrcodeCheckInterval(null);
    }
  };

  // 刷新二维码
  const refreshQRCode = () => {
    setQrCodeUrl('');
    setLoginStatus('not_started');
    handleQRCodeLogin();
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (qrcodeCheckInterval) {
        clearInterval(qrcodeCheckInterval);
      }
    };
  }, [qrcodeCheckInterval]);

  // 组件挂载时获取状态
  useEffect(() => {
    fetchStatus();
    // 每30秒刷新一次状态
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-xl font-semibold text-gray-900'>
          🚀 Boss直聘自动投递
        </h3>
        <div className='flex items-center space-x-2'>
          <div
            className={`w-3 h-3 rounded-full ${status.isRunning ? 'bg-green-500' : 'bg-gray-300'}`}
          ></div>
          <span className='text-sm text-gray-600'>
            {status.isRunning ? '运行中' : '已停止'}
          </span>
        </div>
      </div>

      {/* 投递统计 */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='text-center p-4 bg-blue-50 rounded-lg'>
          <div className='text-2xl font-bold text-blue-600'>
            {status.deliveryCount || 0}
          </div>
          <div className='text-sm text-gray-600'>今日投递</div>
        </div>
        <div className='text-center p-4 bg-green-50 rounded-lg'>
          <div className='text-2xl font-bold text-green-600'>
            {status.isRunning ? 1 : 0}
          </div>
          <div className='text-sm text-gray-600'>运行状态</div>
        </div>
        <div className='text-center p-4 bg-purple-50 rounded-lg'>
          <div className='text-2xl font-bold text-purple-600'>AI</div>
          <div className='text-sm text-gray-600'>智能匹配</div>
        </div>
        <div className='text-center p-4 bg-yellow-50 rounded-lg'>
          <div className='text-2xl font-bold text-yellow-600'>24/7</div>
          <div className='text-sm text-gray-600'>持续运行</div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <button
          onClick={handleQRCodeLogin}
          disabled={loading}
          className='flex-1 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium'
        >
          📱 扫码登录Boss
        </button>

        <button
          onClick={handleStart}
          disabled={loading || status.isRunning}
          className='flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium'
        >
          {loading ? '启动中...' : '▶️ 启动自动投递'}
        </button>

        <button
          onClick={handleStop}
          disabled={loading || !status.isRunning}
          className='flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium'
        >
          {loading ? '停止中...' : '⏹️ 停止投递'}
        </button>

        <button
          onClick={handleViewLogs}
          className='flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium'
        >
          📋 查看日志
        </button>
      </div>

      {/* 消息提示 */}
      {message && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            message.includes('成功')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          <p className='text-sm'>{message}</p>
        </div>
      )}

      {/* 功能说明 */}
      <div className='bg-gray-50 p-4 rounded-lg mb-4'>
        <h4 className='font-semibold text-gray-900 mb-2'>💡 功能说明</h4>
        <ul className='text-sm text-gray-600 space-y-1'>
          <li>• AI智能匹配职位，提高投递成功率</li>
          <li>• 自动生成个性化打招呼语</li>
          <li>• 支持批量投递，24/7持续运行</li>
          <li>• 实时监控投递状态和统计</li>
          <li>• 智能过滤黑名单公司和无效岗位</li>
        </ul>
      </div>

      {/* 快速配置链接 */}
      <div className='bg-blue-50 p-4 rounded-lg'>
        <h4 className='font-semibold text-blue-900 mb-3'>⚙️ 配置管理</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <button
            onClick={() =>
              window.open(`${window.location.origin}/config`, '_blank')
            }
            className='bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors'
          >
            📋 投递参数配置
          </button>
          <button
            onClick={() =>
              window.open(
                `${window.location.origin}/config/resume-manager`,
                '_blank'
              )
            }
            className='bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors'
          >
            📄 简历内容管理
          </button>
        </div>
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

export default BossDelivery;
