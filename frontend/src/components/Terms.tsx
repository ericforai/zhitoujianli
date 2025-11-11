import React from 'react';
import { Link } from 'react-router-dom';
import Container from './common/Container';
import SEOHead from './seo/SEOHead';

/**
 * 用户协议页面
 *
 * 功能：
 * - 展示完整的用户服务协议
 * - 包含服务条款、用户权利与义务、隐私保护等内容
 * - 提供清晰的导航和联系方式
 */
const Terms: React.FC = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      <SEOHead path='/terms' />
      {/* 头部导航 */}
      <header className='bg-white shadow-sm'>
        <Container size='xl'>
          <div className='py-4 flex items-center justify-between'>
            <Link to='/' className='flex items-center space-x-3'>
              <img
                src='/images/logo-plane.png'
                alt='智投简历Logo'
                className='h-8 w-auto'
              />
              <span className='text-2xl font-bold text-blue-600'>智投简历</span>
            </Link>
            <Link
              to='/'
              className='text-gray-600 hover:text-gray-900 transition-colors'
            >
              返回首页
            </Link>
          </div>
        </Container>
      </header>

      {/* 主内容 */}
      <main className='py-12'>
        <Container size='lg'>
          <div className='bg-white rounded-lg shadow-md p-8 md:p-12'>
            <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-2'>
              用户服务协议
            </h1>
            <p className='text-gray-500 mb-8'>最后更新：2025年11月4日</p>

            {/* 协议内容 */}
            <div className='prose max-w-none'>
              {/* 1. 协议接受 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  1. 协议接受
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  欢迎使用智投简历（以下简称&quot;本平台&quot;）。在使用本平台提供的服务之前，请您仔细阅读本《用户服务协议》（以下简称&quot;本协议&quot;）。
                </p>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  一旦您注册、登录或以任何方式使用本平台的服务，即表示您已充分理解、同意并接受本协议的全部条款。如果您不同意本协议的任何内容，请立即停止使用本平台的服务。
                </p>
              </section>

              {/* 2. 服务说明 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  2. 服务说明
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  智投简历是一个基于AI技术的智能求职平台，为求职者提供以下服务：
                </p>
                <ul className='list-disc pl-6 text-gray-700 space-y-2 mb-4'>
                  <li>简历智能解析与优化</li>
                  <li>职位智能匹配与推荐</li>
                  <li>自动化简历投递</li>
                  <li>个性化打招呼语生成</li>
                  <li>求职数据分析与追踪</li>
                  <li>职业发展建议</li>
                </ul>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  本平台保留随时修改、中断或终止部分或全部服务的权利，恕不另行通知。
                </p>
              </section>

              {/* 3. 用户注册 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  3. 用户注册与账户安全
                </h2>
                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  3.1 注册信息
                </h3>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  用户在注册时应提供真实、准确、完整的个人信息，并及时更新以保持有效性。用户应对其提供的信息承担全部法律责任。
                </p>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  3.2 账户安全
                </h3>
                <ul className='list-disc pl-6 text-gray-700 space-y-2 mb-4'>
                  <li>
                    用户应妥善保管账户密码，不得将账户转让、出借或授权他人使用
                  </li>
                  <li>用户对使用该账户进行的所有活动和行为承担全部责任</li>
                  <li>如发现账户被未授权使用，应立即通知本平台</li>
                  <li>本平台不对因用户保管不善导致的账户泄露承担责任</li>
                </ul>
              </section>

              {/* 4. 用户行为规范 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  4. 用户行为规范
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  用户在使用本平台服务时，应遵守中华人民共和国相关法律法规，不得：
                </p>
                <ul className='list-disc pl-6 text-gray-700 space-y-2 mb-4'>
                  <li>上传、发布虚假、误导性或非法信息</li>
                  <li>侵犯他人知识产权、商业秘密或其他合法权益</li>
                  <li>利用本平台从事任何违法犯罪活动或损害他人利益的行为</li>
                  <li>恶意攻击、干扰或破坏本平台的正常运行</li>
                  <li>使用爬虫、机器人或其他自动化工具滥用服务</li>
                  <li>散播病毒、木马或其他恶意程序</li>
                  <li>未经授权访问本平台的服务器、网络或数据库</li>
                </ul>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  违反上述规定的，本平台有权立即终止服务并保留追究法律责任的权利。
                </p>
              </section>

              {/* 5. 知识产权 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  5. 知识产权
                </h2>
                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  5.1 平台内容
                </h3>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  本平台所有内容（包括但不限于文字、图片、软件、程序、数据、版面设计、商标、Logo等）的知识产权均归本平台所有。未经书面许可，任何人不得擅自使用、复制、修改、传播或商业利用。
                </p>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  5.2 用户内容
                </h3>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  用户上传或发布的内容（如简历、求职信等）的知识产权归用户所有。用户授予本平台在全球范围内免费、非独占、可再许可的使用权，以便本平台提供服务。
                </p>
              </section>

              {/* 6. 隐私保护 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  6. 隐私保护
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  本平台高度重视用户隐私保护。关于我们如何收集、使用、存储和保护您的个人信息，请查看我们的{' '}
                  <Link
                    to='/privacy'
                    className='text-blue-600 hover:text-blue-700 underline'
                  >
                    隐私政策
                  </Link>
                  。
                </p>
              </section>

              {/* 7. 免责声明 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  7. 免责声明
                </h2>
                <ul className='list-disc pl-6 text-gray-700 space-y-2 mb-4'>
                  <li>
                    本平台提供的AI匹配和建议仅供参考，不保证用户一定能获得面试或工作机会
                  </li>
                  <li>用户应自行判断并承担使用本平台服务的风险</li>
                  <li>本平台不对第三方招聘平台或企业的行为承担责任</li>
                  <li>
                    因不可抗力、网络故障、系统维护等原因导致的服务中断，本平台不承担责任
                  </li>
                  <li>用户因违反本协议或法律法规导致的后果，由用户自行承担</li>
                </ul>
              </section>

              {/* 8. 服务费用 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  8. 服务费用
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  本平台部分功能为付费服务，具体费用和套餐详见{' '}
                  <Link
                    to='/pricing'
                    className='text-blue-600 hover:text-blue-700 underline'
                  >
                    价格方案
                  </Link>
                  。用户购买服务后，除非法律另有规定，费用不予退还。
                </p>
              </section>

              {/* 9. 协议修改 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  9. 协议修改
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  本平台有权根据业务发展需要，随时修改本协议条款。修改后的协议将在本页面公布，并自公布之日起生效。如用户继续使用服务，即视为接受修改后的协议。
                </p>
              </section>

              {/* 10. 争议解决 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  10. 争议解决
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  本协议的订立、执行、解释及争议解决均适用中华人民共和国法律。如发生争议，双方应友好协商解决；协商不成的，任何一方可向本平台所在地人民法院提起诉讼。
                </p>
              </section>

              {/* 11. 联系我们 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  11. 联系我们
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  如您对本协议有任何疑问或建议，请通过以下方式联系我们：
                </p>
                <div className='bg-gray-50 p-6 rounded-lg space-y-3'>
                  <p className='text-gray-700'>
                    <span className='font-semibold'>邮箱：</span>
                    <a
                      href='mailto:zhitoujianli@qq.com'
                      className='text-blue-600 hover:text-blue-700 underline ml-2'
                    >
                      zhitoujianli@qq.com
                    </a>
                  </p>
                  <p className='text-gray-700'>
                    <span className='font-semibold'>客服热线：</span>
                    <a
                      href='tel:15317270756'
                      className='text-blue-600 hover:text-blue-700 underline ml-2'
                    >
                      15317270756
                    </a>
                    <span className='text-gray-500 ml-2'>
                      （工作日 9:00-18:00）
                    </span>
                  </p>
                  <p className='text-gray-700'>
                    <span className='font-semibold'>官网：</span>
                    <a
                      href='https://www.zhitoujianli.com'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:text-blue-700 underline ml-2'
                    >
                      www.zhitoujianli.com
                    </a>
                  </p>
                  <p className='text-gray-700'>
                    <span className='font-semibold'>联系页面：</span>
                    <a
                      href='/blog/contact/'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:text-blue-700 underline ml-2'
                    >
                      在线联系我们
                    </a>
                  </p>
                </div>
              </section>

              {/* 协议生效 */}
              <section className='mt-12 pt-8 border-t border-gray-200'>
                <p className='text-gray-600 text-sm'>
                  本协议自用户注册或使用本平台服务之日起生效。
                </p>
                <p className='text-gray-600 text-sm mt-2'>
                  © 2025 智投简历 版权所有 沪ICP备2025125372号
                </p>
              </section>
            </div>
          </div>
        </Container>
      </main>

      {/* 底部快速链接 */}
      <footer className='bg-white py-8 border-t border-gray-200'>
        <Container size='lg'>
          <div className='flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-gray-600'>
            <Link to='/' className='hover:text-blue-600 transition-colors'>
              返回首页
            </Link>
            <span className='hidden md:inline'>|</span>
            <Link
              to='/privacy'
              className='hover:text-blue-600 transition-colors'
            >
              隐私政策
            </Link>
            <span className='hidden md:inline'>|</span>
            <Link
              to='/contact'
              className='hover:text-blue-600 transition-colors'
            >
              联系我们
            </Link>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Terms;
