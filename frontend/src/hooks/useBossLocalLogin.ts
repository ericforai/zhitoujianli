/**
 * Boss本地登录Hook
 *
 * 管理Boss本地登录流程和Cookie状态
 * 替代原有的二维码轮询方案
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-06
 */

import { useEffect, useState, useCallback } from 'react';
import bossLoginService, {
  // BossCookie, // TODO: 将来用于Cookie类型定义
  CookieStatusResponse,
} from '../services/bossLoginService';

interface BossLocalLoginState {
  showUploadModal: boolean;
  hasCookie: boolean;
  isValid: boolean;
  isChecking: boolean;
  error: string | null;
}

export const useBossLocalLogin = () => {
  const [state, setState] = useState<BossLocalLoginState>({
    showUploadModal: false,
    hasCookie: false,
    isValid: false,
    isChecking: false,
    error: null,
  });

  /**
   * 检查Cookie状态
   */
  const checkCookieStatus = useCallback(async () => {
    setState(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      const status: CookieStatusResponse =
        await bossLoginService.checkCookieStatus();

      setState(prev => ({
        ...prev,
        hasCookie: status.hasCookie,
        isValid: status.isValid || false,
        isChecking: false,
      }));

      return status;
    } catch (error: any) {
      console.error('检查Cookie状态失败:', error);
      setState(prev => ({
        ...prev,
        hasCookie: false,
        isValid: false,
        isChecking: false,
        error: error.message || '检查Cookie状态失败',
      }));
      return null;
    }
  }, []);

  /**
   * 打开Cookie上传弹窗
   */
  const openUploadModal = useCallback(() => {
    setState(prev => ({ ...prev, showUploadModal: true, error: null }));
  }, []);

  /**
   * 关闭Cookie上传弹窗
   */
  const closeUploadModal = useCallback(() => {
    setState(prev => ({ ...prev, showUploadModal: false }));
  }, []);

  /**
   * Cookie上传成功回调
   */
  const handleUploadSuccess = useCallback(async () => {
    setState(prev => ({ ...prev, showUploadModal: false }));
    // 重新检查Cookie状态
    await checkCookieStatus();
  }, [checkCookieStatus]);

  /**
   * 清除Cookie
   */
  const clearCookie = useCallback(async () => {
    try {
      await bossLoginService.clearCookie();
      setState(prev => ({
        ...prev,
        hasCookie: false,
        isValid: false,
        error: null,
      }));
      console.log('✅ Cookie已清除');
    } catch (error: any) {
      console.error('清除Cookie失败:', error);
      setState(prev => ({
        ...prev,
        error: error.message || '清除Cookie失败',
      }));
    }
  }, []);

  /**
   * 组件挂载时检查Cookie状态
   */
  useEffect(() => {
    checkCookieStatus();
  }, [checkCookieStatus]);

  return {
    // 状态
    showUploadModal: state.showUploadModal,
    hasCookie: state.hasCookie,
    isValid: state.isValid,
    isChecking: state.isChecking,
    error: state.error,

    // 操作
    openUploadModal,
    closeUploadModal,
    handleUploadSuccess,
    checkCookieStatus,
    clearCookie,
  };
};

export default useBossLocalLogin;
