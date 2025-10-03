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
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location.pathname]); // 当路径变化时重新检查登录状态

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUser(null);
    // authService.logout() 已经包含了跳转逻辑
  };

  const handleDashboardClick = () => {
    if (isLoggedIn) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-2">
              {/* Logo图标：简历文档+箭头 */}
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <svg className="w-3 h-3 text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent font-chinese">
                智投简历
              </h1>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                功能
              </a>
              <a href="#demo" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                演示
              </a>
              <a href="#smart-greeting" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                智能打招呼
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                价格
              </a>
              <a href="/blog/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors" >
                博客
              </a>
              <a href="#contact" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                联系我们
              </a>
            </div>
          </div>

                 {/* CTA Buttons */}
                 <div className="hidden md:flex items-center space-x-3">
                   {isLoggedIn ? (
                     <>
                       <span className="text-gray-700 text-sm">欢迎，{user?.username || user?.email || '用户'}</span>
                       <button
                         onClick={handleLogout}
                         className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                       >
                         退出
                       </button>
                     </>
                   ) : (
                     <>
                       <a href="/login" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                         登录
                       </a>
                       <a href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                         注册
                       </a>
                     </>
                   )}
                 </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 block px-3 py-2 text-base font-medium">
                功能
              </a>
              <a href="#demo" className="text-gray-700 hover:text-indigo-600 block px-3 py-2 text-base font-medium">
                演示
              </a>
              <a href="#smart-greeting" className="text-gray-700 hover:text-indigo-600 block px-3 py-2 text-base font-medium">
                智能打招呼
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-indigo-600 block px-3 py-2 text-base font-medium">
                价格
              </a>
              <a href="/blog/" className="text-gray-700 hover:text-indigo-600 block px-3 py-2 text-base font-medium" >
                博客
              </a>
              <a href="#contact" className="text-gray-700 hover:text-indigo-600 block px-3 py-2 text-base font-medium">
                联系我们
              </a>

              {/* 移动端登录按钮 */}
              {isLoggedIn ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-600">
                    欢迎，{user?.username || user?.email || '用户'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-gray-600 text-white px-6 py-2 rounded-lg mt-2 text-center block hover:bg-gray-700"
                  >
                    退出
                  </button>
                </>
              ) : (
                <>
                  <a href="/login" className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg mt-2 text-center block hover:bg-indigo-700">
                    登录
                  </a>
                  <a href="/register" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg mt-2 text-center block">
                    注册
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
