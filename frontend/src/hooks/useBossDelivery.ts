import { useEffect, useState } from 'react';
import { BossStatus, bossService } from '../services/bossService';

/**
 * Boss投递控制Hook
 * 从BossDelivery组件提取的投递控制逻辑
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

export const useBossDelivery = () => {
  const [status, setStatus] = useState<BossStatus>({ isRunning: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

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

        // 立即更新本地状态为停止
        setStatus(prev => ({ ...prev, isRunning: false }));

        // 立即刷新状态（双重保险）
        setTimeout(() => {
          fetchStatus();
        }, 500);

        // 再次刷新确保状态同步
        setTimeout(() => {
          fetchStatus();
        }, 2000);
      } else {
        setMessage(`停止失败: ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`停止失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取状态
  useEffect(() => {
    fetchStatus();
    // 每30秒刷新一次状态
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    status,
    loading,
    message,
    logs,
    fetchStatus,
    fetchLogs,
    handleStart,
    handleStop,
  };
};


