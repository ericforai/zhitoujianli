/**
 * 黑名单管理API服务
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-04
 */

import { ApiResponse } from '../types/api';
import apiClient from './apiService';

export interface BlacklistData {
  companyBlacklist: string[];
  positionBlacklist: string[];
  enableBlacklistFilter: boolean;
}

/**
 * 黑名单服务
 */
export const blacklistService = {
  /**
   * 获取黑名单配置
   */
  getBlacklist: async (): Promise<ApiResponse<BlacklistData>> => {
    const response = await apiClient.get('/blacklist');
    return response.data;
  },

  /**
   * 更新黑名单配置
   */
  updateBlacklist: async (
    blacklist: BlacklistData
  ): Promise<ApiResponse<BlacklistData>> => {
    const response = await apiClient.put('/blacklist', blacklist);
    return response.data;
  },

  /**
   * 添加黑名单项
   */
  addBlacklistItem: async (
    type: 'company' | 'position' | 'recruiter',
    value: string
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/blacklist/add', {
      type,
      value,
    });
    return response.data;
  },

  /**
   * 删除黑名单项
   */
  removeBlacklistItem: async (
    type: 'company' | 'position' | 'recruiter',
    value: string
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete('/blacklist/remove', {
      params: { type, value },
    });
    return response.data;
  },
};
