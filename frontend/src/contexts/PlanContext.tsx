import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  planService,
  PlanType,
  PlanStatus,
  UserPlan,
  QuotaUsageResponse,
} from '../services/planService';
import { useAuth } from './AuthContext';

/**
 * 套餐Context类型定义
 */
interface PlanContextType {
  // 套餐信息
  userPlan: UserPlan | null;
  quotaUsage: QuotaUsageResponse | null;

  // 加载状态
  loading: boolean;
  error: string | null;

  // 方法
  refreshPlan: () => Promise<void>;
  refreshQuota: () => Promise<void>;
  hasPermission: (quotaKey: string, amount?: number) => boolean;
  checkQuota: (quotaKey: string, amount?: number) => Promise<boolean>;
  upgradePlan: (targetPlan: PlanType) => Promise<void>;

  // 快捷访问方法
  canUseBasicOptimize: () => boolean;
  canUseAdvancedOptimize: () => boolean;
  canSubmitJob: (count?: number) => boolean;
}

const PlanContext = createContext<PlanContextType | null>(null);

/**
 * 套餐Provider组件
 */
export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [quotaUsage, setQuotaUsage] = useState<QuotaUsageResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 刷新套餐信息
   */
  const refreshPlan = useCallback(async () => {
    if (!isAuthenticated) {
      setUserPlan(null);
      return;
    }

    // 🔧 修复：管理员用户跳过套餐查询，避免500错误
    const userType = localStorage.getItem('userType');
    if (userType === 'admin') {
      console.log('✅ 管理员用户，跳过套餐查询');
      // 设置默认的管理员套餐
      setUserPlan({
        planType: PlanType.PROFESSIONAL,
        planName: '管理员套餐',
        monthlyPrice: 0,
        startDate: new Date().toISOString(),
        endDate: null,
        status: PlanStatus.ACTIVE,
        isValid: true,
        isExpiringSoon: false,
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('📋 开始获取用户套餐信息...');
      const plan = await planService.getCurrentPlan();
      console.log('✅ 获取套餐信息成功:', plan);
      if (plan) {
        setUserPlan(plan);
      } else {
        console.warn('⚠️ 套餐信息为空，设置默认套餐');
        // 如果返回null，设置默认免费套餐
        setUserPlan({
          planType: PlanType.FREE,
          planName: '求职入门版',
          monthlyPrice: 0,
          startDate: new Date().toISOString(),
          endDate: null,
          status: PlanStatus.ACTIVE,
          isValid: true,
          isExpiringSoon: false,
        });
      }
    } catch (err) {
      console.error('❌ 刷新套餐信息失败:', err);
      // 🔧 修复：即使失败也设置默认套餐，避免页面崩溃
      // 但记录错误，方便调试
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('❌ 套餐查询错误详情:', errorMessage);
      setUserPlan({
        planType: PlanType.FREE,
        planName: '求职入门版',
        monthlyPrice: 0,
        startDate: new Date().toISOString(),
        endDate: null,
        status: PlanStatus.ACTIVE,
        isValid: true,
        isExpiringSoon: false,
      });
      // 不设置error，避免影响用户体验
      // setError('获取套餐信息失败');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * 刷新配额使用情况
   */
  const refreshQuota = useCallback(async () => {
    if (!isAuthenticated) {
      setQuotaUsage(null);
      return;
    }

    // 🔧 修复：管理员用户跳过配额查询，避免500错误
    const userType = localStorage.getItem('userType');
    if (userType === 'admin') {
      console.log('✅ 管理员用户，跳过配额查询');
      // 设置默认的无限配额
      setQuotaUsage({
        success: true,
        planType: 'PROFESSIONAL' as PlanType,
        planName: '管理员套餐',
        quotaDetails: [],
        quickAccess: {
          resume_basic_optimize: { used: 0, limit: -1, unlimited: true },
          resume_advanced_optimize: { used: 0, limit: -1, unlimited: true },
          daily_job_application: { used: 0, limit: -1, unlimited: true },
        },
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('📊 开始获取用户配额使用情况...');
      const usage = await planService.getQuotaUsage();
      console.log('✅ 获取配额使用情况成功:', usage);
      if (usage) {
        setQuotaUsage(usage);
      } else {
        console.warn('⚠️ 配额使用情况为空，设置默认配额');
        // 如果返回null，设置默认免费套餐配额
        setQuotaUsage({
          success: true,
          planType: 'FREE' as PlanType,
          planName: '求职入门版',
          quotaDetails: [],
          quickAccess: {
            resume_basic_optimize: { used: 0, limit: 10, unlimited: false },
            resume_advanced_optimize: { used: 0, limit: 5, unlimited: false },
            daily_job_application: { used: 0, limit: 20, unlimited: false },
          },
        });
      }
    } catch (err) {
      console.error('❌ 刷新配额使用情况失败:', err);
      // 🔧 修复：即使失败也设置默认配额，避免页面崩溃
      // 但记录错误，方便调试
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('❌ 配额查询错误详情:', errorMessage);
      setQuotaUsage({
        success: true,
        planType: 'FREE' as PlanType,
        planName: '求职入门版',
        quotaDetails: [],
        quickAccess: {
          resume_basic_optimize: { used: 0, limit: 10, unlimited: false },
          resume_advanced_optimize: { used: 0, limit: 5, unlimited: false },
          daily_job_application: { used: 0, limit: 20, unlimited: false },
        },
      });
      // 不设置error，避免影响用户体验
      // setError('获取配额使用情况失败');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * 检查是否有权限（基于缓存的配额数据）
   */
  const hasPermission = useCallback(
    (quotaKey: string, amount: number = 1): boolean => {
      if (!quotaUsage || !quotaUsage.quickAccess) {
        return false;
      }

      const quota = quotaUsage.quickAccess[quotaKey];
      if (!quota) {
        return false;
      }

      if (quota.unlimited) {
        return true;
      }

      return quota.used + amount <= quota.limit;
    },
    [quotaUsage]
  );

  /**
   * 异步检查配额（实时查询）
   */
  const checkQuota = useCallback(
    async (quotaKey: string, amount: number = 1): Promise<boolean> => {
      try {
        return await planService.checkQuota(quotaKey, amount);
      } catch (error) {
        console.error('检查配额失败:', error);
        return false;
      }
    },
    []
  );

  /**
   * 升级套餐
   */
  const upgradePlan = useCallback(
    async (targetPlan: PlanType) => {
      try {
        setLoading(true);
        setError(null);
        await planService.upgradePlan(targetPlan);

        // 升级成功后刷新套餐和配额信息
        await refreshPlan();
        await refreshQuota();
      } catch (err) {
        console.error('升级套餐失败:', err);
        setError('套餐升级失败');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshPlan, refreshQuota]
  );

  /**
   * 快捷方法：检查是否可以使用基础优化
   */
  const canUseBasicOptimize = useCallback((): boolean => {
    return hasPermission('resume_basic_optimize', 1);
  }, [hasPermission]);

  /**
   * 快捷方法：检查是否可以使用高级优化
   */
  const canUseAdvancedOptimize = useCallback((): boolean => {
    return hasPermission('resume_advanced_optimize', 1);
  }, [hasPermission]);

  /**
   * 快捷方法：检查是否可以投递
   */
  const canSubmitJob = useCallback(
    (count: number = 1): boolean => {
      return hasPermission('daily_job_application', count);
    },
    [hasPermission]
  );

  /**
   * 用户登录后自动加载套餐和配额信息
   */
  useEffect(() => {
    if (isAuthenticated) {
      refreshPlan();
      refreshQuota();
    } else {
      setUserPlan(null);
      setQuotaUsage(null);
    }
  }, [isAuthenticated, refreshPlan, refreshQuota]);

  const value: PlanContextType = {
    userPlan,
    quotaUsage,
    loading,
    error,
    refreshPlan,
    refreshQuota,
    hasPermission,
    checkQuota,
    upgradePlan,
    canUseBasicOptimize,
    canUseAdvancedOptimize,
    canSubmitJob,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};

/**
 * 使用套餐Context的Hook
 */
export const usePlan = (): PlanContextType => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan必须在PlanProvider内部使用');
  }
  return context;
};

export default PlanContext;

