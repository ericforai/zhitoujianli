const Contact = () => {
  return (
    <section id='contact' className='py-20 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-chinese'>
            联系我们
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>有任何疑问或建议，欢迎联系我们</p>
        </div>

        <div className='max-w-2xl mx-auto space-y-8'>
          {/* Contact Info */}
          <div className='bg-white p-8 rounded-xl shadow-sm'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>联系方式</h3>

            <div className='space-y-4'>
              <div className='flex items-center'>
                <svg
                  className='w-6 h-6 text-primary-500 mr-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                  />
                </svg>
                <a
                  href='mailto:zhitoujianli@qq.com'
                  className='text-gray-700 hover:text-primary-500 transition-colors'
                >
                  zhitoujianli@qq.com
                </a>
              </div>

              <div className='flex items-center'>
                <svg
                  className='w-6 h-6 text-primary-500 mr-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
                  />
                </svg>
                <span className='text-gray-700'>QQ用户群: 1064900145</span>
              </div>

              <div className='flex items-center'>
                <svg
                  className='w-6 h-6 text-primary-500 mr-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                  />
                </svg>
                <a
                  href='tel:15317270756'
                  className='text-gray-700 hover:text-primary-500 transition-colors'
                >
                  15317270756
                </a>
              </div>
            </div>
          </div>

          {/* WeChat QR Code */}
          <div className='bg-white p-8 rounded-xl shadow-sm text-center'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>扫码添加微信</h3>
            <div className='flex justify-center mb-4'>
              <img
                src='/images/wechat-qrcode.png'
                alt='微信二维码'
                className='w-48 h-48 rounded-lg shadow-md'
              />
            </div>
            <p className='text-gray-600 text-sm'>扫描二维码添加客服微信</p>
            <p className='text-gray-600 text-sm mt-2'>获取专属服务和技术支持</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
