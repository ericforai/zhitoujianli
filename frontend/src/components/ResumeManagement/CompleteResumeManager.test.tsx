/**
 * CompleteResumeManager 组件单元测试
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as aiService from '../../services/aiService';
import CompleteResumeManager from './CompleteResumeManager';

// Mock aiService
jest.mock('../../services/aiService');

const mockAiResumeService = aiService.aiResumeService as jest.Mocked<
  typeof aiService.aiResumeService
>;
const mockAiGreetingService = aiService.aiGreetingService as jest.Mocked<
  typeof aiService.aiGreetingService
>;

describe('CompleteResumeManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('组件渲染', () => {
    test('应该正确渲染组件标题和说明', () => {
      render(<CompleteResumeManager />);

      expect(screen.getByText('简历管理')).toBeInTheDocument();
      expect(
        screen.getByText(/上传、编辑和管理您的简历信息/)
      ).toBeInTheDocument();
    });

    test('应该显示文件上传区域', () => {
      render(<CompleteResumeManager />);

      expect(screen.getByText(/拖拽文件到此处或点击上传/)).toBeInTheDocument();
      expect(screen.getByText('+ 选择文件')).toBeInTheDocument();
    });

    test('应该显示文本输入选项', () => {
      render(<CompleteResumeManager />);

      expect(screen.getByLabelText(/或直接粘贴简历文本/)).toBeInTheDocument();
    });
  });

  describe('文件上传功能', () => {
    test('应该验证文件格式', async () => {
      render(<CompleteResumeManager />);

      const file = new File(['test content'], 'test.exe', {
        type: 'application/x-msdownload',
      });
      const input = screen.getByLabelText('+ 选择文件').closest('button')
        ?.previousElementSibling as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
          writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(screen.getByText(/不支持的文件格式/)).toBeInTheDocument();
        });
      }
    });

    test('应该验证文件大小限制', async () => {
      render(<CompleteResumeManager />);

      // 创建一个超过10MB的文件
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf',
      });
      const input = screen.getByLabelText('+ 选择文件').closest('button')
        ?.previousElementSibling as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [largeFile],
          writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(screen.getByText(/文件大小不能超过10MB/)).toBeInTheDocument();
        });
      }
    });

    test('应该成功上传有效文件', async () => {
      const mockResumeData = {
        name: '张三',
        current_title: '软件工程师',
        years_experience: 5,
        skills: ['Java', 'Python'],
        core_strengths: ['技术能力强'],
        education: '本科',
        company: '测试公司',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      };

      mockAiResumeService.uploadResume.mockResolvedValue(mockResumeData);
      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue(
        '测试打招呼语'
      );

      render(<CompleteResumeManager />);

      const file = new File(['resume content'], 'resume.pdf', {
        type: 'application/pdf',
      });
      const input = screen.getByLabelText('+ 选择文件').closest('button')
        ?.previousElementSibling as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
          writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(mockAiResumeService.uploadResume).toHaveBeenCalledWith(file);
          expect(screen.getByText('简历上传并解析成功！')).toBeInTheDocument();
        });
      }
    });
  });

  describe('文本解析功能', () => {
    test('应该显示文本输入区域', () => {
      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      expect(
        screen.getByPlaceholderText('请粘贴您的简历内容...')
      ).toBeInTheDocument();
      expect(screen.getByText('AI解析简历')).toBeInTheDocument();
    });

    test('应该验证文本内容不能为空', () => {
      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      expect(screen.getByText('请输入简历文本内容')).toBeInTheDocument();
    });

    test('应该成功解析文本内容', async () => {
      const mockResumeData = {
        name: '李四',
        current_title: '产品经理',
        years_experience: 3,
        skills: ['产品设计', '需求分析'],
        core_strengths: ['沟通能力强'],
        education: '硕士',
        confidence: { name: 0.95, skills: 0.85, experience: 0.9 },
      };

      mockAiResumeService.parseResume.mockResolvedValue(mockResumeData);
      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue(
        '测试打招呼语'
      );

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '这是一份测试简历' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(mockAiResumeService.parseResume).toHaveBeenCalledWith(
          '这是一份测试简历'
        );
        expect(screen.getByText('简历解析成功！')).toBeInTheDocument();
      });
    });
  });

  describe('打招呼语生成功能', () => {
    test('应该在简历解析后自动生成打招呼语', async () => {
      const mockResumeData = {
        name: '王五',
        current_title: '设计师',
        years_experience: 4,
        skills: ['UI设计', 'UX设计'],
        core_strengths: ['创意能力强'],
        education: '本科',
        confidence: { name: 0.9, skills: 0.88, experience: 0.87 },
      };

      mockAiResumeService.parseResume.mockResolvedValue(mockResumeData);
      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue(
        '您好！我是一名经验丰富的设计师...'
      );

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '设计师简历' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(
          mockAiGreetingService.generateDefaultGreeting
        ).toHaveBeenCalledWith(mockResumeData);
      });
    });

    test('应该支持重新生成打招呼语', async () => {
      const mockResumeData = {
        name: '赵六',
        current_title: '运营专员',
        years_experience: 2,
        skills: ['内容运营', '数据分析'],
        core_strengths: ['执行力强'],
        education: '本科',
        confidence: { name: 0.92, skills: 0.86, experience: 0.84 },
      };

      mockAiResumeService.parseResume.mockResolvedValue(mockResumeData);
      mockAiGreetingService.generateDefaultGreeting
        .mockResolvedValueOnce('第一次生成的打招呼语')
        .mockResolvedValueOnce('重新生成的打招呼语');

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '运营简历' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(
          screen.getByDisplayValue('第一次生成的打招呼语')
        ).toBeInTheDocument();
      });

      const regenerateButton = screen.getByText('重新生成');
      fireEvent.click(regenerateButton);

      await waitFor(() => {
        expect(
          screen.getByDisplayValue('重新生成的打招呼语')
        ).toBeInTheDocument();
      });
    });
  });

  describe('错误处理', () => {
    test('应该正确显示API错误', async () => {
      mockAiResumeService.parseResume.mockRejectedValue(
        new Error('API调用失败')
      );

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '测试简历' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(
          screen.getByText(/简历解析失败: API调用失败/)
        ).toBeInTheDocument();
      });
    });

    test('应该处理打招呼语生成失败', async () => {
      const mockResumeData = {
        name: '测试',
        current_title: '测试',
        years_experience: 1,
        skills: ['测试'],
        core_strengths: ['测试'],
        education: '测试',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      };

      mockAiResumeService.parseResume.mockResolvedValue(mockResumeData);
      mockAiGreetingService.generateDefaultGreeting.mockRejectedValue(
        new Error('生成失败')
      );

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText(/默认打招呼语生成失败/)).toBeInTheDocument();
      });
    });
  });

  describe('加载状态', () => {
    test('应该在处理过程中显示加载状态', async () => {
      mockAiResumeService.parseResume.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  name: '测试',
                  current_title: '测试',
                  years_experience: 1,
                  skills: ['测试'],
                  core_strengths: ['测试'],
                  education: '测试',
                  confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
                }),
              100
            )
          )
      );

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      expect(screen.getByText('处理中...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('处理中...')).not.toBeInTheDocument();
      });
    });
  });
});
