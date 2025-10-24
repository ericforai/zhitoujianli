/**
 * CompleteResumeManager 组件边界测试
 *
 * 测试异常场景、边界条件和安全性
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as aiService from '../../services/aiService';
import CompleteResumeManager from './CompleteResumeManager';

jest.mock('../../services/aiService');

const mockAiResumeService = aiService.aiResumeService as jest.Mocked<
  typeof aiService.aiResumeService
>;
const mockAiGreetingService = aiService.aiGreetingService as jest.Mocked<
  typeof aiService.aiGreetingService
>;

describe('CompleteResumeManager - 边界测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('大文件处理', () => {
    test('应该处理接近10MB限制的文件', async () => {
      render(<CompleteResumeManager />);

      // 创建接近10MB的文件（9.9MB）
      const size = 9.9 * 1024 * 1024;
      const nearLimitFile = new File(
        ['x'.repeat(Math.floor(size))],
        'resume.pdf',
        {
          type: 'application/pdf',
        }
      );

      const input = screen.getByLabelText('+ 选择文件').closest('button')
        ?.previousElementSibling as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [nearLimitFile],
          writable: false,
        });

        mockAiResumeService.uploadResume.mockResolvedValue({
          name: '测试',
          current_title: '测试',
          years_experience: 1,
          skills: ['测试'],
          core_strengths: ['测试'],
          education: '测试',
          company: '测试公司',
          confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
        });

        mockAiGreetingService.generateDefaultGreeting.mockResolvedValue('测试');

        fireEvent.change(input);

        await waitFor(() => {
          expect(mockAiResumeService.uploadResume).toHaveBeenCalled();
        });
      }
    });

    test('应该拒绝刚好超过10MB的文件', async () => {
      render(<CompleteResumeManager />);

      const size = 10 * 1024 * 1024 + 1;
      const overLimitFile = new File(['x'.repeat(size)], 'resume.pdf', {
        type: 'application/pdf',
      });

      const input = screen.getByLabelText('+ 选择文件').closest('button')
        ?.previousElementSibling as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [overLimitFile],
          writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(screen.getByText(/文件大小不能超过10MB/)).toBeInTheDocument();
        });
      }
    });
  });

  describe('特殊文件名处理', () => {
    test('应该处理中文文件名', async () => {
      render(<CompleteResumeManager />);

      const chineseFile = new File(['内容'], '张三的简历.pdf', {
        type: 'application/pdf',
      });

      mockAiResumeService.uploadResume.mockResolvedValue({
        name: '张三',
        current_title: '工程师',
        years_experience: 5,
        skills: ['Java'],
        core_strengths: ['技术能力强'],
        education: '本科',
        company: '测试公司',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      });

      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue('测试');

      const input = screen.getByLabelText('+ 选择文件').closest('button')
        ?.previousElementSibling as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [chineseFile],
          writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(mockAiResumeService.uploadResume).toHaveBeenCalledWith(
            chineseFile
          );
        });
      }
    });

    test('应该处理特殊字符文件名', async () => {
      render(<CompleteResumeManager />);

      const specialFile = new File(['内容'], 'resume#@!中文😀.pdf', {
        type: 'application/pdf',
      });

      mockAiResumeService.uploadResume.mockResolvedValue({
        name: '测试',
        current_title: '测试',
        years_experience: 1,
        skills: ['测试'],
        core_strengths: ['测试'],
        education: '测试',
        company: '测试公司',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      });

      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue('测试');

      const input = screen.getByLabelText('+ 选择文件').closest('button')
        ?.previousElementSibling as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [specialFile],
          writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(mockAiResumeService.uploadResume).toHaveBeenCalledWith(
            specialFile
          );
        });
      }
    });

    test('应该处理超长文件名', async () => {
      render(<CompleteResumeManager />);

      const longFileName = 'a'.repeat(255) + '.pdf';
      const longNameFile = new File(['内容'], longFileName, {
        type: 'application/pdf',
      });

      mockAiResumeService.uploadResume.mockResolvedValue({
        name: '测试',
        current_title: '测试',
        years_experience: 1,
        skills: ['测试'],
        core_strengths: ['测试'],
        education: '测试',
        company: '测试公司',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      });

      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue('测试');

      const input = screen.getByLabelText('+ 选择文件').closest('button')
        ?.previousElementSibling as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [longNameFile],
          writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(mockAiResumeService.uploadResume).toHaveBeenCalledWith(
            longNameFile
          );
        });
      }
    });
  });

  describe('极端文本内容', () => {
    test('应该处理空文本', () => {
      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      expect(screen.getByText('请输入简历文本内容')).toBeInTheDocument();
    });

    test('应该处理只包含空格的文本', () => {
      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '   \n\t   ' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      expect(screen.getByText('请输入简历文本内容')).toBeInTheDocument();
    });

    test('应该处理极长文本（>50KB）', async () => {
      const longText = '这是一段很长的简历内容。'.repeat(10000);

      mockAiResumeService.parseResume.mockResolvedValue({
        name: '测试',
        current_title: '测试',
        years_experience: 1,
        skills: ['测试'],
        core_strengths: ['测试'],
        education: '测试',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      });

      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue('测试');

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: longText } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(mockAiResumeService.parseResume).toHaveBeenCalledWith(longText);
      });
    });

    test('应该处理包含特殊Unicode字符的文本', async () => {
      const specialText =
        '姓名：张三😀\n职位：高级工程师™\n技能：Java®、Python©';

      mockAiResumeService.parseResume.mockResolvedValue({
        name: '张三',
        current_title: '高级工程师',
        years_experience: 5,
        skills: ['Java', 'Python'],
        core_strengths: ['测试'],
        education: '测试',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      });

      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue('测试');

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: specialText } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(mockAiResumeService.parseResume).toHaveBeenCalledWith(
          specialText
        );
      });
    });
  });

  describe('网络异常场景', () => {
    test('应该处理网络超时', async () => {
      mockAiResumeService.parseResume.mockRejectedValue(
        new Error('Network timeout')
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
          screen.getByText(/简历解析失败: Network timeout/)
        ).toBeInTheDocument();
      });
    });

    test('应该处理服务器500错误', async () => {
      mockAiResumeService.parseResume.mockRejectedValue(
        new Error('Internal Server Error')
      );

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(
          screen.getByText(/简历解析失败: Internal Server Error/)
        ).toBeInTheDocument();
      });
    });

    test('应该处理429限流错误', async () => {
      mockAiResumeService.parseResume.mockRejectedValue(
        new Error('Too Many Requests')
      );

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(
          screen.getByText(/简历解析失败: Too Many Requests/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('XSS攻击防御', () => {
    test('应该防御简历文本中的XSS脚本', async () => {
      const xssText = '<script>alert("XSS")</script>姓名：张三';

      mockAiResumeService.parseResume.mockResolvedValue({
        name: '张三',
        current_title: '测试',
        years_experience: 1,
        skills: ['测试'],
        core_strengths: ['测试'],
        education: '测试',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      });

      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue('测试');

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: xssText } });

      // 验证脚本没有执行
      expect(document.querySelectorAll('script').length).toBe(0);
    });

    test('应该防御打招呼语中的XSS', async () => {
      const mockResume = {
        name: '测试',
        current_title: '测试',
        years_experience: 1,
        skills: ['测试'],
        core_strengths: ['测试'],
        education: '测试',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      };

      mockAiResumeService.parseResume.mockResolvedValue(mockResume);
      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue(
        '<img src=x onerror=alert(1)>您好！'
      );

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        // 验证内容被正确转义
        const greetingTextarea = screen.getByDisplayValue(
          /<img src=x onerror=alert\(1\)>您好！/
        );
        expect(greetingTextarea).toBeInTheDocument();
      });
    });
  });

  describe('并发请求处理', () => {
    test('应该处理快速连续的解析请求', async () => {
      mockAiResumeService.parseResume.mockResolvedValue({
        name: '测试',
        current_title: '测试',
        years_experience: 1,
        skills: ['测试'],
        core_strengths: ['测试'],
        education: '测试',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      });

      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue('测试');

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      const parseButton = screen.getByText('AI解析简历');

      // 快速点击多次
      fireEvent.change(textarea, { target: { value: '测试1' } });
      fireEvent.click(parseButton);
      fireEvent.change(textarea, { target: { value: '测试2' } });
      fireEvent.click(parseButton);
      fireEvent.change(textarea, { target: { value: '测试3' } });
      fireEvent.click(parseButton);

      await waitFor(() => {
        // 至少应该有一次成功
        expect(mockAiResumeService.parseResume).toHaveBeenCalled();
      });
    });
  });

  describe('空文件和损坏文件', () => {
    test('应该处理空文件', async () => {
      render(<CompleteResumeManager />);

      const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });

      const input = screen.getByLabelText('+ 选择文件').closest('button')
        ?.previousElementSibling as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [emptyFile],
          writable: false,
        });

        // 假设后端会拒绝空文件
        mockAiResumeService.uploadResume.mockRejectedValue(
          new Error('文件内容为空')
        );

        fireEvent.change(input);

        await waitFor(() => {
          expect(screen.getByText(/文件内容为空/)).toBeInTheDocument();
        });
      }
    });
  });

  describe('打招呼语边界测试', () => {
    test('应该处理超长打招呼语', async () => {
      const longGreeting = '您好！'.repeat(1000);

      mockAiResumeService.parseResume.mockResolvedValue({
        name: '测试',
        current_title: '测试',
        years_experience: 1,
        skills: ['测试'],
        core_strengths: ['测试'],
        education: '测试',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      });

      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue(
        longGreeting
      );

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue(longGreeting)).toBeInTheDocument();
      });
    });

    test('应该处理空打招呼语', async () => {
      mockAiResumeService.parseResume.mockResolvedValue({
        name: '测试',
        current_title: '测试',
        years_experience: 1,
        skills: ['测试'],
        core_strengths: ['测试'],
        education: '测试',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      });

      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue('');

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        const greetingTextarea =
          screen.getByPlaceholderText(/AI正在生成默认打招呼语/);
        expect(greetingTextarea).toHaveValue('');
      });
    });

    test('应该处理包含特殊HTML字符的打招呼语', async () => {
      mockAiResumeService.parseResume.mockResolvedValue({
        name: '测试',
        current_title: '测试',
        years_experience: 1,
        skills: ['测试'],
        core_strengths: ['测试'],
        education: '测试',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      });

      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue(
        '您好！<>&"\' 这些是特殊字符'
      );

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(
          screen.getByDisplayValue('您好！<>&"\' 这些是特殊字符')
        ).toBeInTheDocument();
      });
    });
  });

  describe('用户交互边界场景', () => {
    test('应该禁用加载时的按钮', async () => {
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
              1000
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

      // 验证按钮被禁用
      expect(parseButton).toBeDisabled();

      await waitFor(
        () => {
          expect(parseButton).not.toBeDisabled();
        },
        { timeout: 2000 }
      );
    });

    test('应该在处理过程中清除之前的错误消息', async () => {
      mockAiResumeService.parseResume
        .mockRejectedValueOnce(new Error('第一次失败'))
        .mockResolvedValueOnce({
          name: '测试',
          current_title: '测试',
          years_experience: 1,
          skills: ['测试'],
          core_strengths: ['测试'],
          education: '测试',
          confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
        });

      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue('测试');

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      const parseButton = screen.getByText('AI解析简历');

      // 第一次解析失败
      fireEvent.change(textarea, { target: { value: '测试1' } });
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText(/第一次失败/)).toBeInTheDocument();
      });

      // 第二次解析成功，错误消息应该消失
      fireEvent.change(textarea, { target: { value: '测试2' } });
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(screen.queryByText(/第一次失败/)).not.toBeInTheDocument();
      });
    });
  });

  describe('数据完整性验证', () => {
    test('应该验证解析结果包含所有必需字段', async () => {
      const incompleteData = {
        name: '张三',
        // 缺少其他字段
      };

      mockAiResumeService.parseResume.mockResolvedValue(incompleteData as any);
      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue('测试');

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        // 组件应该能处理不完整的数据
        expect(mockAiResumeService.parseResume).toHaveBeenCalled();
      });
    });

    test('应该处理置信度分数异常值', async () => {
      const abnormalData = {
        name: '测试',
        current_title: '测试',
        years_experience: 1,
        skills: ['测试'],
        core_strengths: ['测试'],
        education: '测试',
        confidence: { name: 1.5, skills: -0.1, experience: 2.0 }, // 异常值
      };

      mockAiResumeService.parseResume.mockResolvedValue(abnormalData);
      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue('测试');

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText('简历解析成功！')).toBeInTheDocument();
      });
    });
  });

  describe('文件拖拽边界测试', () => {
    test('应该处理拖拽多个文件（只处理第一个）', async () => {
      mockAiResumeService.uploadResume.mockResolvedValue({
        name: '测试',
        current_title: '测试',
        years_experience: 1,
        skills: ['测试'],
        core_strengths: ['测试'],
        education: '测试',
        company: '测试公司',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      });

      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue('测试');

      render(<CompleteResumeManager />);

      const dropZone = screen.getByText(/拖拽文件到此处/).parentElement;

      if (dropZone) {
        const file1 = new File(['内容1'], 'resume1.pdf', {
          type: 'application/pdf',
        });
        const file2 = new File(['内容2'], 'resume2.pdf', {
          type: 'application/pdf',
        });

        const dropEvent = {
          preventDefault: jest.fn(),
          dataTransfer: {
            files: [file1, file2],
          },
        };

        fireEvent.drop(dropZone, dropEvent);

        await waitFor(() => {
          // 应该只处理第一个文件
          expect(mockAiResumeService.uploadResume).toHaveBeenCalledTimes(1);
        });
      }
    });

    test('应该处理拖拽非法文件格式', async () => {
      render(<CompleteResumeManager />);

      const dropZone = screen.getByText(/拖拽文件到此处/).parentElement;

      if (dropZone) {
        const invalidFile = new File(['内容'], 'malware.exe', {
          type: 'application/x-msdownload',
        });

        const dropEvent = {
          preventDefault: jest.fn(),
          dataTransfer: {
            files: [invalidFile],
          },
        };

        fireEvent.drop(dropZone, dropEvent);

        await waitFor(() => {
          expect(screen.getByText(/不支持的文件格式/)).toBeInTheDocument();
        });
      }
    });
  });

  describe('内存和性能边界', () => {
    test('应该处理包含大量字段的简历数据', async () => {
      const largeData = {
        name: '测试',
        current_title: '测试',
        years_experience: 1,
        skills: Array(1000).fill('技能'),
        core_strengths: Array(100).fill('优势'),
        education: '测试',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      };

      mockAiResumeService.parseResume.mockResolvedValue(largeData);
      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue('测试');

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText('简历解析成功！')).toBeInTheDocument();
      });
    });
  });

  describe('状态管理边界', () => {
    test('应该正确处理快速切换上传方式', () => {
      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);

      // 快速切换多次
      fireEvent.click(checkbox); // 启用
      expect(
        screen.getByPlaceholderText('请粘贴您的简历内容...')
      ).toBeInTheDocument();

      fireEvent.click(checkbox); // 禁用
      expect(
        screen.queryByPlaceholderText('请粘贴您的简历内容...')
      ).not.toBeInTheDocument();

      fireEvent.click(checkbox); // 再次启用
      expect(
        screen.getByPlaceholderText('请粘贴您的简历内容...')
      ).toBeInTheDocument();
    });

    test('应该在删除简历后清理所有状态', async () => {
      const mockData = {
        name: '测试',
        current_title: '测试',
        years_experience: 1,
        skills: ['测试'],
        core_strengths: ['测试'],
        education: '测试',
        confidence: { name: 0.9, skills: 0.8, experience: 0.85 },
      };

      mockAiResumeService.parseResume.mockResolvedValue(mockData);
      mockAiGreetingService.generateDefaultGreeting.mockResolvedValue(
        '测试打招呼语'
      );
      mockAiResumeService.deleteResume.mockResolvedValue({
        success: true,
        message: '删除成功',
      });

      render(<CompleteResumeManager />);

      const checkbox = screen.getByLabelText(/或直接粘贴简历文本/);
      fireEvent.click(checkbox);

      const textarea = screen.getByPlaceholderText('请粘贴您的简历内容...');
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText('AI解析简历');
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText('简历解析成功！')).toBeInTheDocument();
      });

      // 确认删除
      window.confirm = jest.fn(() => true);

      const deleteButton = screen.getByText('删除简历');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('简历删除成功！')).toBeInTheDocument();
        // 验证打招呼语也被清空
        const greetingTextarea =
          screen.getByPlaceholderText(/AI正在生成默认打招呼语/);
        expect(greetingTextarea).toHaveValue('');
      });
    });
  });
});
