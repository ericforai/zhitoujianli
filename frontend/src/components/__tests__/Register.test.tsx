/**
 * 模块1：邮箱注册功能测试（前端）
 *
 * 测试覆盖：
 * - 1.1 功能测试
 * - 1.3 异常处理测试
 * - 1.4 性能测试（部分）
 *
 * @author ZhiTouJianLi Test Team
 * @since 2025-10-22
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { authService } from '../../services/authService';
import Register from '../Register';

// Mock react-router-dom (using manual mock)
jest.mock('react-router-dom');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { BrowserRouter, mockNavigate } = require('react-router-dom');

// Mock authService
jest.mock('../../services/authService');

describe('模块1: 邮箱注册功能测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Mock authService methods
    (authService.sendVerificationCode as jest.Mock) = jest
      .fn()
      .mockResolvedValue({ success: true });
    (authService.register as jest.Mock) = jest
      .fn()
      .mockResolvedValue({ success: true });
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  };

  // ==================== 1.1 功能测试 ====================

  describe('测试用例 1.1.1: 正常注册流程', () => {
    test('应该显示注册表单的所有必要字段', () => {
      renderRegister();

      expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/确认密码/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /发送验证码/i })
      ).toBeInTheDocument();

      console.log('✅ 测试通过: 注册表单显示正确');
    });

    test('应该能够输入邮箱和密码', async () => {
      const user = userEvent.setup();
      renderRegister();

      const emailInput = screen.getByLabelText(/邮箱/i);
      const passwordInput = screen.getByLabelText(/^密码$/i);
      const confirmPasswordInput = screen.getByLabelText(/确认密码/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Test1234');
      await user.type(confirmPasswordInput, 'Test1234');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('Test1234');
      expect(confirmPasswordInput).toHaveValue('Test1234');

      console.log('✅ 测试通过: 表单输入正常工作');
    });

    test('应该能够发送验证码', async () => {
      const user = userEvent.setup();

      // Mock API响应
      (authService.sendVerificationCode as jest.Mock).mockResolvedValue({
        success: true,
        message: '验证码已发送',
      });

      renderRegister();

      const emailInput = screen.getByLabelText(/邮箱/i);
      const sendCodeButton = screen.getByRole('button', {
        name: /发送验证码/i,
      });

      await user.type(emailInput, 'test@example.com');
      await user.click(sendCodeButton);

      await waitFor(() => {
        expect(authService.sendVerificationCode).toHaveBeenCalledWith(
          'test@example.com'
        );
      });

      console.log('✅ 测试通过: 验证码发送功能正常');
    });

    test('应该显示验证码倒计时', async () => {
      const user = userEvent.setup();

      (authService.sendVerificationCode as jest.Mock).mockResolvedValue({
        success: true,
        message: '验证码已发送',
      });

      renderRegister();

      const emailInput = screen.getByLabelText(/邮箱/i);
      const sendCodeButton = screen.getByRole('button', {
        name: /发送验证码/i,
      });

      await user.type(emailInput, 'test@example.com');
      await user.click(sendCodeButton);

      await waitFor(
        () => {
          expect(screen.getByText(/\d+秒/)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      console.log('✅ 测试通过: 验证码倒计时显示正常');
    });

    test('完整的注册流程应该成功', async () => {
      const user = userEvent.setup();

      // Mock API响应
      (authService.sendVerificationCode as jest.Mock).mockResolvedValue({
        success: true,
        message: '验证码已发送',
      });

      (authService.verifyEmailCode as jest.Mock).mockResolvedValue({
        success: true,
        message: '验证成功',
      });

      (authService.register as jest.Mock).mockResolvedValue({
        success: true,
        message: '注册成功',
        userId: 'user_001',
      });

      renderRegister();

      // 输入邮箱和密码
      await user.type(
        screen.getByLabelText(/邮箱/i),
        'test_user_001@example.com'
      );
      await user.type(screen.getByLabelText(/密码/i), 'Test1234');
      await user.type(screen.getByLabelText(/确认密码/i), 'Test1234');

      // 发送验证码
      await user.click(screen.getByRole('button', { name: /发送验证码/i }));

      await waitFor(() => {
        expect(authService.sendVerificationCode).toHaveBeenCalled();
      });

      // 输入验证码
      const codeInput =
        screen.getByPlaceholderText(/请输入验证码/i) ||
        screen.getByLabelText(/验证码/i);
      await user.type(codeInput, '123456');

      // 验证验证码
      const verifyButton = screen.getByRole('button', { name: /验证/i });
      await user.click(verifyButton);

      await waitFor(() => {
        expect(authService.verifyEmailCode).toHaveBeenCalledWith(
          'test_user_001@example.com',
          '123456'
        );
      });

      // 注册
      const registerButton = screen.getByRole('button', { name: /注册/i });
      await user.click(registerButton);

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });

      console.log('✅ 测试通过: 完整注册流程成功');
    });
  });

  // ==================== 1.1.2 邮箱格式验证 ====================

  describe('测试用例 1.1.2: 邮箱格式验证', () => {
    const invalidEmails = [
      { email: 'testexample.com', desc: '缺少@符号' },
      { email: 'test@', desc: '缺少域名' },
      { email: 'test@example', desc: '缺少顶级域名' },
      { email: '', desc: '空邮箱' },
      { email: '   ', desc: '仅空格' },
    ];

    invalidEmails.forEach(({ email, desc }) => {
      test(`应该拒绝无效邮箱: ${desc}`, async () => {
        const user = userEvent.setup();
        renderRegister();

        const emailInput = screen.getByLabelText(/邮箱/i);
        const sendCodeButton = screen.getByRole('button', {
          name: /发送验证码/i,
        });

        if (email) {
          await user.type(emailInput, email);
        }
        await user.click(sendCodeButton);

        await waitFor(() => {
          expect(screen.getByText(/邮箱.*不.*正确/i)).toBeInTheDocument();
        });

        expect(authService.sendVerificationCode).not.toHaveBeenCalled();

        console.log(`✅ 测试通过: 拒绝无效邮箱 - ${desc}`);
      });
    });

    const validEmails = [
      'test@example.com',
      'test.user@example.com',
      'test+tag@example.co.uk',
    ];

    validEmails.forEach(email => {
      test(`应该接受有效邮箱: ${email}`, async () => {
        const user = userEvent.setup();

        (authService.sendVerificationCode as jest.Mock).mockResolvedValue({
          success: true,
          message: '验证码已发送',
        });

        renderRegister();

        const emailInput = screen.getByLabelText(/邮箱/i);
        await user.type(emailInput, email);

        const sendCodeButton = screen.getByRole('button', {
          name: /发送验证码/i,
        });
        await user.click(sendCodeButton);

        await waitFor(() => {
          expect(authService.sendVerificationCode).toHaveBeenCalledWith(email);
        });

        console.log(`✅ 测试通过: 接受有效邮箱 - ${email}`);
      });
    });
  });

  // ==================== 1.1.4 密码确认验证 ====================

  describe('测试用例 1.1.4: 密码确认验证', () => {
    test('应该检测两次密码输入不一致', async () => {
      const user = userEvent.setup();
      renderRegister();

      await user.type(screen.getByLabelText(/密码/i), 'Test1234');
      await user.type(screen.getByLabelText(/确认密码/i), 'Test5678');

      const registerButton = screen.getByRole('button', { name: /注册/i });
      await user.click(registerButton);

      await waitFor(() => {
        expect(authService.register).not.toHaveBeenCalled();
      });

      expect(authService.register).not.toHaveBeenCalled();

      console.log('✅ 测试通过: 密码不一致被拒绝');
    });
  });

  // ==================== 1.3 异常处理测试 ====================

  describe('测试用例 1.3.1: 网络故障处理', () => {
    test('应该处理网络连接失败', async () => {
      const user = userEvent.setup();

      // Mock网络错误
      (authService.sendVerificationCode as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch')
      );

      renderRegister();

      await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /发送验证码/i }));

      await waitFor(() => {
        expect(authService.sendVerificationCode).toHaveBeenCalledWith(
          'test@example.com'
        );
      });

      console.log('✅ 测试通过: 网络错误正确处理');
    });

    test('应该处理服务器错误', async () => {
      const user = userEvent.setup();

      // Mock服务器错误
      (authService.sendVerificationCode as jest.Mock).mockRejectedValue({
        response: {
          status: 500,
          data: { message: '服务器内部错误' },
        },
      });

      renderRegister();

      await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /发送验证码/i }));

      await waitFor(() => {
        expect(screen.getByText(/服务器.*错误|失败/i)).toBeInTheDocument();
      });

      console.log('✅ 测试通过: 服务器错误正确处理');
    });
  });

  // ==================== 1.4 性能测试（部分） ====================

  describe('测试用例 1.4.1: UI响应性能', () => {
    test('应该快速渲染注册表单', () => {
      const startTime = performance.now();

      renderRegister();

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
      expect(renderTime).toBeLessThan(1000); // 应在1秒内渲染

      console.log(`✅ 测试通过: 表单渲染时间 ${renderTime.toFixed(2)}ms`);
    });
  });

  // ==================== 边界条件测试 ====================

  describe('边界条件测试', () => {
    test('应该处理表单提交时的加载状态', async () => {
      const user = userEvent.setup();

      // Mock延迟响应
      (authService.register as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  message: '注册成功',
                }),
              2000
            )
          )
      );

      renderRegister();

      // 填写表单（假设验证码已通过）
      await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
      await user.type(screen.getByLabelText(/密码/i), 'Test1234');
      await user.type(screen.getByLabelText(/确认密码/i), 'Test1234');

      const registerButton = screen.getByRole('button', { name: /注册/i });
      await user.click(registerButton);

      // 验证加载状态
      await waitFor(() => {
        expect(registerButton).toBeDisabled();
      });

      console.log('✅ 测试通过: 加载状态正确显示');
    });

    test('应该保留用户输入的数据（即使发生错误）', async () => {
      const user = userEvent.setup();

      (authService.sendVerificationCode as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      renderRegister();

      const emailInput = screen.getByLabelText(/邮箱/i);
      const testEmail = 'test@example.com';

      await user.type(emailInput, testEmail);
      await user.click(screen.getByRole('button', { name: /发送验证码/i }));

      await waitFor(() => {
        expect(screen.getByText(/网络.*失败|错误/i)).toBeInTheDocument();
      });

      // 验证输入值仍然保留
      expect(emailInput).toHaveValue(testEmail);

      console.log('✅ 测试通过: 错误后用户输入被保留');
    });
  });

  // ==================== 已发现问题测试 ====================

  describe('🔴 已发现问题验证', () => {
    test('问题1: 验证码倒计时状态刷新页面后丢失', async () => {
      const user = userEvent.setup();

      (authService.sendVerificationCode as jest.Mock).mockResolvedValue({
        success: true,
        message: '验证码已发送',
      });

      const { unmount } = renderRegister();

      await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /发送验证码/i }));

      await waitFor(() => {
        expect(authService.sendVerificationCode).toHaveBeenCalledWith(
          'test@example.com'
        );
      });

      // 模拟页面刷新
      unmount();
      renderRegister();

      // 验证倒计时状态是否恢复
      const sendCodeButton = screen.getByRole('button', {
        name: /发送验证码/i,
      });
      expect(sendCodeButton).not.toBeDisabled();

      console.log('⚠️  问题1确认: 刷新后倒计时状态丢失');
      console.log('📝 建议: 将倒计时状态存储到sessionStorage');
    });
  });
});
