import apiClient from './apiService';

/**
 * 套餐类型枚举
 */
export enum PlanType {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
}

/**
 * 套餐状态枚举
 */
export enum PlanStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
}

/**
 * 用户套餐信息
 */
export interface UserPlan {
  planType: PlanType;
  planName: string;
  monthlyPrice: number;
  startDate: string;
  endDate: string | null;
  status: PlanStatus;
  isValid: boolean;
  isExpiringSoon: boolean;
}

/**
 * 配额使用详情
 */
export interface QuotaUsageDetail {
  quotaKey: string;
  quotaName: string;
  category: string;
  used: number;
  limit: number;
  unlimited: boolean;
  resetPeriod: string;
  nextResetDate: string | null;
}

/**
 * 配额使用情况响应
 */
export interface QuotaUsageResponse {
  success: boolean;
  planType: PlanType;
  planName: string;
  quotaDetails: QuotaUsageDetail[];
  quickAccess: {
    [key: string]: {
      used: number;
      limit: number;
      unlimited: boolean;
    };
  };
}

/**
 * 套餐升级请求
 */
export interface UpgradePlanRequest {
  targetPlan: PlanType;
}

/**
 * 套餐升级响应
 */
export interface UpgradePlanResponse {
  success: boolean;
  message: string;
  planType: PlanType;
  planName: string;
}

/**
 * 套餐服务
 */
export const planService = {
  /**
   * 获取当前用户套餐信息
   */
  getCurrentPlan: async (): Promise<UserPlan> => {
    try {
      const response = await apiClient.get('/user/plan/current');
      if (response.data.success) {
        return response.data as UserPlan;
      }
      throw new Error('获取套餐信息失败');
    } catch (error) {
      console.error('获取套餐信息失败:', error);
      throw error;
    }
  },

  /**
   * 获取配额使用情况
   */
  getQuotaUsage: async (): Promise<QuotaUsageResponse> => {
    try {
      const response = await apiClient.get('/user/plan/quota');
      return response.data;
    } catch (error) {
      console.error('获取配额使用情况失败:', error);
      throw error;
    }
  },

  /**
   * 升级套餐
   */
  upgradePlan: async (targetPlan: PlanType): Promise<UpgradePlanResponse> => {
    try {
      const response = await apiClient.post('/user/plan/upgrade', {
        targetPlan,
      });
      return response.data;
    } catch (error) {
      console.error('套餐升级失败:', error);
      throw error;
    }
  },

  /**
   * 检查配额是否足够
   */
  checkQuota: async (
    quotaKey: string,
    amount: number = 1
  ): Promise<boolean> => {
    try {
      const quotaUsage = await planService.getQuotaUsage();
      const quota = quotaUsage.quickAccess[quotaKey];

      if (!quota) {
        return false;
      }

      if (quota.unlimited) {
        return true;
      }

      return quota.used + amount <= quota.limit;
    } catch (error) {
      console.error('检查配额失败:', error);
      return false;
    }
  },

  /**
   * 获取套餐显示名称
   */
  getPlanDisplayName: (planType: PlanType): string => {
    switch (planType) {
      case PlanType.FREE:
        return '求职入门版';
      case PlanType.BASIC:
        return '高效求职版';
      case PlanType.PROFESSIONAL:
        return '极速上岸版';
      default:
        return '未知版本';
    }
  },

  /**
   * 获取套餐价格
   */
  getPlanPrice: (planType: PlanType): number => {
    switch (planType) {
      case PlanType.FREE:
        return 0;
      case PlanType.BASIC:
        return 49;
      case PlanType.PROFESSIONAL:
        return 99;
      default:
        return 0;
    }
  },
};

export default planService;
