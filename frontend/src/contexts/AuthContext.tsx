/**
 * 认证上下文 - 统一管理认证状态
 *
 * 🔧 修复：解决认证状态混乱问题
 * - 统一管理用户登录状态
 * - 避免重复跳转
 * - 提供统一的认证接口
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-10
 */

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, authService } from '../services/authService';
import logger from '../utils/logger';

const authLogger = logger.createChild('AuthContext');

/**
 * 认证上下文类型定义
 */
interface AuthContextType {
  // 状态
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // 方法
  login: (email: string, password: string) => Promise<void>;
  loginByPhone: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;

  // 工具方法
  requireAuth: (redirectTo?: string) => void;
}

/**
 * 创建认证上下文
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证提供者组件
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * 初始化认证状态
   * 组件挂载时检查是否已登录
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        authLogger.debug('初始化认证状态...');

        // 检查是否有有效的Token
        if (authService.isAuthenticated()) {
          authLogger.debug('发现Token，尝试获取用户信息');

          try {
            // 尝试获取用户信息验证Token有效性
            const currentUser = await authService.getCurrentUser();

            if (currentUser) {
              setUser(currentUser);
              authLogger.info(
                '认证状态初始化成功',
                {
                  userId: currentUser.userId,
                },
                []
              );
            } else {
              authLogger.warn('Token无效，清除认证状态');
              // Token无效，清除本地存储
              authService.logout();
            }
          } catch (error: any) {
            // 如果获取用户信息失败（如401错误），静默处理
            if (error.response?.status === 401) {
              authLogger.debug('Token已过期，清除认证状态');
              authService.logout();
            } else {
              authLogger.error('获取用户信息失败', error);
            }
            setUser(null);
          }
        } else {
          authLogger.debug('未发现Token，用户未登录');
        }
      } catch (error) {
        authLogger.error('初始化认证状态失败', error);
        // 出错时清除认证状态
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [navigate]);

  /**
   * 邮箱密码登录
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        authLogger.info('开始邮箱登录', { email });

        const result = await authService.loginByEmail(email, password);

        if (result.success && result.user) {
          setUser(result.user);
          authLogger.info('登录成功', { userId: result.user.userId });

          // 🔧 修复：登录成功后跳转到后端8080，并通过Cookie传递Token
          // 设置Token到Cookie，供后端8080使用
          const token = result.token || localStorage.getItem('token');
          if (token) {
            // 设置跨域Cookie
            const domain =
              window.location.hostname === 'localhost'
                ? 'localhost'
                : window.location.hostname;
            const secure = window.location.protocol === 'https:';
            document.cookie = `auth_token=${token}; path=/; domain=${domain}; ${secure ? 'secure;' : ''} SameSite=Lax; max-age=86400`;
            authLogger.info('✅ 已设置auth_token Cookie用于后端认证');
          }

          // 跳转到前端Boss投递页面
          const frontendUrl = '/boss-delivery';
          authLogger.info('🚀 跳转到Boss投递页面:', frontendUrl);
          navigate(frontendUrl, { replace: true });
        } else {
          throw new Error(result.message || '登录失败');
        }
      } catch (error: any) {
        authLogger.error('登录失败', error);
        throw error;
      }
    },
    [navigate]
  );

  /**
   * 手机号验证码登录
   */
  const loginByPhone = useCallback(
    async (phone: string, code: string) => {
      try {
        authLogger.info('开始手机号登录', { phone });

        const result = await authService.loginByPhone(phone, code);

        if (result.success && result.user) {
          setUser(result.user);
          authLogger.info('登录成功', { userId: result.user.userId });

          // 🔧 修复：登录成功后跳转到后端8080，并通过Cookie传递Token
          // 设置Token到Cookie，供后端8080使用
          const token = result.token || localStorage.getItem('token');
          if (token) {
            // 设置跨域Cookie
            const domain =
              window.location.hostname === 'localhost'
                ? 'localhost'
                : window.location.hostname;
            const secure = window.location.protocol === 'https:';
            document.cookie = `auth_token=${token}; path=/; domain=${domain}; ${secure ? 'secure;' : ''} SameSite=Lax; max-age=86400`;
            authLogger.info('✅ 已设置auth_token Cookie用于后端认证');
          }

          // 跳转到前端Boss投递页面
          const frontendUrl = '/boss-delivery';
          authLogger.info('🚀 跳转到Boss投递页面:', frontendUrl);
          navigate(frontendUrl, { replace: true });
        } else {
          throw new Error(result.message || '登录失败');
        }
      } catch (error: any) {
        authLogger.error('登录失败', error);
        throw error;
      }
    },
    [navigate]
  );

  /**
   * 登出
   */
  const logout = useCallback(async () => {
    try {
      authLogger.info('开始登出');

      // 调用后端登出接口
      await authService.logout();

      // 清除本地状态
      setUser(null);

      authLogger.info('登出成功');

      // 跳转到登录页
      navigate('/login', { replace: true });
    } catch (error) {
      authLogger.error('登出失败', error);
      // 即使登出失败，也清除本地状态
      setUser(null);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  /**
   * 刷新用户信息
   */
  const refreshUser = useCallback(async () => {
    try {
      authLogger.debug('刷新用户信息');

      const currentUser = await authService.getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        authLogger.debug('用户信息刷新成功');
      } else {
        authLogger.warn('刷新用户信息失败，清除认证状态');
        setUser(null);
      }
    } catch (error) {
      authLogger.error('刷新用户信息异常', error);
      setUser(null);
    }
  }, []);

  /**
   * 要求认证 - 如果未登录则跳转到登录页
   */
  const requireAuth = useCallback(
    (redirectTo?: string) => {
      if (!user && !isLoading) {
        authLogger.warn('需要认证，跳转到登录页');
        navigate('/login', {
          replace: true,
          state: { from: { pathname: redirectTo || location.pathname } },
        });
      }
    },
    [user, isLoading, navigate, location]
  );

  /**
   * 监听认证状态变化
   * 如果用户被清除（如Token过期），自动跳转到登录页
   */
  useEffect(() => {
    if (!user && !isLoading && authService.isAuthenticated()) {
      authLogger.warn('认证状态不一致，可能Token已过期');
      // Token存在但用户信息为空，清除Token
      authService.logout();
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginByPhone,
    logout,
    refreshUser,
    requireAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * 使用认证上下文的Hook
 *
 * 使用示例：
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }

  return context;
};

/**
 * 默认导出
 */
export default AuthContext;
