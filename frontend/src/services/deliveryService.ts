/**
 * 投递配置API服务
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import {
    ApiResponse,
    BlacklistConfig,
    BossConfig,
    DeliveryConfig,
    DeliveryRecord,
    DeliveryRecordQuery,
    DeliveryStatistics,
    DeliveryStatisticsQuery,
    DeliveryStrategy,
    GreetingConfig,
} from '../types/api';
import apiClient from './apiService';

/**
 * 投递配置服务
 */
export const deliveryConfigService = {
  /**
   * 获取投递配置
   */
  getDeliveryConfig: async (): Promise<ApiResponse<DeliveryConfig>> => {
    const response = await apiClient.get('/api/delivery/config/config');
    return response.data;
  },

  /**
   * 更新投递配置
   */
  updateDeliveryConfig: async (
    config: DeliveryConfig
  ): Promise<ApiResponse<DeliveryConfig>> => {
    const response = await apiClient.put('/api/delivery/config/config', config);
    return response.data;
  },

  /**
   * 测试投递配置
   */
  testDeliveryConfig: async (
    config: DeliveryConfig
  ): Promise<ApiResponse<{ valid: boolean; message: string }>> => {
    const response = await apiClient.post('/api/delivery/config/config/test', config);
    return response.data;
  },

  /**
   * 获取Boss直聘配置
   */
  getBossConfig: async (): Promise<ApiResponse<BossConfig>> => {
    const response = await apiClient.get('/api/delivery/config/boss-config');
    return response.data;
  },

  /**
   * 更新Boss直聘配置
   */
  updateBossConfig: async (
    bossConfig: BossConfig
  ): Promise<ApiResponse<BossConfig>> => {
    const response = await apiClient.put(
      '/api/delivery/config/boss-config',
      bossConfig
    );
    return response.data;
  },

  /**
   * 获取投递策略配置（从完整配置中提取）
   */
  getDeliveryStrategy: async (): Promise<ApiResponse<DeliveryStrategy>> => {
    const response = await apiClient.get('/api/delivery/config/config');
    const config = response.data.data;
    return {
      ...response.data,
      data: config.deliveryStrategy,
    };
  },

  /**
   * 更新投递策略配置
   */
  updateDeliveryStrategy: async (
    strategy: DeliveryStrategy
  ): Promise<ApiResponse<DeliveryStrategy>> => {
    const configResponse = await apiClient.get('/api/delivery/config');
    const config = configResponse.data.data;
    config.deliveryStrategy = strategy;
    const response = await apiClient.put('/api/delivery/config/config', config);
    return {
      ...response.data,
      data: strategy,
    };
  },

  /**
   * 获取打招呼语配置（从完整配置中提取）
   */
  getGreetingConfig: async (): Promise<ApiResponse<GreetingConfig>> => {
    const response = await apiClient.get('/api/delivery/config/config');
    const config = response.data.data;
    return {
      ...response.data,
      data: config.greetingConfig,
    };
  },

  /**
   * 更新打招呼语配置
   */
  updateGreetingConfig: async (
    greetingConfig: GreetingConfig
  ): Promise<ApiResponse<GreetingConfig>> => {
    const configResponse = await apiClient.get('/api/delivery/config');
    const config = configResponse.data.data;
    config.greetingConfig = greetingConfig;
    const response = await apiClient.put('/api/delivery/config/config', config);
    return {
      ...response.data,
      data: greetingConfig,
    };
  },

  /**
   * 获取黑名单配置
   */
  getBlacklistConfig: async (): Promise<ApiResponse<BlacklistConfig>> => {
    const response = await apiClient.get('/api/delivery/config/blacklist');
    return response.data;
  },

  /**
   * 添加黑名单项
   */
  addBlacklistItem: async (
    type: 'company' | 'position' | 'keyword',
    value: string
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/api/delivery/config/blacklist', {
      type,
      value,
    });
    return response.data;
  },

  /**
   * 删除黑名单项
   */
  deleteBlacklistItem: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/delivery/config/blacklist/${id}`);
    return response.data;
  },
};

/**
 * 自动投递服务
 */
export const autoDeliveryService = {
  /**
   * 启动自动投递
   */
  startDelivery: async (): Promise<
    ApiResponse<{ status: string; message: string; startTime: number }>
  > => {
    const response = await apiClient.post('/api/delivery/start');
    return response.data;
  },

  /**
   * 停止自动投递
   */
  stopDelivery: async (): Promise<
    ApiResponse<{ status: string; message: string; stopTime: number }>
  > => {
    const response = await apiClient.post('/api/delivery/stop');
    return response.data;
  },

  /**
   * 获取投递状态
   */
  getDeliveryStatus: async (): Promise<
    ApiResponse<{
      isRunning: boolean;
      currentJob?: string;
      totalDelivered: number;
      successfulDelivered: number;
      failedDelivered: number;
      lastDeliveryTime?: number;
      nextDeliveryTime?: number;
    }>
  > => {
    const response = await apiClient.get('/api/delivery/status');
    return response.data;
  },

  /**
   * 获取投递记录
   */
  getDeliveryRecords: async (
    query: DeliveryRecordQuery
  ): Promise<ApiResponse<DeliveryRecord[]>> => {
    const params = new URLSearchParams();
    if (query.page !== undefined) params.append('page', query.page.toString());
    if (query.size !== undefined) params.append('size', query.size.toString());
    if (query.status) params.append('status', query.status);
    if (query.platform) params.append('platform', query.platform);
    if (query.keyword) params.append('keyword', query.keyword);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);

    const response = await apiClient.get(
      `/api/delivery/records?${params.toString()}`
    );
    return response.data;
  },

  /**
   * 获取投递统计
   */
  getDeliveryStatistics: async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _query?: DeliveryStatisticsQuery
  ): Promise<ApiResponse<DeliveryStatistics>> => {
    const response = await apiClient.get('/api/delivery/statistics');
    return response.data;
  },

  /**
   * 获取单个投递记录详情
   */
  getDeliveryRecord: async (
    id: string
  ): Promise<ApiResponse<DeliveryRecord>> => {
    const response = await apiClient.get(`/api/delivery/records/${id}`);
    return response.data;
  },

  /**
   * 更新投递记录状态
   */
  updateDeliveryRecordStatus: async (
    id: string,
    status: string
  ): Promise<ApiResponse<DeliveryRecord>> => {
    const response = await apiClient.put(`/api/delivery/records/${id}/status`, {
      status,
    });
    return response.data;
  },

  /**
   * 添加投递记录备注
   */
  addDeliveryRecordRemarks: async (
    id: string,
    remarks: string
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(
      `/api/delivery/records/${id}/remarks`,
      { remarks }
    );
    return response.data;
  },

  /**
   * 手动投递单个职位
   */
  manualDelivery: async (jobData: {
    jobId: string;
    jobTitle: string;
    companyName: string;
    jobUrl?: string;
  }): Promise<ApiResponse<DeliveryRecord>> => {
    const response = await apiClient.post('/api/delivery/manual', jobData);
    return response.data;
  },

  /**
   * 获取投递进度
   */
  getDeliveryProgress: async (): Promise<
    ApiResponse<{
      totalJobs: number;
      processedJobs: number;
      successfulJobs: number;
      failedJobs: number;
      progressPercentage: number;
      estimatedTimeRemaining: number;
    }>
  > => {
    const response = await apiClient.get('/api/delivery/progress');
    return response.data;
  },
};

/**
 * 投递配置验证工具
 */
export const deliveryConfigValidator = {
  /**
   * 验证Boss直聘配置
   */
  validateBossConfig: (
    config: BossConfig
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!config.keywords || config.keywords.length === 0) {
      errors.push('搜索关键词不能为空');
    }

    if (!config.cities || config.cities.length === 0) {
      errors.push('城市不能为空');
    }

    if (config.salaryRange) {
      if (config.salaryRange.minSalary < 0) {
        errors.push('最低薪资不能为负数');
      }
      if (config.salaryRange.maxSalary < config.salaryRange.minSalary) {
        errors.push('最高薪资不能低于最低薪资');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * 验证投递策略配置
   */
  validateDeliveryStrategy: (
    strategy: DeliveryStrategy
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (strategy.deliveryFrequency <= 0) {
      errors.push('投递频率必须大于0');
    }

    if (strategy.maxDailyDelivery <= 0) {
      errors.push('每日最大投递数必须大于0');
    }

    if (strategy.deliveryInterval < 0) {
      errors.push('投递间隔不能为负数');
    }

    if (strategy.matchThreshold < 0 || strategy.matchThreshold > 1) {
      errors.push('匹配度阈值必须在0-1之间');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * 验证打招呼语配置
   */
  validateGreetingConfig: (
    config: GreetingConfig
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (config.maxLength <= 0) {
      errors.push('打招呼语长度限制必须大于0');
    }

    if (
      config.defaultGreeting &&
      config.defaultGreeting.length > config.maxLength
    ) {
      errors.push(`默认打招呼语长度不能超过${config.maxLength}字符`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
