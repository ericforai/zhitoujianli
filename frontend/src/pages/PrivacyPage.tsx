import React from 'react';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

/**
 * 隐私政策页面
 * 展示智投简历的隐私政策和个人信息保护措施
 */
const PrivacyPage: React.FC = () => {
  return (
    <div className='min-h-screen bg-white'>
      <Navigation />
      <main className='pt-16 pb-16'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* 页面标题 */}
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>
              智投简历隐私政策
            </h1>
            <p className='text-gray-600'>最后更新时间: 2025年1月15日</p>
          </div>

          {/* 协议内容 */}
          <div className='prose prose-lg max-w-none'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8'>
              <section>
                <p className='text-gray-700 leading-relaxed'>
                  本隐私政策描述了智投简历在您使用我们的服务时如何收集、使用和披露您的信息，并告知您关于隐私权利以及法律如何保护您。
                </p>
                <p className='text-gray-700 leading-relaxed mt-4'>
                  我们使用您的个人数据来提供和改进服务。通过使用服务，您同意按照本隐私政策收集和使用信息。
                </p>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  信息收集和使用
                </h2>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  我们收集的信息类型
                </h3>

                <h4 className='text-lg font-semibold text-gray-800 mb-2'>
                  个人信息
                </h4>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  当您使用我们的服务时，我们可能会要求您提供某些可用于联系或识别您的个人身份信息，包括但不限于：
                </p>
                <ul className='list-disc list-inside space-y-2 text-gray-700 mb-6'>
                  <li>
                    <strong>账户信息</strong>：姓名、邮箱地址、电话号码
                  </li>
                  <li>
                    <strong>简历信息</strong>：教育背景、工作经历、技能信息
                  </li>
                  <li>
                    <strong>求职偏好</strong>：期望职位、薪资范围、工作地点
                  </li>
                </ul>

                <h4 className='text-lg font-semibold text-gray-800 mb-2'>
                  使用数据
                </h4>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  使用数据在您使用服务时会自动收集，包括：
                </p>
                <ul className='list-disc list-inside space-y-2 text-gray-700 mb-6'>
                  <li>
                    <strong>设备信息</strong>：IP地址、浏览器类型、操作系统
                  </li>
                  <li>
                    <strong>使用情况</strong>：访问的页面、停留时间、点击行为
                  </li>
                  <li>
                    <strong>技术信息</strong>：设备标识符、日志文件
                  </li>
                </ul>

                <h4 className='text-lg font-semibold text-gray-800 mb-2'>
                  Cookie和跟踪技术
                </h4>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  我们使用Cookie和类似的跟踪技术来跟踪服务活动并存储某些信息：
                </p>
                <ul className='list-disc list-inside space-y-2 text-gray-700'>
                  <li>
                    <strong>必要Cookie</strong>：确保网站正常运行所必需的Cookie
                  </li>
                  <li>
                    <strong>功能Cookie</strong>：记住您的偏好设置和登录状态
                  </li>
                  <li>
                    <strong>分析Cookie</strong>：帮助我们了解服务使用情况
                  </li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  信息使用目的
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  我们收集和使用您的个人信息用于以下目的：
                </p>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  服务提供
                </h3>
                <ul className='list-disc list-inside space-y-2 text-gray-700 mb-6'>
                  <li>提供AI智能匹配服务</li>
                  <li>优化简历内容和格式</li>
                  <li>管理投递状态和结果跟踪</li>
                  <li>提供数据分析和统计报告</li>
                </ul>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  账户管理
                </h3>
                <ul className='list-disc list-inside space-y-2 text-gray-700 mb-6'>
                  <li>创建和管理您的账户</li>
                  <li>验证您的身份</li>
                  <li>处理您的请求和查询</li>
                </ul>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  服务改进
                </h3>
                <ul className='list-disc list-inside space-y-2 text-gray-700 mb-6'>
                  <li>分析服务使用情况</li>
                  <li>改进AI算法和匹配精度</li>
                  <li>开发新功能和服务</li>
                </ul>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  通信联系
                </h3>
                <ul className='list-disc list-inside space-y-2 text-gray-700'>
                  <li>发送服务相关通知</li>
                  <li>提供客户支持</li>
                  <li>分享产品更新和优惠信息</li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  信息共享和披露
                </h2>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  我们不会出售您的个人信息
                </h3>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  信息共享情况
                </h3>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  我们可能在以下情况下共享您的信息：
                </p>
                <ul className='list-disc list-inside space-y-2 text-gray-700 mb-6'>
                  <li>
                    <strong>服务提供商</strong>
                    ：与帮助我们提供服务的第三方合作伙伴共享
                  </li>
                  <li>
                    <strong>法律要求</strong>：根据法律法规要求披露信息
                  </li>
                  <li>
                    <strong>业务转让</strong>：在公司合并、收购或资产转让时
                  </li>
                  <li>
                    <strong>用户同意</strong>：在获得您明确同意的情况下
                  </li>
                </ul>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  第三方服务
                </h3>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  我们可能使用以下第三方服务：
                </p>
                <ul className='list-disc list-inside space-y-2 text-gray-700'>
                  <li>
                    <strong>AI服务提供商</strong>：用于简历分析和职位匹配
                  </li>
                  <li>
                    <strong>云存储服务</strong>：用于数据存储和处理
                  </li>
                  <li>
                    <strong>分析工具</strong>：用于网站使用情况分析
                  </li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  数据安全
                </h2>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  安全措施
                </h3>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  我们采取适当的技术和组织措施来保护您的个人信息：
                </p>
                <ul className='list-disc list-inside space-y-2 text-gray-700 mb-6'>
                  <li>
                    <strong>加密传输</strong>：使用HTTPS加密数据传输
                  </li>
                  <li>
                    <strong>访问控制</strong>：限制对个人信息的访问权限
                  </li>
                  <li>
                    <strong>定期审计</strong>：定期检查和更新安全措施
                  </li>
                  <li>
                    <strong>员工培训</strong>：确保员工了解隐私保护要求
                  </li>
                </ul>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  数据存储
                </h3>
                <ul className='list-disc list-inside space-y-2 text-gray-700'>
                  <li>您的数据存储在安全的服务器上</li>
                  <li>我们定期备份重要数据</li>
                  <li>采用行业标准的安全协议</li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  数据保留
                </h2>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  保留期限
                </h3>
                <ul className='list-disc list-inside space-y-2 text-gray-700 mb-6'>
                  <li>
                    <strong>账户信息</strong>：在您账户存在期间保留
                  </li>
                  <li>
                    <strong>简历信息</strong>：在您删除或账户关闭后30天内删除
                  </li>
                  <li>
                    <strong>使用数据</strong>：最多保留2年用于分析目的
                  </li>
                  <li>
                    <strong>法律要求</strong>：根据法律要求可能需要更长时间保留
                  </li>
                </ul>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  数据删除
                </h3>
                <ul className='list-disc list-inside space-y-2 text-gray-700'>
                  <li>您可以随时删除您的账户</li>
                  <li>删除账户后，我们将在30天内删除您的个人信息</li>
                  <li>某些信息可能因法律要求而保留更长时间</li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  您的权利
                </h2>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  访问和更正
                </h3>
                <ul className='list-disc list-inside space-y-2 text-gray-700 mb-6'>
                  <li>您可以查看和更新您的个人信息</li>
                  <li>您可以通过账户设置修改简历内容</li>
                  <li>您可以导出您的数据</li>
                </ul>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  删除权利
                </h3>
                <ul className='list-disc list-inside space-y-2 text-gray-700 mb-6'>
                  <li>您可以要求删除您的个人信息</li>
                  <li>您可以注销账户</li>
                  <li>您可以撤回对数据处理的同意</li>
                </ul>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  数据可携带性
                </h3>
                <ul className='list-disc list-inside space-y-2 text-gray-700'>
                  <li>您可以导出您的简历数据</li>
                  <li>您可以将数据转移到其他服务</li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  儿童隐私保护
                </h2>
                <p className='text-gray-700 leading-relaxed'>
                  我们的服务不面向13岁以下的儿童。我们不会故意收集13岁以下儿童的个人信息。如果我们发现收集了儿童的个人信息，我们将立即删除这些信息。
                </p>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  第三方链接
                </h2>
                <p className='text-gray-700 leading-relaxed'>
                  我们的服务可能包含指向其他网站的链接。我们不对这些第三方网站的隐私政策负责。我们建议您查看每个访问网站的隐私政策。
                </p>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  隐私政策变更
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  我们可能会不时更新本隐私政策。任何重大变更我们都会：
                </p>
                <ul className='list-disc list-inside space-y-2 text-gray-700'>
                  <li>在网站上发布新版本的隐私政策</li>
                  <li>通过邮件或网站通知您</li>
                  <li>更新&quot;最后更新时间&quot;</li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  联系我们
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  如果您对本隐私政策有任何问题或建议，请通过以下方式联系我们：
                </p>
                <ul className='list-disc list-inside space-y-2 text-gray-700 mb-6'>
                  <li>邮箱：zhitoujianli@qq.com</li>
                  <li>电话：15317270756</li>
                  <li>微信：zhitoujianlikefu</li>
                  <li>官网：https://zhitoujianli.com</li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  数据保护合规
                </h2>
                <p className='text-gray-700 leading-relaxed'>
                  我们严格遵守《中华人民共和国个人信息保护法》等相关法律法规，确保您的个人信息得到充分保护。
                </p>
              </section>

              <div className='mt-12 pt-8 border-t border-gray-200'>
                <p className='text-gray-600 text-center'>
                  智投简历团队
                  <br />
                  2025年1月15日
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;
