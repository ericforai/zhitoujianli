import apiClient from './apiService';

/**
 * Boss直聘投递功能服务
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */

export interface BossStatus {
  isRunning: boolean;
  logFile?: string;
  deliveryCount?: number;
}

export interface BossTaskResponse {
  success: boolean;
  message: string;
  logFile?: string;
}

export interface LogsResponse {
  success: boolean;
  logs?: string[];
  message?: string;
}

/**
 * Boss投递服务
 */
export const bossService = {
  /**
   * 启动Boss投递任务
   */
  startBossTask: async (): Promise<BossTaskResponse> => {
    try {
      const response = await apiClient.post<BossTaskResponse>('/start-boss-task');
      return response.data;
    } catch (error: any) {
      console.error('启动Boss任务失败:', error);
      throw new Error(error.response?.data?.message || '启动Boss任务失败');
    }
  },

  /**
   * 停止Boss投递任务
   */
  stopBossTask: async (): Promise<BossTaskResponse> => {
    try {
      const response = await apiClient.post<BossTaskResponse>('/stop-program');
      return response.data;
    } catch (error: any) {
      console.error('停止Boss任务失败:', error);
      throw new Error(error.response?.data?.message || '停止Boss任务失败');
    }
  },

  /**
   * 获取Boss任务状态
   */
  getBossStatus: async (): Promise<BossStatus> => {
    try {
      const response = await apiClient.get<BossStatus>('/status');
      return response.data;
    } catch (error: any) {
      console.error('获取Boss状态失败:', error);
      throw new Error(error.response?.data?.message || '获取状态失败');
    }
  },

  /**
   * 获取投递日志
   */
  getBossLogs: async (lines: number = 50): Promise<LogsResponse> => {
    try {
      const response = await apiClient.get<LogsResponse>(`/logs?lines=${lines}`);
      return response.data;
    } catch (error: any) {
      console.error('获取Boss日志失败:', error);
      throw new Error(error.response?.data?.message || '获取日志失败');
    }
  },

  /**
   * 获取用户配置
   */
  getUserConfig: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/config');
      return response.data;
    } catch (error: any) {
      console.error('获取用户配置失败:', error);
      throw new Error(error.response?.data?.message || '获取配置失败');
    }
  },

  /**
   * 保存用户配置
   */
  saveUserConfig: async (config: any): Promise<any> => {
    try {
      const response = await apiClient.post('/save-config', config);
      return response.data;
    } catch (error: any) {
      console.error('保存用户配置失败:', error);
      throw new Error(error.response?.data?.message || '保存配置失败');
    }
  }
};

export default bossService;
