import React from 'react';
import { usePlanPermission } from '../../hooks/usePlanPermission';
import { PlanType } from '../../services/planService';

/**
 * 权限守卫组件Props
 */
interface PlanGuardProps {
  /** 需要的套餐类型 */
  requiredPlan?: PlanType;
  /** 配额键 */
  quotaKey?: string;
  /** 需要的配额数量 */
  amount?: number;
  /** 无权限时的替代内容 */
  fallback?: React.ReactNode;
  /** 子组件 */
  children: React.ReactNode;
}

/**
 * 套餐权限守卫组件
 *
 * 根据用户套餐和配额情况，控制功能的显示和访问
 *
 * @example
 * // 只有高效版及以上才能看到
 * <PlanGuard requiredPlan={PlanType.BASIC} fallback={<UpgradePrompt />}>
 *   <AdvancedFeature />
 * </PlanGuard>
 *
 * @example
 * // 检查配额是否足够
 * <PlanGuard quotaKey="resume_advanced_optimize" fallback={<QuotaExceededPrompt />}>
 *   <OptimizeButton />
 * </PlanGuard>
 */
export const PlanGuard: React.FC<PlanGuardProps> = ({
  requiredPlan,
  quotaKey,
  amount = 1,
  fallback,
  children,
}) => {
  const {
    isAtLeastPlanType,
    hasPermission,
  } = usePlanPermission();

  // 检查套餐类型
  if (requiredPlan && !isAtLeastPlanType(requiredPlan)) {
    return <>{fallback}</>;
  }

  // 检查配额
  if (quotaKey && !hasPermission(quotaKey, amount)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PlanGuard;

