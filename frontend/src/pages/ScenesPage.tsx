import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SEOHead from '../components/seo/SEOHead';
import Container from '../components/common/Container';

/**
 * 场景页面
 * 根据用户类型展示对应的求职场景和推荐套餐
 */
const ScenesPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeScene, setActiveScene] = useState<'graduate' | 'job-seeker' | 'urgent'>('graduate');

  const scenes = [
    {
      id: 'graduate' as const,
      name: '应届生',
      icon: '🎓',
      title: '校招季，找到第一份工作',
      description: '刚毕业或即将毕业，正在寻找第一份正式工作',
      painPoints: [
        '没有工作经验，简历不知道怎么写',
        '海投简历却石沉大海',
        '不知道哪些公司在招聘',
        '投递效率低，一天只能投几家',
      ],
      recommendedPlan: {
        name: '求职入门版（免费）',
        price: '免费永久使用',
        features: [
          '简历基础优化 1次',
          '每日投递 5次',
          '基础岗位匹配',
        ],
        upgradeOption: '需要更多机会？可升级到高效求职版（每日30次投递）',
      },
      cta: () => navigate('/register'),
      ctaText: '立即开始',
    },
    {
      id: 'job-seeker' as const,
      name: '在职求职者',
      icon: '💼',
      title: '在职找机会，稳中求进',
      description: '有工作经验，想找更好的机会或准备跳槽',
      painPoints: [
        '白天上班，没时间投简历',
        '需要谨慎投递，避免被现公司发现',
        '想找匹配度高的岗位，不想海投',
        '需要数据分析优化投递策略',
      ],
      recommendedPlan: {
        name: '高效求职版',
        price: '¥49/月',
        features: [
          '简历基础优化 不限次',
          '简历高级优化 1次',
          '每日投递 30次',
          '详细数据分析',
        ],
        upgradeOption: '需要更快找到工作？可升级到极速上岸版（每日100次投递）',
      },
      cta: () => navigate('/pricing'),
      ctaText: '查看定价',
    },
    {
      id: 'urgent' as const,
      name: '急找工作者',
      icon: '⚡',
      title: '快速上岸，恢复收入',
      description: '自由职业者或过渡期，急需快速找到工作',
      painPoints: [
        '时间紧迫，需要快速找到工作',
        '需要大量投递，提高成功率',
        '没有收入来源，经济压力大',
        '需要专业支持和数据分析',
      ],
      recommendedPlan: {
        name: '极速上岸版',
        price: '¥99/月',
        features: [
          '简历基础优化 不限次',
          '简历高级优化 3次',
          '每日投递 100次',
          '优先客服支持',
        ],
        upgradeOption: '最高性价比，快速找到工作',
      },
      cta: () => navigate('/pricing'),
      ctaText: '立即升级',
    },
  ];

  const currentScene = scenes.find((s) => s.id === activeScene) || scenes[0];

  return (
    <div className='min-h-screen bg-white'>
      <SEOHead
        path='/scenes'
        breadcrumbs={[
          { name: '首页', url: 'https://zhitoujianli.com/' },
          { name: '场景选择', url: 'https://zhitoujianli.com/scenes' },
        ]}
      />
      <Navigation />

      <Container size='xl' paddingY>
        <div className='mt-20 md:mt-16'>
          {/* 页面标题 */}
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>
              找到最适合您的方案
            </h1>
            <p className='text-xl text-gray-600'>
              根据您的求职阶段，我们为您推荐最合适的套餐
            </p>
          </div>

          {/* 场景选择标签 */}
          <div className='flex justify-center mb-12'>
            <div className='inline-flex bg-gray-100 rounded-lg p-1'>
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => setActiveScene(scene.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeScene === scene.id
                      ? 'bg-white text-blue-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className='text-2xl mr-2'>{scene.icon}</span>
                  {scene.name}
                </button>
              ))}
            </div>
          </div>

          {/* 场景内容 */}
          <div className='max-w-4xl mx-auto'>
            <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 shadow-lg'>
              {/* 场景标题 */}
              <div className='text-center mb-8'>
                <div className='text-6xl mb-4'>{currentScene.icon}</div>
                <h2 className='text-3xl font-bold text-gray-900 mb-3'>
                  {currentScene.title}
                </h2>
                <p className='text-lg text-gray-600'>
                  {currentScene.description}
                </p>
              </div>

              {/* 痛点列表 */}
              <div className='mb-10'>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                  您是否遇到这些问题？
                </h3>
                <ul className='space-y-3'>
                  {currentScene.painPoints.map((pain, index) => (
                    <li key={index} className='flex items-start'>
                      <svg
                        className='w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                          clipRule='evenodd'
                        />
                      </svg>
                      <span className='text-gray-700'>{pain}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 推荐套餐 */}
              <div className='bg-white rounded-xl p-8 shadow-md'>
                <div className='text-center mb-6'>
                  <span className='inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-4'>
                    为您推荐
                  </span>
                  <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                    {currentScene.recommendedPlan.name}
                  </h3>
                  <p className='text-3xl font-bold text-blue-600'>
                    {currentScene.recommendedPlan.price}
                  </p>
                </div>

                {/* 功能列表 */}
                <ul className='space-y-3 mb-8'>
                  {currentScene.recommendedPlan.features.map((feature, index) => (
                    <li key={index} className='flex items-center'>
                      <svg
                        className='w-5 h-5 text-green-500 mr-3'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                          clipRule='evenodd'
                        />
                      </svg>
                      <span className='text-gray-700 font-medium'>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* 升级选项 */}
                {currentScene.recommendedPlan.upgradeOption && (
                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
                    <p className='text-sm text-blue-800'>
                      💡 {currentScene.recommendedPlan.upgradeOption}
                    </p>
                  </div>
                )}

                {/* CTA按钮 */}
                <button
                  onClick={currentScene.cta}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105'
                >
                  {currentScene.ctaText}
                </button>
              </div>
            </div>
          </div>

          {/* 对比表格 */}
          <div className='mt-16 max-w-6xl mx-auto'>
            <h2 className='text-2xl font-bold text-gray-900 text-center mb-8'>
              完整功能对比
            </h2>
            <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>
                      功能
                    </th>
                    <th className='px-6 py-4 text-center text-sm font-semibold text-gray-900'>
                      求职入门版
                    </th>
                    <th className='px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50'>
                      高效求职版
                    </th>
                    <th className='px-6 py-4 text-center text-sm font-semibold text-gray-900'>
                      极速上岸版
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  <tr>
                    <td className='px-6 py-4 text-sm text-gray-900'>简历基础优化</td>
                    <td className='px-6 py-4 text-center text-sm text-gray-600'>1次</td>
                    <td className='px-6 py-4 text-center text-sm text-blue-600 bg-blue-50 font-semibold'>
                      不限次
                    </td>
                    <td className='px-6 py-4 text-center text-sm text-green-600 font-semibold'>
                      不限次
                    </td>
                  </tr>
                  <tr>
                    <td className='px-6 py-4 text-sm text-gray-900'>简历高级优化</td>
                    <td className='px-6 py-4 text-center text-sm text-gray-400'>-</td>
                    <td className='px-6 py-4 text-center text-sm text-blue-600 bg-blue-50 font-semibold'>
                      1次
                    </td>
                    <td className='px-6 py-4 text-center text-sm text-green-600 font-semibold'>
                      3次
                    </td>
                  </tr>
                  <tr>
                    <td className='px-6 py-4 text-sm text-gray-900'>每日投递次数</td>
                    <td className='px-6 py-4 text-center text-sm text-gray-600'>5次</td>
                    <td className='px-6 py-4 text-center text-sm text-blue-600 bg-blue-50 font-semibold'>
                      30次
                    </td>
                    <td className='px-6 py-4 text-center text-sm text-green-600 font-semibold'>
                      100次
                    </td>
                  </tr>
                  <tr>
                    <td className='px-6 py-4 text-sm text-gray-900'>岗位匹配</td>
                    <td className='px-6 py-4 text-center text-sm text-gray-600'>✓</td>
                    <td className='px-6 py-4 text-center text-sm text-blue-600 bg-blue-50'>✓</td>
                    <td className='px-6 py-4 text-center text-sm text-green-600'>✓</td>
                  </tr>
                  <tr>
                    <td className='px-6 py-4 text-sm text-gray-900'>打招呼语生成</td>
                    <td className='px-6 py-4 text-center text-sm text-gray-600'>✓</td>
                    <td className='px-6 py-4 text-center text-sm text-blue-600 bg-blue-50'>✓</td>
                    <td className='px-6 py-4 text-center text-sm text-green-600'>✓</td>
                  </tr>
                  <tr>
                    <td className='px-6 py-4 text-sm text-gray-900'>数据分析</td>
                    <td className='px-6 py-4 text-center text-sm text-gray-600'>基础</td>
                    <td className='px-6 py-4 text-center text-sm text-blue-600 bg-blue-50'>详细</td>
                    <td className='px-6 py-4 text-center text-sm text-green-600'>深度</td>
                  </tr>
                  <tr>
                    <td className='px-6 py-4 text-sm text-gray-900'>客服支持</td>
                    <td className='px-6 py-4 text-center text-sm text-gray-600'>社区</td>
                    <td className='px-6 py-4 text-center text-sm text-blue-600 bg-blue-50'>邮件</td>
                    <td className='px-6 py-4 text-center text-sm text-green-600'>优先</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA区域 */}
          <div className='mt-16 text-center'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              准备好开始了吗？
            </h2>
            <p className='text-lg text-gray-600 mb-8'>
              选择适合您的套餐，立即开始智能求职之旅
            </p>
            <div className='flex justify-center space-x-4'>
              <button
                onClick={() => navigate('/register')}
                className='px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
              >
                免费开始
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className='px-8 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium'
              >
                查看完整定价
              </button>
            </div>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  );
};

export default ScenesPage;

