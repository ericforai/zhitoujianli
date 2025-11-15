import Container from './common/Container';

const Footer = () => {
  return (
    <footer className='bg-gray-900 text-white py-20'>
      <Container size='xl'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12'>
          {/* Logo and Description */}
          <div className='col-span-1'>
            <div className='flex items-center space-x-3 mb-6'>
              <img
                src='/images/logo-plane.png'
                alt='智投简历Logo'
                className='h-8 w-auto'
                loading='lazy'
              />
              <h3 className='text-2xl font-bold'>智投简历</h3>
            </div>
            <p className='text-gray-400 text-base max-w-md'>
              用AI，让求职更高效
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className='text-lg font-semibold mb-6'>快速链接</h4>
            <ul className='space-y-3'>
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
                  href='/blog/'
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
            <h4 className='text-lg font-semibold mb-6'>支持</h4>
            <ul className='space-y-3'>
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
                  href='/terms'
                  className='text-gray-400 hover:text-white transition-colors duration-200'
                >
                  用户协议
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

          {/* Follow Us - 关注我们 */}
          <div>
            <h4 className='text-lg font-semibold mb-6'>关注我们</h4>
            <div className='flex flex-col items-start space-y-4'>
              <div className='bg-white p-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200'>
                <img
                  src='/images/wechat-qrcode.jpg'
                  alt='智投简历公众号二维码'
                  className='w-32 h-32 object-contain'
                  loading='lazy'
                />
              </div>
              <p className='text-gray-400 text-sm leading-relaxed'>
                扫码关注公众号
                <br />
                获取最新求职技巧和产品动态
              </p>
            </div>
          </div>
        </div>

        <div className='border-t border-gray-800 mt-12 pt-8 text-center'>
          <p className='text-gray-400 text-sm'>
            © 2025 智投简历 沪ICP备2025125372号
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
