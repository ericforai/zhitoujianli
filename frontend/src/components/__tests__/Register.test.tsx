/**
 * 简化的Register组件测试
 * 只测试核心功能，避免复杂的Mock和UI状态测试
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from '../Register';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => jest.fn(),
}));

// Mock SEOHead
jest.mock('../seo/SEOHead', () => ({
  __esModule: true,
  default: () => null,
}));

// Mock config
jest.mock('../../config/environment', () => ({
  __esModule: true,
  default: {
    apiBaseUrl: '/api',
    isProduction: false,
  },
}));

// Mock services
jest.mock('../../services/authService', () => ({
  authService: {
    register: jest.fn(),
  },
}));

jest.mock('../../services/analyticsService', () => ({
  __esModule: true,
  default: {
    trackEvent: jest.fn(),
  },
}));

// Mock fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Register组件核心功能测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Mock fetch responses
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      json: () => Promise.resolve({ success: true }),
      text: () => Promise.resolve('{"success": true}'),
    });
  });

  const renderRegister = () => {
    return render(<Register />);
  };

  test('应该渲染注册表单', () => {
    renderRegister();

    expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /发送验证码/i })
    ).toBeInTheDocument();

    console.log('✅ 测试通过: 注册表单渲染正常');
  });

  test('应该能够输入邮箱', async () => {
    const user = userEvent.setup();
    renderRegister();

    const emailInput = screen.getByLabelText(/邮箱/i);
    await user.type(emailInput, 'test@example.com');

    expect(emailInput).toHaveValue('test@example.com');

    console.log('✅ 测试通过: 邮箱输入正常');
  });

  test('应该能够点击发送验证码按钮', async () => {
    const user = userEvent.setup();
    renderRegister();

    const emailInput = screen.getByLabelText(/邮箱/i);
    const sendButton = screen.getByRole('button', { name: /发送验证码/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(sendButton);

    // 验证fetch被调用
    expect(mockFetch).toHaveBeenCalled();

    console.log('✅ 测试通过: 发送验证码按钮点击正常');
  });
});
