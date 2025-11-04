/**
 * AI服务层单元测试
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

import { aiGreetingService, aiResumeService } from './aiService';
import apiClient from './apiService';

// Mock apiClient
jest.mock('./apiService');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('aiResumeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseResume', () => {
    test('应该正确调用简历解析API', async () => {
      const mockResponse = {
        data: {
          data: {
            name: '张三',
            current_title: '软件工程师',
            years_experience: 5,
            skills: ['Java', 'Python'],
            core_strengths: ['技术能力强'],
            education: '本科',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.parseResume('测试简历文本');

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/candidate-resume/parse',
        {
          resume_text: '测试简历文本',
        }
      );
      expect(result).toEqual(mockResponse.data.data);
    });

    test('应该处理API错误', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('网络错误'));

      await expect(aiResumeService.parseResume('测试')).rejects.toThrow(
        '网络错误'
      );
    });
  });

  describe('uploadResume', () => {
    test('应该正确上传文件并返回解析结果', async () => {
      const mockFile = new File(['content'], 'resume.pdf', {
        type: 'application/pdf',
      });
      const mockResponse = {
        data: {
          data: {
            name: '李四',
            current_title: '产品经理',
            years_experience: 3,
            skills: ['产品设计'],
            core_strengths: ['沟通能力强'],
            education: '硕士',
            confidence: { name: 0.95, skills: 0.85, experience: 0.9 },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.uploadResume(mockFile);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/candidate-resume/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('checkResume', () => {
    test('应该正确检查简历是否存在', async () => {
      const mockResponse = {
        data: { hasResume: true },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await aiResumeService.checkResume();

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/candidate-resume/check'
      );
      expect(result).toEqual({ hasResume: true });
    });
  });

  describe('loadResume', () => {
    test('应该正确加载已有简历', async () => {
      const mockResponse = {
        data: {
          data: {
            name: '王五',
            current_title: '设计师',
            years_experience: 4,
            skills: ['UI设计'],
            core_strengths: ['创意能力强'],
            education: '本科',
            confidence: { name: 0.9, skills: 0.88, experience: 0.87 },
          },
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await aiResumeService.loadResume();

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/candidate-resume/load'
      );
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('deleteResume', () => {
    test('应该正确删除简历', async () => {
      const mockResponse = {
        data: { success: true, message: '删除成功' },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.deleteResume();

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/candidate-resume/delete'
      );
      expect(result).toEqual({ success: true, message: '删除成功' });
    });
  });
});

describe('aiGreetingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateGreeting', () => {
    test('应该正确生成智能打招呼语', async () => {
      const mockCandidate = {
        candidate_name: '张三',
        name: '张三',
        current_title: '软件工程师',
        years_experience: 5,
        skills: ['Java'],
        core_strengths: ['技术能力强'],
        education: '本科',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      };

      const mockResponse = {
        data: { greeting: '您好！我是一名经验丰富的软件工程师...' },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiGreetingService.generateGreeting({
        candidate: mockCandidate,
        jobName: 'Java开发工程师',
        jobDescription: '负责后端开发',
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/smart-greeting/generate',
        {
          candidate: mockCandidate,
          job_name: 'Java开发工程师',
          job_description: '负责后端开发',
        }
      );
      expect(result).toBe('您好！我是一名经验丰富的软件工程师...');
    });
  });

  describe('generateDefaultGreeting', () => {
    test('应该正确生成默认打招呼语', async () => {
      const mockCandidate = {
        candidate_name: '李四',
        name: '李四',
        current_title: '产品经理',
        years_experience: 3,
        skills: ['产品设计'],
        core_strengths: ['沟通能力强'],
        education: '硕士',
        confidence: { name: 0.95, skills: 0.85, experience: 0.9 },
      };

      const mockResponse = {
        data: { greeting: '您好！我是一名产品经理...' },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result =
        await aiGreetingService.generateDefaultGreeting(mockCandidate);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/candidate-resume/generate-default-greeting',
        { candidate: mockCandidate }
      );
      expect(result).toBe('您好！我是一名产品经理...');
    });

    test('应该处理生成失败', async () => {
      const mockCandidate = {
        candidate_name: '测试',
        name: '测试',
        current_title: '测试',
        years_experience: 1,
        skills: ['测试'],
        core_strengths: ['测试'],
        education: '测试',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      };

      mockedApiClient.post.mockRejectedValue(new Error('AI服务异常'));

      await expect(
        aiGreetingService.generateDefaultGreeting(mockCandidate)
      ).rejects.toThrow('AI服务异常');
    });
  });

  describe('saveDefaultGreeting', () => {
    test('应该正确保存默认打招呼语', async () => {
      const mockResponse = {
        data: { success: true, message: '保存成功' },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result =
        await aiGreetingService.saveDefaultGreeting('测试打招呼语');

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/candidate-resume/save-default-greeting',
        { greeting: '测试打招呼语' }
      );
      expect(result).toEqual({ success: true, message: '保存成功' });
    });

    test('应该验证空字符串', async () => {
      const mockResponse = {
        data: { success: true, message: '保存成功' },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      await aiGreetingService.saveDefaultGreeting('');

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/candidate-resume/save-default-greeting',
        { greeting: '' }
      );
    });
  });
});
