/**
 * 投递管理Hook
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  autoDeliveryService,
  deliveryConfigService,
} from '../services/deliveryService';
import {
  DeliveryConfig,
  DeliveryRecord,
  DeliveryRecordQuery,
  DeliveryStatistics,
  DeliveryStatisticsQuery,
} from '../types/api';

export interface UseDeliveryConfigReturn {
  config: DeliveryConfig | null;
  loading: boolean;
  error: string | null;
  updateConfig: (config: DeliveryConfig) => Promise<void>;
  testConfig: (
    config: DeliveryConfig
  ) => Promise<{ valid: boolean; message: string }>;
  refreshConfig: () => Promise<void>;
}

export interface UseDeliveryReturn {
  isRunning: boolean;
  status: any;
  records: DeliveryRecord[];
  statistics: DeliveryStatistics | null;
  loading: boolean;
  error: string | null;
  startDelivery: () => Promise<void>;
  stopDelivery: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  refreshRecords: (query?: DeliveryRecordQuery) => Promise<void>;
  refreshStatistics: (query?: DeliveryStatisticsQuery) => Promise<void>;
  manualDelivery: (jobData: any) => Promise<void>;
}

/**
 * 投递配置Hook
 */
export const useDeliveryConfig = (): UseDeliveryConfigReturn => {
  const [config, setConfig] = useState<DeliveryConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 加载投递配置
   */
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await deliveryConfigService.getDeliveryConfig();
      if (response.code === 200) {
        setConfig(response.data);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || '加载投递配置失败');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 更新投递配置
   */
  const updateConfig = useCallback(async (newConfig: DeliveryConfig) => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await deliveryConfigService.updateDeliveryConfig(newConfig);
      if (response.code === 200) {
        setConfig(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message || '更新投递配置失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 测试投递配置
   */
  const testConfig = useCallback(async (testConfig: DeliveryConfig) => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await deliveryConfigService.testDeliveryConfig(testConfig);
      return {
        valid: response.data.valid,
        message: response.data.message,
      };
    } catch (err: any) {
      setError(err.message || '测试投递配置失败');
      return {
        valid: false,
        message: err.message || '测试失败',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新配置
   */
  const refreshConfig = useCallback(async () => {
    await loadConfig();
  }, [loadConfig]);

  // 组件挂载时加载配置
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    error,
    updateConfig,
    testConfig,
    refreshConfig,
  };
};

/**
 * 自动投递Hook
 */
export const useDelivery = (): UseDeliveryReturn => {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [records, setRecords] = useState<DeliveryRecord[]>([]);
  const [statistics, setStatistics] = useState<DeliveryStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 加载投递状态
   */
  const loadStatus = useCallback(async () => {
    try {
      const response = await autoDeliveryService.getDeliveryStatus();
      if (response.code === 200) {
        setStatus(response.data);
        setIsRunning(response.data.isRunning);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || '加载投递状态失败');
    }
  }, []);

  /**
   * 加载投递记录
   */
  const loadRecords = useCallback(
    async (query: DeliveryRecordQuery = { page: 0, size: 20 }) => {
      try {
        setLoading(true);
        setError(null);

        const response = await autoDeliveryService.getDeliveryRecords(query);
        if (response.code === 200) {
          setRecords(response.data);
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError(err.message || '加载投递记录失败');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * 加载投递统计
   */
  const loadStatistics = useCallback(
    async (query?: DeliveryStatisticsQuery) => {
      try {
        setLoading(true);
        setError(null);

        const response = await autoDeliveryService.getDeliveryStatistics(query);
        if (response.code === 200) {
          setStatistics(response.data);
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError(err.message || '加载投递统计失败');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * 启动自动投递
   * ✅ 优化：使用乐观更新策略，API返回成功后立即更新UI状态，提升用户体验
   */
  const startDelivery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await autoDeliveryService.startDelivery();
      if (response.code === 200) {
        // ✅ 乐观更新：使用flushSync强制立即更新UI，避免React批处理延迟
        // 这样用户点击按钮后能立即看到反馈，避免误以为没有启动成功
        flushSync(() => {
          setIsRunning(true);
          setLoading(false);
        });

        // ✅ 延迟刷新详细状态，给后端一些时间更新状态
        // 延迟1秒后再刷新，避免立即覆盖乐观更新
        setTimeout(() => {
          loadStatus().catch(err => {
            console.warn('刷新状态失败，但投递已启动:', err);
            // 如果刷新失败，保持乐观更新状态
            // 因为API已经返回成功，说明投递确实已启动
          });
        }, 1000);
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message || '启动自动投递失败');
      // ✅ 如果启动失败，确保状态为false
      setIsRunning(false);
      setLoading(false);
      throw err;
    }
  }, [loadStatus]);

  /**
   * 停止自动投递
   */
  const stopDelivery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await autoDeliveryService.stopDelivery();
      if (response.code === 200) {
        setIsRunning(false);
        // 重新加载状态
        await loadStatus();
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message || '停止自动投递失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadStatus]);

  /**
   * 手动投递
   */
  const manualDelivery = useCallback(
    async (jobData: any) => {
      try {
        setLoading(true);
        setError(null);

        const response = await autoDeliveryService.manualDelivery(jobData);
        if (response.code === 200) {
          // 重新加载记录
          await loadRecords();
          // 重新加载统计
          await loadStatistics();
        } else {
          throw new Error(response.message);
        }
      } catch (err: any) {
        setError(err.message || '手动投递失败');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadRecords, loadStatistics]
  );

  /**
   * 刷新状态
   */
  const refreshStatus = useCallback(async () => {
    await loadStatus();
  }, [loadStatus]);

  /**
   * 刷新记录
   */
  const refreshRecords = useCallback(
    async (query?: DeliveryRecordQuery) => {
      await loadRecords(query);
    },
    [loadRecords]
  );

  /**
   * 刷新统计
   */
  const refreshStatistics = useCallback(
    async (query?: DeliveryStatisticsQuery) => {
      await loadStatistics(query);
    },
    [loadStatistics]
  );

  // 组件挂载时加载初始数据
  useEffect(() => {
    loadStatus();
    loadRecords();
    loadStatistics();
  }, [loadStatus, loadRecords, loadStatistics]);

  return {
    isRunning,
    status,
    records,
    statistics,
    loading,
    error,
    startDelivery,
    stopDelivery,
    refreshStatus,
    refreshRecords,
    refreshStatistics,
    manualDelivery,
  };
};
