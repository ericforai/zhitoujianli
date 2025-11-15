import { usePlan } from '../contexts/PlanContext';
import { PlanType } from '../services/planService';

/**
 * 套餐权限Hook
 *
 * 提供便捷的权限检查方法
 */
export const usePlanPermission = () => {
  const {
    userPlan,
    quotaUsage,
    hasPermission,
    checkQuota,
    canUseBasicOptimize,
    canUseAdvancedOptimize,
    canSubmitJob,
    refreshPlan,
    refreshQuota,
  } = usePlan();

  /**
   * 检查用户是否是指定套餐类型
   */
  const isPlanType = (planType: PlanType): boolean => {
    return userPlan?.planType === planType;
  };

  /**
   * 检查用户是否至少是指定套餐类型
   */
  const isAtLeastPlanType = (planType: PlanType): boolean => {
    if (!userPlan) {
      return false;
    }

    const planOrder = [PlanType.FREE, PlanType.BASIC, PlanType.PROFESSIONAL];
    const currentIndex = planOrder.indexOf(userPlan.planType);
    const requiredIndex = planOrder.indexOf(planType);

    return currentIndex >= requiredIndex;
  };

  /**
   * 获取配额信息
   */
  const getQuotaInfo = (quotaKey: string) => {
    if (!quotaUsage || !quotaUsage.quickAccess) {
      return null;
    }
    return quotaUsage.quickAccess[quotaKey];
  };

  /**
   * 获取配额使用百分比
   */
  const getQuotaPercentage = (quotaKey: string): number => {
    const quota = getQuotaInfo(quotaKey);
    if (!quota) {
      return 0;
    }

    if (quota.unlimited) {
      return 0;
    }

    if (quota.limit === 0) {
      return 100;
    }

    return Math.min((quota.used / quota.limit) * 100, 100);
  };

  /**
   * 获取剩余配额
   */
  const getRemainingQuota = (quotaKey: string): number | 'unlimited' => {
    const quota = getQuotaInfo(quotaKey);
    if (!quota) {
      return 0;
    }

    if (quota.unlimited) {
      return 'unlimited';
    }

    return Math.max(quota.limit - quota.used, 0);
  };

  /**
   * 是否需要升级
   */
  const needsUpgrade = (quotaKey: string): boolean => {
    return !hasPermission(quotaKey, 1);
  };

  /**
   * 获取推荐的升级套餐
   */
  const getRecommendedUpgrade = (): PlanType | null => {
    if (!userPlan) {
      return PlanType.BASIC;
    }

    switch (userPlan.planType) {
      case PlanType.FREE:
        return PlanType.BASIC;
      case PlanType.BASIC:
        return PlanType.PROFESSIONAL;
      case PlanType.PROFESSIONAL:
        return null; // 已经是最高套餐
      default:
        return null;
    }
  };

  return {
    // 套餐信息
    userPlan,
    quotaUsage,
    planType: userPlan?.planType,
    planName: userPlan?.planName,

    // 套餐类型检查
    isPlanType,
    isAtLeastPlanType,
    isFree: isPlanType(PlanType.FREE),
    isBasic: isPlanType(PlanType.BASIC),
    isProfessional: isPlanType(PlanType.PROFESSIONAL),

    // 权限检查
    hasPermission,
    checkQuota,
    canUseBasicOptimize,
    canUseAdvancedOptimize,
    canSubmitJob,

    // 配额信息
    getQuotaInfo,
    getQuotaPercentage,
    getRemainingQuota,

    // 升级相关
    needsUpgrade,
    getRecommendedUpgrade,

    // 刷新方法
    refreshPlan,
    refreshQuota,
  };
};

export default usePlanPermission;

