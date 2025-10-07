/**
 * WebSocket Hook
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { webSocketService } from '../services/webSocketService';
import {
  DeliveryProgressMessage,
  DeliveryRecordMessage,
  DeliveryStatusMessage,
  ErrorMessage,
  SuccessMessage,
} from '../types/api';

export interface UseWebSocketReturn {
  connectionState: 'connecting' | 'open' | 'closing' | 'closed';
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribeDeliveryStatus: (
    handler: (data: DeliveryStatusMessage) => void
  ) => void;
  subscribeDeliveryProgress: (
    handler: (data: DeliveryProgressMessage) => void
  ) => void;
  subscribeDeliveryRecord: (
    handler: (data: DeliveryRecordMessage) => void
  ) => void;
  subscribeError: (handler: (data: ErrorMessage) => void) => void;
  subscribeSuccess: (handler: (data: SuccessMessage) => void) => void;
  unsubscribeDeliveryStatus: (
    handler: (data: DeliveryStatusMessage) => void
  ) => void;
  unsubscribeDeliveryProgress: (
    handler: (data: DeliveryProgressMessage) => void
  ) => void;
  unsubscribeDeliveryRecord: (
    handler: (data: DeliveryRecordMessage) => void
  ) => void;
  unsubscribeError: (handler: (data: ErrorMessage) => void) => void;
  unsubscribeSuccess: (handler: (data: SuccessMessage) => void) => void;
}

/**
 * WebSocket Hook
 */
export const useWebSocket = (): UseWebSocketReturn => {
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'open' | 'closing' | 'closed'
  >('closed');
  const [isConnected, setIsConnected] = useState(false);
  const handlersRef = useRef<Map<string, ((data: any) => void)[]>>(new Map());

  /**
   * 更新连接状态
   */
  const updateConnectionState = useCallback(() => {
    const state = webSocketService.getConnectionState();
    setConnectionState(state);
    setIsConnected(state === 'open');
  }, []);

  /**
   * 连接WebSocket
   */
  const connect = useCallback(async () => {
    try {
      await webSocketService.connect();
      updateConnectionState();
    } catch (error) {
      console.error('WebSocket连接失败:', error);
      updateConnectionState();
    }
  }, [updateConnectionState]);

  /**
   * 断开WebSocket连接
   */
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    updateConnectionState();
  }, [updateConnectionState]);

  /**
   * 订阅投递状态更新
   */
  const subscribeDeliveryStatus = useCallback(
    (handler: (data: DeliveryStatusMessage) => void) => {
      webSocketService.subscribeDeliveryStatus(handler);

      // 保存处理器引用以便清理
      if (!handlersRef.current.has('status')) {
        handlersRef.current.set('status', []);
      }
      handlersRef.current.get('status')!.push(handler);
    },
    []
  );

  /**
   * 订阅投递进度更新
   */
  const subscribeDeliveryProgress = useCallback(
    (handler: (data: DeliveryProgressMessage) => void) => {
      webSocketService.subscribeDeliveryProgress(handler);

      if (!handlersRef.current.has('progress')) {
        handlersRef.current.set('progress', []);
      }
      handlersRef.current.get('progress')!.push(handler);
    },
    []
  );

  /**
   * 订阅投递记录更新
   */
  const subscribeDeliveryRecord = useCallback(
    (handler: (data: DeliveryRecordMessage) => void) => {
      webSocketService.subscribeDeliveryRecord(handler);

      if (!handlersRef.current.has('record')) {
        handlersRef.current.set('record', []);
      }
      handlersRef.current.get('record')!.push(handler);
    },
    []
  );

  /**
   * 订阅错误消息
   */
  const subscribeError = useCallback(
    (handler: (data: ErrorMessage) => void) => {
      webSocketService.subscribeError(handler);

      if (!handlersRef.current.has('error')) {
        handlersRef.current.set('error', []);
      }
      handlersRef.current.get('error')!.push(handler);
    },
    []
  );

  /**
   * 订阅成功消息
   */
  const subscribeSuccess = useCallback(
    (handler: (data: SuccessMessage) => void) => {
      webSocketService.subscribeSuccess(handler);

      if (!handlersRef.current.has('success')) {
        handlersRef.current.set('success', []);
      }
      handlersRef.current.get('success')!.push(handler);
    },
    []
  );

  /**
   * 取消订阅投递状态更新
   */
  const unsubscribeDeliveryStatus = useCallback(
    (handler: (data: DeliveryStatusMessage) => void) => {
      webSocketService.unsubscribeDeliveryStatus(handler);

      const handlers = handlersRef.current.get('status');
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    },
    []
  );

  /**
   * 取消订阅投递进度更新
   */
  const unsubscribeDeliveryProgress = useCallback(
    (handler: (data: DeliveryProgressMessage) => void) => {
      webSocketService.unsubscribeDeliveryProgress(handler);

      const handlers = handlersRef.current.get('progress');
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    },
    []
  );

  /**
   * 取消订阅投递记录更新
   */
  const unsubscribeDeliveryRecord = useCallback(
    (handler: (data: DeliveryRecordMessage) => void) => {
      webSocketService.unsubscribeDeliveryRecord(handler);

      const handlers = handlersRef.current.get('record');
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    },
    []
  );

  /**
   * 取消订阅错误消息
   */
  const unsubscribeError = useCallback(
    (handler: (data: ErrorMessage) => void) => {
      webSocketService.unsubscribeError(handler);

      const handlers = handlersRef.current.get('error');
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    },
    []
  );

  /**
   * 取消订阅成功消息
   */
  const unsubscribeSuccess = useCallback(
    (handler: (data: SuccessMessage) => void) => {
      webSocketService.unsubscribeSuccess(handler);

      const handlers = handlersRef.current.get('success');
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    },
    []
  );

  // 组件挂载时连接WebSocket
  useEffect(() => {
    connect();

    // 定期检查连接状态
    const interval = setInterval(updateConnectionState, 1000);

    return () => {
      clearInterval(interval);
      disconnect();
    };
  }, [connect, disconnect, updateConnectionState]);

  return {
    connectionState,
    isConnected,
    connect,
    disconnect,
    subscribeDeliveryStatus,
    subscribeDeliveryProgress,
    subscribeDeliveryRecord,
    subscribeError,
    subscribeSuccess,
    unsubscribeDeliveryStatus,
    unsubscribeDeliveryProgress,
    unsubscribeDeliveryRecord,
    unsubscribeError,
    unsubscribeSuccess,
  };
};
