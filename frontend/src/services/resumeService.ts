import apiClient from './apiService';

/**
 * 简历管理服务
 *
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */

export interface ResumeUploadResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface CandidateInfo {
  name: string;
  phone: string;
  email: string;
  gender: string;
  age: number;
  education: string;
  workExperience: string;
  skills: string[];
  projects: string[];
  selfEvaluation: string;
}

/**
 * 简历服务
 */
export const resumeService = {
  /**
   * 上传简历文件
   */
  uploadResume: async (file: File): Promise<ResumeUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ResumeUploadResponse>(
        '/candidate-resume/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('简历上传失败:', error);
      throw new Error(error.response?.data?.message || '简历上传失败');
    }
  },

  /**
   * 加载已有简历
   */
  loadResume: async (): Promise<ResumeUploadResponse> => {
    try {
      const response = await apiClient.get<ResumeUploadResponse>(
        '/candidate-resume/load'
      );
      return response.data;
    } catch (error: any) {
      console.error('加载简历失败:', error);
      throw new Error(error.response?.data?.message || '加载简历失败');
    }
  },

  /**
   * 保存简历信息
   */
  saveResume: async (
    candidateInfo: CandidateInfo
  ): Promise<ResumeUploadResponse> => {
    try {
      const response = await apiClient.post<ResumeUploadResponse>(
        '/candidate-resume/save',
        candidateInfo
      );
      return response.data;
    } catch (error: any) {
      console.error('保存简历失败:', error);
      throw new Error(error.response?.data?.message || '保存简历失败');
    }
  },

  /**
   * 删除简历
   */
  deleteResume: async (): Promise<ResumeUploadResponse> => {
    try {
      const response = await apiClient.post<ResumeUploadResponse>(
        '/candidate-resume/delete'
      );
      return response.data;
    } catch (error: any) {
      console.error('删除简历失败:', error);
      throw new Error(error.response?.data?.message || '删除简历失败');
    }
  },

  /**
   * 生成智能打招呼语
   */
  generateGreeting: async (
    jobDescription: string
  ): Promise<{ success: boolean; message: string; data?: string }> => {
    try {
      const response = await apiClient.post('/smart-greeting/generate', {
        jobDescription,
      });
      return response.data;
    } catch (error: any) {
      console.error('生成打招呼语失败:', error);
      throw new Error(error.response?.data?.message || '生成打招呼语失败');
    }
  },
};

export default resumeService;
