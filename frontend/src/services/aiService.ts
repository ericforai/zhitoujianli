/**
 * AI功能统一服务
 *
 * 集成所有AI相关功能：简历解析、智能打招呼语生成等
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-05
 */

import apiClient from './apiService';

export interface ResumeParseResult {
  name: string;
  current_title: string;
  years_experience: number;
  skills: string[];
  core_strengths: string[];
  education: string;
  company?: string; // 设为可选字段
  phone?: string; // 设为可选字段
  email?: string; // 设为可选字段
  confidence: {
    name: number;
    skills: number;
    experience: number;
  };
}

export interface GreetingGenerateRequest {
  candidate: ResumeParseResult;
  jobName: string;
  jobDescription: string;
}

export interface GreetingGenerateResult {
  greeting: string;
  matchScore: number;
}

/**
 * AI简历解析服务
 */
export const aiResumeService = {
  /**
   * 解析简历文本
   */
  parseResume: async (resumeText: string): Promise<ResumeParseResult> => {
    const response = await apiClient.post('/candidate-resume/parse', {
      resume_text: resumeText,
    });
    return response.data.data;
  },

  /**
   * 上传并解析简历文件
   */
  uploadResume: async (file: File): Promise<ResumeParseResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      '/candidate-resume/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * 检查是否有简历
   */
  checkResume: async (): Promise<{ hasResume: boolean }> => {
    const response = await apiClient.get('/candidate-resume/check');
    return response.data;
  },

  /**
   * 加载已解析的简历
   */
  loadResume: async (): Promise<ResumeParseResult> => {
    const response = await apiClient.get('/candidate-resume/load');
    return response.data.data;
  },

  /**
   * 删除简历
   */
  deleteResume: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/candidate-resume/delete');
    return response.data;
  },
};

/**
 * AI智能打招呼语生成服务
 */
export const aiGreetingService = {
  /**
   * 生成智能打招呼语
   */
  generateGreeting: async (
    request: GreetingGenerateRequest
  ): Promise<string> => {
    const response = await apiClient.post('/smart-greeting/generate', {
      candidate: request.candidate,
      job_name: request.jobName,
      job_description: request.jobDescription,
    });
    return response.data.greeting;
  },

  /**
   * 生成默认打招呼语
   */
  generateDefaultGreeting: async (
    candidate: ResumeParseResult
  ): Promise<string> => {
    const response = await apiClient.post(
      '/candidate-resume/generate-default-greeting',
      {
        candidate,
      }
    );
    return response.data.greeting;
  },

  /**
   * 保存默认打招呼语
   */
  saveDefaultGreeting: async (
    greeting: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(
      '/candidate-resume/save-default-greeting',
      {
        greeting,
      }
    );
    return response.data;
  },

  /**
   * 获取默认打招呼语
   */
  getDefaultGreeting: async (): Promise<string> => {
    try {
      const response = await apiClient.get(
        '/candidate-resume/get-default-greeting'
      );
      return response.data.greeting || '';
    } catch (error) {
      console.log('获取默认打招呼语失败，可能尚未设置');
      return '';
    }
  },
};

/**
 * 用户配置管理服务
 */
export const aiConfigService = {
  /**
   * 获取投递配置
   */
  getDeliveryConfig: async (): Promise<any> => {
    const response = await apiClient.get('/config');
    return response.data;
  },

  /**
   * 保存投递配置
   */
  saveDeliveryConfig: async (
    config: any
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/config', config);
    return response.data;
  },

  /**
   * 获取AI配置
   */
  getAiConfig: async (): Promise<any> => {
    const response = await apiClient.get('/ai-config');
    return response.data;
  },

  /**
   * 保存AI配置
   */
  saveAiConfig: async (
    config: any
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/ai-config', config);
    return response.data;
  },

  /**
   * 获取简历内容
   */
  getResumeContent: async (): Promise<any> => {
    const response = await apiClient.get('/resume');
    return response.data;
  },

  /**
   * 保存简历内容
   */
  saveResumeContent: async (
    content: any
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/resume', content);
    return response.data;
  },
};

/**
 * Boss直聘自动投递服务
 */
export const aiBossService = {
  /**
   * 配置Boss登录Cookie
   */
  saveBossCookie: async (
    cookie: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/boss-cookie/cookie', {
      cookie,
    });
    return response.data;
  },

  /**
   * 获取Boss Cookie
   */
  getBossCookie: async (): Promise<{ cookie: string }> => {
    const response = await apiClient.get('/boss-cookie/cookie');
    return response.data;
  },

  /**
   * 启动混合投递
   */
  startHybridDelivery: async (
    userId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(
      '/boss-cookie/start-hybrid-delivery',
      null,
      {
        params: { userId },
      }
    );
    return response.data;
  },

  /**
   * 启动Boss投递任务
   */
  startBossTask: async (
    config: any
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/start-boss-task', config);
    return response.data;
  },

  /**
   * 停止Boss投递任务
   */
  stopBossTask: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/stop-program');
    return response.data;
  },

  /**
   * 获取投递状态
   */
  getDeliveryStatus: async (): Promise<any> => {
    const response = await apiClient.get('/status');
    return response.data;
  },

  /**
   * 获取运行日志
   */
  getLogs: async (): Promise<string> => {
    const response = await apiClient.get('/logs');
    return response.data;
  },
};

/**
 * AI服务统一导出
 */
export default {
  resume: aiResumeService,
  greeting: aiGreetingService,
  config: aiConfigService,
  boss: aiBossService,
};
