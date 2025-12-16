import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authService, type User } from '../services/authService';
import Button from './common/Button';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // 检查登录状态
    const checkAuthStatus = () => {
      const loggedIn = authService.isAuthenticated();
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        const userData = authService.getCachedUser();
        setUser(userData);
      }
    };

    checkAuthStatus();

    // 监听存储变化（包括同源页面的变化）
    const handleStorageChange = (e: StorageEvent) => {
      // 如果userType或authToken发生变化，重新检查状态
      if (e.key === 'userType' || e.key === 'authToken' || e.key === 'token') {
        checkAuthStatus();
      }
    };

    // 监听自定义事件（用于同页面内的变化）
    const handleCustomStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userTypeChanged', handleCustomStorageChange);

    // 🔧 修复：定期检查userType变化（用于检测登录后的状态更新）
    const intervalId = setInterval(() => {
      checkAuthStatus();
    }, 1000); // 每秒检查一次

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userTypeChanged', handleCustomStorageChange);
      clearInterval(intervalId);
      // 清理定时器，防止内存泄漏
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
    };
  }, [closeTimeout]);

  // 🎨 UX优化：滚动时添加背景模糊效果（参考Apple.com）
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🎨 UX优化：移动端菜单打开时禁止body滚动（防止背景滚动）
  useEffect(() => {
    if (isMenuOpen) {
      // 保存当前滚动位置
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // 恢复滚动位置
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) * -1);
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
    };
  }, [isMenuOpen]);

  /**
   * 🔒 安全修复：退出登录后立即跳转，防止停留在受保护页面
   */
  const handleLogout = async () => {
    try {
      // 先清除本地状态
      setIsLoggedIn(false);
      setUser(null);

      // 调用退出登录API（清除token等）
      await authService.logout();

      // 🔒 安全修复：立即强制跳转到登录页
      window.location.href = '/login';
    } catch (error) {
      console.error('退出登录失败:', error);
      // 🔒 安全修复：即使出错，也清除状态并强制跳转
      setIsLoggedIn(false);
      setUser(null);
      window.location.href = '/login';
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav
      className={`
        fixed w-full z-50 top-0
        transition-all duration-300 ease-in-out
        ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-md border-b border-gray-200/50'
            : 'bg-white border-b border-gray-200 shadow-sm'
        }
      `}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          {/* Logo - 简约风格 */}
          <div className='flex items-center md:flex-none'>
            <a
              href='/'
              className='flex items-center space-x-3 group transition-opacity duration-200 hover:opacity-70 md:justify-start justify-center w-full md:w-auto'
              aria-label='智投简历 - 返回首页'
            >
              <img
                src='/images/logo-plane.png'
                alt='智投简历Logo'
                className='h-8 w-auto transition-transform duration-200 group-hover:scale-110'
                loading='eager'
              />
              <span className='text-xl font-bold text-gray-900'>智投简历</span>
            </a>
          </div>

          {/* Desktop Navigation - 简约风格，5个核心导航 */}
          <div className='hidden md:flex items-center space-x-1'>
            <a
              href='/'
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive('/')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              首页
            </a>
            <a
              href='/pricing'
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive('/pricing')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              定价
            </a>
            <a
              href='/scenes'
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive('/scenes')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              场景
            </a>
            <a
              href='/resume'
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                location.pathname.startsWith('/resume')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              简历
            </a>

            {/* 分类下拉菜单 - 优化交互体验：点击跳转博客首页，悬停显示分类 */}
            <div
              className='relative'
              onMouseEnter={() => {
                // 清除关闭定时器
                if (closeTimeout) {
                  clearTimeout(closeTimeout);
                  setCloseTimeout(null);
                }
                setIsCategoryOpen(true);
              }}
              onMouseLeave={() => {
                // 延迟300ms关闭，给用户足够时间移动鼠标
                const timeout = setTimeout(() => {
                  setIsCategoryOpen(false);
                }, 300);
                setCloseTimeout(timeout);
              }}
            >
              <a
                href='/blog/'
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                  location.pathname.startsWith('/blog/')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>博客</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </a>

              {/* 下拉菜单 - 移除间隙，使用padding代替margin */}
              {isCategoryOpen && (
                <div className='absolute left-0 top-full pt-1'>
                  <div className='w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2'>
                    {/* 全部博客 - 主要入口 */}
                    <a
                      href='/blog/'
                      className='block px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100'
                      onClick={() => setIsCategoryOpen(false)}
                    >
                      📚 全部博客
                    </a>

                    {/* 分类小标题 */}
                    <div className='px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                      分类浏览
                    </div>

                    {/* 分类列表 */}
                    <a
                      href='/blog/category/job-guide/'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200'
                      onClick={() => setIsCategoryOpen(false)}
                    >
                      💼 求职指南
                    </a>
                    <a
                      href='/blog/category/career-advice/'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200'
                      onClick={() => setIsCategoryOpen(false)}
                    >
                      🚀 职场建议
                    </a>
                    <a
                      href='/blog/category/product-updates/'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200'
                      onClick={() => setIsCategoryOpen(false)}
                    >
                      📢 产品动态
                    </a>
                  </div>
                </div>
              )}
            </div>

            <a
              href='/blog/about/#company'
              className='px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200'
            >
              关于我们
            </a>
          </div>

          {/* Desktop Auth Section - 简约风格 */}
          <div className='hidden md:flex items-center space-x-3'>
            {isLoggedIn ? (
              <div className='flex items-center space-x-3'>
                {/* 根据用户类型显示不同的按钮 */}
                {localStorage.getItem('userType') === 'admin' ? (
                  <Link
                    to='/admin/dashboard'
                    className='inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 text-sm'
                  >
                    管理后台
                  </Link>
                ) : (
                  <Link
                    to='/dashboard'
                    className='inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 text-sm'
                  >
                    工作台
                  </Link>
                )}

                {/* 用户信息 - 简约设计 */}
                <div className='flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg'>
                  <div className='h-7 w-7 bg-blue-600 rounded-full flex items-center justify-center'>
                    <span className='text-white text-xs font-medium'>
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className='text-sm text-gray-700 font-medium'>
                    {user?.name || user?.email?.split('@')[0] || '用户'}
                  </span>
                </div>

                <Button variant='ghost' size='sm' onClick={handleLogout}>
                  退出
                </Button>
              </div>
            ) : (
              <div className='flex items-center space-x-2'>
                <Button as='a' href='/login' variant='ghost' size='sm'>
                  登录
                </Button>
                <Button as='a' href='/register' variant='primary' size='sm'>
                  注册
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button - 简约风格 */}
          <div className='md:hidden flex items-center space-x-2'>
            {/* 未登录时显示登录/注册按钮 */}
            {!isLoggedIn && (
              <>
                <Button as='a' href='/login' variant='ghost' size='sm'>
                  登录
                </Button>
                <Button as='a' href='/register' variant='primary' size='sm'>
                  注册
                </Button>
              </>
            )}

            {/* 已登录时显示用户头像快捷入口 */}
            {isLoggedIn && (
              <a
                href={
                  localStorage.getItem('userType') === 'admin'
                    ? '/admin/dashboard'
                    : '/dashboard'
                }
                className='flex items-center justify-center h-8 w-8 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors duration-200'
                aria-label='进入工作台'
              >
                <span className='text-white text-xs font-medium'>
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </a>
            )}

            {/* 汉堡菜单按钮 */}
            <button
              onClick={toggleMenu}
              className='p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200'
            >
              <svg
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                ) : (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - 简约风格 */}
      {isMenuOpen && (
        <div className='md:hidden fixed top-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto z-50'>
          <div className='px-4 pt-2 pb-3 space-y-1'>
            <a
              href='/'
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                isActive('/')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              首页
            </a>
            <a
              href='/pricing'
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                isActive('/pricing')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              定价
            </a>
            <a
              href='/scenes'
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                isActive('/scenes')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              场景
            </a>
            <a
              href='/resume'
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                location.pathname.startsWith('/resume')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              简历
            </a>

            {/* 移动端博客链接 - 添加博客首页入口 */}
            <div className='space-y-1'>
              <a
                href='/blog/'
                className={`block px-4 py-3 rounded-lg text-base font-semibold transition-colors duration-200 ${
                  location.pathname === '/blog/'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                📚 全部博客
              </a>

              {/* 分类小标题 - 加强视觉层次 */}
              <div className='px-4 py-2 mt-2 text-xs font-bold text-gray-600 uppercase tracking-wider border-t border-gray-200 pt-3'>
                分类浏览
              </div>

              <a
                href='/blog/category/job-guide/'
                className='block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200'
                onClick={() => setIsMenuOpen(false)}
              >
                💼 求职指南
              </a>
              <a
                href='/blog/category/career-advice/'
                className='block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200'
                onClick={() => setIsMenuOpen(false)}
              >
                🚀 职场建议
              </a>
              <a
                href='/blog/category/product-updates/'
                className='block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200'
                onClick={() => setIsMenuOpen(false)}
              >
                📢 产品动态
              </a>
            </div>

            <a
              href='/blog/about/#company'
              className='block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200'
              onClick={() => setIsMenuOpen(false)}
            >
              关于我们
            </a>

            {/* Mobile Auth Section */}
            <div className='pt-4 pb-3 border-t border-gray-200 space-y-3'>
              {isLoggedIn ? (
                <>
                  {/* 根据用户类型显示不同的按钮 */}
                  {localStorage.getItem('userType') === 'admin' ? (
                    <Link
                      to='/admin/dashboard'
                      className='block px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg font-medium transition-colors duration-200'
                      onClick={() => setIsMenuOpen(false)}
                    >
                      管理后台
                    </Link>
                  ) : (
                    <Link
                      to='/dashboard'
                      className='block px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg font-medium transition-colors duration-200'
                      onClick={() => setIsMenuOpen(false)}
                    >
                      工作台
                    </Link>
                  )}
                  <div className='flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg'>
                    <div className='flex items-center space-x-3'>
                      <div className='h-9 w-9 bg-blue-600 rounded-full flex items-center justify-center'>
                        <span className='text-white text-sm font-medium'>
                          {user?.name?.charAt(0) ||
                            user?.email?.charAt(0) ||
                            'U'}
                        </span>
                      </div>
                      <span className='text-base font-medium text-gray-800'>
                        {user?.name || user?.email?.split('@')[0] || '用户'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className='px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200'
                    >
                      退出
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <a
                    href='/login'
                    className='block px-4 py-3 text-base font-medium text-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    登录
                  </a>
                  <a
                    href='/register'
                    className='block px-4 py-3 text-base font-medium text-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    注册
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
