import { useEffect, useState } from 'react';

/**
 * Boss登录状态检查Hook
 * 用于检查用户是否已登录Boss（Cookie有效性）
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

interface BossLoginStatus {
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  lastChecked: Date | null;
}

export const useBossLoginStatus = () => {
  const [status, setStatus] = useState<BossLoginStatus>({
    isLoggedIn: false,
    isLoading: true,
    error: null,
    lastChecked: null,
  });

  // 检查Boss登录状态
  const checkBossLoginStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/boss/login/check-status', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setStatus({
          isLoggedIn: result.isLoggedIn,
          isLoading: false,
          error: null,
          lastChecked: new Date(),
        });

        console.log(
          `Boss登录状态检查完成: ${result.isLoggedIn ? '已登录' : '需要登录'}`
        );
      } else {
        throw new Error(result.message || '检查登录状态失败');
      }
    } catch (error: any) {
      console.error('检查Boss登录状态失败:', error);
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '检查登录状态失败',
      }));
    }
  };

  // 组件挂载时自动检查
  useEffect(() => {
    checkBossLoginStatus();
  }, []);

  // 手动刷新状态
  const refreshStatus = () => {
    checkBossLoginStatus();
  };

  return {
    ...status,
    refreshStatus,
  };
};
