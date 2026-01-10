/**
 * 本地Agent服务
 * 用于与后端本地Agent API通信
 *
 * @author ZhiTouJianLi Team
 * @since 2025-12-18
 */

import apiClient from './apiService';

/**
 * Agent状态接口
 */
export interface AgentStatus {
  online: boolean;
  status: 'CONNECTING' | 'ONLINE' | 'BUSY' | 'OFFLINE';
  pendingTasks: number;
  activeTasks: number;
}

/**
 * Token生成结果接口
 */
export interface TokenResult {
  token: string;
  expiresIn: number;
  serverUrl: string;
  usage: string;
}

/**
 * 任务创建请求接口
 */
export interface CreateTaskRequest {
  jobUrl: string;
  jobName: string;
  companyName: string;
  greeting?: string;
  config?: Record<string, unknown>;
}

/**
 * 任务创建结果接口
 */
export interface TaskResult {
  taskId: string;
  status: string;
}

/**
 * 系统统计接口
 */
export interface SystemStats {
  onlineAgents: number;
  totalActiveTasks: number;
  totalPendingTasks: number;
}

/**
 * 本地Agent服务类
 */
class LocalAgentService {
  private readonly basePath = '/local-agent';

  /**
   * 生成Agent Token
   * @returns Token信息
   */
  async generateToken(): Promise<TokenResult> {
    const response = await apiClient.post<{
      code: number;
      success?: boolean;
      data: TokenResult;
      message: string;
    }>(`${this.basePath}/token`);

    // ✅ 修复：兼容不同的响应格式
    const responseData = response.data as any;
    
    // 检查响应格式
    if (responseData.code !== 200 && responseData.code !== undefined) {
      throw new Error(responseData.message || '生成Token失败');
    }
    
    // 如果使用success字段
    if (responseData.success === false) {
      throw new Error(responseData.message || '生成Token失败');
    }

    // 返回数据
    if (responseData.data) {
      return responseData.data;
    }
    
    // 如果没有data字段，可能数据在根级别
    if (responseData.token) {
      return {
        token: responseData.token,
        expiresIn: responseData.expiresIn || 86400,
        serverUrl: responseData.serverUrl || 'wss://zhitoujianli.com/ws/local-agent',
        usage: responseData.usage || '',
      };
    }

    throw new Error('生成Token失败：响应格式不正确');
  }

  /**
   * 撤销Agent Token
   * @param token 要撤销的Token
   */
  async revokeToken(token: string): Promise<void> {
    const response = await apiClient.delete<{
      code: number;
      message: string;
    }>(`${this.basePath}/token`, {
      params: { token },
    });

    if (response.data.code !== 200) {
      throw new Error(response.data.message || '撤销Token失败');
    }
  }

  /**
   * 获取Agent状态
   * @returns Agent状态信息
   */
  async getAgentStatus(): Promise<AgentStatus> {
    const response = await apiClient.get<{
      code: number;
      data: AgentStatus;
      message: string;
    }>(`${this.basePath}/status`);

    if (response.data.code !== 200) {
      throw new Error(response.data.message || '获取状态失败');
    }

    return response.data.data;
  }

  /**
   * 检查Agent是否在线
   * @returns 是否在线
   */
  async checkOnline(): Promise<{ online: boolean; userId: string }> {
    const response = await apiClient.get<{
      code: number;
      data: { online: boolean; userId: string };
      message: string;
    }>(`${this.basePath}/online`);

    if (response.data.code !== 200) {
      throw new Error(response.data.message || '检查在线状态失败');
    }

    return response.data.data;
  }

  /**
   * 创建投递任务
   * @param request 任务请求
   * @returns 任务结果
   */
  async createDeliveryTask(request: CreateTaskRequest): Promise<TaskResult> {
    const response = await apiClient.post<{
      code: number;
      data: TaskResult;
      message: string;
    }>(`${this.basePath}/task/delivery`, request);

    if (response.data.code !== 200) {
      throw new Error(response.data.message || '创建任务失败');
    }

    return response.data.data;
  }

  /**
   * 启动本地Agent投递
   * 后端会搜索职位并下发任务给Agent
   * @returns 启动结果
   */
  async startDelivery(): Promise<{ taskCount: number; message: string }> {
    const response = await apiClient.post<{
      code: number;
      success?: boolean;
      data: { taskCount: number; message: string };
      message: string;
    }>(`${this.basePath}/delivery/start`);

    const responseData = response.data as any;

    if (responseData.code !== 200 && responseData.success !== true) {
      throw new Error(responseData.message || '启动投递失败');
    }

    return responseData.data || { taskCount: 0, message: responseData.message };
  }

  /**
   * 停止本地Agent投递
   */
  async stopDelivery(): Promise<void> {
    const response = await apiClient.post<{
      code: number;
      message: string;
    }>(`${this.basePath}/delivery/stop`);

    if (response.data.code !== 200) {
      throw new Error(response.data.message || '停止投递失败');
    }
  }

  /**
   * 获取系统统计（管理员）
   * @returns 系统统计信息
   */
  async getSystemStats(): Promise<SystemStats> {
    const response = await apiClient.get<{
      code: number;
      data: SystemStats;
      message: string;
    }>(`${this.basePath}/admin/stats`);

    if (response.data.code !== 200) {
      throw new Error(response.data.message || '获取统计失败');
    }

    return response.data.data;
  }
}

// 导出单例
export const localAgentService = new LocalAgentService();
export default localAgentService;
