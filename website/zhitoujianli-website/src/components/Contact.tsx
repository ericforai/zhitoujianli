const Contact = () => {
  return (
    <section id='contact' className='py-28 bg-gray-50 scroll-mt-32'>
      <div className='max-w-6xl mx-auto px-6 sm:px-8 lg:px-12'>
        <div className='text-center mb-16'>
          <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-chinese'>
            联系我们
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>有任何疑问或建议，欢迎联系我们</p>
        </div>

        <div className='max-w-3xl mx-auto'>
          <div className='bg-white rounded-2xl shadow-lg p-12'>
            {/* Contact Methods */}
            <div className='mb-12'>
              <h3 className='text-2xl font-bold text-gray-900 mb-8 text-center'>联系方式</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <a
                  href='mailto:zhitoujianli@qq.com'
                  className='flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md transition-all group'
                >
                  <svg
                    className='w-12 h-12 text-primary-500 mb-4 group-hover:scale-110 transition-transform'
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
                  <span className='text-sm text-gray-500 mb-2'>邮箱</span>
                  <span className='text-sm font-medium text-gray-900 text-center break-all'>
                    zhitoujianli@qq.com
                  </span>
                </a>

                <div className='flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50'>
                  <svg
                    className='w-12 h-12 text-secondary-500 mb-4'
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
                  <span className='text-sm text-gray-500 mb-2'>QQ用户群</span>
                  <span className='text-sm font-medium text-gray-900'>1064900145</span>
                </div>

                <a
                  href='tel:15317270756'
                  className='flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-md transition-all group'
                >
                  <svg
                    className='w-12 h-12 text-accent-green mb-4 group-hover:scale-110 transition-transform'
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
                  <span className='text-sm text-gray-500 mb-2'>电话</span>
                  <span className='text-sm font-medium text-gray-900'>15317270756</span>
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className='relative my-12'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-200'></div>
              </div>
              <div className='relative flex justify-center'>
                <span className='px-4 bg-white text-sm text-gray-500'>或</span>
              </div>
            </div>

            {/* WeChat QR Code */}
            <div className='text-center'>
              <h3 className='text-2xl font-bold text-gray-900 mb-8'>扫码添加微信</h3>
              <div className='flex justify-center mb-6'>
                <div className='p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl'>
                  <img
                    src='/images/wechat-qrcode.png'
                    alt='微信二维码'
                    className='w-56 h-56 rounded-xl'
                  />
                </div>
              </div>
              <p className='text-gray-600'>扫描二维码添加客服微信</p>
              <p className='text-primary-500 font-medium mt-2'>获取专属服务和技术支持</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
