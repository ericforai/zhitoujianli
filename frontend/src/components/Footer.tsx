import Container from './common/Container';

const Footer = () => {
  return (
    <footer className='bg-gray-900 text-white py-12'>
      <Container size='xl'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Logo and Description */}
          <div className='col-span-1 md:col-span-2'>
            <h3 className='text-2xl font-bold mb-4'>智投简历</h3>
            <p className='text-gray-400 mb-4 max-w-md'>用AI，让求职更高效</p>
            <p className='text-gray-400 text-sm'>
              智能投递 · 精准匹配 · 高效求职
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className='text-lg font-semibold mb-4'>快速链接</h4>
            <ul className='space-y-2'>
              <li>
                <a
                  href='/features'
                  className='text-gray-400 hover:text-white transition-colors duration-200'
                >
                  功能
                </a>
              </li>
              <li>
                <a
                  href='/pricing'
                  className='text-gray-400 hover:text-white transition-colors duration-200'
                >
                  定价
                </a>
              </li>
              <li>
                <a
                  href='https://blog.zhitoujianli.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-400 hover:text-white transition-colors duration-200'
                >
                  博客
                </a>
              </li>
              <li>
                <a
                  href='/contact'
                  className='text-gray-400 hover:text-white transition-colors duration-200'
                >
                  联系我们
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className='text-lg font-semibold mb-4'>支持</h4>
            <ul className='space-y-2'>
              <li>
                <a
                  href='/help'
                  className='text-gray-400 hover:text-white transition-colors duration-200'
                >
                  帮助中心
                </a>
              </li>
              <li>
                <a
                  href='/guide'
                  className='text-gray-400 hover:text-white transition-colors duration-200'
                >
                  用户指南
                </a>
              </li>
              <li>
                <a
                  href='/api'
                  className='text-gray-400 hover:text-white transition-colors duration-200'
                >
                  API文档
                </a>
              </li>
              <li>
                <a
                  href='/privacy'
                  className='text-gray-400 hover:text-white transition-colors duration-200'
                >
                  隐私政策
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className='border-t border-gray-800 mt-8 pt-8 text-center'>
          <p className='text-gray-400 text-sm'>
            © 2025 智投简历 沪ICP备2025125372号.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
