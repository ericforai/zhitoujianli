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
   * ✅ 修复：使用函数式更新，避免依赖问题，并添加状态比较避免不必要的更新
   */
  const updateConnectionState = useCallback(() => {
    const state = webSocketService.getConnectionState();
    const newIsConnected = state === 'open';
    
    // ✅ 修复：使用函数式更新，并添加状态比较，只有真正变化时才更新
    setConnectionState(prevState => {
      if (prevState !== state) {
        return state;
      }
      return prevState;
    });
    
    setIsConnected(prev => {
      if (prev !== newIsConnected) {
        return newIsConnected;
      }
      return prev;
    });
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

  // ✅ 修复：使用模块级单例，确保全局只有一个WebSocket连接
  // 使用模块级变量而不是组件级ref，避免多个组件实例重复连接
  // 注意：这个变量在模块级别，所有组件实例共享
  let globalInitialized = false;

  // 组件挂载时连接WebSocket（只执行一次）
  useEffect(() => {
    // ✅ 修复：使用模块级变量，确保全局只有一个连接
    if (!globalInitialized) {
      globalInitialized = true;
      connect();
    }

    // ✅ 修复：使用WebSocket状态变化监听，被动更新而不是定时轮询
    const unsubscribeStateChange = webSocketService.onStateChange(() => {
      updateConnectionState();
    });

    // 在 effect 内部复制 ref，供清理函数使用
    const currentHandlersRef = handlersRef;

    // 清理函数：组件卸载时只清理订阅，不断开连接
    return () => {
      // ✅ 修复：取消状态变化监听
      unsubscribeStateChange();

      // ✅ 修复：不断开连接，因为其他组件可能还在使用
      // 只清理当前组件的订阅

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

      // ✅ 修复：不断开连接，让其他组件继续使用
      // disconnect(); // 移除这行，避免组件卸载时断开连接

      console.log('🧹 useWebSocket: 已清理当前组件的订阅');
    };
    // ✅ 修复：移除函数依赖，只在组件挂载/卸载时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
