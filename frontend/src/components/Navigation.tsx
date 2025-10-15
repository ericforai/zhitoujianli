import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

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

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUser(null);
    window.location.reload();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className='bg-white shadow-lg fixed w-full z-50 top-0'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          {/* Logo */}
          <div className='flex items-center'>
            <a href='/' className='flex-shrink-0 flex items-center'>
              <img className='h-8 w-8' src='/logo192.png' alt='智投简历' />
              <span className='ml-2 text-xl font-bold text-gray-800'>
                智投简历
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-8'>
            <a
              href='/'
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              首页
            </a>
            <a
              href='/features'
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/features')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              功能特色
            </a>
            <a
              href='/pricing'
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/pricing')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              价格方案
            </a>
            <a
              href='/blog'
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/blog')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              博客
            </a>
            <a
              href='/contact'
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/contact')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              联系我们
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className='hidden md:flex items-center space-x-4'>
            {isLoggedIn ? (
              <div className='flex items-center space-x-4'>
                <span className='text-sm text-gray-700'>
                  欢迎，{user?.name || user?.email || '用户'}
                </span>
                <button
                  onClick={handleLogout}
                  className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors'
                >
                  退出登录
                </button>
              </div>
            ) : (
              <div className='flex items-center space-x-4'>
                <a
                  href='/login'
                  className='text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors'
                >
                  登录
                </a>
                <a
                  href='/register'
                  className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors'
                >
                  注册
                </a>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden flex items-center'>
            <button
              onClick={toggleMenu}
              className='text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600'
            >
              <svg
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className='md:hidden'>
          <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t'>
            <a
              href='/'
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              首页
            </a>
            <a
              href='/features'
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/features')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              功能特色
            </a>
            <a
              href='/pricing'
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/pricing')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              价格方案
            </a>
            <a
              href='/blog'
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/blog')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              博客
            </a>
            <a
              href='/contact'
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/contact')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              联系我们
            </a>

            {/* Mobile Auth Buttons */}
            <div className='pt-4 pb-3 border-t border-gray-200'>
              {isLoggedIn ? (
                <div className='flex items-center px-4'>
                  <div className='flex-shrink-0'>
                    <div className='h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center'>
                      <span className='text-sm font-medium text-white'>
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className='ml-3'>
                    <div className='text-base font-medium text-gray-800'>
                      {user?.name || user?.email || '用户'}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className='ml-auto bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors'
                  >
                    退出
                  </button>
                </div>
              ) : (
                <div className='space-y-2'>
                  <a
                    href='/login'
                    className='block px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors'
                  >
                    登录
                  </a>
                  <a
                    href='/register'
                    className='block px-4 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors'
                  >
                    注册
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
