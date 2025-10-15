/**
 * AI Service 边界测试
 *
 * 测试API异常场景、网络问题和数据边界
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

import { aiGreetingService, aiResumeService } from './aiService';
import apiClient from './apiService';

jest.mock('./apiService');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('aiResumeService - 边界测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('网络异常场景', () => {
    test('应该处理API响应超时', async () => {
      mockedApiClient.post.mockRejectedValue(
        new Error('timeout of 30000ms exceeded')
      );

      await expect(aiResumeService.parseResume('测试')).rejects.toThrow(
        'timeout'
      );
    });

    test('应该处理网络中断', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Network Error'));

      await expect(aiResumeService.parseResume('测试')).rejects.toThrow(
        'Network Error'
      );
    });

    test('应该处理429限流错误', async () => {
      const error: any = new Error('Too Many Requests');
      error.response = { status: 429 };
      mockedApiClient.post.mockRejectedValue(error);

      await expect(aiResumeService.parseResume('测试')).rejects.toThrow();
    });

    test('应该处理502 Bad Gateway', async () => {
      const error: any = new Error('Bad Gateway');
      error.response = { status: 502 };
      mockedApiClient.post.mockRejectedValue(error);

      await expect(aiResumeService.parseResume('测试')).rejects.toThrow();
    });

    test('应该处理503 Service Unavailable', async () => {
      const error: any = new Error('Service Unavailable');
      error.response = { status: 503 };
      mockedApiClient.post.mockRejectedValue(error);

      await expect(aiResumeService.parseResume('测试')).rejects.toThrow();
    });
  });

  describe('空响应和异常数据', () => {
    test('应该处理空响应', async () => {
      mockedApiClient.post.mockResolvedValue({ data: {} } as any);

      const result = await aiResumeService.parseResume('测试');

      expect(result).toBeUndefined();
    });

    test('应该处理null响应', async () => {
      mockedApiClient.post.mockResolvedValue({ data: null } as any);

      const result = await aiResumeService.parseResume('测试');

      expect(result).toBeNull();
    });

    test('应该处理data字段为undefined', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: { data: undefined },
      } as any);

      const result = await aiResumeService.parseResume('测试');

      expect(result).toBeUndefined();
    });

    test('应该处理格式错误的JSON', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Unexpected token'));

      await expect(aiResumeService.parseResume('测试')).rejects.toThrow();
    });
  });

  describe('部分字段缺失', () => {
    test('应该处理缺少skills字段', async () => {
      const mockResponse = {
        data: {
          data: {
            name: '张三',
            current_title: '工程师',
            years_experience: 5,
            // skills: missing
            core_strengths: ['优势'],
            education: '本科',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.parseResume('测试');

      expect(result.name).toBe('张三');
      expect(result.skills).toBeUndefined();
    });

    test('应该处理缺少confidence字段', async () => {
      const mockResponse = {
        data: {
          data: {
            name: '张三',
            current_title: '工程师',
            years_experience: 5,
            skills: ['Java'],
            core_strengths: ['优势'],
            education: '本科',
            // confidence: missing
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.parseResume('测试');

      expect(result.confidence).toBeUndefined();
    });

    test('应该处理所有可选字段都缺失', async () => {
      const mockResponse = {
        data: {
          data: {
            name: '张三',
            current_title: '工程师',
            years_experience: 5,
            skills: ['Java'],
            core_strengths: ['优势'],
            education: '本科',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
            // 所有可选字段都缺失
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.parseResume('测试');

      expect(result.company).toBeUndefined();
      expect(result.phone).toBeUndefined();
      expect(result.email).toBeUndefined();
    });
  });

  describe('数据类型不匹配', () => {
    test('应该处理years_experience为字符串', async () => {
      const mockResponse = {
        data: {
          data: {
            name: '张三',
            current_title: '工程师',
            years_experience: '5年' as any, // 应该是数字
            skills: ['Java'],
            core_strengths: ['优势'],
            education: '本科',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.parseResume('测试');

      expect(result.years_experience).toBe('5年');
    });

    test('应该处理skills为字符串而非数组', async () => {
      const mockResponse = {
        data: {
          data: {
            name: '张三',
            current_title: '工程师',
            years_experience: 5,
            skills: 'Java, Python' as any, // 应该是数组
            core_strengths: ['优势'],
            education: '本科',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.parseResume('测试');

      expect(result.skills).toBe('Java, Python');
    });

    test('应该处理confidence为数字而非对象', async () => {
      const mockResponse = {
        data: {
          data: {
            name: '张三',
            current_title: '工程师',
            years_experience: 5,
            skills: ['Java'],
            core_strengths: ['优势'],
            education: '本科',
            confidence: 0.9 as any, // 应该是对象
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.parseResume('测试');

      expect(result.confidence).toBe(0.9);
    });
  });

  describe('极端数据量', () => {
    test('应该处理超大技能列表（1000+）', async () => {
      const mockResponse = {
        data: {
          data: {
            name: '张三',
            current_title: '工程师',
            years_experience: 5,
            skills: Array(1000).fill('技能'),
            core_strengths: ['优势'],
            education: '本科',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.parseResume('测试');

      expect(result.skills).toHaveLength(1000);
    });

    test('应该处理空数组', async () => {
      const mockResponse = {
        data: {
          data: {
            name: '张三',
            current_title: '工程师',
            years_experience: 5,
            skills: [],
            core_strengths: [],
            education: '本科',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.parseResume('测试');

      expect(result.skills).toEqual([]);
      expect(result.core_strengths).toEqual([]);
    });

    test('应该处理包含null元素的数组', async () => {
      const mockResponse = {
        data: {
          data: {
            name: '张三',
            current_title: '工程师',
            years_experience: 5,
            skills: ['Java', null, 'Python', undefined, ''] as any,
            core_strengths: ['优势'],
            education: '本科',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.parseResume('测试');

      expect(result.skills).toContain('Java');
      expect(result.skills).toContain(null);
    });
  });

  describe('文件上传边界测试', () => {
    test('应该处理文件名包含特殊字符', async () => {
      const specialFile = new File(['内容'], '简历<>:"|?*.pdf', {
        type: 'application/pdf',
      });

      const mockResponse = {
        data: {
          data: {
            name: '测试',
            current_title: '测试',
            years_experience: 1,
            skills: ['测试'],
            core_strengths: ['测试'],
            education: '测试',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.uploadResume(specialFile);

      expect(result).toEqual(mockResponse.data.data);
    });

    test('应该处理零字节文件', async () => {
      const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });

      mockedApiClient.post.mockRejectedValue(new Error('文件为空'));

      await expect(aiResumeService.uploadResume(emptyFile)).rejects.toThrow(
        '文件为空'
      );
    });

    test('应该处理文件类型不匹配（扩展名与MIME类型不符）', async () => {
      const mismatchFile = new File(['内容'], 'resume.pdf', {
        type: 'text/plain', // 类型不匹配
      });

      const mockResponse = {
        data: {
          data: {
            name: '测试',
            current_title: '测试',
            years_experience: 1,
            skills: ['测试'],
            core_strengths: ['测试'],
            education: '测试',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.uploadResume(mismatchFile);

      expect(result).toBeDefined();
    });
  });

  describe('并发请求处理', () => {
    test('应该处理并发的parseResume请求', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          data: {
            name: '测试',
            current_title: '测试',
            years_experience: 1,
            skills: ['测试'],
            core_strengths: ['测试'],
            education: '测试',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
          },
        },
      });

      // 并发10个请求
      const promises = Array(10)
        .fill(null)
        .map((_, i) => aiResumeService.parseResume(`测试${i}`));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(mockedApiClient.post).toHaveBeenCalledTimes(10);
    });

    test('应该处理部分请求失败的并发场景', async () => {
      let callCount = 0;
      mockedApiClient.post.mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 0) {
          return Promise.reject(new Error('失败'));
        }
        return Promise.resolve({
          data: {
            data: {
              name: '测试',
              current_title: '测试',
              years_experience: 1,
              skills: ['测试'],
              core_strengths: ['测试'],
              education: '测试',
              confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
            },
          },
        });
      });

      const promises = Array(4)
        .fill(null)
        .map((_, i) => aiResumeService.parseResume(`测试${i}`).catch(e => e));

      const results = await Promise.all(promises);

      // 一半成功，一半失败
      const errors = results.filter(r => r instanceof Error);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('空值和边界值', () => {
    test('应该处理所有字段为null', async () => {
      const mockResponse = {
        data: {
          data: {
            name: null,
            current_title: null,
            years_experience: null,
            skills: null,
            core_strengths: null,
            education: null,
            confidence: null,
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse as any);

      const result = await aiResumeService.parseResume('测试');

      expect(result.name).toBeNull();
      expect(result.skills).toBeNull();
    });

    test('应该处理工作年限为负数', async () => {
      const mockResponse = {
        data: {
          data: {
            name: '张三',
            current_title: '工程师',
            years_experience: -5, // 负数
            skills: ['Java'],
            core_strengths: ['优势'],
            education: '本科',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.parseResume('测试');

      expect(result.years_experience).toBe(-5);
    });

    test('应该处理工作年限为极大值', async () => {
      const mockResponse = {
        data: {
          data: {
            name: '张三',
            current_title: '工程师',
            years_experience: 999999,
            skills: ['Java'],
            core_strengths: ['优势'],
            education: '本科',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.parseResume('测试');

      expect(result.years_experience).toBe(999999);
    });

    test('应该处理置信度超出范围（>1）', async () => {
      const mockResponse = {
        data: {
          data: {
            name: '张三',
            current_title: '工程师',
            years_experience: 5,
            skills: ['Java'],
            core_strengths: ['优势'],
            education: '本科',
            confidence: { name: 1.5, skills: 2.0, experience: -0.5 },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.parseResume('测试');

      expect(result.confidence.name).toBe(1.5);
      expect(result.confidence.skills).toBe(2.0);
    });
  });

  describe('特殊字符和编码', () => {
    test('应该处理包含Emoji的简历文本', async () => {
      const emojiText = '姓名：张三😀\n职位：工程师👨‍💻\n技能：Java☕';

      const mockResponse = {
        data: {
          data: {
            name: '张三😀',
            current_title: '工程师👨‍💻',
            years_experience: 5,
            skills: ['Java☕'],
            core_strengths: ['优势'],
            education: '本科',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.parseResume(emojiText);

      expect(result).toEqual(mockResponse.data.data);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/candidate-resume/parse',
        { resume_text: emojiText }
      );
    });

    test('应该处理包含零宽字符的文本', async () => {
      const zeroWidthText = '张三\u200B工程师\u200C测试\u200D';

      const mockResponse = {
        data: {
          data: {
            name: '张三',
            current_title: '工程师',
            years_experience: 5,
            skills: ['测试'],
            core_strengths: ['优势'],
            education: '本科',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.parseResume(zeroWidthText);

      expect(result).toEqual(mockResponse.data.data);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/candidate-resume/parse',
        { resume_text: zeroWidthText }
      );
    });

    test('应该处理包含控制字符的文本', async () => {
      const controlCharsText = '张三\u0000\u0001\u0002测试';

      const mockResponse = {
        data: {
          data: {
            name: '张三',
            current_title: '测试',
            years_experience: 5,
            skills: ['测试'],
            core_strengths: ['优势'],
            education: '本科',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiResumeService.parseResume(controlCharsText);

      expect(result).toEqual(mockResponse.data.data);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/candidate-resume/parse',
        { resume_text: controlCharsText }
      );
    });
  });

  describe('重试机制测试', () => {
    test('应该在第一次失败后重试成功', async () => {
      let attemptCount = 0;
      mockedApiClient.post.mockImplementation(() => {
        attemptCount++;
        if (attemptCount === 1) {
          return Promise.reject(new Error('首次失败'));
        }
        return Promise.resolve({
          data: {
            data: {
              name: '张三',
              current_title: '工程师',
              years_experience: 5,
              skills: ['Java'],
              core_strengths: ['优势'],
              education: '本科',
              confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
            },
          },
        });
      });

      // 第一次调用失败
      await expect(aiResumeService.parseResume('测试')).rejects.toThrow();

      // 第二次调用成功
      const result = await aiResumeService.parseResume('测试');
      expect(result).toBeDefined();
    });
  });
});

describe('aiGreetingService - 边界测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('打招呼语生成边界', () => {
    test('应该处理候选人信息为空对象', async () => {
      const emptyCandidate = {} as any;

      mockedApiClient.post.mockResolvedValue({
        data: { greeting: '您好！' },
      });

      const result =
        await aiGreetingService.generateDefaultGreeting(emptyCandidate);

      expect(result).toBe('您好！');
    });

    test('应该处理候选人信息包含特殊字符', async () => {
      const specialCandidate = {
        name: '<张三>',
        current_title: '"工程师"',
        years_experience: 5,
        skills: ['Java & Spring', 'Python | Django'],
        core_strengths: ['优势 & 亮点'],
        education: '本科',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      };

      mockedApiClient.post.mockResolvedValue({
        data: { greeting: '您好！我是张三...' },
      });

      const result =
        await aiGreetingService.generateDefaultGreeting(specialCandidate);

      expect(result).toBeDefined();
    });

    test('应该处理极长的打招呼语（>10KB）', async () => {
      const veryLongGreeting = '您好！'.repeat(5000);

      mockedApiClient.post.mockResolvedValue({
        data: { greeting: veryLongGreeting },
      });

      const result = await aiGreetingService.generateDefaultGreeting({
        name: '测试',
        current_title: '测试',
        years_experience: 1,
        skills: ['测试'],
        core_strengths: ['测试'],
        education: '测试',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      });

      expect(result).toBe(veryLongGreeting);
      expect(result.length).toBeGreaterThan(10000);
    });
  });

  describe('保存打招呼语边界', () => {
    test('应该允许保存空字符串', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: { success: true, message: '保存成功' },
      });

      await aiGreetingService.saveDefaultGreeting('');

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/candidate-resume/save-default-greeting',
        { greeting: '' }
      );
    });

    test('应该处理包含换行符的打招呼语', async () => {
      const multilineGreeting = '您好！\n\n我是一名工程师。\n\n期待合作！';

      mockedApiClient.post.mockResolvedValue({
        data: { success: true, message: '保存成功' },
      });

      const result =
        await aiGreetingService.saveDefaultGreeting(multilineGreeting);

      expect(result).toEqual({ success: true, message: '保存成功' });
    });

    test('应该处理包含制表符的打招呼语', async () => {
      const tabbedGreeting = '您好！\t我是工程师\t期待合作';

      mockedApiClient.post.mockResolvedValue({
        data: { success: true, message: '保存成功' },
      });

      await aiGreetingService.saveDefaultGreeting(tabbedGreeting);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/candidate-resume/save-default-greeting',
        { greeting: tabbedGreeting }
      );
    });
  });

  describe('checkResume边界测试', () => {
    test('应该处理hasResume字段缺失', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {}, // 缺少hasResume字段
      });

      const result = await aiResumeService.checkResume();

      expect(result.hasResume).toBeUndefined();
    });

    test('应该处理hasResume为非布尔值', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { hasResume: 'yes' as any },
      });

      const result = await aiResumeService.checkResume();

      expect(result.hasResume).toBe('yes');
    });
  });

  describe('API响应异常结构', () => {
    test('应该处理响应data嵌套层级错误', async () => {
      mockedApiClient.post.mockResolvedValue({
        wrongData: { candidate: {} }, // 错误的结构
      } as any);

      const result = await aiResumeService.parseResume('测试');

      expect(result).toBeUndefined();
    });

    test('应该处理响应包含额外未知字段', async () => {
      const mockResponse = {
        data: {
          data: {
            name: '张三',
            current_title: '工程师',
            years_experience: 5,
            skills: ['Java'],
            core_strengths: ['优势'],
            education: '本科',
            confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
            unknownField1: '额外字段',
            unknownField2: { nested: 'data' },
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse as any);

      const result = await aiResumeService.parseResume('测试');

      expect(result.name).toBe('张三');
      expect((result as any).unknownField1).toBe('额外字段');
    });
  });
});
