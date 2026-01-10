/**
 * WebSocket服务 - 实时投递状态推送
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 * @updated 2025-10-11 - 改进内存管理，删除重复Hook实现
 * @updated 2025-11-07 - 添加JWT Token验证，防止未认证连接
 * @updated 2025-12-19 - 修复：后端使用SockJS，前端需要使用SockJS客户端
 */

import config from '../config/environment';
// ✅ 修复：使用标准ES6导入SockJS
import SockJS from 'sockjs-client';
import {
  DeliveryProgressMessage,
  DeliveryRecordMessage,
  DeliveryStatusMessage,
  ErrorMessage,
  SuccessMessage,
  VerificationCodeMessage,
  WebSocketMessage,
} from '../types/api';

/**
 * 从localStorage获取JWT Token
 */
function getAuthToken(): string | null {
  // 优先从localStorage获取Token
  const token =
    localStorage.getItem('token') || localStorage.getItem('auth_token');
  return token;
}

type WebSocketEventHandler = (data: any) => void;

/**
 * WebSocket连接管理类
 */
class WebSocketManager {
  private ws: WebSocket | InstanceType<typeof SockJS> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private isConnecting = false;
  private eventHandlers: Map<string, WebSocketEventHandler[]> = new Map();
  private stateChangeListeners: Set<() => void> = new Set();

  /**
   * 连接WebSocket
   *
   * ✅ 安全修复：连接时携带JWT Token进行身份验证
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // ✅ 修复：SockJS的readyState为1表示OPEN
      if (this.ws && (this.ws as any).readyState === 1) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('正在连接中...'));
        return;
      }

      this.isConnecting = true;

      try {
        // 1. 获取JWT Token
        const token = getAuthToken();

        if (!token) {
          this.isConnecting = false;
          const error = new Error(
            '❌ 未登录，无法建立WebSocket连接（缺少Token）'
          );
          console.error(error.message);
          reject(error);
          return;
        }

        // 2. 构建带Token的WebSocket URL
        const baseUrl = config.wsBaseUrl;
        
        // ✅ 修复：立即验证baseUrl，在转换前就检查
        console.log('🔍 检查WebSocket配置:', {
          baseUrl,
          'config.wsBaseUrl': config.wsBaseUrl,
          'typeof baseUrl': typeof baseUrl,
        });
        
        // ✅ 修复：严格验证URL格式，确保使用正确的端口和路径（在转换前检查）
        if (baseUrl.includes(':8081')) {
          console.error('❌ 错误的WebSocket URL检测到！', baseUrl);
          console.error('✅ 应该使用: ws://localhost:8080/ws/boss-delivery');
          console.error('🔧 当前配置:', { baseUrl, config: config.wsBaseUrl });
          this.isConnecting = false;
          reject(new Error('WebSocket URL配置错误：不能使用8081端口，必须使用8080端口'));
          return;
        }
        
        if (!baseUrl.includes('/ws/boss-delivery')) {
          console.error('❌ 错误的WebSocket路径检测到！', baseUrl);
          console.error('✅ 应该使用: ws://localhost:8080/ws/boss-delivery');
          this.isConnecting = false;
          reject(new Error('WebSocket URL配置错误：路径必须是 /ws/boss-delivery'));
          return;
        }

        // ✅ 修复：后端使用SockJS，前端必须使用SockJS客户端
        // SockJS URL需要将 ws:// 或 wss:// 转换为 http:// 或 https://
        const sockjsUrl = baseUrl.replace(/^ws:/, 'http:').replace(/^wss:/, 'https:');
        const fullSockjsUrl = `${sockjsUrl}${sockjsUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
        
        console.log('🔐 正在建立SockJS WebSocket连接（已携带Token）...', {
          baseUrl,
          sockjsUrl,
          fullSockjsUrl,
          'config.wsBaseUrl': config.wsBaseUrl,
        });

        // ✅ 修复：使用SockJS客户端而不是原生WebSocket
        try {
          this.ws = new SockJS(fullSockjsUrl);
          console.log('✅ SockJS客户端已创建，等待连接...');
        } catch (error) {
          console.error('❌ 创建SockJS客户端失败:', error);
          this.isConnecting = false;
          reject(error);
          return;
        }

        // ✅ 修复：SockJS使用相同的事件接口，但类型需要兼容
        (this.ws as any).onopen = () => {
          console.log('✅ SockJS WebSocket连接已建立');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          // ✅ 修复：触发状态变化事件，通知所有监听者
          this.notifyStateChange();
          resolve();
        };

        (this.ws as any).onmessage = (event: any) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('WebSocket消息解析失败:', error);
          }
        };

        (this.ws as any).onclose = (event: any) => {
          console.log('WebSocket连接已关闭:', event.code, event.reason);
          this.isConnecting = false;
          this.ws = null;
          // ✅ 修复：通知状态变化
          this.notifyStateChange();

          // 自动重连（仅在未手动断开的情况下）
          if (
            this.reconnectAttempts < this.maxReconnectAttempts &&
            event.code !== 1000 // 1000 = 正常关闭
          ) {
            this.reconnectAttempts++;
            console.log(
              `尝试重连WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
            );
            setTimeout(() => {
              this.connect().catch(console.error);
            }, this.reconnectInterval);
          }
        };

        (this.ws as any).onerror = (error: any) => {
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
    // 重置重连次数，防止自动重连
    this.reconnectAttempts = this.maxReconnectAttempts;

    // 清理所有事件处理器，防止内存泄漏
    this.eventHandlers.clear();

    if (this.ws) {
      // ✅ 修复：SockJS使用close方法，但参数可能不同
      try {
        (this.ws as any).close(1000, 'Client disconnect'); // 正常关闭
      } catch (error) {
        // SockJS可能不支持第二个参数，只传状态码
        try {
          (this.ws as any).close(1000);
        } catch (e) {
          // 如果都失败，直接关闭
          (this.ws as any).close();
        }
      }
      this.ws = null;
    }

    console.log('🔌 WebSocket已断开并清理所有订阅');
  }

  /**
   * 发送消息
   */
  send(message: any): void {
    // ✅ 修复：SockJS的readyState为1表示OPEN
    if (this.ws && (this.ws as any).readyState === 1) {
      (this.ws as any).send(JSON.stringify(message));
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
    const handlers = this.eventHandlers.get(topic);
    if (handlers) {
      handlers.push(handler);
    }
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

      // 如果该主题已无订阅者，删除整个主题
      if (handlers.length === 0) {
        this.eventHandlers.delete(topic);
      }
    }
  }

