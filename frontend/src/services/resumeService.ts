/**
 * 简历管理API服务
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import { ApiResponse, ResumeInfo } from '../types/api';
import apiClient from './apiService';

export interface ResumeUploadResponse {
  success: boolean;
  data: ResumeInfo;
  message: string;
}

export interface ResumeParseRequest {
  resume_text: string;
}

export interface ResumeContentUpdateRequest {
  content: string;
}

/**
 * 简历管理服务
 */
export const resumeService = {
  /**
   * 检查简历是否存在
   */
  checkResume: async (): Promise<ApiResponse<{ hasResume: boolean }>> => {
    const response = await apiClient.get('/api/resume/check');
    return response.data;
  },

  /**
   * 获取简历信息
   */
  getResumeInfo: async (): Promise<ApiResponse<ResumeInfo>> => {
    const response = await apiClient.get('/api/resume/info');
    return response.data;
  },

  /**
   * 上传简历文件
   */
  uploadResume: async (file: File): Promise<ApiResponse<ResumeInfo>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/api/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressEvent => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log(`上传进度: ${percentCompleted}%`);
      },
    });

    return response.data;
  },

  /**
   * 解析简历文本
   */
  parseResume: async (resumeText: string): Promise<ApiResponse<ResumeInfo>> => {
    const response = await apiClient.post('/api/resume/parse', {
      resume_text: resumeText,
    });
    return response.data;
  },

  /**
   * 更新简历信息
   */
  updateResumeInfo: async (
    resumeInfo: ResumeInfo
  ): Promise<ApiResponse<ResumeInfo>> => {
    // 暂时返回原数据，因为旧API不支持更新
    return {
      code: 200,
      message: '更新成功（本地模拟）',
      data: resumeInfo,
      timestamp: Date.now(),
    };
  },

  /**
   * 删除简历
   */
  deleteResume: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/api/candidate-resume/delete');
    return response.data;
  },

  /**
   * 获取简历原始内容
   */
  getResumeContent: async (): Promise<
    ApiResponse<{ originalText: string }>
  > => {
    // 暂时返回空数据，因为旧API不支持
    return {
      code: 200,
      message: '获取成功（本地模拟）',
      data: { originalText: '' },
      timestamp: Date.now(),
    };
  },

  /**
   * 更新简历内容
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateResumeContent: async (_content: string): Promise<ApiResponse<void>> => {
    // 暂时返回成功，因为旧API不支持
    return {
      code: 200,
      message: '更新成功（本地模拟）',
      data: undefined,
      timestamp: Date.now(),
    };
  },

  /**
   * 验证文件格式
   */
  validateFileFormat: (file: File): { valid: boolean; message?: string } => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const fileName = file.name.toLowerCase();

    // 检查文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, message: '文件大小不能超过10MB' };
    }

    // 检查文件类型
    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.some(ext => fileName.endsWith(ext))
    ) {
      return {
        valid: false,
        message: '不支持的文件格式，请上传PDF、DOC、DOCX、TXT文件',
      };
    }

    return { valid: true };
  },

  /**
   * 格式化文件大小
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};
