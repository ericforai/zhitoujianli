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

        // 🔧 修复：刷新时自动恢复管理员状态
        // 如果正在访问/admin/*路径且有token，自动设置userType='admin'
        const token =
          localStorage.getItem('authToken') || localStorage.getItem('token');
        const currentPath = window.location.pathname;
        if (token && currentPath.startsWith('/admin')) {
          const userType = localStorage.getItem('userType');
          if (userType !== 'admin') {
            authLogger.debug(
              '🔄 刷新检测：在admin路径且有token，自动恢复管理员状态'
            );
            localStorage.setItem('userType', 'admin');
          }
        }

        // 🔧 修复：管理员跳过初始化检查，避免调用普通用户API导致循环
        const userType = localStorage.getItem('userType');
        if (userType === 'admin') {
          authLogger.debug('✅ 检测到管理员用户，跳过getCurrentUser验证');
          // 🔧 修复：管理员也要设置user状态，避免被监听逻辑清除
          const cachedUser = authService.getCachedUser();
          if (cachedUser) {
            setUser(cachedUser);
            authLogger.debug('✅ 已恢复管理员用户状态');
          } else {
            // 即使没有缓存，也创建一个基本的user对象
            setUser({
              userId: 'admin',
              email: 'admin@zhitoujianli.com',
              username: 'admin',
            } as User);
            authLogger.debug('✅ 已创建临时管理员用户对象');
          }
          setIsLoading(false);
          return;
        }

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
  }, []);

  /**
   * 邮箱密码登录
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        authLogger.info('开始邮箱登录', { email });

        const result = await authService.loginByEmail(email, password);

        if (result.success && result.user) {
          // 🔧 修复：先设置用户状态（只设置一次）
          setUser(result.user);
          console.log('📍 检查点1: 登录API调用成功', {
            hasUser: !!result.user,
            hasToken: !!result.token,
          });
          console.log('📍 检查点2: 用户状态已设置', {
            userId: result.user.userId,
          });

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

          // 🔧 修复：使用 result.user 和 localStorage 而不是 state 中的 user
          const userType = localStorage.getItem('userType');
          const isAdmin =
            userType === 'admin' || email === 'admin@zhitoujianli.com';

          console.log('📍 检查点3: 准备跳转', {
            isAdmin,
            userType,
            email,
            'result.user': result.user,
            targetPath: isAdmin ? '/admin/dashboard' : '/dashboard',
            'localStorage.userType': localStorage.getItem('userType'),
            'localStorage.authToken': !!localStorage.getItem('authToken'),
          });

          // 立即跳转，不再检查 user state
          if (isAdmin) {
            console.log('🚀 管理员登录成功，跳转到管理后台');
            console.log(
              '🔍 执行navigate前的location:',
              window.location.pathname
            );
            navigate('/admin/dashboard', { replace: true });
            console.log('📍 检查点4: navigate 已调用 (/admin/dashboard)');
            console.log(
              '🔍 执行navigate后的location:',
              window.location.pathname
            );
          } else {
            console.log('🚀 普通用户登录成功，跳转到工作台');
            navigate('/dashboard', { replace: true });
            console.log('📍 检查点4: navigate 已调用 (/dashboard)');
          }
        } else {
          throw new Error(result.message || '登录失败');
        }
      } catch (error: any) {
        authLogger.error('登录失败', error);
        throw error;
      }
    },
    [navigate] // 🔧 修复：移除 user 依赖，避免不必要的重新创建
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

          // 跳转到前端工作台
          const frontendUrl = '/dashboard';
          authLogger.info('🚀 跳转到工作台:', frontendUrl);
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
   * 🔒 安全修复：立即清除状态并强制跳转，防止停留在受保护页面
   */
  const logout = useCallback(async () => {
    try {
      authLogger.info('开始登出');

      // 🔒 安全修复：先清除本地状态，立即生效
      setUser(null);

      // 清除所有认证信息（token、cookie等）
      // authService.logout() 内部会调用 TokenManager.clearTokens()
      await authService.logout();

      authLogger.info('登出成功，立即跳转到登录页');

      // 🔒 安全修复：立即强制跳转，使用 replace 避免返回
      navigate('/login', { replace: true });

      // 🔒 双重保险：如果 navigate 失败，使用 window.location 强制跳转
      // 延迟执行，给 navigate 时间完成
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          authLogger.warn('navigate 跳转失败，使用 window.location 强制跳转');
          window.location.href = '/login';
        }
      }, 100);
    } catch (error) {
      authLogger.error('登出失败', error);
      // 🔒 安全修复：即使出错，也清除状态并强制跳转
      setUser(null);
      // 确保清除token（即使API失败）
      try {
        await authService.logout();
      } catch (e) {
        // 忽略清除token时的错误
      }
      navigate('/login', { replace: true });
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }, 100);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // 跳过管理员用户的检查（管理员登录后有独立的跳转逻辑）
    const userType = localStorage.getItem('userType');
    if (userType === 'admin') {
      authLogger.debug('✅ 跳过管理员用户的认证状态检查');
      return;
    }

    // 🔧 修复：添加额外检查，避免在登录过程中误判
    // 如果 isLoading 为 true，或者刚登录成功（token 存在但 user 还在设置中），不执行清理
    if (!user && !isLoading && authService.isAuthenticated()) {
      // 等待一小段时间，确保 setUser 已完成
      const timer = setTimeout(() => {
        // 再次检查，如果 user 仍然为空，才清除
        const currentUserType = localStorage.getItem('userType');
        if (!user && currentUserType !== 'admin') {
          authLogger.warn('认证状态不一致，可能Token已过期');
          authService.logout();
          navigate('/login', { replace: true });
        }
      }, 100);

      return () => clearTimeout(timer);
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
