/**
 * WebSocket服务 - 实时投递状态推送
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import {
  DeliveryProgressMessage,
  DeliveryRecordMessage,
  DeliveryStatusMessage,
  ErrorMessage,
  SuccessMessage,
  WebSocketMessage,
} from '../types/api';

type WebSocketEventHandler = (data: any) => void;

/**
 * WebSocket连接管理类
 */
class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private isConnecting = false;
  private eventHandlers: Map<string, WebSocketEventHandler[]> = new Map();

  /**
   * 连接WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('正在连接中...'));
        return;
      }

      this.isConnecting = true;

      try {
        // 构建WebSocket URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket连接已建立');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = event => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('WebSocket消息解析失败:', error);
          }
        };

        this.ws.onclose = event => {
          console.log('WebSocket连接已关闭:', event.code, event.reason);
          this.isConnecting = false;
          this.ws = null;

          // 自动重连
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(
              `尝试重连WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
            );
            setTimeout(() => {
              this.connect().catch(console.error);
            }, this.reconnectInterval);
          }
        };

        this.ws.onerror = error => {
          console.error('WebSocket连接错误:', error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * 发送消息
   */
  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket未连接，无法发送消息');
    }
  }

  /**
   * 订阅消息
   */
  subscribe(topic: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(topic)) {
      this.eventHandlers.set(topic, []);
    }
    this.eventHandlers.get(topic)!.push(handler);
  }

  /**
   * 取消订阅
   */
  unsubscribe(topic: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(topic);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data);
        } catch (error) {
          console.error('WebSocket事件处理器执行失败:', error);
        }
      });
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionState(): 'connecting' | 'open' | 'closing' | 'closed' {
    if (!this.ws) return 'closed';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'open';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'closed';
    }
  }
}

// 创建全局WebSocket管理器实例
const wsManager = new WebSocketManager();

/**
 * WebSocket服务
 */
export const webSocketService = {
  /**
   * 连接WebSocket
   */
  connect: (): Promise<void> => wsManager.connect(),

  /**
   * 断开WebSocket连接
   */
  disconnect: (): void => wsManager.disconnect(),

  /**
   * 订阅投递状态更新
   */
  subscribeDeliveryStatus: (
    handler: (data: DeliveryStatusMessage) => void
  ): void => {
    wsManager.subscribe('status', handler);
  },

  /**
   * 订阅投递进度更新
   */
  subscribeDeliveryProgress: (
    handler: (data: DeliveryProgressMessage) => void
  ): void => {
    wsManager.subscribe('progress', handler);
  },

  /**
   * 订阅投递记录更新
   */
  subscribeDeliveryRecord: (
    handler: (data: DeliveryRecordMessage) => void
  ): void => {
    wsManager.subscribe('record', handler);
  },

  /**
   * 订阅错误消息
   */
  subscribeError: (handler: (data: ErrorMessage) => void): void => {
    wsManager.subscribe('error', handler);
  },

  /**
   * 订阅成功消息
   */
  subscribeSuccess: (handler: (data: SuccessMessage) => void): void => {
    wsManager.subscribe('success', handler);
  },

  /**
   * 取消订阅投递状态更新
   */
  unsubscribeDeliveryStatus: (
    handler: (data: DeliveryStatusMessage) => void
  ): void => {
    wsManager.unsubscribe('status', handler);
  },

  /**
   * 取消订阅投递进度更新
   */
  unsubscribeDeliveryProgress: (
    handler: (data: DeliveryProgressMessage) => void
  ): void => {
    wsManager.unsubscribe('progress', handler);
  },

  /**
   * 取消订阅投递记录更新
   */
  unsubscribeDeliveryRecord: (
    handler: (data: DeliveryRecordMessage) => void
  ): void => {
    wsManager.unsubscribe('record', handler);
  },

  /**
   * 取消订阅错误消息
   */
  unsubscribeError: (handler: (data: ErrorMessage) => void): void => {
    wsManager.unsubscribe('error', handler);
  },

  /**
   * 取消订阅成功消息
   */
  unsubscribeSuccess: (handler: (data: SuccessMessage) => void): void => {
    wsManager.unsubscribe('success', handler);
  },

  /**
   * 发送投递状态消息
   */
  sendDeliveryStatus: (status: DeliveryStatusMessage): void => {
    wsManager.send({
      type: 'status',
      data: status,
    });
  },

  /**
   * 发送投递进度消息
   */
  sendDeliveryProgress: (progress: DeliveryProgressMessage): void => {
    wsManager.send({
      type: 'progress',
      data: progress,
    });
  },

  /**
   * 发送投递记录消息
   */
  sendDeliveryRecord: (record: DeliveryRecordMessage): void => {
    wsManager.send({
      type: 'record',
      data: record,
    });
  },

  /**
   * 获取连接状态
   */
  getConnectionState: (): 'connecting' | 'open' | 'closing' | 'closed' => {
    return wsManager.getConnectionState();
  },

  /**
   * 检查是否已连接
   */
  isConnected: (): boolean => {
    return wsManager.getConnectionState() === 'open';
  },
};

/**
 * WebSocket Hook - 用于React组件
 */
export const useWebSocket = () => {
  const [connectionState, setConnectionState] = React.useState<
    'connecting' | 'open' | 'closing' | 'closed'
  >('closed');

  React.useEffect(() => {
    const updateConnectionState = () => {
      setConnectionState(webSocketService.getConnectionState());
    };

    // 初始连接
    webSocketService
      .connect()
      .then(() => {
        updateConnectionState();
      })
      .catch(console.error);

    // 定期检查连接状态
    const interval = setInterval(updateConnectionState, 1000);

    return () => {
      clearInterval(interval);
      webSocketService.disconnect();
    };
  }, []);

  return {
    connectionState,
    isConnected: connectionState === 'open',
    connect: webSocketService.connect,
    disconnect: webSocketService.disconnect,
  };
};

// 导入React（如果使用Hook）
import React from 'react';
