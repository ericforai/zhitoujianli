import React from 'react';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

/**
 * 用户协议页面
 * 展示智投简历的服务条款和用户协议
 */
const TermsPage: React.FC = () => {
  return (
    <div className='min-h-screen bg-white'>
      <Navigation />
      <main className='pt-16 pb-16'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* 页面标题 */}
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>
              智投简历服务条款
            </h1>
            <p className='text-gray-600'>最后更新时间: 2025年1月15日</p>
          </div>

          {/* 协议内容 */}
          <div className='prose prose-lg max-w-none'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8'>
              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  服务概述
                </h2>
                <p className='text-gray-700 leading-relaxed'>
                  智投简历（以下简称&ldquo;我们&rdquo;或&ldquo;智投简历&rdquo;）是一款基于人工智能技术的智能简历投递平台，旨在帮助求职者更高效、更精准地找到理想工作。
                </p>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  服务条款接受
                </h2>
                <p className='text-gray-700 leading-relaxed'>
                  通过访问或使用智投简历服务，您同意受本服务条款的约束。如果您不同意本服务条款的任何部分，则不得访问或使用我们的服务。
                </p>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  服务内容
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  智投简历提供以下核心服务：
                </p>
                <ul className='list-disc list-inside space-y-2 text-gray-700'>
                  <li>
                    <strong>AI智能匹配</strong>
                    ：基于人工智能算法分析职位要求与简历匹配度
                  </li>
                  <li>
                    <strong>简历优化</strong>：智能优化简历内容，提高通过率
                  </li>
                  <li>
                    <strong>精准投递</strong>：一键批量投递，实时跟踪投递状态
                  </li>
                  <li>
                    <strong>数据分析</strong>：提供投递成功率统计和行业趋势分析
                  </li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  用户责任
                </h2>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  账户注册
                </h3>
                <ul className='list-disc list-inside space-y-2 text-gray-700 mb-6'>
                  <li>您必须年满18周岁才能使用我们的服务</li>
                  <li>您需要提供真实、准确、完整的信息进行注册</li>
                  <li>您有责任维护账户信息的安全性和准确性</li>
                </ul>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  使用规范
                </h3>
                <ul className='list-disc list-inside space-y-2 text-gray-700 mb-6'>
                  <li>不得使用服务进行任何违法或有害活动</li>
                  <li>不得上传虚假、误导性或不当的简历内容</li>
                  <li>不得恶意攻击、破坏或干扰服务正常运行</li>
                  <li>不得侵犯他人知识产权或其他合法权益</li>
                </ul>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  简历内容
                </h3>
                <ul className='list-disc list-inside space-y-2 text-gray-700'>
                  <li>您上传的简历内容必须真实、准确</li>
                  <li>不得包含虚假信息或误导性内容</li>
                  <li>您对上传的简历内容承担全部责任</li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  隐私保护
                </h2>
                <p className='text-gray-700 leading-relaxed'>
                  我们重视您的隐私保护，详细内容请参阅我们的
                  <a
                    href='/privacy'
                    className='text-blue-600 hover:text-blue-700 hover:underline ml-1'
                  >
                    隐私政策
                  </a>
                  。
                </p>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  服务费用
                </h2>
                <ul className='list-disc list-inside space-y-2 text-gray-700'>
                  <li>基础功能免费使用</li>
                  <li>高级功能可能需要付费订阅</li>
                  <li>具体收费标准请查看价格页面</li>
                  <li>我们保留调整价格的权利，调整前会提前通知</li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  服务可用性
                </h2>
                <ul className='list-disc list-inside space-y-2 text-gray-700'>
                  <li>我们努力确保服务的稳定运行，但不保证服务不会中断</li>
                  <li>我们可能因维护、升级等原因暂停服务</li>
                  <li>我们不对因服务中断造成的损失承担责任</li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  知识产权
                </h2>
                <ul className='list-disc list-inside space-y-2 text-gray-700'>
                  <li>智投简历的所有内容、功能和技术均受知识产权法保护</li>
                  <li>您不得复制、修改、分发或商业化使用我们的服务内容</li>
                  <li>您保留对上传简历内容的所有权</li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  免责声明
                </h2>
                <ul className='list-disc list-inside space-y-2 text-gray-700'>
                  <li>我们不对求职结果做出任何保证</li>
                  <li>我们不对因使用服务而造成的任何损失承担责任</li>
                  <li>我们不对第三方网站的内容或服务承担责任</li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  服务变更和终止
                </h2>
                <ul className='list-disc list-inside space-y-2 text-gray-700'>
                  <li>我们保留随时修改、暂停或终止服务的权利</li>
                  <li>我们可能因违反服务条款而终止您的账户</li>
                  <li>服务终止后，您的数据将被删除或匿名化处理</li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  争议解决
                </h2>
                <p className='text-gray-700 leading-relaxed'>
                  如发生争议，双方应首先通过友好协商解决。协商不成的，可向有管辖权的人民法院提起诉讼。
                </p>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  适用法律
                </h2>
                <p className='text-gray-700 leading-relaxed'>
                  本服务条款受中华人民共和国法律管辖。
                </p>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  条款修改
                </h2>
                <p className='text-gray-700 leading-relaxed'>
                  我们保留随时修改本服务条款的权利。修改后的条款将在网站上公布，继续使用服务即表示您接受修改后的条款。
                </p>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  联系我们
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  如果您对本服务条款有任何疑问，请通过以下方式联系我们：
                </p>
                <ul className='list-disc list-inside space-y-2 text-gray-700'>
                  <li>邮箱：zhitoujianli@qq.com</li>
                  <li>电话：15317270756</li>
                  <li>微信：zhitoujianlikefu</li>
                  <li>官网：https://zhitoujianli.com</li>
                </ul>
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

export default TermsPage;