  /**
   * 取消指定主题的所有订阅
   */
  unsubscribeAll(topic: string): void {
    this.eventHandlers.delete(topic);
  }

  /**
   * 清除所有订阅
   */
  clearAllSubscriptions(): void {
    this.eventHandlers.clear();
    console.log('🧹 已清除所有WebSocket订阅');
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(message: WebSocketMessage): void {
    // 处理action类型的消息（如verification_code_required）
    if (
      message.data &&
      typeof message.data === 'object' &&
      'action' in message.data
    ) {
      const action = (message.data as any).action;
      const handlers = this.eventHandlers.get(action);
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

    // 处理type类型的消息（向后兼容）
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
   * 通知状态变化
   */
  private notifyStateChange(): void {
    this.stateChangeListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('状态变化监听器执行失败:', error);
      }
    });
  }

  /**
   * 订阅状态变化
   */
  onStateChange(listener: () => void): () => void {
    this.stateChangeListeners.add(listener);
    return () => {
      this.stateChangeListeners.delete(listener);
    };
  }

  /**
   * 获取连接状态
   */
  getConnectionState(): 'connecting' | 'open' | 'closing' | 'closed' {
    if (!this.ws) return 'closed';
    // ✅ 修复：SockJS也使用readyState，但需要类型转换
    const readyState = (this.ws as any).readyState;
    switch (readyState) {
      case 0: // CONNECTING
        return 'connecting';
      case 1: // OPEN
        return 'open';
      case 2: // CLOSING
        return 'closing';
      case 3: // CLOSED
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
   * 订阅验证码请求消息
   */
  subscribeVerificationCode: (
    handler: (data: VerificationCodeMessage) => void
  ): void => {
    wsManager.subscribe('verification_code_required', handler);
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
   * 取消订阅验证码请求消息
   */
  unsubscribeVerificationCode: (
    handler: (data: VerificationCodeMessage) => void
  ): void => {
    wsManager.unsubscribe('verification_code_required', handler);
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

  /**
   * 订阅状态变化
   */
  onStateChange: (listener: () => void): (() => void) => {
    return wsManager.onStateChange(listener);
  },

  /**
   * 清除所有订阅
   */
  clearAllSubscriptions: (): void => {
    wsManager.clearAllSubscriptions();
  },
};
