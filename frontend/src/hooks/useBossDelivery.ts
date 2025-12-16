import { useEffect, useState } from 'react';
import { BossStatus, bossService } from '../services/bossService';
import { usePlan } from '../contexts/PlanContext';
import config from '../config/environment';

/**
 * Boss投递控制Hook
 * 从BossDelivery组件提取的投递控制逻辑
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

export const useBossDelivery = () => {
  const { hasPermission, refreshQuota } = usePlan();
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
      const response = await fetch(
        `${config.apiBaseUrl}/delivery/logs?lines=100`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // ✅ 修复：检查响应状态和Content-Type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // 返回了非JSON响应（可能是代理错误或HTML页面）
        const text = await response.text();
        console.error('API返回了非JSON响应:', text.substring(0, 200));
        setLogs([`获取日志失败: 服务器返回了错误响应 (${response.status})`]);
        return;
      }

      if (!response.ok) {
        // 尝试解析错误响应
        try {
          const errorResult = await response.json();
          setLogs([
            `获取日志失败: ${errorResult.message || `HTTP ${response.status}`}`,
          ]);
        } catch {
          setLogs([`获取日志失败: HTTP ${response.status}`]);
        }
        return;
      }

      const data = await response.json();
      if (data.success && data.data && data.data.logs) {
        setLogs(data.data.logs);
      } else {
        setLogs(['暂无日志数据']);
      }
    } catch (error: any) {
      console.error('获取日志失败:', error);
      // ✅ 修复：处理JSON解析错误
      if (error.message && error.message.includes('JSON')) {
        setLogs(['获取日志失败: 服务器返回了非JSON格式的响应，可能是代理错误']);
      } else {
        setLogs(['获取日志失败: ' + (error.message || '未知错误')]);
      }
    }
  };

  // 启动投递任务
  // ✅ 修复：确保只有用户明确点击"启动投递"按钮才会启动，不会自动启动
  const handleStart = async () => {
    console.log('✅ 用户明确点击"启动投递"按钮，开始启动投递任务');

    // 检查配额
    const canSubmit = hasPermission('daily_job_application', 1);
    if (!canSubmit) {
      setMessage('⚠️ 今日投递次数已用完，请明天再试或升级套餐');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // 调用新的自动投递API
      const response = await fetch(`${config.apiBaseUrl}/delivery/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setMessage('Boss投递任务启动成功！开始自动投递简历...');
        // 刷新配额显示
        await refreshQuota();
        // 立即刷新状态
        setTimeout(() => {
          fetchStatus();
        }, 1000);
      } else {
        setMessage(`启动失败: ${result.message}`);
      }
    } catch (error: any) {
      const errorMessage = error.message || '未知错误';

      // 检查是否是配额不足错误
      if (errorMessage.includes('配额') || errorMessage.includes('次数')) {
        setMessage(`⚠️ ${errorMessage}，请升级套餐或明天再试`);
      } else {
        setMessage(`启动失败: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 停止投递任务
  // ✅ 修复：确保只有用户明确点击"停止投递"按钮才会停止
  const handleStop = async () => {
    console.log('✅ 用户明确点击"停止投递"按钮，开始停止投递任务');
    setLoading(true);
    setMessage('');

    try {
      // 调用停止投递API
      const response = await fetch(`${config.apiBaseUrl}/delivery/stop`, {
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

  // ✅ 配额检查和自动停止逻辑
  useEffect(() => {
    // 如果任务正在运行，定期检查配额
    if (!status.isRunning) {
      return;
    }

    const checkQuotaAndStop = async () => {
      try {
        // 刷新配额信息
        await refreshQuota();

        // 检查配额是否足够继续投递
        const canContinue = hasPermission('daily_job_application', 1);

        if (!canContinue) {
          // 配额已用完，自动停止投递
          console.log('⚠️ 配额已用完，自动停止投递任务');
          setMessage(
            '⚠️ 今日投递配额已用完，已自动停止投递。请升级套餐继续使用！'
          );

          // 调用停止API
          try {
            const response = await fetch('/api/delivery/stop', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });

            const result = await response.json();
            if (result.success) {
              // 更新本地状态
              setStatus(prev => ({ ...prev, isRunning: false }));
              // 刷新状态
              fetchStatus();
            }
          } catch (error: any) {
            console.error('自动停止投递失败:', error);
            // 即使停止API失败，也更新本地状态
            setStatus(prev => ({ ...prev, isRunning: false }));
          }
        }
      } catch (error: any) {
        console.error('配额检查失败:', error);
      }
    };

    // 立即检查一次
    checkQuotaAndStop();

    // 每10秒检查一次配额（比状态刷新更频繁）
    const quotaCheckInterval = setInterval(checkQuotaAndStop, 10000);

    return () => clearInterval(quotaCheckInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.isRunning]);

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
