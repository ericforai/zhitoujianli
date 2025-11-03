import { useEffect, useState, useRef } from 'react';
import apiClient from '../services/apiService';

/**
 * 二维码登录Hook
 * 从BossDelivery组件提取的二维码登录逻辑
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

interface QRCodeLoginState {
  showQRModal: boolean;
  qrCodeUrl: string;
  loginStatus: 'not_started' | 'waiting' | 'success' | 'failed';
}

export const useQRCodeLogin = () => {
  const [state, setState] = useState<QRCodeLoginState>({
    showQRModal: false,
    qrCodeUrl: '',
    loginStatus: 'not_started',
  });

  // 使用useRef存储interval，避免闭包问题
  const qrcodeCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 指数退避重试工具
  const retry = async <T>(fn: () => Promise<T>, max = 5): Promise<T> => {
    let attempt = 0;
    let lastError: any;
    while (attempt < max) {
      try {
        return await fn();
      } catch (err: any) {
        lastError = err;
        // 对协议错误与5xx进行重试，404不重试（表示未生成）
        const msg = err?.message || '';
        const isProtocolError = msg.includes('ERR_HTTP2_PROTOCOL_ERROR');
        const status = err?.response?.status;
        if (status && status < 500 && !isProtocolError) break;
        const delay = Math.min(4000, 500 * Math.pow(2, attempt));
        await new Promise(res => setTimeout(res, delay));
        attempt += 1;
      }
    }
    throw lastError;
  };

  // 加载二维码（直接获取图片）
  const loadQRCode = async () => {
    try {
      const timestamp = new Date().getTime();
      const url = `/api/boss/login/qrcode?format=base64&t=${timestamp}`;
      const exec = async (): Promise<string | null> => {
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
          },
        });
        if (response.status === 404) {
          throw new Error('404');
        }
        if (!response.ok) {
          throw new Error(`status:${response.status}`);
        }

        const json = (await response.json()) as
          | {
              success?: boolean;
              data?: { qrcodeBase64?: string; image?: string };
              qrcodeBase64?: string;
              image?: string;
            }
          | string
          | null;

        if (typeof json === 'string') {
          return json;
        }

        const base64 =
          json?.data?.qrcodeBase64 ||
          json?.data?.image ||
          json?.qrcodeBase64 ||
          json?.image ||
          null;

        if (base64 && (json?.success ?? true)) {
          return base64;
        }

        return null;
      };
      const data = await retry(exec, 4).catch(e => {
        if (String(e?.message).includes('404')) {
          // 尚未生成二维码，保持静默
          return null;
        }
        throw e;
      });

      if (data) {
        const normalized = data.startsWith('data:')
          ? data
          : `data:image/png;base64,${data}`;
        setState(prev => ({ ...prev, qrCodeUrl: normalized }));
        console.log('二维码已加载(base64)');
      } else {
        console.debug('二维码未就绪，等待下一次轮询');
      }
    } catch (error) {
      console.error('加载二维码失败:', error);
    }
  };

  // 停止轮询（提取为独立函数）
  const stopPolling = () => {
    if (qrcodeCheckIntervalRef.current) {
      clearInterval(qrcodeCheckIntervalRef.current);
      qrcodeCheckIntervalRef.current = null;
      console.log('✅ 已停止二维码轮询');
    }
  };

  // 检查登录状态
  const checkLoginStatus = async () => {
    try {
      const response = await fetch('/api/boss/login/status');
      const result = await response.json();

      // 显示运行进度
      if (result.isInProgress && result.elapsedSeconds) {
        console.log(`登录流程进行中: ${result.elapsedSeconds}秒`);
      }

      setState(prev => ({ ...prev, loginStatus: result.status }));

      switch (result.status) {
        case 'success':
          // 登录成功：立即停止轮询
          console.log('✅ Boss登录成功，停止轮询');
          stopPolling();
          // 2秒后关闭模态框
          setTimeout(() => {
            setState(prev => ({ ...prev, showQRModal: false }));
          }, 2000);
          break;

        case 'failed':
          // 登录失败：停止轮询
          console.log('❌ Boss登录失败，停止轮询');
          stopPolling();
          break;

        default:
          // 继续等待
          break;
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  };

  // 开始轮询二维码和登录状态
  const startQRCodePolling = () => {
    // 清除旧的定时器
    stopPolling();

    // 立即加载一次
    loadQRCode();
    checkLoginStatus();

    // 每2秒轮询一次
    const interval = setInterval(() => {
      loadQRCode();
      checkLoginStatus();
    }, 2000);

    qrcodeCheckIntervalRef.current = interval;
    console.log('🔄 开始轮询二维码和登录状态');
  };

  // 启动二维码登录流程
  const handleQRCodeLogin = async () => {
    try {
      setState(prev => ({
        ...prev,
        showQRModal: true,
        qrCodeUrl: '',
        loginStatus: 'not_started',
      }));

      // 调用后端启动登录（使用apiClient自动携带JWT token）
      const response = await apiClient.post('/api/boss/login/start');

      const result = response.data;

      if (result.success) {
        console.log('登录流程已启动');
        setState(prev => ({ ...prev, loginStatus: 'waiting' }));
        // 开始轮询二维码和登录状态
        startQRCodePolling();
      } else {
        // 处理登录进行中的情况
        if (result.status === 'in_progress') {
          setState(prev => ({ ...prev, loginStatus: 'waiting' }));
          // 即使返回进行中，也启动轮询以显示二维码
          startQRCodePolling();
        } else {
          setState(prev => ({ ...prev, showQRModal: false }));
        }
      }
    } catch (error: any) {
      console.error('启动登录失败:', error);
      setState(prev => ({ ...prev, showQRModal: false }));
    }
  };

  // 关闭二维码模态框
  const closeQRModal = () => {
    setState(prev => ({ ...prev, showQRModal: false }));
    stopPolling();
  };

  // 刷新二维码
  const refreshQRCode = () => {
    setState(prev => ({
      ...prev,
      qrCodeUrl: '',
      loginStatus: 'not_started',
    }));
    handleQRCodeLogin();
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  return {
    showQRModal: state.showQRModal,
    qrCodeUrl: state.qrCodeUrl,
    loginStatus: state.loginStatus,
    handleQRCodeLogin,
    closeQRModal,
    refreshQRCode,
  };
};
