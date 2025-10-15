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
      const logsData = await bossService.getBossLogs(100);
      if (logsData.success && logsData.logs) {
        setLogs(logsData.logs);
      }
    } catch (error: any) {
      console.error('获取日志失败:', error);
    }
  };

  // 启动投递任务
  const handleStart = async () => {
    setLoading(true);
    setMessage('');

    try {
      const result = await bossService.startBossTask();
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
      const result = await bossService.stopBossTask();
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
              window.open(
                window.location.origin.replace('3000', '8080'),
                '_blank'
              )
            }
            className='bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors'
          >
            📋 投递参数配置
          </button>
          <button
            onClick={() =>
              window.open(
                `${window.location.origin.replace('3000', '8080')}/resume-manager`,
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
    </div>
  );
};

export default BossDelivery;
