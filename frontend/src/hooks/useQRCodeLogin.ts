import { useEffect, useState } from 'react';
import config from '../config/environment';

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
  qrcodeCheckInterval: NodeJS.Timeout | null;
}

export const useQRCodeLogin = () => {
  const [state, setState] = useState<QRCodeLoginState>({
    showQRModal: false,
    qrCodeUrl: '',
    loginStatus: 'not_started',
    qrcodeCheckInterval: null,
  });

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
      // 🔧 修复：使用config中的apiBaseUrl
      const url = `${config.apiBaseUrl}/boss/login/qrcode?format=base64&t=${timestamp}`;
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

  // 检查登录状态
  const checkLoginStatus = async () => {
    try {
      // 🔧 修复：使用config中的apiBaseUrl
      const response = await fetch(`${config.apiBaseUrl}/boss/login/status`);
      const result = await response.json();

      // 显示运行进度
      if (result.isInProgress && result.elapsedSeconds) {
        console.log(`登录流程进行中: ${result.elapsedSeconds}秒`);
      }

      setState(prev => ({ ...prev, loginStatus: result.status }));

      switch (result.status) {
        case 'success':
          // 停止轮询
          if (state.qrcodeCheckInterval) {
            clearInterval(state.qrcodeCheckInterval);
            setState(prev => ({ ...prev, qrcodeCheckInterval: null }));
          }
          console.log('✅ Boss登录成功，仅更新登录状态，不自动启动投递');
          // ✅ 修复：登录成功后延迟关闭模态框，但不触发任何投递操作
          // 注意：这里只关闭模态框，不自动启动投递，用户需要手动点击"启动投递"按钮
          setTimeout(() => {
            setState(prev => ({ ...prev, showQRModal: false }));
          }, 2000);
          break;

        case 'failed':
          // 停止轮询
          if (state.qrcodeCheckInterval) {
            clearInterval(state.qrcodeCheckInterval);
            setState(prev => ({ ...prev, qrcodeCheckInterval: null }));
          }
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
    if (state.qrcodeCheckInterval) {
      clearInterval(state.qrcodeCheckInterval);
    }

    // 立即加载一次
    loadQRCode();
    checkLoginStatus();

    // 每2秒轮询一次
    const interval = setInterval(() => {
      loadQRCode();
      checkLoginStatus();
    }, 2000);

    setState(prev => ({ ...prev, qrcodeCheckInterval: interval }));
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

      // 调用后端启动登录
      // 🔧 修复：使用config中的apiBaseUrl
      const response = await fetch(`${config.apiBaseUrl}/boss/login/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

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
  // ✅ 修复：确保关闭模态框时不会触发任何副作用，只清理定时器
  const closeQRModal = () => {
    // 停止所有轮询
    if (state.qrcodeCheckInterval) {
      clearInterval(state.qrcodeCheckInterval);
      setState(prev => ({ ...prev, qrcodeCheckInterval: null }));
    }
    // 关闭模态框，但不改变登录状态
    setState(prev => ({ ...prev, showQRModal: false }));
    console.log('✅ 二维码登录模态框已关闭，未触发任何投递操作');
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
      if (state.qrcodeCheckInterval) {
        clearInterval(state.qrcodeCheckInterval);
      }
    };
  }, [state.qrcodeCheckInterval]);

  return {
    showQRModal: state.showQRModal,
    qrCodeUrl: state.qrCodeUrl,
    loginStatus: state.loginStatus,
    handleQRCodeLogin,
    closeQRModal,
    refreshQRCode,
  };
};
