/**
 * WebSocket Hook
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 * @updated 2025-10-11 - 改进订阅管理，防止内存泄漏
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
      const handlers = handlersRef.current.get('status');
      if (handlers) {
        handlers.push(handler);
      }
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
      const handlers = handlersRef.current.get('progress');
      if (handlers) {
        handlers.push(handler);
      }
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
      const handlers = handlersRef.current.get('record');
      if (handlers) {
        handlers.push(handler);
      }
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
      const handlers = handlersRef.current.get('error');
      if (handlers) {
        handlers.push(handler);
      }
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
      const handlers = handlersRef.current.get('success');
      if (handlers) {
        handlers.push(handler);
      }
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

    // 在 effect 内部复制 ref，供清理函数使用
    const currentHandlersRef = handlersRef;

    // 清理函数：组件卸载时清理所有订阅和连接
    return () => {
      clearInterval(interval);

      // 清理所有在此Hook中注册的订阅
      const allTopics = ['status', 'progress', 'record', 'error', 'success'];
      allTopics.forEach(topic => {
        const handlers = currentHandlersRef.current.get(topic);
        if (handlers) {
          handlers.forEach(handler => {
            switch (topic) {
              case 'status':
                webSocketService.unsubscribeDeliveryStatus(handler);
                break;
              case 'progress':
                webSocketService.unsubscribeDeliveryProgress(handler);
                break;
              case 'record':
                webSocketService.unsubscribeDeliveryRecord(handler);
                break;
              case 'error':
                webSocketService.unsubscribeError(handler);
                break;
              case 'success':
                webSocketService.unsubscribeSuccess(handler);
                break;
            }
          });
        }
      });

      // 清空本地引用
      currentHandlersRef.current.clear();

      // 断开连接
      disconnect();

      console.log('🧹 useWebSocket: 已清理所有订阅和连接');
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
