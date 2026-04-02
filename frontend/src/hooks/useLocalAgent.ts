/**
 * 本地Agent状态管理Hook
 * 管理本地Agent的连接状态、Token生成等
 *
 * @author ZhiTouJianLi Team
 * @since 2025-12-19
 */

import { useState, useEffect, useCallback } from 'react';
import { localAgentService, AgentStatus } from '../services/localAgentService';

export interface LocalAgentState {
  // Agent状态
  isOnline: boolean;
  status: AgentStatus['status'];
  pendingTasks: number;
  activeTasks: number;

  // 投递状态
  isDelivering: boolean;
  deliveryMessage: string | null;

  // Token信息
  token: string | null;
  tokenGeneratedAt: number | null;

  // 加载状态
  isLoading: boolean;
  error: string | null;
}

export interface UseLocalAgentReturn extends LocalAgentState {
  // 操作方法
  generateToken: () => Promise<string | null>;
  revokeToken: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  startDelivery: () => Promise<void>;
  stopDelivery: () => Promise<void>;

  // 启动命令
  getStartCommand: () => string;
}

// 检测操作系统
const getOS = (): 'windows' | 'mac' | 'linux' => {
  const platform = navigator.platform.toLowerCase();
  if (platform.includes('win')) return 'windows';
  if (platform.includes('mac')) return 'mac';
  return 'linux';
};

/**
 * 本地Agent状态管理Hook
 */
export const useLocalAgent = (): UseLocalAgentReturn => {
  const [state, setState] = useState<LocalAgentState>({
    isOnline: false,
    status: 'OFFLINE',
    pendingTasks: 0,
    activeTasks: 0,
    isDelivering: false,
    deliveryMessage: null,
    token: null,
    tokenGeneratedAt: null,
    isLoading: false,
    error: null,
  });

  // 刷新Agent状态
  const refreshStatus = useCallback(async () => {
    try {
      // 优先使用 /online 接口检查在线状态（更准确）
      const onlineResult = await localAgentService.checkOnline();
      setState(prev => ({
        ...prev,
        isOnline: onlineResult.online,
        status: onlineResult.online ? 'ONLINE' : 'OFFLINE',
        error: null,
      }));
    } catch (err) {
      console.error('获取Agent状态失败:', err);
      // 出错时设置为离线
      setState(prev => ({
        ...prev,
        isOnline: false,
        status: 'OFFLINE',
      }));
    }
  }, []);

  // 生成Token
  const generateToken = useCallback(async (): Promise<string | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await localAgentService.generateToken();
      setState(prev => ({
        ...prev,
        token: result.token,
        tokenGeneratedAt: Date.now(),
        isLoading: false,
      }));
      return result.token;
    } catch (err: any) {
      const errorMsg = err.message || '生成Token失败';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }));
      return null;
    }
  }, []);

  // 撤销Token
  const revokeToken = useCallback(async () => {
    if (!state.token) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await localAgentService.revokeToken(state.token);
      setState(prev => ({
        ...prev,
        token: null,
        tokenGeneratedAt: null,
        isLoading: false,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || '撤销Token失败',
      }));
    }
  }, [state.token]);

  // 获取启动命令
  const getStartCommand = useCallback((): string => {
    const token = state.token || 'YOUR_TOKEN';
    const os = getOS();

    if (os === 'windows') {
      return `cd %USERPROFILE%\\Downloads\\local-agent && pip install -r requirements.txt && python boss_local_agent.py --token ${token}`;
    }
    return `cd ~/Downloads/local-agent && pip3 install -r requirements.txt && python3 boss_local_agent.py --token ${token}`;
  }, [state.token]);

  // 启动投递
  const startDelivery = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null, deliveryMessage: null }));

    try {
      const result = await localAgentService.startDelivery();
      setState(prev => ({
        ...prev,
        isDelivering: true,
        deliveryMessage: result.message || `已下发 ${result.taskCount} 个任务`,
        isLoading: false,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || '启动投递失败',
      }));
    }
  }, []);

  // 停止投递
  const stopDelivery = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await localAgentService.stopDelivery();
      setState(prev => ({
        ...prev,
        isDelivering: false,
        deliveryMessage: '投递已停止',
        isLoading: false,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || '停止投递失败',
      }));
    }
  }, []);

  // 初始化和定时刷新
  useEffect(() => {
    refreshStatus();

    // 每5秒刷新一次状态
    const interval = setInterval(refreshStatus, 5000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  return {
    ...state,
    generateToken,
    revokeToken,
    refreshStatus,
    startDelivery,
    stopDelivery,
    getStartCommand,
  };
};

export default useLocalAgent;
