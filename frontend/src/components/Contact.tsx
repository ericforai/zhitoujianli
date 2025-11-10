const Contact = () => {
  return (
    <section id='contact' className='py-28 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-20'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-chinese'>
            有问题？我们随时为你解答
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            有任何疑问或建议，欢迎联系我们
          </p>
        </div>

        <div className='max-w-4xl mx-auto'>
          {/* Contact Info */}
          <div className='bg-white p-8 rounded-xl shadow-sm'>
            <h3 className='text-xl font-semibold text-gray-900 mb-8 text-center'>
              联系方式
            </h3>

            <div className='max-w-2xl mx-auto'>
              {/* 联系信息 - 居中 */}
              <div className='space-y-4 mb-8'>
                <div className='flex items-center justify-center'>
                  <svg
                    className='w-6 h-6 text-primary-500 mr-3'
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
                  <span className='text-gray-700 font-medium'>
                    zhitoujianli@qq.com
                  </span>
                </div>

                <div className='flex items-center justify-center'>
                  <svg
                    className='w-6 h-6 text-primary-500 mr-3'
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
                  <span className='text-gray-700 font-medium'>15317270756</span>
                </div>
              </div>

              {/* QR Code - 居中 */}
              <div className='text-center'>
                <h4 className='text-lg font-semibold text-gray-900 mb-4'>
                  扫码咨询
                </h4>
                <div className='w-32 h-32 mx-auto'>
                  <img
                    src='/images/wechat-qrcode.png'
                    alt='微信二维码'
                    className='w-full h-full object-contain rounded-lg'
                  />
                </div>
                <p className='text-gray-600 mt-4 text-sm'>
                  添加客服微信，获取专属服务
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
