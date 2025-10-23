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
    const response = await apiClient.get('/api/candidate-resume/check');
    // 后端返回 {success: true, hasResume: boolean} 格式
    const backendData = response.data;
    return {
      code: backendData.success ? 200 : 400,
      message: backendData.success ? '检查成功' : '检查失败',
      data: { hasResume: backendData.hasResume },
      timestamp: Date.now(),
    };
  },

  /**
   * 获取简历信息
   */
  getResumeInfo: async (): Promise<ApiResponse<ResumeInfo>> => {
    const response = await apiClient.get('/api/candidate-resume/load');
    // 后端返回 {success: true, data: candidate} 格式
    const backendData = response.data;
    if (backendData.success && backendData.data) {
      // 转换后端数据格式为前端期望格式
      const convertedData = convertBackendResumeToFrontend(backendData.data);
      return {
        code: 200,
        message: '获取成功',
        data: convertedData,
        timestamp: Date.now(),
      };
    } else {
      return {
        code: 400,
        message: backendData.message || '未找到简历文件',
        data: null as any,
        timestamp: Date.now(),
      };
    }
  },

  /**
   * 上传简历文件
   */
  uploadResume: async (file: File): Promise<ApiResponse<ResumeInfo>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      '/api/candidate-resume/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log(`上传进度: ${percentCompleted}%`);
        },
      }
    );

    // 后端返回 {success: true, data: candidate, message: string} 格式
    const backendData = response.data;
    if (backendData.success && backendData.data) {
      // 转换后端数据格式为前端期望格式
      const convertedData = convertBackendResumeToFrontend(backendData.data);
      return {
        code: 200,
        message: backendData.message || '上传成功',
        data: convertedData,
        timestamp: Date.now(),
      };
    } else {
      return {
        code: 400,
        message: backendData.message || '上传失败',
        data: null as any,
        timestamp: Date.now(),
      };
    }
  },

  /**
   * 解析简历文本
   */
  parseResume: async (resumeText: string): Promise<ApiResponse<ResumeInfo>> => {
    const response = await apiClient.post('/api/candidate-resume/parse', {
      resume_text: resumeText,
    });

    // 后端返回 {success: true, data: candidate, message: string} 格式
    const backendData = response.data;
    if (backendData.success && backendData.data) {
      // 转换后端数据格式为前端期望格式
      const convertedData = convertBackendResumeToFrontend(backendData.data);
      return {
        code: 200,
        message: backendData.message || '解析成功',
        data: convertedData,
        timestamp: Date.now(),
      };
    } else {
      return {
        code: 400,
        message: backendData.message || '解析失败',
        data: null as any,
        timestamp: Date.now(),
      };
    }
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
    // 后端返回 {success: true, message: string} 格式
    const backendData = response.data;
    return {
      code: backendData.success ? 200 : 400,
      message:
        backendData.message || (backendData.success ? '删除成功' : '删除失败'),
      data: undefined,
      timestamp: Date.now(),
    };
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

/**
 * 转换后端简历数据格式为前端期望格式
 * 后端格式: {name, current_title, years_experience, skills, core_strengths, education, company, confidence}
 * 前端格式: ResumeInfo
 */
function convertBackendResumeToFrontend(backendData: any): ResumeInfo {
  const now = Date.now();

  return {
    id: `resume_${now}`, // 生成临时ID
    name: backendData.name || '',
    currentTitle: backendData.current_title || '',
    yearsExperience: backendData.years_experience || 0,
    education: backendData.education || '',
    phone: '', // 后端暂未提供
    email: '', // 后端暂未提供
    skills: backendData.skills || [],
    coreStrengths: backendData.core_strengths || [],
    workExperience: backendData.company || '', // 使用company字段
    projects: [], // 后端暂未提供
    confidence: {
      name: backendData.confidence?.name || 0,
      skills: backendData.confidence?.skills || 0,
      experience: backendData.confidence?.experience || 0,
      overall: calculateOverallConfidence(backendData.confidence),
    },
    filePath: '', // 后端暂未提供
    originalText: '', // 后端暂未提供
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 计算总体置信度
 */
function calculateOverallConfidence(confidence: any): number {
  if (!confidence) return 0;

  const scores = [
    confidence.name,
    confidence.skills,
    confidence.experience,
  ].filter(score => score > 0);
  if (scores.length === 0) return 0;

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}
