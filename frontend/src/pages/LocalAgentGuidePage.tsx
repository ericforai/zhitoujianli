import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Container from '../components/common/Container';
import SEOHead from '../components/seo/SEOHead';

/**
 * 本地Agent使用指南页面
 *
 * 功能：
 * - 本地Agent介绍
 * - 安装步骤
 * - 使用方法
 * - 常见问题
 */
const LocalAgentGuidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'intro' | 'install' | 'usage' | 'faq'>('intro');

  const faqs = [
    {
      q: '电脑必须一直开着吗？',
      a: '只有在投递时需要开着。您可以设置特定时间段运行Agent，投递完成后可以关闭Agent。',
    },
    {
      q: '可以在多台电脑使用吗？',
      a: '可以，但同时只能有一个Agent在线。新的Agent连接会自动踢掉旧的。',
    },
    {
      q: '首次使用需要登录Boss直聘吗？',
      a: '是的。首次启动Agent时会自动打开浏览器，您需要在浏览器中完成Boss直聘扫码登录。登录成功后Cookie会被保存，后续使用无需再次登录。',
    },
    {
      q: 'Token过期了怎么办？',
      a: 'Token有效期24小时。过期后在网站「配置管理」→「本地投递」页面重新生成Token，然后用新Token重启Agent即可。',
    },
    {
      q: '投递时遇到验证码怎么办？',
      a: '使用有头模式（默认）时，验证码会显示在浏览器中，您可以手动完成。无头模式无法处理验证码，建议使用有头模式。',
    },
    {
      q: '这样安全吗？',
      a: '非常安全。Token只用于验证身份，不包含密码；所有通信都是加密的（WSS/HTTPS）；Boss直聘Cookie只存储在您本地电脑，服务器不存储您的登录信息。',
    },
    {
      q: '会不会被Boss直聘封号？',
      a: '风险极低。从Boss直聘角度看，就像您在正常使用浏览器。Agent使用您自己的IP和浏览器，并有模拟人类行为的功能。',
    },
    {
      q: '网络断了会怎样？',
      a: 'Agent会自动尝试重连，默认每5秒重试一次。网络恢复后会自动重新连接。',
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <SEOHead
        path='/guide/local-agent'
        breadcrumbs={[
          { name: '首页', url: 'https://zhitoujianli.com/' },
          { name: '用户指南', url: 'https://zhitoujianli.com/guide' },
          { name: '本地Agent指南', url: 'https://zhitoujianli.com/guide/local-agent' },
        ]}
      />
      <Navigation />

      {/* Hero Section */}
      <section className='pt-32 pb-16 bg-gradient-to-br from-green-50 to-teal-100'>
        <Container size='xl'>
          <div className='text-center'>
            <div className='inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4'>
              <span className='w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse'></span>
              全新功能
            </div>
            <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
              本地Agent投递指南
            </h1>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              使用您本地电脑的IP和浏览器进行投递，有效避免服务器端风控问题
            </p>
          </div>
        </Container>
      </section>

      {/* Important Notice */}
      <section className='py-8 bg-amber-50 border-b border-amber-200'>
        <Container size='xl'>
          <div className='max-w-4xl mx-auto'>
            <div className='flex items-start gap-4'>
              <div className='flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center'>
                <svg className='w-6 h-6 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                </svg>
              </div>
              <div>
                <h3 className='text-lg font-semibold text-amber-900 mb-2'>重要变化说明</h3>
                <p className='text-amber-800'>
                  本地Agent是一种<strong>全新的投递方式</strong>，与之前的服务器投递完全不同。
                  您需要在本地电脑运行一个小程序，使用您自己的IP进行投递，几乎不会被风控。
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Comparison Table */}
      <section className='py-12 bg-white'>
        <Container size='xl'>
          <div className='max-w-4xl mx-auto'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6 text-center'>新旧方式对比</h2>
            <div className='overflow-x-auto'>
              <table className='w-full border-collapse'>
                <thead>
                  <tr className='bg-gray-100'>
                    <th className='border border-gray-200 px-4 py-3 text-left font-semibold'>对比项</th>
                    <th className='border border-gray-200 px-4 py-3 text-left font-semibold text-gray-500'>旧方式（服务器投递）</th>
                    <th className='border border-gray-200 px-4 py-3 text-left font-semibold text-green-600'>新方式（本地Agent）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-200 px-4 py-3 font-medium'>投递执行位置</td>
                    <td className='border border-gray-200 px-4 py-3 text-gray-600'>云服务器</td>
                    <td className='border border-gray-200 px-4 py-3 text-green-600'>您的电脑</td>
                  </tr>
                  <tr className='bg-gray-50'>
                    <td className='border border-gray-200 px-4 py-3 font-medium'>IP地址</td>
                    <td className='border border-gray-200 px-4 py-3 text-gray-600'>云服务器IP（多人共用）</td>
                    <td className='border border-gray-200 px-4 py-3 text-green-600'>您的家庭/办公IP（独享）</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-200 px-4 py-3 font-medium'>浏览器指纹</td>
                    <td className='border border-gray-200 px-4 py-3 text-gray-600'>服务器统一</td>
                    <td className='border border-gray-200 px-4 py-3 text-green-600'>您本地Chrome的真实指纹</td>
                  </tr>
                  <tr className='bg-gray-50'>
                    <td className='border border-gray-200 px-4 py-3 font-medium'>风控风险</td>
                    <td className='border border-gray-200 px-4 py-3 text-red-600 font-medium'>高（频繁被封）</td>
                    <td className='border border-gray-200 px-4 py-3 text-green-600 font-medium'>极低（和正常用户一样）</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-200 px-4 py-3 font-medium'>是否需要开机</td>
                    <td className='border border-gray-200 px-4 py-3 text-gray-600'>否</td>
                    <td className='border border-gray-200 px-4 py-3 text-amber-600'>是（投递时需要）</td>
                  </tr>
                  <tr className='bg-gray-50'>
                    <td className='border border-gray-200 px-4 py-3 font-medium'>操作步骤</td>
                    <td className='border border-gray-200 px-4 py-3 text-gray-600'>网站一键操作</td>
                    <td className='border border-gray-200 px-4 py-3 text-amber-600'>需要先启动本地Agent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </section>

      {/* Tab Navigation */}
      <section className='py-8 bg-gray-100 sticky top-16 z-10'>
        <Container size='xl'>
          <div className='max-w-4xl mx-auto'>
            <nav className='flex space-x-1 bg-white rounded-lg p-1 shadow-sm'>
              {[
                { id: 'intro', label: '功能介绍', icon: '📖' },
                { id: 'install', label: '安装步骤', icon: '⚙️' },
                { id: 'usage', label: '使用方法', icon: '🚀' },
                { id: 'faq', label: '常见问题', icon: '❓' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className='mr-2'>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </Container>
      </section>

      {/* Content Sections */}
      <section className='py-12'>
        <Container size='xl'>
          <div className='max-w-4xl mx-auto'>
            {/* Intro Tab */}
            {activeTab === 'intro' && (
              <div className='space-y-8'>
                <div className='bg-white rounded-lg shadow-sm p-8'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4'>什么是本地Agent？</h2>
                  <p className='text-gray-700 mb-6'>
                    本地Agent是一个运行在您电脑上的Python程序，它的作用是：
                  </p>
                  <div className='grid md:grid-cols-3 gap-4'>
                    <div className='bg-blue-50 rounded-lg p-4'>
                      <div className='text-3xl mb-2'>🤖</div>
                      <h3 className='font-semibold text-gray-900 mb-1'>电脑上的&ldquo;机器人&rdquo;</h3>
                      <p className='text-sm text-gray-600'>自动操作浏览器执行投递</p>
                    </div>
                    <div className='bg-green-50 rounded-lg p-4'>
                      <div className='text-3xl mb-2'>🔗</div>
                      <h3 className='font-semibold text-gray-900 mb-1'>与服务器通信</h3>
                      <p className='text-sm text-gray-600'>实时接收投递任务指令</p>
                    </div>
                    <div className='bg-purple-50 rounded-lg p-4'>
                      <div className='text-3xl mb-2'>🏠</div>
                      <h3 className='font-semibold text-gray-900 mb-1'>使用本地资源</h3>
                      <p className='text-sm text-gray-600'>您的IP和浏览器指纹</p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-8'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4'>为什么需要本地Agent？</h2>
                  <div className='space-y-4'>
                    <div className='flex items-start gap-4 p-4 bg-red-50 rounded-lg'>
                      <div className='text-2xl'>⚠️</div>
                      <div>
                        <h3 className='font-semibold text-red-900'>问题：服务器投递频繁被风控</h3>
                        <p className='text-red-800 text-sm mt-1'>
                          Boss直聘会检测同一IP的大量请求、识别自动化浏览器特征。当多个用户共享云服务器IP时，很容易触发这些检测。
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-4 p-4 bg-green-50 rounded-lg'>
                      <div className='text-2xl'>✅</div>
                      <div>
                        <h3 className='font-semibold text-green-900'>解决：使用您自己的IP</h3>
                        <p className='text-green-800 text-sm mt-1'>
                          本地Agent让投递请求来自您的家庭或办公网络，IP分散、真实指纹、正常行为，从Boss直聘角度看就像您在正常浏览网站。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-8'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4'>工作流程</h2>
                  <div className='space-y-4'>
                    <div className='flex items-center gap-4'>
                      <div className='w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold'>1</div>
                      <div className='flex-1 bg-gray-50 rounded-lg p-4'>
                        <span className='font-medium'>启动本地Agent</span>
                        <span className='text-gray-500 ml-2'>→ 在您的电脑上运行程序</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-4'>
                      <div className='w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold'>2</div>
                      <div className='flex-1 bg-gray-50 rounded-lg p-4'>
                        <span className='font-medium'>Agent连接服务器</span>
                        <span className='text-gray-500 ml-2'>→ 建立WebSocket通信</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-4'>
                      <div className='w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold'>3</div>
                      <div className='flex-1 bg-gray-50 rounded-lg p-4'>
                        <span className='font-medium'>网站点击&ldquo;开始投递&rdquo;</span>
                        <span className='text-gray-500 ml-2'>→ 服务器下发任务到Agent</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-4'>
                      <div className='w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold'>4</div>
                      <div className='flex-1 bg-green-50 rounded-lg p-4'>
                        <span className='font-medium text-green-800'>Agent在本地浏览器执行投递</span>
                        <span className='text-green-600 ml-2'>→ 使用您的IP，安全可靠</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Install Tab */}
            {activeTab === 'install' && (
              <div className='space-y-8'>
                <div className='bg-white rounded-lg shadow-sm p-8'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4'>系统要求</h2>
                  <div className='grid md:grid-cols-2 gap-6'>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-3'>硬件要求</h3>
                      <ul className='space-y-2 text-gray-700'>
                        <li className='flex items-center gap-2'>
                          <span className='text-green-500'>✓</span> 内存：4GB以上（推荐8GB）
                        </li>
                        <li className='flex items-center gap-2'>
                          <span className='text-green-500'>✓</span> 硬盘：500MB可用空间
                        </li>
                        <li className='flex items-center gap-2'>
                          <span className='text-green-500'>✓</span> 网络：稳定的互联网连接
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-3'>软件要求</h3>
                      <ul className='space-y-2 text-gray-700'>
                        <li className='flex items-center gap-2'>
                          <span className='text-green-500'>✓</span> Windows 10/11 或 macOS 10.15+ 或 Linux
                        </li>
                        <li className='flex items-center gap-2'>
                          <span className='text-green-500'>✓</span> Python 3.8 或更高版本
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-8'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-6'>快速开始（5分钟）</h2>

                  <div className='space-y-6'>
                    {/* Step 1 */}
                    <div className='border-l-4 border-blue-500 pl-6'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        <span className='bg-blue-600 text-white px-2 py-1 rounded text-sm mr-2'>第1步</span>
                        获取Token
                      </h3>
                      <ol className='list-decimal list-inside text-gray-700 space-y-1 ml-4'>
                        <li>登录智投简历网站</li>
                        <li>进入「配置管理」→「本地投递」标签</li>
                        <li>点击「生成Token」按钮</li>
                        <li>复制显示的Token</li>
                      </ol>
                      <div className='mt-3'>
                        <Link
                          to='/config'
                          className='inline-flex items-center text-blue-600 hover:text-blue-700 font-medium'
                        >
                          前往配置页面 →
                        </Link>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className='border-l-4 border-blue-500 pl-6'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        <span className='bg-blue-600 text-white px-2 py-1 rounded text-sm mr-2'>第2步</span>
                        下载Agent程序
                      </h3>
                      <p className='text-gray-700 mb-3'>
                        从配置页面下载 <code className='bg-gray-100 px-2 py-1 rounded'>local-agent.zip</code>，解压到任意目录。
                      </p>
                      <a
                        href='/api/local-agent/download'
                        className='inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                      >
                        <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
                        </svg>
                        下载 local-agent.zip
                      </a>
                    </div>

                    {/* Step 3 */}
                    <div className='border-l-4 border-green-500 pl-6'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        <span className='bg-green-600 text-white px-2 py-1 rounded text-sm mr-2'>第3步</span>
                        终端运行
                      </h3>
                      <p className='text-gray-700 mb-4'>
                        打开终端，<strong>复制并粘贴以下命令</strong>运行即可。首次运行会自动安装依赖。
                      </p>

                      {/* 简化的运行方式 */}
                      <div className='bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4'>
                        <h4 className='font-medium text-green-900 mb-2'>Mac / Linux 用户</h4>
                        <pre className='bg-gray-900 text-green-400 p-3 rounded-lg text-sm overflow-x-auto'>
{`cd ~/Downloads/local-agent && pip3 install -r requirements.txt && python3 boss_local_agent.py --token 你的TOKEN`}
                        </pre>
                        <p className='text-green-700 text-sm mt-2'>
                          打开方式：按 <code className='bg-green-100 px-1 rounded'>⌘ + 空格</code>，搜索「终端」
                        </p>
                      </div>

                      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
                        <h4 className='font-medium text-blue-900 mb-2'>Windows 用户</h4>
                        <pre className='bg-gray-900 text-green-400 p-3 rounded-lg text-sm overflow-x-auto'>
{`cd %USERPROFILE%\\Downloads\\local-agent && pip install -r requirements.txt && python boss_local_agent.py --token 你的TOKEN`}
                        </pre>
                        <p className='text-blue-700 text-sm mt-2'>
                          打开方式：按 <code className='bg-blue-100 px-1 rounded'>Win + R</code>，输入 <code className='bg-blue-100 px-1 rounded'>cmd</code>，回车
                        </p>
                      </div>

                      <div className='bg-amber-50 p-4 rounded-lg mb-4'>
                        <p className='text-amber-800 text-sm'>
                          <strong>提示：</strong>将「你的TOKEN」替换为配置页面生成的Token。在配置页面点击「复制启动命令」可以直接复制包含Token的完整命令。
                        </p>
                      </div>

                      <div className='bg-green-50 p-4 rounded-lg'>
                        <p className='text-green-800'>
                          <strong>成功标志：</strong>看到「认证成功，已连接到服务器」说明启动成功！
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Usage Tab */}
            {activeTab === 'usage' && (
              <div className='space-y-8'>
                <div className='bg-white rounded-lg shadow-sm p-8'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4'>启动方式</h2>
                  <div className='space-y-6'>
                    <div className='bg-green-50 border-2 border-green-300 rounded-lg p-4'>
                      <h3 className='font-semibold text-green-900 mb-2'>终端命令启动（推荐）</h3>
                      <p className='text-green-800 text-sm mb-3'>
                        在配置页面生成Token后，点击「复制启动命令」，然后打开终端粘贴运行即可。
                      </p>
                      <pre className='bg-gray-900 text-green-400 p-3 rounded-lg text-sm overflow-x-auto'>
{`cd ~/Downloads/local-agent && pip3 install -r requirements.txt && python3 boss_local_agent.py --token YOUR_TOKEN`}
                      </pre>
                    </div>
                    <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                      <h3 className='font-semibold text-gray-900 mb-2'>高级：使用无头模式</h3>
                      <p className='text-gray-600 text-sm mb-3'>如需后台运行（不显示浏览器窗口），添加 --headless 参数：</p>
                      <pre className='bg-gray-900 text-green-400 p-3 rounded-lg text-sm overflow-x-auto'>
{`python3 boss_local_agent.py --token YOUR_TOKEN --headless`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-8'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4'>可选参数</h2>
                  <div className='overflow-x-auto'>
                    <table className='w-full border-collapse'>
                      <thead>
                        <tr className='bg-gray-100'>
                          <th className='border border-gray-200 px-4 py-3 text-left'>参数</th>
                          <th className='border border-gray-200 px-4 py-3 text-left'>说明</th>
                          <th className='border border-gray-200 px-4 py-3 text-left'>默认值</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className='bg-gray-50'>
                          <td className='border border-gray-200 px-4 py-3 font-mono text-sm'>--headless</td>
                          <td className='border border-gray-200 px-4 py-3'>无头模式（不显示浏览器）</td>
                          <td className='border border-gray-200 px-4 py-3 text-gray-500'>关闭</td>
                        </tr>
                        <tr>
                          <td className='border border-gray-200 px-4 py-3 font-mono text-sm'>--server URL</td>
                          <td className='border border-gray-200 px-4 py-3'>指定服务器地址</td>
                          <td className='border border-gray-200 px-4 py-3 text-gray-500 text-sm'>wss://zhitoujianli.com/ws/local-agent</td>
                        </tr>
                        <tr className='bg-gray-50'>
                          <td className='border border-gray-200 px-4 py-3 font-mono text-sm'>--log-level</td>
                          <td className='border border-gray-200 px-4 py-3'>日志级别（DEBUG/INFO/WARNING/ERROR）</td>
                          <td className='border border-gray-200 px-4 py-3 text-gray-500'>INFO</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-8'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4'>有头模式 vs 无头模式</h2>
                  <div className='grid md:grid-cols-2 gap-6'>
                    <div className='border-2 border-green-500 rounded-lg p-6'>
                      <div className='flex items-center gap-2 mb-3'>
                        <span className='text-2xl'>👀</span>
                        <h3 className='text-lg font-semibold text-green-700'>有头模式（推荐）</h3>
                      </div>
                      <ul className='space-y-2 text-gray-700'>
                        <li>✓ 显示浏览器窗口，可以看到操作</li>
                        <li>✓ 遇到验证码可以手动处理</li>
                        <li>✓ 首次登录方便扫码</li>
                        <li>○ 资源占用稍高</li>
                      </ul>
                      <div className='mt-4 bg-green-50 p-3 rounded'>
                        <p className='text-sm text-green-700'>双击启动，或命令行加 <code className='bg-green-100 px-1 rounded'>--headless</code></p>
                      </div>
                    </div>
                    <div className='border-2 border-gray-300 rounded-lg p-6'>
                      <div className='flex items-center gap-2 mb-3'>
                        <span className='text-2xl'>🔒</span>
                        <h3 className='text-lg font-semibold text-gray-700'>无头模式</h3>
                      </div>
                      <ul className='space-y-2 text-gray-700'>
                        <li>✓ 不显示浏览器，后台运行</li>
                        <li>✓ 资源占用较低</li>
                        <li>✗ 无法处理验证码</li>
                        <li>✗ 需要先用有头模式登录</li>
                      </ul>
                      <div className='mt-4 bg-gray-100 p-3 rounded'>
                        <p className='text-sm text-gray-700'>命令行启动时加 <code className='bg-gray-200 px-1 rounded'>--headless</code> 参数</p>
                      </div>
                    </div>
                  </div>
                  <div className='mt-6 bg-amber-50 p-4 rounded-lg'>
                    <p className='text-amber-800'>
                      <strong>建议：</strong>首次使用必须用有头模式完成Boss直聘登录，之后可以切换到无头模式长期运行。
                    </p>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-8'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4'>日常使用流程</h2>
                  <div className='space-y-4'>
                    <div className='flex items-start gap-4'>
                      <div className='w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0'>1</div>
                      <div>
                        <h4 className='font-semibold text-gray-900'>启动Agent</h4>
                        <p className='text-gray-600'>在终端运行启动命令，等待显示&ldquo;认证成功&rdquo;</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-4'>
                      <div className='w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0'>2</div>
                      <div>
                        <h4 className='font-semibold text-gray-900'>网站确认在线</h4>
                        <p className='text-gray-600'>在「配置管理」→「本地投递」查看Agent状态为&ldquo;在线&rdquo;</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-4'>
                      <div className='w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0'>3</div>
                      <div>
                        <h4 className='font-semibold text-gray-900'>开始投递</h4>
                        <p className='text-gray-600'>在Dashboard点击&ldquo;开始投递&rdquo;，任务会自动发送到您的Agent执行</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-4'>
                      <div className='w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold flex-shrink-0'>4</div>
                      <div>
                        <h4 className='font-semibold text-gray-900'>查看结果</h4>
                        <p className='text-gray-600'>在网站查看投递结果，Agent终端也会显示日志</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div className='space-y-4'>
                {faqs.map((faq, index) => (
                  <div key={index} className='bg-white rounded-lg shadow-sm p-6'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2 flex items-start'>
                      <span className='text-blue-600 mr-2'>Q:</span>
                      {faq.q}
                    </h3>
                    <p className='text-gray-700 ml-6'>
                      <span className='text-green-600 font-semibold mr-2'>A:</span>
                      {faq.a}
                    </p>
                  </div>
                ))}

                <div className='bg-blue-50 rounded-lg p-6 mt-8'>
                  <h3 className='text-lg font-semibold text-blue-900 mb-2'>还有其他问题？</h3>
                  <p className='text-blue-800 mb-4'>
                    查看完整文档或联系客服获取帮助
                  </p>
                  <div className='flex gap-4'>
                    <a
                      href='/downloads/local-agent-readme.md'
                      className='inline-flex items-center text-blue-600 hover:text-blue-700 font-medium'
                    >
                      查看完整文档 →
                    </a>
                    <Link
                      to='/help'
                      className='inline-flex items-center text-blue-600 hover:text-blue-700 font-medium'
                    >
                      联系客服 →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className='py-16 bg-gradient-to-r from-green-600 to-teal-600'>
        <Container size='xl'>
          <div className='text-center text-white'>
            <h2 className='text-3xl font-bold mb-4'>准备开始使用本地Agent了吗？</h2>
            <p className='text-xl mb-8 opacity-90'>
              前往配置页面生成Token，开始更安全的投递体验
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                to='/config'
                className='inline-block bg-white text-green-600 py-3 px-8 rounded-lg font-medium hover:bg-gray-100 transition-colors'
              >
                前往配置页面
              </Link>
              <a
                href='/downloads/local-agent.zip'
                className='inline-block bg-transparent border-2 border-white text-white py-3 px-8 rounded-lg font-medium hover:bg-white hover:text-green-600 transition-colors'
              >
                下载Agent程序
              </a>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default LocalAgentGuidePage;
