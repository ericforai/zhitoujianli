import React from 'react';
import { Link } from 'react-router-dom';
import Container from './common/Container';
import SEOHead from './seo/SEOHead';

/**
 * 隐私政策页面
 *
 * 功能：
 * - 详细说明个人信息的收集、使用、存储和保护
 * - 符合《个人信息保护法》等相关法律要求
 * - 提供用户权利和联系方式
 */
const Privacy: React.FC = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      <SEOHead path='/privacy' />
      {/* 头部导航 */}
      <header className='bg-white shadow-sm'>
        <Container size='xl'>
          <div className='py-4 flex items-center justify-between'>
            <Link to='/' className='text-2xl font-bold text-blue-600'>
              智投简历
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
              隐私政策
            </h1>
            <p className='text-gray-500 mb-8'>最后更新：2025年11月4日</p>

            {/* 隐私政策内容 */}
            <div className='prose max-w-none'>
              {/* 引言 */}
              <section className='mb-8'>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  智投简历（以下简称&quot;我们&quot;）深知个人信息对您的重要性，并将按照法律法规要求，采取相应的安全保护措施，保护您的个人信息安全可控。
                </p>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  本《隐私政策》适用于智投简历提供的所有产品和服务。在使用我们的服务前，请您仔细阅读并充分理解本政策，特别是以
                  <strong className='text-gray-900'>加粗</strong>
                  标识的条款。
                </p>
              </section>

              {/* 1. 信息收集 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  1. 我们如何收集和使用您的个人信息
                </h2>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  1.1 注册和账户管理
                </h3>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  当您注册智投简历账户时，我们会收集以下信息：
                </p>
                <ul className='list-disc pl-6 text-gray-700 space-y-2 mb-4'>
                  <li>
                    <strong>必要信息：</strong>用户名、密码、邮箱地址或手机号码
                  </li>
                  <li>
                    <strong>用途：</strong>创建和管理您的账户，进行身份验证
                  </li>
                </ul>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  1.2 简历信息
                </h3>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  为提供智能求职服务，我们需要收集您的简历信息，包括：
                </p>
                <ul className='list-disc pl-6 text-gray-700 space-y-2 mb-4'>
                  <li>
                    <strong>个人基本信息：</strong>
                    姓名、性别、年龄、联系方式、照片
                  </li>
                  <li>
                    <strong>教育背景：</strong>学校、专业、学历、毕业时间
                  </li>
                  <li>
                    <strong>工作经历：</strong>
                    公司名称、职位、工作时间、工作描述
                  </li>
                  <li>
                    <strong>技能和证书：</strong>
                    专业技能、语言能力、职业资格证书
                  </li>
                  <li>
                    <strong>求职意向：</strong>期望职位、期望薪资、期望地点
                  </li>
                </ul>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  <strong>用途：</strong>
                </p>
                <ul className='list-disc pl-6 text-gray-700 space-y-2 mb-4'>
                  <li>使用AI技术解析和优化您的简历</li>
                  <li>根据您的背景匹配合适的职位</li>
                  <li>生成个性化的打招呼语和求职材料</li>
                  <li>帮助您自动投递简历到目标岗位</li>
                </ul>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  1.3 求职活动数据
                </h3>
                <ul className='list-disc pl-6 text-gray-700 space-y-2 mb-4'>
                  <li>投递记录、浏览历史、搜索记录</li>
                  <li>与招聘方的沟通记录</li>
                  <li>面试邀请和反馈</li>
                </ul>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  <strong>用途：</strong>
                  改进匹配算法、提供数据分析、优化求职策略
                </p>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  1.4 设备和日志信息
                </h3>
                <ul className='list-disc pl-6 text-gray-700 space-y-2 mb-4'>
                  <li>设备型号、操作系统、浏览器类型</li>
                  <li>IP地址、访问时间、访问页面</li>
                  <li>Cookie和类似技术的标识符</li>
                </ul>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  <strong>用途：</strong>
                  保障服务安全、分析服务质量、改善用户体验
                </p>
              </section>

              {/* 2. 信息使用 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  2. 我们如何使用Cookie和同类技术
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  为了提供更好的服务体验，我们会使用Cookie和类似技术：
                </p>
                <ul className='list-disc pl-6 text-gray-700 space-y-2 mb-4'>
                  <li>
                    <strong>身份验证：</strong>记住您的登录状态
                  </li>
                  <li>
                    <strong>偏好设置：</strong>保存您的语言、界面设置等
                  </li>
                  <li>
                    <strong>安全防护：</strong>识别异常访问和恶意攻击
                  </li>
                  <li>
                    <strong>数据分析：</strong>了解服务使用情况，优化产品功能
                  </li>
                </ul>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  您可以通过浏览器设置管理或删除Cookie，但这可能影响部分功能的正常使用。
                </p>
              </section>

              {/* 3. 信息共享 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  3. 我们如何共享、转让、公开披露您的个人信息
                </h2>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  3.1 共享
                </h3>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  <strong>我们不会与第三方共享您的个人信息</strong>，除非：
                </p>
                <ul className='list-disc pl-6 text-gray-700 space-y-2 mb-4'>
                  <li>
                    <strong>获得您的明确同意：</strong>
                    例如您授权投递简历到目标企业
                  </li>
                  <li>
                    <strong>法律要求：</strong>根据法律法规、诉讼、政府要求
                  </li>
                  <li>
                    <strong>服务提供商：</strong>
                    我们可能委托第三方提供云存储、AI分析等服务，但会签订严格的保密协议
                  </li>
                </ul>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  3.2 转让
                </h3>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  如发生合并、收购或资产转让，我们会要求新的持有者继续受本隐私政策约束，并在转让前征得您的同意。
                </p>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  3.3 公开披露
                </h3>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  我们不会公开披露您的个人信息，除非：
                </p>
                <ul className='list-disc pl-6 text-gray-700 space-y-2 mb-4'>
                  <li>获得您的明确同意</li>
                  <li>基于法律要求或合理必要性</li>
                </ul>
              </section>

              {/* 4. 信息存储 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  4. 我们如何存储和保护您的个人信息
                </h2>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  4.1 存储地点
                </h3>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  您的个人信息存储在中华人民共和国境内的服务器上。如需跨境传输，我们会严格遵守相关法律法规。
                </p>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  4.2 存储期限
                </h3>
                <ul className='list-disc pl-6 text-gray-700 space-y-2 mb-4'>
                  <li>
                    <strong>账户信息：</strong>在您使用服务期间持续保存
                  </li>
                  <li>
                    <strong>简历信息：</strong>直到您删除或注销账户
                  </li>
                  <li>
                    <strong>日志信息：</strong>保存不超过12个月
                  </li>
                </ul>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  账户注销后，我们会删除或匿名化您的个人信息，但法律另有规定的除外。
                </p>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  4.3 安全措施
                </h3>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  我们采用业界标准的安全措施保护您的个人信息：
                </p>
                <ul className='list-disc pl-6 text-gray-700 space-y-2 mb-4'>
                  <li>
                    <strong>数据加密：</strong>使用HTTPS加密传输，数据库加密存储
                  </li>
                  <li>
                    <strong>访问控制：</strong>严格的权限管理和身份验证
                  </li>
                  <li>
                    <strong>安全审计：</strong>定期进行安全评估和漏洞扫描
                  </li>
                  <li>
                    <strong>应急响应：</strong>建立数据泄露应急预案
                  </li>
                </ul>
              </section>

              {/* 5. 用户权利 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  5. 您的权利
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  根据相关法律法规，您拥有以下权利：
                </p>
                <ul className='list-disc pl-6 text-gray-700 space-y-2 mb-4'>
                  <li>
                    <strong>访问权：</strong>随时查看您的个人信息
                  </li>
                  <li>
                    <strong>更正权：</strong>发现信息有误时要求更正
                  </li>
                  <li>
                    <strong>删除权：</strong>要求删除您的个人信息
                  </li>
                  <li>
                    <strong>撤回同意：</strong>撤回您此前授予的授权
                  </li>
                  <li>
                    <strong>注销账户：</strong>随时注销您的账户
                  </li>
                  <li>
                    <strong>数据导出：</strong>要求导出您的个人数据
                  </li>
                </ul>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  如需行使上述权利，请通过以下联系方式与我们联系。
                </p>
              </section>

              {/* 6. 未成年人保护 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  6. 未成年人保护
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  我们的服务主要面向成年求职者。如果您是未满18周岁的未成年人，请在监护人的陪同下阅读本政策，并在监护人同意后使用我们的服务。
                </p>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  如果我们发现在未事先获得可证实的监护人同意的情况下收集了未成年人的个人信息，会设法尽快删除相关数据。
                </p>
              </section>

              {/* 7. 第三方服务 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  7. 第三方服务
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  我们的服务可能包含指向第三方网站的链接（如招聘平台、社交媒体等）。请注意，
                  <strong>我们不对第三方的隐私政策负责</strong>
                  。我们建议您在访问第三方网站时，仔细阅读其隐私政策。
                </p>
              </section>

              {/* 8. 政策更新 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  8. 本政策的更新
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  我们可能会根据业务调整或法律要求更新本隐私政策。更新后的政策将在本页面公布，并通过站内通知或邮件告知您。
                </p>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  <strong>对于重大变更</strong>
                  （如收集信息类型的改变、使用目的的变化等），我们会提前征得您的明确同意。
                </p>
              </section>

              {/* 9. 联系我们 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  9. 如何联系我们
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  如果您对本隐私政策有任何疑问、意见或建议，或需要行使您的权利，请通过以下方式联系我们：
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
                      href='https://blog.zhitoujianli.com/contact/'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:text-blue-700 underline ml-2'
                    >
                      在线联系我们
                    </a>
                  </p>
                </div>
                <p className='text-gray-700 leading-relaxed mt-4'>
                  我们将在<strong>15个工作日内</strong>回复您的请求。
                </p>
              </section>

              {/* 10. 适用法律 */}
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  10. 适用法律
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  本隐私政策的解释、执行和争议解决均适用中华人民共和国法律。如发生争议，双方应友好协商解决；协商不成的，任何一方可向本平台所在地人民法院提起诉讼。
                </p>
              </section>

              {/* 协议生效 */}
              <section className='mt-12 pt-8 border-t border-gray-200'>
                <p className='text-gray-600 text-sm'>
                  本隐私政策自发布之日起生效，并在您使用我们的服务时适用。
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
            <Link to='/terms' className='hover:text-blue-600 transition-colors'>
              用户协议
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

export default Privacy;
