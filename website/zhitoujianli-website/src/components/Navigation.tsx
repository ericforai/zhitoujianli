import { useState } from 'react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 处理锚点滚动
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      // 获取固定导航栏的高度（约80px）
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight - 20; // 额外20px间距

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setIsMenuOpen(false);
  };

  // 处理Logo点击 - 返回页面顶部
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <nav className='bg-white shadow-sm fixed w-full top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex items-center'>
            <a
              href='/'
              onClick={handleLogoClick}
              className='flex-shrink-0 flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-200'
            >
              {/* Logo图片：纸飞机 */}
              <img 
                src='/images/logo.png' 
                alt='智投简历Logo' 
                className='h-10 w-10'
                  />
              <h1 className='text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent font-chinese'>
                智投简历
              </h1>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className='hidden md:block'>
            <div className='ml-10 flex items-baseline space-x-8'>
              <a
                href='#features'
                onClick={e => handleNavClick(e, '#features')}
                className='text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors'
              >
                功能
              </a>
              <a
                href='#demo'
                onClick={e => handleNavClick(e, '#demo')}
                className='text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors'
              >
                演示
              </a>
              <a
                href='https://blog.zhitoujianli.com'
                className='text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors'
                target='_blank'
                rel='noopener noreferrer'
              >
                博客
              </a>
              <a
                href='https://blog.zhitoujianli.com/about'
                className='text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors'
                target='_blank'
                rel='noopener noreferrer'
              >
                关于我们
              </a>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className='hidden md:flex space-x-3'>
            <a
              href='http://115.190.182.95/login'
              className='bg-gradient-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg'
            >
              立即体验
            </a>
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='text-gray-700 hover:text-indigo-600 focus:outline-none'
            >
              <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className='md:hidden'>
            <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t'>
              <a
                href='#features'
                onClick={e => handleNavClick(e, '#features')}
                className='text-gray-700 hover:text-indigo-600 block px-3 py-2 text-base font-medium'
              >
                功能
              </a>
              <a
                href='#demo'
                onClick={e => handleNavClick(e, '#demo')}
                className='text-gray-700 hover:text-indigo-600 block px-3 py-2 text-base font-medium'
              >
                演示
              </a>
              <a
                href='https://blog.zhitoujianli.com'
                className='text-gray-700 hover:text-indigo-600 block px-3 py-2 text-base font-medium'
                target='_blank'
                rel='noopener noreferrer'
              >
                博客
              </a>
              <a
                href='https://blog.zhitoujianli.com/about'
                className='text-gray-700 hover:text-indigo-600 block px-3 py-2 text-base font-medium'
                target='_blank'
                rel='noopener noreferrer'
              >
                关于我们
              </a>
              <a
                href='http://115.190.182.95/login'
                className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg mt-2 text-center block'
              >
                立即体验
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
