import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import Button from './common/Button';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

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

    // 监听存储变化
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('退出登录失败:', error);
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
    <nav className='bg-white border-b border-gray-200 fixed w-full z-50 top-0 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          {/* Logo - 简约风格 */}
          <div className='flex items-center'>
            <a href='/' className='flex items-center space-x-3 group'>
              <div className='h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-200 group-hover:bg-blue-700'>
                <span className='text-white font-bold text-sm'>智</span>
              </div>
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
              href='/features'
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive('/features')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              功能
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
              href='https://blog.zhitoujianli.com'
              target='_blank'
              rel='noopener noreferrer'
              className='px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200'
            >
              博客
            </a>
            <a
              href='https://blog.zhitoujianli.com/about/#company'
              target='_blank'
              rel='noopener noreferrer'
              className='px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200'
            >
              关于我们
            </a>
          </div>

          {/* Desktop Auth Section - 简约风格 */}
          <div className='hidden md:flex items-center space-x-3'>
            {isLoggedIn ? (
              <div className='flex items-center space-x-3'>
                <Button as='a' href='/dashboard' variant='primary' size='sm'>
                  工作台
                </Button>

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
          <div className='md:hidden flex items-center'>
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
        <div className='md:hidden bg-white border-t border-gray-200'>
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
              href='/features'
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                isActive('/features')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              功能
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
              href='https://blog.zhitoujianli.com'
              target='_blank'
              rel='noopener noreferrer'
              className='block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200'
              onClick={() => setIsMenuOpen(false)}
            >
              博客
            </a>
            <a
              href='https://blog.zhitoujianli.com/about/#company'
              target='_blank'
              rel='noopener noreferrer'
              className='block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200'
              onClick={() => setIsMenuOpen(false)}
            >
              关于我们
            </a>

            {/* Mobile Auth Section */}
            <div className='pt-4 pb-3 border-t border-gray-200 space-y-3'>
              {isLoggedIn ? (
                <>
                  <a
                    href='/dashboard'
                    className='block px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg font-medium transition-colors duration-200'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    工作台
                  </a>
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
